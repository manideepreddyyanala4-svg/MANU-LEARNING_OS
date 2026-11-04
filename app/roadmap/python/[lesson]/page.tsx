'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpenText, BrainCircuit, Check,
  CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Code2,
  Copy, GraduationCap, Lightbulb, LoaderCircle, MessageCircleQuestion,
  Play, RotateCcw, ShieldCheck, Sparkles, Target, Trophy, XCircle
} from 'lucide-react';
import { Page } from '@/components/ui';
import { PythonLessonLab } from '@/components/python-lesson-lab';
import { createClient } from '@/lib/supabase';
import { internshipTopicKey } from '@/lib/internship-curriculum';
import { pythonRoadmapLessons, pythonRoadmapModule } from '@/lib/python-roadmap-lessons';

type LessonState = 'upcoming' | 'in_progress' | 'review' | 'completed';
const topicKey = (id: string) => internshipTopicKey('01', Number(id) - 1);
const palette = [
  { card: 'from-sky-500/10 to-cyan-500/5', icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-300' },
  { card: 'from-violet-500/10 to-fuchsia-500/5', icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-300' },
  { card: 'from-amber-500/10 to-orange-500/5', icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
  { card: 'from-emerald-500/10 to-teal-500/5', icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
];

export default function GuidedPythonLessonPage() {
  const { lesson } = useParams<{ lesson: string }>();
  const number = Number(lesson);
  const index = Number.isInteger(number) && number >= 1 && number <= pythonRoadmapLessons.length ? number - 1 : -1;
  const current = index < 0 ? undefined : pythonRoadmapLessons[index];
  const slug = current?.id || '01';
  const rowKey = topicKey(slug);
  const [userId, setUserId] = useState('');
  const [syncing, setSyncing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [statuses, setStatuses] = useState<Record<string, LessonState>>({});
  const [choice, setChoice] = useState<number | null>(null);
  const [codePassed, setCodePassed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

  useEffect(() => {
    setChoice(null);
    setRevisionOpen(false);
    setSyncError('');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!current) return;
    const passKey = 'manuos:python-practice-pass:v1:roadmap-' + current.id;
    const refresh = () => {
      try { setCodePassed(localStorage.getItem(passKey) === 'passed'); }
      catch { setCodePassed(false); }
    };
    refresh();
    window.addEventListener('manuos:python-test-passed', refresh);
    return () => window.removeEventListener('manuos:python-test-passed', refresh);
  }, [current]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setSyncing(true);
      setSyncError('');
      try {
        const client = createClient();
        if (!client) throw new Error('ManuOS account connection is not available.');
        const { data: auth, error: authError } = await client.auth.getUser();
        if (authError) throw authError;
        if (!auth.user) throw new Error('Sign in to ManuOS to load and save progress.');
        const uid = auth.user.id;
        if (!cancelled) setUserId(uid);

        // Direct lesson links also work before the parent roadmap has initialized rows.
        if (current && pythonRoadmapModule) {
          const { error } = await client.from('roadmap_items').upsert({
            user_id: uid, slug: topicKey(current.id),
            title: pythonRoadmapModule.topics[index], status: 'upcoming',
            order_index: 1000 + index, is_current: false,
          }, { onConflict: 'user_id,slug', ignoreDuplicates: true });
          if (error) throw error;
        }
        const { data, error } = await client.from('roadmap_items')
          .select('slug,status').eq('user_id', uid)
          .like('slug', 'internship-v1-m01-t%').limit(100);
        if (error) throw error;
        if (!cancelled) {
          const next: Record<string, LessonState> = {};
          for (const row of data || []) next[row.slug] = row.status as LessonState;
          setStatuses(next);
        }
      } catch (error) {
        if (!cancelled) setSyncError(error instanceof Error ? error.message : 'Unable to read your private progress.');
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }
    if (current) void load();
    return () => { cancelled = true; };
  }, [current, index]);

  async function markStatus(next: LessonState) {
    if (!current || !userId || syncing || saving) return;
    setSaving(true);
    setSyncError('');
    const previous = statuses[rowKey] ?? 'upcoming';
    setStatuses(state => ({ ...state, [rowKey]: next }));
    try {
      const client = createClient();
      if (!client) throw new Error('Cloud connection unavailable.');
      const { data, error } = await client.from('roadmap_items')
        .update({ status: next }).eq('user_id', userId)
        .eq('slug', rowKey).select('id');
      if (error) throw error;
      if (!data || data.length !== 1) throw new Error('The lesson status was not saved.');
    } catch (error) {
      setStatuses(state => ({ ...state, [rowKey]: previous }));
      setSyncError(error instanceof Error ? error.message : 'Could not save progress.');
    } finally { setSaving(false); }
  }

  const percent = useMemo(() => {
    const n = pythonRoadmapLessons.filter(l => statuses[topicKey(l.id)] === 'completed').length;
    return { done: n, percentage: Math.round((n / pythonRoadmapLessons.length) * 100) };
  }, [statuses]);
  const quizCorrect = current ? choice === current.quiz.correct : false;
  const learned = statuses[rowKey] === 'completed';
  const canComplete = codePassed && quizCorrect;
  const challenge = useMemo(() => current && ({
    prompt: current.task, starter: current.starter, checks: current.checks,
  }), [current]);

  async function copyExample() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.example);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1700);
    } catch { setSyncError('Clipboard permission blocked. Select and copy the code manually.'); }
  }

  if (!current || !pythonRoadmapModule) {
    return <Page eyebrow="Python Fundamentals" title="Lesson not found"
      subtitle="Choose a numbered Python lesson between 01 and 24.">
      <Link href="/roadmap" className="text-sm font-bold text-sky-600 underline">Return to learning roadmap</Link>
    </Page>;
  }

  const roadmapTitle = pythonRoadmapModule.topics[index];
  return (
    <Page eyebrow="ManuOS · Guided Python Academy"
      title="Python Fundamentals"
      subtitle="24 linked lessons · Understand → See → Practice → Prove → Revise. The goal is independent coding, not reading checkmarks.">
      <div className="space-y-5 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg)]">
            <Link href="/roadmap" className="inline-flex items-center gap-1.5 text-sky-600 hover:underline"><ArrowLeft size={14}/> Roadmap</Link>
            <ChevronRight size={12} className="text-[var(--muted)]" />
            <span>Python Fundamentals</span>
            <ChevronRight size={12} className="text-[var(--muted)]" />
            <span>Lesson {current.id}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-[var(--fg)]">
            <span className="text-[var(--muted)]">{percent.done}/24 learned</span>
            <div role="progressbar" aria-label="Python Fundamentals progress" aria-valuenow={percent.percentage} aria-valuemin={0} aria-valuemax={100}
              className="h-2 w-24 overflow-hidden rounded-full bg-[var(--line)] sm:w-36">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all" style={{ width: percent.percentage + '%' }} />
            </div>
            <span>{percent.percentage}%</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <main className="min-w-0 space-y-5">
            <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/20 via-violet-500/10 to-fuchsia-500/10 p-5 sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl"/>
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1.5 text-[11px] font-black text-sky-700 dark:text-sky-300">
                  <Sparkles size={13} /> LESSON {current.id} OF 24 · PYTHON
                </div>
                <h1 className="mt-4 text-2xl font-black leading-tight text-[var(--fg)] sm:text-3xl">{current.shortTitle}</h1>
                <p className="mt-2 text-xs font-semibold text-[var(--muted)]">{roadmapTitle}</p>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-[var(--fg)]">{current.essence}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5">
                    <span className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-300"><Lightbulb size={15}/> Think of it like this</span>
                    <p className="mt-2 text-xs leading-5 text-[var(--fg)]">{current.analogy}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
                    <span className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-300"><Target size={15}/> Why you need it</span>
                    <p className="mt-2 text-xs leading-5 text-[var(--fg)]">{current.why}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600"><BookOpenText size={17}/></span>
                <div><h2 className="text-lg font-black text-[var(--fg)]">01 · Understand the building blocks</h2>
                  <p className="text-xs text-[var(--muted)]">Simple words first. Read each small card.</p></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {current.concepts.map((concept,i) => <div key={concept.label} className={'rounded-2xl border border-[var(--line)] bg-gradient-to-br p-4 '+palette[i%palette.length].card}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={'grid h-7 w-7 place-items-center rounded-lg text-[11px] font-black '+palette[i%palette.length].icon}>{String(i+1).padStart(2,'0')}</span>
                    <h3 className="text-sm font-extrabold text-[var(--fg)]">{concept.label}</h3>
                  </div>
                  <p className="text-xs leading-5 text-[var(--fg)]">{concept.explain}</p>
                </div>)}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]"><BrainCircuit size={19} className="text-fuchsia-500"/> 02 · See how it works</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {current.flow.map((step,i)=><div key={i} className="relative flex min-h-20 flex-col justify-center rounded-xl border border-[var(--line)] bg-gradient-to-b from-sky-500/10 to-violet-500/5 px-3 py-3 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-300">STEP {i+1}</span>
                  <span className="mt-1 text-sm font-bold text-[var(--fg)]">{step}</span>
                </div>)}
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700/20 bg-slate-950 text-slate-100">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-xs">
                  <span className="inline-flex items-center gap-2 font-bold text-slate-300"><Code2 size={14} className="text-cyan-400"/> example.py</span>
                  <button type="button" onClick={()=>void copyExample()} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 font-bold text-white hover:bg-white/20">
                    {copied?<Check size={13}/>:<Copy size={13}/>} {copied?'Copied':'Copy'}
                  </button>
                </div>
                <div className="overflow-x-auto p-4">
                  <pre className="whitespace-pre font-mono text-[12px] leading-6 text-cyan-100 sm:text-[13px]"><code>{current.example}</code></pre>
                </div>
                <div className="border-t border-white/10 bg-emerald-500/10 px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Expected output</p>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-5 text-emerald-100">{current.output}</pre>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-black text-[var(--fg)]">What each step actually does</h3>
                {current.walkthrough.map((step,i)=><div key={i} className="flex gap-3 rounded-lg bg-[var(--bg)]/70 px-3 py-2.5">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-[10px] font-black text-sky-600">{i+1}</span>
                  <p className="text-xs leading-5 text-[var(--fg)]">{step}</p>
                </div>)}
              </div>
            </section>

            <section className="grid gap-3">
              <details className="group rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-4 sm:p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[var(--fg)]">
                  <span className="flex items-center gap-2"><BrainCircuit size={17} className="text-violet-500"/> 03 · Go deeper — why does it work?</span>
                  <span className="text-[11px] font-bold text-violet-600 group-open:hidden">Expand</span>
                </summary>
                <div className="mt-4 space-y-4">
                  {current.deeper.map((deep,i)=><div key={i}>
                    <h3 className="text-sm font-bold text-[var(--fg)]">{deep.question}</h3>
                    <p className="mt-1 text-xs leading-6 text-[var(--muted)]">{deep.answer}</p>
                  </div>)}
                </div>
              </details>
              <details className="group rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[var(--fg)]">
                  <span className="flex items-center gap-2"><AlertTriangle size={17} className="text-rose-500"/> Common mistakes and their fixes</span>
                  <span className="text-[11px] font-bold text-rose-600 group-open:hidden">Expand</span>
                </summary>
                <div className="mt-4 space-y-3">
                  {current.mistakes.map((mistake,i)=><div key={i} className="rounded-xl border border-rose-500/10 bg-[var(--surface)] p-3">
                    <p className="flex items-start gap-2 text-xs text-rose-600 dark:text-rose-300"><XCircle size={14} className="mt-0.5 shrink-0"/>{mistake.mistake}</p>
                    <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-[var(--fg)]"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500"/>{mistake.correction}</p>
                  </div>)}
                </div>
              </details>
            </section>

            <section className="overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-500/5 to-[var(--surface)] p-3 sm:p-5">
              <div className="mb-3 px-1">
                <h2 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]"><Play size={19} className="text-sky-600"/> 04 · Practice it yourself</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Type your own solution from the starter. Run code, inspect the console and press Check solution.
                  A passing test records code evidence on this browser; it does not automatically mark the cloud roadmap completed.
                </p>
              </div>
              {challenge && <PythonLessonLab key={current.id} lessonId={'roadmap-'+current.id} customChallenge={challenge}
                exampleCode={current.example} defaultOpen/>}
              <div className="mt-3 space-y-2">
                <details className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <summary className="cursor-pointer text-xs font-bold text-amber-700 dark:text-amber-300">Need a small hint? Open only after trying.</summary>
                  <p className="mt-2 text-xs leading-5 text-[var(--fg)]">{current.hint}</p>
                </details>
                <details className="rounded-xl border border-[var(--line)] bg-[var(--bg)]/70 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-[var(--muted)]">Reveal one reference solution (study it, then write it again without looking)</summary>
                  <pre className="mt-3 overflow-x-auto whitespace-pre rounded-lg bg-slate-950 p-3 font-mono text-xs leading-5 text-cyan-100">{current.solution}</pre>
                </details>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]"><MessageCircleQuestion size={19} className="text-amber-500"/> 05 · One-minute interview check</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--fg)]">{current.quiz.question}</p>
              <div className="mt-3 space-y-2">
                {current.quiz.choices.map((option,i)=><button type="button" key={i} onClick={()=>setChoice(i)}
                  aria-pressed={choice===i}
                  className={'flex w-full items-start gap-3 rounded-xl border p-3 text-left text-xs leading-5 transition sm:text-sm '+
                    (choice===i?(quizCorrect?'border-emerald-500 bg-emerald-500/10':'border-rose-500 bg-rose-500/10'):'border-[var(--line)] bg-[var(--bg)]/60 hover:border-sky-400')}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[11px] font-black">{String.fromCharCode(65+i)}</span>
                  <span className="flex-1 text-[var(--fg)]">{option}</span>
                  {choice===i && (quizCorrect?<CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500"/>:<XCircle size={16} className="mt-0.5 shrink-0 text-rose-500"/>)}
                </button>)}
              </div>
              {choice!==null && <div role="status" className={'mt-3 rounded-xl p-3 text-xs leading-5 '+
                (quizCorrect?'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':'bg-amber-500/10 text-amber-700 dark:text-amber-300')}>
                <strong>{quizCorrect?'Correct! ':'Not yet. Think again. '}</strong>
                {quizCorrect?current.quiz.explain:'Use the example and concept cards, then choose again.'}
              </div>}
            </section>

            <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]"><RotateCcw size={18} className="text-emerald-600"/> 06 · Quick revision</h2>
                <button type="button" onClick={()=>setRevisionOpen(v=>!v)}
                  className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {revisionOpen?'Hide memory card':'Show 30-second memory card'}
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">First try to recall three rules without looking. Revisit tomorrow, then after 3 and 7 days.</p>
              {revisionOpen && <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {current.recap.map((item,i)=><div key={i} className="rounded-xl border border-emerald-500/20 bg-[var(--surface)] p-3 text-xs font-bold leading-5 text-[var(--fg)]">
                  <span className="mb-2 block text-[10px] font-black text-emerald-600">REMEMBER {i+1}</span>{item}
                </div>)}
              </div>}
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <a href={current.docs} rel="noreferrer" target="_blank"
                  className="font-bold text-sky-700 underline dark:text-sky-300">Official reference ↗</a>
                <Link href="/learning/python-a0e156aa" className="font-bold text-violet-700 underline dark:text-violet-300">My existing Python notes</Link>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]"><Trophy size={19} className="text-amber-500"/> Lesson completion gate</h2>
                <span className={'rounded-full px-3 py-1 text-[11px] font-black '+(learned?'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300':'bg-slate-500/10 text-[var(--muted)]')}>
                  {learned?'✓ Learned':'Not yet verified'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                This is a self-reported mastery check—not an external certificate.
                Only mark learned when the code checks pass, your interview answer is correct, and you can explain it without reading.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className={'flex items-center gap-2 rounded-xl border p-3 text-xs font-bold '+(codePassed?'border-emerald-500/20 bg-emerald-500/5 text-emerald-600':'border-[var(--line)] text-[var(--muted)]')}>
                  {codePassed?<CheckCircle2 size={16}/>:<CircleHelp size={16}/>} Independent code tests {codePassed?'passed':'pending'}
                </div>
                <div className={'flex items-center gap-2 rounded-xl border p-3 text-xs font-bold '+(quizCorrect?'border-emerald-500/20 bg-emerald-500/5 text-emerald-600':'border-[var(--line)] text-[var(--muted)]')}>
                  {quizCorrect?<CheckCircle2 size={16}/>:<CircleHelp size={16}/>} Interview recall {quizCorrect?'passed':'pending'}
                </div>
              </div>
              {syncError && <div role="alert" className="mt-3 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-bold text-rose-600"><AlertTriangle size={15}/>{syncError}</div>}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={!userId||syncing||saving||(!learned&&!canComplete)}
                  onClick={()=>void markStatus(learned?'review':'completed')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {saving?<LoaderCircle size={15} className="animate-spin"/>:<ShieldCheck size={15}/>}
                  {learned?'Reopen for review':'Mark lesson learned'}
                </button>
                {!learned && <button type="button" disabled={!userId||syncing||saving}
                  onClick={()=>void markStatus('review')}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-700 disabled:opacity-40 dark:text-amber-300">
                  Need more practice
                </button>}
                <Link href="/roadmap" className="inline-flex items-center rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-bold text-[var(--fg)]">
                  Return to roadmap
                </Link>
              </div>
              <p className="mt-3 text-[11px] text-[var(--muted)]">{syncing?'Loading saved progress…':userId?'Lesson progress saved privately in your ManuOS account.':'Sign in to sync progress.'}</p>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {index>0 ? <Link href={('/roadmap/python/'+index) as Route} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--fg)]">
                <ChevronLeft size={16}/> Previous lesson</Link>:<span/>}
              {index<pythonRoadmapLessons.length-1 ? <Link href={('/roadmap/python/'+(index+2)) as Route} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white">
                Next lesson <ChevronRight size={16}/></Link>:<Link href="/roadmap" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white">Back to roadmap</Link>}
            </div>
          </main>

          <aside className="min-w-0 self-start rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 lg:sticky lg:top-20">
            <div className="flex items-center justify-between gap-2 px-2 pt-2">
              <h2 className="text-sm font-black text-[var(--fg)]">24-step Python course</h2>
              <GraduationCap size={18} className="text-sky-600"/>
            </div>
            <p className="px-2 pb-3 pt-1 text-[11px] text-[var(--muted)]">Choose any topic. Your existing notes stay intact.</p>
            <nav aria-label="Python Fundamentals lessons" className="max-h-[66vh] space-y-1 overflow-y-auto pr-1">
              {pythonRoadmapLessons.map((item,i)=>{
                const done = statuses[topicKey(item.id)]==='completed';
                const isActive = item.id===current.id;
                return <Link key={item.id} href={('/roadmap/python/'+(i+1)) as Route} aria-current={isActive?'page':undefined}
                  className={'flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition '+(isActive?'bg-gradient-to-r from-sky-600 to-violet-600 text-white shadow-sm':'text-[var(--fg)] hover:bg-sky-500/10')}>
                  <span className={'grid h-6 w-6 shrink-0 place-items-center rounded-lg font-black '+(isActive?'bg-white/20 text-white':done?'bg-emerald-500/15 text-emerald-600':'bg-[var(--bg)] text-[var(--muted)]')}>
                    {done?<Check size={13}/>:item.id}
                  </span>
                  <span className="flex-1 leading-4">{item.shortTitle}</span>
                  {isActive && <ChevronRight size={14}/>}
                </Link>;
              })}
            </nav>
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] leading-5 text-[var(--fg)]">
              <strong>Study rule:</strong> 10-minute explanation, run code, independently solve task, self-test, then tick.
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}
