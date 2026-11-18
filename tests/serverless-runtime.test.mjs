import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Plain Node, no tsx; data URLs prove the bundles need no adjacent source/JSON.
globalThis.fetch = () => { throw new Error('Network forbidden in runtime smoke test'); };
async function load(name) {
  const code = await readFile(`server/generated/functions/${name}.mjs`, 'utf8');
  return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default;
}
async function invoke(handler, url, method = 'GET', body) {
  const headers = {};
  let result;
  const res = { statusCode: 200, setHeader(k, v) { headers[k.toLowerCase()] = v; }, end(raw) { result = JSON.parse(raw); } };
  await handler({ url, method, body, headers: { host: 'test.example', origin: 'https://test.example', 'content-type': 'application/json' }, socket: { remoteAddress: '192.0.2.1' } }, res);
  assert.match(headers['content-type'], /application\/json/);
  return { status: res.statusCode, body: result };
}
test('bundled widget dispatch handles original and rewritten URLs without source files', async () => {
  const handler = await load('widget');
  for (const url of ['/api/widget/status', '/api/widget?__widget_path=widget/status']) {
    const result = await invoke(handler, url);
    assert.equal(result.status, 200);
    assert.equal(result.body.available, true);
  }
  assert.equal((await invoke(handler, '/api/widget?__widget_path=widget/chat', 'POST', { question: 'Square' })).status, 200);
  assert.equal((await invoke(handler, '/api/widget?__widget_path=contact', 'POST')).status, 503);
  assert.equal((await invoke(handler, '/api/widget?__widget_path=widget/unknown')).status, 404);
  assert.equal((await invoke(handler, '/api/widget/status', 'POST')).status, 405);
});
test('both booking bundles load in Node ESM and reject wrong methods without network', async () => {
  assert.equal((await invoke(await load('book'), '/api/booking/book')).status, 405);
  assert.equal((await invoke(await load('slots'), '/api/booking/slots', 'POST')).status, 405);
});
