import type { ApprovedPassage } from './catalog';
import type { Topic } from './turn';

const words = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
const stop = new Set('a an the to of in on for with and or is are do does can could would should how what which who when where why i my me you your we our it its about tell explain help business kcg page guide service services published please'.split(' '));
const terms = (s:string) => [...new Set(words(s).filter(w=>!stop.has(w)))];
const phrase = (s:string) => words(s).join(' ');
const ALIASES: Record<string,string[]> = {
  '/': ['published partners','partner list','partners','visa','mastercard','ingenico','heartland','pax','dejavoo','nmi','paytrace','payanywhere','kwickpos','korona','hotsauce','givehub','mynt','paradise pos'],
  '/services/openai-dot': ['openai dots','openai dot','dots','dot'],
  '/services/claude-duet': ['claude duet','duet'],
  '/services/grok-bot': ['grok bot','grok'],
  '/services/meta-muse': ['meta muse','muse'],
  '/services/ai-agents': ['virtual assistants','ai assistants','named assistants'],
  '/services/web-design': ['aeo','answer engine optimization','website builds','custom business website','interactive 3d'],
  '/services/pos-placement': ['pos placement','kitchen display','kitchen screens','wireless readers','smart terminals','free hardware'],
  '/services/google-business': ['google business profile setup'],
  '/services/bpo': ['bpo','business process outsourcing'],
  '/services/prep-to-sell': ['prep to sell','prepare to sell','exit preparation'],
  '/services/crm': ['crm systems','crm setup'],
  '/services': ['service catalog','bpo services'],
  '/services/automations': ['automations','system integrations'],
  '/services/consulting': ['consulting'],
  '/services/business-loans': ['business loans'],
  '/services/seo': ['seo services'],
  '/auto-repair': ['auto repair','shop management'],
  '/gas-stations': ['gas stations','gas station','fuel pumps'],
  '/nonprofits': ['nonprofits','nonprofit','donations','tap to give'],
  '/real-estate': ['real estate','tenant payments'],
  '/healthcare': ['healthcare','patient crm','patient billing'],
  '/salons': ['salon','salons'], '/restaurants':['restaurants','restaurant kitchen'],
  '/grocery':['grocery','groceries'], '/retail':['retail inventory'], '/ecommerce':['ecommerce'], '/b2b':['b2b'],
  '/work':['portfolio','selected work','mexpresso','operations dashboards'],
  '/terms':['terms of service','service agreements'], '/privacy':['privacy policy','how do you use my information'],
};
const hasPhrase = (q:string,p:string) => ` ${q} `.includes(` ${phrase(p)} `);

/** Local lexical routing only; no visitor strings leave this function. A strong
 * route/title/alias match is required before passages are scored within a page.
 * Ambiguous routes and weak matches preserve the existing scoped planner. */
export function retrievePublic(question: string, approved: ApprovedPassage[]): {topic:Topic; evidence:ApprovedPassage[]} | null {
  const q=phrase(question), qt=terms(question);
  if (!qt.length || /^(?:yes|no|that|okay|ok|sure)$/.test(q) || /^i (?:run|own|have) (?:a |an )?/.test(q)) return null;
  // Explicitly excluded and nonpublic route requests may not fall through to a
  // similarly named guide or generic public claim.
  const literalRoutes: string[] = question.match(/\/[a-z0-9/-]+/gi) ?? [];
  const groups=new Map<string,ApprovedPassage[]>();
  for (const e of approved.filter(e=>e.id.startsWith('public.'))) groups.set(e.route,[...(groups.get(e.route)??[]),e]);
  const routeScores = [...groups].map(([route,entries])=> {
    const title=entries[0].title??'';
    const titleTerms=terms(title);
    const overlap=titleTerms.filter(w=>qt.includes(w)).length;
    const routePhrase=route.replace(/^\/(?:services|guides)\//,'').replaceAll('/',' ').replaceAll('-',' ');
    let score = literalRoutes.includes(route) ? 1000 : 0;
    if (titleTerms.length>=2 && hasPhrase(q,title)) score=Math.max(score,100+titleTerms.length);
    // Guide questions can be phrased without copying the title verbatim.
    if (route.startsWith('/guides/') && overlap>=3 && overlap/titleTerms.length>=0.65) score=Math.max(score,30+overlap);
    if (terms(routePhrase).length>=2 && hasPhrase(q,routePhrase)) score=Math.max(score,45+terms(routePhrase).length);
    for (const alias of ALIASES[route]??[]) if (hasPhrase(q,alias)) score=Math.max(score,50+words(alias).length);
    return {route,entries,score};
  }).sort((a,b)=>b.score-a.score || a.route.localeCompare(b.route));
  const best=routeScores[0];
  if (!best || best.score===0 || (routeScores[1]?.score===best.score)) return null;
  if (literalRoutes.length && !literalRoutes.includes(best.route)) return null;
  const isAgent=/^\/services\/(?:openai-dot|claude-duet|grok-bot|meta-muse)$/.test(best.route);
  const scoreEntry=(e:ApprovedPassage)=> {
    const heading=terms(e.heading??''), body=terms(e.passage);
    return qt.reduce((sum,w)=>sum+(heading.includes(w)?5:0)+(body.includes(w)?1:0),0) + (hasPhrase(q,e.heading??'')?10:0);
  };
  let ranked=best.entries.map((e,i)=>({e,i,s:scoreEntry(e)})).sort((a,b)=>b.s-a.s||a.i-b.i).map(r=>r.e);
  if (best.route==='/') ranked=ranked.filter(e=>e.heading==='Published partners');
  // A guide's lead carries its legal/current-terms caveat; include that context
  // when a more detailed section is selected. AI examples retain input, draft,
  // human decision and outcome as a unit, with connector limits alongside.
  let selected=ranked.slice(0,2);
  if (isAgent) {
    const caveat=best.entries.find(e=>e.heading==='Connectors by time saved and input / output');
    if (caveat && !selected.includes(caveat)) selected.push(caveat);
  } else if (best.route.startsWith('/guides/')) {
    const intro=best.entries[0];
    if (!selected.includes(intro)) selected.push(intro);
  }
  const topic: Topic = best.route==='/'?'partners':isAgent||best.route==='/services/ai-agents'?'ai':best.route.includes('web-design')?'websites':'public';
  return selected.length ? {topic,evidence:selected.slice(0,3)} : null;
}

export function isExcludedRouteQuestion(question: string): boolean {
  return /(?:^|\s)\/(?:guides(?:\s|[?!.,]|$)|(?:api|dashboard|private|admin)(?:\/|\b))/.test(question.toLowerCase());
}
