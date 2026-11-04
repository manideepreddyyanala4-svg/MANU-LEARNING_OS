'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown,
  Circle, Cloud, Code2, GraduationCap, ListChecks, LoaderCircle,
  Search, ShieldCheck, Sparkles, Target, Trophy, Zap
} from 'lucide-react';
import { Page, Card } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import {
  internshipCurriculum, internshipTopicCount, internshipTopicKey,
  internshipGateKey, type InternshipModule, type InternshipPriority
} from '@/lib/internship-curriculum';
import { loadRoadmap, type RoadmapItem } from '@/lib/store';

type TopicStatus = 'upcoming' | 'in_progress' | 'review' | 'completed';
type PriorityFilter = 'all' | 'P0' | 'P1' | 'P2';

const modules = internshipCurriculum;
const topicRows = modules.flatMap(m => m.topics.map((title, index) => ({
  key: internshipTopicKey(m.id, index), title, module: m
})));
const examItems = [
  'Python: write Two Sum with dictionary, including duplicates and no solution',
  'Python: count frequencies and find top two, explaining complexity',
  'Python: parse CSV/JSON, reject malformed rows and test errors',
  'NumPy: HWC (128,128,3) to CHW to NCHW (1,3,128,128)',
  'NumPy: normalized cosine similarity, including zero-vector safety',
  'Pandas: clean duplicates/missing values and export quality report',
  'OpenCV: grayscale, Gaussian blur, Otsu threshold and closing',
  'OpenCV: rotate/perspective warp, explain interpolation and coordinates',
  'CNN: calculate layer output shapes and explain batch normalization',
  'PyTorch: ten-sample Dataset/DataLoader, batches 4/4/2',
  'PyTorch: train/eval with zero_grad, backward, step and no_grad',
  'ML evaluation: compute precision, recall, F1 and explain leakage',
  'CV evaluation: IoU, mAP versus accuracy, detection false positives',
  'Biometrics: distinguish EER, TAR@FMR and 1:N TPIR@FPIR',
  'Research: explain Tokyo ROI work for 90 seconds and your contribution',
  'Research: explain current LAWNet without mixing historical results',
  'Project truth: completed research versus future unbuilt RAG system',
  'Engineering: git diff/commit, pytest, reproducible setup',
  'Job fit: explain availability, permit limit and why the specific role',
  'Mock interview: answer five follow-up questions without assistance'
];
const examKey = (index: number) => 'internship-v1-exam-' + String(index + 1).padStart(2, '0');
const records = [
  ...topicRows.map((r, i) => ({ slug: r.key, title: r.title, order_index: 1000 + i })),
  ...modules.map((m, i) => ({ slug: internshipGateKey(m.id), title: 'Proof gate: ' + m.title, order_index: 2000 + i })),
  ...examItems.map((title, i) => ({ slug: examKey(i), title: 'Interview test: ' + title, order_index: 2100 + i }))
];
const colors: Record<InternshipPriority, { dot: string; chip: string; bar: string; soft: string }> = {
  P0: { dot: 'bg-rose-500', chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-300', bar: 'bg-gradient-to-r from-rose-500 to-orange-400', soft: 'from-rose-500/10 to-orange-500/5' },
  P1: { dot: 'bg-sky-500', chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-300', bar: 'bg-gradient-to-r from-sky-500 to-cyan-400', soft: 'from-sky-500/10 to-cyan-500/5' },
  P2: { dot: 'bg-violet-500', chip: 'bg-violet-500/10 text-violet-600 dark:text-violet-300', bar: 'bg-gradient-to-r from-violet-500 to-fuchsia-400', soft: 'from-violet-500/10 to-fuchsia-500/5' },
};
const pLabel: Record<InternshipPriority, string> = { P0: 'Interview essentials', P1: 'Learn next', P2: 'Specialize later' };
const demand = [
  { title: 'Python', count: '8/15' }, { title: 'Computer Vision', count: '5/15' },
  { title: 'Deep Learning', count: '5/15' }, { title: 'PyTorch', count: '5/15' },
  { title: 'Git / GitHub', count: '5/15' }, { title: 'Machine Learning', count: '4/15' },
];

function Meter({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}
      className="h-2 w-full overflow-hidden rounded-full bg-slate-500/10 dark:bg-white/10">
      <div className={'h-full rounded-full transition-all duration-500 ' + color}
        style={{ width: Math.max(0, Math.min(value, 100)) + '%' }} />
    </div>
  );
}

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

export default function RoadmapPage() {
  const [status, setStatus] = useState<Record<string, TopicStatus>>({});
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [pending, setPending] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState('');
  const [legacy, setLegacy] = useState<RoadmapItem[]>([]);
  const [filter, setFilter] = useState<PriorityFilter>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>(['01']);
  const [examOpen, setExamOpen] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const client = createClient();
        if (!client) throw new Error('ManuOS Supabase connection is not configured.');
        const { data: auth, error: authError } = await client.auth.getUser();
        if (authError) throw authError;
        const user = auth.user;
        if (!user) throw new Error('Sign in to ManuOS to save learning progress.');
        if (!cancelled) setOwnerId(user.id);

        // The old milestone roadmap is preserved and remains separate.
        loadRoadmap().then(data => { if (!cancelled) setLegacy(data); }).catch(() => {});

        const { data: existing, error: fetchError } = await client
          .from('roadmap_items').select('slug,status')
          .like('slug', 'internship-v1-%').limit(1000);
        if (fetchError) throw fetchError;
        const found = new Set((existing || []).map(row => row.slug));
        const missing = records.filter(row => !found.has(row.slug));
        // Insert missing records only. Never overwrite recorded completion statuses.
        for (let start = 0; start < missing.length; start += 100) {
          const batch = missing.slice(start, start + 100).map(row => ({
            user_id: user.id, title: row.title, slug: row.slug,
            order_index: row.order_index, status: 'upcoming', is_current: false
          }));
          const { error } = await client.from('roadmap_items').upsert(
            batch, { onConflict: 'user_id,slug', ignoreDuplicates: true }
          );
          if (error) throw error;
        }
        const { data: updated, error: reloadError } = await client
          .from('roadmap_items').select('slug,status')
          .like('slug', 'internship-v1-%').limit(1000);
        if (reloadError) throw reloadError;
        if (!updated || updated.length !== records.length) {
          throw new Error('Learning progress could not be fully initialized. Please reload.');
        }
        if (!cancelled) {
          const next: Record<string, TopicStatus> = {};
          for (const row of updated) next[row.slug] = row.status as TopicStatus;
          setStatus(next);
          setReady(true);
          setSyncError('');
        }
      } catch (error) {
        if (!cancelled) setSyncError(error instanceof Error ? error.message : 'Unable to synchronize the roadmap.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void initialize();
    return () => { cancelled = true; };
  }, []);

  async function change(key: string, next: TopicStatus) {
    if (!ready || !ownerId || pending.includes(key)) return;
    const before = status[key] || 'upcoming';
    setStatus(current => ({ ...current, [key]: next }));
    setPending(current => [...current, key]);
    setSyncError('');
    try {
      const client = createClient();
      if (!client) throw new Error('Cloud connection unavailable.');
      const { data, error } = await client.from('roadmap_items')
        .update({ status: next }).eq('user_id', ownerId).eq('slug', key)
        .select('slug');
      if (error) throw error;
      if (!data || data.length !== 1) throw new Error('Progress could not be saved to your account.');
    } catch (error) {
      setStatus(current => ({ ...current, [key]: before }));
      setSyncError(error instanceof Error ? error.message : 'Progress save failed.');
    } finally {
      setPending(current => current.filter(item => item !== key));
    }
  }

  const completed = (key: string) => status[key] === 'completed';
  const totalDone = topicRows.filter(row => completed(row.key)).length;
  const overallProgress = pct(totalDone, internshipTopicCount);
  const examDone = examItems.filter((_, i) => completed(examKey(i))).length;
  const gatesPassed = modules.filter(m => completed(internshipGateKey(m.id))
    && m.topics.every((_, i) => completed(internshipTopicKey(m.id, i)))).length;
  const stats = (['P0', 'P1', 'P2'] as const).map(priority => {
    const rows = topicRows.filter(row => row.module.priority === priority);
    return { priority, total: rows.length, done: rows.filter(row => completed(row.key)).length };
  });
  const nextFocus = topicRows.find(row => row.module.priority === 'P0' && !completed(row.key));
  const visible = useMemo(() => modules.map(m => {
    const terms = search.trim().toLowerCase();
    const matchingModule = !terms || (m.title + ' ' + m.group + ' ' + m.prerequisites).toLowerCase().includes(terms);
    const found = matchingModule ? m.topics.map((title, i) => ({ title, i }))
      : m.topics.map((title, i) => ({ title, i })).filter(x => x.title.toLowerCase().includes(terms));
    return { m, found };
  }).filter(({ m, found }) => (filter === 'all' || m.priority === filter) && found.length > 0), [filter, search]);

  function toggleModule(id: string) {
    setExpanded(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }

  return (
    <Page eyebrow="Career Learning System"
      title="Your path to a paid technical internship"
      subtitle="574 specific skills and actions from 31 employer-audited modules. Apply and interview while learning; tick a topic only after an independent demonstration.">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-fuchsia-500/10 p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_230px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300">
                <Sparkles size={13} /> NOVEMBER 2026 • EVIDENCE-FIRST ROADMAP
              </div>
              <h2 className="text-2xl font-black leading-tight text-[var(--fg)] sm:text-3xl">
                Build interview skills. <span className="text-sky-600 dark:text-sky-300">Keep applying.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Your existing dorsal-hand / LAWNet research is Project 1. Agent Reliability Lab is a separate future RAG project.
                No removed portfolio project is treated as active. Your old milestones remain accessible below.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/python-lab" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-sky-700">
                  <Code2 size={16} /> Open Python coding lab <ArrowRight size={14} />
                </Link>
                <Link href="/learning" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--fg)] hover:border-sky-400">
                  <BookOpen size={15} /> Open learning notes
                </Link>
                <Link href="/job-preparation" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--fg)]">
                  <Target size={15} /> Application tracker
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/90 p-5 shadow-sm">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--muted)]">Learning progress</div>
              <div className="mt-1 text-4xl font-black text-[var(--fg)]">{overallProgress}%</div>
              <p className="mb-4 text-xs text-[var(--muted)]">{totalDone} of {internshipTopicCount} topics completed</p>
              <Meter value={overallProgress} color="bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" label="Overall technical learning" />
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
                {loading ? <LoaderCircle size={14} className="animate-spin" /> : ready ? <Cloud size={14} className="text-emerald-500" /> : <AlertCircle size={14} />}
                {loading ? 'Connecting to your progress…' : ready ? 'Private cloud progress ready' : 'Cloud progress unavailable'}
              </div>
            </div>
          </div>
        </section>

        {syncError && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={18} /><span className="flex-1">{syncError}</span>
          <button onClick={() => window.location.reload()} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-bold">Retry</button>
        </div>}

        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map(({ priority, total, done }) => <div key={priority}
            className={'rounded-2xl border border-[var(--line)] bg-gradient-to-br p-4 ' + colors[priority].soft}>
            <div className="flex items-center justify-between gap-2">
              <span className={'rounded-full px-2.5 py-1 text-[10px] font-black ' + colors[priority].chip}>{priority}</span>
              <span className="text-xs font-bold text-[var(--muted)]">{done}/{total}</span>
            </div>
            <h3 className="mb-3 mt-2 text-base font-extrabold text-[var(--fg)]">{pLabel[priority]}</h3>
            <Meter label={pLabel[priority] + ' progress'} value={pct(done,total)} color={colors[priority].bar} />
            <p className="mt-2 text-xs text-[var(--muted)]">{pct(done,total)}% • {priority==='P0'?'Practice these while interviewing':priority==='P1'?'Start after core practical passes':'Only for specific target jobs'}</p>
          </div>)}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-sky-500/25 bg-sky-500/5">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300"><Zap size={18} />
              <span className="text-[11px] font-black uppercase tracking-wider">Your next focused action</span></div>
            <h3 className="mt-2 text-base font-extrabold text-[var(--fg)]">
              {nextFocus ? nextFocus.title : 'All P0 items have been checked'}
            </h3>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {nextFocus ? nextFocus.module.title + ' • Complete an independent practice task before ticking.' :
                'Now test interview readiness using the practical exam below; a checked topic alone is not certification.'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {nextFocus && <button disabled={!ready || pending.includes(nextFocus.key)}
                onClick={() => void change(nextFocus.key, completed(nextFocus.key) ? 'upcoming' : 'completed')}
                className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                <Check size={13} className="mr-1 inline" /> I independently passed this
              </button>}
              <Link href="/python-lab" className="text-xs font-bold text-sky-700 underline dark:text-sky-300">Practice in Python Lab</Link>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2"><Trophy size={17} className="text-amber-500" />
              <h3 className="font-extrabold text-[var(--fg)]">Evidence checkpoints</h3></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><p className="text-2xl font-black text-[var(--fg)]">{gatesPassed}/31</p><p className="text-xs text-[var(--muted)]">Module proof gates</p></div>
              <div><p className="text-2xl font-black text-[var(--fg)]">{examDone}/20</p><p className="text-xs text-[var(--muted)]">Mock interview tests</p></div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
              A checked topic is self-reported learning. Pass its module exercise and a mock interview to demonstrate readiness.
            </p>
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-base font-black text-[var(--fg)]">
                <GraduationCap size={19} className="text-sky-500" /> Skills from real employer requirements
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Audited mentions among 15 sufficiently detailed job descriptions, not all 69 opportunities or the whole Taiwan market.
              </p>
            </div>
            <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold text-violet-600">15 detailed / 69 recovered</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {demand.map(d => <span key={d.title} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--fg)]">
              {d.title} <span className="ml-1 font-black text-sky-600 dark:text-sky-300">{d.count}</span>
            </span>)}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Python and project defense first; LLM/RAG after basic Python and API skills. Continue job applications throughout.
          </p>
        </Card>

        <section className="space-y-4" aria-label="Complete learning roadmap">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-black text-[var(--fg)]">All 31 learning modules</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">574 specific topics with private cloud checkboxes, review status and a practical proof gate.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setExpanded(modules.map(m => m.id))}
                className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--fg)]">Expand all</button>
              <button onClick={() => setExpanded([])}
                className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--fg)]">Collapse all</button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <span className="sr-only">Search modules and topics</span>
                <input value={search} onChange={e => { setSearch(e.target.value); if(e.target.value.trim()) setExpanded(modules.map(m=>m.id)); }}
                  placeholder="Search Python, ROI, RAG, Tensor, SQL…" className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--fg)] outline-none focus:border-sky-500" />
              </label>
              <div className="flex flex-wrap gap-1.5" aria-label="Filter by priority">
                {(['all','P0','P1','P2'] as const).map(f => <button key={f} type="button" onClick={() => setFilter(f)}
                  aria-pressed={filter===f}
                  className={'rounded-lg px-3 py-2 text-xs font-black transition ' + (filter===f?'bg-sky-600 text-white':'bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)]')}>
                  {f==='all'?'All priorities':f}</button>)}
              </div>
            </div>
          </div>

          {visible.length === 0 && <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">No topics match these filters.</div>}
          {visible.map(({ m, found }) => {
            const done = m.topics.filter((_, i) => completed(internshipTopicKey(m.id,i))).length;
            const allDone = done === m.topics.length;
            const passed = allDone && completed(internshipGateKey(m.id));
            const open = expanded.includes(m.id);
            const c = colors[m.priority];
            return <div key={m.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
              <button type="button" onClick={() => toggleModule(m.id)} aria-expanded={open}
                className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-[var(--bg)]/50 sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-black ' + (m.priority==='P0'?'from-rose-500/20 to-orange-500/15 text-rose-500':m.priority==='P1'?'from-sky-500/20 to-cyan-500/15 text-sky-500':'from-violet-500/20 to-fuchsia-500/15 text-violet-500')}>{m.id}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={'rounded-full px-2 py-0.5 text-[10px] font-bold ' + c.chip}>{m.priority}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{m.group}</span>
                      {passed && <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600"><ShieldCheck size={12} /> Gate passed</span>}
                    </div>
                    <h3 className="mt-1 text-sm font-extrabold leading-5 text-[var(--fg)] sm:text-base">{m.title}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">{m.topics.length} items • Prerequisites: {m.prerequisites}</p>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center gap-3 sm:w-44">
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-xs font-bold text-[var(--fg)]">
                      <span>{done}/{m.topics.length}</span><span>{pct(done,m.topics.length)}%</span>
                    </div>
                    <Meter value={pct(done,m.topics.length)} color={c.bar} label={m.title + ' progress'} />
                  </div>
                  <ChevronDown size={18} className={'shrink-0 text-[var(--muted)] transition-transform ' + (open?'rotate-180':'')} />
                </div>
              </button>
              {open && <div className="border-t border-[var(--line-subtle)] px-3 pb-4 pt-3 sm:px-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span>Check = independently demonstrated • Review = revisit later</span>
                  <span>{found.length === m.topics.length?'All topics':'Filtered: '+found.length+' matching'}</span>
                </div>
                <div className="space-y-1.5">
                  {found.map(({ title, i }) => {
                    const key = internshipTopicKey(m.id, i);
                    const isDone = completed(key);
                    const review = status[key] === 'review';
                    const busy = pending.includes(key);
                    return <div key={key} className={'group flex items-start gap-3 rounded-xl border p-2.5 transition sm:p-3 ' + (isDone?'border-emerald-500/20 bg-emerald-500/5':review?'border-amber-500/20 bg-amber-500/5':'border-transparent bg-[var(--bg)]/60 hover:border-[var(--line)]')}>
                      <button type="button" disabled={!ready || busy}
                        onClick={() => void change(key, isDone?'upcoming':'completed')}
                        aria-label={(isDone?'Mark not yet passed: ':'Mark independently learned: ')+title}
                        aria-pressed={isDone}
                        className={'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition disabled:cursor-not-allowed disabled:opacity-50 ' + (isDone?'border-emerald-500 bg-emerald-500 text-white':'border-[var(--line)] text-[var(--muted)] hover:border-sky-400')}>
                        {busy?<LoaderCircle size={13} className="animate-spin" />:isDone?<Check size={14} strokeWidth={3}/>:null}
                      </button>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className={'text-xs leading-5 sm:text-sm ' + (isDone?'text-[var(--muted)] line-through':'text-[var(--fg)]')}>{title}</p>
                        {review && <span className="mt-1 inline-block text-[10px] font-bold text-amber-600">Review needed</span>}
                      </div>
                      {!isDone && <button type="button" disabled={!ready || busy}
                        onClick={() => void change(key,review?'upcoming':'review')}
                        className={'shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold disabled:opacity-40 ' + (review?'bg-amber-500/20 text-amber-700 dark:text-amber-300':'text-[var(--muted)] hover:bg-amber-500/10 hover:text-amber-600')}>
                        {review?'Clear review':'Review'}
                      </button>}
                    </div>;
                  })}
                </div>
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]"><ShieldCheck size={17} className="text-emerald-500" /> Practical proof gate</div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{m.proof}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-[var(--muted)]">{allDone?'All lessons checked. Verify the evidence before passing.':'Complete '+(m.topics.length-done)+' more lessons to unlock this proof gate.'}</span>
                    <button type="button" disabled={!ready || !allDone || pending.includes(internshipGateKey(m.id))}
                      onClick={() => void change(internshipGateKey(m.id),passed?'upcoming':'completed')}
                      className={'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ' + (passed?'border border-emerald-500/40 text-emerald-600':'bg-emerald-600 text-white')}>
                      <CheckCircle2 size={14} /> {passed?'Proof gate passed ✓':'Mark proof exercise passed'}
                    </button>
                  </div>
                </div>
              </div>}
            </div>;
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <button type="button" onClick={() => setExamOpen(v => !v)} aria-expanded={examOpen}
            className="flex w-full items-center justify-between gap-4 p-5 text-left">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600"><Trophy size={21}/></div>
              <div><h2 className="text-lg font-black text-[var(--fg)]">Weekly interview qualification exam</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">20 independent tests • aim for 16/20 initially, with no serious research or eligibility errors.</p></div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-amber-600">{examDone}/20 <ChevronDown size={16} className={examOpen?'rotate-180':''}/></div>
          </button>
          {examOpen && <div className="border-t border-[var(--line)] p-4 sm:p-5">
            <Meter value={pct(examDone,20)} color="bg-gradient-to-r from-amber-500 to-orange-400" label="Interview test progress"/>
            <div className="mt-4 grid gap-2 lg:grid-cols-2">
              {examItems.map((title,i) => {
                const key=examKey(i), done=completed(key), busy=pending.includes(key);
                return <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]/70 p-3 text-xs text-[var(--fg)]">
                  <input type="checkbox" checked={done} disabled={!ready || busy}
                    onChange={() => void change(key,done?'upcoming':'completed')}
                    className="mt-0.5 h-4 w-4 rounded accent-emerald-500" />
                  <span className={done?'text-[var(--muted)] line-through':''}>{title}</span>
                </label>;
              })}
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">Repeat the exam regularly. The tracker records your most recent self-reported pass, not a verified external certification.</p>
          </div>}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link href="/roadmap/production-ai" className="group rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-sky-500/5 p-5 hover:border-violet-500/50">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-violet-600"><Sparkles size={16}/> Project 1</div>
            <h3 className="text-lg font-black text-[var(--fg)]">Dorsal research → Production AI</h3>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Continue your existing authorized research. Inference, ONNX, API and deployment are future proof gates—not completed claims.</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-600">Open project milestones <ArrowRight size={14}/></div>
          </Link>
          <Link href="/roadmap/production-ai" className="group rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 to-emerald-500/5 p-5 hover:border-sky-500/50">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-sky-600"><BookOpen size={16}/> Project 2 • Not yet built</div>
            <h3 className="text-lg font-black text-[var(--fg)]">Agent Reliability Lab</h3>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Public-document retrieval → grounded RAG → evaluation → read-only tools → AI security. Start after core Python/API checkpoints.</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-600">View separate plan <ArrowRight size={14}/></div>
          </Link>
        </section>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <button type="button" className="flex w-full items-center justify-between px-5 py-4 text-left"
            onClick={() => setLegacyOpen(v => !v)} aria-expanded={legacyOpen}>
            <div><h2 className="text-sm font-extrabold text-[var(--fg)]">Original ManuOS roadmap milestones</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">Your pre-existing roadmap is preserved, not reset or replaced.</p></div>
            <ChevronDown size={17} className={'text-[var(--muted)] '+(legacyOpen?'rotate-180':'')}/>
          </button>
          {legacyOpen && <div className="grid gap-2 border-t border-[var(--line)] p-4 sm:grid-cols-2 lg:grid-cols-3">
            {legacy.map(item => <Link key={item.id} href={'/roadmap/'+item.slug} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 hover:border-sky-500">
              <h3 className="text-xs font-bold text-[var(--fg)]">{item.title}</h3>
              <span className="mt-1 block text-[10px] capitalize text-[var(--muted)]">{item.status.replace('_',' ')}</span>
            </Link>)}
            {legacy.length===0 && <p className="text-xs text-[var(--muted)]">Original milestones unavailable; existing records have not been modified.</p>}
          </div>}
        </div>

        <p className="text-xs leading-5 text-[var(--muted)]">
          Employer-skill counts reflect a partial 15-job sample. Taiwan's semester work limit is generally 20 hours/week with the appropriate permit. Verify exact employer conditions; learning progress cannot substitute for legal eligibility or an interview. <a className="underline" target="_blank" rel="noreferrer" href="https://english.moe.gov.tw/cp-96-25406-b2053-1.html">Taiwan MOE guidance</a>.
        </p>
      </div>
    </Page>
  );
}
