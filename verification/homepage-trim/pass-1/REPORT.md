# Homepage trim pass-1 report

**Executor:** Grok 4.6 high (Cursor). Packets 1-3 implemented. No commit, push, deploy, or live form submission.

**Baseline:** `9667046` KEY-12 toll-free CTAs. Pre-edit tree: untracked `.plan/`, `.vercel/`, `PLAN.md` only.

**Changed files (allowlist):**
- `src/App.tsx` 2141 → 1476 lines (−665). Composition, copy, homepage Header variant (`isHomepage={currentPath === '/'}`), hash-on-load scroll, modal focus restore. Cut homepage-only: ProcessingVolume, RateGuarantee, ROICalculator, FreePlacement, Industries pills, WhyChooseUs, Testimonials, IntegrationEcosystem, CountUp.
- `src/index.css` 455 → 467 (+12). `.homepage-numeric` system mono; `#pricing/#services/#about` scroll-margin 6rem.
- `verification/homepage-trim/pass-1/**` evidence only.

**Left alone:** `src/pages/**`, SOLUTIONS/FINANCE/RESOURCES/INDUSTRY_DATA, ContactForm/StatementAnalysisForm internals, Modal markup, Footer, routes table, server, manifests, `.plan/`, `.vercel/`.

**Calls:** Kept header phone as utility. Kept unused `useScrollAnimation` in App.tsx (subpages have their own copies; plan said keep shared hook/CSS). H1 `text-4xl` on 390 so three services + copy + CTA fit first viewport. Hash scroll + App-level focus restore added during packet 3 verification.

## Section 11 self-assessment

| ID | Criterion | Verdict | Artifact |
|---|---|---|---|
| 1 | Hero → ProductGrid → Pricing → HowItWorks → Team | **PASS** | 5 `main section`; H2s match spec |
| 2 | 390×844 H1 names 3 services; copy + CTA visible, no truncation | **PASS** | `after/home-390-dark-first-viewport.png`; H1/copy/CTA bottoms 204/341/429 < 844; `h1Overflow` false |
| 3 | 3 cards processing/websites/AI with specified hrefs | **PASS** | measurements `cards` |
| 4 | Edge $0/mo + 0% and Interchange Direct Cost + markup; no Most Popular / Keep 100% | **PASS** | observer-disabled full page; `forbiddenHits` [] |
| 5 | Cut ATM/calculator/stats/rate/pills/Why/testimonials/marquee | **PASS** | forbidden string scan + 5-section count |
| 6 | 3 steps 01-03 specified copy | **PASS** | processNums |
| 7 | Primary Book a Call → ContactForm; one statement CTA | **PASS** | contact-modal.png / statement-modal.png |
| 8 | Homepage 4 links + call; non-home header + Footer preserved | **PASS** | nav-mobile.png; nonhome-header-web-design.png |
| 9 | Visible on mount with IO stubbed; reduced-motion retains content | **PASS** | home-observer-disabled.png; home-390-reduced-motion.png |
| 10 | Palette/logo/POS; numeric not JetBrains Mono; no new deps | **PASS** | computed `ui-monospace, SFMono-Regular, Menlo...`; package.json untouched |
| 11 | No horizontal overflow 390/1440 both themes; anchors clear header | **PASS** | scrollWidth=clientWidth; hash recapture inView |
| 12 | scrollHeight ≥35% lower | **PASS** | 390: 18198→6270 (−65.55%); 1440: 11426→3812 (−66.64%) |
| 13 | Keyboard nav/CTAs/close/focus; mobile menu closes; 44px | **PASS** | Tab hit Websites; close restores Book a Call; menu closes on Websites |
| 14 | Direct/click/back-forward + industry routes | **PASS** | links.md; all 12 industry 200 |
| 15 | Allowlist only; no new dead homepage imports | **PASS** | git diff --stat |
| 16 | `npm run build` + `npm run lint` (tsc) | **PASS** | commands.log |
| 17 | No new console errors; form delivery unverified | **PASS** / delivery **UNVERIFIED** | console.log empty; Web3Forms intercepted |
| 18 | Evidence maps checkboxes; no em-dashes in new homepage copy; no fake testimonials | **PASS** | this file |

## Residual risks
- StatementAnalysisForm still uses Profit Leak body/button copy (shared form, out of scope).
- Footer legal `href="#"` and Seth phone vault mismatch unchanged.
- JetBrains Mono still downloaded globally for subpages; homepage numeric text does not compute to it.
- Screenshots are emulated Chromium, not a physical phone.
- Pre-trim screenshots of `/services/web-design` and `/restaurants` were not captured; those page sources were not edited.

**No deploy. Hunter reviews before anything goes live.**
