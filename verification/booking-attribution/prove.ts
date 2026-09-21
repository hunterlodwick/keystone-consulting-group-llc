/** Explicit operator proof: one private, transparent, attendee-free event, then delete. */
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { calendarAccess } from '../../scripts/booking-report.mjs';
import { buildBookingEventRequest } from '../../lib/booking/google';

if (!process.argv.includes('--run')) throw new Error('Use --run to explicitly authorize the controlled Calendar proof.');
const access = await calendarAccess();
const id = `kcgattr${randomBytes(12).toString('hex')}`;
const startMs = Date.now() - 86400000;
const request = buildBookingEventRequest({ calendarId: 'unused', tz: access.tz, startMs, endMs: startMs + 1800000,
  name: 'Attribution API proof (temporary)', email: 'unused@example.com', requestId: id, includeConference: false,
  bookedAt: new Date(), kcgPage: '/__attribution-api-proof', kcgCta: 'Controlled API proof', kcgReferrer: 'direct', kcgWidget: 'modal' });
const body = { ...request.body, id, attendees: [], transparency: 'transparent', reminders: { useDefault: false } };
const params = new URLSearchParams({ privateExtendedProperty: 'kcgSource=website', timeMin: new Date(startMs - 60000).toISOString(),
  timeMax: new Date(startMs + 1800001).toISOString(), showDeleted: 'false', fields: 'items(id,status,summary,start,colorId,extendedProperties),nextPageToken' });
const evidence: Record<string, unknown> = { testEventId: id, filter: 'privateExtendedProperty=kcgSource=website' };
const save = () => writeFileSync(new URL('./calendar-proof.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
save();
try {
  const insert = await fetch(`${access.baseUrl}?sendUpdates=none`, { method: 'POST', headers: access.headers, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  evidence.insertStatus = insert.status;
  assert.equal(insert.status, 200);
  const result = await fetch(`${access.baseUrl}?${params}`, { headers: access.headers, signal: AbortSignal.timeout(15000) });
  evidence.filterStatus = result.status;
  evidence.rawFilterResult = await result.json();
  assert.equal(result.status, 200);
  assert.ok((evidence.rawFilterResult as any).items.some((event: any) => event.id === id && event.extendedProperties.private.kcgSource === 'website'));
} finally {
  const deletion = await fetch(`${access.baseUrl}/${id}?sendUpdates=none`, { method: 'DELETE', headers: access.headers, signal: AbortSignal.timeout(15000) });
  evidence.deleteStatus = deletion.status;
  save();
  assert.equal(deletion.status, 204);
  const get = await fetch(`${access.baseUrl}/${id}?fields=id,status`, { headers: access.headers, signal: AbortSignal.timeout(15000) });
  evidence.afterDeleteGetStatus = get.status;
  const getBody = await get.json();
  evidence.afterDeleteGet = getBody;
  assert.ok(get.status === 404 || get.status === 410 || (get.status === 200 && getBody.status === 'cancelled'));
  const filtered = await fetch(`${access.baseUrl}?${params}`, { headers: access.headers, signal: AbortSignal.timeout(15000) });
  assert.equal(filtered.status, 200);
  const after = await filtered.json();
  evidence.afterDeleteFilter = after;
  assert.ok(!after.items?.some((event: any) => event.id === id));
  evidence.cleanupVerified = true;
  save();
}
console.log(JSON.stringify(evidence, null, 2));
