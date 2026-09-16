# Homepage trim pass-1 link matrix

Preview: `http://127.0.0.1:4173` (vite preview, emulated Chromium). No live Web3Forms posts.

## Homepage nav (route-derived `currentPath === '/'`)

| Control | Target | Expected | Direct load | Click | Back/forward |
|---|---|---|---|---|---|
| Logo | `/` | Home | 200, H1 three services | n/a | n/a |
| Processing | `/#pricing` | Pricing H2 in view, not under header | PASS after hash-on-mount (`headingTop` 177, `inView` true) | PASS `pricingInView` true | n/a |
| Websites | `/services/web-design` | SingleServicePage Custom Web Design + non-home dropdown header | 200, H1 Custom Web Design | PASS | Back to home H1, forward to Custom Web Design |
| AI Automations | `/services/automations` | SingleServicePage AI & Automations | 200, H1 AI & Automations | PASS | n/a |
| About | `/#about` | Team H2 in view | PASS (`inView` true, scrollY 2444) | n/a | n/a |
| Book a Call (header/hero/pricing/team) | ContactForm modal titled `Book a Call` | Same title, shared form | n/a | PASS | n/a |
| Theme toggle | localStorage `kcg-theme` | Preserved | Dark/light captures exist | Toggle present | n/a |

Mobile menu (390): Processing, Websites, AI Automations, About, Book a Call. Closes after Websites click (`arrived` `/services/web-design`, menu closed). Touch heights: nav links >=44px, Book a Call 48px. Phone `(866) 667-5219` kept as existing utility chrome (call: not a competing funnel).

Non-home header (`/services`, `/services/web-design`, `/restaurants`): Financial / Marketing / Operating / Industries dropdowns + About + Contact. See `after/nonhome-header-web-design.png`, `after/restaurants.png`.

## Product cards

| Card | href | Result |
|---|---|---|
| Credit Card Processing | `/#pricing` | Hash scroll to Edge + Interchange Plus |
| Website Builds | `/services/web-design` | Custom Web Design page |
| AI Automations | `/services/automations` | AI & Automations page |

## CTAs

| Surface | Label | Opens |
|---|---|---|
| Header, hero, below pricing cards, below owners | Book a Call | ContactForm, title Book a Call |
| Pricing only, quiet text | Get a Free Statement Analysis | StatementAnalysisForm, title Get a Free Statement Analysis |

Empty submit hits HTML `required` (contact `valueMissing` true, statement `valueMissing` true). Network to `api.web3forms.com/submit` intercepted; delivery **UNVERIFIED**. Shared form internals still say Profit Leak (PLAN residual).

## Preserved routes (direct load 200, distinct H1)

`/`, `/services`, `/services/web-design`, `/services/automations`, `/services/consumer-financing`, `/restaurants`, `/grocery`, `/healthcare`, `/ecommerce`, `/salons`, `/auto-repair`, `/gas-stations`, `/high-risk`, `/nonprofits`, `/b2b`, `/real-estate`, `/retail`.

Subpage before-shots were not taken pre-edit. Those files were not modified; post-trim screenshots show original dropdown header + original page copy.

## Footer

Unchanged. Industry splash, services catalog, finance, legal `href="#"` residual remains.
