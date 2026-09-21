import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { DateTime, Settings } from 'luxon';
import {
  BUFFER_MINUTES,
  MAX_DAYS_AHEAD,
  MAX_QUERY_DAYS,
  MIN_NOTICE_MINUTES,
  SLOT_DURATION_SECONDS,
  SLOT_MINUTES,
  WORK_END,
  WORK_START,
  WORKING_DAYS,
  readBookingConfig,
  type SlotGenerationConfig,
} from '../../lib/booking/config';
import { generateSlots, uniqueLocalDateTime, type BusyInterval } from '../../lib/booking/schedule';
import { escapePlain, isDeliverableEmail } from '../../lib/booking/validation';
import {
  createFakeGoogleTransport,
  startLocalBookingServer,
  type LocalServer,
} from './local-server';
import { parseBusyBoundary } from '../../lib/booking/google';
import {
  CONSENT_SCOPES,
  createPkcePair,
  createState,
  exchangeAuthorizationCode,
  startConsentListener,
  statesEqual,
} from '../../scripts/google-consent.mjs';

const DENVER = 'America/Denver';
const LA = 'America/Los_Angeles';
const CAL_ID = 'seth-test@example.com';

const BASE_ENV = {
  BOOKING_TZ: DENVER,
  BOOKING_CALENDAR_ID: CAL_ID,
  GOOGLE_CLIENT_ID: 'fake-client-id',
  GOOGLE_CLIENT_SECRET: 'fake-client-secret',
  GOOGLE_REFRESH_TOKEN: 'fake-refresh-token',
};

const DRY_ENV = { ...BASE_ENV, BOOKING_DRY_RUN: 'true' };
const LIVE_ENV = { ...BASE_ENV, BOOKING_DRY_RUN: 'false' };

function freeze(iso: string): Date {
  return DateTime.fromISO(iso, { setZone: true }).toJSDate();
}

function slotConfig(overrides: Partial<SlotGenerationConfig> = {}): SlotGenerationConfig {
  return {
    tz: DENVER,
    workingDays: WORKING_DAYS,
    workStart: { hour: WORK_START.hour, minute: WORK_START.minute },
    workEnd: { hour: WORK_END.hour, minute: WORK_END.minute },
    slotMinutes: SLOT_MINUTES,
    bufferMinutes: BUFFER_MINUTES,
    minNoticeMinutes: MIN_NOTICE_MINUTES,
    maxDaysAhead: MAX_DAYS_AHEAD,
    ...overrides,
  };
}

function assertSlotInvariants(slots: Array<{ start: string; end: string }>, tz: string) {
  for (const slot of slots) {
    const start = DateTime.fromISO(slot.start, { setZone: true });
    const end = DateTime.fromISO(slot.end, { setZone: true });
    assert.equal(end.toMillis() - start.toMillis(), SLOT_DURATION_SECONDS * 1000);
    const localStart = start.setZone(tz);
    const localEnd = end.setZone(tz);
    assert.ok(localStart.minute === 0 || localStart.minute === 30);
    assert.equal(localStart.second, 0);
    assert.equal(localStart.millisecond, 0);
    assert.ok(!slot.start.includes('Z'));
    assert.match(slot.start, /[+-]\d{2}:\d{2}$/);
    assert.ok(localStart.hour > 0 || localStart.minute >= 0);
    assert.ok(localEnd.toMillis() > localStart.toMillis());
  }
}

async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { res, json, text };
}

describe('booking config', () => {
  it('rejects missing dry-run and never defaults to writes', () => {
    assert.throws(() => readBookingConfig({ BOOKING_TZ: DENVER }), /BOOKING_DRY_RUN/);
    assert.throws(() => readBookingConfig({ BOOKING_TZ: DENVER, BOOKING_DRY_RUN: 'TRUE' }), /BOOKING_DRY_RUN/);
  });

  it('rejects invalid timezone and incomplete google credentials', () => {
    assert.throws(() => readBookingConfig({ BOOKING_DRY_RUN: 'true', BOOKING_TZ: 'Mountain' }), /IANA/);
    assert.throws(
      () =>
        readBookingConfig({
          BOOKING_DRY_RUN: 'false',
          BOOKING_TZ: DENVER,
        }),
      /Live booking/,
    );
    assert.throws(
      () =>
        readBookingConfig({
          BOOKING_DRY_RUN: 'true',
          BOOKING_TZ: DENVER,
          GOOGLE_CLIENT_ID: 'only-one',
        }),
      /incomplete/,
    );
  });

  it('allows dry-run without google credentials', () => {
    const config = readBookingConfig({ BOOKING_DRY_RUN: 'true', BOOKING_TZ: DENVER });
    assert.equal(config.dryRun, true);
    assert.equal(config.google, null);
  });
});

describe('generateSlots', () => {
  const mondayMorning = freeze('2026-09-21T07:00:00-06:00');

  it('emits 30-minute grid slots inside working hours', () => {
    const slots = generateSlots({
      date: '2026-09-21',
      busyIntervals: [],
      config: slotConfig(),
      now: mondayMorning,
    });
    assert.ok(slots.length > 0);
    assertSlotInvariants(slots, DENVER);
    assert.equal(slots[0].start, '2026-09-21T09:00:00-06:00');
    assert.equal(slots[0].end, '2026-09-21T09:30:00-06:00');
    const last = slots[slots.length - 1];
    assert.equal(last.start, '2026-09-21T18:30:00-06:00');
    assert.equal(last.end, '2026-09-21T19:00:00-06:00');
    assert.equal(WORK_END.hour, 19);
    assert.equal(slots.length, 20);
  });

  it('omits slots that overlap expanded busy intervals', () => {
    const busy: BusyInterval[] = [
      {
        startMs: DateTime.fromISO('2026-09-21T10:00:00-06:00').toMillis(),
        endMs: DateTime.fromISO('2026-09-21T11:00:00-06:00').toMillis(),
      },
    ];
    const slots = generateSlots({
      date: '2026-09-21',
      busyIntervals: busy,
      config: slotConfig(),
      now: mondayMorning,
    });
    assert.equal(slots.some((slot) => slot.start.startsWith('2026-09-21T10:')), false);
    assert.equal(slots.some((slot) => slot.start === '2026-09-21T09:30:00-06:00'), false);
    assert.equal(slots.some((slot) => slot.start === '2026-09-21T09:00:00-06:00'), true);
  });

  it('treats touching boundaries as free when buffer is zero', () => {
    const busy: BusyInterval[] = [
      {
        startMs: DateTime.fromISO('2026-09-21T10:00:00-06:00').toMillis(),
        endMs: DateTime.fromISO('2026-09-21T11:00:00-06:00').toMillis(),
      },
    ];
    const slots = generateSlots({
      date: '2026-09-21',
      busyIntervals: busy,
      config: slotConfig({ bufferMinutes: 0 }),
      now: mondayMorning,
    });
    assert.equal(slots.some((slot) => slot.start === '2026-09-21T09:30:00-06:00'), true);
    assert.equal(slots.some((slot) => slot.start === '2026-09-21T11:00:00-06:00'), true);
    assert.equal(slots.some((slot) => slot.start === '2026-09-21T10:00:00-06:00'), false);
    assert.equal(slots.some((slot) => slot.start === '2026-09-21T10:30:00-06:00'), false);
  });

  it('merges adjacent busy events after buffer expansion', () => {
    const busy: BusyInterval[] = [
      {
        startMs: DateTime.fromISO('2026-09-21T10:00:00-06:00').toMillis(),
        endMs: DateTime.fromISO('2026-09-21T11:00:00-06:00').toMillis(),
      },
      {
        startMs: DateTime.fromISO('2026-09-21T11:00:00-06:00').toMillis(),
        endMs: DateTime.fromISO('2026-09-21T12:00:00-06:00').toMillis(),
      },
    ];
    const slots = generateSlots({
      date: '2026-09-21',
      busyIntervals: busy,
      config: slotConfig(),
      now: mondayMorning,
    });
    assert.equal(
      slots.some((slot) => slot.start >= '2026-09-21T09:30:00-06:00' && slot.start < '2026-09-21T12:30:00-06:00'),
      false,
    );
  });

  it('clears a day covered by an all-day busy interval', () => {
    const busy: BusyInterval[] = [
      {
        startMs: DateTime.fromISO('2026-09-21T00:00:00-06:00').toMillis(),
        endMs: DateTime.fromISO('2026-09-22T00:00:00-06:00').toMillis(),
      },
    ];
    const slots = generateSlots({
      date: '2026-09-21',
      busyIntervals: busy,
      config: slotConfig(),
      now: mondayMorning,
    });
    assert.deepEqual(slots, []);
  });

  it('treats recurring-style expanded intervals as separate busy blocks', () => {
    const busy: BusyInterval[] = ['2026-09-21T09:00:00-06:00', '2026-09-22T09:00:00-06:00'].map((start) => ({
      startMs: DateTime.fromISO(start).toMillis(),
      endMs: DateTime.fromISO(start).plus({ minutes: 30 }).toMillis(),
    }));
    const monday = generateSlots({
      date: '2026-09-21',
      busyIntervals: busy,
      config: slotConfig({ bufferMinutes: 0 }),
      now: mondayMorning,
    });
    assert.equal(monday.some((slot) => slot.start === '2026-09-21T09:00:00-06:00'), false);
    assert.equal(monday.some((slot) => slot.start === '2026-09-21T09:30:00-06:00'), true);
  });

  it('returns no slots for past dates and weekends', () => {
    assert.deepEqual(
      generateSlots({ date: '2026-09-20', busyIntervals: [], config: slotConfig(), now: mondayMorning }),
      [],
    );
    assert.deepEqual(
      generateSlots({ date: '2026-09-26', busyIntervals: [], config: slotConfig(), now: mondayMorning }),
      [],
    );
  });

  it('enforces minimum notice and horizon', () => {
    const late = freeze('2026-09-21T16:00:00-06:00');
    const today = generateSlots({
      date: '2026-09-21',
      busyIntervals: [],
      config: slotConfig(),
      now: late,
    });
    assert.equal(today.some((slot) => slot.start === '2026-09-21T17:30:00-06:00'), false);
    assert.equal(today.some((slot) => slot.start === '2026-09-21T18:00:00-06:00'), true);
    assert.equal(today[today.length - 1].start, '2026-09-21T18:30:00-06:00');
    assert.equal(today[today.length - 1].end, '2026-09-21T19:00:00-06:00');

    const afterCloseNotice = generateSlots({
      date: '2026-09-21',
      busyIntervals: [],
      config: slotConfig(),
      now: freeze('2026-09-21T17:00:00-06:00'),
    });
    assert.deepEqual(afterCloseNotice, []);

    const beyond = generateSlots({
      date: '2026-10-22',
      busyIntervals: [],
      config: slotConfig(),
      now: mondayMorning,
    });
    assert.deepEqual(beyond, []);
  });

  it('omits nonexistent spring-forward times in America/Denver', () => {
    const now = freeze('2026-03-08T00:15:00-07:00');
    const slots = generateSlots({
      date: '2026-03-08',
      busyIntervals: [],
      config: slotConfig({
        tz: DENVER,
        workingDays: [7],
        workStart: { hour: 1, minute: 0 },
        workEnd: { hour: 4, minute: 0 },
        minNoticeMinutes: 0,
      }),
      now,
    });
    assertSlotInvariants(slots, DENVER);
    assert.equal(uniqueLocalDateTime(DENVER, 2026, 3, 8, 2, 0), null);
    assert.equal(uniqueLocalDateTime(DENVER, 2026, 3, 8, 2, 30), null);
    assert.equal(slots.some((slot) => slot.start.includes('T02:')), false);
    assert.equal(slots.some((slot) => slot.start === '2026-03-08T01:00:00-07:00'), true);
    assert.equal(slots.some((slot) => slot.start === '2026-03-08T03:00:00-06:00'), true);
  });

  it('omits ambiguous fall-back times in America/Denver', () => {
    const now = freeze('2026-11-01T00:15:00-06:00');
    const slots = generateSlots({
      date: '2026-11-01',
      busyIntervals: [],
      config: slotConfig({
        tz: DENVER,
        workingDays: [7],
        workStart: { hour: 1, minute: 0 },
        workEnd: { hour: 3, minute: 0 },
        minNoticeMinutes: 0,
      }),
      now,
    });
    assertSlotInvariants(slots, DENVER);
    assert.ok(uniqueLocalDateTime(DENVER, 2026, 11, 1, 1, 0) === null);
    assert.ok(uniqueLocalDateTime(DENVER, 2026, 11, 1, 1, 30) === null);
    assert.equal(slots.some((slot) => slot.start.includes('T01:')), false);
    assert.equal(slots.some((slot) => slot.start === '2026-11-01T02:00:00-07:00'), true);
  });

  it('omits nonexistent and ambiguous local times in America/Los_Angeles', () => {
    assert.equal(uniqueLocalDateTime(LA, 2026, 3, 8, 2, 30), null);
    assert.equal(uniqueLocalDateTime(LA, 2026, 11, 1, 1, 0), null);
    const spring = generateSlots({
      date: '2026-03-08',
      busyIntervals: [],
      config: slotConfig({
        tz: LA,
        workingDays: [7],
        workStart: { hour: 1, minute: 0 },
        workEnd: { hour: 4, minute: 0 },
        minNoticeMinutes: 0,
      }),
      now: freeze('2026-03-08T00:15:00-08:00'),
    });
    const fall = generateSlots({
      date: '2026-11-01',
      busyIntervals: [],
      config: slotConfig({
        tz: LA,
        workingDays: [7],
        workStart: { hour: 1, minute: 0 },
        workEnd: { hour: 3, minute: 0 },
        minNoticeMinutes: 0,
      }),
      now: freeze('2026-11-01T00:15:00-07:00'),
    });
    assertSlotInvariants(spring, LA);
    assertSlotInvariants(fall, LA);
    assert.equal(spring.some((slot) => slot.start.includes('T02:')), false);
    assert.equal(fall.some((slot) => slot.start.includes('T01:')), false);
    assert.equal(spring.some((slot) => slot.start === '2026-03-08T03:00:00-07:00'), true);
    assert.equal(fall.some((slot) => slot.start === '2026-11-01T02:00:00-08:00'), true);
  });

  it('keeps Friday and Monday offsets correct across DST with frozen clocks', () => {
    const springNow = freeze('2026-03-08T12:00:00-06:00');
    const fallNow = freeze('2026-11-01T12:00:00-07:00');
    const fridaySpring = generateSlots({
      date: '2026-03-06',
      busyIntervals: [],
      config: slotConfig({ minNoticeMinutes: 0 }),
      now: freeze('2026-03-06T07:00:00-07:00'),
    });
    const mondaySpring = generateSlots({
      date: '2026-03-09',
      busyIntervals: [],
      config: slotConfig({ minNoticeMinutes: 0 }),
      now: springNow,
    });
    const fridayFall = generateSlots({
      date: '2026-10-30',
      busyIntervals: [],
      config: slotConfig({ minNoticeMinutes: 0 }),
      now: freeze('2026-10-30T07:00:00-06:00'),
    });
    const mondayFall = generateSlots({
      date: '2026-11-02',
      busyIntervals: [],
      config: slotConfig({ minNoticeMinutes: 0 }),
      now: fallNow,
    });
    assert.ok(fridaySpring[0].start.endsWith('-07:00'));
    assert.ok(mondaySpring[0].start.endsWith('-06:00'));
    assert.ok(fridayFall[0].start.endsWith('-06:00'));
    assert.ok(mondayFall[0].start.endsWith('-07:00'));
    assert.equal(fridaySpring[fridaySpring.length - 1].start, '2026-03-06T18:30:00-07:00');
    assert.equal(fridaySpring[fridaySpring.length - 1].end, '2026-03-06T19:00:00-07:00');
    assert.equal(mondaySpring[mondaySpring.length - 1].start, '2026-03-09T18:30:00-06:00');
    assert.equal(mondaySpring[mondaySpring.length - 1].end, '2026-03-09T19:00:00-06:00');
    assert.equal(fridayFall[fridayFall.length - 1].start, '2026-10-30T18:30:00-06:00');
    assert.equal(fridayFall[fridayFall.length - 1].end, '2026-10-30T19:00:00-06:00');
    assert.equal(mondayFall[mondayFall.length - 1].start, '2026-11-02T18:30:00-07:00');
    assert.equal(mondayFall[mondayFall.length - 1].end, '2026-11-02T19:00:00-07:00');
    for (const slot of [...fridaySpring, ...mondaySpring, ...fridayFall, ...mondayFall]) {
      const start = DateTime.fromISO(slot.start, { setZone: true });
      const end = DateTime.fromISO(slot.end, { setZone: true });
      assert.equal(end.toMillis() - start.toMillis(), 1800 * 1000);
    }
  });
});

describe('consent primitives with fake token transport', () => {
  it('builds PKCE S256 and verifies state', () => {
    const pkce = createPkcePair();
    assert.equal(pkce.method, 'S256');
    assert.ok(pkce.verifier.length >= 43);
    const state = createState();
    assert.equal(statesEqual(state, state), true);
    assert.equal(statesEqual(state, createState()), false);
    assert.ok(CONSENT_SCOPES.includes('https://www.googleapis.com/auth/calendar.freebusy'));
    assert.ok(CONSENT_SCOPES.includes('https://www.googleapis.com/auth/calendar.events.owned'));
  });

  it('exchanges a code via injected fetch and does not require a token file', async () => {
    let captured = 0;
    const fakeFetch = async () => {
      captured += 1;
      return new Response(
        JSON.stringify({
          refresh_token: 'fake-refresh-for-test',
          access_token: 'fake-access',
          expires_in: 3600,
          scope: CONSENT_SCOPES.join(' '),
          token_type: 'Bearer',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };
    const tokens = await exchangeAuthorizationCode({
      fetchImpl: fakeFetch,
      clientId: 'test-client',
      clientSecret: 'test-secret',
      code: 'test-code',
      codeVerifier: 'test-verifier',
      redirectUri: 'http://127.0.0.1:9',
    });
    assert.equal(captured, 1);
    assert.equal(tokens.refreshToken, 'fake-refresh-for-test');
  });

  it('accepts a loopback callback only when state matches', async () => {
    const state = createState();
    const first = startConsentListener(state);
    const liveFirst = await first.started;
    const mismatchOutcome = first.codePromise.then(
      () => 'accepted',
      (err: unknown) => err,
    );
    const mismatch = await fetch(`${liveFirst.redirectUri}/?code=abc&state=nope`);
    assert.equal(mismatch.status, 200);
    const mismatchResult = await mismatchOutcome;
    assert.ok(mismatchResult instanceof Error);

    const second = startConsentListener(state);
    const live = await second.started;
    const ok = fetch(`${live.redirectUri}/?code=good-code&state=${encodeURIComponent(state)}`);
    const code = await second.codePromise;
    await ok;
    assert.equal(code, 'good-code');
  });
});

describe('deliverable email and escaped notes', () => {
  it('accepts normal addresses and plus tags', () => {
    assert.equal(isDeliverableEmail('jordan@example.com'), true);
    assert.equal(isDeliverableEmail('user+tag@example.com'), true);
    assert.equal(isDeliverableEmail('jordan.example@keystoneconsultingg.com'), true);
    assert.equal(isDeliverableEmail(`${'a'.repeat(64)}@example.com`), true);
  });

  it('rejects leading, trailing, consecutive dots and oversized local parts', () => {
    assert.equal(isDeliverableEmail('.a@example.com'), false);
    assert.equal(isDeliverableEmail('a..b@example.com'), false);
    assert.equal(isDeliverableEmail('a.@example.com'), false);
    assert.equal(isDeliverableEmail(`${'a'.repeat(65)}@example.com`), false);
    assert.equal(isDeliverableEmail('not-an-email'), false);
  });

  it('HTML-escapes prospect text used in event descriptions', () => {
    assert.equal(escapePlain('  hello\nworld  '), 'hello world');
    assert.equal(
      escapePlain('<script>alert(1)</script> & "notes"'),
      '&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;notes&quot;',
    );
  });
});

describe('booking HTTP handlers', () => {
  const now = () => freeze('2026-09-21T07:00:00-06:00');
  const bookBody = {
    start: '2026-09-21T10:00:00-06:00',
    name: 'Jordan Example',
    email: 'jordan@example.com',
    phone: '555-0100',
    notes: 'Fictional dry-run booking',
  };

  describe('dry-run with fake transport', () => {
    let server: LocalServer;
    before(async () => {
      server = await startLocalBookingServer({ env: DRY_ENV, now });
    });
    after(async () => {
      await server.close();
    });

    it('returns the slots contract and never inserts', async () => {
      const { res, json } = await getJson(`${server.url}/api/booking/slots?from=2026-09-21&days=1`);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('x-booking-mode'), 'dry-run');
      assert.equal(res.headers.get('cache-control'), 'no-store');
      const payload = json as { tz: string; days: Array<{ date: string; slots: Array<{ start: string; end: string }> }> };
      assert.equal(payload.tz, DENVER);
      assert.equal(payload.days.length, 1);
      assert.equal(payload.days[0].date, '2026-09-21');
      assertSlotInvariants(payload.days[0].slots, DENVER);
      assert.equal(server.transport?.counts.insert, 0);
    });

    it('rejects days=0, days=15, non-integer, duplicates, malformed dates, and out-of-horizon ranges before Google', async () => {
      const beforeCalls = { ...server.transport!.counts };
      const cases = [
        'from=2026-09-21&days=0',
        'from=2026-09-21&days=15',
        'from=2026-09-21&days=1.5',
        'from=2026-09-21&from=2026-09-22&days=1',
        'from=2026-09-21&days=1&days=2',
        'from=2026-02-31&days=1',
        'from=21-09-2026&days=1',
        'from=2026-09-18&days=1',
        `from=2026-10-10&days=${MAX_QUERY_DAYS}`,
      ];
      for (const query of cases) {
        const { res, json } = await getJson(`${server.url}/api/booking/slots?${query}`);
        assert.equal(res.status, 400, query);
        assert.deepEqual(json, { ok: false, error: { code: 'INVALID_INPUT', message: 'The request was invalid.' } });
      }
      assert.equal(server.transport!.counts.token, beforeCalls.token);
      assert.equal(server.transport!.counts.freebusy, beforeCalls.freebusy);
      assert.equal(server.transport!.counts.insert, 0);
    });

    it('returns empty slots for a past date inside the allowed lookback', async () => {
      const { res, json } = await getJson(`${server.url}/api/booking/slots?from=2026-09-19&days=1`);
      assert.equal(res.status, 200);
      const payload = json as { days: Array<{ date: string; slots: unknown[] }> };
      assert.equal(payload.days[0].date, '2026-09-19');
      assert.deepEqual(payload.days[0].slots, []);
    });

    it('iterates local calendar days across the spring DST weekend', async () => {
      const dst = await startLocalBookingServer({
        env: DRY_ENV,
        now: () => freeze('2026-03-06T07:00:00-07:00'),
      });
      try {
        const { res, json } = await getJson(`${dst.url}/api/booking/slots?from=2026-03-06&days=4`);
        assert.equal(res.status, 200);
        const payload = json as { days: Array<{ date: string }> };
        assert.deepEqual(
          payload.days.map((day) => day.date),
          ['2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09'],
        );
      } finally {
        await dst.close();
      }
    });

    it('books in dry-run without an eventId and with zero insert calls', async () => {
      const insertBefore = server.transport!.counts.insert;
      const { res, json } = await getJson(`${server.url}/api/booking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookBody),
      });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('x-booking-mode'), 'dry-run');
      const payload = json as { ok: true; eventId?: string; start: string; end: string };
      assert.equal(payload.ok, true);
      assert.equal('eventId' in payload, false);
      assert.equal(payload.start, '2026-09-21T10:00:00-06:00');
      assert.equal(payload.end, '2026-09-21T10:30:00-06:00');
      assert.equal(server.transport!.counts.insert, insertBefore);
      assert.equal(server.transport!.counts.realWrites, 0);
      assert.equal(server.transport!.counts.realInvites, 0);
    });

    it('records invite intent in dry-run from the handler without sending email or writing events', async () => {
      const transport = server.transport!;
      const insertsBefore = transport.counts.insert;
      const intentsBefore = transport.inviteIntents.length;
      const { res } = await getJson(`${server.url}/api/booking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookBody),
      });
      assert.equal(res.status, 200);
      assert.equal(transport.counts.insert, insertsBefore);
      assert.equal(transport.counts.realWrites, 0);
      assert.equal(transport.counts.realInvites, 0);
      assert.equal(transport.insertRequests.length, 0);
      assert.equal(transport.inviteIntents.length, intentsBefore + 1);
      const recorded = transport.inviteIntents[transport.inviteIntents.length - 1];
      assert.equal(recorded.sendUpdates, 'all');
      assert.equal(recorded.conferenceDataVersion, 1);
      assert.equal(recorded.attendees[0]?.email, bookBody.email);
      assert.equal(recorded.includeConference, true);
      assert.equal(recorded.summary, 'KCG call - Jordan Example');
      assert.ok(recorded.conferenceRequestId);
    });

    it('rejects invalid or empty booker email with 400 before any calendar write', async () => {
      const before = { ...server.transport!.counts };
      const cases = [
        { ...bookBody, email: '' },
        { ...bookBody, email: '   ' },
        { start: bookBody.start, name: bookBody.name },
        { ...bookBody, email: 'not-an-email' },
        { ...bookBody, email: 'jordan@' },
        { ...bookBody, email: '.a@example.com' },
        { ...bookBody, email: 'a..b@example.com' },
        { ...bookBody, email: 'a.@example.com' },
        { ...bookBody, email: `${'a'.repeat(65)}@example.com` },
      ];
      for (const body of cases) {
        const { res, json } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        assert.equal(res.status, 400, JSON.stringify(body));
        assert.deepEqual(json, { ok: false, error: { code: 'INVALID_INPUT', message: 'The request was invalid.' } });
      }
      assert.equal(server.transport!.counts.token, before.token);
      assert.equal(server.transport!.counts.freebusy, before.freebusy);
      assert.equal(server.transport!.counts.insert, before.insert);
      assert.equal(server.transport!.counts.realWrites, 0);
      assert.equal(server.transport!.counts.realInvites, 0);
    });

    it('accepts a plus-tagged delivery address in dry-run', async () => {
      const { res, json } = await getJson(`${server.url}/api/booking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookBody, email: 'jordan+visit@example.com' }),
      });
      assert.equal(res.status, 200);
      assert.equal((json as { ok: true }).ok, true);
      assert.equal(server.transport!.counts.insert, 0);
    });

    it('returns 405 for the wrong methods', async () => {
      const postSlots = await getJson(`${server.url}/api/booking/slots?from=2026-09-21&days=1`, { method: 'POST' });
      assert.equal(postSlots.res.status, 405);
      assert.equal(postSlots.res.headers.get('allow'), 'GET');
      const getBook = await getJson(`${server.url}/api/booking/book`);
      assert.equal(getBook.res.status, 405);
      assert.equal(getBook.res.headers.get('allow'), 'POST');
    });

    it('rejects unknown keys, arrays, and oversize or non-json bodies', async () => {
      const unknown = await getJson(`${server.url}/api/booking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookBody, calendarId: CAL_ID }),
      });
      assert.equal(unknown.res.status, 400);
      const arrayBody = await getJson(`${server.url}/api/booking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([bookBody]),
      });
      assert.equal(arrayBody.res.status, 400);
      const form = await getJson(`${server.url}/api/booking/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'start=2026-09-21T10:00:00-06:00',
      });
      assert.equal(form.res.status, 400);
    });

    it('serves SPA HTML for a deep service path', async () => {
      const res = await fetch(`${server.url}/services/web-design`);
      const text = await res.text();
      assert.equal(res.headers.get('content-type')?.includes('text/html'), true);
      assert.equal(text.includes('<html>'), true);
      assert.equal(text.trim().startsWith('{'), false);
    });
  });

  describe('fail closed', () => {
    it('returns 503 rather than free availability when credentials are missing', async () => {
      const server = await startLocalBookingServer({
        env: { BOOKING_DRY_RUN: 'true', BOOKING_TZ: DENVER },
        now,
        transport: null,
      });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/slots?from=2026-09-21&days=1`);
        assert.equal(res.status, 503);
        assert.deepEqual(json, {
          ok: false,
          error: { code: 'BOOKING_UNAVAILABLE', message: 'Online booking is unavailable.' },
        });
      } finally {
        await server.close();
      }
    });

    it('returns 503 when Google omits the calendar or reports a per-calendar error', async () => {
      const transport = createFakeGoogleTransport();
      transport.omitCalendar(true);
      const server = await startLocalBookingServer({ env: DRY_ENV, now, transport });
      try {
        const missing = await getJson(`${server.url}/api/booking/slots?from=2026-09-21&days=1`);
        assert.equal(missing.res.status, 503);
      } finally {
        await server.close();
      }

      const errored = createFakeGoogleTransport();
      errored.setCalendarErrors([{ reason: 'notFound' }]);
      const server2 = await startLocalBookingServer({ env: DRY_ENV, now, transport: errored });
      try {
        const { res } = await getJson(`${server2.url}/api/booking/slots?from=2026-09-21&days=1`);
        assert.equal(res.status, 503);
      } finally {
        await server2.close();
      }
    });

    it('returns 503 and zero inserts for malformed freebusy payloads', async () => {
      const payloads: unknown[] = [
        { calendars: { fake: {} } },
        { calendars: { [CAL_ID]: {} } },
        { calendars: { [CAL_ID]: { busy: null } } },
        { calendars: { [CAL_ID]: { busy: 'nope' } } },
        { calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21T10:00:00-06:00' }] } } },
        { calendars: { [CAL_ID]: { busy: [{ start: 'not-a-time', end: 'also-bad' }] } } },
        { calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21T11:00:00-06:00', end: '2026-09-21T10:00:00-06:00' }] } } },
        { calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21T09:00:00', end: '2026-09-21T10:00:00' }] } } },
        { calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21T09:00:00-06:00', end: 'not-a-time' }] } } },
        { calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21T25:00:00-06:00', end: '2026-09-21T26:00:00-06:00' }] } } },
        { calendars: { [CAL_ID]: { busy: [{ start: '2026-13-40T09:00:00-06:00', end: '2026-13-40T10:00:00-06:00' }] } } },
        { calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21 09:00:00-06:00', end: '2026-09-21 10:00:00-06:00' }] } } },
      ];
      for (const payload of payloads) {
        const transport = createFakeGoogleTransport();
        transport.setFreeBusyPayload(payload);
        const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
        try {
          const slots = await getJson(`${server.url}/api/booking/slots?from=2026-09-21&days=1`);
          assert.equal(slots.res.status, 503, JSON.stringify(payload));
          const booked = await getJson(`${server.url}/api/booking/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookBody),
          });
          assert.equal(booked.res.status, 503, JSON.stringify(payload));
          assert.equal(transport.counts.insert, 0, JSON.stringify(payload));
        } finally {
          await server.close();
        }
      }
    });

    it('treats a valid empty busy array as free', async () => {
      const transport = createFakeGoogleTransport();
      transport.setFreeBusyPayload({ calendars: { [CAL_ID]: { busy: [] } } });
      const server = await startLocalBookingServer({ env: DRY_ENV, now, transport });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/slots?from=2026-09-21&days=1`);
        assert.equal(res.status, 200);
        const payload = json as { days: Array<{ slots: unknown[] }> };
        assert.ok(payload.days[0].slots.length > 0);
        assert.equal(transport.counts.insert, 0);
      } finally {
        await server.close();
      }
    });

    it('rejects the offset-less freebusy repro with 503 and zero inserts', async () => {
      const transport = createFakeGoogleTransport();
      transport.setFreeBusyPayload({
        calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21T09:00:00', end: '2026-09-21T10:00:00' }] } },
      });
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const booked = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(booked.res.status, 503);
        assert.equal(transport.counts.insert, 0);
      } finally {
        await server.close();
      }
    });

    it('keeps date-only busy intervals as all-day handling', async () => {
      const transport = createFakeGoogleTransport();
      transport.setFreeBusyPayload({
        calendars: { [CAL_ID]: { busy: [{ start: '2026-09-21', end: '2026-09-21' }] } },
      });
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const slots = await getJson(`${server.url}/api/booking/slots?from=2026-09-21&days=1`);
        assert.equal(slots.res.status, 200);
        const payload = slots.json as { days: Array<{ slots: unknown[] }> };
        assert.equal(payload.days[0].slots.length, 0);
        const booked = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(booked.res.status, 409);
        assert.equal(transport.counts.insert, 0);
      } finally {
        await server.close();
      }
    });

    it('does not interpret offset-less timestamps using the process zone', () => {
      const previous = Settings.defaultZone;
      try {
        for (const zone of ['UTC', 'Pacific/Auckland', 'America/New_York', 'America/Denver']) {
          Settings.defaultZone = zone;
          assert.equal(
            parseBusyBoundary('2026-09-21T09:00:00', DENVER, false),
            null,
            zone,
          );
          assert.equal(
            parseBusyBoundary('2026-09-21T09:00:00', DENVER, true),
            null,
            zone,
          );
          const withOffset = parseBusyBoundary('2026-09-21T09:00:00-06:00', DENVER, false);
          assert.equal(withOffset, DateTime.fromISO('2026-09-21T09:00:00-06:00', { setZone: true }).toMillis(), zone);
          const dateOnly = parseBusyBoundary('2026-09-21', DENVER, false);
          assert.equal(dateOnly, DateTime.fromISO('2026-09-21', { zone: DENVER }).startOf('day').toMillis(), zone);
        }
      } finally {
        Settings.defaultZone = previous;
      }
    });
  });

  describe('live branch with fake Google only', () => {
    it('rechecks freebusy immediately before insert', async () => {
      const transport = createFakeGoogleTransport();
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(res.status, 200);
        const payload = json as { ok: true; eventId: string; start: string; end: string };
        assert.equal(payload.ok, true);
        assert.ok(payload.eventId);
        assert.ok(transport.calls.includes('freebusy'));
        assert.ok(transport.calls.includes('insert'));
        assert.ok(transport.calls.lastIndexOf('freebusy') < transport.calls.lastIndexOf('insert'));
        assert.equal(transport.counts.realWrites, 0);
        assert.equal(transport.counts.realInvites, 0);
        const inserted = transport.insertRequests[0];
        assert.ok(inserted);
        assert.equal(inserted.sendUpdates, 'all');
        assert.equal(inserted.conferenceDataVersion, '1');
        const attendees = inserted.attendees as Array<{ email: string }>;
        assert.equal(attendees[0]?.email, bookBody.email);
        assert.ok(inserted.conferenceRequestId);
        assert.equal(inserted.body.summary, 'KCG call - Jordan Example');
        assert.equal(transport.counts.insert, 1);
      } finally {
        await server.close();
      }
    });

    it('treats 200 and 201 conference payloads as success and inserts once', async () => {
      for (const mode of ['ok', 'ok201', 'ok202', 'ok206', 'ok299'] as const) {
        const transport = createFakeGoogleTransport();
        transport.setInsertMode(mode);
        const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
        try {
          const { res, json } = await getJson(`${server.url}/api/booking/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookBody),
          });
          assert.equal(res.status, 200, mode);
          assert.equal((json as { ok: true }).ok, true, mode);
          assert.equal(transport.counts.insert, 1, mode);
        } finally {
          await server.close();
        }
      }
    });

    it('uses a unique conference requestId per booking and emails the invite', async () => {
      const transport = createFakeGoogleTransport();
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const first = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        const second = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...bookBody, start: '2026-09-21T10:30:00-06:00' }),
        });
        assert.equal(first.res.status, 200);
        assert.equal(second.res.status, 200);
        assert.equal(transport.insertRequests.length, 2);
        const ids = transport.insertRequests.map((item) => item.conferenceRequestId);
        assert.ok(ids[0]);
        assert.ok(ids[1]);
        assert.notEqual(ids[0], ids[1]);
        for (const item of transport.insertRequests) {
          assert.equal(item.sendUpdates, 'all');
          assert.equal(item.conferenceDataVersion, '1');
          assert.equal((item.attendees as Array<{ email: string }>)[0]?.email, bookBody.email);
        }
        assert.equal(transport.counts.realInvites, 0);
        assert.equal(transport.counts.realWrites, 0);
      } finally {
        await server.close();
      }
    });

    it('still books and emails the invite when Meet conference creation fails', async () => {
      const transport = createFakeGoogleTransport();
      transport.setInsertMode('conference');
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(res.status, 200);
        assert.equal((json as { ok: true }).ok, true);
        assert.equal(transport.counts.insert, 2);
        assert.equal(transport.insertRequests.length, 2);
        const [failedMeet, fallback] = transport.insertRequests;
        assert.equal(failedMeet.sendUpdates, 'all');
        assert.equal(failedMeet.conferenceDataVersion, '1');
        assert.ok(failedMeet.body.conferenceData);
        assert.equal(fallback.sendUpdates, 'all');
        assert.equal(fallback.conferenceDataVersion, null);
        assert.equal('conferenceData' in fallback.body, false);
        assert.equal((fallback.attendees as Array<{ email: string }>)[0]?.email, bookBody.email);
        assert.equal(transport.counts.realInvites, 0);
        assert.equal(transport.counts.realWrites, 0);
      } finally {
        await server.close();
      }
    });

    it('does not retry unrelated 4xx, 5xx, timeout, or auth/quota errors that mention conferenceData', async () => {
      for (const mode of ['unrelated400', 'server500', 'timeout', 'rateLimitConference', 'quota', 'forbidden'] as const) {
        const transport = createFakeGoogleTransport();
        transport.setInsertMode(mode);
        const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
        try {
          const { res } = await getJson(`${server.url}/api/booking/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookBody),
          });
          assert.equal(res.status, 503, mode);
          assert.equal(transport.counts.insert, 1, mode);
        } finally {
          await server.close();
        }
      }
    });

    it('falls back once for an explicit invalidConferenceType rejection', async () => {
      const transport = createFakeGoogleTransport();
      transport.setInsertMode('invalidConferenceType');
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(res.status, 200);
        assert.equal((json as { ok: true }).ok, true);
        assert.equal(transport.counts.insert, 2);
        assert.equal('conferenceData' in transport.insertRequests[1].body, false);
        assert.equal(transport.insertRequests[1].sendUpdates, 'all');
      } finally {
        await server.close();
      }
    });

    it('keeps markup in notes literal in the event description', async () => {
      const transport = createFakeGoogleTransport();
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const { res } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bookBody,
            notes: '<b>not html</b> & more',
          }),
        });
        assert.equal(res.status, 200);
        const description = String(transport.insertRequests[0]?.body.description ?? '');
        assert.equal(description.includes('<b>'), false);
        assert.equal(description.includes('&lt;b&gt;not html&lt;/b&gt; &amp; more'), true);
      } finally {
        await server.close();
      }
    });

    it('rejects invalid booker email on the live branch before any calendar write', async () => {
      const transport = createFakeGoogleTransport();
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        for (const email of ['.a@example.com', 'a..b@example.com', 'a.@example.com', `${'a'.repeat(65)}@example.com`]) {
          const { res, json } = await getJson(`${server.url}/api/booking/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...bookBody, email }),
          });
          assert.equal(res.status, 400, email);
          assert.equal((json as { error: { code: string } }).error.code, 'INVALID_INPUT', email);
        }
        assert.equal(transport.counts.token, 0);
        assert.equal(transport.counts.freebusy, 0);
        assert.equal(transport.counts.insert, 0);
      } finally {
        await server.close();
      }
    });

    it('returns 409 without insert when the recheck shows busy', async () => {
      const transport = createFakeGoogleTransport();
      transport.setBusy([{ start: '2026-09-21T10:00:00-06:00', end: '2026-09-21T10:30:00-06:00' }]);
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(res.status, 409);
        assert.deepEqual(json, {
          ok: false,
          error: { code: 'SLOT_TAKEN', message: 'That time is no longer available.' },
        });
        assert.equal(transport.counts.freebusy, 1);
        assert.equal(transport.counts.insert, 0);
      } finally {
        await server.close();
      }
    });

    it('maps duplicate event IDs to 409', async () => {
      const transport = createFakeGoogleTransport();
      transport.setInsertMode('duplicate');
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(res.status, 409);
        assert.equal((json as { error: { code: string } }).error.code, 'SLOT_TAKEN');
        assert.equal(transport.counts.insert, 1);
      } finally {
        await server.close();
      }
    });

    it('never auto-retries a timed-out insert', async () => {
      const transport = createFakeGoogleTransport();
      transport.setInsertMode('timeout');
      const server = await startLocalBookingServer({ env: LIVE_ENV, now, transport });
      try {
        const { res, json } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(res.status, 503);
        assert.equal((json as { error: { code: string } }).error.code, 'BOOKING_UNAVAILABLE');
        assert.equal(transport.counts.insert, 1);
      } finally {
        await server.close();
      }
    });

    it('does not insert when the notice cutoff is crossed during freebusy', async () => {
      let calls = 0;
      const advancingNow = () => {
        calls += 1;
        return calls === 1 ? freeze('2026-09-21T07:50:00-06:00') : freeze('2026-09-21T08:01:00-06:00');
      };
      const transport = createFakeGoogleTransport();
      const server = await startLocalBookingServer({ env: LIVE_ENV, now: advancingNow, transport });
      try {
        const { res } = await getJson(`${server.url}/api/booking/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookBody),
        });
        assert.equal(res.status, 409);
        assert.equal(transport.counts.insert, 0);
        assert.ok(transport.counts.freebusy >= 1);
      } finally {
        await server.close();
      }
    });
  });
});
