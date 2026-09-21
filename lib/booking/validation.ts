import type { IncomingMessage, ServerResponse } from 'node:http';
import { DateTime } from 'luxon';
import {
  MAX_BOOK_BODY_BYTES,
  MAX_QUERY_DAYS,
  SLOT_DURATION_SECONDS,
  type BookingConfig,
} from './config';
import { uniqueLocalDateTime } from './schedule';

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  SLOT_TAKEN: 'SLOT_TAKEN',
  BOOKING_UNAVAILABLE: 'BOOKING_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export type BookingErrorBody = {
  ok: false;
  error: { code: ErrorCode | 'METHOD_NOT_ALLOWED'; message: string };
};

export type SlotsQuery = { from: string; days: number };

export type BookInput = {
  start: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type BookingIncoming = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export const MSG_INVALID = 'The request was invalid.';
export const MSG_SLOT_TAKEN = 'That time is no longer available.';
export const MSG_UNAVAILABLE = 'Online booking is unavailable.';
export const MSG_METHOD = 'Method not allowed.';
export const MSG_UNCONFIRMED =
  'Booking could not be confirmed. Contact KCG instead of submitting another request right away.';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAYS_RE = /^(?:[1-9]|1[0-4])$/;
const START_RE =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})$/;
const LOCAL_ATOM_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

/** Unquoted local-part rules: no leading, trailing, or consecutive dots; max 64. */
export function isDeliverableEmail(email: string): boolean {
  if (email.length < 3 || email.length > 254) return false;
  const at = email.indexOf('@');
  if (at < 1 || at !== email.lastIndexOf('@')) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length < 1 || local.length > 64) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const localParts = local.split('.');
  if (localParts.some((part) => part.length === 0 || !LOCAL_ATOM_RE.test(part))) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  return labels.every((label) => DOMAIN_LABEL_RE.test(label));
}

const BOOK_KEYS = new Set(['start', 'name', 'email', 'phone', 'notes']);

export function headerValue(req: IncomingMessage, name: string): string | undefined {
  const raw = req.headers[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

export function applyBookingHeaders(res: ServerResponse, mode?: 'dry-run' | 'live'): void {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (mode) res.setHeader('X-Booking-Mode', mode);
}

export function writeJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  mode?: 'dry-run' | 'live',
): void {
  if (res.writableEnded) return;
  applyBookingHeaders(res, mode);
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

export function writeError(
  res: ServerResponse,
  status: number,
  code: ErrorCode | 'METHOD_NOT_ALLOWED',
  message: string,
  mode?: 'dry-run' | 'live',
  extraHeaders?: Record<string, string>,
): void {
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      res.setHeader(key, value);
    }
  }
  const body: BookingErrorBody = { ok: false, error: { code, message } };
  writeJson(res, status, body, mode);
}

export function logBookingOp(fields: {
  id: string;
  op: string;
  status: number;
  ms: number;
  code?: string;
}): void {
  console.log(JSON.stringify({ src: 'booking', ...fields }));
}

export function requestUrl(req: IncomingMessage): URL {
  return new URL(req.url ?? '/', 'http://localhost');
}

export function parseSlotsQuery(url: URL): { ok: true; value: SlotsQuery } | { ok: false; message: string } {
  const keys = [...url.searchParams.keys()];
  const allowed = new Set(['from', 'days']);
  if (keys.some((key) => !allowed.has(key))) {
    return { ok: false, message: MSG_INVALID };
  }

  const fromAll = url.searchParams.getAll('from');
  const daysAll = url.searchParams.getAll('days');
  if (fromAll.length !== 1 || daysAll.length !== 1) {
    return { ok: false, message: MSG_INVALID };
  }

  const from = fromAll[0];
  const daysRaw = daysAll[0];
  if (!DATE_RE.test(from) || !DAYS_RE.test(daysRaw)) {
    return { ok: false, message: MSG_INVALID };
  }

  const days = Number(daysRaw);
  if (!Number.isInteger(days) || days < 1 || days > MAX_QUERY_DAYS) {
    return { ok: false, message: MSG_INVALID };
  }

  return { ok: true, value: { from, days } };
}

export function assertSlotsRange(args: {
  from: string;
  days: number;
  tz: string;
  now: Date;
  maxDaysAhead: number;
}): { ok: true; dates: string[] } | { ok: false; message: string } {
  const { from, days, tz, now, maxDaysAhead } = args;
  const fromDt = DateTime.fromISO(from, { zone: tz });
  if (!fromDt.isValid || fromDt.toISODate() !== from) {
    return { ok: false, message: MSG_INVALID };
  }

  const localNow = DateTime.fromJSDate(now, { zone: tz });
  if (!localNow.isValid) {
    return { ok: false, message: MSG_INVALID };
  }

  const today = localNow.startOf('day');
  const earliest = today.minus({ days: 2 });
  const horizonDay = today.plus({ days: maxDaysAhead - 1 });
  if (fromDt.startOf('day') < earliest || fromDt.startOf('day') > horizonDay) {
    return { ok: false, message: MSG_INVALID };
  }

  const last = fromDt.startOf('day').plus({ days: days - 1 });
  if (last > horizonDay) {
    return { ok: false, message: MSG_INVALID };
  }

  const dates: string[] = [];
  let cursor = fromDt.startOf('day');
  for (let i = 0; i < days; i += 1) {
    const isoDate = cursor.toISODate();
    if (!isoDate) return { ok: false, message: MSG_INVALID };
    dates.push(isoDate);
    cursor = cursor.plus({ days: 1 });
  }
  return { ok: true, dates };
}

function isJsonContentType(value: string | undefined): boolean {
  if (!value) return false;
  return value.split(';')[0].trim().toLowerCase() === 'application/json';
}

function readLimited(req: IncomingMessage, maxBytes: number): Promise<Buffer | 'too-large'> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    const onData = (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buf.length;
      if (total > maxBytes) {
        cleanup();
        resolve('too-large');
        return;
      }
      chunks.push(buf);
    };
    const onEnd = () => {
      cleanup();
      resolve(Buffer.concat(chunks));
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('error', onError);
    };
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
  });
}

export async function readJsonObject(
  req: BookingIncoming,
): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false; message: string }> {
  if (!isJsonContentType(headerValue(req, 'content-type'))) {
    return { ok: false, message: MSG_INVALID };
  }

  const lengthHeader = headerValue(req, 'content-length');
  if (lengthHeader !== undefined) {
    const length = Number(lengthHeader);
    if (!Number.isFinite(length) || length < 0 || length > MAX_BOOK_BODY_BYTES) {
      return { ok: false, message: MSG_INVALID };
    }
  }

  let parsed: unknown;
  if (typeof req.body !== 'undefined') {
    parsed = req.body;
  } else {
    const raw = await readLimited(req, MAX_BOOK_BODY_BYTES);
    if (raw === 'too-large') return { ok: false, message: MSG_INVALID };
    if (raw.length === 0) return { ok: false, message: MSG_INVALID };
    try {
      parsed = JSON.parse(raw.toString('utf8'));
    } catch {
      return { ok: false, message: MSG_INVALID };
    }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, message: MSG_INVALID };
  }

  return { ok: true, value: parsed as Record<string, unknown> };
}

function asTrimmedString(value: unknown, max: number, min = 0): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return null;
  return trimmed;
}

export function parseBookBody(
  body: Record<string, unknown>,
): { ok: true; value: BookInput } | { ok: false; message: string } {
  for (const key of Object.keys(body)) {
    if (!BOOK_KEYS.has(key)) return { ok: false, message: MSG_INVALID };
  }

  const start = asTrimmedString(body.start, 64, 1);
  const name = asTrimmedString(body.name, 120, 1);
  const email = asTrimmedString(body.email, 254, 1);
  if (!start || !name || !email) return { ok: false, message: MSG_INVALID };
  if (!isDeliverableEmail(email)) return { ok: false, message: MSG_INVALID };

  let phone: string | undefined;
  if (typeof body.phone !== 'undefined') {
    if (typeof body.phone !== 'string') return { ok: false, message: MSG_INVALID };
    const trimmed = body.phone.trim();
    if (trimmed.length > 40) return { ok: false, message: MSG_INVALID };
    if (trimmed.length > 0) phone = trimmed;
  }

  let notes: string | undefined;
  if (typeof body.notes !== 'undefined') {
    if (typeof body.notes !== 'string') return { ok: false, message: MSG_INVALID };
    const trimmed = body.notes.trim();
    if (trimmed.length > 2000) return { ok: false, message: MSG_INVALID };
    if (trimmed.length > 0) notes = trimmed;
  }

  return { ok: true, value: { start, name, email, phone, notes } };
}

export function parseExplicitInstant(start: string): DateTime | null {
  const match = START_RE.exec(start);
  if (!match) return null;
  const seconds = match[4];
  const fraction = match[5];
  if (seconds !== '00') return null;
  if (fraction && /[1-9]/.test(fraction)) return null;

  const dt = DateTime.fromISO(start, { setZone: true });
  if (!dt.isValid) return null;
  return dt;
}

export function validateBookingStart(
  start: string,
  config: BookingConfig,
  now: Date,
): { ok: true; startMs: number; endMs: number } | { ok: false; message: string } {
  const instant = parseExplicitInstant(start);
  if (!instant) return { ok: false, message: MSG_INVALID };

  const zoned = instant.setZone(config.tz);
  if (!zoned.isValid) return { ok: false, message: MSG_INVALID };
  if (zoned.second !== 0 || zoned.millisecond !== 0) return { ok: false, message: MSG_INVALID };
  if (zoned.minute !== 0 && zoned.minute !== 30) return { ok: false, message: MSG_INVALID };

  const unique = uniqueLocalDateTime(
    config.tz,
    zoned.year,
    zoned.month,
    zoned.day,
    zoned.hour,
    zoned.minute,
  );
  if (!unique || unique.toMillis() !== zoned.toMillis()) {
    return { ok: false, message: MSG_INVALID };
  }

  if (!config.workingDays.includes(zoned.weekday)) {
    return { ok: false, message: MSG_INVALID };
  }

  const startMinutes = zoned.hour * 60 + zoned.minute;
  const workStartMinutes = config.workStart.hour * 60 + config.workStart.minute;
  const workEndMinutes = config.workEnd.hour * 60 + config.workEnd.minute;
  if (startMinutes < workStartMinutes || startMinutes >= workEndMinutes) {
    return { ok: false, message: MSG_INVALID };
  }

  const startMs = zoned.toMillis();
  const endMs = startMs + SLOT_DURATION_SECONDS * 1000;
  const end = DateTime.fromMillis(endMs, { zone: config.tz });
  if (!end.isValid || end.toISODate() !== zoned.toISODate()) {
    return { ok: false, message: MSG_INVALID };
  }
  if (end.hour * 60 + end.minute > workEndMinutes) {
    return { ok: false, message: MSG_INVALID };
  }

  const localNow = DateTime.fromJSDate(now, { zone: config.tz });
  if (!localNow.isValid) return { ok: false, message: MSG_INVALID };
  if (startMs < localNow.toMillis() + config.minNoticeMinutes * 60 * 1000) {
    return { ok: false, message: MSG_INVALID };
  }

  const today = localNow.startOf('day');
  const horizonDay = today.plus({ days: config.maxDaysAhead - 1 });
  if (zoned.startOf('day') > horizonDay) {
    return { ok: false, message: MSG_INVALID };
  }

  return { ok: true, startMs, endMs };
}

export function escapePlain(value: string): string {
  return value
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
