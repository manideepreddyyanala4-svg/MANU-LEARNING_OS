import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import ts from 'typescript';
const py=process.argv[2]??'python';
const lessons=JSON.parse(readFileSync('lib/library-cv10-lessons.json','utf8'));
async function loadModule(path,replacements=[]){let code=readFileSync(path,'utf8');for(const [a,b] of replacements)code=code.replace(a,b);const js=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const math=await loadModule('lib/cv10-math.ts');
const doc=await loadModule('lib/cv10-document.ts',[["import lessons from './library-cv10-lessons.json';",'const lessons='+JSON.stringify(lessons)+';']]);
assert.equal(lessons.length,10);assert.equal(new Set(lessons.map(l=>l.topicId)).size,10);
let checks=0;
for(const l of lessons){
 const r=spawnSync(py,['-I','-c',l.code],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),l.output,l.title);
 const exercise=spawnSync(py,['-I','-c',l.practice.solution+'\n'+l.practice.checks.map(c=>c.code).join('\n')],{encoding:'utf8'});assert.equal(exercise.status,0,exercise.stderr);checks+=l.practice.checks.length;
 const blocks=doc.cv10Document(l);assert.equal(new Set(blocks.map(b=>b.id)).size,blocks.length);
 assert.deepEqual(blocks.filter(b=>b.type==='heading').map(b=>b.content[0].text),['UNDERSTAND','MECHANISM','WORKED EXAMPLE','COMMON MISTAKES','INTERVIEW CHECK']);
 for(const suffix of ['visual','demo','check'])assert.ok(blocks.some(b=>b.id===doc.lessonMarker(l,suffix)));
}
console.log(`PASS ten verified OpenCV worked examples, ${checks} independent Python exercise checks, five-section documents and trusted markers`);
let seed=17;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const grids=[[[0]],[[1]],Array.from({length:5},()=>Array(5).fill(0)),Array.from({length:5},()=>Array(5).fill(1)),math.squareMask,math.noisyMask,math.holeMask,math.componentMask,...Array.from({length:24},()=>Array.from({length:7},()=>Array.from({length:7},()=>rand()>.6?1:0)))];
const oracle=spawnSync(py,['-I','-c',`import sys,json,cv2,numpy as np
out=[]
for aa in json.load(sys.stdin):
 a=np.array(aa,np.uint8);r={'morph':[],'components':[]}
 for shape in ['square','cross']:
  k=cv2.getStructuringElement(cv2.MORPH_RECT if shape=='square' else cv2.MORPH_CROSS,(3,3))
  for zero in [False,True]:
   kwargs=dict(borderType=cv2.BORDER_CONSTANT)
   if zero:kwargs['borderValue']=0
   for op,flag in [('erosion',cv2.MORPH_ERODE),('dilation',cv2.MORPH_DILATE),('opening',cv2.MORPH_OPEN),('closing',cv2.MORPH_CLOSE),('gradient',cv2.MORPH_GRADIENT)]:
    r['morph'].append(dict(shape=shape,zero=zero,op=op,out=cv2.morphologyEx(a,flag,k,**kwargs).tolist()))
 for conn in [4,8]:
  n,labels,stats,_=cv2.connectedComponentsWithStats(a,connectivity=conn)
  r['components'].append(dict(conn=conn,labels=labels.tolist(),areas=sorted(stats[1:,cv2.CC_STAT_AREA].tolist())))
 out.append(r)
print(json.dumps(out))`],{encoding:'utf8',input:JSON.stringify(grids),maxBuffer:10*1024*1024});
assert.equal(oracle.status,0,oracle.stderr);let operations=0;
const canonical=a=>{const map=new Map([[0,0]]);let next=1;return a.map(r=>r.map(v=>{if(!map.has(v))map.set(v,next++);return map.get(v);}));};
for(const [i,oracleRow] of JSON.parse(oracle.stdout).entries()){
 const a=grids[i];for(const m of oracleRow.morph){assert.deepEqual(math.morph(a,m.op,m.shape,m.zero),m.out,`${m.op} ${m.shape} zero=${m.zero} grid${i}`);operations++;}
 for(const c of oracleRow.components){const got=math.components(a,c.conn);assert.deepEqual(canonical(got.labels),canonical(c.labels));assert.deepEqual(got.sizes.slice(1).sort((a,b)=>a-b),c.areas);
  for(const minimum of [1,3,50]){const out=math.removeSmall(a,minimum,c.conn).output;assert.equal(out.flat().reduce((s,v)=>s+v,0),c.areas.filter(v=>v>=minimum).reduce((s,v)=>s+v,0));}
 }
}
assert.deepEqual(math.applyMask([[50,200,127]],[[1,0,1]]),[[50,0,127]]);
assert.deepEqual(math.applyMask([[50,200,127]],[[1,0,1]],true),[[0,0,1]]);
assert.throws(()=>math.morph([[2]],'erosion'));assert.throws(()=>math.morph([[1],[0,1]],'erosion'));assert.throws(()=>math.removeSmall([[1]],0));
console.log(`PASS ${operations} complete morphology outputs vs OpenCV, ${grids.length*2} component partitions and ${grids.length*6} region-filter checks; empty/full/single-pixel/border/invalid cases included`);
const fixtureBefore=readFileSync('lib/cv10-contours.json','utf8');
const contour=spawnSync(py,['scripts/generate-cv10-contours.py'],{encoding:'utf8'});assert.equal(contour.status,0,contour.stderr);assert.equal(readFileSync('lib/cv10-contours.json','utf8'),fixtureBefore);
console.log('PASS all 16 contour fixtures reproduce exactly from OpenCV, including holes, diagonal contact and degenerate point paths');
const protectedPaths=['lib/internship-curriculum.ts','docs/lesson-packs/B1','proxy.ts','app/api/learning-assets','supabase'];
const diff=spawnSync('git',['diff','--name-only','origin/main','--',...protectedPaths],{encoding:'utf8'});assert.equal(diff.stdout,'');
console.log('PASS roadmap, B1, authentication, private asset endpoint and database schema unchanged');
