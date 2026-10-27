import assert from 'node:assert/strict';
import { beforeEach, afterEach, test, mock } from 'node:test';
import type { ServerResponse } from 'node:http';
import spamCheckEndpoint from '../api/spam-check';
import { spamCheck } from '../src/lib/spamCheck';
import tokenEndpoint from '../api/form-token';
import { handleBookRequest } from '../api/booking/book';
import { CONFIG } from '../lib/spam-guard-config';
import { issueFormToken, verifyFormToken, __resetRateLimit } from '../lib/spam-guard';
import type { BookingIncoming } from '../lib/booking/validation';
import { createFakeGoogleTransport } from './booking/local-server';

const start = '2026-09-21T09:00:00-06:00';
const end = '2026-09-21T09:30:00-06:00';
const env = {
  BOOKING_DRY_RUN: 'false', BOOKING_TZ: 'America/Denver',
  BOOKING_CALENDAR_ID: 'test@example.com', GOOGLE_CLIENT_ID: 'test',
  GOOGLE_CLIENT_SECRET: 'test', GOOGLE_REFRESH_TOKEN: 'test',
};
beforeEach(() => {
  __resetRateLimit();
  mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network call'); });
  mock.method(console, 'warn', () => {});
  mock.method(console, 'log', () => {});
});
afterEach(() => { mock.restoreAll(); });
function request(body: unknown, method = 'POST'): BookingIncoming {
  return { method, body, headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1' } } as unknown as BookingIncoming;
}
function response() {
  const result = { status: 0, body: null as any, headers: {} as Record<string, string> };
  const res = {
    statusCode: 200, writableEnded: false,
    setHeader(name: string, value: string) { result.headers[name.toLowerCase()] = value; },
    end(body: string) { result.status = this.statusCode; result.body = JSON.parse(body); },
  } as unknown as ServerResponse;
  return { res, result };
}
const lead = () => ({
  name: 'Jane Example', email: 'jane@example.com',
  company_website: '', _sg_t: issueFormToken(CONFIG, Date.now() - 3100),
});
const pitch = 'We can get your site on the first page of Google with our SEO services';

for (const endpoint of ['spam-check', 'booking'] as const) {
  async function invoke(extra: Record<string, unknown> = {}, dryRun = false) {
    const transport = createFakeGoogleTransport();
    const { res, result } = response();
    const body = { ...lead(), ...(endpoint === 'booking' ? { start } : {}), ...extra };
    if (endpoint === 'spam-check') await spamCheckEndpoint(request(body), res);
    else await handleBookRequest(request(body), res, {
      env: { ...env, BOOKING_DRY_RUN: String(dryRun) },
      now: () => new Date('2026-09-21T07:00:00-06:00'),
      fetchImpl: transport.fetchImpl,
      onDryRunIntent: transport.recordIntent,
    });
    return { result, transport, body };
  }
  for (const missingToken of [false, true]) {
    test(endpoint + ': legitimate marketing lead permits delivery after 3.1s' + (missingToken ? ' without token' : ''), async () => {
      const text = 'I need SEO and digital marketing services for my business.';
      const { result, transport } = await invoke({
        [endpoint === 'spam-check' ? 'message' : 'notes']: text,
        ...(missingToken ? { _sg_t: '' } : {}),
      });
      assert.equal(result.status, 200);
      if (endpoint === 'spam-check') {
        assert.deepEqual(result.body, { success: true, deliver: true });
        assert.equal((fetch as any).mock.callCount(), 0);
      } else {
        assert.deepEqual(result.body, { ok: true, eventId: 'fake-event-id', start, end });
        assert.equal(transport.counts.insert, 1);
        const stored = JSON.stringify(transport.insertRequests[0].body);
        assert.ok(!stored.includes('_sg_t'));
        assert.ok(!stored.includes('company_website'));
      }
    });
  }
  for (const scenario of ['honeypot', 'too-fast', 'pitch', 'rate-limit']) {
    test(endpoint + ': ' + scenario + ' silently succeeds without forwarding', async () => {
      if (scenario === 'rate-limit') {
        for (let i = 0; i < 5; i++) await invoke();
      }
      const extra = scenario === 'honeypot' ? { company_website: 'bot' }
        : scenario === 'too-fast' ? { _sg_t: issueFormToken(CONFIG) }
        : scenario === 'pitch' ? { [endpoint === 'spam-check' ? 'message' : 'notes']: pitch } : {};
      const { result, transport } = await invoke(extra);
      assert.equal(result.status, 200);
      if (endpoint === 'spam-check') assert.deepEqual(result.body, { success: true, deliver: false });
      else {
        assert.deepEqual(Object.keys(result.body).sort(), ['end', 'eventId', 'ok', 'start']);
        assert.equal(result.body.ok, true);
        assert.equal(result.body.start, start);
        assert.equal(result.body.end, end);
        assert.equal(result.headers['x-booking-mode'], 'live');
      }
      assert.equal((fetch as any).mock.callCount(), 0);
      assert.deepEqual(transport.calls, []);
      assert.equal(transport.inviteIntents.length, 0);
      const warnings = (console.warn as any).mock.calls;
      assert.equal(warnings.at(-1).arguments[0], '[spam-guard]');
      assert.equal(warnings.at(-1).arguments.length, 3);
    });
  }
  if (endpoint === 'booking') {
    test('booking: dry-run spam preserves success shape without intent', async () => {
      const { result, transport } = await invoke({ company_website: 'bot' }, true);
      assert.deepEqual(result.body, { ok: true, start, end });
      assert.equal(result.headers['x-booking-mode'], 'dry-run');
      assert.deepEqual(transport.calls, []);
      assert.equal(transport.inviteIntents.length, 0);
    });
  }
}
test('token endpoint issues valid uncached token and rejects POST', () => {
  const { res, result } = response();
  tokenEndpoint(request(undefined, 'GET'), res);
  assert.equal(result.status, 200);
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.equal(verifyFormToken(result.body.t, CONFIG).valid, true);
  const rejected = response();
  tokenEndpoint(request({}), rejected.res);
  assert.equal(rejected.result.status, 405);
});
test('spam-check rejects non-POST and invalid JSON without fetch', async () => {
  for (const [body, method, status] of [[{}, 'GET', 405], ['{', 'POST', 400], [[], 'POST', 400]] as const) {
    const { res, result } = response();
    await spamCheckEndpoint(request(body, method), res);
    assert.equal(result.status, status);
    if (status === 405) assert.equal(result.headers.allow, 'POST');
  }
  assert.equal((fetch as any).mock.callCount(), 0);
});

for (const [label, body, status, expected] of [
  ['allow', { success: true, deliver: true }, 200, true],
  ['drop', { success: true, deliver: false }, 200, false],
  ['server error', { success: true, deliver: false }, 500, true],
  ['missing verdict', { success: true }, 200, true],
  ['invalid verdict', { success: true, deliver: 'false' }, 200, true],
  ['unsuccessful check', { success: false, deliver: false }, 200, true],
  ['null response', null, 200, true],
] as const) {
  test('client spam check: ' + label, async () => {
    const fields = lead();
    mock.method(globalThis, 'fetch', async (url, init) => {
      assert.equal(url, '/api/spam-check');
      assert.equal(init?.method, 'POST');
      assert.deepEqual(JSON.parse(String(init?.body)), fields);
      return Response.json(body, { status });
    });
    assert.equal(await spamCheck(fields), expected);
  });
}
test('client spam check fails open on network and JSON errors', async () => {
  assert.equal(await spamCheck(lead()), true);
  mock.method(globalThis, 'fetch', async () => new Response('invalid JSON'));
  assert.equal(await spamCheck(lead()), true);
});
test('client spam check fails open after 3s even if response body hangs', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let signal: AbortSignal | undefined;
  mock.method(globalThis, 'fetch', async (_url, init) => {
    signal = init?.signal ?? undefined;
    return { ok: true, json: () => new Promise(() => {}) } as Response;
  });
  const result = spamCheck(lead());
  t.mock.timers.tick(3000);
  assert.equal(await result, true);
  assert.equal(signal?.aborted, true);
});
