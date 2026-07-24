# Phase 2: Site-Wide Imagery Generation and Integration

The team photos are done and look good. Now generate and integrate images throughout the site.

## What to Do

### Step 1: Plan the Images

Read through `src/App.tsx` and identify every section that would benefit from a real image. Based on the Stripe/Square research:

**Sections that need images (home page):**

1. **HowItWorks** (4-step process) — needs a visual showing the audit/savings process. Maybe a stylized "statement analysis" mockup or a fee comparison chart.
2. **Pricing** (2 pricing cards) — needs product mockups. The Edge Program card could show a POS terminal showing $0 fees. The Interchange Plus card could show a clean invoice/billing statement.
3. **ProductGrid** (5 service cards) — each service card currently has just an icon. Could have small background images or product mockups.
4. **FreePlacement** (3 offer cards) — needs photos of actual hardware (Bluetooth reader, POS terminal, ATM).
5. **Industries** (12 pills) — could use a banner image or industry-specific imagery.
6. **WhyChooseUs** (4 reasons) — could use a data visualization or abstract graphic.
7. **Testimonials** — already has a featured story box. Could use a real photo or graphic.

**Sections that probably DON'T need images:**
- Hero (already has POS mockup + savings calculator)
- ProcessingVolume (already has big numbers + stat cards)
- ROICalculator (already has the slider UI)
- IntegrationEcosystem (already has the marquee)
- Team (just done with photos)

### Step 2: Generate Images with Higgsfield

For each image, use this pattern:
```bash
~/.hermes/node/bin/higgsfield generate create gpt_image_2 \
  --prompt "PROMPT" \
  --aspect_ratio "RATIO" \
  --quality high \
  --resolution 2k \
  --wait --wait-timeout 5m
```

Then download:
```bash
curl -sL "URL" -o public/images/FILENAME.png
```

**Critical prompt guidelines:**
- NO text in any image (GPT Image 2 hallucinates text badly)
- Match the dark charcoal/teal palette: dark backgrounds (#2D2D2D, #1E1E1E), teal accents (#008080), light text elements (#F5F5F0)
- Professional, photographic, or product-mockup aesthetic
- NO cartoonish illustrations, NO AI-looking art
- Images should look like real product photography or real data dashboards
- Dark theme to match the site

**Image list to generate (pick the 6-8 highest impact):**

1. **POS Terminal showing zero fees** (for Pricing section, Edge Program card)
   - Dark themed POS terminal on a counter, screen showing "$0.00" in green/teal
   - Aspect ratio: 4:3 or 1:1

2. **Processing statement with red annotations** (for HowItWorks section)
   - A dark-themed document/dashboard showing fee line items with red highlights pointing to hidden fees
   - Aspect ratio: 16:9

3. **Bluetooth card reader product shot** (for FreePlacement section)
   - Small white card reader on a dark surface, professional product photography style
   - Aspect ratio: 1:1

4. **POS system with kitchen display** (for FreePlacement section)
   - Dark-themed restaurant POS setup with a terminal and kitchen display screen
   - Aspect ratio: 1:1

5. **Dashboard with charts** (for WhyChooseUs or ProductGrid)
   - Dark-themed analytics dashboard showing revenue graphs, savings metrics, teal accents
   - Aspect ratio: 16:9

6. **Abstract data flow visualization** (for HowItWorks or Hero accent)
   - Dark background with flowing teal data streams, abstract representation of money flow
   - Aspect ratio: 16:9

7. **ATM machine** (for FreePlacement section)
   - Modern ATM machine in a clean, dark environment
   - Aspect ratio: 1:1

8. **AI chat interface mockup** (for ProductGrid AI section)
   - Dark-themed chat interface showing a conversation about product inventory
   - Aspect ratio: 4:3

### Step 3: Integrate Images

Add the generated images to the appropriate sections in App.tsx. Place them as background images, section headers, or inline visuals. Use the existing CSS patterns:
- `object-cover` for full-width images
- `rounded-2xl` for contained images
- `border border-white/10` for framing
- `loading="lazy"` for below-fold images
- Images in `public/images/` directory, referenced as `/images/filename.png`

### Step 4: Optimize

After all images are generated and integrated:
1. Resize any images larger than 1200px wide using Python PIL
2. Convert to JPEG quality 85 for photos, keep PNG for graphics with transparency
3. Run `npm run build` and `npx tsc --noEmit`
4. Both must pass

### Design Rules
- No emojis
- No gradients/glassmorphism/glow (beyond existing)
- Dark charcoal/teal palette
- Mobile-first (test at 390px)
- Images must look professional, NOT AI-generated
- No text in generated images
- Match existing site aesthetic

## File Paths
- Project root: `/tmp/kcg-portfolio-build/`
- Images: `public/images/`
- Main file: `src/App.tsx`
- Higgsfield: `~/.hermes/node/bin/higgsfield`