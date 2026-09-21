import { Info } from 'luxon';

/**
 * Booking rules. Confirmed values are marked as such. Unconfirmed defaults
 * are named constants, not silent env defaults, and stay changeable.
 */

/** Confirmed: Monday-Friday. Luxon weekday 1=Monday .. 7=Sunday. */
export const WORKING_DAYS = [1, 2, 3, 4, 5] as const;

/** Confirmed: local wall-clock opening in BOOKING_TZ. */
export const WORK_START = { hour: 9, minute: 0 } as const;

/**
 * Confirmed: local wall-clock closing. A slot may end at this instant, not after.
 * With 30-minute slots the last bookable slot is 18:30-19:00.
 */
export const WORK_END = { hour: 19, minute: 0 } as const;

/** Fixed requirement: 30-minute consultations. */
export const SLOT_MINUTES = 30;

/** Elapsed length of every emitted slot, in seconds. */
export const SLOT_DURATION_SECONDS = 30 * 60;

/** Unconfirmed default: applied before and after occupied events. Changeable. */
export const BUFFER_MINUTES = 15;

/** Unconfirmed default: minimum minutes between `now` and a bookable start. Changeable. */
export const MIN_NOTICE_MINUTES = 120;

/** Unconfirmed default: inclusive of today as a local calendar day. Changeable. */
export const MAX_DAYS_AHEAD = 30;

/** Unconfirmed default: popup reminder minutes before the call. Changeable. */
export const EVENT_REMINDER_MINUTES = 60;

/** Technical hard cap on a single slots query. Not a business placeholder. */
export const MAX_QUERY_DAYS = 14;

/** Maximum POST body size in bytes. */
export const MAX_BOOK_BODY_BYTES = 8 * 1024;

/** Overall handler deadline. */
export const REQUEST_DEADLINE_MS = 15_000;

export const TOKEN_TIMEOUT_MS = 5_000;
export const FREEBUSY_TIMEOUT_MS = 8_000;
export const INSERT_TIMEOUT_MS = 2_500;

export const EVENT_ID_PREFIX = 'kcg1';

export type WallClock = { hour: number; minute: number };

export type GoogleCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export type BookingConfig = {
  dryRun: boolean;
  tz: string;
  calendarId: string | null;
  google: GoogleCredentials | null;
  workingDays: readonly number[];
  workStart: WallClock;
  workEnd: WallClock;
  slotMinutes: number;
  bufferMinutes: number;
  minNoticeMinutes: number;
  maxDaysAhead: number;
  maxQueryDays: number;
};

export type SlotGenerationConfig = {
  tz: string;
  workingDays: readonly number[];
  workStart: WallClock;
  workEnd: WallClock;
  slotMinutes: number;
  bufferMinutes: number;
  minNoticeMinutes: number;
  maxDaysAhead: number;
};

export class BookingConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingConfigError';
  }
}

function present(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Read and validate server-only booking configuration.
 * Missing or invalid values fail closed. This function never invents
 * availability and never defaults BOOKING_DRY_RUN to a write-enabled mode.
 */
export function readBookingConfig(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): BookingConfig {
  const dryRunRaw = env.BOOKING_DRY_RUN;
  if (dryRunRaw !== 'true' && dryRunRaw !== 'false') {
    throw new BookingConfigError('BOOKING_DRY_RUN must be exactly true or false');
  }
  const dryRun = dryRunRaw === 'true';

  const tz = present(env.BOOKING_TZ);
  if (!tz || !Info.isValidIANAZone(tz)) {
    throw new BookingConfigError('BOOKING_TZ must be a valid IANA time zone');
  }

  const calendarId = present(env.BOOKING_CALENDAR_ID);
  const clientId = present(env.GOOGLE_CLIENT_ID);
  const clientSecret = present(env.GOOGLE_CLIENT_SECRET);
  const refreshToken = present(env.GOOGLE_REFRESH_TOKEN);

  const googleParts = [clientId, clientSecret, refreshToken, calendarId];
  const presentCount = googleParts.filter((part) => part !== null).length;
  if (presentCount > 0 && presentCount < 4) {
    throw new BookingConfigError('Google booking credentials are incomplete');
  }

  if (!dryRun && presentCount === 0) {
    throw new BookingConfigError('Live booking requires Google credentials and BOOKING_CALENDAR_ID');
  }

  const google: GoogleCredentials | null =
    clientId && clientSecret && refreshToken
      ? { clientId, clientSecret, refreshToken }
      : null;

  return {
    dryRun,
    tz,
    calendarId,
    google,
    workingDays: WORKING_DAYS,
    workStart: { hour: WORK_START.hour, minute: WORK_START.minute },
    workEnd: { hour: WORK_END.hour, minute: WORK_END.minute },
    slotMinutes: SLOT_MINUTES,
    bufferMinutes: BUFFER_MINUTES,
    minNoticeMinutes: MIN_NOTICE_MINUTES,
    maxDaysAhead: MAX_DAYS_AHEAD,
    maxQueryDays: MAX_QUERY_DAYS,
  };
}

export function toSlotConfig(config: BookingConfig): SlotGenerationConfig {
  return {
    tz: config.tz,
    workingDays: config.workingDays,
    workStart: config.workStart,
    workEnd: config.workEnd,
    slotMinutes: config.slotMinutes,
    bufferMinutes: config.bufferMinutes,
    minNoticeMinutes: config.minNoticeMinutes,
    maxDaysAhead: config.maxDaysAhead,
  };
}
