---
status: active
project: kcg
type: log
---
# Homepage trim v2 — pass 1

Baseline: `main` @ `90c3346`. No commit, no push, no deploy. Preview: `http://127.0.0.1:4174`.

## Files changed (source)

| Path | What |
|---|---|
| `src/App.tsx` | Cut RateGuarantee + Testimonials from MainLandingPage. ProductGrid uses `HOMEPAGE_PRODUCTS` (3 cards). ATM card removed; FreePlacement 2-col. Pricing gets Consumer Financing / Flex Buy bullets. Theme fallback `'light'`. |
| `src/pages/IndustryPageTemplate.tsx` | Removed 12 `testimonial` fields + render block + unused `QuoteIcon`. |
| `src/index.css` | Untouched. Light mode on kept sections was readable; no scoped fix. |

`git diff --stat HEAD`: 2 source files, +53 / −56.

## Acceptance

| Criterion | Result | Evidence |
|---|---|---|
| MainLandingPage order: Hero → ProcessingVolume → HowItWorks → Pricing → ROICalculator → ProductGrid(3) → FreePlacement(2) → Industries → WhyChooseUs → IntegrationEcosystem → Team | **PASS** | `assertions.json` `section-order`. H2 sequence: HowItWorks / Pricing / ROI / ProductGrid / Industries / Why Keystone / Team. ProcessingVolume present as `$0+` h2 (counter still at 0 at capture). IntegrationEcosystem is an `h3`. RateGuarantee + Testimonials h2s absent. |
| No "ATM" on rendered homepage | **PASS** | `no-atm`; homepage innerText has no `\bATM\b`. ATM card gone. |
| No testimonial block on industry routes | **PASS** | `/restaurants` and `/high-risk`: no quoted block, no Maria R. / Alex P. / Bella's / Green Leaf. After shot: `after/restaurants-1440.png`. Before: `before/restaurants-1440.png`. Remaining 10 industries share the same template with fields removed. |
| Team photos `/team/seth.jpg` + `/team/hunter.jpg` | **PASS** | DOM img src. Visual: `after/light-sections/about.png`. Team internals not edited. |
| `hero-pos-float` present; calculator slider works | **PASS** | Class in DOM at 1440. Slider 50000 → 80000. POS column is `hidden lg:block` (pre-existing); not visible at 390. |
| `/work` 8 projects; header Work link | **PASS** | 8 article titles in DOM. Header `a[href="/work"]`. Shot: `after/work-1440.png`. |
| Fresh visitor light; toggle persists dark | **PASS** | Empty localStorage → `data-theme=light`. Toggle → `dark` in attr + localStorage. Revisit with saved dark → dark. |
| Pricing Flex Buy / consumer-financing bullets | **PASS** | Heading + Flex Buy line + 3 bullets ($100K, paid in full upfront, helps close big tickets). Shot: `after/light-sections/pricing.png`. Did **not** add PLAN's "~30% higher close rates" (executor brief: no invented numbers). |
| ProductGrid exactly 3 cards, order processing / websites / AI | **PASS** | Titles: Credit Card Processing, Website Builds, AI Automations. Links `/#pricing`, `/services/web-design`, `/services/automations`. Shot: `after/light-sections/services.png`. SOLUTIONS_DATA not mutated (footer still lists all services). |
| `npm run build` + `npm run lint` | **PASS** | `build.log` BUILD_EXIT:0. `lint.log` LINT_EXIT:0 (tsc --noEmit). Console on `/` and `/restaurants`: empty. |
| Homepage SlopMonster 5/5 | **FAIL (flag, kept copy)** | `slopmonster.txt`: 4/5, `rule-of-three list (websites, tools, and systems)` in **kept** hero body. Per plan: do not rewrite kept sections. New copy (financing + processing card) was not the hit. |
| Diff scope | **PASS** | Source diff is App.tsx + IndustryPageTemplate.tsx only. No index.css. |

## Screenshots

Before: `verification/homepage-trim2/pass-1/before/` (home 1440/390 light+dark, restaurants, work).
After: `verification/homepage-trim2/pass-1/after/` (same + `light-sections/` crops).

## Light mode

Checked Hero, Pricing (incl. new financing block), ProductGrid, Team at 1440 light. Text/borders readable. Team logo watermark still overlays owner photos (pre-existing; Team is do-not-touch). No index.css change.

## Flags

1. SlopMonster 4/5 on kept hero "websites, tools, and systems".
2. `RateGuarantee` and `Testimonials` function bodies still in `App.tsx` but are not rendered (composition cut only).
3. ProcessingVolume screenshot often shows `$0+` because the count-up has not finished at capture time (pre-existing).
4. Website Builds card has no image (same as the old SOLUTIONS_DATA web-design card). Processing and Automations keep existing images.
5. Hero POS widget hidden below `lg` (pre-existing).
6. Local preview only. No commit / deploy.

## Calls made

Routine: PLAN.md + App/Industry sources; before shots on unmodified dist; scoped edits; rebuild; Playwright asserts; SlopMonster; light-section crops; vault checkpoint. No form submits.
