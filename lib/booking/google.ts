import { createHash } from 'node:crypto';
import { DateTime } from 'luxon';
import {
  EVENT_ID_PREFIX,
  EVENT_REMINDER_MINUTES,
  FREEBUSY_TIMEOUT_MS,
  INSERT_TIMEOUT_MS,
  TOKEN_TIMEOUT_MS,
  type BookingConfig,
} from './config.js';
import type { BusyInterval } from './schedule.js';
import { formatSlotInstant } from './schedule.js';
import { escapePlain } from './validation.js';

/**
 * Plain REST via fetch: OAuth token, freeBusy, and events.insert are a small
 * surface. fetch keeps transport injection and write-blocking tests explicit
 * without pulling in the googleapis SDK.
 */

export type GoogleFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export const TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy';

export class GoogleCalendarError extends Error {
  readonly kind: 'UNAVAILABLE' | 'DUPLICATE' | 'TIMEOUT' | 'CONFERENCE' | 'INSERT_TIMEOUT';
  readonly insertAttempted: boolean;

  constructor(
    kind: GoogleCalendarError['kind'],
    message: string,
    insertAttempted = false,
  ) {
    super(message);
    this.name = 'GoogleCalendarError';
    this.kind = kind;
    this.insertAttempted = insertAttempted;
  }
}

function combineSignals(signals: AbortSignal[]): AbortSignal {
  const extra = signals.filter((signal) => Boolean(signal));
  if (extra.length === 1) return extra[0];
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(extra);
  return extra[0];
}

async function fetchJson(
  fetchImpl: GoogleFetch,
  url: string,
  init: RequestInit,
  timeoutMs: number,
  deadline?: AbortSignal,
): Promise<{ status: number; json: unknown; aborted: boolean }> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = combineSignals([timeout, ...(deadline ? [deadline] : []), ...(init.signal ? [init.signal] : [])]);
  try {
    const response = await fetchImpl(url, { ...init, signal });
    let json: unknown = null;
    const text = await response.text();
    if (text.length > 0) {
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
    }
    return { status: response.status, json, aborted: false };
  } catch (err) {
    const aborted =
      (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) ||
      (typeof err === 'object' && err !== null && 'name' in err && (err as { name: string }).name === 'AbortError');
    if (aborted) {
      return { status: 0, json: null, aborted: true };
    }
    throw err;
  }
}

export async function getAccessToken(args: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  fetchImpl: GoogleFetch;
  deadline?: AbortSignal;
}): Promise<string> {
  const body = new URLSearchParams({
    client_id: args.clientId,
    client_secret: args.clientSecret,
    refresh_token: args.refreshToken,
    grant_type: 'refresh_token',
  });

  const result = await fetchJson(
    args.fetchImpl,
    TOKEN_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    },
    TOKEN_TIMEOUT_MS,
    args.deadline,
  );

  if (result.aborted) {
    throw new GoogleCalendarError('TIMEOUT', 'token timeout');
  }
  const json = result.json as { access_token?: unknown } | null;
  if (result.status !== 200 || !json || typeof json.access_token !== 'string' || json.access_token.length === 0) {
    throw new GoogleCalendarError('UNAVAILABLE', 'token rejected');
  }
  return json.access_token;
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;
const OFFSET_DATETIME_RE =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

const AUTH_QUOTA_REASONS = new Set([
  'rateLimitExceeded',
  'userRateLimitExceeded',
  'quotaExceeded',
  'dailyLimitExceeded',
  'sharingRateLimitExceeded',
  'forbidden',
  'insufficientPermissions',
  'authError',
  'required',
  'unauthorized',
  'accessNotConfigured',
  'dailyLimitExceededUnreg',
  'userRateLimitExceededUnreg',
  'backendError',
]);

/** Date-only YYYY-MM-DD stays all-day handling. Datetimes must carry an explicit offset. */
export function parseBusyBoundary(value: unknown, tz: string, asEnd: boolean): number | null {
  if (typeof value !== 'string' || value.length === 0) return null;
  if (DATE_ONLY_RE.test(value)) {
    const day = DateTime.fromISO(value, { zone: tz });
    if (!day.isValid || day.toISODate() !== value) return null;
    return asEnd ? day.plus({ days: 1 }).startOf('day').toMillis() : day.startOf('day').toMillis();
  }
  if (!OFFSET_DATETIME_RE.test(value)) return null;
  const dt = DateTime.fromISO(value, { setZone: true });
  if (!dt.isValid) return null;
  return dt.toMillis();
}

export async function queryFreeBusy(args: {
  accessToken: string;
  calendarId: string;
  range: { timeMin: string; timeMax: string };
  tz: string;
  fetchImpl: GoogleFetch;
  deadline?: AbortSignal;
}): Promise<BusyInterval[]> {
  const result = await fetchJson(
    args.fetchImpl,
    FREEBUSY_URL,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: args.range.timeMin,
        timeMax: args.range.timeMax,
        timeZone: args.tz,
        items: [{ id: args.calendarId }],
      }),
    },
    FREEBUSY_TIMEOUT_MS,
    args.deadline,
  );

  if (result.aborted) {
    throw new GoogleCalendarError('TIMEOUT', 'freebusy timeout');
  }
  if (result.status !== 200 || !result.json || typeof result.json !== 'object') {
    throw new GoogleCalendarError('UNAVAILABLE', 'freebusy rejected');
  }

  const payload = result.json as { calendars?: unknown };
  if (!payload.calendars || typeof payload.calendars !== 'object' || Array.isArray(payload.calendars)) {
    throw new GoogleCalendarError('UNAVAILABLE', 'calendars missing');
  }
  const cal = (payload.calendars as Record<string, unknown>)[args.calendarId];
  if (!cal || typeof cal !== 'object' || Array.isArray(cal)) {
    throw new GoogleCalendarError('UNAVAILABLE', 'calendar missing');
  }
  const record = cal as { errors?: unknown; busy?: unknown };
  if (Array.isArray(record.errors) && record.errors.length > 0) {
    throw new GoogleCalendarError('UNAVAILABLE', 'calendar error');
  }
  if (!Array.isArray(record.busy)) {
    throw new GoogleCalendarError('UNAVAILABLE', 'busy missing');
  }

  const busy: BusyInterval[] = [];
  for (const item of record.busy) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new GoogleCalendarError('UNAVAILABLE', 'busy interval invalid');
    }
    const interval = item as { start?: unknown; end?: unknown };
    const startMs = parseBusyBoundary(interval.start, args.tz, false);
    const endMs = parseBusyBoundary(interval.end, args.tz, true);
    if (startMs === null || endMs === null || endMs <= startMs) {
      throw new GoogleCalendarError('UNAVAILABLE', 'busy interval invalid');
    }
    busy.push({ startMs, endMs });
  }
  return busy;
}

export function bookingEventId(calendarId: string, startMs: number): string {
  const canonicalUtc = DateTime.fromMillis(startMs, { zone: 'utc' }).toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
  const digest = createHash('sha256').update(`${calendarId}|${canonicalUtc}`).digest('hex');
  return `${EVENT_ID_PREFIX}${digest}`;
}

function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

function errorReasons(error: unknown): string[] {
  if (!error || typeof error !== 'object') return [];
  const record = error as { reason?: unknown; errors?: unknown };
  const reasons: string[] = [];
  if (typeof record.reason === 'string' && record.reason.length > 0) reasons.push(record.reason);
  if (Array.isArray(record.errors)) {
    for (const item of record.errors) {
      if (item && typeof item === 'object' && typeof (item as { reason?: unknown }).reason === 'string') {
        const reason = (item as { reason: string }).reason;
        if (reason.length > 0) reasons.push(reason);
      }
    }
  }
  return reasons;
}

function conferenceCreateRejected(status: number, json: unknown): boolean {
  if (isSuccessStatus(status) || status === 0) return false;
  if (status !== 400 && status !== 403) return false;
  const error = (json as { error?: unknown } | null)?.error;
  if (error === undefined || error === null) return false;
  const reasons = errorReasons(error);
  if (reasons.some((reason) => AUTH_QUOTA_REASONS.has(reason))) return false;
  if (reasons.some((reason) => reason === 'invalidConferenceType')) return true;
  const message = typeof (error as { message?: unknown }).message === 'string'
    ? (error as { message: string }).message.toLowerCase()
    : '';
  if (message.includes('invalid conference type')) return true;
  if (message.includes('unsupported conference type')) return true;
  if (message.includes('conference type') && (message.includes('not supported') || message.includes('unsupported'))) {
    return true;
  }
  return false;
}

function duplicateId(status: number, json: unknown): boolean {
  if (status !== 409) return false;
  const errors = (json as { error?: { errors?: Array<{ reason?: string }> } } | null)?.error?.errors;
  if (Array.isArray(errors) && errors.some((item) => item?.reason === 'duplicate')) return true;
  return status === 409;
}

export type BookingEventAttendee = { email: string; responseStatus: 'needsAction' };

export type BookingEventBody = {
  id: string;
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  transparency: 'opaque';
  visibility: 'private';
  attendees: BookingEventAttendee[];
  guestsCanModify: false;
  guestsCanInviteOthers: false;
  guestsCanSeeOtherGuests: false;
  reminders: {
    useDefault: false;
    overrides: Array<{ method: 'popup'; minutes: number }>;
  };
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: { type: 'hangoutsMeet' };
    };
  };
};

export type BookingInviteIntent = {
  sendUpdates: 'all';
  conferenceDataVersion: 1 | null;
  attendees: BookingEventAttendee[];
  conferenceRequestId: string | null;
  includeConference: boolean;
  summary: string;
};

export type BookingEventRequest = {
  url: string;
  body: BookingEventBody;
  intent: BookingInviteIntent;
};

export function buildBookingEventRequest(args: {
  calendarId: string;
  tz: string;
  startMs: number;
  endMs: number;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  requestId: string;
  includeConference: boolean;
}): BookingEventRequest {
  const eventId = bookingEventId(args.calendarId, args.startMs);
  const params = new URLSearchParams({ sendUpdates: 'all' });
  if (args.includeConference) {
    params.set('conferenceDataVersion', '1');
  }
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(args.calendarId)}/events?${params.toString()}`;

  const descriptionLines = [
    'Source: KCG website booking',
    `Name: ${escapePlain(args.name)}`,
    `Email: ${escapePlain(args.email)}`,
  ];
  if (args.phone) descriptionLines.push(`Phone: ${escapePlain(args.phone)}`);
  if (args.notes) descriptionLines.push(`Notes: ${escapePlain(args.notes)}`);

  const body: BookingEventBody = {
    id: eventId,
    summary: `KCG call - ${escapePlain(args.name)}`,
    description: descriptionLines.join('\n'),
    start: {
      dateTime: formatSlotInstant(args.startMs, args.tz),
      timeZone: args.tz,
    },
    end: {
      dateTime: formatSlotInstant(args.endMs, args.tz),
      timeZone: args.tz,
    },
    transparency: 'opaque',
    visibility: 'private',
    attendees: [{ email: args.email, responseStatus: 'needsAction' }],
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: EVENT_REMINDER_MINUTES }],
    },
  };

  if (args.includeConference) {
    body.conferenceData = {
      createRequest: {
        requestId: args.requestId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  return {
    url,
    body,
    intent: {
      sendUpdates: 'all',
      conferenceDataVersion: args.includeConference ? 1 : null,
      attendees: body.attendees,
      conferenceRequestId: args.includeConference ? args.requestId : null,
      includeConference: args.includeConference,
      summary: body.summary,
    },
  };
}

async function postBookingEvent(
  fetchImpl: GoogleFetch,
  request: BookingEventRequest,
  accessToken: string,
  deadline?: AbortSignal,
): Promise<{ status: number; json: unknown; aborted: boolean }> {
  return fetchJson(
    fetchImpl,
    request.url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body),
    },
    INSERT_TIMEOUT_MS,
    deadline,
  );
}

function insertedEventId(json: unknown): string | null {
  const id = (json as { id?: unknown } | null)?.id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

export async function insertBookingEvent(args: {
  accessToken: string;
  calendarId: string;
  tz: string;
  startMs: number;
  endMs: number;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  fetchImpl: GoogleFetch;
  randomUUID: () => string;
  deadline?: AbortSignal;
}): Promise<{ eventId: string }> {
  const requestId = args.randomUUID();
  const withConference = buildBookingEventRequest({ ...args, requestId, includeConference: true });

  // Never auto-retry a timed-out insert: a timeout after the request is sent is
  // uncertain, not a confirmed failure. Conference fallback is a different body.
  const first = await postBookingEvent(args.fetchImpl, withConference, args.accessToken, args.deadline);

  if (first.aborted) {
    throw new GoogleCalendarError('INSERT_TIMEOUT', 'insert timeout', true);
  }
  if (duplicateId(first.status, first.json)) {
    throw new GoogleCalendarError('DUPLICATE', 'duplicate event id', true);
  }

  if (isSuccessStatus(first.status)) {
    const id = insertedEventId(first.json);
    if (!id) {
      throw new GoogleCalendarError('UNAVAILABLE', 'insert missing id', true);
    }
    return { eventId: id };
  }

  if (conferenceCreateRejected(first.status, first.json)) {
    const withoutConference = buildBookingEventRequest({
      ...args,
      requestId,
      includeConference: false,
    });
    const second = await postBookingEvent(
      args.fetchImpl,
      withoutConference,
      args.accessToken,
      args.deadline,
    );
    if (second.aborted) {
      throw new GoogleCalendarError('INSERT_TIMEOUT', 'insert timeout', true);
    }
    if (duplicateId(second.status, second.json)) {
      throw new GoogleCalendarError('DUPLICATE', 'duplicate event id', true);
    }
    if (!isSuccessStatus(second.status)) {
      throw new GoogleCalendarError('UNAVAILABLE', 'insert rejected', true);
    }
    const fallbackId = insertedEventId(second.json);
    if (!fallbackId) {
      throw new GoogleCalendarError('UNAVAILABLE', 'insert missing id', true);
    }
    return { eventId: fallbackId };
  }

  throw new GoogleCalendarError('UNAVAILABLE', 'insert rejected', true);
}

export type BookingHandlerDeps = {
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  now?: () => Date;
  fetchImpl?: GoogleFetch;
  randomUUID?: () => string;
  onDryRunIntent?: (intent: BookingInviteIntent) => void;
};

export function resolveNow(deps: BookingHandlerDeps): Date {
  return deps.now ? deps.now() : new Date();
}

export function resolveFetch(deps: BookingHandlerDeps): GoogleFetch | undefined {
  return deps.fetchImpl;
}

export function resolveUUID(deps: BookingHandlerDeps): () => string {
  return deps.randomUUID ?? (() => crypto.randomUUID());
}

export function calendarQueryWindow(args: {
  dates: string[];
  tz: string;
  bufferMinutes: number;
}): { timeMin: string; timeMax: string } {
  const first = DateTime.fromISO(args.dates[0], { zone: args.tz }).startOf('day');
  const last = DateTime.fromISO(args.dates[args.dates.length - 1], { zone: args.tz }).plus({ days: 1 }).startOf('day');
  const bufferMs = args.bufferMinutes * 60 * 1000;
  return {
    timeMin: formatSlotInstant(first.toMillis() - bufferMs, args.tz),
    timeMax: formatSlotInstant(last.toMillis() + bufferMs, args.tz),
  };
}
