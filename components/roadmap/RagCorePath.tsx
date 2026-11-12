'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, Code2, ExternalLink, GraduationCap, PlayCircle, Target } from 'lucide-react';
import { Page } from '@/components/ui';
import type { LearningTrack } from '@/lib/career-learning-tracks';
import { getRagCoreStages } from '@/lib/rag-core-lessons';

type Props = {
  track: LearningTrack;
  completed: string[];
  saving: string[];
  status: 'loading' | 'ready' | 'error';
  message: string;
  onToggle: (slug:string) => void;
};

export default function RagCorePath({ track, completed, saving, status, message, onToggle }:Props) {
  const stages = useMemo(() => getRagCoreStages(track), [track]);
  const lessons = stages.flatMap(stage => stage.lessons);
  const [selected, setSelected] = useState('');
  const [expanded, setExpanded] = useState(stages[0].id);
  const completedSet = new Set(completed);
  const firstIncomplete = lessons.find(lesson => !completedSet.has(lesson.slug));
  const active = lessons.find(lesson => lesson.slug === selected) ?? firstIncomplete ?? lessons[0];
  const activeIndex = lessons.findIndex(lesson => lesson.slug === active.slug);
  const stage = stages.find(s => s.lessons.some(lesson => lesson.slug === active.slug)) ?? stages[0];
  const completedCount = lessons.filter(lesson => completedSet.has(lesson.slug)).length;
  const percentage = Math.round(100 * completedCount / lessons.length);
  const isDone = completedSet.has(active.slug);

  function choose(slug:string){
    const st=stages.find(s=>s.lessons.some(lesson=>lesson.slug===slug));
    if(st)setExpanded(st.id);
    setSelected(slug);
    if(typeof document !== 'undefined' && window.innerWidth < 768) {
      document.getElementById('rag-core-lesson')?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  return (
    <Page
      eyebrow="Practical AI engineering · learn from zero"
      title="LLM → RAG → MCP: only what you need"
      subtitle="34 beginner-friendly lessons in the right order. Learn one idea, try one exercise, then connect it to your real project. No unnecessary frameworks."
      actions={<Link href="/roadmap" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)]"><ArrowLeft size={15}/> All roadmaps</Link>}
    >
      <div className="space-y-5">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-900 p-5 text-white md:p-7">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/85"><GraduationCap size={16}/> Beginner → build → interview</div>
          <h2 className="mt-3 max-w-2xl text-2xl font-black md:text-3xl">One small lesson at a time. No 262-item checklist.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">You already know some if/else and loops. Skip a familiar topic ONLY when you can complete its exercise independently. Keep applying for internships while learning.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">10 stages</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">34 essential lessons</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{completedCount}/34 completed</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{width:percentage+'%'}}/></div>
          <p className="mt-2 text-xs text-white/85">{status === 'ready' ? 'Your original ManuOS checkmarks are preserved.' : status === 'loading' ? 'Loading saved progress…' : 'You can read lessons, but progress saving is unavailable until you sign in.'}</p>
        </section>

        {message && <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">{message}</div>}

        <div className="grid items-start gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
          <nav aria-label="Essential learning stages" className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="px-2 py-2 text-xs font-black uppercase tracking-wider text-[var(--muted)]">Learning order</p>
            {stages.map((item,i)=>{
              const done=item.lessons.filter(lesson=>completedSet.has(lesson.slug)).length;
              const open=item.id===expanded;
              const isCurrent=item.id===stage.id;
              return <div key={item.id} className={'overflow-hidden rounded-xl border '+(isCurrent?'border-violet-500/50 bg-violet-500/5':'border-[var(--line)]')}>
                <button aria-expanded={open} type="button" className="flex w-full items-center gap-2 p-3 text-left" onClick={()=>setExpanded(open?'':item.id)}>
                  <span className={'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black '+(done===item.lessons.length?'bg-emerald-500/15 text-emerald-600':'bg-violet-500/10 text-violet-600 dark:text-violet-300')}>{done===item.lessons.length?<CheckCircle2 size={16}/>:String(i+1).padStart(2,'0')}</span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-extrabold leading-5 text-[var(--fg)]">{item.title}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{done}/{item.lessons.length} completed</span></span>
                  <ChevronDown size={15} className={'shrink-0 text-[var(--muted)] transition '+(open?'rotate-180':'')}/>
                </button>
                {open && <div className="space-y-1 border-t border-[var(--line)] px-2 py-2">
                  {item.lessons.map(lesson=><button key={lesson.slug} type="button" onClick={()=>choose(lesson.slug)} aria-current={active.slug===lesson.slug?'step':undefined} className={'flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-xs leading-5 '+(active.slug===lesson.slug?'bg-violet-500/10 font-bold text-violet-700 dark:text-violet-300':'text-[var(--fg)] hover:bg-[var(--bg)]')}>
                    <span className="w-5 shrink-0 font-mono">{String(lesson.number).padStart(2,'0')}</span><span className="flex-1">{lesson.title}</span>{completedSet.has(lesson.slug)&&<CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500"/>}
                  </button>)}
                </div>}
              </div>;
            })}
          </nav>

          <article id="rag-core-lesson" className="scroll-mt-4 space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">Lesson {active.number} of 34 · Stage {stages.indexOf(stage)+1}</span>
              {isDone && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={16}/> Already completed</span>}
            </div>
            <h2 className="text-xl font-black leading-tight text-[var(--fg)] md:text-2xl">{active.title}</h2>

            <div className="rounded-xl bg-violet-500/5 p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[var(--fg)]"><BookOpen size={16} className="text-violet-600"/> Learn in simple words</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">{active.meaning}</p>
            </div>
            <div className="rounded-xl border border-[var(--line)] p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[var(--fg)]"><Code2 size={16} className="text-sky-600"/> Tiny example</h3>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-[var(--bg)] p-4 font-mono text-xs leading-6 text-[var(--fg)]">{active.example}</pre>
            </div>
            <div className="rounded-xl bg-emerald-500/5 p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[var(--fg)]"><Target size={16} className="text-emerald-600"/> Your practice — do it yourself</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">{active.task}</p>
              {["python", "data", "search", "backend", "proof"].includes(stage.id) && <Link href="/python-lab" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"><Code2 size={14}/> Open ManuOS Python Lab <ArrowRight size={13}/></Link>}
              <p className="mt-3 border-t border-emerald-500/20 pt-3 text-xs leading-6 text-[var(--fg)]"><strong>Ready to continue when:</strong> {active.check}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] p-3">
              <div>
                <p className="text-xs font-bold text-[var(--fg)]">One optional learning resource</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">Use only if the example is unclear. You do not need to finish a whole course.</p>
              </div>
              <a href={stage.resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg)] px-3 py-2 text-xs font-bold text-violet-600 dark:text-violet-300"><PlayCircle size={14}/>{stage.resource.label}<ExternalLink size={12}/></a>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
              <button type="button" onClick={()=>activeIndex>0&&choose(lessons[activeIndex-1].slug)} disabled={activeIndex===0} className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-2.5 text-xs font-bold text-[var(--fg)] disabled:opacity-40"><ArrowLeft size={14}/> Previous</button>
              <button type="button" disabled={status!=='ready'||saving.includes(active.slug)} onClick={()=>onToggle(active.slug)} className={'inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold disabled:opacity-40 '+(isDone?'border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300':'bg-violet-600 text-white hover:bg-violet-700')}>
                <CheckCircle2 size={15}/>{isDone?'Mark as not done':'I completed the practice'}
              </button>
              <button type="button" onClick={()=>activeIndex<lessons.length-1&&choose(lessons[activeIndex+1].slug)} disabled={activeIndex===lessons.length-1} className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-2.5 text-xs font-bold text-[var(--fg)] disabled:opacity-40">Next <ArrowRight size={14}/></button>
            </div>
          </article>
        </div>

        <aside className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-xs leading-6 text-[var(--muted)]">
          <strong className="text-[var(--fg)]">What's not in the core path?</strong> Transformer Q/K/V mathematics, fine-tuning, LangGraph internals, HNSW/IVFFlat, advanced pgvector, Docker infrastructure and full cloud MLOps. These are useful later or for specific jobs, but not necessary to understand and defend your current RAG/MCP application. All 262 original topics remain stored for future reference, and no saved progress has been discarded.
        </aside>
        <p className="text-xs text-[var(--muted)]">You do not have to finish the roadmap before applying. Practice Python and explain one working project flow each day while continuing your internship applications.</p>
      </div>
    </Page>
  );
}
