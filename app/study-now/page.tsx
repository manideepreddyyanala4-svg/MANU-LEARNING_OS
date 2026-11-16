'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Circle, Cloud, Search, Target } from 'lucide-react';
import { Page } from '@/components/ui';
import { LessonNotes } from '@/components/study-now/lesson-notes';
import { createClient } from '@/lib/supabase';
import { internshipCurriculum, internshipTopicKey, type InternshipPriority } from '@/lib/internship-curriculum';

type StudyStatus = 'upcoming' | 'in_progress' | 'review' | 'completed';
type Filter = 'all' | InternshipPriority;
type StudyRow = {
  key: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  priority: InternshipPriority;
  index: number;
  order: number;
};

const rows: StudyRow[] = internshipCurriculum.flatMap((module, moduleIndex) =>
  module.topics.map((title, index) => ({
    key: internshipTopicKey(module.id, index),
    title,
    moduleId: module.id,
    moduleTitle: module.title,
    priority: module.priority,
    index,
    order: internshipCurriculum.slice(0, moduleIndex).reduce((sum, item) => sum + item.topics.length, 0) + index,
  }))
);

function lessonUrl(row: StudyRow): string | null {
  const bases: Record<string, string> = {
    '01': '/roadmap/python/',
    '02': '/roadmap/python-interviews/',
    '03': '/roadmap/numpy/',
    '04': '/roadmap/pandas/',
  };
  return bases[row.moduleId] ? bases[row.moduleId] + (row.index + 1) : null;
}

export default function StudyNowPage() {
  const [progress, setProgress] = useState<Record<string, StudyStatus>>({});
  const [ownerId, setOwnerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const client = createClient();
    if (!client) throw new Error('Connect Supabase to view and save progress.');
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!auth.user) throw new Error('Sign in to save the same progress on phone and computer.');
    const { data, error: readError } = await client
      .from('roadmap_items')
      .select('slug,status')
      .like('slug', 'internship-v1-m%')
      .limit(1000);
    if (readError) throw readError;
    const known = new Set(rows.map((r) => r.key));
    const next: Record<string, StudyStatus> = {};
    for (const item of data ?? []) {
      if (known.has(item.slug) &&
          ['upcoming', 'in_progress', 'review', 'completed'].includes(item.status)) {
        next[item.slug] = item.status as StudyStatus;
      }
    }
    setOwnerId(auth.user.id);
    setProgress(next);
    setError('');
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await load();
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load progress.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void init();
    return () => { cancelled = true; };
  }, []);

  const done = rows.filter((r) => progress[r.key] === 'completed').length;
  // Never infer mastery from previously viewed material.
  const pinned = rows.find((r) => progress[r.key] === 'in_progress');
  const suggestion = rows.find((r) => r.priority === 'P0' && progress[r.key] !== 'completed') ??
    rows.find((r) => progress[r.key] !== 'completed');
  const current = pinned ?? suggestion;
  const next = current
    ? (rows.slice(current.order + 1).find((r) =>
        r.priority === current.priority && progress[r.key] !== 'completed') ??
        rows.find((r) =>
          r.key !== current.key && r.priority === current.priority && progress[r.key] !== 'completed') ??
        rows.find((r) => r.key !== current.key && progress[r.key] !== 'completed'))
    : undefined;

  const filteredModules = useMemo(() => internshipCurriculum.filter((module) => {
    if (filter !== 'all' && module.priority !== filter) return false;
    const q = search.trim().toLowerCase();
    return !q || module.title.toLowerCase().includes(q) ||
      module.topics.some((topic) => topic.toLowerCase().includes(q));
  }), [filter, search]);

  async function save(row: StudyRow, status: StudyStatus) {
    if (!ownerId || saving) return;
    setSaving(true);
    setError('');
    try {
      const client = createClient();
      if (!client) throw new Error('Cloud connection is unavailable.');
      // Only this internship curriculum uses in_progress as its pinned lesson.
      // We do not touch the older research roadmap's is_current state.
      const previousFocus = rows.filter((item) =>
        item.key !== row.key && progress[item.key] === 'in_progress');
      if (status === 'in_progress' && previousFocus.length) {
        const { error: clearError } = await client.from('roadmap_items')
          .update({ status: 'upcoming' })
          .eq('user_id', ownerId)
          .in('slug', previousFocus.map((item) => item.key));
        if (clearError) throw clearError;
      }
      const { error: writeError } = await client.from('roadmap_items').upsert({
        user_id: ownerId,
        slug: row.key,
        title: row.title,
        order_index: 1000 + row.order,
        status,
        is_current: false,
      }, { onConflict: 'user_id,slug' });
      if (writeError) throw writeError;
      // Reload the authoritative data, including after partial writes.
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Save failed. Please retry.');
      try { await load(); } catch { /* preserve the first error */ }
    } finally {
      setSaving(false);
    }
  }

  function topicLine(row: StudyRow, prominent = false) {
    const status = progress[row.key] ?? 'upcoming';
    const link = lessonUrl(row);
    return (
      <div key={row.key} className={'rounded-xl border p-3 sm:p-4 ' +
        (prominent ? 'border-sky-500/35 bg-sky-500/5' : 'border-[var(--line)] bg-[var(--bg)]')}>
        <div className="flex items-start gap-3">
          <div aria-hidden="true" className={'mt-1 shrink-0 ' +
            (status === 'completed' ? 'text-emerald-500' : status === 'in_progress' ? 'text-sky-500' : 'text-[var(--muted)]')}>
            {status === 'completed' ? <CheckCircle2 size={23} /> : <Circle size={23} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Module {row.moduleId} · Lesson {row.index + 1}
            </p>
            <p className={'mt-1 font-bold leading-snug text-[var(--fg)] ' +
              (prominent ? 'text-xl sm:text-2xl' : 'text-base')}>{row.title}</p>
            {prominent && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Understand the idea → try a small example → write or explain it without notes.
              Only then mark it complete.
            </p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {link && <Link href={link as '/roadmap/python/1'}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-bold text-white hover:bg-sky-700">
                <BookOpen size={16} /> Open lesson <ArrowRight size={15} />
              </Link>}
              {status !== 'in_progress' && status !== 'completed' &&
                <button type="button" disabled={!ownerId || saving}
                  onClick={() => void save(row, 'in_progress')}
                  className="min-h-10 rounded-lg border border-sky-500/40 px-3 py-2 text-sm font-semibold text-[var(--fg)] disabled:opacity-40">
                  Study this now
                </button>}
              {status === 'in_progress' &&
                <button type="button" disabled={!ownerId || saving}
                  onClick={() => void save(row, 'completed')}
                  className="min-h-10 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">
                  I can do this independently
                </button>}
              {status === 'completed' && <span className="text-sm font-semibold text-emerald-600">Completed</span>}
              {status === 'completed' &&
                <button type="button" disabled={!ownerId || saving}
                  onClick={() => void save(row, 'review')}
                  className="rounded-lg px-2 py-2 text-xs font-semibold text-[var(--muted)] disabled:opacity-40">
                  Needs review
                </button>}
              {status !== 'completed' && status !== 'review' && status !== 'in_progress' &&
                <button type="button" disabled={!ownerId || saving}
                  onClick={() => void save(row, 'review')}
                  className="rounded-lg px-2 py-2 text-xs font-semibold text-[var(--muted)] disabled:opacity-40">
                  Needs review
                </button>}
              {status === 'review' && <span className="text-xs font-semibold text-amber-600">Review needed</span>}
            </div>
            {!link && <p className="mt-2 text-xs text-[var(--muted)]">
              Detailed lesson not yet written here; topic remains in your existing roadmap.
            </p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Page eyebrow="One clear learning path" title="Study Now"
      subtitle="One current lesson, one next lesson, and the full curriculum when you need it. No random daily reshuffling.">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
            <Cloud size={17} className="text-sky-500" />
            {loading ? 'Loading your saved progress…' :
              ownerId ? 'Progress synchronized with your account' : 'Progress not connected'}
          </p>
          <p className="text-sm text-[var(--muted)]">{done} / {rows.length} topics verified</p>
        </div>
        {error && <div role="alert" className="rounded-xl border border-rose-500/40 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>}
        <section aria-label="Current lesson" className="rounded-3xl border border-sky-500/30 bg-[var(--surface)] p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]">
              <Target size={21} className="text-sky-500" /> {pinned ? 'Your current lesson' : 'Suggested starting lesson'}
            </h2>
            {!pinned && <span className="text-xs text-[var(--muted)]">Choose it to pin across devices</span>}
          </div>
          {current ? topicLine(current, true) :
            <p className="text-base text-[var(--fg)]">All listed topics have been marked complete.</p>}
          {current && !loading && ownerId &&
            <LessonNotes topicKey={current.key} topicTitle={current.title} validKeys={rows.map(r => r.key)} topicTitles={Object.fromEntries(rows.map(r => [r.key, r.title]))} />}
        </section>
        {next && <section aria-label="Next lesson" className="space-y-2">
          <h2 className="flex items-center gap-2 text-lg font-black text-[var(--fg)]">
            <ChevronRight size={21} className="text-violet-500" /> After that
          </h2>
          <p className="text-sm text-[var(--muted)]">A preview, not a command to switch topics before you're ready.</p>
          {topicLine(next)}
        </section>}

        <section aria-label="Full learning path" className="space-y-4 border-t border-[var(--line)] pt-7">
          <div>
            <h2 className="text-xl font-black text-[var(--fg)]">Your complete topic map</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              All {internshipCurriculum.length} existing modules and {rows.length} topics are still here.
              Open one subject only when you need it.
            </p>
          </div>
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4">
            <Search size={19} className="text-[var(--muted)]" />
            <span className="sr-only">Find a topic</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a topic — Python, CNN, RAG…" type="search"
              className="w-full min-w-0 bg-transparent py-3 text-base text-[var(--fg)] outline-none" />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all','P0','P1','P2'] as Filter[]).map((value) =>
              <button key={value} type="button" onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={'min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-bold ' +
                  (filter === value ? 'border-sky-600 bg-sky-600 text-white' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]')}>
                {value === 'all' ? 'All topics' : value === 'P0' ? 'Study first' : value === 'P1' ? 'Study later' : 'Advanced'}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filteredModules.map((module) => {
              const moduleRows = rows.filter((row) => row.moduleId === module.id);
              const matching = search.trim()
                ? moduleRows.filter((row) => row.title.toLowerCase().includes(search.trim().toLowerCase()) ||
                    module.title.toLowerCase().includes(search.trim().toLowerCase()))
                : moduleRows;
              const count = moduleRows.filter((row) => progress[row.key] === 'completed').length;
              const open = expanded === module.id || Boolean(search.trim());
              return (
                <div key={module.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                  <button type="button" aria-expanded={open}
                    onClick={() => setExpanded(open ? null : module.id)}
                    className="flex w-full items-center gap-3 p-4 text-left sm:p-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-base font-black text-sky-600">
                      {module.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-snug text-[var(--fg)]">{module.title}</span>
                      <span className="mt-1 block text-sm text-[var(--muted)]">
                        {count} of {moduleRows.length} completed · {module.priority === 'P0' ? 'Core' : module.priority === 'P1' ? 'Later' : 'Advanced'}
                      </span>
                    </span>
                    <ChevronDown size={21} className={'shrink-0 text-[var(--muted)] ' + (open ? 'rotate-180' : '')} />
                  </button>
                  {open && <div className="space-y-2 border-t border-[var(--line)] p-3 sm:p-4">
                    <p className="mb-3 text-sm leading-6 text-[var(--muted)]">
                      Prerequisites: {module.prerequisites}. Proof: {module.proof}
                    </p>
                    {matching.map((row) => topicLine(row))}
                    {matching.length === 0 && <p className="text-sm text-[var(--muted)]">No lesson title matches your search.</p>}
                  </div>}
                </div>
              );
            })}
            {filteredModules.length === 0 && <p className="text-sm text-[var(--muted)]">No matching modules or topics.</p>}
          </div>
          <div className="flex flex-wrap gap-3 pt-2 text-sm">
            <Link href="/learning" className="font-semibold text-sky-600 underline underline-offset-4">Your personal learning notes</Link>
            <Link href="/roadmap" className="font-semibold text-sky-600 underline underline-offset-4">Original detailed roadmap</Link>
          </div>
        </section>
      </div>
    </Page>
  );
}
