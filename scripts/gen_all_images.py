#!/usr/bin/env python3
"""Generate all KCG images with a concurrent job pool (max 7) and retries."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import threading
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path("/private/tmp/kcg-portfolio-build")
HF = str(Path.home() / ".hermes/node/bin/higgsfield")
TMP = Path("/tmp/kcg-img-gen")
TMP.mkdir(parents=True, exist_ok=True)
MAX_CONCURRENT = 5
LOCK = threading.Lock()

CAM = (
    "shot on Canon EOS R5 with 50mm lens, natural lighting, photorealistic product photography, "
    "actual photograph not a render, no text, no labels, no screens with text, no UI elements, "
    "shallow depth of field, realistic shadows, no glow effects, matte finishes, professional studio lighting"
)

JOBS: list[tuple[str, str, str]] = [
    ("public/images/statement-analysis.jpg", "16:9",
     f"Photorealistic close-up of a printed merchant processing statement on a dark wooden desk, with a pen pointing at a line item, dramatic side lighting, shallow depth of field, no text visible, just the abstract look of a paper document being reviewed. Dark moody professional photography. {CAM}"),
    ("public/images/pos-zero-fees.jpg", "4:3",
     f"Photorealistic product photography of a modern black POS terminal on a dark stone countertop, matte finish, no screen text visible, shot from a 45-degree angle, soft directional lighting from the left, shallow depth of field. Professional commercial product shot, not a render. {CAM}"),
    ("public/images/billing-statement.jpg", "4:3",
     f"Photorealistic product photography of a stack of printed invoices/receipts on a dark slate surface, warm desk lamp lighting from the right, no readable text, just the texture and shape of professional billing documents. Commercial photography style. {CAM}"),
    ("public/images/analytics-dashboard.jpg", "16:9",
     f"Photorealistic product photography of a modern laptop on a dark desk showing an abstract dark-colored screen with teal accent colors glowing softly, no readable text, just the ambient glow of a screen in a dark office environment. Shot from behind and slightly to the side, shallow depth of field. {CAM}"),
    ("public/images/ai-chat.jpg", "4:3",
     f"Photorealistic product photography of a smartphone on a dark desk, screen glowing softly with teal and dark tones, no readable text, ambient screen glow illuminating the desk surface. Professional commercial photography, shallow depth of field, natural shadows. {CAM}"),
    ("public/images/bluetooth-reader.jpg", "1:1",
     f"Photorealistic product photography of a small white credit card reader device on a dark charcoal surface, matte white plastic, shot from above at a slight angle, soft studio lighting, no text or labels. Clean minimalist commercial product shot. {CAM}"),
    ("public/images/pos-kitchen.jpg", "4:3",
     f"Photorealistic product photography of a modern restaurant POS terminal on a dark countertop, matte black finish, no screen text visible, shot from a 45-degree angle, warm ambient restaurant lighting in the background blurred out. Professional commercial photography. {CAM}"),
    ("public/images/atm-machine.jpg", "4:3",
     f"Photorealistic product photography of a modern ATM machine in a clean dark environment, brushed metal and black plastic surfaces, shot from a slight angle, professional studio lighting, no screen text visible. Commercial photography style. {CAM}"),
    ("public/images/cafe-success.jpg", "16:9",
     f"Photorealistic photograph of a cozy restaurant interior at night, warm lighting, blurred background, empty table with a POS terminal, professional editorial photography style, dark moody atmosphere, no people, no text. {CAM}"),
    ("public/images/services/web-design.jpg", "4:3",
     f"Photorealistic product photography of a modern dark monitor on a desk displaying a well-designed website as soft abstract shapes and teal accent colors, no readable text, ambient screen glow, dark charcoal office environment. {CAM}"),
    ("public/images/services/crm.jpg", "4:3",
     f"Photorealistic product photography of a laptop on a dark desk with a CRM-like dark theme screen glow and soft teal accent colors, no readable text, no UI elements, professional commercial photography. {CAM}"),
    ("public/images/services/automations.jpg", "4:3",
     f"Photorealistic abstract still life of interconnected matte black and brushed aluminum hardware nodes on a dark charcoal surface with thin teal fiber optic light paths between them, no text, professional commercial photography, shallow depth of field. {CAM}"),
    ("public/images/services/consulting.jpg", "4:3",
     f"Photorealistic professional desk scene with printed documents, a matte black calculator, and a fountain pen on dark wood, dark moody lighting from the left, no readable text, commercial photography. {CAM}"),
    ("public/images/services/prep-to-sell.jpg", "4:3",
     f"Photorealistic abstract representation of business growth: ascending stack of dark matte blocks with a soft teal light line rising upward on a charcoal background, no text, no charts with numbers, professional studio photography. {CAM}"),
    ("public/images/services/seo.jpg", "4:3",
     f"Photorealistic product photography of a smartphone on a dark surface showing soft search-results-like glow in teal and white shapes, no readable text, dark environment, shallow depth of field. {CAM}"),
    ("public/images/services/google-business.jpg", "4:3",
     f"Photorealistic product photography of a smartphone on a dark desk showing a soft abstract map glow with teal pin-like light, no readable text, dark environment, commercial photography. {CAM}"),
    ("public/images/services/bpo.jpg", "4:3",
     f"Photorealistic product photography of a professional headset resting on a dark desk next to a notebook, dark professional office environment, soft directional lighting, no people, no text. {CAM}"),
    ("public/images/services/consumer-financing.jpg", "4:3",
     f"Photorealistic product photography of a matte black credit card on a dark slate surface, brushed metal accents, soft studio lighting from the left, shallow depth of field, no text or logos visible. {CAM}"),
    ("public/images/services/business-loans.jpg", "4:3",
     f"Photorealistic product photography of stacked US currency bills and a matte black calculator on a dark wooden desk, warm desk lamp lighting, no readable text, commercial photography style. {CAM}"),
    ("public/images/services/pos-placement.jpg", "4:3",
     f"Photorealistic product photography of a modern black POS terminal hardware on a dark stone countertop, matte black plastic, no screen text visible, shot from 45 degrees, soft directional lighting. {CAM}"),
    ("public/images/industries/restaurants.jpg", "16:9",
     f"Photorealistic photograph of an empty cozy restaurant interior at night, warm ambient lighting, dark wooden tables, soft bokeh, no people, no text, professional editorial photography, dark moody atmosphere. {CAM}"),
    ("public/images/industries/grocery.jpg", "16:9",
     f"Photorealistic photograph of a grocery store aisle at night after closing, dark moody lighting, shelves softly lit, no people, no readable text or labels, professional commercial photography. {CAM}"),
    ("public/images/industries/healthcare.jpg", "16:9",
     f"Photorealistic photograph of a clean modern medical reception area, soft cool lighting, empty waiting chairs, dark charcoal and teal accents, no people, no text, professional architectural photography. {CAM}"),
    ("public/images/industries/ecommerce.jpg", "16:9",
     f"Photorealistic product photography of e-commerce shipping boxes and kraft packaging on a dark charcoal surface, soft studio lighting from the left, no text or logos, commercial photography. {CAM}"),
    ("public/images/industries/salons.jpg", "16:9",
     f"Photorealistic photograph of an empty upscale salon interior, warm lighting, styling chairs and mirrors softly blurred, no people, no text, dark moody professional photography. {CAM}"),
    ("public/images/industries/auto-repair.jpg", "16:9",
     f"Photorealistic photograph of an auto repair shop bay interior, dark moody lighting, tools and lift soft in background, no people, no text, professional editorial photography. {CAM}"),
    ("public/images/industries/gas-stations.jpg", "16:9",
     f"Photorealistic photograph of a gas station at night, dark atmospheric lighting, wet pavement reflections, soft neon and canopy lights, no people, no readable text or prices, cinematic photography. {CAM}"),
    ("public/images/industries/high-risk.jpg", "16:9",
     f"Photorealistic abstract commercial photograph representing security and stability: matte black vault-like door and brushed steel lock mechanism on dark charcoal background, soft directional lighting, no text, studio photography. {CAM}"),
    ("public/images/industries/nonprofits.jpg", "16:9",
     f"Photorealistic photograph of an empty community gathering space with warm soft lighting, wooden chairs in a circle, dark moody atmosphere, no people, no text, professional editorial photography. {CAM}"),
    ("public/images/industries/b2b.jpg", "16:9",
     f"Photorealistic photograph of a modern empty office conference room at dusk, dark moody lighting through glass windows, clean desk surface, no people, no text, architectural photography. {CAM}"),
    ("public/images/industries/real-estate.jpg", "16:9",
     f"Photorealistic photograph of a modern house exterior at dusk, warm interior lights glowing through windows, professional real estate photography, dark sky, no people, no text or signs. {CAM}"),
    ("public/images/industries/retail.jpg", "16:9",
     f"Photorealistic photograph of an empty retail store interior after hours, dark moody lighting, clothing racks softly lit, no people, no readable text or price tags, professional commercial photography. {CAM}"),
]


def run(cmd: list[str], timeout: int = 120) -> str:
    import os
    env = {k: v for k, v in os.environ.items() if k != "PYTHONPATH"}
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, env=env)
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
    ], timeout=60)
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
    # curl avoids Python SSL cert issues on this machine
    run(["curl", "-sL", url, "-o", str(raw_path)], timeout=120)
    im = Image.open(raw_path).convert("RGB")
    w, h = im.size
    if w > 1200:
        im = im.resize((1200, int(h * 1200 / w)), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=85, optimize=True)
    print(f"  saved {dest.relative_to(ROOT)} {im.size[0]}x{im.size[1]}", flush=True)


def is_fresh(path: Path, min_age_minutes: float = 0) -> bool:
    """Skip if file exists and was modified after script start marker, unless forced."""
    return False  # always regenerate unless --skip-existing


def process_one(rel: str, ratio: str, prompt: str, skip_existing: bool) -> tuple[str, str | None]:
    name = Path(rel).stem
    dest = ROOT / rel
    if skip_existing and dest.exists() and dest.stat().st_mtime > time.time() - 7200:
        print(f"SKIP {name} (fresh)", flush=True)
        return name, None

    for attempt in range(1, 10):
        try:
            with LOCK:
                time.sleep(0.5)
            print(f"SUBMIT {name} (attempt {attempt})...", flush=True)
            jid = submit(prompt, ratio)
            print(f"  id={jid}", flush=True)
            data = wait_job(jid)
            status = data.get("status")
            url = data.get("result_url")
            if status != "completed" or not url:
                data = get_job(jid)
                status = data.get("status")
                url = data.get("result_url")
            if status != "completed" or not url:
                raise RuntimeError(f"status={status}")
            save_jpeg(url, dest)
            return name, None
        except Exception as e:
            msg = str(e)
            rate = "rate_limit" in msg or "concurrent_jobs_limit" in msg
            print(f"  ERR {name}: {msg[:240]}", flush=True)
            if rate:
                wait_s = min(90, 15 * attempt)
                print(f"  rate limited, sleep {wait_s}s", flush=True)
                time.sleep(wait_s)
                continue
            if attempt < 9:
                time.sleep(min(60, 8 * attempt))
                continue
            return name, msg[:500]
    return name, "exhausted retries"


def main() -> int:
    skip_existing = "--skip-existing" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    selected = []
    for rel, ratio, prompt in JOBS:
        name = Path(rel).stem
        if args and name not in args and rel not in args:
            continue
        selected.append((rel, ratio, prompt))

    print(f"Processing {len(selected)} images (max concurrent={MAX_CONCURRENT})...", flush=True)
    fails: list[str] = []

    with ThreadPoolExecutor(max_workers=MAX_CONCURRENT) as ex:
        futs = [
            ex.submit(process_one, rel, ratio, prompt, skip_existing)
            for rel, ratio, prompt in selected
        ]
        for fut in as_completed(futs):
            name, err = fut.result()
            if err:
                print(f"FAIL {name}: {err}", flush=True)
                fails.append(name)
            else:
                print(f"OK {name}", flush=True)

    print(f"\nDone. fails={fails}", flush=True)
    (TMP / "result.json").write_text(json.dumps({"fails": fails}, indent=2))
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
