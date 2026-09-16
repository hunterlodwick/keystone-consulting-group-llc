# Services overhaul: local review

Preview: [Website Builds](http://127.0.0.1:4177/services/web-design) · [AI Implementations](http://127.0.0.1:4177/services/automations)

**Review scope:** final evidence and port 4177 use `/tmp/kcg-services-overhaul-review`, a detached local worktree at the original baseline with only this overhaul applied. A concurrent process added contextual CTAs to the shared checkout during verification. Those changes are preserved there. `overhaul-only.patch` and `ServicesPage.overhaul-only.txt` are the exact reviewed change; `concurrent-cta.patch` preserves the separate delta. The owner was asked which CTA version to retain; no answer had arrived at report time.

Only `src/pages/ServicesPage.tsx` changed in this overhaul’s application source. Both routes now explain their four capabilities in depth, address the prospect's problem, show sourced value calculations, describe the build and handover, qualify fit honestly, and answer seven questions before a single closing ContactForm action. Other service data and the original shallow renderer are preserved. All richer fields are optional.

| Rendered main content | Before | After | Increase |
|---|---:|---:|---:|
| Website Builds | 297 words | 1,560 words | +1,263, 425.3% |
| AI Implementations | 298 words | 1,585 words | +1,287, 431.9% |

Counts exclude shared navigation/footer for a fair depth comparison. SlopMonster checks the entire rendered body instead: 1,678 and 1,703 words, both 5/5 with no proof exemption. See `SUMMARY.txt` for the machine-checked output.

## Validation evidence

- `before/` and `after/`: both pages, light/dark, 1440/390, full screenshots and rendered text. `after/*-hero.png` and `after/*-value.png` provide readable viewport details.
- `after/metrics.json`: final route matrix, console/page errors, image checks, overflow, visible source links, and rendered main HTML. Nine shallow routes compare byte-for-byte to their original HTML.
- `interactions.json`: fresh-storage light default, both themes at both widths, computed text colors and font families, opaque stat surfaces, zero text/photo overlap, no hidden deep content with IntersectionObserver disabled, and working ContactForm modal in all eight cells. No external form submitted.
- `build.log`, `lint.log`: final-source production build and TypeScript checks pass.
- `slop-web-design.txt`, `slop-automations.txt`: final full-body copy gate results.
- `SOURCES.md`, `source-citation-check.json`: every selected source fact and derived calculation. All research has an immediately visible linked Sources caption.
- `HERMES-VERIFICATION.md`, `ASTRA-REVIEW.md`: independent Hermes verification and review dispositions. One build pass; two correction cycles; no deploy.

## Facts and limits

The pages use only factsheet figures: Google's mobile abandonment and conversion findings, its Core Web Vitals thresholds, OpenAI's self-reported daily savings, and McKinsey's support productivity example. Five working days is labelled an illustration assumption. No research result is described as a KCG client result or guaranteed outcome.

The owner's required `[needs number]` markers remain for expected website conversion lift and measured daily AI saving. Original hero copy remains as requested; an adjacent note qualifies the AI headline's use of “free” with actual software and usage costs.

Google, Think with Google, and the official OpenAI PDF return HTTP 200 locally. McKinsey's exact article and cited passage were successfully retrieved through the research tool; direct local curl/Chromium access fails with protocol/timeout errors. Its local-browser link health remains unconfirmed. See `source-browser.json`.

The separate Claude copy cleanse could not run because its OAuth session expired. That is recorded in `cleanse-review.txt`; Hermes verification and both required SlopMonster regex gates completed.

## Reproduction

In `/tmp/kcg-services-overhaul-review`, start the built preview with `npm run preview -- --host 127.0.0.1 --port 4177`. Run `node verification/services-overhaul/capture.mjs after`, `node verification/services-overhaul/check-interactions.mjs`, then `python3 verification/services-overhaul/finalize.py`.

Use the built preview for evidence: Vite dev reloads on writes to this verification directory, which invalidated intermediate screenshots. Final screenshots and metrics use the production build. `final-capture.log` is authoritative; earlier capture logs record discarded attempts. Image loading is accelerated only for capture, then original attributes are restored before DOM comparisons. No screenshot-only CSS changes are applied.
