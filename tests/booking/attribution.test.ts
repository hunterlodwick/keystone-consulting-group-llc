import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DateTime } from 'luxon';
import { buildBookingEventRequest, insertBookingEvent } from '../../lib/booking/google';
import { parseBookBody } from '../../lib/booking/validation';
import { ATTRIBUTION_KEYS } from '../../lib/booking/attribution';
import { createFakeGoogleTransport, startLocalBookingServer } from './local-server';
import { reportRange, listWebsiteBookings, formatReport } from '../../scripts/booking-report.mjs';

const attribution = { kcgPage: '/services/automations', kcgCta: 'Map your first automation', kcgReferrer: 'google.com', kcgUtm: 'utm_source=google&utm_campaign=fall', kcgWidget: 'modal' };
const args = { calendarId: 'test@example.com', tz: 'America/Denver', startMs: Date.parse('2026-09-22T16:00:00Z'), endMs: Date.parse('2026-09-22T16:30:00Z'), name: 'Attribution Test', email: 'test@example.com', requestId: 'test', includeConference: true, bookedAt: new Date('2026-09-21T12:34:56Z') };

test('event request has Blueberry and every private attribution key, clean invitation', () => {
  const { body } = buildBookingEventRequest({ ...args, ...attribution });
  assert.equal(body.colorId, '9');
  assert.equal(body.summary, 'KCG call - Attribution Test');
  assert.deepEqual(body.extendedProperties.private, { kcgSource: 'website', kcgBookedAt: '2026-09-21T12:34:56.000Z', ...attribution });
  assert.ok(!body.description.includes(attribution.kcgCta));
});

test('old clients omit all attribution and still build a valid tagged booking', () => {
  const parsed = parseBookBody({ start: '2026-09-22T16:00:00Z', name: args.name, email: args.email });
  assert.equal(parsed.ok, true);
  const { body } = buildBookingEventRequest(args);
  assert.equal(body.colorId, '9');
  assert.equal(body.extendedProperties.private.kcgSource, 'website');
  assert.equal(body.extendedProperties.private.kcgPage, 'unknown');
  assert.equal(body.extendedProperties.private.kcgReferrer, 'direct');
  assert.equal(body.extendedProperties.private.kcgWidget, undefined);
  assert.equal(body.extendedProperties.private.kcgUtm, undefined);
});

test('attribution rejects nonstrings, strips controls and extraneous URL data, caps values', () => {
  const base = { start: '2026-09-22T16:00:00Z', name: args.name, email: args.email };
  for (const key of ATTRIBUTION_KEYS) for (const bad of [null, 1, {}, []]) assert.equal(parseBookBody({ ...base, [key]: bad }).ok, false);
  const parsed = parseBookBody({ ...base, ...attribution, kcgCta: '<hi>\n' + 'x'.repeat(1500), kcgPage: '/work?secret=yes#x', kcgReferrer: 'https://linkedin.com/path?q=x', kcgUtm: 'utm_source=a&email=private&utm_medium=b' });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const tags = buildBookingEventRequest({ ...args, ...parsed.value }).body.extendedProperties.private;
  assert.equal(tags.kcgCta.length, 1000);
  assert.equal(tags.kcgPage, '/work');
  assert.equal(tags.kcgReferrer, 'linkedin.com');
  assert.equal(tags.kcgUtm, 'utm_source=a&utm_medium=b');
  for (const [key, value] of Object.entries(tags)) { assert.ok(key.length < 44); assert.ok(value.length < 1024); assert.doesNotMatch(value, /[<>\n]/); }
  const unicode = buildBookingEventRequest({ ...args, kcgCta: '😀'.repeat(1000) }).body.extendedProperties.private.kcgCta;
  assert.ok(unicode.length <= 1000);
  assert.equal(parseBookBody({ ...base, kcgSource: 'manual' }).ok, false);
  assert.equal(parseBookBody({ ...base, kcgBookedAt: 'spoofed' }).ok, false);
});

test('conference fallback preserves attribution and the original submitted timestamp', async () => {
  const transport = createFakeGoogleTransport();
  transport.setInsertMode('invalidConferenceType');
  await insertBookingEvent({ ...args, ...attribution, accessToken: 'fake', fetchImpl: transport.fetchImpl, randomUUID: () => 'fake' });
  assert.equal(transport.insertRequests.length, 2);
  assert.deepEqual(transport.insertRequests[0].body.extendedProperties, transport.insertRequests[1].body.extendedProperties);
});

test('real HTTP handler forwards optional attribution to the mocked Google insert', async () => {
  const transport = createFakeGoogleTransport();
  const server = await startLocalBookingServer({ env: { BOOKING_DRY_RUN: 'false', BOOKING_TZ: args.tz, BOOKING_CALENDAR_ID: args.calendarId, GOOGLE_CLIENT_ID: 'fake', GOOGLE_CLIENT_SECRET: 'fake', GOOGLE_REFRESH_TOKEN: 'fake' }, now: () => args.bookedAt, transport });
  try {
    const res = await fetch(`${server.url}/api/booking/book`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start: '2026-09-22T16:00:00Z', name: args.name, email: args.email, ...attribution }) });
    assert.equal(res.status, 200);
    assert.deepEqual((transport.insertRequests[0].body.extendedProperties as any).private, { kcgSource: 'website', kcgBookedAt: args.bookedAt.toISOString(), ...attribution });
  } finally { await server.close(); }
});

test('report uses calendar days, validates flags, paginates and filters meeting start', async () => {
  const range = reportRange(['--from=2026-03-07', '--days=3'], args.tz);
  assert.equal(range.until.diff(range.from, 'hours').hours, 71);
  assert.throws(() => reportRange(['--from=2026-02-30'], args.tz));
  assert.throws(() => reportRange(['--days=0'], args.tz));
  const reportNow = DateTime.fromISO('2026-09-21T12:00:00Z');
  if (!reportNow.isValid) throw new Error('Invalid fixture');
  assert.equal(reportRange([], args.tz, reportNow).from.toISODate(), '2026-08-23');
  let calls = 0;
  const events = await listWebsiteBookings({ baseUrl: 'https://example.com/events', headers: {} }, range, async (url: string) => {
    const params = new URL(url).searchParams;
    assert.equal(params.get('privateExtendedProperty'), 'kcgSource=website');
    calls++;
    if (calls === 1) return Response.json({ items: [{ start: { dateTime: '2026-03-06T23:50:00-07:00' } }], nextPageToken: 'page2' });
    assert.equal(params.get('pageToken'), 'page2');
    return Response.json({ items: [{ summary: 'KCG call - Test', start: { dateTime: '2026-03-08T10:00:00-06:00' }, attendees: [{ email: 'test@example.com' }], extendedProperties: { private: attribution } }] });
  });
  assert.equal(calls, 2); assert.equal(events.length, 1);
  const report = formatReport(events, range);
  for (const value of ['Total website bookings: 1', attribution.kcgPage, attribution.kcgCta, attribution.kcgReferrer, 'test@example.com']) assert.ok(report.includes(value));
});
