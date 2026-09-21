import './booking.css';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export const KCG_BOOKING_EMAIL = 'info@keystoneconsultingg.com';

const LOCAL_ATOM_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

function isDeliverableEmail(email: string): boolean {
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

const RANGE_DAYS = 7;
const HORIZON_DAYS = 30;
const LOOKBACK_DAYS = 2;
const LOAD_TIMEOUT_MS = 15_000;
const POST_TIMEOUT_MS = 15_000;

const controlEdge = 'shadow-[inset_0_0_0_1px_var(--color-offwhite)]';
const fieldClass = `w-full min-h-[44px] bg-charcoal/90 ${controlEdge} rounded-sm px-4 py-2 text-offwhite scroll-mt-[var(--booking-sticky-clearance,12rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-offwhite`;
const btnPrimary =
  'inline-flex items-center justify-center min-h-[44px] px-5 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-offwhite disabled:opacity-50';
const btnGhost = `inline-flex items-center justify-center min-h-[44px] px-5 ${controlEdge} text-offwhite font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-offwhite disabled:opacity-50`;

type Slot = { start: string; end: string };
type DayPayload = { date: string; slots: Slot[] };
type SlotsResponse = { tz: string; days: DayPayload[] };
type BookOk = { ok: true; eventId?: string; start: string; end: string };
type BookErr = { ok: false; error: { code: string; message: string } };

export function isBookingModalTitle(title: string): boolean {
  return title === 'Book a Call' || /^Book a Call with \S+$/.test(title);
}

function utcYesterday(): string {
  const now = new Date();
  const y = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1);
  return new Date(y).toISOString().slice(0, 10);
}

function addDays(date: string, n: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day + n));
  return dt.toISOString().slice(0, 10);
}

function todayInTz(tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatDateLabel(date: string, tz: string, style: 'short' | 'long'): string {
  const instant = new Date(`${date}T12:00:00Z`);
  if (style === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(instant);
  }
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(instant);
}

function formatTime(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatRange(start: string, end: string, tz: string): string {
  return `${formatDateLabel(start.slice(0, 10), tz, 'long')}, ${formatTime(start, tz)} to ${formatTime(end, tz)}`;
}

function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function BookingWidget({
  onRequestContact,
  variant = 'modal',
}: {
  onRequestContact?: () => void;
  variant?: 'modal' | 'inline';
}): React.ReactElement {
  const liveId = useId();
  const formId = useId();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const notesId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLParagraphElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const postAbortRef = useRef<AbortController | null>(null);
  const rangeRef = useRef({ from: utcYesterday(), days: RANGE_DAYS });
  const requestIdRef = useRef(0);
  const selectedSlotRef = useRef<Slot | null>(null);
  const daysRef = useRef<DayPayload[]>([]);
  const phaseRef = useRef<'loading' | 'ready' | 'form' | 'submitting' | 'confirm' | 'unavailable' | 'error'>('loading');

  const [phase, setPhase] = useState<'loading' | 'ready' | 'form' | 'submitting' | 'confirm' | 'unavailable' | 'error'>(
    'loading',
  );
  const [statusText, setStatusText] = useState('Loading available times.');
  const [alertText, setAlertText] = useState('');
  const [conflict, setConflict] = useState(false);
  const [dryRun, setDryRun] = useState<boolean | null>(null);
  const [tz, setTz] = useState('');
  const [days, setDays] = useState<DayPayload[]>([]);
  const [rangeFrom, setRangeFrom] = useState(rangeRef.current.from);
  const [rangeDays, setRangeDays] = useState(rangeRef.current.days);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [booked, setBooked] = useState<{ start: string; end: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);
  useEffect(() => {
    daysRef.current = days;
  }, [days]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const revealFromSticky = useCallback((el: HTMLElement | null) => {
    if (!el || el.closest('[data-booking-actions]')) return;
    const run = () => {
      const dialog = rootRef.current?.closest('[role="dialog"]');
      const header = variant === 'inline' ? document.querySelector('header') : null;
      const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0) + 16;
      const bar = rootRef.current?.querySelector('[data-booking-actions]');
      const bottom = Math.min(window.innerHeight, bar?.getBoundingClientRect().top ?? window.innerHeight) - 16;
      const rect = el.getBoundingClientRect();
      const delta = rect.top < top ? rect.top - top : rect.bottom > bottom ? rect.bottom - bottom : 0;
      if (dialog) dialog.scrollTop += delta;
      else window.scrollBy(0, delta);
    };
    run();
    window.requestAnimationFrame(run);
  }, [variant]);

  const localToday = tz ? todayInTz(tz) : '';
  const horizonEnd = localToday ? addDays(localToday, HORIZON_DAYS - 1) : '';
  const earliestFrom = localToday ? addDays(localToday, -LOOKBACK_DAYS) : '';

  const selectedDay = days.find((day) => day.date === selectedDate) ?? null;
  const todayEntry = localToday ? days.find((day) => day.date === localToday) : undefined;
  const rangeHasSlots = days.some((day) => day.slots.length > 0);
  const todayEmpty = Boolean(localToday && todayEntry && todayEntry.slots.length === 0);

  const bookingState = useMemo(() => {
    if (phase === 'loading') return 'loading';
    if (phase === 'submitting') return 'submitting';
    if (phase === 'confirm') return 'confirm';
    if (phase === 'unavailable') return 'unavailable';
    if (phase === 'error') return 'error';
    if (conflict) return 'conflict';
    if (phase === 'form') return 'form';
    if (!rangeHasSlots) return 'empty-range';
    if (todayEmpty) return 'empty-today';
    return 'slots';
  }, [phase, conflict, rangeHasSlots, todayEmpty]);

  const loadSlots = useCallback(async (from: string, daysCount: number, opts?: { silent?: boolean }) => {
    abortRef.current?.abort();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, LOAD_TIMEOUT_MS);
    if (!opts?.silent) {
      if (daysRef.current.length === 0) {
        setPhase('loading');
        setAlertText('');
      }
      setStatusText('Loading available times.');
    }
    const stillCurrent = () => requestId === requestIdRef.current;
    const availabilityUnlocked = () => {
      const current = phaseRef.current;
      return current !== 'submitting' && current !== 'confirm';
    };
    try {
      const res = await fetch(`/api/booking/slots?from=${from}&days=${daysCount}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!stillCurrent() || !availabilityUnlocked()) return;
      const mode = res.headers.get('x-booking-mode');
      if (mode === 'dry-run') setDryRun(true);
      if (mode === 'live') setDryRun(false);

      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      if (!stillCurrent() || !availabilityUnlocked()) return;

      if (res.status === 503) {
        setPhase('unavailable');
        setAlertText('Online booking is unavailable.');
        setStatusText('Online booking is unavailable.');
        return;
      }
      if (!res.ok || !json || typeof json !== 'object' || !('days' in json) || !('tz' in json)) {
        setPhase('error');
        setAlertText('Could not load available times.');
        setStatusText('Could not load available times.');
        return;
      }

      const payload = json as SlotsResponse;
      if (!Array.isArray(payload.days) || typeof payload.tz !== 'string') {
        setPhase('error');
        setAlertText('Could not load available times.');
        setStatusText('Could not load available times.');
        return;
      }

      rangeRef.current = { from, days: daysCount };
      setRangeFrom(from);
      setRangeDays(daysCount);
      setTz(payload.tz);
      setDays(payload.days);

      const today = todayInTz(payload.tz);
      const firstOpen = payload.days.find((day) => day.slots.length > 0)?.date ?? null;
      const todayRow = payload.days.find((day) => day.date === today);
      const nextDate = todayRow && todayRow.slots.length > 0 ? today : firstOpen ?? payload.days[0]?.date ?? null;
      setSelectedDate((current) => {
        if (current && payload.days.some((day) => day.date === current)) return current;
        return nextDate;
      });

      const currentSlot = selectedSlotRef.current;
      const stillThere = Boolean(
        currentSlot && payload.days.some((day) => day.slots.some((slot) => slot.start === currentSlot.start)),
      );
      if (currentSlot && !stillThere) {
        setSelectedSlot(null);
        selectedSlotRef.current = null;
        setPhase('ready');
        setConflict(true);
        setAlertText('That time is no longer available. Choose another.');
        setStatusText('That time is no longer available. Choose another.');
      } else {
        setSelectedSlot((current) => (stillThere ? current : null));
        const allEmpty = payload.days.every((day) => day.slots.length === 0);
        const todayHasNone = Boolean(todayRow && todayRow.slots.length === 0);
        if (allEmpty) {
          setStatusText('No times available in this date range.');
        } else if (todayHasNone) {
          setStatusText('No times available today.');
        } else {
          setStatusText(`Times shown in ${payload.tz}.`);
        }
        setPhase((current) =>
          current === 'form' || current === 'submitting' || current === 'confirm' ? current : 'ready',
        );
      }
    } catch (err) {
      if (!stillCurrent() || !availabilityUnlocked()) return;
      const aborted = controller.signal.aborted || (err as { name?: string })?.name === 'AbortError';
      if (aborted && !timedOut) return;
      if (opts?.silent && !timedOut) {
        setAlertText('Could not load available times.');
        return;
      }
      if (opts?.silent && timedOut) {
        setAlertText('Could not refresh available times.');
        return;
      }
      setPhase('error');
      setAlertText('Could not load available times.');
      setStatusText('Could not load available times.');
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    void loadSlots(rangeRef.current.from, rangeRef.current.days);
    return () => abortRef.current?.abort();
  }, [loadSlots]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      if (phase === 'submitting' || phase === 'confirm') return;
      void loadSlots(rangeRef.current.from, rangeRef.current.days, { silent: true });
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [loadSlots, phase]);

  useEffect(() => {
    if (phase === 'form') {
      const dialog = rootRef.current?.closest('[role="dialog"]');
      if (dialog) dialog.scrollTop = 0;
      else rootRef.current?.scrollIntoView({ block: 'start' });
      nameRef.current?.focus({ preventScroll: true });
      revealFromSticky(nameRef.current);
    }
  }, [phase, revealFromSticky]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) revealFromSticky(event.target);
    };
    root.addEventListener('focusin', onFocusIn);
    return () => root.removeEventListener('focusin', onFocusIn);
  }, [revealFromSticky]);

  useEffect(() => {
    if (alertText) {
      alertRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [alertText]);

  const canGoBack = Boolean(earliestFrom && rangeFrom > earliestFrom);
  const lastDate = days[days.length - 1]?.date;
  const canGoNext = Boolean(horizonEnd && lastDate && addDays(lastDate, 1) <= horizonEnd);

  const goBack = () => {
    if (!canGoBack) return;
    const nextFrom = addDays(rangeFrom, -RANGE_DAYS);
    const from = nextFrom < earliestFrom ? earliestFrom : nextFrom;
    const maxDays = Math.min(RANGE_DAYS, daysBetween(from, addDays(rangeFrom, -1)) + 1);
    void loadSlots(from, Math.max(1, maxDays));
  };

  const goNext = () => {
    if (!canGoNext || !lastDate || !horizonEnd) return;
    const from = addDays(lastDate, 1);
    const remaining = daysBetween(from, horizonEnd) + 1;
    void loadSlots(from, Math.min(RANGE_DAYS, remaining));
  };

  const validateForm = (): boolean => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    let firstInvalid: HTMLInputElement | null = null;
    let nextNameError = '';
    let nextEmailError = '';
    if (trimmedName.length < 1 || trimmedName.length > 120) {
      nextNameError = 'Enter your name (1 to 120 characters).';
      firstInvalid = nameRef.current;
    }
    if (trimmedEmail.length < 1 || trimmedEmail.length > 254 || !isDeliverableEmail(trimmedEmail)) {
      nextEmailError = 'Enter a valid email address.';
      if (!firstInvalid) firstInvalid = emailRef.current;
    }
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    if (firstInvalid) {
      firstInvalid.focus();
      revealFromSticky(firstInvalid);
    }
    return !nextNameError && !nextEmailError;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSlot || phase === 'submitting') return;
    if (!validateForm()) return;

    abortRef.current?.abort();
    requestIdRef.current += 1;
    postAbortRef.current?.abort();
    const controller = new AbortController();
    postAbortRef.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, POST_TIMEOUT_MS);

    setPhase('submitting');
    phaseRef.current = 'submitting';
    setAlertText('');
    setStatusText('Submitting your booking.');
    try {
      const body: Record<string, string> = {
        start: selectedSlot.start,
        name: name.trim(),
        email: email.trim(),
      };
      if (phone.trim()) body.phone = phone.trim().slice(0, 40);
      if (notes.trim()) body.notes = notes.trim().slice(0, 2000);

      const res = await fetch('/api/booking/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const mode = res.headers.get('x-booking-mode');
      if (mode === 'dry-run') setDryRun(true);
      if (mode === 'live') setDryRun(false);
      let json: BookOk | BookErr | null = null;
      try {
        json = (await res.json()) as BookOk | BookErr;
      } catch {
        json = null;
      }

      if (res.status === 409) {
        setConflict(true);
        setSelectedSlot(null);
        selectedSlotRef.current = null;
        setPhase('ready');
        setAlertText('That time was just taken. Please choose another.');
        setStatusText('That time was just taken. Please choose another.');
        void loadSlots(rangeRef.current.from, rangeRef.current.days, { silent: true });
        return;
      }
      if (res.status === 503) {
        setPhase('unavailable');
        setAlertText(
          'Booking could not be confirmed. Email KCG instead of submitting another request right away.',
        );
        setStatusText('Online booking is unavailable.');
        return;
      }
      if (!res.ok || !json || json.ok !== true) {
        setPhase('error');
        setAlertText('Booking could not be confirmed. Email KCG instead of submitting another request right away.');
        setStatusText('Booking could not be confirmed.');
        return;
      }
      setBooked({ start: json.start, end: json.end });
      setPhase('confirm');
      phaseRef.current = 'confirm';
      setConflict(false);
      const confirmedDryRun = dryRun === true || mode === 'dry-run';
      setStatusText(
        confirmedDryRun
          ? 'Test complete. No booking was created.'
          : 'Your call is booked. An invitation was requested.',
      );
    } catch {
      setPhase('error');
      setAlertText(
        timedOut
          ? 'Booking could not be confirmed. Email KCG instead of submitting another request right away.'
          : 'Booking could not be confirmed. Email KCG instead of submitting another request right away.',
      );
      setStatusText('Booking could not be confirmed.');
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const Fallback = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? 'flex flex-wrap items-center gap-x-3 gap-y-1' : 'flex flex-col gap-3 pt-2'}>
      <a href={`mailto:${KCG_BOOKING_EMAIL}`} className={compact ? 'text-sm underline text-offwhite min-h-[44px] inline-flex items-center' : `${btnPrimary} w-full`}>
        Email KCG
      </a>
      <p className="text-sm text-offwhite">{KCG_BOOKING_EMAIL}</p>
      {onRequestContact ? (
        <button
          type="button"
          className={compact ? 'text-sm underline text-offwhite min-h-[44px]' : btnGhost}
          onClick={onRequestContact}
        >
          Contact KCG
        </button>
      ) : null}
    </div>
  );

  const step = phase === 'confirm' ? 3 : phase === 'form' || phase === 'submitting' ? 2 : 1;

  useEffect(() => {
    if (phase === 'confirm') {
      const heading = rootRef.current?.querySelector<HTMLElement>('[data-booking-confirm]');
      heading?.focus();
      revealFromSticky(heading ?? null);
    }
  }, [phase, revealFromSticky]);

  return (
    <div
      ref={rootRef}
      data-booking-widget="true"
      data-booking-variant={variant}
      data-booking-state={bookingState}
      className="space-y-5 text-offwhite"
    >
      <div data-booking-sticky="true" className="space-y-3">
        <p className="text-sm text-offwhite">30 minutes with Seth</p>
        <ol aria-label="Booking progress" className="booking-progress">
          {['Pick a time', 'Your details', 'Confirmed'].map((label, i) => (
            <li key={label} aria-current={step === i + 1 ? 'step' : undefined}>
              <span>{i + 1}</span> {label}
            </li>
          ))}
        </ol>
        <h4 className="font-serif text-2xl text-white">{step === 1 ? 'Pick a day, then a time' : step === 2 ? 'Add your details' : 'All done'}</h4>
        {step === 1 && tz ? <p className="text-sm text-offwhite">Times shown in {tz}.</p> : null}
        {dryRun === true ? <p className="text-sm text-offwhite">Test booking. No calendar event or invitation will be created.</p> : null}
        {alertText ? <p ref={alertRef} role="alert" data-booking-alert="true" className={`text-sm text-offwhite ${controlEdge} bg-charcoal/90 rounded-sm px-4 py-3`}>{alertText}</p> : null}
      </div>

      <div id={liveId} className="sr-only" aria-live="polite">
        {statusText}
      </div>

      {phase === 'loading' ? <p className="text-offwhite">Loading available times.</p> : null}

      {phase === 'unavailable' ? (
        <div>
          <p className="font-serif text-lg text-white">Online booking is unavailable.</p>
          <p className="text-sm text-offwhite mt-2">Email KCG to schedule a call with Seth.</p>
          <Fallback />
        </div>
      ) : null}

      {phase === 'error' ? (
        <div>
          <p className="text-offwhite">Could not load available times.</p>
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => void loadSlots(rangeRef.current.from, rangeRef.current.days)}
            >
              Retry
            </button>
            <Fallback />
          </div>
        </div>
      ) : null}

      {phase === 'confirm' && booked ? (
        <div>
          <p data-booking-confirm="true" tabIndex={-1} className="font-serif text-lg text-white">
            {dryRun === true ? 'Test complete. No booking was created.' : 'Your call is booked.'}
          </p>
          <p className="text-offwhite mt-2">{formatRange(booked.start, booked.end, tz)}</p>
          <p className="text-sm text-offwhite mt-3">
            {dryRun === true
              ? 'This was a test. No invitation was emailed.'
              : 'An invitation was requested for this call. If it does not arrive, email KCG.'}
          </p>
        </div>
      ) : null}

      {(phase === 'ready' || phase === 'form' || phase === 'submitting') && (
        <>
          {phase === 'ready' && todayEmpty && rangeHasSlots ? (
            <p className="text-sm text-offwhite">No times available today.</p>
          ) : null}
          {!rangeHasSlots && phase !== 'form' ? (
            <div>
              <p className="text-offwhite">No times available in this date range.</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button type="button" className={btnGhost} onClick={goNext} disabled={!canGoNext}>
                  Later dates
                </button>
              </div>
              <Fallback />
            </div>
          ) : null}

          {rangeHasSlots && phase === 'ready' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <button type="button" className={btnGhost} onClick={goBack} disabled={!canGoBack || phase === 'submitting'}>
                  Previous dates
                </button>
                <button type="button" className={btnGhost} onClick={goNext} disabled={!canGoNext || phase === 'submitting'}>
                  Later dates
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Dates">
                {days.map((day) => {
                  const pressed = day.date === selectedDate;
                  const hasSlots = day.slots.length > 0;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      aria-pressed={pressed}
                      aria-label={`${formatDateLabel(day.date, tz, 'long')}${hasSlots ? '' : ', no times'}`}
                      disabled={phase === 'submitting'}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setSelectedSlot(null);
                        if (phase === 'form') setPhase('ready');
                      }}
                      className={`shrink-0 min-h-[44px] min-w-[44px] px-3 rounded-sm text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-offwhite ${
                        pressed ? 'bg-teal text-white' : `bg-charcoal/90 text-white ${controlEdge}`
                      }`}
                    >
                      {formatDateLabel(day.date, tz, 'short')}
                    </button>
                  );
                })}
              </div>

              {selectedDay && selectedDay.slots.length === 0 ? (
                <p className="text-sm text-offwhite">No times available on {formatDateLabel(selectedDay.date, tz, 'long')}.</p>
              ) : null}

              {selectedDay && selectedDay.slots.length > 0 ? (
                <div role="radiogroup" aria-label="Available times" className="grid grid-cols-2 gap-2">
                  {selectedDay.slots.map((slot) => {
                    const checked = selectedSlot?.start === slot.start;
                    const label = `${formatRange(slot.start, slot.end, tz)}`;
                    return (
                      <label
                        key={slot.start}
                        className={`relative min-h-[44px] flex items-center justify-center px-3 rounded-sm cursor-pointer scroll-mt-[var(--booking-sticky-clearance,12rem)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-teal ${
                          checked ? 'bg-teal text-white' : `bg-charcoal/90 text-white ${controlEdge}`
                        }`}
                      >
                        <input
                          type="radio"
                          name={`booking-slot${liveId}`}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          value={slot.start}
                          checked={checked}
                          disabled={phase === 'submitting'}
                          onChange={() => {
                            setSelectedSlot(slot);
                            setConflict(false);
                          }}
                          aria-label={label}
                        />
                        <span className="pointer-events-none">{formatTime(slot.start, tz)}</span>
                      </label>
                    );
                  })}
                </div>
              ) : null}


            </div>
          ) : null}

          {(phase === 'form' || phase === 'submitting') && selectedSlot ? (
            <form id={formId} className="space-y-4" onSubmit={submit} noValidate>
              <p className="text-sm text-offwhite">Name and email are required.</p>
              {dryRun === false ? <p className="text-sm text-offwhite">An email invitation will be requested. If it does not arrive, email KCG.</p> : null}
              <div>
                <label htmlFor={nameId} className="block text-sm text-offwhite mb-1">
                  Name
                </label>
                <input
                  ref={nameRef}
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? nameErrorId : undefined}
                  className={fieldClass}
                  disabled={phase === 'submitting'}
                />
                {nameError ? (
                  <p id={nameErrorId} className="text-sm text-offwhite mt-1">
                    {nameError}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor={emailId} className="block text-sm text-offwhite mb-1">
                  Email
                </label>
                <input
                  ref={emailRef}
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? emailErrorId : undefined}
                  className={fieldClass}
                  disabled={phase === 'submitting'}
                />
                {emailError ? (
                  <p id={emailErrorId} className="text-sm text-offwhite mt-1">
                    {emailError}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor={phoneId} className="block text-sm text-offwhite mb-1">
                  Phone (optional)
                </label>
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={fieldClass}
                  disabled={phase === 'submitting'}
                />
              </div>
              <div>
                <label htmlFor={notesId} className="block text-sm text-offwhite mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id={notesId}
                  name="notes"
                  maxLength={2000}
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className={`${fieldClass} py-3`}
                  disabled={phase === 'submitting'}
                />
                <p className="text-sm text-offwhite mt-1">
                  {dryRun === true
                    ? 'In a live booking these details would be included in the invitation request. Do not include sensitive information.'
                    : 'These details are included in the invitation request. Do not include sensitive information.'}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className={btnGhost}
                  disabled={phase === 'submitting'}
                  onClick={() => setPhase('ready')}
                >
                  Back
                </button>
              </div>
            </form>
          ) : null}
        </>
      )}
      {phase === 'loading' || phase === 'ready' || phase === 'form' || phase === 'confirm' ? <Fallback compact /> : null}
      {(phase === 'ready' && rangeHasSlots) || phase === 'form' || phase === 'submitting' ? (
        <div data-booking-actions="true" className="booking-actions">
          <p className="text-sm text-offwhite">
            {selectedSlot ? `${formatDateLabel(selectedSlot.start.slice(0, 10), tz, 'short')} - ${formatTime(selectedSlot.start, tz)}` : 'Choose a time to continue'}
          </p>
          {step === 1 ? (
            <button type="button" className={`${btnPrimary} w-full`} disabled={!selectedSlot} onClick={(event) => { event.preventDefault(); setPhase('form'); }}>Continue</button>
          ) : (
            <button type="submit" form={formId} className={`${btnPrimary} w-full`} disabled={phase === 'submitting'}>{phase === 'submitting' ? 'Booking...' : 'Book this time'}</button>
          )}
        </div>
      ) : null}
    </div>
  );
}
