#!/usr/bin/env bash
# Generate images in controlled parallel batches (3 at a time).
set -euo pipefail
ROOT="/private/tmp/kcg-portfolio-build"
ONE="$ROOT/scripts/generate-one.sh"
chmod +x "$ONE"
mkdir -p /tmp/kcg-img-gen "$ROOT/public/images/services" "$ROOT/public/images/industries"

CAM="shot on Canon EOS R5 with 50mm lens, natural lighting, photorealistic product photography, actual photograph not a render, no text, no labels, no screens with text, no UI elements, shallow depth of field, realistic shadows, no glow effects, matte finishes, professional studio lighting"

PIDS=()
fail=0

launch() {
  local out="$1" ratio="$2" prompt="$3"
  local name; name="$(basename "$out" .jpg)"
  echo "[$(date +%H:%M:%S)] launch $name"
  "$ONE" "$out" "$ratio" "$prompt" > "/tmp/kcg-img-gen/${name}.out" 2>&1 &
  PIDS+=($!)
}

drain() {
  for pid in "${PIDS[@]}"; do
    if ! wait "$pid"; then
      fail=$((fail+1))
      echo "FAILED pid=$pid"
    fi
  done
  PIDS=()
}

# ═══════════ HOME ═══════════
launch "$ROOT/public/images/statement-analysis.jpg" "16:9" \
  "Photorealistic close-up of a printed merchant processing statement on a dark wooden desk, with a pen pointing at a line item, dramatic side lighting, shallow depth of field, no text visible, just the abstract look of a paper document being reviewed. Dark moody professional photography. $CAM"
launch "$ROOT/public/images/pos-zero-fees.jpg" "4:3" \
  "Photorealistic product photography of a modern black POS terminal on a dark stone countertop, matte finish, no screen text visible, shot from a 45-degree angle, soft directional lighting from the left, shallow depth of field. Professional commercial product shot, not a render. $CAM"
launch "$ROOT/public/images/billing-statement.jpg" "4:3" \
  "Photorealistic product photography of a stack of printed invoices/receipts on a dark slate surface, warm desk lamp lighting from the right, no readable text, just the texture and shape of professional billing documents. Commercial photography style. $CAM"
drain

launch "$ROOT/public/images/analytics-dashboard.jpg" "16:9" \
  "Photorealistic product photography of a modern laptop on a dark desk showing an abstract dark-colored screen with teal accent colors glowing softly, no readable text, just the ambient glow of a screen in a dark office environment. Shot from behind and slightly to the side, shallow depth of field. $CAM"
launch "$ROOT/public/images/ai-chat.jpg" "4:3" \
  "Photorealistic product photography of a smartphone on a dark desk, screen glowing softly with teal and dark tones, no readable text, ambient screen glow illuminating the desk surface. Professional commercial photography, shallow depth of field, natural shadows. $CAM"
launch "$ROOT/public/images/bluetooth-reader.jpg" "1:1" \
  "Photorealistic product photography of a small white credit card reader device on a dark charcoal surface, matte white plastic, shot from above at a slight angle, soft studio lighting, no text or labels. Clean minimalist commercial product shot. $CAM"
drain

launch "$ROOT/public/images/pos-kitchen.jpg" "4:3" \
  "Photorealistic product photography of a modern restaurant POS terminal on a dark countertop, matte black finish, no screen text visible, shot from a 45-degree angle, warm ambient restaurant lighting in the background blurred out. Professional commercial photography. $CAM"
launch "$ROOT/public/images/atm-machine.jpg" "4:3" \
  "Photorealistic product photography of a modern ATM machine in a clean dark environment, brushed metal and black plastic surfaces, shot from a slight angle, professional studio lighting, no screen text visible. Commercial photography style. $CAM"
launch "$ROOT/public/images/cafe-success.jpg" "16:9" \
  "Photorealistic photograph of a cozy restaurant interior at night, warm lighting, blurred background, empty table with a POS terminal, professional editorial photography style, dark moody atmosphere, no people, no text. $CAM"
drain

echo "HOME done. fails=$fail"
ls -la "$ROOT/public/images/"*.jpg

# ═══════════ SERVICES ═══════════
launch "$ROOT/public/images/services/web-design.jpg" "4:3" \
  "Photorealistic product photography of a modern dark monitor on a desk displaying a well-designed website as soft abstract shapes and teal accent colors, no readable text, ambient screen glow, dark charcoal office environment. Shot on Canon EOS R5, shallow depth of field, actual photograph. $CAM"
launch "$ROOT/public/images/services/crm.jpg" "4:3" \
  "Photorealistic product photography of a laptop on a dark desk with a CRM-like dark theme screen glow and soft teal accent colors, no readable text, no UI elements, professional commercial photography. $CAM"
launch "$ROOT/public/images/services/automations.jpg" "4:3" \
  "Photorealistic abstract still life of interconnected matte black and brushed aluminum hardware nodes on a dark charcoal surface with thin teal fiber optic light paths between them, no text, professional commercial photography, shallow depth of field. $CAM"
drain

launch "$ROOT/public/images/services/consulting.jpg" "4:3" \
  "Photorealistic professional desk scene with printed documents, a matte black calculator, and a fountain pen on dark wood, dark moody lighting from the left, no readable text, commercial photography. $CAM"
launch "$ROOT/public/images/services/prep-to-sell.jpg" "4:3" \
  "Photorealistic abstract representation of business growth: ascending stack of dark matte blocks with a soft teal light line rising upward on a charcoal background, no text, no charts with numbers, professional studio photography. $CAM"
launch "$ROOT/public/images/services/seo.jpg" "4:3" \
  "Photorealistic product photography of a smartphone on a dark surface showing soft search-results-like glow in teal and white shapes, no readable text, dark environment, shallow depth of field. $CAM"
drain

launch "$ROOT/public/images/services/google-business.jpg" "4:3" \
  "Photorealistic product photography of a smartphone on a dark desk showing a soft abstract map glow with teal pin-like light, no readable text, dark environment, commercial photography. $CAM"
launch "$ROOT/public/images/services/bpo.jpg" "4:3" \
  "Photorealistic product photography of a professional headset resting on a dark desk next to a notebook, dark professional office environment, soft directional lighting, no people, no text. $CAM"
launch "$ROOT/public/images/services/consumer-financing.jpg" "4:3" \
  "Photorealistic product photography of a matte black credit card on a dark slate surface, brushed metal accents, soft studio lighting from the left, shallow depth of field, no text or logos visible. $CAM"
drain

launch "$ROOT/public/images/services/business-loans.jpg" "4:3" \
  "Photorealistic product photography of stacked US currency bills and a matte black calculator on a dark wooden desk, warm desk lamp lighting, no readable text, commercial photography style. $CAM"
launch "$ROOT/public/images/services/pos-placement.jpg" "4:3" \
  "Photorealistic product photography of a modern black POS terminal hardware on a dark stone countertop, matte black plastic, no screen text visible, shot from 45 degrees, soft directional lighting. $CAM"
drain

echo "SERVICES done. fails=$fail"
ls -la "$ROOT/public/images/services/"

# ═══════════ INDUSTRIES ═══════════
launch "$ROOT/public/images/industries/restaurants.jpg" "16:9" \
  "Photorealistic photograph of an empty cozy restaurant interior at night, warm ambient lighting, dark wooden tables, soft bokeh, no people, no text, professional editorial photography, dark moody atmosphere. $CAM"
launch "$ROOT/public/images/industries/grocery.jpg" "16:9" \
  "Photorealistic photograph of a grocery store aisle at night after closing, dark moody lighting, shelves softly lit, no people, no readable text or labels, professional commercial photography. $CAM"
launch "$ROOT/public/images/industries/healthcare.jpg" "16:9" \
  "Photorealistic photograph of a clean modern medical reception area, soft cool lighting, empty waiting chairs, dark charcoal and teal accents, no people, no text, professional architectural photography. $CAM"
drain

launch "$ROOT/public/images/industries/ecommerce.jpg" "16:9" \
  "Photorealistic product photography of e-commerce shipping boxes and kraft packaging on a dark charcoal surface, soft studio lighting from the left, no text or logos, commercial photography. $CAM"
launch "$ROOT/public/images/industries/salons.jpg" "16:9" \
  "Photorealistic photograph of an empty upscale salon interior, warm lighting, styling chairs and mirrors softly blurred, no people, no text, dark moody professional photography. $CAM"
launch "$ROOT/public/images/industries/auto-repair.jpg" "16:9" \
  "Photorealistic photograph of an auto repair shop bay interior, dark moody lighting, tools and lift soft in background, no people, no text, professional editorial photography. $CAM"
drain

launch "$ROOT/public/images/industries/gas-stations.jpg" "16:9" \
  "Photorealistic photograph of a gas station at night, dark atmospheric lighting, wet pavement reflections, soft neon and canopy lights, no people, no readable text or prices, cinematic photography. $CAM"
launch "$ROOT/public/images/industries/high-risk.jpg" "16:9" \
  "Photorealistic abstract commercial photograph representing security and stability: matte black vault-like door and brushed steel lock mechanism on dark charcoal background, soft directional lighting, no text, studio photography. $CAM"
launch "$ROOT/public/images/industries/nonprofits.jpg" "16:9" \
  "Photorealistic photograph of an empty community gathering space with warm soft lighting, wooden chairs in a circle, dark moody atmosphere, no people, no text, professional editorial photography. $CAM"
drain

launch "$ROOT/public/images/industries/b2b.jpg" "16:9" \
  "Photorealistic photograph of a modern empty office conference room at dusk, dark moody lighting through glass windows, clean desk surface, no people, no text, architectural photography. $CAM"
launch "$ROOT/public/images/industries/real-estate.jpg" "16:9" \
  "Photorealistic photograph of a modern house exterior at dusk, warm interior lights glowing through windows, professional real estate photography, dark sky, no people, no text or signs. $CAM"
launch "$ROOT/public/images/industries/retail.jpg" "16:9" \
  "Photorealistic photograph of an empty retail store interior after hours, dark moody lighting, clothing racks softly lit, no people, no readable text or price tags, professional commercial photography. $CAM"
drain

echo "ALL DONE. total_fails=$fail"
ls -la "$ROOT/public/images/"*.jpg "$ROOT/public/images/services/" "$ROOT/public/images/industries/"
exit $fail
