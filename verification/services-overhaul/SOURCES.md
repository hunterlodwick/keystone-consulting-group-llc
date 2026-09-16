# Source audit

Only the supplied factsheet's selected figures appear. Research is labelled external context, never a KCG result. Every figure has a visible `Sources:` figcaption and direct primary-source link. No lead-response, adoption, novice-worker, or industry-average-load figures were needed.

| Page | Figures | Primary source |
|---|---|---|
| Website | 53% leave mobile pages taking longer than 3 seconds; 20% conversion drop per added second | [Think with Google, Masters of Mobile PDF](https://www.thinkwithgoogle.com/_qs/documents/6522/TwG_AUNZ_Masters_of_Mobile_Report.pdf), printed page 4 |
| Website | LCP within 2.5 seconds; INP below 200 milliseconds; CLS below 0.1 | [Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals) |
| AI | Self-reported 40–60 minutes saved per active day | [OpenAI official 2025 report PDF](https://cdn.openai.com/pdf/7ef17d82-96bf-4dd1-9df2-228f7f377a29/the-state-of-enterprise-ai_2025-report.pdf), printed page 7 |
| AI | 5,000 support agents; 14% more issues resolved per hour | [McKinsey, May 17, 2024 interview](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-promise-and-the-reality-of-gen-ai-agents-in-the-enterprise), Jorge Amar's customer-service example |

Derived, explicitly labelled on-page:
- Conversion illustration: baseline × (1 − 20/100) = baseline × 0.80; 80% remains. No reverse-speed sales promise.
- AI illustration: assuming 5 active working days, 40–60 × 5 = 200–300 minutes; divide by 60 minutes/hour = 3h20m–5h/week. Working days are an explicit illustration assumption, not a sourced fact or promised usage.
- Support productivity: baseline × (1 + 14/100) = baseline × 1.14. Explicitly not a 14% reduction in hours.

Unknowns deliberately retained per owner's instruction:
- Website FAQ: `Your expected conversion lift: [needs number].`
- AI FAQ: `Your measured daily saving: [needs number].`

Other numerals are service names (3D), publication dates, the inherited illustrative 2 AM hero, unit conversions, and shared navigation/footer business details, not outcome statistics.

Verification: Google and Think with Google fetched HTTP 200 locally. OpenAI's HTML article rejects automated local requests with 403, so the citation now uses its official PDF (HTTP 200). McKinsey's article and the exact 5,000/14% passage were successfully retrieved by the web research tool on September 16, 2026. Direct local curl/Chromium access fails with HTTP/2 protocol errors or timeout; this restriction is recorded rather than falsely reporting a local 200. See source-citation-check.json and source-browser.json.
