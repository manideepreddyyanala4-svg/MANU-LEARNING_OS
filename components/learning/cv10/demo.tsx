'use client';
import {useState} from 'react';
import type {Cv10Lesson} from '@/lib/cv10-document';
import {applyMask,components,componentMask,holeMask,kernelOffsets,morph,neighbours,noisyMask,removeSmall,squareMask,type KernelShape,type Matrix,type MorphOp} from '@/lib/cv10-math';
import contours from '@/lib/cv10-contours.json';
import p from '@/components/study-now/pilot/pilot.module.css';
import s from './cv10.module.css';

export function MatrixView({a,label,onChoose,point,neighbourhood=false,labels=false}:{a:Matrix;label:string;onChoose?:(x:number,y:number)=>void;point?:{x:number;y:number};neighbourhood?:boolean;labels?:boolean}) {
 return <figure><figcaption className={s.caption}>{label}</figcaption><div className={s.matrix} style={{gridTemplateColumns:`repeat(${a[0].length},minmax(0,1fr))`}}>{a.flatMap((row,y)=>row.map((v,x)=>{const props={'data-on':v>0,'data-selected':point?.x===x&&point?.y===y,'data-neighbour':!!point&&neighbourhood&&Math.abs(point.x-x)<=1&&Math.abs(point.y-y)<=1};return onChoose?<button type="button" className={s.cell} {...props} aria-label={`${label}: x ${x}, y ${y}, ${labels?'label':'value'} ${v}`} key={`${x}-${y}`} onClick={()=>onChoose(x,y)}>{v}</button>:<span className={s.cell} {...props} key={`${x}-${y}`}>{v}</span>;}))}</div></figure>;
}
const sum=(a:Matrix)=>a.flat().reduce((s,v)=>s+v,0);
const flip=(a:Matrix,x:number,y:number)=>a.map((r,yy)=>r.map((v,xx)=>xx===x&&yy===y?1-v:v));
export function BinaryDemo({masking=false}:{masking?:boolean}) {
 const initial=componentMask,[mask,setMask]=useState<Matrix>(initial),[operation,setOperation]=useState('select');
 const image=mask.map((r,y)=>r.map((_,x)=>16+y*28+x*3));
 const maskB=mask.map((r,y)=>r.map((_,x)=>x>=3?1:0));
 const result=operation==='select'?applyMask(image,mask):operation==='mistake'?applyMask(image,mask,true):mask.map((r,y)=>r.map((v,x)=>operation==='and'?v&maskB[y][x]:operation==='or'?v|maskB[y][x]:operation==='xor'?v^maskB[y][x]:1-v));
 return <div className={p.lab} aria-label={masking?'Mask operations explorer':'Binary mask explorer'}><h3>{masking?'Selection is different from bitwise arithmetic':'Choose which locations belong to foreground'}</h3><p>Click a square to toggle 0 ↔ 1. x is column; y is row.</p>
  {masking&&<><label htmlFor="cv-mask-op">Operation</label><select id="cv-mask-op" value={operation} onChange={e=>setOperation(e.target.value)}><option value="select">Select image pixels where mask A ≠ 0</option><option value="mistake">Mistake: image AND mask A (0/1)</option><option value="and">Mask A AND B</option><option value="or">Mask A OR B</option><option value="xor">Mask A XOR B</option><option value="not">Logical NOT A (1 - A)</option></select></>}
  <MatrixView a={mask} label="Mask A · click to edit" onChoose={(x,y)=>setMask(flip(mask,x,y))}/>
  {masking&&<MatrixView a={operation==='select'||operation==='mistake'?image:maskB} label={operation==='select'||operation==='mistake'?'Image · uint8 values':'Mask B · right-side selection'}/>}
  <MatrixView a={masking?result:mask.map(r=>r.map(v=>v*255))} label={masking?'Computed output':'Same selection encoded as 0/255'}/>
  <div className={p.result} aria-live="polite">{sum(mask)} selected locations. {masking?(operation==='mistake'?'A direct AND with 1 keeps only the last bit of each value.':'Changing the mask updates the output at the same positions.'):`Mask values sum to ${sum(mask)*255} in 0/255 encoding, but there are still ${sum(mask)} selected pixels.`}</div>
  <button onClick={()=>{setMask(initial);setOperation('select');}}>Reset</button>
 </div>;
}
export function MorphDemo({kind}:{kind:MorphOp}) {
 const initial=kind==='opening'?noisyMask:kind==='closing'?holeMask:kind==='gradient'?noisyMask.map((r,y)=>r.map((v,x)=>x===0&&y===0?0:v)):squareMask;
 const [a,setA]=useState<Matrix>(initial),[shape,setShape]=useState<KernelShape>('square'),[zero,setZero]=useState(false),[point,setPoint]=useState({x:3,y:3}),[edit,setEdit]=useState(false),[stage,setStage]=useState(0);
 const compound=['opening','closing','gradient'].includes(kind);
 const firstOp=kind==='closing'?'dilation':'erosion';
 const intermediate=compound?morph(a,firstOp,shape,zero):a;
 const output=morph(a,kind,shape,zero);
 const effectiveOp=kind==='closing'?'erosion':kind==='opening'?'dilation':kind==='gradient'?'dilation':kind;
 const input=compound&&stage>0&&kind!=='gradient'?intermediate:a;
 const terms=neighbours(input,point.x,point.y,shape,effectiveOp as 'erosion'|'dilation',zero);
 const currentValue=output[point.y][point.x];
 return <div className={p.lab} aria-label={`${kind} explorer`}><h3>{kind.charAt(0).toUpperCase()+kind.slice(1)} · inspect one decision</h3>
  <label htmlFor="cv-shape">Structuring element · 3×3, centred</label><select id="cv-shape" value={shape} onChange={e=>{setShape(e.target.value as KernelShape);setStage(0);}}><option value="square">Square · 9 active positions</option><option value="cross">Cross · 5 active positions</option></select>
  <label htmlFor="cv-border">Outside the image</label><select id="cv-border" value={zero?'zero':'neutral'} onChange={e=>{setZero(e.target.value==='zero');setStage(0);}}><option value="neutral">Neutral · erosion 1, dilation 0</option><option value="zero">Explicit zero for both operations</option></select>
  <div className={p.nav}><button aria-pressed={!edit} onClick={()=>setEdit(false)}>Inspect neighbourhood</button><button aria-pressed={edit} onClick={()=>setEdit(true)}>Edit input pixels</button></div>
  <MatrixView a={a} label={edit?'Input · click to toggle':'Input · click an output location'} point={point} neighbourhood onChoose={(x,y)=>edit?setA(flip(a,x,y)):setPoint({x,y})}/>
  <MatrixView a={[[...Array(3)].map((_,x)=>kernelOffsets(shape).some(v=>v.dx===x-1&&v.dy===-1)?1:0),[...Array(3)].map((_,x)=>kernelOffsets(shape).some(v=>v.dx===x-1&&v.dy===0)?1:0),[...Array(3)].map((_,x)=>kernelOffsets(shape).some(v=>v.dx===x-1&&v.dy===1)?1:0)]} label="Structuring element · 1 = check, 0 = ignore"/>
  <div className={p.nav}><button disabled={stage===0} onClick={()=>setStage(stage-1)}>Previous step</button><button disabled={stage===2} onClick={()=>setStage(stage+1)}>Next step</button><span>Step {stage+1} / 3</span></div>
  {stage===0?<p>{compound?`First, inspect the input. ${kind==='opening'?'Erode, then dilate.':kind==='closing'?'Dilate, then erode.':'Compute dilation and erosion separately, then subtract.'}`:'Place the element on the selected location. Only its 1 positions are checked.'}</p>:stage===1?<>
   {compound&&<MatrixView a={intermediate} label={`Intermediate · ${firstOp}`}/>}
   <div className={p.result}>{kind==='gradient'?'Next compare dilation with erosion at the same position.':`Active values at (x=${point.x}, y=${point.y}): ${terms.map(t=>t.value+(t.outside?' (outside)':'')).join(', ')}. ${effectiveOp==='erosion'?'Minimum / all':'Maximum / any'} → ${effectiveOp==='erosion'?Math.min(...terms.map(t=>t.value)):Math.max(...terms.map(t=>t.value))}.`}</div>
  </>:<>
   {kind==='gradient'&&<div className={s.pair}><MatrixView a={morph(a,'dilation',shape,zero)} label="Dilation"/><MatrixView a={morph(a,'erosion',shape,zero)} label="Erosion"/></div>}
   <MatrixView a={output} label={`Final ${kind} output`} point={point}/>
   <div className={p.result} aria-live="polite">Output[y={point.y}, x={point.x}] = {currentValue}. {sum(a)} foreground pixels → {sum(output)}.{kind==='gradient'&&` Here: ${morph(a,'dilation',shape,zero)[point.y][point.x]} - ${morph(a,'erosion',shape,zero)[point.y][point.x]} = ${currentValue}.`}</div>
  </>}
  <button onClick={()=>{setA(initial);setShape('square');setZero(false);setStage(0);setPoint({x:3,y:3});setEdit(false);}}>Reset</button>
 </div>;
}
export function ComponentDemo({filter=false}:{filter?:boolean}) {
 const [a,setA]=useState<Matrix>(componentMask),[connectivity,setConnectivity]=useState<4|8>(8),[minimum,setMinimum]=useState(3);
 const c=removeSmall(a,minimum,connectivity);
 return <div className={p.lab} aria-label={filter?'Region area explorer':'Connected components explorer'}><h3>{filter?'Keep whole components by area':'Which foreground pixels belong together?'}</h3><p>Toggle a pixel. Labels are recalculated from the current mask; 0 always means background.</p>
 <label htmlFor="cv-connectivity">Neighbour rule</label><select id="cv-connectivity" value={connectivity} onChange={e=>setConnectivity(Number(e.target.value) as 4|8)}><option value="4">4 · side neighbours only</option><option value="8">8 · sides and diagonals</option></select>
 <MatrixView a={a} label="Binary input · click to edit" onChoose={(x,y)=>setA(flip(a,x,y))}/><MatrixView a={c.labels} label="Component labels · 0 = background" labels/>
 {filter&&<><label htmlFor="cv-minimum">Keep area ≥ {minimum} pixels</label><input id="cv-minimum" type="range" min="1" max="50" value={minimum} onChange={e=>setMinimum(Number(e.target.value))}/></>}
 <div className={s.table}><table><caption>Foreground component areas</caption><thead><tr><th>Label</th><th>Pixels</th>{filter&&<th>Decision</th>}</tr></thead><tbody>{c.sizes.slice(1).map((v,i)=><tr key={i}><td>{i+1}</td><td>{v}</td>{filter&&<td>{v>=minimum?'Keep':'Remove'}</td>}</tr>)}</tbody></table></div>
 {c.count===0&&<p>No foreground components. All locations are background.</p>}
 {filter&&<MatrixView a={c.output} label="Filtered mask · original shape of kept components"/>}
 <p className={p.result} aria-live="polite">{c.count} foreground components.{filter&&` ${sum(a)} foreground pixels → ${sum(c.output)} kept pixels.`} Background area {c.sizes[0]} is excluded.</p>
 <button onClick={()=>{setA(componentMask);setConnectivity(8);setMinimum(3);}}>Reset</button></div>;
}
export function ContourDemo(){
 const [preset,setPreset]=useState<keyof typeof contours.presets>('ring'),[mode,setMode]=useState('TREE'),[method,setMethod]=useState('SIMPLE'),[selected,setSelected]=useState(0),[step,setStep]=useState(0);
 const data=contours.presets[preset],key=`${mode}_${method}` as keyof typeof data.cases,c=data.cases[key],path=c.paths[selected]??[],point=path[Math.min(step,path.length-1)];
 const resetPoint=()=>{setSelected(0);setStep(0);};
 return <div className={p.lab} aria-label="Contour path explorer"><h3>Follow actual OpenCV contour coordinates</h3><p>These are precomputed OpenCV {contours.opencv} results for four synthetic presets. Controls select exact reference results.</p>
 <label htmlFor="cv-preset">Input shape</label><select id="cv-preset" value={preset} onChange={e=>{setPreset(e.target.value as keyof typeof contours.presets);resetPoint();}}><option value="ring">Ring · contains a hole</option><option value="square">Filled square</option><option value="single">Single pixel</option><option value="diagonal">Diagonal pair</option></select>
 <label htmlFor="cv-retrieval">Retrieval mode</label><select id="cv-retrieval" value={mode} onChange={e=>{setMode(e.target.value);resetPoint();}}><option>EXTERNAL</option><option>TREE</option></select>
 <label htmlFor="cv-approximation">Approximation</label><select id="cv-approximation" value={method} onChange={e=>{setMethod(e.target.value);resetPoint();}}><option>SIMPLE</option><option>NONE</option></select>
 <label htmlFor="cv-contour">Inspect contour</label><select id="cv-contour" value={selected} onChange={e=>{setSelected(Number(e.target.value));setStep(0);}}>{c.paths.map((p,i)=><option key={i} value={i}>Contour {i} · {p.length} points</option>)}</select>
 <svg className={s.frame} viewBox="0 0 350 350" role="img" aria-label={`Mask with ${c.paths.length} contours. Selected contour ${selected}, point ${step}: x ${point?.[0]}, y ${point?.[1]}.`}><title>Selected contour path through pixel centres</title>{data.mask.flatMap((r,y)=>r.map((v,x)=><rect key={`${x}-${y}`} x={x*50+1} y={y*50+1} width="48" height="48" data-on={!!v}/>))}<polyline points={[...path,...path.slice(0,1)].map(([x,y])=>`${x*50+25},${y*50+25}`).join(' ')}/>{point&&<circle cx={point[0]*50+25} cy={point[1]*50+25} r="9"/>}</svg>
 <p className={p.result} aria-live="polite">Point {step+1} / {path.length}: (x={point?.[0]}, y={point?.[1]}) → image[{point?.[1]}, {point?.[0]}].<br/>Polygon area {c.areas[selected]}; input foreground pixels {sum(data.mask)}.</p>
 <div className={p.nav}><button disabled={step===0} onClick={()=>setStep(step-1)}>Previous point</button><button disabled={step>=path.length-1} onClick={()=>setStep(step+1)}>Next point</button></div>
 <details><summary>Coordinates and hierarchy</summary><p>{path.map(pt=>`(${pt.join(', ')})`).join(' → ')}</p><p>[next, previous, child, parent] = [{c.hierarchy[selected]?.join(', ')}]. -1 means none.</p></details>
 <button onClick={()=>{setPreset('ring');setMode('TREE');setMethod('SIMPLE');resetPoint();}}>Reset</button></div>;
}
export function Cv10Demo({lesson}:{lesson:Cv10Lesson}){
 return <div className={p.pilot+' '+s.wrap}>{lesson.kind==='binary'?<BinaryDemo/>:lesson.kind==='masking'?<BinaryDemo masking/>:lesson.kind==='components'?<ComponentDemo/>:lesson.kind==='regions'?<ComponentDemo filter/>:lesson.kind==='contours'?<ContourDemo/>:<MorphDemo kind={lesson.kind as MorphOp}/>}</div>;
}
