# Optional hosted selection and reviewed follow-up

This change is local code only. No deployment, environment file, credentials, linked storage, site form, booking code, or approved catalog was changed. The shipped 254 approvals and 20 public-source pins remain intact. The read-only `kcg-nov17-review` checkout informed the implementation; its preview sinks, debug/readback routes, private corpus, and free-form model answers were not imported.

Both features default **off**. With no linked Redis, the public site/extractive widget and existing contact/booking paths continue to work. `/api/widget/status` reports hosted and lead availability independently, including a bounded Redis health check. Runtime admission still fails closed if storage subsequently fails. Status availability means configured and storage reachable, not that provider access or delivery has been proven.

## Exact switches (documentation only; none applied)

All new variables are server-only. Do not prefix them with `VITE_`.

| Variable | Safe setting / activation requirement |
| --- | --- |
| `KCG_WIDGET_HOSTED_ENABLE` | Unset or `0` disables OpenAI. Only literal `1` enables the optional path after all dependencies pass. |
| `KCG_WIDGET_LEAD_ENABLE` | Unset or `0` disables widget follow-up. Independent of hosted consent and hosted enable. |
| `NODE_ENV`, `VERCEL_ENV`, `VERCEL` | Must respectively equal `production`, `production`, `1`. Development and preview stay off even if feature flags are set. |
| `KCG_WIDGET_REDIS_REST_URL` | Existing Upstash REST origin, `https://<database>.upstash.io`. No HTTP, credentials in URL, nondefault port, paths, query strings, or alternate hosts. |
| `KCG_WIDGET_REDIS_REST_TOKEN` | Server-side token for that same durable database, permitting `PING`, `EVAL`, and the Lua commands below. No automatic retries. |
| `KCG_WIDGET_HMAC_SECRET` | Stable, high-entropy server secret, at least 32 bytes. Shared by every instance. Never use a public form key here. |
| `KCG_WIDGET_OPENAI_API_KEY` | Dedicated widget OpenAI key. Only hosted uses it. No generic/Gemini key fallback. |
| `KCG_WIDGET_INPUT_MICROUSD_PER_TOKEN` | Positive integer ceiling on the model's input price in micro-US dollars per token; maximum 10,000. Required for hosted. Round upward. No price is assumed or fetched. |
| `KCG_WIDGET_OUTPUT_MICROUSD_PER_TOKEN` | Positive integer ceiling on output price, including reasoning, in the same units; maximum 10,000. Required for hosted. |
| `KCG_WIDGET_IP_DAILY_MICROUSD` | Explicit positive integer per-IP reservation budget, maximum 10,000,000 ($10). Required for hosted. |
| `KCG_WIDGET_GLOBAL_DAILY_MICROUSD` | Explicit positive integer shared reservation budget, maximum 100,000,000 ($100). Required for hosted. |
| Existing `VITE_WEB3FORMS_ACCESS_KEY` | Lead reuses this existing site's exact Web3Forms key, available to the server runtime. No new destination key, caller override, or browser submission fallback. Missing/malformed key disables widget leads. Existing site contact still uses its own unchanged code. |
| `KCG_WIDGET_RESPONSES_MODEL` | Leave unset. If present, only `gpt-6-luna` is accepted. Model, endpoint and project cannot be chosen by a request. |

The old preview enable/transport flags do not activate these production paths. To disable a feature, unset its enable switch or set it to `0`. No infrastructure is provisioned by this code.

A hosted attempt reserves `20,000 × input ceiling + 400 × output ceiling` micro-USD **before** contacting OpenAI. The serialized request is capped at 16,384 bytes, with framing headroom in the input reservation; output is capped at 400 tokens. Both budgets must cover a full reservation or hosted availability is false. For illustration only, ceilings of 5 and 30 reserve 112,000 micro-USD ($0.112) per attempt; these numbers are **not verified Luna prices**. The reservation ceiling must cover actual account pricing. This is conservative application accounting, not a provider invoice guarantee or a cap on Redis/platform fees. No refunds on success, failure, timeout, or ambiguous outcomes.

## Shared admission and retention

One Lua `EVAL` checks every counter and performs the claim/reservation atomically. Keys share the Redis cluster hash tag `{widget}` across instances. No process-local quota substitutes for Redis. The existing process-local limiter is only an extra guard for all widget requests.

- Combined hosted/lead external attempts: 30 per IP, 150 globally per 10-minute counter window.
- Hosted: 12 per IP, 120 globally per 10-minute counter window.
- Lead: 3 per IP, 30 globally per 10-minute counter window.
- Spend: per-IP and global budgets, expiring 24 hours after their first reservation. These are fixed counter windows, not rolling windows or calendar days.
- Denied admission does not create per-IP keys or increment counters. Same-payload lead replay does not consume a new reservation.
- Shared IP keys are HMAC-SHA256 digests. Only Vercel's overwritten `x-vercel-forwarded-for` is used in production; ordinary forwarded headers are ignored. Invalid/missing addresses share the conservative `unknown` bucket (or the socket address if available).
- Redis contains only counters and HMAC receipt keys/payload digests with `pending`, `accepted`, or `unknown`. No raw IP, email, name, phone, company, message, transcript, or provider response is retained or logged by these paths.
- Receipts expire after 48 hours. IDs contain a timestamp and random UUID; IDs older than 24 hours or more than 30 seconds in the future are rejected. An expired receipt cannot turn an old ID into a new send.

Redis must preserve acknowledged writes without eviction for the retention period. Do not clear its namespace, change the HMAC secret, or replace the database while valid lead IDs exist. For such maintenance, disable leads and allow at least 24 hours plus 30 seconds for all valid IDs to age out first. Application idempotency cannot survive destruction of its durable receipt store. No delivery retry queue exists.

## Data paths and consent

Hosted and lead checkboxes start unchecked, are independent, and are not persisted. Hosted opt-out stops future hosted requests and aborts the browser's current request; it cannot recall an already transmitted provider request. Lead consent can be revoked before sending; editing reviewed fields resets it. After sending, the visitor can use the existing contact links to request withdrawal. The widget makes no promise that it can recall a sent request.

Hosted uses only `https://api.openai.com/v1/responses`, model `gpt-6-luna`, and the existing dedicated widget project ID. Requests use `store:false`, no tools, no redirects, bounded streaming reads, and a 20-second whole-operation deadline. Only a bounded, redacted current question (1,000 characters) and up to four eligible user turns (400 characters each) accompany approved candidates. Sensitive turns and assistant history are omitted. Redaction is heuristic; the UI asks visitors to keep private details out of chat. No contact-form state is part of this path.

OpenAI selects IDs, not prose. The server checks a strict whole-document grammar, duplicates, extra fields, membership in this turn's approved candidates, output completion/usage, and response byte limits. It then extracts literal passages, links and required caveats from the pinned catalog. Invalid/empty selections, rate or spend denial, and provider/storage failures retain the approved local fallback. Industry corrections and partner follow-ups remain locally routed. No private source readers, arbitrary URLs, tool calls, or model output prose reach the response.

Lead submission accepts exactly `submissionId`, `consent:true`, `reviewed:true`, and `fields` containing exactly `name`, `email`, `phone`, `company`, `message`. Name, email and message are required; phone and company may be empty. The UI provides a distinct review step, with no inferred brief, checklist, or transcript. Server validation bounds all fields and rejects control characters and extra destination fields. Whitespace is trimmed before the canonical payload HMAC.

The same atomic Lua transaction compares a receipt's payload HMAC and claims it as `pending` before the single Web3Forms send. A matching replay returns the existing state, a different canonical payload returns 409, and any pending/unknown claim is never sent again—even after a crash before the original send. Lost claim acknowledgments also fail closed. Completion uses a compare-and-set Lua script without extending retention. A lost completion write leaves the claim blocked. This intentionally prefers a possibly unsent request over a duplicate.

Destination is fixed to `https://api.web3forms.com/submit`, the existing site key, existing contact subject and existing named KCG CC recipients. There are no request-controlled recipients or redirects, and no retry on any provider failure. Whole-send deadline: 10 seconds; Redis operation deadline: 2.5 seconds. `accepted` means Web3Forms returned success and the receipt was finalized; it never means inbox delivery. The UI locks after the first attempt, including network ambiguity. `/api/contact` and `/api/widget/brief` remain unavailable in this handler; the site's direct Web3Forms form and booking routes are unchanged. No debug or receipt-read endpoint was added.

## Local verification

No provider or external storage calls are made by these commands. Tests inject transports in code; production has no test-mode environment switch.

```sh
npm run build
npm run typecheck
node --import tsx --test tests/widget-release/release.test.ts tests/widget-production/offline.test.ts
node --test tests/serverless-runtime.test.mjs
node --import tsx --test tests/widget-production/runtime.test.ts
node tests/widget-production/browser.mjs
```

The real Redis suite requires installed `redis-server` and `redis-cli`. It creates a private temporary, nonpersistent Redis instance on a Unix socket and removes it afterwards. It never connects to or flushes an existing database. Lua execution, parallel independent store instances, per-IP/global quotas and spend caps, replay/conflict, crash claims, lost acknowledgments, TTL, storage failures, and endpoint behavior are covered. It fails rather than substituting an in-memory emulator if Redis cannot start.

The browser suite intercepts all traffic and serves its fixture in memory; no live site or provider is contacted. It checks distinct availability, unchecked consent, opt-out, explicit field review, edit invalidation, exact payload, accepted wording, and ambiguous-send lockout.

Observed in this session:

- Production build, 254 approvals / 20 source pins, TypeScript, 102 release tests, 9 new offline endpoint/adapter tests, and 2 standalone serverless tests passed.
- Real Redis execution is **unverified**: sandbox denied both Unix-socket and loopback TCP binding (`Operation not permitted`). The real suite did not pass.
- Browser execution is **unverified**: sandbox prevented Chromium from launching. Browser hooks and test code are included.
- Existing booking HTTP/loopback tests encountered the same socket restriction; booking code/configuration was unchanged. The bundled booking method smoke tests passed.
- No live Luna access, price, Upstash service behavior, Web3Forms acceptance, or inbox delivery was tested. Keep both enable switches off until the real runtime/browser checks and operational prerequisites are satisfied.
