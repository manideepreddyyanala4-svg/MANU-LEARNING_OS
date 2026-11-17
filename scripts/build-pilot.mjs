import {readFileSync,writeFileSync} from 'node:fs';
const b1=JSON.parse(readFileSync('docs/lesson-packs/B1/b1_lesson_pack.json','utf8'));
const specs=[['M07-T01','internship-v1-m07-t001','L2','Python lists, NumPy shape and indexing'],['M07-T07','internship-v1-m07-t007','L2','M07-T01–T06; multiplying, adding and averaging'],['M11-T05','internship-v1-m11-t005','L3','M11-T01–T04; genuine/impostor scores and thresholding']];
const lessons=specs.map(([id,key,depth,needs])=>{
 const original=b1.lessons.find(l=>l.topic_key===key);if(!original)throw Error(key);
 const content=readFileSync(`docs/lesson-packs/pilot/lessons/${id}.md`,'utf8');
 const sections=content.split(/^## /m).slice(1).map(s=>({title:s.slice(0,s.indexOf('\n')),body:s.slice(s.indexOf('\n')+1).trim()}));
 if(sections.map(s=>s.title).join('|')!=='UNDERSTAND|MECHANISM|WORKED EXAMPLE|COMMON MISTAKES|INTERVIEW CHECK')throw Error(id);
 return {id,key,title:original.topic_title,depth,needs,sections};
});
writeFileSync('lib/pilot-lessons.json',JSON.stringify(lessons,null,2)+'\n');
writeFileSync('docs/lesson-packs/pilot/manifest.json',JSON.stringify({status:'preview-only; no database import',featureFlag:'NEXT_PUBLIC_INTERACTIVE_PILOT=1',route:'/study-now/pilot?topic=<topic_key>',lessons:lessons.map(({id,key,title,depth,needs})=>({id,topic_key:key,topic_title:title,depth,needs,content:`lessons/${id}.md`}))},null,2)+'\n');
console.log('Built exactly three pilot lessons. Originals untouched.');
