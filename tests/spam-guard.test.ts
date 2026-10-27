import assert from 'node:assert/strict';
import { beforeEach, afterEach, test, mock } from 'node:test';
import type { ServerResponse } from 'node:http';
import contact from '../api/contact';
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
const originalKey = process.env.WEB3FORMS_ACCESS_KEY;
const fallbackKey = process.env.VITE_WEB3FORMS_ACCESS_KEY;
beforeEach(() => {
  __resetRateLimit();
  process.env.WEB3FORMS_ACCESS_KEY = 'test-key';
  mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network call'); });
  mock.method(console, 'warn', () => {});
  mock.method(console, 'log', () => {});
});
afterEach(() => {
  mock.restoreAll();
  if (originalKey === undefined) delete process.env.WEB3FORMS_ACCESS_KEY;
  else process.env.WEB3FORMS_ACCESS_KEY = originalKey;
  if (fallbackKey === undefined) delete process.env.VITE_WEB3FORMS_ACCESS_KEY;
  else process.env.VITE_WEB3FORMS_ACCESS_KEY = fallbackKey;
});
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
  company_website: '', _sg_t: issueFormToken(CONFIG, Date.now() - 5000),
});
const pitch = 'We can get your site on the first page of Google with our SEO services';

for (const endpoint of ['contact', 'booking'] as const) {
  async function invoke(extra: Record<string, unknown> = {}, dryRun = false) {
    const calls: Record<string, unknown>[] = [];
    const transport = createFakeGoogleTransport();
    mock.method(globalThis, 'fetch', async (url, init) => {
      assert.equal(url, 'https://api.web3forms.com/submit');
      calls.push(JSON.parse(String(init?.body)));
      return Response.json({ success: true, message: 'Thanks', data: { id: 'test' } });
    });
    const { res, result } = response();
    const body = { ...lead(), ...(endpoint === 'booking' ? { start } : {}), ...extra };
    if (endpoint === 'contact') await contact(request(body), res);
    else await handleBookRequest(request(body), res, {
      env: { ...env, BOOKING_DRY_RUN: String(dryRun) },
      now: () => new Date('2026-09-21T07:00:00-06:00'),
      fetchImpl: transport.fetchImpl,
      onDryRunIntent: transport.recordIntent,
    });
    return { result, calls, transport, body };
  }
  for (const missingToken of [false, true]) {
    test(endpoint + ': legitimate marketing lead forwards' + (missingToken ? ' without token' : ''), async () => {
      const text = 'I need SEO and digital marketing services for my business.';
      const { result, calls, transport } = await invoke({
        [endpoint === 'contact' ? 'message' : 'notes']: text,
        ...(missingToken ? { _sg_t: '' } : {}),
      });
      assert.equal(result.status, 200);
      if (endpoint === 'contact') {
        assert.deepEqual(result.body, { success: true, message: 'Thanks', data: { id: 'test' } });
        assert.equal(calls.length, 1);
        assert.equal(calls[0].message, text);
        assert.equal(calls[0].access_key, 'test-key');
        assert.ok(!('company_website' in calls[0]));
        assert.ok(!('_sg_t' in calls[0]));
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
        : scenario === 'pitch' ? { [endpoint === 'contact' ? 'message' : 'notes']: pitch } : {};
      const { result, calls, transport } = await invoke(extra);
      assert.equal(result.status, 200);
      if (endpoint === 'contact') assert.deepEqual(result.body, { success: true, message: 'ok' });
      else {
        assert.deepEqual(Object.keys(result.body).sort(), ['end', 'eventId', 'ok', 'start']);
        assert.equal(result.body.ok, true);
        assert.equal(result.body.start, start);
        assert.equal(result.body.end, end);
        assert.equal(result.headers['x-booking-mode'], 'live');
      }
      assert.equal(calls.length, 0);
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
test('contact uses fallback server key and preserves upstream errors', async () => {
  delete process.env.WEB3FORMS_ACCESS_KEY;
  process.env.VITE_WEB3FORMS_ACCESS_KEY = 'fallback-test-key';
  mock.method(globalThis, 'fetch', async (_url, init) => {
    assert.equal(JSON.parse(String(init?.body)).access_key, 'fallback-test-key');
    return Response.json({ success: false, message: 'Invalid email' }, { status: 400 });
  });
  const { res, result } = response();
  await contact(request({ ...lead(), access_key: 'untrusted' }), res);
  assert.equal(result.status, 400);
  assert.deepEqual(result.body, { success: false, message: 'Invalid email' });
});
