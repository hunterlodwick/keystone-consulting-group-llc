# Website booking attribution

Implemented on `feat/booking-attribution` from main `aac0e8e` (merged mobile fix).

- Fixed `WEBSITE_BOOKING_COLOR_ID = '9'` (Blueberry); invitation summary unchanged.
- Private properties: `kcgSource=website`, server-side `kcgBookedAt`, optional sanitized `kcgPage`, `kcgCta`, `kcgReferrer`, `kcgUtm`, `kcgWidget`.
- Missing metadata preserves compatibility: page/CTA become `unknown`, referrer `direct`; absent UTM/widget omitted. No fabricated surface for an older client. Valid current clients always send modal/inline.
- Client captures current pathname, only UTM query parameters, referrer hostname, and actual CTA label. Modal label is frozen on opening, before focus moves. A new entry-point context captures the real click/keyboard trigger because App owns modal opening and is protected. Inline has no opening CTA; its existing heading is passed as a prop.
- Strings only; controls/markup removed, path strips query/hash, referrer strips URL path, values capped at 1000 UTF-16 units with no split surrogate. Metadata never appears in invitation description. Source/time cannot be supplied by a client.
- Attribution follows the event through the conference fallback without changing submission time or deterministic event IDs.
- `scripts/booking-report.mjs` uses `~/.kcg-secrets/oauth.json`, refreshes OAuth, paginates the private-property filter, groups by page/CTA/referrer and lists time/name/email/page. Errors never print token responses.

## Run the report

```sh
node scripts/booking-report.mjs
node scripts/booking-report.mjs --from=2026-09-01 --days=30
```

The range means **meeting start date**, not submission date, in the configured booking timezone. Default: last 30 calendar days including today. `kcgBookedAt` separately preserves the submission instant. Cancelled/deleted events are excluded. Report date boundaries respect DST; a local post-filter corrects Google's `timeMin` end-time semantics.

**Existing bookings are NOT retroactively tagged. Only new bookings after production rollout carry attribution.** Metadata reflects the client-provided context, not a verified advertising conversion identity. Referrers can be unavailable; those become `direct`. UTM capture is the current booking page's query string, not a cross-page first-touch tracking system.

## Verification

See `exit-codes.json`, `calendar-proof.json`, `report-output.txt`, `missing-credentials.json`, and `protected-files.json`. Test logs remain alongside these locally.

```sh
npm run test:booking
node --import tsx --test tests/booking/attribution.test.ts
npm run lint
npm run build
# Dedicated harness, to avoid the concurrently occupied port 4173:
BOOKING_HARNESS_PORT=4187 node --import tsx tests/booking/local-server.ts --harness
BOOKING_PREVIEW_URL=http://127.0.0.1:4187 npm run test:booking-browser
npx playwright test --config tests/booking/attribution.playwright.ts
```

The new config imports the existing config and owns port 4186. Neither `browser.spec.ts` nor `playwright.config.ts` was edited. All browser submissions used local test servers/mocked requests, never production.

Controlled API proof: exactly one transparent, private event, no attendees, no Meet, reminders disabled, `sendUpdates=none`. Google insert/filter HTTP 200, delete HTTP 204, subsequent GET status cancelled and filter empty. Full raw filter response (using a Google fields projection) is saved in `calendar-proof.json`. Do not rerun `prove.ts --run` casually: it writes and deletes a temporary event.

Initial verification failures were corrected: fixture used the wrong local-server property/signature; Luxon fixture required validity narrowing; default port 4173 was occupied by another job; example CTA “Map your first automation” is not rendered on the current deep automations page. The spec now tests the actual header booking CTA and a clearly synthetic arbitrary-label fixture. Existing deep-service contact-form actions were preserved.

Source references: [Google events.list](https://developers.google.com/workspace/calendar/api/v3/reference/events/list) documents `privateExtendedProperty` and `calendar.events.owned`; [private extended properties](https://developers.google.com/workspace/calendar/api/guides/extended-properties) documents owner-copy visibility and limits.

## Production result

Code commit `4bba68db0a13d1323f38e1ead20ef4eb9f0c26b7` fast-forward merged into main and pushed. Production deploy exit 0: `dpl_6XbaaCdzZ1wD7Nzjj1L5KBR3qRk9`, https://keystone-consulting-group-lfri-jw3uedd4n.vercel.app, aliased to https://www.keystoneconsultingg.com.

Read-only live verification exit 0: attribution markers present in `/assets/index-D4UZETmp.js`; homepage, automations, work, privacy and terms HTTP 200; slots HTTP 200 with `X-Booking-Mode: live`; mobile booking opens; console errors 0, production booking POSTs 0. No production environment variables were changed. See `production.json`. End-to-end creation via the production form was deliberately not performed per owner instruction.

Final results: backend 51/51, attribution unit/integration/report tests 6/6, existing browser suite 32/32, new browser suite 4/4; all exit 0. Lint/build/report/API proof/deploy also exit 0. Missing credentials explicitly tested with a mocked home-directory lookup: expected exit 1, clear credential-path error, no secrets.
