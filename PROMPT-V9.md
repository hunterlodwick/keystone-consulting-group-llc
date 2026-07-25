# Fix All Subsection Images: Specific Prompts for Every Section

## Problem

The 151 subsection images across the site are showing random objects that don't match their content. Example: Google My Business section shows watches. Many sections have random computers, headphones, or unrelated objects. This is because the original prompts were too generic (keyword-matching to broad categories).

## Solution

Read every subsection's title AND description from both files, then write a SPECIFIC, CONCRETE prompt for each one that describes exactly what physical object or scene should appear. Then regenerate all images with these better prompts.

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
3. Is NOT vague ("professional commercial photography")
4. Describes ONE clear subject that a photographer would actually photograph for this topic

**BAD prompts (what we had):**
- "Abstract representation of customer engagement, dark background with teal accent lighting" -> generates random objects
- "Photorealistic product photography of a smartphone on a dark desk, screen glowing" -> too generic, could be anything

**GOOD prompts (what we need):**
- "Zero-Fee Payment Processing" -> "Close-up product photography of a black POS terminal on a dark stone counter, the screen shows a green zero, matte black finish, shot from 45 degrees, shallow depth of field, no readable text except the number zero"
- "Google Posts & Updates" -> "Product photography of a smartphone held in hand showing a colorful map application with location pins, dark background, the phone screen is the only light source, no readable text, shallow depth of field"
- "Review Management" -> "Product photography of a smartphone on a dark wooden desk showing five gold stars on screen, warm screen glow, no other text visible, shallow depth of field"
- "Local Citation Building" -> "Top-down product photography of a stack of business cards on a dark slate surface, warm lighting from the right, shallow depth of field, no readable text on cards"

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
4. Overwrites the existing image file
5. Uses parallel batches of 5 for speed

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

1. **Name a specific physical object** - not "abstract representation" or "conceptual image"
2. **The object must relate to the section's actual function** - if it's about reviews, show stars. If it's about payments, show a terminal. If it's about SEO, show a search results page glow.
3. **No text in images** - GPT Image 2 hallucinates text. Say "no readable text" in every prompt
4. **Dark charcoal/teal palette** - match the site theme
5. **Photorealistic** - "shot on Canon EOS R5, 50mm lens, shallow depth of field"
6. **One clear subject** - not a busy scene with multiple objects
7. **NO random objects** - if the section is about restaurant payments, show a POS terminal in a restaurant setting, NOT a watch or headphones

## File Paths
- Project root: `/tmp/kcg-portfolio-build/`
- Services: `src/pages/ServicesPage.tsx`
- Industries: `src/pages/IndustryPageTemplate.tsx`
- Service sub images: `public/images/services/sub/`
- Industry sub images: `public/images/industries/sub/`
- Output prompts: `/tmp/kcg-portfolio-build/image-prompts.json`