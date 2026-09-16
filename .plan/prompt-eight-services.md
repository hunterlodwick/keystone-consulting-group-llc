# Build out the eight remaining service pages — full spec

## Context

Keystone Consulting Group's site has an expanding `SERVICES_DETAIL` array in
`src/pages/ServicesPage.tsx`. Three entries are finished and are the reference standard:
`web-design`, `automations`, `pos-placement`.

**Eight entries are still thin (~250-280 words each) and need the same treatment:**

| id | Page title | Belongs to dropdown |
|---|---|---|
| `crm` | CRM Systems | AI Implementations |
| `consulting` | Consulting Services | AI Implementations |
| `seo` | SEO Services | Website Design |
| `google-business` | Google My Business Profile | Website Design |
| `bpo` | BPO Services | Website Design |
| `consumer-financing` | Consumer Financing | Payment Processing |
| `business-loans` | Business Loans | Payment Processing |
| `prep-to-sell` | Prep To Sell | (linked route) |

## The reference structure (copy this shape exactly)

The finished entries use these keys. Match them precisely, including optional fields:

```
id, title, icon, image, imageAlt, tagline, heroDesc,
sections[]        -> each { title, icon, desc }            // "What we do", 4-6 items
buildIncludes[]   -> each { title, icon, desc }            // "What a build includes"
statistics[]      -> each { value, label, source, sourceUrl }  // sourced proof
process[]         -> each { step, title, desc }            // 4 stages
fit: { good[], bad[] }                                     // a good fit / not a fit
questions[]       -> each { q, a }                         // real objections
close: { headline, sub }                                   // contextual CTA
features[]        -> short scannable list (already exists, keep/refine)
```

Read `web-design` and `automations` in the file FIRST and mirror their structure, tone, and
section ordering. The `statistics` shape must match exactly so the render code does not break.

## Length target

**Not crazy long.** 700-1,000 words of body copy per page. These are supporting pages, not the
flagship ones. Depth through clarity, not volume. Roughly: intro, 4-6 sections, what is included,
2-4 sourced stats, the process, fit/not-fit, 5-6 questions, close.

## Content brief per page — what we do, who it is for, why we do it

The user asked for exactly this three-part focus. Every page must answer: **what we do**, **who
it is for**, **why we do it**, with real research benefits.

### `seo` — SEO Services
- **What:** technical foundations, on-page structure, content that answers what people actually
  type, local signals, and the reporting that shows what moved.
- **Who:** businesses with a site that exists but does not get found. Local service businesses
  competing for "near me". Anyone paying for ads who wants a cheaper channel to compound.
- **Why:** paid traffic stops the moment you stop paying. Search visibility is an asset that keeps
  working. Be honest that SEO is slow and that anyone promising page one in 30 days is lying.
- **Stats:** BrightLocal review data (97% read reviews; 68% require 4+ stars) as the reason local
  signals and reputation are inseparable from ranking. Google's 2.5s LCP target for the technical
  side.

### `google-business` — Google My Business Profile
- **What:** claiming and completing the profile, categories, service areas, hours, photos, review
  flow, posts, and answering reviews properly.
- **Who:** any business serving a local area: trades, clinics, salons, restaurants, dealerships,
  professional services. Essentially anyone whose customer searches "near me".
- **Why:** this is the highest-leverage, lowest-cost local asset and most businesses leave it
  half-finished.
- **Stats (all BrightLocal 2026, this page's strongest material):**
  - 97% of consumers read reviews for local businesses.
  - 41% always read reviews when browsing, up from 29%.
  - Only 35% of small businesses even have a Google Business Profile.
  - 47% will not use a business with fewer than 20 reviews; only 9% would use one with 5 or fewer.
  - 68% will only use a business with 4+ stars (up from 55%); 31% require 4.5+ (up from 17%).
  - 54% visit the business website after reading positive reviews (up from 32% in 2019) - which is
    the natural handoff to the Website Design offering.
  - 89% expect a response to their review; 81% within a week; 42% are unlikely to use a business
    that never replies; 50% are put off by templated replies.
  - 82% read AI review summaries.
- **Angle that sells:** the review requirement is rising fast while reviews are the thing owners
  manage least. 47% will not even consider a business under 20 reviews.

### `crm` — CRM Systems
- **What:** custom-built pipeline and dashboards, or configuring the HubSpot/Salesforce/GHL they
  already pay for, deal tracking, automated follow-up.
- **Who:** businesses with 2+ people selling or quoting, where deals live in heads, texts, and a
  notebook. Trades with quotes outstanding. Any team that runs a Monday meeting just to find out
  where things stand.
- **Why:** the follow-up that never happens is the money that never arrives.
- **Stats - USE THE HONEST VERSION.** Nucleus Research found CRM return has **declined 37% over
  the last 10 years** to an average of **$3.10 per dollar spent**. **Do NOT use the famous "$8.71
  per dollar"** - that is from 2014 and is everywhere. Build the argument on the decline: returns
  fell because businesses buy software and change nothing about how they work. A CRM shaped around
  a real workflow is the difference. Also use the MIT/InsideSales 21x response-time figure, which
  is the strongest CRM argument available.

### `consulting` — Consulting Services
- **What:** finding where money leaks, choosing what to actually implement, sequencing it, and
  staying accountable to it.
- **Who:** owners doing well enough to grow but stuck being the bottleneck. Businesses that bought
  tools that did not stick.
- **Why:** most owners know something is wrong but not what to fix first. Guessing is expensive.
- **Stats (this page's best material):** Federal Reserve 2026 - **46%** of firms already use AI,
  **15%** more plan to within a year, and for those planning to adopt the top barriers are
  **finding tools that meet business needs (54%)** and **implementation/training time (37%)**.
  Frame it: the barrier is not willingness, it is knowing what to implement and having the time.
  That is a Federal Reserve finding, and it is the cleanest justification for advisory work on the
  whole site.

### `bpo` — BPO Services
- **What:** answering and qualifying inbound leads, appointment setting, follow-up on quotes,
  reception coverage, keeping the pipeline warm.
- **Who:** businesses losing enquiries because nobody answered in time. Owners who are on the tools
  and cannot pick up. Trades, clinics, salons, dealers.
- **Why:** you already paid to make the phone ring. Missing the call wastes the spend.
- **Stats:** the **21x** figure (respond within 5 minutes to be 21 times more likely to qualify a
  lead, MIT/InsideSales). Federal Reserve: 60% of firms sought financing and **56%** did so to
  cover operating expenses - cost pressure is why outsourcing is looked at. **Do not use the
  circulating "62% of calls go unanswered" figure** unless you can fetch a primary source for it.
  Instead the honest framing: the cost of an unanswered enquiry is the cost of the advertising that
  generated it, which is arithmetic and needs no study.

### `consumer-financing` — Consumer Financing
- **What:** giving customers the option to pay over time so the job goes ahead today and you get
  paid. Point-of-sale plans, approval flow, integration with the payment setup.
- **Who:** any business selling big-ticket items or jobs: HVAC, roofing, remodels, dental, auto,
  equipment, retail over a few hundred dollars.
- **Why:** price is the friction, and a customer who cannot pay in full today is a lost sale unless
  a plan exists.
- **Stat handling - BE CAREFUL.** Vendor blogs claim financing lifts close rates 18%, 20-30%, 47%
  and average order value 15-40%. **All of those trace to unnamed "industry research" and a direct
  attempt to verify the widely-repeated GreenSky claim produced no source. Do not use any of them.**
  Use instead:
  - Federal Reserve 2026: of firms that applied for financing, **42% got the full amount, 36% got
    some or most, and 22% got none.** Customers who cannot get financing elsewhere still want what
    you sell.
  - BrightLocal: **93%** of consumers have made a purchase after reading reviews, and **27%** spent
    over $1,000 - large purchases are normal, so payment terms matter.
  - State the core value as arithmetic, not a study finding: a customer who cannot pay in full today
    is a lost sale unless a plan exists. Label it as arithmetic.

### `business-loans` — Business Loans
- **What:** working capital, equipment, expansion funding; matching the business to the right
  product; handling the paperwork.
- **Who:** businesses with steady revenue that are being held back by cash timing rather than
  demand. Equipment purchases. Growth that needs funding before it produces.
- **Why:** the right money at the right time changes what is possible in a year; the wrong product
  costs years.
- **Stats (Federal Reserve 2026 - the strongest possible source for this page):**
  - **60%** of firms applied for financing in the prior 12 months.
  - Most common reasons: operating expenses (**56%**) and expansion or a new opportunity (**46%**).
  - Of applicants: **42%** got the full amount, **36%** got some or most, **22% got none**.
  - Applicants at small banks were most likely to be fully approved (**57%**).
  - Applications at online fintech lenders rose from **17% (2020) to 29% (2025)**.
  - **31%** of firms carry no debt; of those with debt, **59%** used a personal guarantee.
- **The hook:** nearly one in four who apply get nothing, and another third get only part. That is
  who this page is for, sourced from the Federal Reserve.

### `prep-to-sell` — Prep To Sell
- **What:** making the business sellable: systems that run without the owner, clean financials,
  documented process, recurring revenue, a CRM with history in it.
- **Who:** owners 3-10 years out from exit who want to sell on their terms rather than take a
  discount for owner dependence.
- **Why:** a buyer prices what they can verify and what keeps working without you.
- **Stat handling:** the Exit Planning Institute's "73% of owners plan to exit in 10 years / $14
  trillion" figure is widely quoted. **Fetch and verify it or leave it out.** The page works without
  a number because the core argument is structural. Where a statistic is needed, reuse the CRM and
  automation findings as the mechanism: a business whose systems hold its deals and its follow-up is
  a business a buyer can value.

## Writing rules — non-negotiable

- **No em-dashes.** Use commas, semicolons, or full stops.
- **No emojis.**
- Benefit first, feature second. Lead with the outcome the owner gets.
- Plain, direct, specific. No "cutting-edge", "leverage", "seamless", "unlock", "revolutionise".
- No "our clients see" / "we typically save" anywhere.
- Every statistic needs its source named in visible text and its `sourceUrl` filled.
- Contextual CTAs in `close`, matched to what that visitor came to do (the Patterson pattern the
  finished pages use).
- Keep `features[]` scannable, and keep the existing `image`/`imageAlt` values unchanged.
- Do not touch `web-design`, `automations`, `pos-placement`, or any other file.

## Evidence to produce

Write to `verification/services-overhaul/`:
- Word count per page before and after (baseline before: crm 268, consulting 256, seo 277,
  google-business 262, bpo 263, consumer-financing 253, business-loans 260, prep-to-sell 270).
- Confirm every statistic used appears in `.plan/FACTSHEET-services.md`.
- Output of `npm run build` and `npm run lint`.
- Confirm: zero em-dashes, zero `[needs number]`, zero occurrences of "$8.71", zero occurrences of
  "3D" on these pages.

## Output

Print a table: page id, before words, after words, statistics used with sources, and any blocker.
Then the build and lint result. Under 70 lines.
