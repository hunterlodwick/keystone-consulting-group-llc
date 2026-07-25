#!/usr/bin/env bash
# Generate a single Higgsfield image, download, and optimize to JPEG.
# Usage: generate-one.sh <output_path> <aspect_ratio> "<prompt>"
set -euo pipefail

OUT="$1"
RATIO="$2"
PROMPT="$3"
HF="$HOME/.hermes/node/bin/higgsfield"
TMP_DIR="/tmp/kcg-img-gen"
mkdir -p "$TMP_DIR" "$(dirname "$OUT")"

NAME="$(basename "$OUT" .jpg)"
LOG="$TMP_DIR/${NAME}.log"
RAW="$TMP_DIR/${NAME}.png"

echo "[$(date +%H:%M:%S)] START $NAME ($RATIO)" | tee "$LOG"

JSON=$("$HF" generate create gpt_image_2 \
  --prompt "$PROMPT" \
  --aspect_ratio "$RATIO" \
  --quality high \
  --resolution 2k \
  --wait --wait-timeout 5m \
  --json 2>&1) || {
  echo "[$(date +%H:%M:%S)] FAIL $NAME generate" | tee -a "$LOG"
  echo "$JSON" | tee -a "$LOG"
  exit 1
}

echo "$JSON" > "$TMP_DIR/${NAME}.json"

URL=$(/usr/bin/env -u PYTHONPATH python3 -c "
import json, re, sys
raw = open('$TMP_DIR/${NAME}.json').read()
m = re.search(r'(\[.*\]|\{.*\})', raw, re.S)
data = json.loads(m.group(1))
if isinstance(data, list):
    data = data[0]
print(data.get('result_url') or '')
")

if [[ -z "$URL" ]]; then
  echo "[$(date +%H:%M:%S)] FAIL $NAME no URL" | tee -a "$LOG"
  exit 1
fi

echo "[$(date +%H:%M:%S)] DOWN $NAME" | tee -a "$LOG"
curl -sL "$URL" -o "$RAW"

/usr/bin/env -u PYTHONPATH python3 - "$RAW" "$OUT" <<'PY'
import sys
from PIL import Image
src, dest = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
w, h = im.size
max_w = 1200
if w > max_w:
    nh = int(h * max_w / w)
    im = im.resize((max_w, nh), Image.Resampling.LANCZOS)
im.save(dest, "JPEG", quality=85, optimize=True)
print(f"saved {dest} {im.size[0]}x{im.size[1]}")
PY

echo "[$(date +%H:%M:%S)] DONE $NAME" | tee -a "$LOG"
