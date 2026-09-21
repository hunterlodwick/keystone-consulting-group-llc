#!/usr/bin/env node
/** Read-only report by meeting start date (not booking submission date).
 * Usage: node scripts/booking-report.mjs [--from=YYYY-MM-DD] [--days=N]
 * Default: last 30 calendar days including today, in the booking timezone.
 * Only new tagged bookings appear; existing bookings are NOT retroactively tagged.
 */
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DateTime } from 'luxon';
import { TOKEN_ENDPOINT } from './google-consent.mjs';

export async function calendarAccess() {
  let credentials;
  try { credentials = JSON.parse(await readFile(join(homedir(), '.kcg-secrets/oauth.json'), 'utf8')); }
  catch { throw new Error('Missing or invalid credentials at ~/.kcg-secrets/oauth.json.'); }
  for (const key of ['client_id', 'client_secret', 'refresh_token', 'calendar_id']) {
    if (typeof credentials[key] !== 'string' || !credentials[key].trim()) {
      throw new Error(`Missing credential field ${key} in ~/.kcg-secrets/oauth.json.`);
    }
  }
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST', signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ grant_type: 'refresh_token', client_id: credentials.client_id,
      client_secret: credentials.client_secret, refresh_token: credentials.refresh_token }),
  });
  if (!response.ok) throw new Error(`Google token refresh failed (HTTP ${response.status}).`);
  const token = await response.json();
  if (typeof token.access_token !== 'string') throw new Error('Google token response was invalid.');
  return {
    baseUrl: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(credentials.calendar_id)}/events`,
    headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    tz: credentials.tz || 'America/Denver',
  };
}

export function reportRange(argv, tz, now = DateTime.now()) {
  const flags = {};
  for (const arg of argv) {
    const match = /^--(from|days)=(.+)$/.exec(arg);
    if (!match || flags[match[1]] !== undefined) throw new Error('Usage: booking-report.mjs [--from=YYYY-MM-DD] [--days=N]');
    flags[match[1]] = match[2];
  }
  const days = flags.days === undefined ? 30 : Number(flags.days);
  if (!Number.isInteger(days) || days < 1 || days > 3660) throw new Error('--days must be an integer from 1 to 3660.');
  const from = flags.from === undefined ? now.setZone(tz).startOf('day').minus({ days: days - 1 }) : DateTime.fromISO(flags.from, { zone: tz });
  if (!from.isValid || (flags.from !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(flags.from) || from.toISODate() !== flags.from))) {
    throw new Error('--from must be a valid YYYY-MM-DD date.');
  }
  return { from, until: from.plus({ days }), tz };
}

export async function listWebsiteBookings(access, range, fetchImpl = fetch) {
  const events = [];
  const params = new URLSearchParams({ privateExtendedProperty: 'kcgSource=website',
    timeMin: range.from.toISO(), timeMax: range.until.toISO(), timeZone: range.tz,
    singleEvents: 'true', showDeleted: 'false', orderBy: 'startTime', maxResults: '2500' });
  do {
    const response = await fetchImpl(`${access.baseUrl}?${params}`, { headers: access.headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Google events.list failed (HTTP ${response.status}).`);
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error('Google events.list response was invalid.');
    for (const event of data.items) {
      // timeMin filters event END; enforce meeting START for exact report boundaries.
      const start = DateTime.fromISO(event.start?.dateTime || event.start?.date || '', { zone: range.tz });
      if (start >= range.from && start < range.until && event.status !== 'cancelled') events.push(event);
    }
    if (!data.nextPageToken) break;
    params.set('pageToken', data.nextPageToken);
  } while (true);
  return events;
}

const safe = value => String(value).replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ');
export function formatReport(events, range) {
  const lines = [`Website bookings: ${range.from.toISODate()} through ${range.until.minus({ days: 1 }).toISODate()} (${range.tz}; meeting start date)`, `Total website bookings: ${events.length}`];
  for (const [label, key] of [['Page', 'kcgPage'], ['CTA', 'kcgCta'], ['Referrer', 'kcgReferrer']]) {
    const groups = new Map();
    for (const event of events) {
      const value = event.extendedProperties?.private?.[key] || 'unknown';
      groups.set(value, (groups.get(value) || 0) + 1);
    }
    lines.push(`\nBy ${label}:`);
    for (const [value, count] of [...groups].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) lines.push(`  ${count}  ${safe(value)}`);
    if (!groups.size) lines.push('  (none)');
  }
  lines.push('\nDate/time | Name | Email | Page');
  for (const event of events) {
    const attendee = event.attendees?.find(a => !a.organizer && !a.self);
    lines.push([DateTime.fromISO(event.start.dateTime || event.start.date, { zone: range.tz }).setZone(range.tz).toFormat('yyyy-MM-dd HH:mm ZZZZ'),
      (event.summary || '').replace(/^KCG call - /, ''), attendee?.email || '(none)', event.extendedProperties?.private?.kcgPage || 'unknown'].map(safe).join(' | '));
  }
  if (!events.length) lines.push('(none)');
  lines.push('\nExisting bookings are NOT retroactively tagged. Deleted/cancelled bookings are excluded.');
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const access = await calendarAccess();
    const range = reportRange(process.argv.slice(2), access.tz);
    console.log(formatReport(await listWebsiteBookings(access, range), range));
  } catch (error) {
    // Only our controlled errors are printable; network/provider errors may contain sensitive context.
    const message = error instanceof Error && /^(Missing |Google |--|Usage:)/.test(error.message) ? error.message : 'Booking report failed: unable to reach Google Calendar.';
    console.error(message);
    process.exitCode = 1;
  }
}
