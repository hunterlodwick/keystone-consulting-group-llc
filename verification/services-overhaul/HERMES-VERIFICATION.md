# HERMES VERIFICATION - services-overhaul

Stage: read-only verification (Astra review follows). No app files edited, no deploy, no outbound contact.
Scope inspected: src/pages/ServicesPage.tsx (git diff), verification/services-overhaul/* (PLAN.md, before/, after/, capture.mjs, logs), live preview http://127.0.0.1:4175.

## VERDICT: PASS on every required criterion, with 2 stale-evidence notes and 1 pre-launch copy blocker that is not a build defect.

## 1. Change scope
- `git status`: only `src/pages/ServicesPage.tsx` modified (375 insertions / 57 deletions). No new app files, no other source touched.
- Deep content is an opt-in branch: `ServiceDetail` gains `problem/heroNote/statistics/process/fit/questions/close`, all optional (`?:`); deep blocks render behind `{service.x && ...}`; `SingleServicePage` returns `<DeepServiceContent>` only `if (service.problem)`. Everything else falls through to the original renderer.

## 2. Nine other services + renderer unchanged - CONFIRMED
- Rendered detail text byte-identical before vs after for all nine (crm, consulting, prep-to-sell, seo, google-business, bpo, consumer-financing, business-loans, pos-placement): 18/18 `.txt` + `.main.txt` files identical, and `main.innerHTML` identical for the 1440-light cells.
- The diff touches only the `web-design` and `automations` entries; the nine other `SERVICES_DETAIL` objects are untouched. Original grid/shallow renderer untouched apart from the added branch.

## 3. Deep route structure - PASS (both routes)
| Requirement | web-design | automations |
|---|---|---|
| 4 original capabilities retained + expanded | PASS - same 4 titles/icons; each adds desc + What it replaces / What you get / Who it is for | PASS - same 4 titles/icons, same expansion |
| Pain section | PASS - 3 paragraphs, "The site is there. The enquiries are another matter." | PASS - 3 paragraphs, "The work keeps landing back on your desk." |
| Research value w/ cited derived math | PASS - 3 figures | PASS - 2 figures |
| Process | PASS - 4 steps | PASS - 4 steps |
| Honest fit | PASS - 3 good-fit / 3 not-a-fit | PASS - 3 / 3 |
| FAQs | PASS - exactly 7 | PASS - exactly 7 |
| One ContactForm closing CTA | PASS - "Discuss my website" | PASS - "Discuss my workflow" |
Original capability titles preserved exactly: 3D Animated Websites, AI Voice Chatbots, High-Conversion Landing Pages, Mobile-First & Lightning Fast; AI Lead Qualification, Customer Service Agents, Workflow Automation, System Integrations. Copy expanded from 297/298 words to 1542/1577 rendered words.

## 4. Math and fact discipline - PASS
- 53% x (1 - 20/100) = 0.80 -> stated correctly and labelled "Derived illustration".
- 40-60 min x 5 = 200-300 min; /60 = "3 hours 20 minutes to 5 hours per week" -> correct, and the copy states it "assumes the reported daily saving repeats each day" and to use measured figures instead.
- 14% expressed as baseline x 1.14 with the explicit note that it is not a 14% reduction in working hours -> correct.
- Five working days is labelled as an assumption, not research. Core Web Vitals thresholds (LCP 2.5s, INP <200ms, CLS <0.1), 53%, 20%, OpenAI 40-60 min (2025) and McKinsey 5,000 agents / 14% (May 2024) are the only external facts used; no others appear.
- Every figure is explicitly disclaimed as third-party research, "not a measurement of your customers" / "not measured savings for KCG clients". No invented client stats, no invented scope, no guaranteed outcomes.

## 5. Hero copy - PASS
Tagline and heroDesc are byte-identical to the pre-change versions on both routes. Automations keeps the "what software does for free" line and the free-AI wording is qualified immediately below it by `heroNote`: "Software can reduce repetitive work, but AI usage and connected tools can carry fees." That note renders directly under the hero description (confirmed in rendered text).

## 6. Rendering matrix - PASS (live, independent)
All 8 cells (web-design + automations x 1440/390 x light/dark) verified on the running preview:
- 0 console errors, 0 page errors, 0 broken images, no horizontal overflow (docScrollWidth == viewport), 0 elements at opacity 0 / visibility hidden (no animation gating).
- Theme applied from localStorage on every cell; deep teal override active in dark.
- No em dashes in rendered deep copy (0 on every cell). Automations carries 3 en dashes, all inside the "40-60" figures.
- Closing CTA click-tested: button opens the ContactForm modal (1 dialog, 4 inputs, email field present).

## 7. Notes / concrete failures

F1. Stale evidence (not a product defect). `after/metrics.json` asserts two problems that do not exist in the running build:
  - `automations` 390 reports `overflow: true` (scrollWidth 392 v 390) and `web-design` 390 light reports `/images/services/sub/mobile-first-lightning-fast.jpg` as broken.
  Live re-test: overflow false on all 8 cells with zero overflowing elements, no broken images anywhere, and the JPEG is present (190,875 bytes).
  Both are consistent with the capture running while the preview was mid-rebuild. Regenerate `after/metrics.json` once the copy gate is final so the frozen evidence stops asserting two defects that are not real.

F2. Pre-launch copy blocker (by design, but must clear before deploy). `[needs number]` renders in customer-facing copy: web-design FAQ 6 ("Your expected conversion lift: [needs number].") and automations FAQ 6 ("Your measured daily saving: [needs number]."). Exactly one per route, none on the nine shallow routes. Leaving it there is the correct choice over inventing a figure; it still cannot ship visible to a prospect. Supply the client figure or drop the clause.

F3. Slop gate is stale and single-route. `slop-web-design.txt` covers web-design only (1656 words, score 4/5) and predates the current copy, which now renders 1542 words; the rule-of-three it flags ("loading, responsiveness and visual stability") has since been rewritten in source. No automations slop report exists in the evidence. Re-run the gate on final copy for both routes.

F4. Minor wording, non-blocking. web-design FAQ 6 says "We cannot promise a sales date or conversion lift without your traffic and enquiry baseline", which implies a lift could be promised once a baseline exists, sitting slightly against that page's own "not a good fit: you need a guaranteed ranking or sales figure" line. Optional tightening.

F5. Source link health (checked independently with curl, browser UA, follow redirects). Two of four links did not resolve for me:
  - PASS: Think with Google Masters of Mobile PDF -> 200 application/pdf.
  - PASS: Google Search Central Core Web Vitals -> 200 text/html.
  - UNCONFIRMED: OpenAI enterprise AI 2025 report -> 403 (bot wall). The URL is well-formed and OpenAI serves 403 to non-browser clients; confirm it opens by clicking it in a real browser.
  - UNCONFIRMED: McKinsey gen AI agents in the enterprise -> 000 (connection failed/timeout from this host, another bot-wall signature). Click-test before launch.
  Sources are rendered as real outbound links with `target="_blank"` + `rel="noopener noreferrer"` and are readable in the visible figcaption, so the copy is properly attributed regardless; this is a link-liveness question only, not a missing citation.

F6. Coverage gaps I did not verify (stated plainly, no defect asserted): build.log and lint.log (vite build clean, `tsc --noEmit` clean) are timestamped before the last copy edits, so the current source's build/typecheck state is unconfirmed by me; and I exercised theme via localStorage only, so the no-localStorage default-theme path was not separately tested.

## 8. Evidence integrity
Before snapshots and the nine shallow baselines are internally consistent and match the live preview. After snapshots are, as expected, partially mid-regeneration: `after.log` is empty and `after/metrics.json` carries the two stale assertions in F1. No evidence files were modified by this verification.
