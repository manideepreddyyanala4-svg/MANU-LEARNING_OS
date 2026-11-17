import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import ts from 'typescript';
const py=process.argv[2]??'python';
const source=readFileSync('lib/pilot-math.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {filterAt,verificationCounts,genuineScores,impostorScores}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const lessons=JSON.parse(readFileSync('lib/pilot-lessons.json'));
const curriculum=readFileSync('lib/internship-curriculum.ts','utf8');
assert.equal(lessons.length,3);
for(const l of lessons){
 assert.ok(curriculum.includes(JSON.stringify(l.title)));
 const md=readFileSync(`docs/lesson-packs/pilot/lessons/${l.id}.md`,'utf8');
 for(const [,code,expected]of md.matchAll(/```python\n([\s\S]*?)\n```\n\nOutput:\n\n```text\n([\s\S]*?)\n```/g)){
  const r=spawnSync(py,['-I','-c',code],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trimEnd(),expected,l.id);
 }
}
console.log('PASS three topic titles, lesson source mapping and all displayed Python outputs');
const oracle=spawnSync(py,['-I','-c',`import numpy as np, cv2, json
img=np.arange(1,26,dtype=np.float64).reshape(5,5)
rows=[]
for border,mode in [('zero',cv2.BORDER_CONSTANT),('reflect101',cv2.BORDER_REFLECT_101),('replicate',cv2.BORDER_REPLICATE)]:
 for asymmetric in [False,True]:
  for flip in [False,True]:
   k=np.zeros((3,3)) if asymmetric else np.ones((3,3))/9
   if asymmetric: k[1,2]=1
   if flip: k=np.flip(k)
   out=cv2.filter2D(img,-1,k,borderType=mode)
   rows.append(dict(border=border,asymmetric=asymmetric,flip=flip,output=out.tolist()))
print(json.dumps(rows))`],{encoding:'utf8'});
assert.equal(oracle.status,0,oracle.stderr);
let n=0;
for(const row of JSON.parse(oracle.stdout))for(let y=0;y<5;y++)for(let x=0;x<5;x++){
 assert.ok(Math.abs(filterAt(x,y,row.border,row.asymmetric,row.flip).value-row.output[y][x])<1e-10);n++;
}
console.log(`PASS ${n} filter outputs independently agree with OpenCV (all positions, borders, kernels and flip conventions)`);
assert.deepEqual(verificationCounts(genuineScores,impostorScores,.5),{ta:3,fa:2,fr:1,tr:3,far:.4,frr:.25,tar:.75});
assert.deepEqual(verificationCounts([.5],[.5],.5),{ta:1,fa:1,fr:0,tr:0,far:1,frr:0,tar:1});
assert.equal(verificationCounts([.5],[.5],.5,true).fa,0);
assert.deepEqual(verificationCounts([],[],.5),{ta:0,fa:0,fr:0,tr:0,far:null,frr:null,tar:null});
assert.throws(()=>verificationCounts([NaN],[],.5));
assert.throws(()=>filterAt(-1,0,'zero'));
let prevFA=5,prevTA=4;
for(let i=0;i<=100;i++){
 const r=verificationCounts(genuineScores,impostorScores,i/100);
 assert.ok(r.fa<=prevFA&&r.ta<=prevTA);assert.equal(r.ta+r.fr,4);assert.equal(r.fa+r.tr,5);
 assert.ok(Math.abs(r.tar+r.frr-1)<1e-12);prevFA=r.fa;prevTA=r.ta;
}
console.log('PASS threshold sweep, ties, strict operator, unequal denominators, empty groups and invalid inputs');
const diff=spawnSync('git',['diff','--name-only','HEAD','--','lib/internship-curriculum.ts','docs/lesson-packs/B1','supabase','proxy.ts'],{encoding:'utf8'});
assert.equal(diff.stdout,'');console.log('PASS canonical curriculum, B1 originals, database migrations and authentication untouched');
