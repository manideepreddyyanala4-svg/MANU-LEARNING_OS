'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {useTheme} from 'next-themes';
import lessons from '@/lib/pilot-lessons.json';
import {PythonLessonLab} from '@/components/python-lesson-lab';
import {CodeBlock} from '@/components/study-now/lesson-notes';
import {ConceptFigure,InterviewCheck,KernelDemo,MetricsDemo,PixelDemo} from './demos';
import s from './pilot.module.css';
import type {PythonChallenge} from '@/lib/python-challenges';

const exercises:Record<string,PythonChallenge>={
 'M07-T01':{prompt:'Write mark_pixel(): create a 6-row, 8-column NumPy array of zeros; set (x=5,y=2) to 200 and return the array.',starter:'import numpy as np\n\ndef mark_pixel():\n    # Create the array, mark one pixel, return it.\n    pass',checks:[{name:'Correct shape and location',code:'a=mark_pixel()\nassert a.shape == (6,8)\nassert a[2,5] == 200'},{name:'Only one changed pixel',code:'assert np.count_nonzero(a) == 1'}]},
 'M07-T07':{prompt:'Write mean9(values): average exactly nine numbers, rejecting any other length with ValueError. No extra packages are needed.',starter:'def mean9(values):\n    # Check length, sum the values, divide.\n    pass',checks:[{name:'Interior neighbourhood',code:'assert mean9([7,8,9,12,13,14,17,18,19]) == 13'},{name:'Zero border neighbourhood',code:'assert abs(mean9([0,0,0,0,1,2,0,6,7])-16/9) < 1e-9'},{name:'Reject missing neighbours',code:'try:\n    mean9([1,2])\nexcept ValueError:\n    pass\nelse:\n    raise AssertionError("Expected ValueError for a non-nine window")'}]},
 'M11-T05':{prompt:'Write rates(genuine, impostor, t): return (FAR, FRR, TAR), using score >= t. For an empty group return None for that group\'s rate(s).',starter:'def rates(genuine, impostor, t):\n    # Count accepts; divide by each group total.\n    pass',checks:[{name:'Example denominators',code:'assert rates([.9,.7,.5,.4],[.1,.3,.5,.6,.2],.5) == (.4,.25,.75)'},{name:'Equality accepted',code:'assert rates([.5],[.5],.5) == (1,0,1)'},{name:'Empty groups undefined',code:'assert rates([],[],.5) == (None,None,None)'},{name:'Unequal group counts',code:'assert rates([.8],[.1,.2],.5) == (0,0,1)'}]},
};
const browserExamples:Record<string,string>={
 'M07-T01':'import numpy as np\nimg = np.arange(24).reshape(4,6)\nx,y = 4,1\nprint(img[y,x])\nimg[y,x] = 200\nprint(img[1].tolist())',
 'M07-T07':'window = [0,0,0,0,1,2,0,6,7]\nproducts = [v * (1/9) for v in window]\nprint("sum inputs:", sum(window))\nprint("output:", round(sum(products),3))',
 'M11-T05':'genuine=[.9,.7,.5,.4]\nimpostor=[.1,.3,.5,.6,.2]\nt=.5\nta=sum(s>=t for s in genuine)\nfa=sum(s>=t for s in impostor)\nprint("FAR",fa/len(impostor))\nprint("FRR",1-ta/len(genuine))\nprint("TAR",ta/len(genuine))'
};
const demos:Record<string,React.ComponentType>={'M07-T01':PixelDemo,'M07-T07':KernelDemo,'M11-T05':MetricsDemo};
export function LessonPreview({initialKey}:{initialKey:string}) {
 const [key,setKey]=useState(initialKey),[focus,setFocus]=useState(false);
 const {resolvedTheme,setTheme}=useTheme();
 const lesson=lessons.find(l=>l.key===key)??lessons[0],index=lessons.indexOf(lesson);
 const Demo=demos[lesson.id];
 useEffect(()=>{document.documentElement.classList.toggle('focus-mode',focus);const esc=(e:KeyboardEvent)=>{if(e.key==='Escape')setFocus(false);};window.addEventListener('keydown',esc);return()=>{document.documentElement.classList.remove('focus-mode');window.removeEventListener('keydown',esc);};},[focus]);
 function choose(nextKey:string){setKey(nextKey);window.history.replaceState(null,'',`?topic=${encodeURIComponent(nextKey)}`);window.scrollTo({top:0});}
 return <div className={s.pilot+' mx-auto w-full max-w-3xl px-4 py-6 sm:px-6'}>
  <header className={s.header}>
   <div className={s.nav}><Link href="/study-now">← Study Now</Link><button onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}>Switch theme</button><button aria-pressed={focus} onClick={()=>setFocus(!focus)}>{focus?'Exit focus mode':'Focus mode'}</button></div>
   <p className={s.eyebrow}>Interactive pilot · {index+1} of 3 · {lesson.id}</p>
   <h1>{lesson.title}</h1><p><span className={s.badge}>Required depth {lesson.depth}</span></p>
   <p><strong>Before this:</strong> {lesson.needs}.</p>
   <p>This is a preview. Your saved notes and progress are unchanged.</p>
   <label htmlFor="pilot-topic" className={s.eyebrow}>Choose a pilot lesson</label>
   <div className={s.nav}><select id="pilot-topic" value={lesson.key} onChange={e=>choose(e.target.value)}>{lessons.map(l=><option key={l.key} value={l.key}>{l.id} · {l.title}</option>)}</select></div>
   <nav className={s.nav} aria-label="Lesson sections">{lesson.sections.map((section,i)=><a key={section.title} href={`#pilot-section-${i}`}>{i+1}. {section.title.charAt(0)+section.title.slice(1).toLowerCase()}</a>)}</nav>
  </header>
  <article key={lesson.key} aria-label={lesson.title}>
   {lesson.sections.map((section,i)=><section id={`pilot-section-${i}`} key={section.title} className={s.section}>
    <p className={s.eyebrow}>0{i+1} / 05</p><h2>{section.title.charAt(0)+section.title.slice(1).toLowerCase()}</h2>
    <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{pre:({children})=><CodeBlock>{children}</CodeBlock>,table:({children})=><div className="table-wrap"><table>{children}</table></div>}}>{section.body}</ReactMarkdown>
    {i===0&&<ConceptFigure id={lesson.id}/>}
    {i===1&&<Demo/>}
    {i===4&&<><InterviewCheck id={lesson.id}/><p>Run a small example or solve the independent coding task below. Python loads on demand; if the runtime cannot load, the verified written examples above remain available.</p><PythonLessonLab lessonId={`pilot-${lesson.id}`} customChallenge={exercises[lesson.id]} exampleCode={browserExamples[lesson.id]}/></>}
   </section>)}
  </article>
  <nav className={s.nav} aria-label="Pilot navigation"><button disabled={index===0} onClick={()=>choose(lessons[index-1].key)}>← Previous pilot</button><button disabled={index===lessons.length-1} onClick={()=>choose(lessons[index+1].key)}>Next pilot →</button></nav>
  <p>End of this pilot. Use Study Now for your complete ordered curriculum. No completion status is set here.</p>
 </div>;
}
