import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const out = 'verification/widget-grounding-breadth';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const stable = (value: unknown) => JSON.stringify(value);
const bundlePath = resolve(`${out}/render-tmp.mjs`);
const allow = new Set(['src/App.tsx','src/pages/ServicesPage.tsx','src/pages/IndustryPageTemplate.tsx','src/pages/WorkPage.tsx','src/pages/AiAgentsPage.tsx','src/pages/LegalPage.tsx','src/pages/GuidesPage.tsx', 'scripts/seo-routes.ts', 'scripts/strict-grounding-breadth/render.tsx', ...['ai-agents','guides','guide-questions','guide-comparisons','guide-states','guide-sources','guide-seo','site-seo'].map(n=>`src/content/${n}.ts`)]);
const built = await build({ entryPoints:['scripts/strict-grounding-breadth/render.tsx'], outfile:bundlePath, bundle:true, write:false, metafile:true, platform:'node', format:'esm', packages:'external', jsx:'automatic', plugins:[{
  name:'public-only', setup(b) {
    b.onResolve({filter:/DashboardPage|components\//}, args => ({path:args.path, namespace:'excluded'}));
    b.onLoad({filter:/.*/, namespace:'excluded'}, () => ({contents:'export default function Excluded(){return null}; export const BookingWidget=Excluded, BookingSection=Excluded, MobileStickyCta=Excluded; export const isBookingModalTitle=()=>false, stickyCtaLabel=()=>null;',loader:'js'}));
    b.onLoad({filter:/\.(tsx?|css)$/}, args=> {
      const rel = args.path.slice(process.cwd().length+1);
      if (!allow.has(rel)) throw new Error(`Unapproved render input: ${rel}`);
      return undefined;
    });
  }
}] });
writeFileSync(bundlePath, built.outputFiles[0].text);
let pages: Record<string,string>;
let routes: string[];
try {
  const renderer = await import(pathToFileURL(bundlePath).href);
  routes = [...renderer.routes].sort();
  if (new Set(routes).size !== routes.length || routes.some(r=>!/^\/(?:[a-z0-9-]+\/?)*$/.test(r) || /^\/(?:api|dashboard|private)/.test(r))) throw Error('Invalid positive public route inventory');
  pages = Object.fromEntries(routes.map(r=>[r,renderer.render(r)]));
} finally { unlinkSync(bundlePath); }
const parsed = spawnSync('python3',['scripts/strict-grounding-breadth/extract.py'], { input:stable(pages), encoding:'utf8', maxBuffer:20_000_000 });
if (parsed.status !== 0) throw Error(parsed.stderr);
const rendered = JSON.parse(parsed.stdout);
const inputs = [...new Set([...Object.keys(built.metafile!.inputs).filter(p=>allow.has(p)), 'src/index.css', 'scripts/strict-grounding-breadth/extract.py', 'scripts/strict-grounding-breadth/generate.ts'])].sort();
const sourceHashes = Object.fromEntries(inputs.map(path=>[path,hash(readFileSync(path,'utf8'))]));
const candidates: any[] = [];
for (const route of routes) {
  const page = rendered[route];
  for (const section of page.sections) {
    // Whole semantic blocks only. Never cut sentences to satisfy a size cap.
    const chunks: string[][] = [[]];
    for (const block of section.blocks) {
      if (chunks.at(-1)!.join(' ').length + block.length > 2000 && chunks.at(-1)!.length) chunks.push([]);
      chunks.at(-1)!.push(block);
    }
    for (const [part,blocks] of chunks.entries()) {
      const passage = blocks.join(' ');
      if (passage.length < 90 || passage.length > 2500) continue;
      const id = `public.${(route==='/'?'home':route.slice(1).replaceAll('/','.'))}.${section.ordinal}.${part}`;
      const record = {id, sourceId:id, route, title:page.title, label:`${page.title} — ${section.heading}`, heading:section.heading, parentHeading:section.parentHeading,
        href:route+(section.anchor?`#${section.anchor}`:''), passage,
        provenance:{kind:'rendered-public-main', ordinal:section.ordinal, blocks, visualException:section.visualException??null}};
      candidates.push({...record, hash:hash(stable(record))});
    }
  }
}
const manifest = {schema:1, sourceHashes, routes, candidates};
writeFileSync(`${out}/candidates.json`,JSON.stringify(manifest,null,2)+'\n');
writeFileSync(`${out}/rendered-public.json`,JSON.stringify(rendered,null,2)+'\n');
writeFileSync(`${out}/candidate-review.md`, '# Unapproved public copy candidates\n\nGeneration never grants approval. Review exact passages, scope, visible context and anchors before pinning hashes.\n\n'+routes.map(route=>`## ${route}\n\n${candidates.filter(c=>c.route===route).map(c=>`### ${c.id} | ${c.heading}\n\n${c.passage}\n\nCitation: ${c.href}\nHash: ${c.hash}\n`).join('\n')}`).join('\n'));
console.log(JSON.stringify({routes:routes.length,candidates:candidates.length,sourceInputs:inputs.length,approvedByGeneration:0}));
