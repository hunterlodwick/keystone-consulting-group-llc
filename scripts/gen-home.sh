#!/usr/bin/env bash
# Launch all image generations for KCG portfolio.
set -euo pipefail
ROOT="/private/tmp/kcg-portfolio-build"
ONE="$ROOT/scripts/generate-one.sh"
chmod +x "$ONE"
mkdir -p /tmp/kcg-img-gen "$ROOT/public/images/services" "$ROOT/public/images/industries"

CAM="shot on Canon EOS R5 with 50mm lens, natural lighting, photorealistic product photography, actual photograph not a render, no text, no labels, no screens with text, no UI elements, shallow depth of field, realistic shadows, no glow effects, matte finishes, professional studio lighting"

run() {
  local out="$1" ratio="$2" prompt="$3"
  "$ONE" "$out" "$ratio" "$prompt" > "/tmp/kcg-img-gen/$(basename "$out" .jpg).out" 2>&1 &
  echo "launched $(basename "$out") pid=$!"
}

# ── HOME (9) ──────────────────────────────────────────────
run "$ROOT/public/images/statement-analysis.jpg" "16:9" \
  "Photorealistic close-up of a printed merchant processing statement on a dark wooden desk, with a pen pointing at a line item, dramatic side lighting, shallow depth of field, no text visible, just the abstract look of a paper document being reviewed. Dark moody professional photography. $CAM"

run "$ROOT/public/images/pos-zero-fees.jpg" "4:3" \
  "Photorealistic product photography of a modern black POS terminal on a dark stone countertop, matte finish, no screen text visible, shot from a 45-degree angle, soft directional lighting from the left, shallow depth of field. Professional commercial product shot, not a render. $CAM"

run "$ROOT/public/images/billing-statement.jpg" "4:3" \
  "Photorealistic product photography of a stack of printed invoices/receipts on a dark slate surface, warm desk lamp lighting from the right, no readable text, just the texture and shape of professional billing documents. Commercial photography style. $CAM"

run "$ROOT/public/images/analytics-dashboard.jpg" "16:9" \
  "Photorealistic product photography of a modern laptop on a dark desk showing an abstract dark-colored screen with teal accent colors glowing softly, no readable text, just the ambient glow of a screen in a dark office environment. Shot from behind and slightly to the side, shallow depth of field. $CAM"

run "$ROOT/public/images/ai-chat.jpg" "4:3" \
  "Photorealistic product photography of a smartphone on a dark desk, screen glowing softly with teal and dark tones, no readable text, ambient screen glow illuminating the desk surface. Professional commercial photography, shallow depth of field, natural shadows. $CAM"

run "$ROOT/public/images/bluetooth-reader.jpg" "1:1" \
  "Photorealistic product photography of a small white credit card reader device on a dark charcoal surface, matte white plastic, shot from above at a slight angle, soft studio lighting, no text or labels. Clean minimalist commercial product shot. $CAM"

run "$ROOT/public/images/pos-kitchen.jpg" "4:3" \
  "Photorealistic product photography of a modern restaurant POS terminal on a dark countertop, matte black finish, no screen text visible, shot from a 45-degree angle, warm ambient restaurant lighting in the background blurred out. Professional commercial photography. $CAM"

run "$ROOT/public/images/atm-machine.jpg" "4:3" \
  "Photorealistic product photography of a modern ATM machine in a clean dark environment, brushed metal and black plastic surfaces, shot from a slight angle, professional studio lighting, no screen text visible. Commercial photography style. $CAM"

run "$ROOT/public/images/cafe-success.jpg" "16:9" \
  "Photorealistic photograph of a cozy restaurant interior at night, warm lighting, blurred background, empty table with a POS terminal, professional editorial photography style, dark moody atmosphere, no people, no text. $CAM"

echo "HOME batch launched. Waiting..."
wait
echo "HOME batch complete."
ls -la "$ROOT/public/images/"*.jpg
