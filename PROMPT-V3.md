# Rewrite All Copy on Services Page and Industry Page Template: Benefit-Driven, No Feature Listing

## Context

This is the Keystone Consulting Group website (keystoneconsultingg.com). We just rewrote the home page copy to follow benefit-driven copywriting principles (sell the benefit, not the product; use the "So What?" test; write like one friend talking to another; no corporate jargon). Now we need to do the same for the Services page and Industry page template.

## Copywriting Rules (NON-NEGOTIABLE)

These rules come from the marketing playbooks the company follows:

1. **Sell the benefit, never the product.** Don't describe what the thing IS. Describe what it DOES for the business owner. Use the "So What?" test: keep asking "so what?" until you hit the real benefit, then sell that.
2. **Good copy makes you think. Bad copy lists features.** Instead of "3D animated websites with scroll-driven animations," say "cinematic animations that make visitors stop scrolling and start engaging." Instead of "AI lead scoring and routing," say "AI agents that score, qualify, and route leads so your sales team only talks to people who are ready to buy."
3. **Write like one friend talking to another.** No corporate jargon. "Company X has been in business for X years providing excellent service" is bad. "You deal directly with the owners. Every time." is good.
4. **No em-dashes in published copy.** Use regular hyphens in compound words ("30-day," "high-volume") but never em-dashes (—) in any user-facing text. Replace em-dashes with periods, commas, or restructure the sentence.
5. **The headline is the whole game.** Every section heading should grab attention. "One System. Three Steps." was bad. "Find the Money. Fix the Leak. Grow." is good.
6. **Be specific.** Real numbers, real examples, real outcomes. Not "save money" but "save $2,000 a month." Not "faster checkout" but "process in under 2 seconds."
7. **It's always about the customer.** Never about you, the product, or the company. The reader should see themselves in every line.

## What to Rewrite

### File 1: `src/pages/ServicesPage.tsx`

Rewrite ALL copy in:

1. **SERVICES_DETAIL array** (lines 61-391): 10 service objects, each with:
   - `tagline`: one punchy sentence (the feeling/outcome)
   - `heroDesc`: 2-3 sentences max, benefit-driven, conversational
   - `sections` array (4 items each): each has `title` and `desc`. Rewrite every desc to sell the benefit.
   - `features` array: rewrite each feature string to be benefit-oriented, not feature-oriented

2. **ServicesPage component** (lines 399-587): page-level copy:
   - Hero heading: "Built to Grow. Engineered to Scale." (rewrite if better)
   - Hero subtitle: "Once we uncover your savings..." (rewrite)
   - Badge text: "The 'Grow' Step of Our System"
   - Final CTA heading: "Ready to Reinvest Your Savings Into Growth?"
   - Final CTA paragraph

3. **SingleServicePage component** (lines 592-711): any page-level copy (check and rewrite if needed)

### File 2: `src/pages/IndustryPageTemplate.tsx`

Rewrite ALL copy in:

1. **INDUSTRY_LANDING_PAGES object** (lines 35-335): 12 industry objects, each with:
   - `headline`: the H1. Make it punchy and benefit-driven.
   - `subheadline`: 1-2 sentences. Sell the outcome, not the features.
   - `solutionCards` array (6 items each): each has `title` and `desc`. Rewrite every desc.
   - `features` array (3 items each): each has `title` and `desc`. Rewrite every desc.
   - `benefits` array: rewrite each benefit string to be benefit-oriented
   - `painPoints` array: rewrite to be specific and relatable
   - `solutions` array: rewrite to directly address the pain points
   - `testimonial.quote`: rewrite to sound like a real person talking, not marketing copy

2. **Template component** (lines 340-595): page-level copy:
   - Section headings like "Everything Your X Business Needs" (line 397)
   - "From payment processing to marketing..." (line 397)
   - "Why X Businesses Choose Keystone" (line 449)
   - "Every feature, every service..." (line 451)
   - "The Problems You're Facing — And How We Fix Them" (line 467)
   - Calculator section: "Calculate Your Savings" (line 501), "See how much you could save..." (line 502)
   - "You save $X per month" text (line 528-529)
   - Bottom CTA: "Ready to Upgrade Your X Business?" (line 567), "Get a free, no-obligation analysis..." (line 569)

## Examples of Good vs Bad Copy (from the home page rewrite we just did)

| Bad (feature-listing) | Good (benefit-driven) |
|------------------------|----------------------|
| "Full property management listing website with searchable rental inventory." | "Rentals fill faster when tenants can browse, filter, and apply online. No phone tag, no empty units sitting on the market for weeks while the phone never rings." |
| "Professional services website built for credibility and clean lead capture." | "When referrals aren't enough, this site makes cold prospects feel like they already know you. Clean design that earns trust before the first conversation ever happens." |
| "Custom internal operations dashboard with Kanban board, project tracking, and Firestore integration." | "Every project, client, and deadline in one place. We built this to run our own agency. Now we can build one shaped around how your team actually works." |
| "Super SEO and AEO-driven dealer site with 33 pages of optimized content." | "33 pages built to rank. When someone searches 'AT&T fiber near me,' this site shows up. Organic leads from Google, not paid ad spend." |
| "We Find Hidden Profit in Your Business." | "Stop Losing Money to Hidden Fees." |
| "One System. Three Steps." | "Find the Money. Fix the Leak. Grow." |
| "Transparent Pricing. Maximum Savings." | "Stop Paying to Get Paid." |

## Important Technical Notes

- **Do NOT change any code structure, JSX, CSS classes, imports, component logic, or props.** Only change string content inside the data arrays and JSX text.
- **Do NOT change any `id`, `icon`, `linkTo`, `calculatorDefault`, or other non-text fields.** Only rewrite the human-readable copy strings.
- **Keep apostrophes and quotes properly escaped.** The data uses single quotes and escaped apostrophes (`\'`). Match the existing escaping pattern.
- **No em-dashes (—) anywhere in the output.** Use periods, commas, or regular hyphens only.
- **Run `npm run build` and `npx tsc --noEmit` after changes.** Both must pass with zero errors.

## Verification

After writing:
1. Run `npm run build` — must succeed with zero errors
2. Run `npx tsc --noEmit` — must pass with zero errors
3. Read back a sample of the rewritten copy to verify quality

## File Paths

- Project root: `/tmp/kcg-portfolio-build/`
- Services page: `src/pages/ServicesPage.tsx`
- Industry template: `src/pages/IndustryPageTemplate.tsx`
- CSS (read only, do not modify): `src/index.css`