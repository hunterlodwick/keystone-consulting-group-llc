# Build /work Portfolio Page for Keystone Consulting Group

## Project Context

This is the Keystone Consulting Group website (keystoneconsultingg.com). It's a Vite + React 19 + Tailwind v4 SPA with client-side routing in `src/App.tsx`. The routing is simple pathname-based (no react-router) — it checks `currentPath` and renders the matching page component. Existing pages: MainLandingPage, DashboardPage, ServicesPage, SingleServicePage, IndustryPageTemplate.

Your job: Add a `/work` route that renders a **portfolio/showcase page** displaying KCG's best client projects.

## Important: Read the existing code first

Before writing anything, read:
1. `src/App.tsx` — understand the routing pattern, the Header component, the theme system (dark/light), the `onNavigate` pattern, the `onOpenModal` pattern
2. `src/index.css` — understand the color tokens, existing utility classes, the design system
3. `src/pages/ServicesPage.tsx` — understand how a sub-page is structured (sections, animations, cards)
4. `src/pages/DashboardPage.tsx` — understand how a standalone page works

Match the existing code patterns EXACTLY:
- Use the same `onNavigate` pattern for internal links (pushState + setCurrentPath)
- Use the same CSS class naming conventions and color tokens from index.css
- Use lucide-react icons (already a dependency)
- Use the existing `animate-on-scroll` / `useScrollAnimation` pattern for entrance animations
- Match the existing dark theme aesthetic (charcoal bg, offwhite text, teal accents)

## What to Build: `/work` Page

Create a new file `src/pages/WorkPage.tsx` and wire it into the router in `src/App.tsx`.

### Page Structure

1. **Hero Section** — Bold heading: "Selected Work" or similar. One-line subtitle: "Websites, custom software, and AI-powered systems built for small businesses across the US." Keep it tight. Match the existing site's hero style (big heading, light subtext, dark background).

2. **Featured Projects Grid** — 7 project cards, each showing:
   - Project name
   - One-sentence description (what it is, what it does)
   - Capability tags (e.g. "Property Management", "SEO/AEO", "E-commerce", "Custom CRM", "AI Assistant")
   - "Visit Site" button (external link, opens in new tab, `rel="noopener noreferrer"`)
   - Visual: use a screenshot or a styled placeholder card with the project's accent color/gradient. Since we don't have screenshot images yet, create elegant CSS-based cards with the project name, description, and tags. Each card should look premium and intentional, not like a placeholder.

3. **The 7 Projects (in this order):**

| # | Name | URL | Description | Tags |
|---|------|-----|-------------|------|
| 1 | Ensign Properties Management | https://www.ensignpropertiesmanagement.com | Full property management listing website with searchable rental inventory | Property Management, Listings, Search |
| 2 | Teton Reach | https://www.tetonreach.com | Professional services website | Professional Services, Web Design |
| 3 | Keystone OS Dashboard | https://keystone-os-dashboard.vercel.app | Custom internal operations dashboard with Kanban board, project tracking, and Firestore integration | Custom CRM, Kanban, Internal Tools |
| 4 | Benitz Appliance | https://benitz-appliance.vercel.app | Enterprise-level appliance dealer site with 631-product catalog, AI-powered RAG chat assistant, live search, and North Payments checkout | E-commerce, AI Assistant, 631 Products, Payments |
| 5 | AT&T Fiber Internet | https://www.attfiber-internet.com | Super SEO and AEO-driven dealer site with 33 pages of optimized content | SEO, AEO, 33 Pages, Content Strategy |
| 6 | Avada Pest Control | https://avada-pest-control.vercel.app | SEO-driven pest control site with 80+ pages of optimized local content | SEO, 80+ Pages, Local Search, Pest Control |
| 7 | Mexpresso Utah | https://www.mexpressoutah.com | Food truck website with a custom admin panel letting the owner update daily locations without a developer | Food Truck, Custom CMS, Location Updates |
| 8 | Sego Flooring SWFL | https://www.segoflooringswfl.com | 3D animated flooring company website with high-conversion appointment booking tactics | 3D Animation, Flooring, Appointment Booking, High Conversion |

4. **Custom Software Section** (below the grid) — A smaller section highlighting that KCG builds custom CRMs, AI assistants, and internal tools. Brief copy: "Beyond marketing websites, we build custom software: AI-powered chat assistants, operations dashboards, CRM systems, and automated workflows. Ask about a scoped build for your business." CTA button: "Schedule a Call" (links to the existing contact modal or `/services` route).

5. **Footer** — Match existing site footer. Include "Powered by Keystone Consulting" branding.

### Design Rules (NON-NEGOTIABLE)

- **No emojis anywhere.** Clean inline SVGs from lucide-react only.
- **No gradients, glassmorphism, glow effects, or grain textures.** Flat, clean, professional.
- **No hover lift animations that feel gimmicky.** Subtle border color change or opacity shift is fine.
- **Dark theme.** Match the existing charcoal/offwhite/teal palette.
- **Mobile-first.** Grid should be 1 column on mobile, 2 on tablet, 3 on desktop. Test at 390px.
- **External links** must use `target="_blank"` and `rel="noopener noreferrer"`.
- **Typography.** Use whatever fonts the existing site uses (check index.css for font-family declarations).

### Wiring into the Router

In `src/App.tsx`, add the `/work` route check. Follow the existing pattern:

```tsx
import WorkPage from './pages/WorkPage';

// In the render logic, add BEFORE the default MainLandingPage fallback:
} : currentPath === '/work' ? (
  <WorkPage 
    onNavigate={(path) => {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }}
    onOpenModal={handleOpenModal}
  />
) : (
```

Also add a "Work" link to the existing Header navigation (between Home and Services, or wherever makes sense in the existing nav structure).

### Verification

After building:
1. Run `npm install` (deps are already installed, but verify)
2. Run `npm run build` — it must succeed with zero TypeScript errors
3. Run `npm run lint` (tsc --noEmit) — must pass
4. Read back the final `src/pages/WorkPage.tsx` and the modified `src/App.tsx` to verify correctness

## Important Notes

- This is a Vite + React 19 + Tailwind v4 project. Tailwind v4 uses `@import "tailwindcss"` in CSS, not the old config file approach.
- The existing `src/index.css` has custom CSS variables and utility classes. USE them. Don't introduce new color values — use the existing tokens.
- The Header component is defined inline in App.tsx (not a separate file). You'll need to modify it there to add the "Work" nav link.
- Keep the page performant. No heavy animations. IntersectionObserver-based reveal animations are fine (match the existing pattern).
- The page should look impressive on a sales call when screen-shared — clean, organized, premium.
- Do NOT modify any existing pages or routes. Only ADD the /work route and WorkPage component, and add the nav link to the header.