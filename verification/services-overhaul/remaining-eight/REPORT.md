# Eight remaining service pages

Completed locally. Only the eight requested SERVICES_DETAIL entries were changed in src/pages/ServicesPage.tsx. Evidence is isolated here so prior overhaul artifacts remain intact. No deployment.

## Word counts

Before counts below are the user-provided baselines. After counts count whitespace-separated content strings, including headings, source labels and features; exclude identifiers, image metadata, URLs and renderer boilerplate. This method measures the original entries at 227, 211, 242, 219, 226, 212, 223 and 223 words respectively, so the supplied before/after columns are not a strict like-for-like count. Both counts are retained in content-checks.json.

| Page | Supplied before | Measured before | After | Statistics |
|---|---:|---:|---:|---|
| crm | 268 | 227 | 877 | $3.10 (Nucleus Research, CRM benefit areas with the greatest ROI impact (2024)); 21x (MIT/InsideSales, Lead Response Management study (2007); InsideSales recap (2015)) |
| consulting | 256 | 211 | 903 | 46% + 15% (Federal Reserve, 2026 Report on Employer Firms (2025 survey)); 54% (Federal Reserve, 2026 Report on Employer Firms (2025 survey)); 37% (Federal Reserve, 2026 Report on Employer Firms (2025 survey)) |
| seo | 277 | 242 | 926 | 97% (BrightLocal, Local Consumer Review Survey (2026)); 68% (BrightLocal, Local Consumer Review Survey (2026)); 2.5 seconds (Google Search Central, Core Web Vitals) |
| google-business | 262 | 219 | 998 | 47% (BrightLocal, Local Consumer Review Survey (2026)); 68% (BrightLocal, Local Consumer Review Survey (2026)); 89% (BrightLocal, Local Consumer Review Survey (2026)); 54% (BrightLocal, Local Consumer Review Survey (2026)) |
| bpo | 263 | 226 | 941 | 21x (MIT/InsideSales, Lead Response Management study (2007); InsideSales recap (2015)); 56% (Federal Reserve, 2026 Report on Employer Firms (2025 survey)) |
| consumer-financing | 253 | 212 | 929 | 93% (BrightLocal, Local Consumer Review Survey (2026)); 27% (BrightLocal, Local Consumer Review Survey (2026)) |
| business-loans | 260 | 223 | 974 | 42% / 36% / 22% (Federal Reserve, 2026 Report on Employer Firms (2025 survey)); 60% (Federal Reserve, 2026 Report on Employer Firms (2025 survey)); 57% (Federal Reserve, 2026 Report on Employer Firms (2025 survey)) |
| prep-to-sell | 270 | 223 | 991 | 73% (Exit Planning Institute, 2023 State of Owner Readiness findings (published 2024)); $14 trillion (Exit Planning Institute, 2023 State of Owner Readiness findings (published 2024)) |

## Contract and scope

- The prompt sample differs from the actual reference entries and ServiceDetail type. Used the actual render contract: statistics {title, value, explanation, source, url}; buildIncludes {intro, items[{title, description}]}; process [{title, description}]; fit {yes, no}; questions [{question, answer}]; close {title, description, button}. The existing url field is the visible source link; sourceUrl would be ignored by this renderer.
- Added problem arrays because SingleServicePage selects DeepServiceContent only when problem is present. No renderer or type change was needed.
- Every byte outside the eight array entries is unchanged from the captured starting file. web-design, automations and pos-placement remain byte-identical, as do all image/imageAlt values. No other application file changed.
- Existing renderer boilerplate adds text to the rendered totals; actual per-viewport counts are in browser-checks.json. Page body copy stays in the requested range.

## Evidence and editorial decisions

- All 21 statistic blocks match .plan/FACTSHEET-services.md; source-coverage.json records each section, number, URL and denominator. The fact sheet was not modified.
- Primary publisher sources were fetched: BrightLocal 2026, Nucleus January 2024, Federal Reserve March 2026, Google Search Central, InsideSales June 2015 recap, and Exit Planning Institute March 2024 summary of its 2023 research.
- Nucleus decline is dated to its publication and is not attributed to an unproven cause. The lead-response figure is qualification odds for web leads called within five versus thirty minutes, not closed sales.
- Federal Reserve business-financing evidence is used only for business contexts. Omitted it from Consumer Financing because employer-firm results cannot support claims about consumer credit access. BrightLocal purchase evidence does not claim a financing uplift.
- EPI 73% and $14 trillion were verified at the primary publisher and labelled as 2023 findings. The survey horizon is not reset to today.
- No consumer-financing uplift claims, unanswered-call estimate, guaranteed ranking, approval timetable or zero-risk promises remain in the edited entries.

## Validation

- npm run build: PASS, exit 0; build.log.
- npm run lint (tsc --noEmit): PASS, exit 0; lint.log.
- Content structure, counts, image preservation and exact outside-entry comparison: PASS; check-content.cjs and content-checks.json.
- Source-to-fact-sheet coverage: PASS; check-sources.py and source-coverage.json.
- Browser: 32/32 PASS across 390px and 1440px, light and dark. All expanded sections, visible source links and contextual CTA modal opens verified; no horizontal overflow, hidden content or runtime page errors. No form submissions. browser-checks.json and eight mobile screenshots.
- Zero em-dashes, zero [needs number], zero stale CRM return figure and zero 3D occurrences in all eight entries and rendered articles.
- SlopMonster regex gate: 5/5 for every page; per-page slop logs.
- Separate rival-model copy cleanse was attempted with the locally installed Claude CLI, but OAuth expired and could not refresh. No external-model copy review completed; cleanse-review.txt preserves the failure. This is a review limitation, not a build blocker.
- Anti-slop recheck: copy uses outcome-led sections, supported figures, direct language and scoped commitments. Existing visual layout was retained as explicitly requested.

## Recheck commands

```sh
node verification/services-overhaul/remaining-eight/check-content.cjs
python3 verification/services-overhaul/remaining-eight/check-sources.py
npm run build
npm run lint
```
