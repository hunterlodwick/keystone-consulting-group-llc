# Subpage de-slop pass (SlopMonster)

Copy-only. Homepage left alone. No commit/push/deploy. Iteration 2 of 3 (4 routes failed round 1, all 25 at 5/5 after round 2).

`npm run build` PASS. `npm run lint` (tsc --noEmit) PASS.

## Per-route scores (final)

| Route | Score |
|---|---|
| `/` | 5/5 |
| `/services` | 5/5 |
| `/services/web-design` | 5/5 |
| `/services/crm` | 5/5 |
| `/services/automations` | 5/5 |
| `/services/consulting` | 5/5 |
| `/services/consumer-financing` | 5/5 |
| `/services/business-loans` | 5/5 |
| `/services/pos-placement` | 5/5 |
| `/services/google-business` | 5/5 |
| `/services/seo` | 5/5 |
| `/services/bpo` | 5/5 |
| `/services/prep-to-sell` | 5/5 |
| `/restaurants` | 5/5 |
| `/grocery` | 5/5 |
| `/healthcare` | 5/5 |
| `/ecommerce` | 5/5 |
| `/salons` | 5/5 |
| `/auto-repair` | 5/5 |
| `/gas-stations` | 5/5 |
| `/high-risk` | 5/5 |
| `/nonprofits` | 5/5 |
| `/b2b` | 5/5 |
| `/real-estate` | 5/5 |
| `/retail` | 5/5 |

## What changed

### `src/App.tsx` (INDUSTRY_DATA, RESOURCES_DATA, IndustrySplash only)

- ecommerce desc: "Seamless online checkout…" → "Online checkout that just works. Plug into Shopify or WooCommerce…"
- health desc: "Streamline patient payments…" → "Make patient payments easier…"
- beauty desc: "seamlessly" + "effortless checkout" → "in one place" / "checkout is quick at the front desk"
- About Us feature: "Innovative payment & growth solutions" → "Payment and growth solutions that fit how you work"
- IndustrySplash Online Payments: "seamless e-commerce integrations" → "e-commerce connections that work with your cart"

### `src/pages/ServicesPage.tsx`

- Killed `seamless`, `leverage`, `Ready to Get Started?`, `Whether you're`, `don't just`, double em-dashes, and all P1 triads (dashboards/reporting/automations; score/qualify/route; find/crawl/rank; events/updates/product; name/address/phone; Bing/Facebook/industry; email/LinkedIn/phone; messaging/targeting/timing; salons/retail/more; chip/swipe/mobile; functionality/timers/order).
- CTA heading → `Talk to Us.`
- Title `BPO — Lead Generation` → `BPO Lead Generation` (two em-dashes in the first period-less window).
- Periods added to `features[]` items so concatenated innerText does not stack hyphenated compounds.

Listed-but-already-gone (not in source): "headline, button, and proof"; "Texts, emails, and reminders"; "invoicing, email, and calendar"; "category, photo, and detail"; "lost, smeared, and misread"; "websites, tools, and systems"; "place, install, and maintain".

### `src/pages/IndustryPageTemplate.tsx`

- Vocab: seamless (EBT, ecommerce subhead, salon booking flow), leverage (grocery volume), unlock (Level 2/3), streamline (real estate), `in today's` (retail).
- Shared H2: "The Problems You're Facing — And How We Fix Them" → "The Problems You're Facing. How We Fix Them."
- Healthcare feature: "Zero-Touch" / tap-to-pay / check-in / text-to-pay stack → "Zero Touch" + "tap to pay" / "invoices by text"
- B2B title: `B2B & Professional Services` → `B2B / Professional Services` (linter read `2B Businesses` as invented proof)
- All remaining P1 triads rewritten (takeout/delivery/online; inventory/vendors/reorder; Secure/compliant/designed; procedures/treatments/copays; SaaS/memberships/subscription; card/membership/retail; Mitchell/ShopWare/other; Invoicing/estimates/payments; inventory/lottery/tobacco; shops/supplements/other; descriptions/disclaimers/terms; tools/alerts/dispute; freezes/holds/unexpected; lobbies/events/services; optimized/secure/customizable; campaigns/events/capital; corporate/purchasing/government; QuickBooks/Xero/FreshBooks; deposits/fees/services).
- Periods added to `benefits` / `painPoints` / `solutions` items.

Listed-but-already-gone: "lane, hour, and department"; "Reminders, referrals, and follow"; "Contactless, mobile, and text" as a clean triad; "Sell, track, and redeem"; "cards, deposits, and retention"; "Deposits, Rent, and Fees".

## Calls

- Periods on list items: meaning unchanged; needed so `body.innerText` does not weld hyphenated compounds into one 220-char sentence.
- B2B title slash: same name, stops the `B2B Businesses` proof false positive.
- Did not invent metrics or testimonials.
