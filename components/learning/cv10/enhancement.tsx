'use client';
import {Component,useState,type ReactNode} from 'react';
import {cv10Lessons,lessonMarker,type Cv10Lesson} from '@/lib/cv10-document';
import {componentMask,holeMask,morph,noisyMask,squareMask,type MorphOp} from '@/lib/cv10-math';
import {PythonLessonLab} from '@/components/python-lesson-lab';
import {Cv10Demo,MatrixView} from './demo';
import p from '@/components/study-now/pilot/pilot.module.css';
import s from './cv10.module.css';
class VisualBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<p role="status">The interactive example could not load. Continue with the written explanation and verified code.</p>:this.props.children;}
}
export function Cv10Intro({lesson}:{lesson:Cv10Lesson}){
 const kind=lesson.kind;
 const input=kind==='opening'?noisyMask:kind==='closing'?holeMask:kind==='gradient'?noisyMask.map((r,y)=>r.map((v,x)=>x===0&&y===0?0:v)):squareMask;
 return <div className={p.pilot+' '+s.wrap}>
 {['erosion','dilation','opening','closing','gradient'].includes(kind)?<div className={s.pair}><MatrixView a={input} label="Input · foreground = 1"/><MatrixView a={morph(input,kind as MorphOp)} label={`After ${kind} · 3×3 square`}/></div>:
 <div className={s.flow} role="img" aria-label={kind==='binary'?'Brightness 20, 180, 220. Threshold greater than 100. Decisions 0, 1, 1.':kind==='masking'?'Image 50, 200, 127. Select with mask 1, 0, 1. Output 50, 0, 127.':kind==='components'?'Two diagonal foreground pixels. Side neighbours only: two groups. Including diagonals: one group.':kind==='regions'?'Component areas 1, 3, 4. Keep area at least 3. Kept area 7.':'A filled 3 by 3 square has 9 foreground pixels. Its compressed contour has 4 points and polygon area 4.'}>
  <div>{kind==='binary'?'Brightness: 20 · 180 · 220':kind==='masking'?'Image: 50 · 200 · 127':kind==='components'?'Two pixels touch at a corner':kind==='regions'?'Component areas: 1 · 3 · 4':'A 3×3 filled square: 9 foreground pixels'}</div><span aria-hidden="true">↓</span>
  <div>{kind==='binary'?'Rule: brightness > 100':kind==='masking'?'Selector: 1 · 0 · 1':kind==='components'?'Choose side-only or diagonal steps':kind==='regions'?'Keep area ≥ 3':'Trace and compress the outer boundary'}</div><span aria-hidden="true">↓</span>
  <div>{kind==='binary'?'Mask: 0 · 1 · 1':kind==='masking'?'Output: 50 · 0 · 127':kind==='components'?'4-connectivity: 2 groups · 8-connectivity: 1 group':kind==='regions'?'Keep 3 + 4 = 7 pixels':'4 contour points · polygon area = 4'}</div>
 </div>}
 </div>;
}
export function Cv10Check({lesson}:{lesson:Cv10Lesson}){
 const [explanation,setExplanation]=useState(''),[answer,setAnswer]=useState(''),[show,setShow]=useState(false),[feedback,setFeedback]=useState(''),[codeAttempt,setCodeAttempt]=useState(false);
 return <div className={p.pilot+' '+s.wrap}><div className={p.lab}>
 <label htmlFor={`cv-explain-${lesson.kind}`}>Explain in your own words</label><textarea id={`cv-explain-${lesson.kind}`} rows={3} value={explanation} onChange={e=>{setExplanation(e.target.value);setShow(false);}}/>
 <button disabled={!explanation.trim()} onClick={()=>setShow(!show)}>{show?'Hide explanation':'Compare with explanation'}</button>
 {show&&<p className={p.result}>{lesson.rubric} Free text is self-assessed; clicking does not certify understanding.</p>}
 <form onSubmit={e=>{e.preventDefault();setFeedback(answer.replace(/\s/g,'')===lesson.answer?'Correct. '+lesson.rubric:'Try again. Revisit the small worked example and check the operation order, equality rule or coordinate order.');}}>
 <label htmlFor={`cv-answer-${lesson.kind}`}>{lesson.task}</label><input type="text" id={`cv-answer-${lesson.kind}`} value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback('');}} required autoComplete="off"/><div className={p.nav}><button type="submit">Check calculation</button></div></form>
 {feedback&&<p className={p.result} role="status">{feedback}</p>}
 {!!answer.trim()&&<details><summary>Reveal calculation answer</summary><p>{lesson.answer}. {lesson.rubric}</p></details>}
 </div>
 <p>The OpenCV worked example above was executed during validation. The browser coding task below uses Python lists so it can run in the existing Python Lab without cv2. Copy the OpenCV example to your local Python environment to run that version.</p>
 <PythonLessonLab lessonId={`cv10-${lesson.kind}`} customChallenge={lesson.practice}/>
 <div className={p.lab}><label><input type="checkbox" checked={codeAttempt} onChange={e=>setCodeAttempt(e.target.checked)}/> I have attempted the coding exercise.</label>{codeAttempt&&<details><summary>Reveal Python exercise solution</summary><pre>{lesson.practice.solution}</pre><p>Explain why it passes before comparing it with your code.</p></details>}</div>
 </div>;
}
export function Cv10Enhancement({topicId,blockId}:{topicId:string;blockId?:string}){
 const lesson=cv10Lessons.find(l=>l.topicId===topicId);if(!lesson)return null;
 let child:ReactNode=null;
 if(blockId===lessonMarker(lesson,'visual'))child=<Cv10Intro lesson={lesson}/>;
 if(blockId===lessonMarker(lesson,'demo'))child=<Cv10Demo lesson={lesson}/>;
 if(blockId===lessonMarker(lesson,'check'))child=<Cv10Check lesson={lesson}/>;
 return child?<VisualBoundary key={topicId+blockId}>{child}</VisualBoundary>:null;
}
