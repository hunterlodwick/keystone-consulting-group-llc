# Fix All Subsection Images: Specific Prompts with Natural Color Palettes

## Problem

The 151 subsection images across the site are showing random objects that don't match their content. Example: Google My Business section shows watches. Many sections have random computers, headphones, or unrelated objects. This is because the original prompts were too generic (keyword-matching to broad categories).

Additionally, the previous generation forced every image into the same dark charcoal/teal palette, which makes the site feel fabricated and monotonous. Real enterprise sites like Square use drastically different color moods per section — warm restaurant interiors, bright retail shots, moody gas station photos, clean medical spaces. Each image should match the EMOTION of its section, not a brand color template.

## Solution

Read every subsection's title AND description from both files, then write a SPECIFIC, CONCRETE prompt for each one. Then regenerate all images with these better prompts.

## What to Do

### Step 1: Read the code and extract all subsections

Read `src/pages/ServicesPage.tsx` and `src/pages/IndustryPageTemplate.tsx`. For each subsection, extract:
- The title (what the card is about)
- The description (what it does for the customer)
- The current image slug (filename on disk)

### Step 2: Write specific prompts

For EACH subsection, write a prompt that:
1. Names a SPECIFIC physical object or real-world scene directly related to what the section does
2. Is NOT generic ("abstract representation of...")
3. Describes ONE clear subject that a photographer would actually photograph for this topic
4. Uses NATURAL color palettes that match the subject's real environment — NOT forced charcoal/teal on everything

**Color palette guidance:**
- Restaurant sections: warm amber and natural light, like Square's restaurant imagery
- Retail sections: bright, clean, well-lit commercial spaces
- Healthcare sections: clean white and soft blue, clinical but warm
- Gas station sections: dark, moody, neon glow at night
- Real estate sections: warm golden hour exteriors
- Salon sections: warm, inviting, soft natural light
- Payment processing sections: dark, premium, product photography (these CAN be dark/teal since they're showing hardware)
- SEO/web sections: natural screen glow on a desk, whatever color the screen would actually emit
- Financial sections: warm professional office tones, wood and brass
- Do NOT force teal accents on images where it doesn't make sense

**BAD prompts (what we had):**
- "Abstract representation of customer engagement, dark background with teal accent lighting" -> generates random objects
- "Photorealistic product photography of a smartphone on a dark desk, screen glowing" -> too generic

**GOOD prompts (what we need):**
- "Zero-Fee Payment Processing" (restaurant industry) -> "Close-up of a modern black POS terminal on a wooden restaurant table, warm ambient candle light, the screen shows a green zero, shot from 45 degrees, shallow depth of field"
- "Google Posts & Updates" -> "A smartphone held in hand showing a colorful map application with location pins, natural daylight, the phone screen is bright, blurred outdoor background"
- "Review Management" -> "A smartphone on a wooden desk showing five gold stars on screen, warm natural window light, no other text visible, shallow depth of field"
- "Tableside Payments" (restaurant) -> "A waiter holding a small white card reader at a restaurant table, warm restaurant lighting, customer's hand tapping a card, natural photography"
- "Outdoor EMV Compliance" (gas station) -> "A gas pump at night with a blue EMV card reader, neon station lights reflecting on wet pavement, moody atmospheric photography"
- "Patient Financing" (healthcare) -> "A clean modern medical reception desk with a small card reader, soft natural light from a window, white and pale blue tones, professional medical photography"
- "Tip-Friendly Payment" (salon) -> "A salon reception counter with a card reader showing a tip screen, warm soft lighting, a vase of flowers blurred in the background"

### Step 3: Write all prompts to a JSON file

Write the prompts to `/tmp/kcg-portfolio-build/image-prompts.json` in this format:
```json
[
  {"slug": "3d-animated-websites", "path": "public/images/services/sub/3d-animated-websites.jpg", "prompt": "specific prompt here", "aspect_ratio": "1:1"},
  ...
]
```

### Step 4: Regenerate all images

Write and run a Python script that:
1. Reads the JSON file
2. For each entry, calls Higgsfield GPT Image 2 with the specific prompt
3. Downloads and optimizes the result (800px max, JPEG q80)
4. OVERWRITES the existing image file
5. Uses parallel batches of 5 for speed
6. Prints progress

Higgsfield binary: `/Users/hunterlodwick/.hermes/node/bin/higgsfield`
Command pattern:
```bash
/Users/hunterlodwick/.hermes/node/bin/higgsfield generate create gpt_image_2 \
  --prompt "PROMPT" \
  --aspect_ratio "1:1" \
  --quality high \
  --resolution 2k \
  --wait --wait-timeout 5m
```

### Step 5: Verify

Run `npm run build` and `npx tsc --noEmit`. Both must pass.

## Critical Rules for Prompts

1. **Name a specific physical object or real scene** - not "abstract representation" or "conceptual image"
2. **The object must relate to the section's actual function** - if it's about reviews, show stars on a phone. If it's about restaurant payments, show a POS terminal in a restaurant. If it's about gas station compliance, show a gas pump.
3. **No text in images** - GPT Image 2 hallucinates text. Say "no readable text" in every prompt
4. **NATURAL color palettes** - match the real environment of the subject. Do NOT force charcoal/teal on everything. Restaurants are warm. Healthcare is clean white/blue. Gas stations are dark neon. Real estate is golden hour. Let each image have its own mood.
5. **Photorealistic** - "shot on Canon EOS R5, 50mm lens, shallow depth of field" or similar camera specs
6. **One clear subject** - not a busy scene with multiple objects
7. **NO random objects** - the image must show something directly related to the section title and description
8. **Match the industry context** - a "Zero-Fee Processing" image in the restaurant section should show a restaurant POS, while the same section in the gas station section should show a gas pump card reader

## File Paths
- Project root: `/tmp/kcg-portfolio-build/`
- Services: `src/pages/ServicesPage.tsx`
- Industries: `src/pages/IndustryPageTemplate.tsx`
- Service sub images: `public/images/services/sub/`
- Industry sub images: `public/images/industries/sub/`
- Output prompts: `/tmp/kcg-portfolio-build/image-prompts.json`