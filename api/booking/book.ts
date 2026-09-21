import type { ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { DateTime } from 'luxon';
import {
  BookingConfigError,
  REQUEST_DEADLINE_MS,
  readBookingConfig,
  toSlotConfig,
} from '../../lib/booking/config.js';
import {
  GoogleCalendarError,
  buildBookingEventRequest,
  getAccessToken,
  insertBookingEvent,
  queryFreeBusy,
  type BookingHandlerDeps,
} from '../../lib/booking/google.js';
import { formatSlotInstant, generateSlots } from '../../lib/booking/schedule.js';
import {
  ERROR_CODES,
  MSG_INVALID,
  MSG_METHOD,
  MSG_SLOT_TAKEN,
  MSG_UNAVAILABLE,
  MSG_UNCONFIRMED,
  logBookingOp,
  parseBookBody,
  readJsonObject,
  validateBookingStart,
  writeError,
  writeJson,
  type BookingIncoming,
} from '../../lib/booking/validation.js';

export async function handleBookRequest(
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
    logBookingOp({ id, op: 'book', status, ms: Date.now() - started, code });
  };

  try {
    if (req.method !== 'POST') {
      status = 405;
      code = 'METHOD_NOT_ALLOWED';
      writeError(res, 405, 'METHOD_NOT_ALLOWED', MSG_METHOD, mode, { Allow: 'POST' });
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

    const raw = await readJsonObject(req);
    if (!raw.ok) {
      status = 400;
      code = ERROR_CODES.INVALID_INPUT;
      writeError(res, 400, ERROR_CODES.INVALID_INPUT, MSG_INVALID, mode);
      finish();
      return;
    }

    const parsed = parseBookBody(raw.value);
    if (!parsed.ok) {
      status = 400;
      code = ERROR_CODES.INVALID_INPUT;
      writeError(res, 400, ERROR_CODES.INVALID_INPUT, MSG_INVALID, mode);
      finish();
      return;
    }

    const readNow = () => (deps.now ? deps.now() : new Date());
    const now = readNow();
    const startCheck = validateBookingStart(parsed.value.start, config, now);
    if (!startCheck.ok) {
      status = 400;
      code = ERROR_CODES.INVALID_INPUT;
      writeError(res, 400, ERROR_CODES.INVALID_INPUT, MSG_INVALID, mode);
      finish();
      return;
    }

    const date = DateTime.fromMillis(startCheck.startMs, { zone: config.tz }).toISODate();
    if (!date) {
      status = 400;
      code = ERROR_CODES.INVALID_INPUT;
      writeError(res, 400, ERROR_CODES.INVALID_INPUT, MSG_INVALID, mode);
      finish();
      return;
    }

    const startIso = formatSlotInstant(startCheck.startMs, config.tz);
    const endIso = formatSlotInstant(startCheck.endMs, config.tz);

    if (config.dryRun) {
      const fetchImpl = deps.fetchImpl;
      if (config.google || fetchImpl) {
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
        }
        const bufferMs = config.bufferMinutes * 60 * 1000;
        const busy = await queryFreeBusy({
          accessToken,
          calendarId: config.calendarId ?? 'injected',
          range: {
            timeMin: formatSlotInstant(startCheck.startMs - bufferMs, config.tz),
            timeMax: formatSlotInstant(startCheck.endMs + bufferMs, config.tz),
          },
          tz: config.tz,
          fetchImpl: transport,
          deadline,
        });
        const eligible = generateSlots({
          date,
          busyIntervals: busy,
          config: toSlotConfig(config),
          now: readNow(),
        }).some((slot) => slot.start === startIso);
        if (!eligible) {
          status = 409;
          code = ERROR_CODES.SLOT_TAKEN;
          writeError(res, 409, ERROR_CODES.SLOT_TAKEN, MSG_SLOT_TAKEN, mode);
          finish();
          return;
        }
      }

      const planned = buildBookingEventRequest({
        calendarId: config.calendarId ?? 'dry-run',
        tz: config.tz,
        startMs: startCheck.startMs,
        endMs: startCheck.endMs,
        name: parsed.value.name,
        email: parsed.value.email,
        phone: parsed.value.phone,
        notes: parsed.value.notes,
        requestId: (deps.randomUUID ?? (() => randomUUID()))(),
        includeConference: true,
      });
      deps.onDryRunIntent?.(planned.intent);

      status = 200;
      code = undefined;
      writeJson(res, 200, { ok: true, start: startIso, end: endIso }, mode);
      finish();
      return;
    }

    if (!config.google || !config.calendarId) {
      status = 503;
      code = ERROR_CODES.BOOKING_UNAVAILABLE;
      writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNAVAILABLE, mode);
      finish();
      return;
    }

    const transport = deps.fetchImpl ?? fetch;
    const accessToken = await getAccessToken({
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      refreshToken: config.google.refreshToken,
      fetchImpl: transport,
      deadline,
    });

    const bufferMs = config.bufferMinutes * 60 * 1000;
    const busy = await queryFreeBusy({
      accessToken,
      calendarId: config.calendarId,
      range: {
        timeMin: formatSlotInstant(startCheck.startMs - bufferMs, config.tz),
        timeMax: formatSlotInstant(startCheck.endMs + bufferMs, config.tz),
      },
      tz: config.tz,
      fetchImpl: transport,
      deadline,
    });

    const eligible = generateSlots({
      date,
      busyIntervals: busy,
      config: toSlotConfig(config),
      now: readNow(),
    }).some((slot) => slot.start === startIso);
    if (!eligible) {
      status = 409;
      code = ERROR_CODES.SLOT_TAKEN;
      writeError(res, 409, ERROR_CODES.SLOT_TAKEN, MSG_SLOT_TAKEN, mode);
      finish();
      return;
    }

    const inserted = await insertBookingEvent({
      accessToken,
      calendarId: config.calendarId,
      tz: config.tz,
      startMs: startCheck.startMs,
      endMs: startCheck.endMs,
      name: parsed.value.name,
      email: parsed.value.email,
      phone: parsed.value.phone,
      notes: parsed.value.notes,
      fetchImpl: transport,
      randomUUID: deps.randomUUID ?? (() => randomUUID()),
      deadline,
    });

    status = 200;
    code = undefined;
    writeJson(
      res,
      200,
      { ok: true, eventId: inserted.eventId, start: startIso, end: endIso },
      mode,
    );
    finish();
  } catch (err) {
    if (err instanceof GoogleCalendarError && err.kind === 'DUPLICATE') {
      status = 409;
      code = ERROR_CODES.SLOT_TAKEN;
      writeError(res, 409, ERROR_CODES.SLOT_TAKEN, MSG_SLOT_TAKEN, mode);
      finish();
      return;
    }
    if (err instanceof GoogleCalendarError && err.kind === 'INSERT_TIMEOUT') {
      status = 503;
      code = ERROR_CODES.BOOKING_UNAVAILABLE;
      writeError(res, 503, ERROR_CODES.BOOKING_UNAVAILABLE, MSG_UNCONFIRMED, mode);
      finish();
      return;
    }
    if (deadline.aborted || err instanceof GoogleCalendarError) {
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
  return handleBookRequest(req, res);
}
