import React, { useLayoutEffect, useRef } from 'react';
import { INDUSTRY_LANDING_PAGES } from '../pages/IndustryPageTemplate';
import './mobile-sticky-cta.css';

// Mirrored from the private SERVICE_CTAS map in the protected ServicesPage file.
// The browser suite checks this mirror against that source and the rendered CTA.
export const SERVICE_CLOSE_LABELS: Record<string, string> = {
  'web-design': 'Talk through your site',
  automations: 'Map your first automation',
  crm: 'Talk through your sales process',
  consulting: 'Start with an operations review',
  'prep-to-sell': 'Talk about your exit',
  seo: 'Talk through your search visibility',
  'google-business': 'Talk through your local presence',
  bpo: 'Talk through your lead flow',
  'consumer-financing': 'Talk through customer financing',
  'business-loans': 'Talk through your funding options',
  'pos-placement': 'Talk through hardware for your counter',
};

export function stickyCtaLabel(path: string): string | null {
  if (path === '/' || path === '/services') return 'Book a Call';
  if (path === '/work') return 'Schedule a Call';
  if (path.startsWith('/services/')) return SERVICE_CLOSE_LABELS[path.slice(10)] ?? null;
  const industry = INDUSTRY_LANDING_PAGES[path.slice(1)];
  return industry ? `Free ${industry.title} Analysis` : null;
}

export function MobileStickyCta({ path, modalOpen, onBook }: {
  path: string; modalOpen: boolean; onBook: () => void;
}) {
  const label = stickyCtaLabel(path);
  const barRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar || !label) return;
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const hero = main?.querySelector('h1')?.closest('section, header') ?? main?.firstElementChild;
    const mobile = window.matchMedia('(max-width: 767px)');
    const isIndustry = Boolean(INDUSTRY_LANDING_PAGES[path.slice(1)]);
    const equivalents = [...(main?.querySelectorAll<HTMLButtonElement>('button') ?? [])].filter(button => {
      const text = button.textContent?.trim() ?? '';
      return isIndustry ? /^Get Your Free (Statement )?Analysis$/.test(text)
        : text === label || (path.startsWith('/services/') && button.classList.contains('bg-teal'));
    });
    sourceRef.current = equivalents.filter(button => isIndustry || button.textContent?.trim() === label).at(-1) ?? equivalents.at(-1) ?? null;
    const inView = (el: Element | null, margin = 0) => {
      if (!el || !el.getClientRects().length) return false;
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight + margin;
    };
    const update = () => {
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      const bookingAction = document.querySelector('#book-a-call [data-booking-actions]');
      bar.hidden = !mobile.matches || modalOpen || window.scrollY < window.innerHeight || heroBottom > 0
        || inView(footer) || equivalents.some(el => inView(el, 88)) || inView(bookingAction, 88);
    };
    // Observe both footer and the widget's dynamically inserted sticky action bar.
    const observer = new IntersectionObserver(update, { rootMargin: '0px 0px 88px 0px' });
    const observe = () => {
      observer.disconnect();
      for (const el of [hero, footer, ...equivalents, document.querySelector('#book-a-call [data-booking-actions]')]) {
        if (el) observer.observe(el);
      }
      update();
    };
    const mutations = new MutationObserver(observe);
    if (main) mutations.observe(main, { childList: true, subtree: true });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    mobile.addEventListener('change', update);
    observe();
    return () => {
      observer.disconnect(); mutations.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      mobile.removeEventListener('change', update);
    };
  }, [path, label, modalOpen]);

  if (!label) return null;
  return <div ref={barRef} className="mobile-sticky-cta" data-mobile-sticky-cta hidden>
    <button type="button" onClick={() => {
      if (path === '/') onBook();
      else sourceRef.current?.click();
    }}>{label}</button>
  </div>;
}
