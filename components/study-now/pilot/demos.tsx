'use client';
import {useState} from 'react';
import {filterAt, filterImage, genuineScores, impostorScores, verificationCounts, type Border} from '@/lib/pilot-math';
import s from './pilot.module.css';

export function PixelDemo() {
 const [point,setPoint]=useState({x:4,y:1});
 const [values,setValues]=useState(Array.from({length:24},(_,i)=>i));
 const value=values[point.y*6+point.x];
 return <div className={s.lab} aria-label="Pixel explorer">
  <p className={s.eyebrow}>Try it · choose a location</p><h3>One point, two ways to name it</h3>
  <div className={s.axes}><span>x → columns (0–5)</span><span>y ↓ rows (0–3)</span></div>
  <div className={s.grid} style={{gridTemplateColumns:'repeat(6,minmax(0,1fr))'}}>
   {values.map((v,i)=><button key={i} aria-label={`Pixel x ${i%6}, y ${Math.floor(i/6)}, brightness ${v}`} aria-pressed={point.x===i%6&&point.y===Math.floor(i/6)} onClick={()=>setPoint({x:i%6,y:Math.floor(i/6)})}>{v}</button>)}
  </div>
  <div className={s.result} aria-live="polite">Point <strong>(x={point.x}, y={point.y})</strong><br/>Row {point.y} → column {point.x} → <code>img[{point.y}, {point.x}] = {value}</code></div>
  <label htmlFor="pixel-brightness">Change this pixel's brightness: {value}</label>
  <input id="pixel-brightness" type="range" min="0" max="255" value={value} onChange={e=>setValues(values.map((v,i)=>i===point.y*6+point.x?Number(e.target.value):v))}/>
  <p>Only the selected value changes. The shape stays (4, 6).</p>
  <pre aria-label="Updated image array">{values.reduce<string[]>((rows,_,i)=>i%6?rows:[...rows,'['+values.slice(i,i+6).map(v=>String(v).padStart(3)).join(', ')+']'],[]).join('\n')}</pre>
  <button onClick={()=>{setPoint({x:4,y:1});setValues(Array.from({length:24},(_,i)=>i));}}>Reset grid</button>
 </div>;
}

export function KernelDemo() {
 const [point,setPoint]=useState({x:2,y:2}),[border,setBorder]=useState<Border>('zero');
 const [step,setStep]=useState(0),[asymmetric,setAsymmetric]=useState(false),[flip,setFlip]=useState(false);
 const result=filterAt(point.x,point.y,border,asymmetric,flip);
 const resetStep=()=>setStep(0);
 const labels=['1 · Gather','2 · Multiply','3 · Add & write'];
 return <div className={s.lab} aria-label="Filter explorer">
  <p className={s.eyebrow}>Try it · one output pixel at a time</p><h3>Follow the neighbourhood</h3>
  <p>Choose a centre below. Dashed cells are its visible neighbours; missing neighbours are shown in the calculation.</p>
  <div className={s.grid} style={{gridTemplateColumns:'repeat(5,minmax(0,1fr))'}}>{filterImage.flat().map((v,i)=><button key={i} aria-label={`Filter centre x ${i%5}, y ${Math.floor(i/5)}`} aria-pressed={point.x===i%5&&point.y===Math.floor(i/5)} data-neighbour={Math.abs(point.x-i%5)<=1&&Math.abs(point.y-Math.floor(i/5))<=1} onClick={()=>{setPoint({x:i%5,y:Math.floor(i/5)});resetStep();}}>{v}</button>)}</div>
  <label htmlFor="border-mode">Missing neighbours</label><select id="border-mode" value={border} onChange={e=>{setBorder(e.target.value as Border);resetStep();}}><option value="zero">Zero padding</option><option value="reflect101">Reflect-101</option><option value="replicate">Replicate edge</option></select>
  <label htmlFor="kernel-kind">Kernel</label><select id="kernel-kind" value={asymmetric?'right':'mean'} onChange={e=>{setAsymmetric(e.target.value==='right');resetStep();}}><option value="mean">Mean · nine weights of 1/9</option><option value="right">Asymmetric · copy right neighbour</option></select>
  <div className={s.nav}><button aria-pressed={!flip} onClick={()=>{setFlip(false);resetStep();}}>Cross-correlation</button><button aria-pressed={flip} onClick={()=>{setFlip(true);resetStep();}}>Convolution · flip kernel</button></div>
  <p>{asymmetric ? (flip?'Flipped kernel: only the middle-left weight is 1.':'Unflipped kernel: only the middle-right weight is 1.'):'All nine weights are 1/9. Flipping this symmetric kernel leaves it unchanged.'}</p>
  <div className={s.nav} aria-label="Calculation steps">{labels.map((label,i)=><button key={label} aria-pressed={i===step} onClick={()=>setStep(i)}>{label}</button>)}</div>
  <p>{step===0?'Gather nine input values. Dashed boxes use the border rule.':step===1?'Multiply each gathered value by its kernel weight.':`Add all nine products. Write the sum at output row ${point.y}, column ${point.x}.`}</p>
  <div className={s.terms} aria-label="Nine calculation terms">{result.terms.map((t,i)=><div className={s.term} key={i} data-outside={t.outside} aria-label={`${t.outside?'Border':'Image'} value ${t.value}, weight ${t.weight}, product ${t.product}`}>
   {step===0?<strong>{t.value}</strong>:<><span>{t.value} × {asymmetric?t.weight:'1/9'}</span><br/><strong>{Number(t.product.toFixed(3))}</strong></>}
  </div>)}</div>
  {step===2&&<div className={s.result} aria-live="polite"><strong>Output[{point.y}, {point.x}] = {Number(result.value.toFixed(3))}</strong><br/>{asymmetric?'The single weight of 1 selects one neighbour.':`Sum inputs ${result.terms.reduce((a,t)=>a+t.value,0)} ÷ 9 = ${Number(result.value.toFixed(3))}.`}<br/>Shown to 3 decimals; the calculation keeps full precision.</div>}
  <div className={s.nav}><button disabled={step===0} onClick={()=>setStep(step-1)}>Previous step</button><button disabled={step===2} onClick={()=>setStep(step+1)}>Next step</button></div>
 </div>;
}

export function MetricsDemo() {
 // Integer hundredths keep slider ties consistent with the displayed two-decimal scores.
 const [threshold,setThreshold]=useState(50),[strict,setStrict]=useState(false);
 const t=threshold/100,r=verificationCounts(genuineScores,impostorScores,t,strict);
 const accept=(v:number)=>strict?v>t:v>=t;
 const pct=(v:number|null)=>v===null?'undefined':`${Math.round(v*100)}%`;
 return <div className={s.lab} aria-label="Verification explorer">
  <p className={s.eyebrow}>Try it · synthetic scores only</p><h3>Who passes this threshold?</h3>
  <label htmlFor="decision-threshold">Threshold: {t.toFixed(2)} · accept score {strict?'>':'≥'} {t.toFixed(2)}</label>
  <input id="decision-threshold" type="range" min="0" max="100" step="1" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/>
  <div className={s.nav}><button onClick={()=>setThreshold(50)}>Reset to 0.50</button><button aria-pressed={strict} onClick={()=>setStrict(!strict)}>Mistake demo: use {strict?'≥ again':'> instead'}</button></div>
  {strict&&<p role="status">You changed the rule to &gt;. Samples exactly at the threshold are now rejected. The written example uses ≥.</p>}
  <h3>Genuine · same identity · 4 comparisons</h3><div className={s.samples}>{genuineScores.map((v,i)=><span key={i} data-error={!accept(v)}>{v.toFixed(2)} · {accept(v)?'accept ✓':'reject ✗'}</span>)}</div>
  <h3>Impostor · different identities · 5 comparisons</h3><div className={s.samples}>{impostorScores.map((v,i)=><span key={i} data-error={accept(v)}>{v.toFixed(2)} · {accept(v)?'accept ✗':'reject ✓'}</span>)}</div>
  <p>✓ correct decision · ✗ error. Labels explain decisions without relying on colour.</p>
  <div className={s.numbers} aria-live="polite"><div><small>FAR / FMR</small><strong>{pct(r.far)}</strong><small>{r.fa} / 5 impostor</small></div><div><small>FRR / FNMR</small><strong>{pct(r.frr)}</strong><small>{r.fr} / 4 genuine</small></div><div><small>TAR</small><strong>{pct(r.tar)}</strong><small>{r.ta} / 4 genuine</small></div></div>
  <p aria-live="polite">Genuine: {r.ta} accepted, {r.fr} rejected.<br/>Impostor: {r.fa} accepted, {r.tr} rejected.</p>
  <div className={s.result}>The denominators stay 5 and 4. Moving the threshold changes decisions, not group membership.</div>
 </div>;
}

export function ConceptFigure({id}:{id:string}) {
 const labels=id==='M07-T01'?['Point (x, y)','row y, column x','img[y, x]']:id==='M07-T07'?['9 input values','× 9 weights','sum → 1 output']:['Genuine trials','reject / all genuine','FRR / FNMR'];
 return <svg className={s.figure} viewBox="0 0 620 230" role="img" aria-label={labels.join(' → ')}><title>{labels.join(' → ')}</title>
  {labels.map((label,i)=><g key={label}><rect x="20" y={i*75+4} width="580" height="52" rx="13"/><text x="310" y={i*75+38} textAnchor="middle">{label}</text>{i<2&&<text x="310" y={i*75+77} textAnchor="middle">↓</text>}</g>)}
 </svg>;
}

export function InterviewCheck({id}:{id:string}) {
 const [attempt,setAttempt]=useState(''),[reveal,setReveal]=useState(false),[answer,setAnswer]=useState(''),[feedback,setFeedback]=useState('');
 const config=id==='M07-T01'?{task:'Point (x=5, y=2). Enter its NumPy indices as row,column.',expected:'2,5',why:'Row is y=2; column is x=5. NumPy uses img[2, 5].',rubric:'Your explanation should say: x counts columns, y counts rows, and NumPy takes row first.'}:id==='M07-T07'?{task:'At the top-left corner with zero padding, enter the sum BEFORE dividing by 9.',expected:'16',why:'Only 1, 2, 6 and 7 are inside the image. Their sum is 16; the other five terms are zero.',rubric:'Your explanation should say: border modes supply missing neighbours differently; the mean kernel is symmetric so flipping leaves it unchanged.'}:{task:'At threshold 0.60 (≥), enter false accepts,genuine rejects.',expected:'1,2',why:'Only impostor 0.60 is accepted. Genuine 0.50 and 0.40 are rejected. FAR=1/5=20%, FRR=2/4=50%, TAR=2/4=50%.',rubric:'Your explanation should connect false accepts to impostor comparisons, and false rejects to genuine comparisons. Their denominators differ.'};
 return <div className={s.lab}>
  <label htmlFor="concept-attempt">Write your conceptual answer first</label><textarea id="concept-attempt" rows={3} value={attempt} onChange={e=>{setAttempt(e.target.value);setReveal(false);}} placeholder="Explain in your own words…"/>
  <button disabled={!attempt.trim()} onClick={()=>setReveal(!reveal)}>{reveal?'Hide explanation':'Compare with explanation'}</button>
  {reveal&&<div className={s.result}>{config.rubric}<br/>Self-check your explanation; this does not automatically grade free text.</div>}
  <form onSubmit={e=>{e.preventDefault();const cleaned=answer.replace(/\s/g,'');setFeedback(cleaned===config.expected?'Correct. '+config.why:'Try again. '+(id==='M07-T01'?'Start with the row (y), then the column (x).':id==='M07-T07'?'List the non-zero neighbours before averaging.':'List decisions for each group using score ≥ 0.60.'));}}>
   <label htmlFor="practice-answer">{config.task}</label><input id="practice-answer" type="text" value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback('');}} autoComplete="off" required/><div className={s.nav}><button type="submit">Check my calculation</button></div>
  </form>
  {feedback&&<p role="status" className={s.result}>{feedback}</p>}
  {answer.trim()&&<details><summary>Reveal calculation solution</summary><p>{config.why}</p></details>}
 </div>;
}
