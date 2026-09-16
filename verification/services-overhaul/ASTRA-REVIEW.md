# Astra review

One build pass, Hermes verification, one Astra review. Two correction cycles within the requested budget. No deployment or commit.

## Decisions

- Preserve the requested original tagline and hero description. The AI claim about free software is immediately qualified with real usage/tool fees. Scope remains the original four capabilities per page.
- New data is typed and optional. Nine other service objects and the fallback renderer remain untouched. Deep rendering is opt-in via the optional problem field; further optional blocks are individually guarded.
- Typography and theme surfaces follow the existing site. Dark-mode text accents use the existing soft teal color for readable contrast. Mobile hero type was reduced to prevent the long AI heading overflowing.
- Statistics live on opaque surfaces. No deep-page text overlaps photos. Computed font families/colors and overlap checks are in interactions.json, including observer-disabled checks and fresh-storage default light mode.
- Both pages have seven open, readable FAQs and one closing ContactForm button. No conversion guarantee or new service category was introduced.

## Hermes findings resolved

- F1/F3: regenerate final evidence on a built-site preview. Development Vite watched evidence writes and reloaded pages mid-capture. The stable preview eliminates that race. Lazy images are temporarily requested eagerly for screenshots; original loading attributes are restored before DOM comparison. Final metrics and copy gate outputs supersede intermediate capture logs.
- F2: retain both `[needs number]` markers. Hunter explicitly requires these when a numerical outcome is unknown; this is a local review build, not a deployment.
- F4: remove the implication that having a baseline allows a promised conversion lift. The FAQ now says no sales date or conversion lift can be promised.
- F5: OpenAI's direct official PDF replaces the bot-blocked HTML URL and returns HTTP 200. Google and Think with Google also return 200. McKinsey's exact source article and study passage are readable through the research tool, but direct local HTTP/Chromium access fails. This transport limitation remains explicit in SOURCES.md rather than being marked as a successful browser click.
- F6: final-source build/typecheck logs pass; fresh-context default light verified in interactions.json.
- Hermes's formula bullet accidentally prepends `53% x` to the conversion calculation. The actual page correctly calculates baseline × (1 − 20/100) = baseline × 0.80; the 53% abandonment finding is separate.

## Copy review

SlopMonster runs against full rendered body text using `--text`, without `--allow-proof`; both score 5/5. The sourced study-size wording is `5,000 support agents` to avoid the linter mistaking `5,000 customer service agents` for a KCG customer count. No em dashes in either page's rendered text. A separate Claude-family cleanse was attempted as the skill requests; its expired OAuth session blocked that optional review. The failure is preserved in cleanse-review.txt, not presented as a completed cleanse.

## Outcome

Local owner review ready, subject to final automated assertions in finalize.py and the recorded McKinsey direct-access limitation. No external form submissions, source edits outside ServicesPage.tsx, dependencies, font additions, or deployment. The original unrelated untracked image-audit work remains intact.

## Concurrent edit discovered during final capture

At 13:06 PDT another process modified the same shared file, adding SERVICE_CTAS and changing the nine shallow pages’ hero/closing CTAs, then rebuilding the shared dist. This violates this task’s original regression baseline, but is separate work and was not overwritten. The exact additional delta is saved as concurrent-cta.patch.

Final evidence is therefore captured from the isolated worktree /tmp/kcg-services-overhaul-review on port 4177, using ServicesPage.overhaul-only.txt. Its shallow renderer is the exact original renderer plus the optional deep return, and all nine data objects are unchanged. The overhaul itself is also present in the shared checkout, alongside the concurrent CTA work. An asynchronous owner question is pending for that conflict; the isolated result is reviewable without erasing either version.
