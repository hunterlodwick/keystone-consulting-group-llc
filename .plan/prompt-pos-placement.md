# Bring POS Placement up to the same standard as the other service pages

## Context

`src/pages/ServicesPage.tsx` holds a `SERVICES_DETAIL` array. Eleven entries are now complete
and are the reference standard: `web-design`, `automations`, `crm`, `consulting`, `seo`,
`google-business`, `bpo`, `consumer-financing`, `business-loans`, `prep-to-sell`.

**`pos-placement` is the last one that is not.** It currently renders only ~376 words because
it is missing the sections the others have. Verified missing on the rendered page:
- no `statistics` (no sourced proof)
- no `fit` (no good-fit / not-a-fit)
- no `process` (no build stages)

It DOES have: `id, title, icon, image, imageAlt, tagline, heroDesc, sections[]`, some
`questions[]`, and a close CTA. Its existing copy is good, do not throw it away.

## Task

Add the missing sections so pos-placement matches the structure of the finished entries, and
refine its existing copy to the same standard. Target 750-1,000 words.

Read `crm` and `google-business` in the array FIRST and mirror their exact key shapes and
section ordering so the render code is unaffected.

### Required structure
```
statistics[]  -> each { title, value, explanation, source, url }   // 2-3 sourced
process[]     -> each { step, title, desc }                        // 4 stages
fit: { good[], bad[] }                                             // honest both ways
questions[]   -> 5-6 real objections (extend what exists)
close: { headline, sub }                                           // keep contextual
```

## Content brief

- **What it is:** modern payment hardware placed in the business at no upfront cost. Free
  install, free training. The business processes with KCG and keeps the equipment.
- **Who it is for:** businesses on an old terminal, or whose counter slows the line at peak.
  Businesses that were quoted a large sum for hardware. Anyone whose current setup embarrasses
  the brand at the point of sale.
- **Why:** the terminal is the last thing a customer touches and it is usually the oldest piece
  of technology in the building. Replacing it should not require writing a check.
- **Not a fit:** businesses that do not take card payments at a counter, businesses locked into a
  hardware lease they cannot exit, or anyone expecting free hardware with no processing
  commitment. Say this plainly.

## Statistics — allowed sources ONLY

Use ONLY what is already verified in `.plan/FACTSHEET-services.md`. For this page the usable
material is thin by design, so use at most 2-3 and frame them honestly:

- **Federal Reserve, 2026 Report on Employer Firms**: 60% of firms applied for financing in the
  prior 12 months; of applicants 42% got the full amount, 36% got some or most, and **22% got
  none**. Frame: equipment is hard to fund, which is why free placement matters.
  https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms
- **BrightLocal 2026**: 93% of consumers have made a purchase after reading reviews and 27% spent
  over $1,000. Use only if it genuinely fits an argument about the checkout moment. If it does
  not fit naturally, leave it out rather than forcing it.
  https://www.brightlocal.com/research/local-consumer-review-survey/

**Do NOT invent or use:** any generic "businesses lose X% to slow checkout", any vendor claim
about terminal speed improving sales, any "customers abandon lines" statistic. If a number is not
in the factsheet and you cannot verify it with a primary-source fetch, leave `[needs number]` and
report it. It is better to have only 2 honest stats than 4 invented ones.

State the core value as arithmetic where no study exists: a terminal that takes longer per
transaction costs measurable time at a busy counter, and modern hardware costs nothing upfront
because it is paid for through processing. Label that as arithmetic, not as a study result.

## Rules

- **No em-dashes.** No emojis.
- Benefit first. Plain, specific language. No "seamless", "cutting-edge", "frictionless".
- Every statistic needs its source named in visible text and `url` filled.
- Contextual CTA in `close` (keep the existing "Talk through hardware for your counter" if it
  still reads well).
- Keep the existing `image` and `imageAlt` values.
- **Every section title must either already have an image at
  `public/images/services/sub/<slugified-title>.jpg` OR carry an explicit
  `"image": "/images/services/sub/<existing>.jpg"`.**
  This is the bug that just shipped 43 broken images: the renderer falls back to the slugified
  title, so a NEW section title without an explicit image 404s. Before you finish, run this and
  confirm zero misses:
  ```
  python3 - <<'PY'
  import re, os
  s = open('src/pages/ServicesPage.tsx').read()
  i = s.find('"id": "pos-placement"')
  seg = s[i:i+40000]
  m = re.search(r'"sections"\s*:\s*\[(.*?)\n\s{6}\],', seg, re.S) or re.search(r'"sections"\s*:\s*\[(.*)\]', seg, re.S)
  block = m.group(1)
  avail = [f[:-4] for f in os.listdir('public/images/services/sub')]
  for t in re.findall(r'"title":\s*"([^"]+)"', block):
      sl = re.sub(r'[^a-z0-9]+','-',t.lower()).strip('-')
      if sl not in avail:
          print('MISSING IMAGE FOR:', t)
  print('checked')
  PY
  ```
  If a title needs a new image and none fits, REUSE the closest existing one explicitly
  (available: smart-terminals, full-pos-systems, kitchen-display-systems, mobile-wireless-readers,
  point-of-sale-financing, zero-risk-to-your-business, multi-industry-support,
  increase-average-ticket-size, and the rest of the 44 in that folder).

- Do not touch any other service entry or file.

## Evidence

Write to `verification/services-overhaul/pos-placement.txt`:
- word count before (~376 rendered) and after
- the statistic check script output showing zero missing images
- `npm run build` and `npm run lint` results
- confirm zero em-dashes, zero `[needs number]`

## Output

Print: final word count, the statistics used with sources, the image-check output, and build/lint
status. Under 40 lines.
