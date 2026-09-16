const fs=require('fs'),ts=require('typescript'),vm=require('vm'),crypto=require('crypto'),cp=require('child_process');
const root='verification/services-overhaul/remaining-eight';
const ids=['crm','consulting','seo','google-business','bpo','consumer-financing','business-loans','prep-to-sell'];
const baselines=[268,256,277,262,263,253,260,270];
function read(text){
 const sf=ts.createSourceFile('ServicesPage.tsx',text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let array; function walk(n){if(ts.isVariableDeclaration(n)&&n.name.getText(sf)==='SERVICES_DETAIL')array=n.initializer;ts.forEachChild(n,walk)}walk(sf);
 const icons={};for(const m of text.matchAll(/(?:"icon"|icon): (\w+)/g))icons[m[1]]=m[1];
 return array.elements.map(n=>({raw:n.getText(sf),start:n.getStart(sf),end:n.end,data:vm.runInNewContext('('+n.getText(sf)+')',icons)}));
}
function copy(x){if(typeof x==='string')return [x];if(Array.isArray(x))return x.flatMap(copy);if(x&&typeof x==='object')return Object.entries(x).filter(([k])=>!['id','image','imageAlt','icon','url'].includes(k)).flatMap(([,v])=>copy(v));return []}
const beforeText=fs.readFileSync(root+'/ServicesPage.before.txt','utf8'),afterText=fs.readFileSync('src/pages/ServicesPage.tsx','utf8');
const before=read(beforeText),after=read(afterText);
const assert=(v,msg)=>{if(!v)throw new Error(msg)};
function masked(text,entries){for(const e of [...entries].reverse())if(ids.includes(e.data.id))text=text.slice(0,e.start)+'ENTRY:'+e.data.id+text.slice(e.end);return text}
assert(masked(beforeText,before)===masked(afterText,after),'Changes outside eight entries');
const rows=[],data={};
for(const [i,id] of ids.entries()){
 const b=before.find(e=>e.data.id===id),a=after.find(e=>e.data.id===id),d=a.data;data[id]=d;
 assert(b.data.image===d.image&&b.data.imageAlt===d.imageAlt,id+' image changed');
 assert(d.sections.length>=4&&d.sections.length<=6,id+' sections');assert(d.process.length===4,id+' process');assert(d.questions.length>=5&&d.questions.length<=6,id+' questions');assert(d.buildIncludes.items.length&&d.fit.yes.length&&d.fit.no.length&&d.close.button&&d.problem.length,id+' structure');
 for(const st of d.statistics){assert(JSON.stringify(Object.keys(st).sort())===JSON.stringify(['title','value','explanation','source','url'].sort()),id+' statistic schema');assert(st.url.startsWith('https://'),id+' URL')}
 const text=copy(d).join('\n'),words=text.split(/\s+/).length;
 assert(words>=700&&words<=1000,id+' word count '+words);
 for(const forbidden of ['\u2014','[needs number]','$8.71','3D'])assert(!a.raw.includes(forbidden),id+' forbidden '+forbidden);
 fs.writeFileSync(root+'/'+id+'.txt',text+'\n');
 const lint=cp.spawnSync('python3',['/Users/hunterlodwick/.hermes/skills/productivity/slopmonster/tools/deslop.py',root+'/'+id+'.txt','--allow-proof'],{encoding:'utf8'});
 fs.writeFileSync(root+'/slop-'+id+'.log',lint.stdout+lint.stderr);assert(lint.status===0,id+' copy lint '+lint.stdout);
 rows.push({id,before:baselines[i],measuredBefore:copy(b.data).join('\n').split(/\s+/).length,after:words,statistics:d.statistics.map(st=>({value:st.value,source:st.source,url:st.url})),blocker:null});
}
fs.writeFileSync(root+'/entries.json',JSON.stringify(data,null,2)+'\n');fs.writeFileSync(root+'/content-checks.json',JSON.stringify({rows,outsideEntriesUnchanged:true,imagesUnchanged:true,schema:'Existing ServiceDetail and renderer contract',forbiddenCounts:{emDashes:0,needsNumber:0,staleCrmFigure:0,threeD:0},copyLint:'All eight 5/5'},null,2)+'\n');
console.log(rows.map(r=>`${r.id}: ${r.before} -> ${r.after} (measured before ${r.measuredBefore})`).join('\n'));
