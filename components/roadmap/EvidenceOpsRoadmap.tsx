'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, Code2, ExternalLink, GraduationCap, ShieldAlert, Target } from 'lucide-react';
import { Page } from '@/components/ui';
import type { LearningTrack } from '@/lib/career-learning-tracks';
import { getEvidenceOpsRoadmap, EVIDENCEOPS_TOPIC_COUNT } from '@/lib/evidenceops-roadmap';

type Props = {
  track: LearningTrack;
  completed: string[];
  saving: string[];
  status: 'loading' | 'ready' | 'error';
  message: string;
  onToggle: (slug: string) => void;
};

export default function EvidenceOpsRoadmap({ track, completed, saving, status, message, onToggle }: Props) {
  const stages = useMemo(() => getEvidenceOpsRoadmap(track), [track]);
  const topics = stages.flatMap(stage => stage.topics);
  const done = new Set(completed);
  const next = topics.find(t => !done.has(t.legacySlug));
  const [chosen, setChosen] = useState('');
  const selected = topics.find(t => t.legacySlug === chosen) ?? next ?? topics[0];
  const selectedIndex = topics.findIndex(t => t.legacySlug === selected.legacySlug);
  const stage = stages.find(s => s.topics.some(t => t.legacySlug === selected.legacySlug)) ?? stages[0];
  const [open, setOpen] = useState('');
  const expanded = open || stage.id;
  const completedCount = topics.filter(t => done.has(t.legacySlug)).length;
  const percentage = Math.round(100 * completedCount / topics.length);
  const select = (slug: string) => {
    setChosen(slug);
    const parent = stages.find(s => s.topics.some(t => t.legacySlug === slug));
    if (parent) setOpen(parent.id);
  };

  return (
    <Page
      eyebrow="PROJECT 2 · RAG / LLM / AI AGENTS"
      title="EvidenceOps: from zero to internship interview"
      subtitle="A separate, topic-by-topic roadmap for your first LLM/RAG/MCP project. Project 1 dorsal-hand research stays unchanged."
      actions={<Link href="/roadmap" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)]"><ArrowLeft size={15}/> All roadmaps</Link>}
    >
      <div className="space-y-5">
        <section className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-900 p-6 text-white md:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80"><GraduationCap size={17}/> Beginner to interview · concept first</div>
          <h2 className="mt-3 text-2xl font-black md:text-3xl">One topic. One example. One practice task.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">
            Study from Python fundamentals and LLM meaning to document retrieval, embeddings, verified RAG, APIs, MCP agents and evaluation.
            Each topic explains what, how, an example, a mistake, a practical task and an interview check. Project files come after the concept.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/15 px-3 py-1">{stages.length} stages</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{EVIDENCEOPS_TOPIC_COUNT} individual topics</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{completedCount} completed</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{width: percentage + '%'}}/></div>
          <p className="mt-2 text-xs text-white/80">{status==='ready'?'Your previous ManuOS progress IDs are preserved.':status==='loading'?'Loading saved checkmarks…':'Sign in to save progress; lessons are still readable.'}</p>
        </section>

        {message && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">{message}</p>}

        <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <nav aria-label="Project 2 learning stages" className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="px-2 py-2 text-xs font-black uppercase tracking-wider text-[var(--muted)]">Learn in this order</p>
            {stages.map((s,i)=>{
              const d=s.topics.filter(t=>done.has(t.legacySlug)).length;
              const isOpen=expanded===s.id;
              return <div key={s.id} className={'overflow-hidden rounded-xl border '+(stage.id===s.id?'border-violet-500/40 bg-violet-500/5':'border-[var(--line)]')}>
                <button type="button" aria-expanded={isOpen} onClick={()=>setOpen(isOpen?'-':s.id)} className="flex w-full items-start gap-2 p-3 text-left">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-xs font-black text-violet-700 dark:text-violet-300">{String(i+1).padStart(2,'0')}</span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-bold leading-5 text-[var(--fg)]">{s.title}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{d}/{s.topics.length} complete</span></span>
                  <ChevronDown size={16} className={'mt-1 shrink-0 text-[var(--muted)] '+(isOpen?'rotate-180':'')}/>
                </button>
                {isOpen && <div className="space-y-1 border-t border-[var(--line)] p-2">
                  {s.topics.map(t=><button type="button" key={t.legacySlug} onClick={()=>select(t.legacySlug)} aria-current={selected.legacySlug===t.legacySlug?'step':undefined} className={'flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-xs leading-5 '+(selected.legacySlug===t.legacySlug?'bg-violet-500/10 font-bold text-violet-700 dark:text-violet-300':'text-[var(--fg)] hover:bg-[var(--bg)]')}>
                    <span className="w-7 shrink-0 font-mono">{String(t.number).padStart(3,'0')}</span>
                    <span className="flex-1">{t.title}</span>
                    {done.has(t.legacySlug)&&<CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-500"/>}
                  </button>)}
                </div>}
              </div>;
            })}
          </nav>

          <article className="scroll-mt-4 space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">Topic {String(selected.number).padStart(3,'0')} / {topics.length}</span>
              {done.has(selected.legacySlug)&&<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={15}/> Complete</span>}
            </div>
            <h2 className="text-xl font-black leading-tight text-[var(--fg)] md:text-2xl">{selected.title}</h2>
            <p className="text-xs leading-6 text-[var(--muted)]">Stage goal: {stage.aim}</p>
            <section className="rounded-xl bg-violet-500/5 p-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-[var(--fg)]"><BookOpen size={16} className="text-violet-600"/> 1. Understand — what is it and why?</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">{selected.what}</p>
            </section>
            <section className="rounded-xl border border-[var(--line)] p-4">
              <h3 className="text-sm font-black text-[var(--fg)]">2. Mechanism — input → processing → output</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">{selected.how}</p>
            </section>
            <section className="rounded-xl border border-[var(--line)] p-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-[var(--fg)]"><Code2 size={16} className="text-sky-600"/> 3. Worked EvidenceOps example</h3>
              <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-[var(--bg)] p-4 font-mono text-xs leading-6 text-[var(--fg)]">{selected.example}</pre>
            </section>
            <section className="rounded-xl bg-amber-500/5 p-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-[var(--fg)]"><ShieldAlert size={16} className="text-amber-600"/> 4. Common mistake</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">{selected.trap}</p>
            </section>
            <section className="rounded-xl bg-emerald-500/5 p-4">
              <h3 className="flex items-center gap-2 text-sm font-black text-[var(--fg)]"><Target size={16} className="text-emerald-600"/> 5. Your exercise — no AI-generated code</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">{selected.doIt}</p>
              {['python','data','lexical','semantic','backend','quality'].includes(stage.id)&&<Link href="/python-lab" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">Open ManuOS Python Lab <ArrowRight size={13}/></Link>}
            </section>
            <section className="rounded-xl border border-violet-500/20 p-4">
              <h3 className="text-sm font-black text-[var(--fg)]">Interview check — answer without notes</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">{selected.check}</p>
            </section>
            <section className="rounded-xl border border-[var(--line)] p-4">
              <h3 className="text-sm font-black text-[var(--fg)]">Stage completion check</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{stage.gate}</p>
              <p className="mt-3 text-[11px] font-bold text-[var(--muted)]">Read actual code only after the concepts:</p>
              <div className="mt-1 flex flex-wrap gap-1">{stage.files.map(file=><span key={file} className="rounded-md bg-sky-500/10 px-2 py-1 font-mono text-[10px] text-sky-700 dark:text-sky-300">{file}</span>)}</div>
              <a href={stage.resource.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-700 dark:text-violet-300">Optional source: {stage.resource.label} <ExternalLink size={12}/></a>
            </section>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
              <button disabled={selectedIndex===0} type="button" onClick={()=>select(topics[selectedIndex-1].legacySlug)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--fg)] disabled:opacity-40"><ArrowLeft size={14}/> Previous</button>
              <button disabled={status!=='ready'||saving.includes(selected.legacySlug)} type="button" onClick={()=>onToggle(selected.legacySlug)} className={'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-40 '+(done.has(selected.legacySlug)?'border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300':'bg-violet-600 text-white hover:bg-violet-700')}><CheckCircle2 size={14}/>{done.has(selected.legacySlug)?'Mark not done':'I can explain and practice this'}</button>
              <button disabled={selectedIndex===topics.length-1} type="button" onClick={()=>select(topics[selectedIndex+1].legacySlug)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--fg)] disabled:opacity-40">Next <ArrowRight size={14}/></button>
            </div>
          </article>
        </div>
        <aside className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-xs leading-6 text-[var(--muted)]">
          <strong className="text-[var(--fg)]">What is intentionally not required now:</strong> training LLMs, complex Transformer mathematics, LangGraph internals, HNSW/IVFFlat, cloud MLOps or a new database architecture. Remaining legacy topics stay stored for later. The separate dorsal-hand / Computer Vision learning path is untouched. Keep applying for internships while learning.
        </aside>
      </div>
    </Page>
  );
}
