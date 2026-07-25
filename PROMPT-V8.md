# Wire Subsection Images Into ServicesPage and IndustryPageTemplate

## Context

We generated 151 photorealistic images for every subsection across the site. The images are on disk but NOT yet referenced in the code. You need to update the JSX to display these images instead of the current icon-in-circle placeholders.

## Image Locations

- Service subsection images: `/public/images/services/sub/{slug}.jpg` (44 images, 1:1 aspect ratio)
- Industry subsection images: `/public/images/industries/sub/{slug}.jpg` (107 images, 1:1 aspect ratio)

## File 1: ServicesPage.tsx

In `src/pages/ServicesPage.tsx`, each service in SERVICES_DETAIL has a `sections` array with 4 subsections. Each subsection has a `title` field. The image filename is the slugified version of that title.

For each subsection card in the "Capability Cards" grid (around line 528-541), replace the current icon-in-circle visual with an image:

Current code pattern:
```tsx
<div key={si} className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl p-8 ...">
  <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-6 ...">
    <sub.icon className="w-6 h-6 text-teal" />
  </div>
  <h3 ...>{sub.title}</h3>
  <p ...>{sub.desc}</p>
</div>
```

Replace with an image at the top of each card:
```tsx
<div key={si} className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl overflow-hidden ...">
  <div className="aspect-square overflow-hidden border-b border-white/5">
    <img src={`/images/services/sub/${subSlug}.jpg`} alt={sub.title} className="w-full h-full object-cover" loading="lazy" />
  </div>
  <div className="p-6">
    <div className="flex items-center gap-3 mb-3">
      <sub.icon className="w-5 h-5 text-teal flex-shrink-0" strokeWidth={1.5} />
      <h3 className="text-lg text-white font-medium">{sub.title}</h3>
    </div>
    <p className="text-offwhite/60 font-light leading-relaxed text-sm">{sub.desc}</p>
  </div>
</div>
```

To generate the slug from the title: lowercase, replace spaces with hyphens, replace `&` with `and`, remove special characters, strip leading/trailing hyphens. Examples:
- "3D Animated Websites" -> "3d-animated-websites"
- "Mobile-First & Lightning Fast" -> "mobile-first-and-lightning-fast"
- "AI Lead Qualification" -> "ai-lead-qualification"

Add a helper function at the top of the file:
```tsx
const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
```

Then use `slugify(sub.title)` for the image path.

## File 2: IndustryPageTemplate.tsx

In `src/pages/IndustryPageTemplate.tsx`, each industry has:
1. `solutionCards` array (6 items) - displayed in a grid around line 400-411
2. `features` array (3 items) - displayed in alternating sections around line 419-441

### Solution Cards

Current pattern:
```tsx
<div key={i} className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl p-8 ...">
  <div className="w-12 h-12 rounded-xl bg-teal/10 ...">
    <card.icon className="w-6 h-6 text-teal" />
  </div>
  <h3>{card.title}</h3>
  <p>{card.desc}</p>
</div>
```

Replace with image at top:
```tsx
<div key={i} className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl overflow-hidden ...">
  <div className="aspect-square overflow-hidden border-b border-white/5">
    <img src={`/images/industries/sub/${slugify(card.title)}.jpg`} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
  </div>
  <div className="p-6">
    <div className="flex items-center gap-3 mb-3">
      <card.icon className="w-5 h-5 text-teal flex-shrink-0" strokeWidth={1.5} />
      <h3 className="text-base text-white font-medium">{card.title}</h3>
    </div>
    <p className="text-offwhite/60 font-light leading-relaxed text-sm">{card.desc}</p>
  </div>
</div>
```

### Feature Sections

Current pattern (alternating text/visual):
```tsx
<div className="...grid grid-cols-1 lg:grid-cols-2 gap-12...">
  <div> {/* text */}
    <h3>{feature.title}</h3>
    <p>{feature.desc}</p>
  </div>
  <div> {/* visual - currently just an icon in a circle */}
    <div className="relative h-[280px]...overflow-hidden...">
      <feature.icon className="w-20 h-20 text-teal/25..." />
    </div>
  </div>
</div>
```

Replace the visual div with an image:
```tsx
<div className={i % 2 !== 0 ? 'lg:col-start-1' : ''}>
  <div className="relative h-[280px] md:h-[340px] rounded-2xl overflow-hidden border border-white/10 bg-slate-dark/30 group shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500">
    <img src={`/images/industries/sub/${slugify(feature.title)}.jpg`} alt={feature.title} className="w-full h-full object-cover" loading="lazy" />
  </div>
</div>
```

Add the same `slugify` helper function at the top of IndustryPageTemplate.tsx.

## Important Notes

- Do NOT change any data arrays, only the JSX rendering
- Do NOT change any `id`, `icon`, `title`, `desc`, or other data fields
- Keep the existing icon next to the title (smaller, inline) — it adds visual variety
- Use `loading="lazy"` on all images (they're all below the fold)
- Use `object-cover` so images fill their containers
- Add `overflow-hidden` to card containers so images don't break the border radius
- The `slugify` function MUST match the filenames already on disk exactly
- Run `npm run build` and `npx tsc --noEmit` after changes — both must pass

## File Paths
- Project root: `/tmp/kcg-portfolio-build/`
- Services page: `src/pages/ServicesPage.tsx`
- Industry template: `src/pages/IndustryPageTemplate.tsx`