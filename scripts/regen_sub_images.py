#!/usr/bin/env python3
"""Regenerate all subsection images from image-prompts.json using Higgsfield GPT Image 2."""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/private/tmp/kcg-portfolio-build")
HF = str(Path.home() / ".hermes/node/bin/higgsfield")
PROMPTS = ROOT / "image-prompts.json"
TMP = Path("/tmp/kcg-sub-img-gen")
TMP.mkdir(parents=True, exist_ok=True)
MAX_CONCURRENT = 5
LOCK = threading.Lock()
PROGRESS = TMP / "progress.json"


def clean_env() -> dict:
    env = {k: v for k, v in os.environ.items() if k != "PYTHONPATH"}
    return env


def run(cmd: list[str], timeout: int = 120) -> str:
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, env=clean_env())
    out = (p.stdout or "") + (p.stderr or "")
    if p.returncode != 0:
        raise RuntimeError(out[-3000:] or f"exit {p.returncode}")
    return out


def parse_json(raw: str):
    m = re.search(r"(\[.*\]|\{.*\})", raw, re.S)
    if not m:
        raise ValueError(f"No JSON in: {raw[:500]}")
    return json.loads(m.group(1))


def submit(prompt: str, ratio: str) -> str:
    raw = run([
        HF, "generate", "create", "gpt_image_2",
        "--prompt", prompt, "--aspect_ratio", ratio,
        "--quality", "high", "--resolution", "2k", "--json",
    ], timeout=90)
    data = parse_json(raw)
    if isinstance(data, list):
        data = data[0]
    if isinstance(data, str):
        return data
    if isinstance(data, dict) and data.get("id"):
        return data["id"]
    raise ValueError(repr(data))


def wait_job(job_id: str) -> dict:
    raw = run([
        HF, "generate", "wait", job_id,
        "--timeout", "5m", "--interval", "5s", "--json",
    ], timeout=360)
    data = parse_json(raw)
    if isinstance(data, list):
        data = data[0]
    return data


def get_job(job_id: str) -> dict:
    raw = run([HF, "generate", "get", job_id, "--json"], timeout=30)
    data = parse_json(raw)
    if isinstance(data, list):
        data = data[0]
    return data


def save_jpeg(url: str, dest: Path) -> None:
    from PIL import Image

    dest.parent.mkdir(parents=True, exist_ok=True)
    raw_path = TMP / f"{dest.stem}-{threading.get_ident()}.png"
    run(["curl", "-sL", url, "-o", str(raw_path)], timeout=120)
    im = Image.open(raw_path).convert("RGB")
    w, h = im.size
    max_dim = 800
    if max(w, h) > max_dim:
        if w >= h:
            im = im.resize((max_dim, int(h * max_dim / w)), Image.Resampling.LANCZOS)
        else:
            im = im.resize((int(w * max_dim / h), max_dim), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=80, optimize=True)
    print(f"  saved {dest.relative_to(ROOT)} {im.size[0]}x{im.size[1]} ({dest.stat().st_size}b)", flush=True)


def load_done() -> set[str]:
    if PROGRESS.exists():
        try:
            return set(json.loads(PROGRESS.read_text()).get("done", []))
        except Exception:
            return set()
    return set()


def mark_done(slug: str, done: set[str]) -> None:
    done.add(slug)
    with LOCK:
        PROGRESS.write_text(json.dumps({"done": sorted(done), "updated": time.time()}, indent=2))


def process_one(entry: dict, done: set[str], skip_existing: bool) -> tuple[str, str | None]:
    slug = entry["slug"]
    dest = ROOT / entry["path"]
    if skip_existing and slug in done and dest.exists():
        print(f"SKIP {slug}", flush=True)
        return slug, None

    for attempt in range(1, 10):
        try:
            with LOCK:
                time.sleep(0.4)
            print(f"SUBMIT {slug} (attempt {attempt})...", flush=True)
            jid = submit(entry["prompt"], entry.get("aspect_ratio", "1:1"))
            print(f"  id={jid}", flush=True)
            data = wait_job(jid)
            status = data.get("status")
            url = data.get("result_url")
            if status != "completed" or not url:
                data = get_job(jid)
                status = data.get("status")
                url = data.get("result_url")
            if status != "completed" or not url:
                raise RuntimeError(f"status={status} data={str(data)[:300]}")
            save_jpeg(url, dest)
            mark_done(slug, done)
            return slug, None
        except Exception as e:
            msg = str(e)
            rate = "rate_limit" in msg or "concurrent_jobs_limit" in msg
            print(f"  ERR {slug}: {msg[:240]}", flush=True)
            if rate:
                wait_s = min(90, 15 * attempt)
                print(f"  rate limited, sleep {wait_s}s", flush=True)
                time.sleep(wait_s)
                continue
            if attempt < 9:
                time.sleep(min(60, 8 * attempt))
                continue
            return slug, msg[:500]
    return slug, "exhausted retries"


def main() -> int:
    skip_existing = "--skip-existing" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    entries = json.loads(PROMPTS.read_text())
    if args:
        entries = [e for e in entries if e["slug"] in args or e["path"] in args]

    done = load_done()
    print(f"Processing {len(entries)} images (max concurrent={MAX_CONCURRENT}, already done={len(done)})...", flush=True)
    fails: list[str] = []

    with ThreadPoolExecutor(max_workers=MAX_CONCURRENT) as ex:
        futs = [ex.submit(process_one, e, done, skip_existing) for e in entries]
        for fut in as_completed(futs):
            name, err = fut.result()
            if err:
                print(f"FAIL {name}: {err}", flush=True)
                fails.append(name)
            else:
                print(f"OK {name}", flush=True)

    print(f"\nDone. fails={fails}", flush=True)
    (TMP / "result.json").write_text(json.dumps({"fails": fails, "done": sorted(done)}, indent=2))
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
