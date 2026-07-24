# Update /work Portfolio Page: Animated Website Preview Cards with Real Screenshots

## Project Context

This is the Keystone Consulting Group website (keystoneconsultingg.com). It's a Vite + React 19 + Tailwind v4 SPA. The `/work` portfolio page exists at `src/pages/WorkPage.tsx` and is wired into the router in `src/App.tsx`.

## What's Already Done

1. Screenshots have been captured for all 8 projects and saved as JPEG files in `public/screenshots/previews/`:
   - `ensign-properties.jpg` (800x515, 89KB)
   - `teton-reach.jpg` (800x515, 29KB)
   - `keystone-os.jpg` (800x515, 40KB)
   - `benitz-appliance.jpg` (800x515, 34KB)
   - `att-fiber.jpg` (800x515, 17KB)
   - `avada-pest.jpg` (800x515, 32KB)
   - `mexpresso.jpg` (800x515, 38KB)
   - `sego-flooring.jpg` (800x515, 60KB)

2. Full-page screenshots also exist in `public/screenshots/opt/` (800px wide, full height JPEGs).

3. The current `WorkPage.tsx` has CSS-based placeholder cards with a mock browser chrome header, numbered index, lucide icon, and "Visit Site" button. No real screenshots are used.

## Your Task

Rewrite `src/pages/WorkPage.tsx` to replace the CSS placeholder card visuals with **real screenshot preview images** and add **animated reveal/preview interactions** on each card.

### Requirements

#### 1. Screenshot Preview Images

Each project card should show the actual screenshot of the website as the card visual. The screenshot sits inside the mock browser chrome frame (keep the browser chrome header with the 3 dots and domain bar — it frames the screenshot nicely).

- Image path: `/screenshots/previews/{slug}.jpg` (these are in `public/screenshots/previews/`)
- The image should fill the card visual area below the browser chrome bar
- Add `loading="lazy"` on all images except the first 3 (above the fold)
- Add `alt` text: `"{Project Name} website preview"`
- Use `width="800" height="515"` attributes for layout stability

#### 2. Card Animation — "Live Preview" Hover Effect

When a user hovers over a project card, the card should animate to show it's a live, clickable preview. The animation should be **subtle and premium**, not gimmicky. Ideas:

- **Image zoom on hover**: The screenshot image scales up slightly (1.03x max) inside the card with a smooth transition. Like looking through a window into the site.
- **Browser chrome reaction**: The browser chrome bar subtly highlights (border color shifts to teal/40, or the dots get a subtle color).
- **Card border**: The card border shifts to teal/30 (already in current code).
- **Smooth transitions**: All transitions should be 300-400ms ease-out.
- **No hover lift**: Do NOT translateY the card on hover. The card stays in place. Only internal elements animate.
- **prefers-reduced-motion**: All hover animations must be disabled when `prefers-reduced-motion: reduce` is set.

#### 3. Scroll Reveal Animation

Keep the existing `animate-on-scroll` IntersectionObserver pattern (already in the file). Each card fades in + slides up when scrolled into view. This is already working — keep it.

#### 4. Keystone OS Dashboard — SPECIAL HANDLING

The Keystone OS Dashboard (project index 03) contains **confidential internal data**. It must NOT have a "Visit Site" link. Instead:

- Remove the `<a>` "Visit Site" button for this project
- Replace it with a non-link button or text that says "Internal Tool — Available as a Custom Build" (or similar wording)
- The button should NOT be clickable / should not link anywhere
- Style it differently from the other "Visit Site" buttons — use a muted style (border-white/10, text-offwhite/40, no hover state change)
- Keep the screenshot preview — the screenshot is safe to show, just no live link
- Add a small lock icon (use lucide-react `Lock` icon) next to the button text

#### 5. Updated PROJECTS Array

Update the `PROJECTS` array in WorkPage.tsx to include:
- `screenshot`: the slug for the image file (e.g. `"ensign-properties"`)
- `isConfidential`: boolean (true only for Keystone OS Dashboard)
- Keep all existing fields (name, label, url, domain, desc, tags, icon)

Here's the mapping:
| # | slug | name | Confidential? |
|---|------|------|---------------|
| 01 | ensign-properties | Ensign Properties Management | No |
| 02 | teton-reach | Teton Reach | No |
| 03 | keystone-os | Keystone OS Dashboard | YES |
| 04 | benitz-appliance | Benitz Appliance | No |
| 05 | att-fiber | AT&T Fiber Internet | No |
| 06 | avada-pest | Avada Pest Control | No |
| 07 | mexpresso | Mexpresso Utah | No |
| 08 | sego-flooring | Sego Flooring SWFL | No |

#### 6. Design Rules (NON-NEGOTIABLE — same as before)

- **No emojis.** Clean inline SVGs from lucide-react only.
- **No gradients, glassmorphism, glow effects, or grain textures.** Flat, clean, professional.
- **No hover lift/translateY on cards.** Only internal image zoom + border color changes.
- **Dark theme.** Match existing charcoal/offwhite/teal palette from index.css.
- **Mobile-first.** Grid: 1 col mobile, 2 col tablet, 3 col desktop. Test at 390px.
- **External links** use `target="_blank"` and `rel="noopener noreferrer"` (only for non-confidential projects).
- **Use existing CSS tokens** from index.css — do NOT introduce new color values.
- **Use existing font classes** — `font-serif`, `font-mono`, `font-sans` are defined in the Tailwind theme.

#### 7. Card Structure (Updated)

```
┌─────────────────────────────┐
│ [browser chrome bar w/ domain]│  ← keep existing mock browser header
├─────────────────────────────┤
│                             │
│    [screenshot image]       │  ← NEW: real screenshot of the site
│    (zooms 1.03x on hover)   │
│                             │
├─────────────────────────────┤
│ 01  Ensign Properties       │  ← keep existing: index + label
│ ─────────────────────────── │
│ Ensign Properties Management│  ← keep existing: full name
│ Full property management... │  ← keep existing: description
│ [Property Management] [List]│  ← keep existing: tag pills
│                             │
│ [Visit Site →]              │  ← button: "Visit Site" for public, "Internal Tool" for Keystone OS
└─────────────────────────────┘
```

#### 8. Keep Everything Else

- Keep the Hero section exactly as-is
- Keep the Custom Software Builds section exactly as-is
- Keep the "Powered by Keystone Consulting" strip
- Keep the `useScrollAnimation` hook
- Keep the `ContactForm` import and usage
- Keep the `WorkPageProps` interface
- Keep the router wiring in App.tsx (no changes needed there)

### Verification

After writing:
1. Run `npm run build` — must succeed with zero TypeScript errors
2. Run `npx tsc --noEmit` — must pass with zero errors
3. Read back the final `src/pages/WorkPage.tsx` to verify correctness
4. Verify all 8 image paths match files in `public/screenshots/previews/`

## File Paths

- Project root: `/tmp/kcg-portfolio-build/`
- WorkPage: `src/pages/WorkPage.tsx`
- Screenshots: `public/screenshots/previews/*.jpg`
- CSS: `src/index.css` (read for tokens, do not modify)
- App: `src/App.tsx` (read for patterns, do not modify unless needed)