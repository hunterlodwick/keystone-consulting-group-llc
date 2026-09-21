import type { ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import {
  BookingConfigError,
  REQUEST_DEADLINE_MS,
  readBookingConfig,
  toSlotConfig,
} from '../../lib/booking/config.js';
import {
  GoogleCalendarError,
  calendarQueryWindow,
  getAccessToken,
  queryFreeBusy,
  type BookingHandlerDeps,
} from '../../lib/booking/google.js';
import { generateSlots } from '../../lib/booking/schedule.js';
import {
  ERROR_CODES,
  MSG_INVALID,
  MSG_METHOD,
  MSG_UNAVAILABLE,
  applyBookingHeaders,
  assertSlotsRange,
  logBookingOp,
  parseSlotsQuery,
  requestUrl,
  writeError,
  writeJson,
  type BookingIncoming,
} from '../../lib/booking/validation.js';

export async function handleSlotsRequest(
  req: BookingIncoming,
  res: ServerResponse,
  deps: BookingHandlerDeps = {},
): Promise<void> {
  const started = Date.now();
  const id = randomUUID();
  const deadline = AbortSignal.timeout(REQUEST_DEADLINE_MS);
  let mode: 'dry-run' | 'live' | undefined;
  let status = 500;
  let code: string | undefined = 'INTERNAL';

  const finish = () => {
    logBookingOp({ id, op: 'slots', status, ms: Date.now() - started, code });
  };

  try {
    if (req.method !== 'GET') {
      status = 405;
      code = 'METHOD_NOT_ALLOWED';
      writeError(res, 405, 'METHOD_NOT_ALLOWED', MSG_METHOD, mode, { Allow: 'GET' });
      finish();
      return;
    }

    const parsed = parseSlotsQuery(requestUrl(req));
    if (!parsed.ok) {
      status = 400;
      code = ERROR_CODES.INVALID_INPUT;
      writeError(res, 400, ERROR_CODES.INVALID_INPUT, MSG_INVALID, mode);
      finish();
      return;
    }

    let config;
    try {
      config = readBookingConfig(deps.env ?? process.env);
      mode = config.dryRun ? 'dry-run' : 'live';
    } catch (err) {
      if (err instanceof BookingConfigError) {
        status = 503;
        code = ERROR_CODES.BOOKING_UNAVAILABLE;
        writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE);
        finish();
        return;
      }
      throw err;
    }

    const readNow = () => (deps.now ? deps.now() : new Date());
    const now = readNow();
    const range = assertSlotsRange({
      from: parsed.value.from,
      days: parsed.value.days,
      tz: config.tz,
      now,
      maxDaysAhead: config.maxDaysAhead,
    });
    if (!range.ok) {
      status = 400;
      code = ERROR_CODES.INVALID_INPUT;
      writeError(res, 400, ERROR_CODES.INVALID_INPUT, MSG_INVALID, mode);
      finish();
      return;
    }

    const fetchImpl = deps.fetchImpl;
    if (!config.google && !fetchImpl) {
      status = 503;
      code = ERROR_CODES.BOOKING_UNAVAILABLE;
      writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE, mode);
      finish();
      return;
    }
    if (!config.calendarId && !fetchImpl) {
      status = 503;
      code = ERROR_CODES.BOOKING_UNAVAILABLE;
      writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE, mode);
      finish();
      return;
    }

    const transport = fetchImpl ?? fetch;
    let accessToken = '';
    if (config.google) {
      accessToken = await getAccessToken({
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
        refreshToken: config.google.refreshToken,
        fetchImpl: transport,
        deadline,
      });
    } else if (!fetchImpl) {
      status = 503;
      code = ERROR_CODES.BOOKING_UNAVAILABLE;
      writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE, mode);
      finish();
      return;
    }

    const window = calendarQueryWindow({
      dates: range.dates,
      tz: config.tz,
      bufferMinutes: config.bufferMinutes,
    });
    const busy = await queryFreeBusy({
      accessToken,
      calendarId: config.calendarId ?? 'injected',
      range: window,
      tz: config.tz,
      fetchImpl: transport,
      deadline,
    });

    const slotConfig = toSlotConfig(config);
    const nowFresh = readNow();
    const days = range.dates.map((date) => ({
      date,
      slots: generateSlots({ date, busyIntervals: busy, config: slotConfig, now: nowFresh }),
    }));

    status = 200;
    code = undefined;
    applyBookingHeaders(res, mode);
    writeJson(res, 200, { tz: config.tz, days }, mode);
    finish();
  } catch (err) {
    if (deadline.aborted || (err instanceof GoogleCalendarError && err.kind === 'TIMEOUT')) {
      status = 503;
      code = ERROR_CODES.BOOKING_UNAVAILABLE;
      writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE, mode);
      finish();
      return;
    }
    if (err instanceof GoogleCalendarError) {
      status = 503;
      code = ERROR_CODES.BOOKING_UNAVAILABLE;
      writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE, mode);
      finish();
      return;
    }
    status = 503;
    code = ERROR_CODES.BOOKING_UNAVAILABLE;
    writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE, mode);
    finish();
  }
}

export default function handler(req: BookingIncoming, res: ServerResponse): Promise<void> {
  return handleSlotsRequest(req, res);
}
