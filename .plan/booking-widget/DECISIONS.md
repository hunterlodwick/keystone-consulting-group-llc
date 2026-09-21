# Locked decisions (orchestrator)

## 2026-09-20
1. **BOOKING_TZ = America/Denver (Mountain).** Confirmed by Hunter: "seth will always be utah time."
   This is permanent, not a placeholder. Do not switch it to Pacific even though KCG's offices are in
   California. Verify with: `TZ=America/Denver python3 -c "import zoneinfo;print(zoneinfo.ZoneInfo('America/Denver'))"`
   -> confirmed valid zone (MDT -0600 during DST, MST -0700 otherwise).
   DST transitions for this zone must be covered by tests in BOTH directions.

2. **Option B chosen** (custom brand-matched widget on freebusy). Google booking-page embed is rejected.

3. **Auth = OAuth installed-app, refresh token for seth@keystoneconsultingg.com**, minted by Seth
   (NOT Hunter - freebusy only reflects the authorizing account).

4. **BOOKING_DRY_RUN=true for the whole build/test phase.** Live is a config flip.

## Still needs Hunter/Seth before live activation
- Working days + hours (default placeholder in config until confirmed).
- Buffer between calls and minimum notice.
- Whether a Google Meet link is attached and whether the visitor receives an invite.
- Whether events land on his main calendar or a dedicated "Bookings" calendar.
## 2026-09-20 (later) - hours CONFIRMED by Hunter
**Booking window: Monday-Friday, 09:00-19:00 America/Denver.**

Current state of `lib/booking/config.ts` vs this decision:
- `WORKING_DAYS = [1,2,3,4,5]` -> ALREADY CORRECT (Mon-Fri). Remove the PLACEHOLDER comment.
- `WORK_START = { hour: 9, minute: 0 }` -> ALREADY CORRECT. Remove the PLACEHOLDER comment.
- `WORK_END = { hour: 17, minute: 0 }` -> **WRONG. MUST BECOME `{ hour: 19, minute: 0 }`** (7pm close).
  The comment says "a slot may end at this instant, not after", so with 30-minute slots the last
  bookable slot of the day is 18:30-19:00.
- Any test asserting a 17:00 boundary (last slot 16:30-17:00) must be updated to 18:30-19:00, and the
  DST boundary tests must use the same close. Do not weaken a test to pass; change the EXPECTED value.

Remaining placeholders in config.ts, my chosen defaults (NOT Seth's decision - flag as changeable,
do not present as confirmed): `BUFFER_MINUTES = 15`, `MIN_NOTICE_MINUTES = 120`,
`MAX_DAYS_AHEAD = 30`. Changeable in one line each when Seth says otherwise.

Open question to raise once, not blocking: a 09:00-19:00 window with no lunch break means the widget
will offer slots straight through midday. If Seth takes a standing lunch, we should carve it out.
## 2026-09-20 (later) - EMAILED INVITE TO THE BOOKER, CONFIRMED by Hunter
**Every person who books MUST receive the invitation by email.** Not a silent calendar entry.

Required shape of `insertBookingEvent()` / `POST /api/booking/book`:
1. `attendees: [{ email: <the booker's submitted email> }]` - the booker is an attendee, not just a note.
2. `sendUpdates: 'all'` on the insert call. This is what makes Google actually email the invite.
   Without it the event is created silently and the booker hears nothing.
3. `conferenceDataVersion: 1` plus a `conferenceData.createRequest` carrying a UNIQUE `requestId`
   per booking (e.g. derived from the event id), so a Google Meet join link is generated and travels
   in that emailed invite. `requestId` must be unique per request or Google dedupes the conference.
4. The submitter's email must be a valid, non-empty address: it is now a delivery address, not just
   a contact field. Validation must reject an unusable address with 400 BEFORE any calendar write.

Constraints and honest limits to carry into the plan and the review:
- **DRY RUN MUST NOT SEND ANY EMAIL.** In `BOOKING_DRY_RUN=true` the fake transport records the
  attendee/sendUpdates/conference intent and asserts it, but issues zero real API calls and zero
  emails. The suite must prove the email-send path was NOT exercised live.
- **Meet availability is UNVERIFIED.** `conferenceData` requires the authorizing account to be able
  to create Meet conferences. If it fails, the booking must still succeed and still email the invite
  (create the event WITHOUT conferenceData rather than failing the booking). A Meet outage must never
  cost Seth a booking. Record this fallback explicitly.
- **Invite delivery is UNVERIFIED until live.** Nobody can prove an email arrived without real
  credentials. It stays labelled UNVERIFIED in the review; do not report it as passing.
- The event description should carry the visitor's notes plus a KCG line identifying it as a website
  booking.
- Also required on the insert: a reminder/overrides choice and `summary` naming the prospect (e.g.
  "KCG call - <name>"), so Seth can read his calendar at a glance. Mark the reminder interval
  changeable.
