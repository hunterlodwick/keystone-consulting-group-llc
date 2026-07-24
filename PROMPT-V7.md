# Regenerate All Site Images + Add Images to Services and Industry Pages

## Context

The Keystone Consulting Group website (keystoneconsultingg.com) currently has 9 Higgsfield GPT Image 2 images on the home page that look AI-generated (plasticky textures, gibberish text on screens, uncanny lighting). The Services page (10 service sections) and Industry pages (12 industries) have ZERO images — just CSS shapes with lucide icons.

The header nav has already been fixed (Contact link removed).

## Task: Regenerate ALL images with better prompts + add images to every page

### Part 1: Regenerate Home Page Images (9 images)

The current images in `public/images/` all look AI-generated. The problem is the prompts were too generic. For the regeneration, use these specific techniques:

**Anti-AI-look prompt rules:**
1. Add "photorealistic product photography" or "actual photograph" to every prompt
2. Add "shot on Canon EOS R5 with 50mm lens, natural lighting" or similar camera specs
3. Add "no text, no labels, no screens with text, no UI elements" — GPT Image 2 cannot render text, so avoid it entirely
4. Add "minimalist, clean, dark background, professional studio lighting from left"
5. Specify real materials: "matte black plastic", "brushed aluminum", "real wood desk surface"
6. Add "shallow depth of field, realistic shadows, no glow effects"
7. NEVER ask for "dashboard" or "interface" or "screen showing" — these always look fake
8. Instead of showing a screen, show the physical hardware in a real environment

**Images to regenerate (overwrite existing files):**

1. **`statement-analysis.jpg`** (HowItWorks section) — Instead of a fake laptop screen, show: "Photorealistic close-up of a printed merchant processing statement on a dark wooden desk, with a pen pointing at a line item, dramatic side lighting, shallow depth of field, no text visible, just the abstract look of a paper document being reviewed. Dark moody professional photography."

2. **`pos-zero-fees.jpg`** (Pricing - Edge Program) — "Photorealistic product photography of a modern black POS terminal on a dark stone countertop, matte finish, no screen text visible, shot from a 45-degree angle, soft directional lighting from the left, shallow depth of field. Professional commercial product shot, not a render."

3. **`billing-statement.jpg`** (Pricing - Interchange Plus) — "Photorealistic product photography of a stack of printed invoices/receipts on a dark slate surface, warm desk lamp lighting from the right, no readable text, just the texture and shape of professional billing documents. Commercial photography style."

4. **`analytics-dashboard.jpg`** (WhyChooseUs/CRM) — Instead of a fake dashboard, show: "Photorealistic product photography of a modern laptop on a dark desk showing an abstract dark-colored screen with teal accent colors glowing softly, no readable text, just the ambient glow of a screen in a dark office environment. Shot from behind and slightly to the side, shallow depth of field."

5. **`ai-chat.jpg`** (ProductGrid - AI) — "Photorealistic product photography of a smartphone on a dark desk, screen glowing softly with teal and dark tones, no readable text, ambient screen glow illuminating the desk surface. Professional commercial photography, shallow depth of field, natural shadows."

6. **`bluetooth-reader.jpg`** (FreePlacement) — "Photorealistic product photography of a small white credit card reader device on a dark charcoal surface, matte white plastic, shot from above at a slight angle, soft studio lighting, no text or labels. Clean minimalist commercial product shot."

7. **`pos-kitchen.jpg`** (FreePlacement) — "Photorealistic product photography of a modern restaurant POS terminal on a dark countertop, matte black finish, no screen text visible, shot from a 45-degree angle, warm ambient restaurant lighting in the background blurred out. Professional commercial photography."

8. **`atm-machine.jpg`** (FreePlacement) — "Photorealistic product photography of a modern ATM machine in a clean dark environment, brushed metal and black plastic surfaces, shot from a slight angle, professional studio lighting, no screen text visible. Commercial photography style."

9. **`cafe-success.jpg`** (Testimonials) — "Photorealistic photograph of a cozy restaurant interior at night, warm lighting, blurred background, empty table with a POS terminal, professional editorial photography style, dark moody atmosphere, no people, no text."

**Command pattern for each:**
```bash
~/.hermes/node/bin/higgsfield generate create gpt_image_2 \
  --prompt "PROMPT_HERE" \
  --aspect_ratio "RATIO" \
  --quality high \
  --resolution 2k \
  --wait --wait-timeout 5m
```

After each generation, download and optimize:
```bash
curl -sL "URL" -o /tmp/temp-image.png
# Then use Python to resize to max 1200px wide and save as JPEG quality 85
```

Aspect ratios: Use 16:9 for wide section headers, 4:3 for card images, 1:1 for square placements.

### Part 2: Services Page Images (10 services)

Read `src/pages/ServicesPage.tsx`. Each service in SERVICES_DETAIL has a "visual" area (currently an icon cluster in a rounded box). Add a product image to each service section. Place images in `public/images/services/`.

Services and what image each needs:
1. **web-design** — Modern website on a dark monitor, no readable text, just the glow of a well-designed site
2. **crm** — Laptop on a desk with a CRM-like screen glow, dark theme, teal accents, no readable text
3. **automations** — Abstract representation of connected systems, dark background, teal connection lines
4. **consulting** — Professional desk scene, documents, a calculator, dark moody lighting
5. **prep-to-sell** — Abstract representation of growth/value, dark background with upward trend
6. **seo** — Phone showing search results glow, no readable text, dark environment
7. **google-business** — Phone showing a map glow, dark environment, no readable text
8. **bpo** — Headset on a desk, dark professional environment, no people
9. **consumer-financing** — Credit card on a dark surface, product photography style
10. **pos-placement** — POS terminal hardware, product photography style

### Part 3: Industry Page Images (12 industries)

Read `src/pages/IndustryPageTemplate.tsx`. Each industry page has a hero section with an icon in a circle. Add a relevant image to each industry's hero section. Place images in `public/images/industries/`.

Industries and what image each needs:
1. **restaurants** — Restaurant interior, warm lighting, no people
2. **grocery** — Grocery store aisle, dark moody photography
3. **healthcare** — Clean medical reception area, no people
4. **ecommerce** — E-commerce shipping boxes on a dark surface
5. **salons** — Salon interior, warm lighting, no people
6. **auto-repair** — Auto repair shop interior, dark moody
7. **gas-stations** — Gas station at night, dark atmospheric
8. **high-risk** — Abstract dark image representing security/stability
9. **nonprofits** — Community space, warm lighting, no people
10. **b2b** — Modern office space, dark moody, no people
11. **real-estate** — Modern house exterior at dusk, professional photography
12. **retail** — Retail store interior, dark moody, no people

### Part 4: Integration

Add all generated images to the appropriate sections:
- Home page: replace existing image src in App.tsx
- Services page: add image to the visual area of each service section in ServicesPage.tsx
- Industry template: add image to the hero section in IndustryPageTemplate.tsx

### Part 5: Optimize and Verify

1. Resize all images to max 1200px wide, JPEG quality 85
2. Run `npm run build` — must pass
3. Run `npx tsc --noEmit` — must pass
4. Commit and push

## File Paths
- Project root: `/tmp/kcg-portfolio-build/`
- Home images: `public/images/`
- Service images: `public/images/services/`
- Industry images: `public/images/industries/`
- Higgsfield: `~/.hermes/node/bin/higgsfield`

## Critical Rules
- NO text in any generated image
- Photorealistic photography style, NOT illustration/render style
- Dark charcoal/teal palette
- Professional commercial product photography aesthetic
- No AI-looking plasticky textures
- No glow effects, no gradients in images
- Use camera specs in prompts (lens, lighting) to force photographic look
- All images lazy loaded except above-the-fold
- Build must pass with zero errors