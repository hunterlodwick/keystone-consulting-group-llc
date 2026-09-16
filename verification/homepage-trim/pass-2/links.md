# Homepage trim pass-2 link matrix

Current: `http://localhost:4173` (reused vite preview). Reconstructed baseline: `http://127.0.0.1:4174` at commit `9667046`. Emulated Chromium. No live Web3Forms posts.

## Criterion 14 routes

| Route | Direct load | Internal click | Back | Forward |
|---|---|---|---|---|
| `/` | 200, H1 three services | Logo from `/services/web-design` → `/` | back to web-design | forward to `/` |
| `/#pricing` | 200, pricing H2 top 176.94 > header 69 | Homepage **Processing** click → `#pricing`, headingTop 176.94 | back `/` | forward `#pricing` |
| `/#about` | 200, about H2 top 176.44 > header 69 | Homepage **About** click → `#about`, headingTop 176.44, `aboutVisible` true | back `/` | forward `#about` |
| `/services` | 200, H1 services catalog | Footer first `/services#…` link → `/services#web-design` | back `/` | forward `/services#web-design` |
| `/services/web-design` | 200, H1 Custom Web Design | Homepage **Websites** | back `/` | forward web-design |
| `/services/automations` | 200, H1 AI & Automations | Homepage **AI Automations** | back `/` | forward automations |
| `/services/consumer-financing` | 200, H1 Consumer Financing | Non-home Financial Services dropdown → Consumer Financing | back web-design | forward consumer-financing |
| `/restaurants` | 200, restaurant H1 | Non-home Industries dropdown → Restaurants | back web-design | forward `/restaurants` |

Raw: `link-results.json` `clickResults` + `linkMatrix`.

## Industry direct-load (all 12)

All HTTP 200, distinct H1, non-home dropdown header labels present:

`/restaurants` `/grocery` `/healthcare` `/ecommerce` `/salons` `/auto-repair` `/gas-stations` `/high-risk` `/nonprofits` `/b2b` `/real-estate` `/retail`

## Reconstructed baseline vs current (non-home header)

| Shot | Baseline 9667046 @ 4174 | Current @ 4173 |
|---|---|---|
| `/services/web-design` 1440 dark full-page | `reconstructed-baseline-services-web-design-1440-dark.png` | `after/services-web-design-1440-dark.png` |
| `/restaurants` 1440 dark full-page | `reconstructed-baseline-restaurants-1440-dark.png` | `after/restaurants-1440-dark.png` |
| Financial Services dropdown | `reconstructed-baseline-web-design-financial-dropdown.png` | `after/current-web-design-financial-dropdown.png` |
| Industries dropdown | `reconstructed-baseline-web-design-industries-dropdown.png` | `after/current-web-design-industries-dropdown.png` |
| `/restaurants` 390 mobile menu | `reconstructed-baseline-restaurants-mobile-menu.png` | `after/current-restaurants-mobile-menu.png` |

`measurements.json` `headerCompare.navEqual` = true. Dropdown open: `financialOpen` / `industriesOpen` / `mobileAccordion` true on both. Body copy on service/industry pages may differ from 9667046 because of the authorized subpage de-slop; this comparison is for header dropdown/mobile behavior.

## Homepage nav (current)

| Control | Target | Click result |
|---|---|---|
| Processing | `/#pricing` | PASS, heading clears 69px header |
| Websites | `/services/web-design` | PASS |
| AI Automations | `/services/automations` | PASS |
| About | `/#about` | PASS (was n/a in pass-1) |
| Book a Call | ContactForm | PASS keyboard.json |
| Get a Free Statement Analysis | StatementAnalysisForm | PASS keyboard.json |

Mobile 390: menu closes after About and Processing hash clicks (`keyboard.json` `mobileHashMenuClose`).

## CTAs / forms

Empty submit not re-posted. Network to `api.web3forms.com/submit` not sent this pass. Delivery **UNVERIFIED**.
