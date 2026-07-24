# Two Tasks: Team Photo Redesign + Site-Wide Imagery Strategy & Generation

## Context

You are working on the Keystone Consulting Group website (keystoneconsultingg.com). It's a Vite + React 19 + Tailwind v4 SPA. The site has been rewritten with benefit-driven copy. Now we need to fix the team photos and add real imagery/infographics throughout the site.

## Reference Research: How Stripe and Square Design Their Sites

**Stripe's visual strategy:**
- No stock photos of people shaking hands or smiling at computers
- Stylized product screenshots/mockups at dynamic angles with drop shadows
- Abstract 3D gradient mesh in hero (not literal imagery)
- Minimalist line icons (ultra-thin, consistent stroke weight)
- Generous whitespace between sections
- Subtle background transitions (light gray blocks, very subtle gradients)
- Mathematical grid alignment
- Restrained color palette (mostly white/dark slate/light gray, blue for CTAs only)
- Logos of trusted brands for social proof
- Big animated stats ($1.9T, 99.999%, 200M+)

**Square's visual strategy:**
- Authentic lifestyle photography in hero (real business owners in warm settings)
- Real-world product integration shots (person interacting with a Square terminal)
- Brand logos for social proof
- High-contrast sectioning (bright top, clean white middle, dramatic dark bottom)
- Elegant serif headlines contrasting with clean sans-serif body
- Restrained color palette (black, white, grays, signature blue for CTAs)
- Interactive accordions for feature exploration
- Clean pricing grid with thin dividers

**Common patterns (what makes them look premium and NOT AI-generated):**
1. Zero generic stock photos of people at desks looking at laptops
2. Product UI mockups with real-looking data, perfectly aligned
3. Generous whitespace, never cramped
4. Consistent iconography (same stroke weight, same corner rounding)
5. Restrained color usage — one or two accent colors, everything else neutral
6. Real brand logos for trust, not placeholder grey boxes
7. Data visualizations that look like real dashboards, not abstract charts
8. Section transitions through background color shifts, not hard borders

## Task 1: Fix Team Photos

### Problem
The current team photos don't look good:
- Hunter's photo was extended via AI and looks too far away — face is small, can't see features clearly
- Both photos are displayed in small 128x176px rounded rectangles that don't do them justice
- The overall card design with photos feels awkward, not like a premium corporate team page

### What to Do

1. **Regenerate Hunter's photo** using Higgsfield GPT Image 2. Write a structured prompt that produces a professional corporate headshot that matches Seth's photo framing (head and shoulders, centered, professional). Use the original Hunter photo at `/tmp/hunter-photo.png` as an image reference. The prompt should specify:
   - Professional corporate headshot, head and shoulders framing
   - Man with short dark brown hair, brown eyes, short trimmed beard and mustache
   - Black suit jacket, white dress shirt with top button undone, thin gold chain necklace
   - Solid light grey studio background
   - Looking directly at camera, neutral confident expression
   - Centered, symmetrical composition
   - Match the framing of a professional LinkedIn/corporate headshot (head and shoulders fill most of the frame)
   - 2:3 aspect ratio, 2k resolution, high quality

   Command:
   ```bash
   ~/.hermes/node/bin/higgsfield generate create gpt_image_2 \
     --prompt "YOUR_PROMPT_HERE" \
     --image /tmp/hunter-photo.png \
     --aspect_ratio "2:3" \
     --quality high \
     --resolution 2k \
     --wait --wait-timeout 5m
   ```

2. **Redesign the Team section** in `src/App.tsx` to showcase the photos properly. Look at how Stripe and Square present their team — they don't use tiny thumbnail photos in cards. They use either:
   - Large, prominent photos with clean typography
   - Or no photos at all, just clean text
   
   Redesign the Team section to look premium. Ideas:
   - Larger photos (full-width of the card, or circle photos at 120-140px diameter)
   - Better proportions — photos should be portrait-oriented and fill meaningful space
   - The cards should feel like business cards, not social media profiles
   - Photos should be the same size and framing (both head-and-shoulders)
   - Consider a two-column layout with large photo on top, name/title/contact below

3. **Resize both photos** to matching dimensions after generation. Both should be the same width and height. Save to `public/team/seth.jpg` and `public/team/hunter.jpg`.

4. **Update the JSX** in the Team component in App.tsx to use the new photo display approach.

## Task 2: Site-Wide Imagery & Infographics

### Problem
The site currently has zero real images beyond the team photos and portfolio screenshots. Every section is just text and CSS shapes (radial gradients, lucide icons in circles). It looks flat and empty compared to Stripe/Square which have rich product mockups, data visualizations, and visual storytelling.

### What to Do

1. **Audit the site** — read through App.tsx, ServicesPage.tsx, and IndustryPageTemplate.tsx to understand what sections exist and what visual each section needs. The home page sections are:
   - Hero (POS mockup + savings calculator — already has CSS mockups)
   - ProcessingVolume (big number + stat cards)
   - HowItWorks (4 steps with numbered circles)
   - RateGuarantee (CTA section with radial gradient)
   - Pricing (2 pricing cards)
   - ROICalculator (slider + results display)
   - ProductGrid (5 service cards with icons)
   - FreePlacement (3 offer cards with icons)
   - Industries (12 industry pills)
   - WhyChooseUs (4 reasons with vertical timeline)
   - Testimonials (4 testimonial cards)
   - IntegrationEcosystem (marquee of integration logos)
   - Team (2 team member cards)

2. **Plan what images to generate** for each section. Based on the Stripe/Square research:
   - Product mockups (POS terminal showing a transaction, dashboard with charts)
   - Data visualizations (fee comparison chart, savings over time graph)
   - Conceptual graphics (abstract representation of "finding hidden money")
   - Industry-specific scenes (restaurant POS, retail checkout, salon terminal)
   - NO generic stock photos of people smiling at computers
   - NO AI-looking illustrations with weird proportions
   - Everything should match the dark charcoal/teal color scheme

3. **Generate the images** using Higgsfield GPT Image 2 at 2k quality. Write structured prompts for each. The prompts must specify:
   - The dark charcoal/teal color palette (#2D2D2D, #1E1E1E, #008080, #F5F5F0)
   - Professional, clean, corporate aesthetic
   - NO text in the images (GPT Image 2 hallucinates text)
   - Specific composition details
   - The aspect ratio needed for each placement

4. **Integrate the images** into the code. Add them to the appropriate sections in App.tsx, ServicesPage.tsx, and IndustryPageTemplate.tsx. Place image files in `public/images/`.

### Image Generation Guidelines

For each image, the Higgsfield command pattern is:
```bash
~/.hermes/node/bin/higgsfield generate create gpt_image_2 \
  --prompt "YOUR_PROMPT_HERE" \
  --aspect_ratio "16:9" \
  --quality high \
  --resolution 2k \
  --wait --wait-timeout 5m
```

After generation, download immediately:
```bash
curl -sL "URL_FROM_OUTPUT" -o public/images/filename.png
```

### Design Rules (NON-NEGOTIABLE)
- No emojis
- No gradients, glassmorphism, glow effects (beyond what already exists)
- Dark charcoal/teal palette (#2D2D2D, #1E1E1E, #008080, #F5F5F0)
- Mobile-first (test at 390px)
- Images must be optimized (resize to max 1200px wide, JPEG quality 85)
- No text in generated images (GPT Image 2 hallucinates text badly)
- Images should look like real photography or real product mockups, NOT AI illustrations
- Match the existing site's aesthetic — dark, premium, minimal

### Technical Notes
- Project root: `/tmp/kcg-portfolio-build/`
- Images go in `public/images/`
- Team photos go in `public/team/`
- Run `npm run build` and `npx tsc --noEmit` after all code changes
- Both must pass with zero errors
- Commit and push after everything works

### Process
1. First, regenerate Hunter's photo and fix the Team section
2. Then plan and generate all site images
3. Integrate images into the code
4. Build, verify, commit, push, deploy

Take this in phases. Do the team photos first, verify they look good, then move to site imagery.