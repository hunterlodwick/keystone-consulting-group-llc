import { createHash } from 'node:crypto';
import type { ApprovedPassage } from '../../src/lib/widget/strict-grounding/catalog';

export const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const safeRoute = (value: unknown): value is string => typeof value === 'string' &&
  /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(value) && !/^\/(?:api|dashboard|private|admin)(?:\/|$)/.test(value);
export const safeHref = (href: unknown, route: string) => typeof href === 'string' && safeRoute(route) &&
  (href === route || (href.startsWith(`${route}#`) && /^[a-zA-Z0-9_-]+$/.test(href.slice(route.length + 1))));

/** One invalid entry invalidates the entire immutable deployment artifact. */
export function validateArtifact(raw: unknown, expectedHash: string): ApprovedPassage[] {
  try {
    if (digest(raw) !== expectedHash) return [];
    const a = raw as { schema: number; passages: ApprovedPassage[] };
    if (a.schema !== 1 || !Array.isArray(a.passages) || a.passages.length !== 254) return [];
    const ids = new Set<string>();
    for (const p of a.passages) {
      if (!p || ids.has(p.id) || !safeRoute(p.route) || !safeHref(p.href, p.route)) return [];
      if (Object.keys(p).some(k => !['id','sourceId','route','href','label','passage','title','heading','parentHeading'].includes(k))) return [];
      if (['id','sourceId','label','passage'].some(k => typeof p[k] !== 'string' || !p[k].trim())) return [];
      ids.add(p.id);
    }
    return a.passages;
  } catch { return []; }
}
