import { readFileSync, writeFileSync, mkdirSync, rmSync, realpathSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { LEGACY_PASSAGES } from './widget-legacy-passages';
import { hashPublicRecord, reviewedPublicRecords } from '../src/lib/widget/strict-grounding/public-corpus';
import { digest, safeRoute, safeHref, validateArtifact } from '../server/widget/artifact';
import review from '../src/lib/widget/strict-grounding/public-review.json';
import evidence from '../src/lib/widget/strict-grounding/public-evidence.json';

export const SOURCE_PATHS = [
  'scripts/seo-routes.ts', 'scripts/strict-grounding-breadth/extract.py',
  'scripts/strict-grounding-breadth/generate.ts', 'scripts/strict-grounding-breadth/render.tsx',
  'src/App.tsx', ...['ai-agents','guide-comparisons','guide-questions','guide-seo','guide-sources','guide-states','guides','site-seo'].map(n => `src/content/${n}.ts`),
  'src/index.css', ...['AiAgentsPage','GuidesPage','IndustryPageTemplate','LegalPage','ServicesPage','WorkPage'].map(n => `src/pages/${n}.tsx`),
].sort();
export function verifySources(read: (path: string) => string) {
  if (SOURCE_PATHS.length !== 20 || JSON.stringify(Object.keys(review.sourceHashes).sort()) !== JSON.stringify(SOURCE_PATHS)) throw Error('Expected exactly 20 reviewed source pins');
  for (const path of SOURCE_PATHS) {
    if (createHash('sha256').update(read(path)).digest('hex') !== review.sourceHashes[path]) throw Error(`Reviewed source changed: ${path}`);
  }
}
export function packageWidget(root = process.cwd()) {
  const out = resolve(root, 'server/generated');
  // A failed build cannot leave a previously valid artifact behind.
  rmSync(resolve(out, 'approved-evidence.json'), { force: true });
  rmSync(resolve(out, 'approved-evidence-pin.ts'), { force: true });
  const read = (path: string) => {
    const real = realpathSync(resolve(root, path));
    const rel = relative(realpathSync(root), real);
    if (rel.startsWith('..') || rel.startsWith('/')) throw Error('Source escapes checkout');
    return readFileSync(real, 'utf8');
  };
  verifySources(read);
  if (review.schema !== 1 || evidence.schema !== 1 || review.approvals.length !== 242 || new Set(review.approvals.map(a=>a.id)).size !== 242 ||
      evidence.records.length !== 242 || reviewedPublicRecords().length !== 242) throw Error('Invalid public approvals');
  for (const r of evidence.records) {
    const { hash, ...payload } = r;
    if (hash !== hashPublicRecord(payload) || !safeRoute(r.route) || !safeHref(r.href, r.route)) throw Error('Unsafe evidence');
  }
  const index = JSON.parse(read('src/generated/widget-index.json'));
  const normalized = (text: string) => text.replace(/\s+/g, ' ').trim();
  for (const p of LEGACY_PASSAGES) {
    const matches = index.sources.filter(s => s.id === p.sourceId);
    if (matches.length !== 1 || matches[0].kind !== 'page-section' || matches[0].route !== p.route ||
        !index.publicRoutes.includes(p.route) || !normalized(matches[0].text).includes(normalized(p.passage))) throw Error(`Legacy excerpt changed: ${p.id}`);
  }
  const passages = [...LEGACY_PASSAGES, ...evidence.records.map(({id,sourceId,route,href,label,passage,title,heading,parentHeading}) =>
    ({id,sourceId,route,href,label,passage,title,heading,parentHeading}))];
  const artifact = { schema: 1, passages };
  const hash = digest(artifact);
  if (validateArtifact(artifact, hash).length !== 254) throw Error('Invalid packaged artifact');
  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, 'approved-evidence.json'), JSON.stringify(artifact) + '\n');
  writeFileSync(resolve(out, 'approved-evidence-pin.ts'), `// Generated only after source and approval validation.\nexport const APPROVED_ARTIFACT_HASH = '${hash}';\n`);
  console.log('Validated 20 source pins; packaged 254 approved passages for the server function.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) packageWidget();
