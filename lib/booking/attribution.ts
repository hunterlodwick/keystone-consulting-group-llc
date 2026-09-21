/** Optional client metadata. Missing attribution must never prevent a booking. */
export const ATTRIBUTION_KEYS = ['kcgPage', 'kcgCta', 'kcgReferrer', 'kcgUtm', 'kcgWidget'] as const;
export type BookingAttribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

// Leave headroom under Google's 1024-character value limit. Strip controls/markup.
export function cleanAttribution(value: string, max = 1000): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f<>]/g, '').trim().slice(0, max).replace(/[\uD800-\uDBFF]$/, '');
}

export function sanitizeAttribution(input: Record<string, unknown>): BookingAttribution {
  const result: BookingAttribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    if (typeof input[key] !== 'string') continue;
    let value = cleanAttribution(input[key]);
    if (key === 'kcgPage') {
      value = value.split(/[?#]/)[0];
      if (!value.startsWith('/') || value.startsWith('//')) continue;
    }
    if (key === 'kcgReferrer' && value !== 'direct') {
      try {
        const url = new URL(value.includes('://') ? value : `https://${value}`);
        value = ['http:', 'https:'].includes(url.protocol) ? url.hostname : '';
      } catch { value = ''; }
    }
    if (key === 'kcgUtm') {
      const params = new URLSearchParams();
      for (const [name, item] of new URLSearchParams(value)) {
        if (/^utm_/i.test(name)) params.append(name, item);
      }
      value = cleanAttribution(params.toString());
    }
    if (key === 'kcgWidget' && value !== 'modal' && value !== 'inline') continue;
    if (value) result[key] = value;
  }
  return result;
}
