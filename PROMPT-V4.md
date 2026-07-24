# Finish Copy Rewrite: Remaining Services + Industry Template + Page-Level Copy

## Context

The Keystone Consulting Group website (keystoneconsultingg.com) is being rewritten with benefit-driven copy. The home page is done. The first 3 services in ServicesPage.tsx (web-design, crm, automations) are done. Now you need to finish:

1. The remaining 7 services in the SERVICES_DETAIL array in ServicesPage.tsx (consulting, prep-to-sell, seo, google-business, bpo, consumer-financing, business-loans, pos-placement)
2. The page-level copy in ServicesPage.tsx (hero, final CTA, section labels)
3. The ENTIRE IndustryPageTemplate.tsx (12 industry objects + template page-level copy)

## Copywriting Rules (NON-NEGOTIABLE)

1. **Sell the benefit, never the product.** Describe what it DOES for the business owner, not what it IS. Use the "So What?" test.
2. **Good copy makes you think. Bad copy lists features.** No feature lists. Every description should paint a picture of the outcome.
3. **Write like one friend talking to another.** No corporate jargon. Conversational, direct, honest.
4. **No em-dashes (—) in published copy.** Use periods, commas, or regular hyphens only. This is critical.
5. **The headline is the whole game.** Every section heading should grab attention.
6. **Be specific.** Real numbers, real examples, real outcomes.
7. **It's always about the customer.** Never about you, the product, or the company.

## Examples of the Rewrite Quality (already done - match this tone)

| Before (feature-listing) | After (benefit-driven) |
|--------------------------|------------------------|
| "Websites that work as hard as you do." | "Your website should be your best salesperson." |
| "We don't build templates. We build immersive, high-performance digital experiences..." | "Most sites sit there looking nice while the phone stays quiet. We build the other kind. The kind that stops the scroll, answers questions at 2 AM, and books the appointment before you ever pick up the phone." |
| "Stand out from every competitor in your industry with cinematic, scroll-driven animations..." | "You get about three seconds before a visitor bounces. Animations that move as they scroll buy you the next thirty. By then they've stopped comparing you to the other three tabs they have open." |
| "Stop doing manually what a machine can do better." | "Stop paying people to do what software does for free." |
| "24/7 intelligent support without the payroll. AI agents that handle common questions..." | "The same eight questions, all day, every day. An AI agent handles them at midnight on a holiday, solves what it can, and passes you only the ones that need a human. No new hire, no payroll." |

## What to Do

### Part 1: ServicesPage.tsx — Remaining 7 services

Read the file first. The first 3 services (web-design, crm, automations) are ALREADY DONE. Do not touch them. Rewrite the remaining services starting from `id: "consulting"` through `id: "pos-placement"`:

For each service, rewrite:
- `tagline`: one punchy sentence (the outcome/feeling)
- `heroDesc`: 2-3 sentences, benefit-driven, conversational, no em-dashes
- `sections` array (4 items): each `desc` should sell the benefit, not list features
- `features` array: rewrite each to be benefit-oriented

### Part 2: ServicesPage.tsx — Page-level copy

Find and rewrite:
- Badge text: `The "Grow" Step of Our System` (line ~423) — make it more benefit-driven
- Hero heading: `Built to Grow. Engineered to Scale.` (line ~426-427) — rewrite if you can do better
- Hero subtitle: `Once we uncover your savings, these are the systems we help you reinvest into. Every service is part of one unified growth engine — not a disconnected menu.` (line ~430) — no em-dashes, more conversational
- Final CTA heading: `Ready to Reinvest Your Savings Into Growth?` (line ~564)
- Final CTA paragraph: `Every dollar we save you on processing fees is a dollar you can put into the systems that scale your business. Let's talk about what that looks like for you.` (line ~566)
- "What's Included" label (line ~545) — rewrite if better

### Part 3: IndustryPageTemplate.tsx — All 12 industries

Rewrite ALL copy in the INDUSTRY_LANDING_PAGES object. 12 industries: restaurants, grocery, healthcare, ecommerce, salons, auto-repair, gas-stations, high-risk, nonprofits, b2b, real-estate, retail.

For each industry, rewrite:
- `headline`: punchy, benefit-driven H1
- `subheadline`: 1-2 sentences selling the outcome
- `solutionCards` (6 items): each `desc` should sell the benefit
- `features` (3 items): each `desc` should sell the benefit
- `benefits` array: rewrite each to be benefit-oriented
- `painPoints` array: make specific and relatable
- `solutions` array: directly address the pain points
- `testimonial.quote`: sound like a real person, not marketing copy

Then rewrite the template-level copy:
- "Everything Your X Business Needs" heading
- "From payment processing to marketing..." subtitle
- "Why X Businesses Choose Keystone" heading
- "Every feature, every service..." subtitle
- "The Problems You're Facing — And How We Fix Them" heading (NO EM-DASH)
- "Calculate Your Savings" heading
- "See how much you could save by switching to Keystone" subtitle
- "You save $X per month" / "That's $X back in your pocket every year" text
- "Ready to Upgrade Your X Business?" CTA heading
- "Get a free, no-obligation analysis..." CTA paragraph

## Technical Rules

- **Only change string content.** Do NOT change any code structure, JSX, CSS, imports, component logic, props, id fields, icon fields, linkTo fields, calculatorDefault values, or any non-text data.
- **Keep apostrophes properly escaped.** Match the existing escaping pattern (backslash before apostrophes inside single-quoted strings).
- **No em-dashes (—) anywhere.** Use periods, commas, or regular hyphens.
- **Run `npm run build` and `npx tsc --noEmit` after all changes.** Both must pass.

## File Paths

- Project root: `/tmp/kcg-portfolio-build/`
- Services page: `src/pages/ServicesPage.tsx`
- Industry template: `src/pages/IndustryPageTemplate.tsx`