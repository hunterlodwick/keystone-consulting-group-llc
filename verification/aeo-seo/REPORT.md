# KCG nationwide AEO + SEO implementation report

Local work only on branch `aeo-seo-push`. Content reviewed October 28, 2026. No deployment, push, git configuration change, outreach, booking, or form submission was performed. Git had no configured author identity, so the local commit uses one-command author/committer environment variables identifying Codex <codex@local.invalid>; no existing identity or git config was changed.

## Delivered

42 new static routes: one hub, four service pillars, 26 answer-first question pages, four neutral comparisons, and seven distinct state guides. Existing service, industry, work, dashboard, privacy, and terms routes remain available. New homepage, desktop/mobile navigation, and footer links lead to the hub.

Every question starts with a 40-60 word answer. The build enforces that range, unique slugs, valid related links, and no em dashes in the new content. Each page has a top CTA, an inline CTA, related reading, breadcrumbs, and the existing ContactForm at the close, plus a link to the existing booking section. KCG's nationwide service is explicit.

The new light/dark page styling uses the existing teal palette, serif headings, and contact form. The static form stays disabled until JavaScript initializes to prevent a native GET submission; a no-JavaScript telephone fallback remains available. No new lead-processing endpoint was created.

## Architecture and routing

- Typed content: `src/content/guides.ts`, `guide-questions.ts`, `guide-comparisons.ts`, `guide-states.ts`, and `guide-sources.ts`.
- Shared renderer: `src/pages/GuidesPage.tsx`; shared metadata/schema: `src/content/guide-seo.ts`.
- `scripts/prerender.tsx` builds the same React content through Vite's server module loader, which handles the existing CSS imports. React effects do not run during prerendering. Existing legal rendering is preserved; the old prerender entry point delegates to the generalized script.
- Every new route gets its own `dist/guides*.html` file with visible content, title, description, canonical, OG and Twitter tags, and JSON-LD. Schema includes Organization, WebSite, BreadcrumbList, Article/dateModified, Service on pillars, and FAQPage matching the visible FAQ. The hub has CollectionPage schema.
- Exact rewrites in `vercel.json` precede the SPA catch-all. The build checks that the first matching exact/fallback rule selects each static file. No Vercel CLI was run. Actual hosted routing remains untested because deployment was prohibited.
- Navigation across guide routes uses normal document navigation so page-specific head tags cannot leak onto existing SPA pages. The shared SPA's modifier-click behavior is preserved. Existing routes retain their original rendering approach.
- Generated `dist/sitemap.xml` lists all 71 canonical routes with lastmod. New content dates are editorial dates; existing page dates derive from the source file's git history. Redirect aliases are not duplicate sitemap entries.
- Generated `dist/robots.txt` explicitly allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, and Bingbot, plus the default agent. Generated `dist/llms.txt` summarizes KCG and links key guides. No assertion is made that bots will use that optional file or that access guarantees citation.
- Build outputs are ignored by git and reproduced with `npm run build`. When adding a guide later, add its exact rewrite before the catch-all; the build deliberately fails if it is missing.

## Research and claim boundaries

Read [QUESTIONS.md](QUESTIONS.md) for the buyer-question evidence and editorial map, and [SOURCES.md](SOURCES.md) for every factual source and URL. Forum excerpts informed questions only. Factual legal, network, Google, AI-search, and competitor statements use official sources. No PAA extraction, search-volume measurement, or original customer research is claimed.

Only the supplied KCG offer facts are stated: the Fluid Pay plan is $30/month with no contract, next-day funding is available, and Flexxbuy is an option for BNPL/customer financing. The plan price is explicitly not represented as all-in processing cost. No internal rates, residuals, customer results, testimonials, or website price ranges were added.

Comparisons cite Stripe, Square, and Clover's own public pricing pages and display “As of Oct 2026, check current.” They explain scope differences without declaring a winner or claiming savings. Stripe's published domestic online-card rate is identified as a transaction rate, distinct from the Fluid Pay monthly plan.

Visa's current source confirms the lower of applicable MDR or 3%, debit/prepaid exclusions, 30-day acquirer notice, and disclosures. The content does not repeat an unverified historical cap-change date. Mastercard's current registration page suspends US web registration while its older summary still describes notice. Both are cited, with written acquirer confirmation requested rather than a blanket registration claim.

California's guide distinguishes SB 478's all-in mandatory-price rule from optional card fees, explains the credit-only case, and identifies the SB 1524 food-service exception. Legal pages carry a clear “Not legal advice” note. Seven state pages exist because official sources support different implementation requirements: CA, CT, MA, ME, CO, NY, NJ.

The national table includes all 50 states plus DC. The other 44 entries explicitly say they were not separately reviewed, rather than inventing a permitted/prohibited classification. Oklahoma's search did not establish a current official interpretation sufficient for a page. This is not a complete fifty-state legal opinion.

Google's FAQ rich-result restrictions and lack of a special AI schema/file requirement are explained. OpenAI search access and training crawlers are distinguished, with no placement guarantee. AI workflow pages are evaluation recommendations, not evidence of KCG product performance or legal compliance.

Existing site copy and inherited header/footer marketing were not substantively audited or rewritten. No claim is made that all pre-existing marketing statements have been verified by this project.

## Verification

- `npm run build`: passes; 42 guide routes and two existing legal pages rendered.
- `npm run lint`: passes (the repository's TypeScript no-emit check).
- Local preview: `npx vite preview --host 127.0.0.1 --port 4180 --strictPort`.
- `npm run verify:seo`: checks every new URL returns HTTP 200 and exactly matches its generated HTML rather than the SPA fallback. Validates h1, descriptions, canonical, OG/Twitter values, parsed JSON-LD, visible FAQ/schema parity, all section copy, CTAs/forms, disabled no-JS form behavior, sitemap completeness, robots directives, and llms links. It checks 259 distinct internal destinations including fragment targets on rendered existing pages. It also checks all 29 existing route URLs return 200.
- Explicit curl checks of the hub, payment pillar, Stripe migration, and California guide are saved in [curl-checks.txt](curl-checks.txt).
- `npm run verify:seo-browser`: 84 responsive checks across all 42 routes at 1440 and 390 pixels, with no horizontal viewport overflow, correct document metadata, enabled interactive contact fields, working contact anchors, and no browser exceptions. Tests guide-to-guide and guide-to-home navigation, dark theme, and smoke-loads all 29 existing routes. It does not submit forms or test live booking availability.
- Machine-readable evidence: [static-checks.json](static-checks.json) and [browser-checks.json](browser-checks.json).
- Screenshot evidence: hub, Stripe migration question, Stripe comparison, and California state page at both widths; additional dark-theme and contact-section captures. Screenshots are viewport captures, with separate contact captures for the closing section. Third-party browser requests and booking API requests were blocked during verification. Research reads were performed separately.
- `git diff --check`: passes.

The build reports a non-failing main-bundle size warning (approximately 577 kB minified, 173 kB gzip). All static content remains available without that bundle. No performance score or search-ranking improvement is claimed.

## Owner review before any future publication

1. Approve the published offer scope and spelling: owner wording “Flexxbuy” is retained; the official provider site styles its name “Flexxbuy.” Confirm intended provider branding and applicable program.
2. Have legal counsel/acquirer review the surcharge and discount implementations, state summaries, proposed disclosures, and Mastercard's current notification process. Recheck state and network sources at launch, especially unreviewed states. The pages do not approve any merchant's pricing setup.
3. Recheck competitor pricing and terms against the linked pages, and approve the neutral comparison copy as a dated snapshot.
4. Confirm receiving-provider migration capabilities, recurring workflows, equipment compatibility, next-day funding eligibility, and all-in proposal terms before making merchant-specific commitments. Those capabilities are framed as questions rather than assumed promises here.
5. Review the actual form/booking delivery in a separately authorized live test. This task verified rendering and navigation only and intentionally submitted nothing.
6. Approve publication separately. This local commit is not deployment authorization. Production routing, Search Console submission, Google/AI crawling, indexing, citations, and conversion results have not been tested or initiated.

## New routes

- `/guides` (hub)

### Pillar pages

- `/guides/payment-processing`: A business owner’s guide to payment processing
- `/guides/business-websites`: Choose a website around the next customer decision
- `/guides/ai-automation`: Evaluate AI automation and voice agents for your business
- `/guides/local-seo`: A practical guide to Google Business Profile and local SEO

### Question pages

- `/guides/dual-pricing-laws`: Is dual pricing legal?
- `/guides/surcharge-vs-cash-discount`: What is the difference between a surcharge and a cash discount?
- `/guides/surcharge-debit-cards`: Can I surcharge debit cards?
- `/guides/surcharge-cap`: How much can a business surcharge a credit card?
- `/guides/surcharge-notice`: Do I need to register or give notice before surcharging?
- `/guides/switch-from-stripe`: How do I switch from Stripe without losing recurring billing?
- `/guides/recurring-billing-checklist`: What should I check before choosing recurring billing?
- `/guides/next-day-funding`: What is next-day funding?
- `/guides/small-business-bnpl`: Can a small business offer buy-now-pay-later?
- `/guides/embedded-checkout`: What is an embedded checkout?
- `/guides/no-contract-processing`: What should I check in a no-contract payment plan?
- `/guides/website-cost`: How much does a small business website cost?
- `/guides/website-scope`: What should a small business website include?
- `/guides/website-ownership`: Who should own my domain and website accounts?
- `/guides/website-leads`: Why does my website get visits but few enquiries?
- `/guides/ai-voice-agents`: Do AI voice agents work for service businesses?
- `/guides/ai-human-handoff`: When should an AI voice agent transfer to a person?
- `/guides/first-automation`: What should a small business automate first?
- `/guides/ai-crm-integration`: What should I check before connecting an AI agent to my CRM?
- `/guides/measure-ai-pilot`: How do I measure whether an AI pilot is worth keeping?
- `/guides/google-map-pack`: How do I rank in Google’s map pack?
- `/guides/service-area-profile`: Can a service-area business use Google Business Profile?
- `/guides/google-reviews`: How can I get more Google reviews without breaking the rules?
- `/guides/chatgpt-recommendations`: How do I get my business recommended by ChatGPT?
- `/guides/ai-search-seo`: Does AI search need different SEO or special markup?
- `/guides/faq-schema`: Will FAQ schema get my business rich results or AI citations?

### Comparison pages

- `/guides/fluid-pay-vs-stripe`: KCG / Fluid Pay vs Stripe: what to compare
- `/guides/fluid-pay-vs-square`: KCG / Fluid Pay vs Square: compare the workflow
- `/guides/fluid-pay-vs-clover`: KCG / Fluid Pay vs Clover: separate hardware from processing
- `/guides/stripe-recurring-alternatives`: Stripe alternatives for recurring billing: a buyer’s checklist

### State pages

- `/guides/california-dual-pricing`: California: dual pricing and credit-card surcharge rules
- `/guides/connecticut-dual-pricing`: Connecticut: dual pricing and credit-card surcharge rules
- `/guides/massachusetts-dual-pricing`: Massachusetts: dual pricing and credit-card surcharge rules
- `/guides/maine-dual-pricing`: Maine: dual pricing and credit-card surcharge rules
- `/guides/colorado-dual-pricing`: Colorado: dual pricing and credit-card surcharge rules
- `/guides/new-york-dual-pricing`: New York: dual pricing and credit-card surcharge rules
- `/guides/new-jersey-dual-pricing`: New Jersey: dual pricing and credit-card surcharge rules
