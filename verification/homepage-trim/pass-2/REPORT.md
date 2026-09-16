# Homepage trim pass-2 report

**Executor:** Grok 4.6 high (Cursor). Pass 2 of 3. Four Astra review-1 tickets only. No commit, push, deploy, or live form submission.

**Baseline commit:** `9667046` KEY-12 toll-free CTAs. Reconstructed baseline served from git worktree `/tmp/kcg-baseline-9667046` on `http://127.0.0.1:4174`. Current preview reused: `http://localhost:4173`.

**Pass-1 files:** not modified.

**Changed application files this pass:** `src/App.tsx` only (plus retained uncommitted pass-1 `src/index.css` and subpage de-slop in `src/pages/*`).

## Tickets

| Ticket | Verdict | Artifact |
|---|---|---|
| 1 Mobile-menu focus restore + dialog entry | **PASS** | `keyboard.json`: mobile Book a Call open focuses `#modal-close-btn` (`inDialog` true); Tab stays in dialog (`#firstName`); close via Enter returns `#mobile-menu-toggle` `aria-label=Open menu`, `isBody=false`. Desktop hero/header ContactForm and StatementAnalysisForm (desktop + 390) return to the connected trigger. |
| 2 Delete App-local `useScrollAnimation` | **PASS** | `rg useScrollAnimation src/App.tsx` empty. Copies remain in `ServicesPage.tsx` / `IndustryPageTemplate.tsx`. |
| 3 Remove new homepage CTA glow | **PASS** | Hero/Pricing/Team Book a Call computed `box-shadow: none` on hover (`measurements.json` `hoverShadows`). Header homepage glow class kept. IndustrySplash glow untouched. |
| 4 Evidence pack | **PASS** with labeled UNVERIFIED | This directory. Live Web3Forms delivery **UNVERIFIED**. |

## Section 11 self-assessment

| ID | Criterion | Verdict | Artifact |
|---|---|---|---|
| 1 | Five sections Hero → ProductGrid → Pricing → HowItWorks → Team | **PASS** | `measurements.json` `after.home-390-dark.sectionCount` = 5; `h2s` match spec |
| 2 | 390×844 H1 + copy + CTA in first viewport | **PASS** | `after/home-390-dark-first-viewport.png`; H1/copy/CTA bottoms 204 / 341 / 429; `inFirstViewport` true |
| 3 | Three cards processing / websites / AI | **PASS** | `measurements.json` `cards` |
| 4 | Edge + Interchange Plus retained | **PASS** | `forbiddenHits` []; observer-disabled full page |
| 5 | Cut sections absent | **PASS** | forbidden string scan |
| 6 | Three process steps | **PASS** | `processNums` |
| 7 | Book a Call → ContactForm; one statement CTA | **PASS** | `after/contact-modal.png`, `after/statement-modal.png`; `keyboard.json` |
| 8 | Homepage 4 links; non-home header preserved | **PASS** | Homepage `nav-mobile.png`. Non-home dropdowns match reconstructed baseline: `headerCompare.navEqual` true; `reconstructed-baseline-web-design-financial-dropdown.png` vs `after/current-web-design-financial-dropdown.png`; industries + restaurants mobile accordion also captured. Subpage body copy may differ from 9667046 because of the authorized de-slop; header labels/open behavior match. |
| 9 | Visible on mount / reduced motion | **PASS** | `after/home-observer-disabled.png`, `after/home-390-reduced-motion.png` |
| 10 | Palette / POS / numeric not JetBrains Mono | **PASS** | `numericFontFamily` system mono; font-load `status=loaded` |
| 11 | No overflow; anchors clear header | **PASS** | `overflowX` false at 390/1440 both themes. Anchors: 390 pricing headingTop 160.9 / about 159.7 vs headerBottom 69; 1440 176.9 / 176.4. `anchorClearance` |
| 12 | scrollHeight ≥35% lower | **PASS** | 390: 18198→6270 (−65.55%); 1440: 11426→3812 (−66.64%). Fonts loaded. Same theme/zoom/menu closed. |
| 13 | Keyboard open/close/return-focus; menu closes; 44px | **PASS** | `keyboard.json` (not mouse-only). Mobile hash-link closure About + Processing. Homepage Book a Call / nav `min-h-[44px]`. |
| 14 | Direct / click / back-forward + industry direct-load | **PASS** | `links.md`, `link-results.json`. About click recorded: `http://localhost:4173/#about`, headingTop 176.44. All 12 industry routes 200 with distinct H1s. |
| 15 | Allowlist; no new dead App hook | **PASS** | App-local `useScrollAnimation` removed. Pages de-slop predates this pass and was left intact. |
| 16 | `npm run build` + `npm run lint` | **PASS** | `commands.log` |
| 17 | No new console errors; form delivery | **PASS** / delivery **UNVERIFIED** | `console.log`; no Web3Forms POST |
| 18 | Evidence maps checkboxes; no em-dashes in new homepage copy | **PASS** | this file; slop 25/25 at 5/5 |

## Header scoping (ticket 4)

Shared Header min-height / focus classes added in pass 1 are now `isHomepage`-gated. Non-home desktop Book a Call restored to baseline `hover:scale-[1.02] hover:shadow-[...]`. Non-home mobile toggle/phone/menu CTA restored to baseline classes. Homepage keeps 44px targets.

## Residual / UNVERIFIED

- Live form delivery **UNVERIFIED** (no submissions).
- StatementAnalysisForm still uses Profit Leak body/button copy (shared form, out of scope).
- Footer legal `href="#"` and Seth phone vault mismatch unchanged.
- JetBrains Mono still downloaded globally; homepage numeric text does not compute to it.
- Screenshots are emulated Chromium, not a physical phone.
- Header desktop glow computed-style on hover in Playwright was an empty stacked shadow; source still contains the pre-existing header `hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]` utility. Hero/pricing/team computed `none`.

**No deploy. Hunter reviews before anything goes live.**
