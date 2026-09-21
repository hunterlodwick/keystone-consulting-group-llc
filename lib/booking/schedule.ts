import { DateTime } from 'luxon';
import {
  SLOT_DURATION_SECONDS,
  type SlotGenerationConfig,
} from './config';

export type BusyInterval = {
  startMs: number;
  endMs: number;
};

export type Slot = {
  start: string;
  end: string;
};

function wallMinutes(clock: { hour: number; minute: number }): number {
  return clock.hour * 60 + clock.minute;
}

/**
 * Count how many IANA offsets make this local wall time a real instant.
 * 0 = nonexistent (spring gap), 1 = unique, 2 = ambiguous (fall overlap).
 */
export function countLocalInstantOffsets(
  zone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const probe = DateTime.fromObject(
    { year, month, day, hour: 12, minute: 0, second: 0, millisecond: 0 },
    { zone },
  );
  if (!probe.isValid) return 0;

  const offsets = new Set<number>([
    probe.minus({ days: 1 }).offset,
    probe.offset,
    probe.plus({ days: 1 }).offset,
  ]);

  let matches = 0;
  for (const offsetMinutes of offsets) {
    const utcGuess = DateTime.utc(year, month, day, hour, minute, 0, 0).minus({ minutes: offsetMinutes });
    const zoned = utcGuess.setZone(zone);
    if (
      zoned.isValid &&
      zoned.offset === offsetMinutes &&
      zoned.year === year &&
      zoned.month === month &&
      zoned.day === day &&
      zoned.hour === hour &&
      zoned.minute === minute
    ) {
      matches += 1;
    }
  }
  return matches;
}

/**
 * Resolve a local wall time only when it maps to exactly one instant.
 * Nonexistent and ambiguous local times are omitted.
 */
export function uniqueLocalDateTime(
  zone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): DateTime | null {
  const dt = DateTime.fromObject(
    { year, month, day, hour, minute, second: 0, millisecond: 0 },
    { zone },
  );
  if (!dt.isValid) return null;
  if (dt.year !== year || dt.month !== month || dt.day !== day || dt.hour !== hour || dt.minute !== minute) {
    return null;
  }
  if (countLocalInstantOffsets(zone, year, month, day, hour, minute) !== 1) {
    return null;
  }
  return dt;
}

export function formatSlotInstant(ms: number, tz: string): string {
  const dt = DateTime.fromMillis(ms, { zone: tz });
  const iso = dt.toISO({ includeOffset: true, suppressMilliseconds: true });
  if (!iso) {
    throw new Error('Failed to serialize booking instant');
  }
  return iso.endsWith('Z') ? `${iso.slice(0, -1)}+00:00` : iso;
}

export function expandAndMergeBusy(
  intervals: readonly BusyInterval[],
  bufferMinutes: number,
): BusyInterval[] {
  const bufferMs = bufferMinutes * 60 * 1000;
  const expanded = intervals
    .map((interval) => ({
      startMs: interval.startMs - bufferMs,
      endMs: interval.endMs + bufferMs,
    }))
    .filter((interval) => interval.endMs > interval.startMs)
    .sort((a, b) => a.startMs - b.startMs);

  const merged: BusyInterval[] = [];
  for (const current of expanded) {
    const last = merged[merged.length - 1];
    if (!last || current.startMs > last.endMs) {
      merged.push({ ...current });
    } else {
      last.endMs = Math.max(last.endMs, current.endMs);
    }
  }
  return merged;
}

/** Half-open overlap: [start, end) vs [busyStart, busyEnd). Touching endpoints do not overlap. */
export function intervalsOverlap(a: BusyInterval, b: BusyInterval): boolean {
  return a.startMs < b.endMs && a.endMs > b.startMs;
}

function snapToSlotGrid(start: { hour: number; minute: number }, slotMinutes: number): number {
  const total = wallMinutes(start);
  return Math.ceil(total / slotMinutes) * slotMinutes;
}

/**
 * Pure slot generator. `now` is injected; this function never reads the clock
 * or the HTTP request. Days are local calendar dates in config.tz.
 */
export function generateSlots(args: {
  date: string;
  busyIntervals: readonly BusyInterval[];
  config: SlotGenerationConfig;
  now: Date;
}): Slot[] {
  const { date, busyIntervals, config, now } = args;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  const dayStart = DateTime.fromISO(date, { zone: config.tz });
  if (!dayStart.isValid || dayStart.toISODate() !== date) return [];
  if (!config.workingDays.includes(dayStart.weekday)) return [];

  const localNow = DateTime.fromJSDate(now, { zone: config.tz });
  if (!localNow.isValid) return [];

  const today = localNow.startOf('day');
  const horizonEnd = today.plus({ days: config.maxDaysAhead - 1 }).endOf('day');
  if (dayStart < today) return [];
  if (dayStart > horizonEnd) return [];

  const noticeMs = config.minNoticeMinutes * 60 * 1000;
  const earliestStartMs = localNow.toMillis() + noticeMs;
  const busy = expandAndMergeBusy(busyIntervals, config.bufferMinutes);

  const workEndMinutes = wallMinutes(config.workEnd);
  const slotMinutes = config.slotMinutes;
  const durationMs = SLOT_DURATION_SECONDS * 1000;

  const slots: Slot[] = [];
  for (let minutes = snapToSlotGrid(config.workStart, slotMinutes); minutes < workEndMinutes; minutes += slotMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    if (minute % 30 !== 0) continue;

    const startDt = uniqueLocalDateTime(config.tz, dayStart.year, dayStart.month, dayStart.day, hour, minute);
    if (!startDt) continue;

    const startMs = startDt.toMillis();
    const endMs = startMs + durationMs;
    if (endMs - startMs !== durationMs) continue;

    const endDt = DateTime.fromMillis(endMs, { zone: config.tz });
    if (!endDt.isValid) continue;
    if (endDt.toISODate() !== date) continue;
    if (wallMinutes({ hour: endDt.hour, minute: endDt.minute }) > workEndMinutes) continue;
    if (endDt.second !== 0 || endDt.millisecond !== 0) continue;

    if (startMs < earliestStartMs) continue;
    if (startDt > horizonEnd) continue;

    const candidate = { startMs, endMs };
    if (busy.some((interval) => intervalsOverlap(candidate, interval))) continue;

    slots.push({
      start: formatSlotInstant(startMs, config.tz),
      end: formatSlotInstant(endMs, config.tz),
    });
  }

  return slots;
}

export function iterateLocalDates(from: string, days: number, tz: string): string[] {
  const start = DateTime.fromISO(from, { zone: tz });
  if (!start.isValid || start.toISODate() !== from) return [];
  const dates: string[] = [];
  let cursor = start.startOf('day');
  for (let i = 0; i < days; i += 1) {
    const isoDate = cursor.toISODate();
    if (!isoDate) break;
    dates.push(isoDate);
    cursor = cursor.plus({ days: 1 });
  }
  return dates;
}
