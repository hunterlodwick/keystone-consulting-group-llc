import React, { createContext, useContext, useEffect, useRef } from 'react';
import { sanitizeAttribution } from '../../lib/booking/attribution';

const TriggerContext = createContext<React.RefObject<string> | null>(null);

/** Capture the real trigger before modal focus moves, including keyboard clicks. */
export function BookingAttributionProvider({ children }: { children: React.ReactNode }) {
  const trigger = useRef('');
  useEffect(() => {
    const capture = (event: MouseEvent) => {
      const control = event.target instanceof Element ? event.target.closest('button, a, [role="button"]') : null;
      trigger.current = control?.textContent?.trim() || control?.getAttribute('aria-label') || '';
    };
    document.addEventListener('click', capture, true);
    return () => document.removeEventListener('click', capture, true);
  }, []);
  return <TriggerContext.Provider value={trigger}>{children}</TriggerContext.Provider>;
}

export function useBookingCta(variant: 'modal' | 'inline', ctaLabel?: string) {
  const trigger = useContext(TriggerContext);
  // Freeze the opening label; date/time and submit clicks must not replace it.
  return useRef(ctaLabel || (variant === 'modal' ? trigger?.current : '') || 'unknown').current;
}

export function captureBookingAttribution(cta: string, variant: 'modal' | 'inline') {
  let referrer = 'direct';
  try { if (document.referrer) referrer = new URL(document.referrer).hostname; } catch { /* unavailable */ }
  const utm = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    if (/^utm_/i.test(key)) utm.append(key, value);
  }
  return sanitizeAttribution({
    kcgPage: window.location.pathname,
    kcgCta: cta,
    kcgReferrer: referrer,
    kcgUtm: utm.toString(),
    kcgWidget: variant,
  });
}
