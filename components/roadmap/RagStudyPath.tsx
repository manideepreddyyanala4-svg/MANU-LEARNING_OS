'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown,
  ClipboardCopy, Code2, FileCode2, GraduationCap, Layers3,
  Lightbulb, Search, Target,
} from 'lucide-react';
import { Page } from '@/components/ui';
import type { LearningTrack } from '@/lib/career-learning-tracks';
import { buildRagStudyStages } from '@/lib/rag-study-sequence';

type ProgressStatus = 'loading' | 'ready' | 'error';
type Props = {
  track: LearningTrack;
  completed: string[];
  saving: string[];
  status: ProgressStatus;
  message: string;
  onToggle: (slug: string) => void;
};

export default function RagStudyPath({
  track, completed, saving, status, message, onToggle,
}: Props) {
  const stages = useMemo(() => buildRagStudyStages(track), [track]);
  const [openStage, setOpenStage] = useState(stages[0].id);
  const [showAll, setShowAll] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const all = stages.flatMap(stage => stage.topics);
  const completedSet = new Set(completed);
  const next = all.find(topic => !completedSet.has(topic.slug));
  const nextStage = next ? stages.find(stage => stage.topics.some(topic => topic.slug === next.slug)) : undefined;
  const percentage = all.length ? Math.round(100 * all.filter(t => completedSet.has(t.slug)).length / all.length) : 0;
  const query = search.trim().toLowerCase();

  function continueLearning() {
    if (!nextStage) return;
    setOpenStage(nextStage.id);
    setShowAll(previous => previous.includes(nextStage.id) ? previous : [...previous, nextStage.id]);
    document.getElementById('rag-stage-' + nextStage.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function copySequence() {
    const lines = stages.flatMap(stage => [
      stage.title,
      stage.meaning,
      ...stage.topics.map(topic => String(topic.studyNumber) + '. ' + topic.title),
      '',
    ]);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Page
      eyebrow="Beginner-first · Interview preparation"
      title="Learn LLM → RAG → MCP, one step at a time"
      subtitle="Start with simple meaning and small Python exercises. Open project files only after you understand the idea. Your existing checkmarks are preserved."
      actions={<Link href="/roadmap" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)]"><ArrowLeft size={15}/> All roadmaps</Link>}
    >
      <div className="space-y-7">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 p-6 text-white shadow-lg md:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-100"><GraduationCap size={17}/> Your guided study sequence</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight md:text-3xl">Understand the idea. Try a tiny example. Then read the real code.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">
            Do not open 15 project files at once. Follow one topic, write one small example, and explain it in your own words before ticking it off.
            Advanced infrastructure comes later; you can apply for internships while studying.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-xl">
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{stages.length}</p><p className="text-[10px] text-white/80">Ordered stages</p></div>
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{all.length}</p><p className="text-[10px] text-white/80">Topics retained</p></div>
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{completed.filter(slug => all.some(topic => topic.slug === slug)).length}</p><p className="text-[10px] text-white/80">Already checked</p></div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{width: percentage + '%'}}/></div>
          <p className="mt-2 text-xs text-white/85">{status === 'ready' ? percentage + '% completed · saved in your existing ManuOS account' : status === 'loading' ? 'Loading your saved checkmarks…' : 'Read-only mode · your saved progress could not be loaded'}</p>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><div className="flex items-center gap-2 font-bold text-[var(--fg)]"><Lightbulb size={17} className="text-amber-500"/> 1. Understand</div><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Read the meaning in simple words. Answer “Why do we need this?”</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><div className="flex items-center gap-2 font-bold text-[var(--fg)]"><Code2 size={17} className="text-emerald-500"/> 2. Try</div><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Run or write a tiny example yourself, before reading the project.</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><div className="flex items-center gap-2 font-bold text-[var(--fg)]"><Target size={17} className="text-violet-500"/> 3. Explain</div><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Describe inputs, outputs and one mistake it could make. Then mark complete.</p></div>
        </section>

        <section className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex items-center gap-2"><BookOpen size={17} className="text-violet-600 dark:text-violet-300"/><h2 className="font-black text-[var(--fg)]">Your next topic — study just this one</h2></div>
          {next && nextStage ? (
            <>
              <p className="mt-3 text-sm font-extrabold text-[var(--fg)]">{next.studyNumber}. {next.title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Stage: {nextStage.title}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--fg)]">{nextStage.meaning}</p>
              <button type="button" onClick={continueLearning} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-700">Open this lesson <ArrowRight size={15}/></button>
            </>
          ) : <p className="mt-3 text-sm text-[var(--fg)]">All topics checked. Explain the complete project in your own words and revisit any weak section.</p>}
        </section>

        {message && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">{message}</p>}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-black text-[var(--fg)]">Your learning path</h2><p className="mt-1 text-xs text-[var(--muted)]">Concept order, not filename order. Nothing from the original topic list was deleted.</p></div>
            <button type="button" onClick={() => void copySequence()} className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)]"><ClipboardCopy size={14}/>{copied ? 'Copied' : 'Copy study sequence'}</button>
          </div>
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/><input aria-label="Search study topics" placeholder="Find any concept or topic…" value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 pl-10 pr-3 text-sm text-[var(--fg)] outline-none focus:border-violet-500"/></div>

          {stages.map((stage, index) => {
            const matched = stage.topics.filter(topic => !query || (topic.title + ' ' + stage.title + ' ' + stage.meaning).toLowerCase().includes(query));
            if (query && matched.length === 0) return null;
            const done = stage.topics.filter(topic => completedSet.has(topic.slug)).length;
            const expanded = query.length > 0 || openStage === stage.id;
            const allVisible = query.length > 0 || showAll.includes(stage.id);
            const topics = allVisible ? matched : matched.slice(0, 6);
            const levelColors = stage.level === 'START' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : stage.level === 'LATER' ? 'bg-slate-500/10 text-[var(--muted)]' : stage.level === 'BUILD' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300' : 'bg-violet-500/10 text-violet-600 dark:text-violet-300';
            return (
              <article id={'rag-stage-' + stage.id} key={stage.id} className="scroll-mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
                <button type="button" onClick={() => setOpenStage(expanded ? '' : stage.id)} aria-expanded={expanded} className="flex w-full items-start justify-between gap-3 p-4 text-left md:p-5">
                  <span className="flex min-w-0 gap-3">
                    <span className={'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ' + levelColors}>{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <span className="block font-extrabold text-[var(--fg)]">{stage.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{stage.meaning}</span>
                      <span className={'mt-2 inline-flex rounded-md px-2 py-1 text-[10px] font-bold ' + levelColors}>{stage.level === 'LATER' ? 'ADVANCED · OPTIONAL FOR NOW' : stage.level === 'START' ? 'START HERE' : stage.level === 'CORE' ? 'FOUNDATION' : 'BUILD THE PROJECT'}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2"><span className="hidden text-right text-xs font-bold text-[var(--muted)] sm:block">{done}/{stage.topics.length}<br/>completed</span><ChevronDown size={18} className={'mt-2 text-[var(--muted)] transition ' + (expanded ? 'rotate-180' : '')}/></span>
                </button>

                {expanded && <div className="space-y-4 border-t border-[var(--line)] px-4 pb-5 pt-4 md:px-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-violet-500/5 p-4">
                      <h3 className="flex items-center gap-2 text-xs font-black text-[var(--fg)]"><Lightbulb size={15} className="text-violet-600"/> Why you learn this now</h3>
                      <p className="mt-2 text-xs leading-6 text-[var(--fg)]">{stage.whyNow}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/5 p-4">
                      <h3 className="flex items-center gap-2 text-xs font-black text-[var(--fg)]"><Target size={15} className="text-emerald-600"/> Your small practice</h3>
                      <p className="mt-2 text-xs leading-6 text-[var(--fg)]">{stage.practice}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                    <h3 className="text-xs font-black text-[var(--fg)]">Tiny example — understand this before continuing</h3>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[var(--fg)]">{stage.example}</pre>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold text-[var(--muted)]">Study in this exact order · mark only what you can explain</p>
                    <div className="grid gap-2 lg:grid-cols-2">
                      {topics.map(topic => {
                        const checked = completedSet.has(topic.slug);
                        return <label key={topic.slug} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]/60 p-3">
                          <input type="checkbox" checked={checked} disabled={status !== 'ready' || saving.includes(topic.slug)} onChange={() => onToggle(topic.slug)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"/>
                          <span className="min-w-0"><span className="mr-2 font-mono text-xs font-bold text-violet-600 dark:text-violet-300">{String(topic.studyNumber).padStart(3, '0')}</span><span className={'text-xs leading-5 ' + (checked ? 'text-[var(--muted)] line-through' : 'text-[var(--fg)]')}>{topic.title}</span>{checked && <CheckCircle2 size={13} className="ml-1 inline text-emerald-500"/>}</span>
                        </label>;
                      })}
                    </div>
                    {!allVisible && stage.topics.length > 6 && <button type="button" onClick={() => setShowAll(items => [...items, stage.id])} className="mt-3 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--fg)]">Show remaining {stage.topics.length - 6} topics <ChevronDown size={13} className="ml-1 inline"/></button>}
                    {allVisible && !query && stage.topics.length > 6 && <button type="button" onClick={() => setShowAll(items => items.filter(id => id !== stage.id))} className="mt-3 text-xs font-bold text-violet-600">Show fewer topics</button>}
                  </div>
                  <div className="rounded-xl bg-sky-500/5 p-4">
                    <h3 className="flex items-center gap-2 text-xs font-black text-[var(--fg)]"><CheckCircle2 size={15} className="text-sky-600"/> Ready for next stage when…</h3>
                    <p className="mt-2 text-xs leading-6 text-[var(--fg)]">{stage.readyWhen}</p>
                    <div className="mt-3 flex flex-wrap items-start gap-1"><span className="mr-1 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--muted)]"><FileCode2 size={12}/> After the concept, inspect:</span>{stage.projectFiles.map(file => <span key={file} className="rounded-md bg-sky-500/10 px-2 py-1 font-mono text-[10px] text-sky-700 dark:text-sky-300">{file}</span>)}</div>
                  </div>
                </div>}
              </article>
            );
          })}
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="flex items-center gap-2 font-black text-[var(--fg)]"><Layers3 size={18} className="text-violet-600"/> Trusted references (optional, not homework for Day 1)</h2>
          <p className="mt-2 text-xs leading-6 text-[var(--muted)]">Official documentation is for checking concepts after you understand the simple example. The Hugging Face LLM course assumes good Python knowledge, so do not start with its advanced lessons.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {track.references.map(reference => <a key={reference.url} href={reference.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-3 text-xs font-bold text-[var(--fg)] hover:border-violet-500">{reference.name}<ArrowRight size={13}/></a>)}
          </div>
        </section>
        <p className="text-xs leading-5 text-[var(--muted)]">All 262 original topics remain and retain their original saved IDs. Display order is new; completion is self-reported. The Computer Vision roadmap, Python learning pages and research tasks are unchanged.</p>
      </div>
    </Page>
  );
}
