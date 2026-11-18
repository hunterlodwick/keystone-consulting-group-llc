import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const base = 'src/lib/widget/strict-grounding';
const candidate = JSON.parse(readFileSync('verification/widget-grounding-breadth/candidates.json','utf8'));
const review = JSON.parse(readFileSync(`${base}/public-review.json`,'utf8'));
if (JSON.stringify(candidate.sourceHashes)!==JSON.stringify(review.sourceHashes) || JSON.stringify(candidate.routes)!==JSON.stringify(review.routes)) throw Error('Source/inventory drift: explicit new review required');
const records = review.approvals.map((a: any)=> {
  const entries=candidate.candidates.filter((c: any)=>c.id===a.id);
  if (entries.length!==1) throw Error(`Missing/duplicate candidate ${a.id}`);
  const {hash,...record}=entries[0];
  if (a.decision!=='approved' || a.hash!==hash || hash!==createHash('sha256').update(JSON.stringify(record)).digest('hex')) throw Error(`Review mismatch: ${a.id}`);
  return entries[0];
});
writeFileSync(`${base}/public-evidence.json`,JSON.stringify({schema:1, records},null,2)+'\n');
console.log(`Assembled ${records.length} explicitly hash-approved records; approval file unchanged.`);
