# How to get the booking widget live

Order matters: do NOT deploy before the API routing is proven on a preview. The `vercel.json`
catch-all (`/(.*)` -> `/index.html`) is the exact trap that could make `/api/booking/*` return HTML
instead of JSON in production. It was only proven with the local emulator.

## Step 1 - Seth authorizes (ONLY Seth can do this)
Seth runs the consent once; it mints the refresh token.
1. Google Cloud project + enable Calendar API + OAuth consent screen, scope
   `https://www.googleapis.com/auth/calendar.events`.
2. Create an OAuth client (Desktop app) -> Client ID + Client Secret.
3. Run `node scripts/google-consent.mjs` on this machine, sign in AS SETH, approve.
4. Copy the printed refresh token straight into Vercel. Never into chat/vault/repo.
   Why Seth and not Hunter: freebusy only reports the busy times of the AUTHORIZING account.
   A token from Hunter's account would show Hunter's calendar and double-book Seth.

## Step 2 - Vercel env vars (Production AND Preview)
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN,
BOOKING_CALENDAR_ID (seth@keystoneconsultingg.com or a dedicated Bookings calendar),
BOOKING_TZ=America/Denver, BOOKING_DRY_RUN=true

## Step 3 - Deploy to PREVIEW only, keep dry-run ON
`vercel` (preview deploy). Dry-run means: real UI, real slot math, ZERO real calendar writes and
ZERO emails. Then verify the routing that local emulation could not prove:
  curl -i https://<preview>/api/booking/slots?from=YYYY-MM-DD&days=2   -> must be JSON, not index.html
  curl -i https://<preview>/services/web-design                        -> must still be the SPA HTML
If /api/* returns HTML, the catch-all must be fixed BEFORE going live (exclude /api from the rewrite).
Also click the whole flow in the preview.

## Step 4 - Real invite test (do this BEFORE switching dry-run off globally)
Add a temporary env override for a single controlled test with BOOKING_DRY_RUN=false, book one slot
using an address Seth controls, and confirm: the event appears on HIS calendar, and the invitation
actually arrives by email with the Meet link. This is the only way to convert "invite delivery" and
"Meet support" from UNVERIFIED to proven. Then set the override back.

## Step 5 - Commit, then go live
Commit the work deliberately first (it is currently uncommitted alongside unrelated .plan artifacts).
Then set BOOKING_DRY_RUN=false in Production and redeploy. Confirm on the live site.

## Step 6 - Post-launch checks
- Book one real slot end to end and confirm Seth receives it.
- Confirm Seth's OTHER calendars: if his commitments live on a second calendar, single-calendar
  freebusy cannot see them and the widget will offer occupied slots.

# Still-open items to accept or fix before/at launch
- Best-effort concurrency (two simultaneous adjacent-slot bookings can both insert). Accept or
  authorize a coordination design.
- Confirm buffer 15 / minimum notice 120 / horizon 30 / reminder 60.
- Lunch break: currently the window sells straight through noon.
- Pre-existing, unrelated: ContactForm posts to /api/contact, which has no serverless function.
