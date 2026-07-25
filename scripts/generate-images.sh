#!/usr/bin/env bash
# Generate a single Higgsfield image, download, and optimize to JPEG.
# Usage: generate-images.sh <output_path> <aspect_ratio> <prompt>
set -euo pipefail

OUT="$1"
RATIO="$2"
PROMPT="$3"
HF="$HOME/.hermes/node/bin/higgsfield"
TMP_DIR="/tmp/kcg-img-gen"
mkdir -p "$TMP_DIR" "$(dirname "$OUT")"

NAME="$(basename "$OUT" .jpg)"
LOG="$TMP_DIR/${NAME}.log"
RAW="$TMP_DIR/${NAME}.raw"
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
URL=$(echo "$JSON" | /usr/bin/env -u PYTHONPATH python3 -c "
import sys, json, re
raw = sys.stdin.read()
# Find JSON object in output
m = re.search(r'\{.*\}', raw, re.S)
if not m:
    print('', end='')
    sys.exit(0)
data = json.loads(m.group(0))
# Try common shapes
def find_url(obj, depth=0):
    if depth > 8: return None
    if isinstance(obj, str) and obj.startswith('http') and any(x in obj for x in ['.png','.jpg','.jpeg','image','cdn','blob']):
        return obj
    if isinstance(obj, dict):
        for k in ('url','image_url','download_url','result_url','output_url'):
            if k in obj and isinstance(obj[k], str) and obj[k].startswith('http'):
                return obj[k]
        for v in obj.values():
            u = find_url(v, depth+1)
            if u: return u
    if isinstance(obj, list):
        for v in obj:
            u = find_url(v, depth+1)
            if u: return u
    return None
u = find_url(data)
print(u or '', end='')
")

if [[ -z "$URL" ]]; then
  # Fallback: grep http urls from raw output
  URL=$(echo "$JSON" | grep -oE 'https?://[^"[:space:]]+\.(png|jpg|jpeg)[^"[:space:]]*' | head -1 || true)
fi

if [[ -z "$URL" ]]; then
  echo "[$(date +%H:%M:%S)] FAIL $NAME no URL" | tee -a "$LOG"
  echo "$JSON" | head -c 2000 | tee -a "$LOG"
  exit 1
fi

echo "[$(date +%H:%M:%S)] DOWNloading $NAME from $URL" | tee -a "$LOG"
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
