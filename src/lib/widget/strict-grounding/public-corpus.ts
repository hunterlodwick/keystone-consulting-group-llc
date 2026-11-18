import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import evidence from './public-evidence.json';
import review from './public-review.json';

export type PublicPassage = typeof evidence.records[number];
export const hashPublicRecord = (record: Omit<PublicPassage,'hash'>) => createHash('sha256').update(JSON.stringify(record)).digest('hex');
export type SourceReader = (path: string) => string;
const readPublicSource: SourceReader = path => readFileSync(new URL(`../../../../${path}`, import.meta.url),'utf8');

/** Build/review tooling only. Production uses the validated packaged artifact. */
export function publicSourceStatus(read: SourceReader = readPublicSource): boolean {
  try {
    return Object.entries(review.sourceHashes).every(([path, expected]) => {
      if (!/^(?:src\/(?:App\.tsx|index\.css|pages\/[A-Za-z]+\.tsx|content\/[a-z-]+\.ts)|scripts\/(?:seo-routes\.ts|strict-grounding-breadth\/(?:render\.tsx|generate\.ts|extract\.py)))$/.test(path)) return false;
      return createHash('sha256').update(read(path)).digest('hex') === expected;
    });
  } catch { return false; }
}

/** Pure review gate: unreviewed additions, duplicates, and any changed field fail
 * closed. Approval hashes bind prose, title, URL, route, and visible provenance. */
export function reviewedPublicRecords(records: readonly PublicPassage[] = evidence.records): PublicPassage[] {
  const counts = new Map<string,number>();
  for (const r of records) counts.set(r.id,(counts.get(r.id)??0)+1);
  const approvals = new Map(review.approvals.map(a=>[a.id,a]));
  return records.filter(r=> {
    const a=approvals.get(r.id);
    const {hash,...payload}=r;
    return counts.get(r.id)===1 && a?.decision==='approved' && a.hash===hash && hash===hashPublicRecord(payload) &&
      review.routes.includes(r.route) && !(r.route in review.routeExclusions) &&
      r.provenance.kind==='rendered-public-main' && r.passage===r.provenance.blocks.join(' ') &&
      (r.href===r.route || r.href.startsWith(`${r.route}#`));
  });
}
export const REVIEWED_PUBLIC_PASSAGES = reviewedPublicRecords();
