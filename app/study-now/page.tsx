'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, Circle, CircleDot, Maximize2, Minimize2, Search } from 'lucide-react';
import { LessonNotes } from '@/components/study-now/lesson-notes';
import pilotLessons from '@/lib/pilot-lessons.json';
import { LessonPreparation } from '@/components/study-now/lesson-preparation';
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

const STATUS_LABEL: Record<StudyStatus, string> = {
  upcoming: 'Not started',
  in_progress: 'Studying now',
  review: 'Needs review',
  completed: 'Completed',
};

function StatusIcon({ status, size = 18 }: { status: StudyStatus; size?: number }) {
  if (status === 'completed') return <CheckCircle2 size={size} aria-hidden="true" className="shrink-0 text-[var(--success)]" />;
  if (status === 'in_progress') return <CircleDot size={size} aria-hidden="true" className="shrink-0 text-[var(--accent)]" />;
  return <Circle size={size} aria-hidden="true" className="shrink-0 text-[var(--muted-light)]" />;
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
  const [viewKey, setViewKey] = useState<string | null>(null); // lesson being read; never written to the database
  const [showMap, setShowMap] = useState(false);
  const [showPrep, setShowPrep] = useState(false);
  const [focus, setFocus] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

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

  // Focus Mode: toggles a class on <html> (styles in globals.css). Escape exits; leaving the page always exits.
  useEffect(() => {
    document.documentElement.classList.toggle('focus-mode', focus);
    return () => document.documentElement.classList.remove('focus-mode');
  }, [focus]);
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocus(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);

  const done = rows.filter((r) => progress[r.key] === 'completed').length;
  // Never infer mastery from previously viewed material.
  const pinned = rows.find((r) => progress[r.key] === 'in_progress');
  const suggestion = rows.find((r) => r.priority === 'P0' && progress[r.key] !== 'completed') ??
    rows.find((r) => progress[r.key] !== 'completed');
  const home = pinned ?? suggestion;
  const shown = (viewKey ? rows.find((r) => r.key === viewKey) : undefined) ?? home;
  const previous = shown && shown.order > 0 ? rows[shown.order - 1] : undefined;
  const next = shown
    ? (rows.slice(shown.order + 1).find((r) =>
        r.priority === shown.priority && progress[r.key] !== 'completed') ??
        rows.find((r) =>
          r.key !== shown.key && r.priority === shown.priority && progress[r.key] !== 'completed') ??
        rows.find((r) => r.key !== shown.key && progress[r.key] !== 'completed'))
    : undefined;

  const filteredModules = useMemo(() => internshipCurriculum.filter((module) => {
    if (filter !== 'all' && module.priority !== filter) return false;
    const q = search.trim().toLowerCase();
    return !q || module.title.toLowerCase().includes(q) ||
      module.topics.some((topic) => topic.toLowerCase().includes(q));
  }), [filter, search]);

  function view(row: StudyRow) {
    setViewKey(row.key);
    window.scrollTo({ top: 0 });
  }

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

  const btnSecondary = 'min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--fg)] hover:border-[var(--fg)] disabled:opacity-50';
  const btnPrimary = 'inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50';

  const status: StudyStatus = shown ? (progress[shown.key] ?? 'upcoming') : 'upcoming';
  const link = shown ? lessonUrl(shown) : null;
  const total = shown ? internshipCurriculum.find((m) => m.id === shown.moduleId)?.topics.length ?? 0 : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      {/* Sync status (hidden in Focus Mode) */}
      <div className="study-chrome mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">Study Now</h1>
        <p className="text-sm text-[var(--muted)]">
          {loading ? 'Loading your saved progress…' : ownerId ? 'Progress synced with your account' : 'Progress not connected'}
          {' · '}{done} of {rows.length} topics verified
        </p>
      </div>

      {focus && (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
          <p className="text-sm text-[var(--muted)]">Focus mode. Press Esc to leave.</p>
          <button type="button" onClick={() => setFocus(false)} className={btnSecondary}>
            <span className="inline-flex items-center gap-2"><Minimize2 size={16} aria-hidden="true" /> Exit focus mode</span>
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-[var(--danger)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--danger)]">
          Problem: {error}
        </div>
      )}

      {/* CURRENT LESSON */}
      <section aria-label="Current lesson">
        {shown ? (
          <>
            <p className="text-sm text-[var(--muted)]">
              Module {shown.moduleId} · {shown.moduleTitle} · Lesson {shown.index + 1} of {total}
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-snug text-[var(--fg)] sm:text-3xl">{shown.title}</h2>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--fg)]">
              <StatusIcon status={status} />
              <span>{STATUS_LABEL[status]}</span>
              {!pinned && status === 'upcoming' && <span className="text-[var(--muted)]">· suggested start</span>}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {link && (
                <Link href={link as '/roadmap/python/1'} className={btnPrimary}>
                  <BookOpen size={17} aria-hidden="true" /> Open interactive lesson <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
              {status !== 'in_progress' && status !== 'completed' && (
                <button type="button" disabled={!ownerId || saving} onClick={() => void save(shown, 'in_progress')} className={btnSecondary}>
                  Make this my current lesson
                </button>
              )}
              {status === 'in_progress' && (
                <button type="button" disabled={!ownerId || saving} onClick={() => void save(shown, 'completed')} className={btnSecondary}>
                  I can do this independently
                </button>
              )}
              {status !== 'review' && (
                <button type="button" disabled={!ownerId || saving} onClick={() => void save(shown, 'review')}
                  className="min-h-11 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-50">
                  Needs review
                </button>
              )}
              {!focus && (
                <button type="button" onClick={() => setFocus(true)} aria-pressed={false}
                  className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)]">
                  <Maximize2 size={16} aria-hidden="true" /> Focus mode
                </button>
              )}
            </div>
            {process.env.NEXT_PUBLIC_INTERACTIVE_PILOT === '1' && pilotLessons.some(l => l.key === shown.key) && (
              <Link href={`/study-now/pilot?topic=${shown.key}`} className={btnPrimary}>Preview interactive pilot lesson <ArrowRight size={16} aria-hidden="true" /></Link>
            )}
            {!link && !(process.env.NEXT_PUBLIC_INTERACTIVE_PILOT === '1' && pilotLessons.some(l => l.key === shown.key)) && (
              <p className="mt-2 text-sm text-[var(--muted)]">
                No built interactive lesson for this topic; it stays in your roadmap. Notes below are your saved content.
              </p>
            )}
            {pinned && pinned.key !== shown.key && (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Your current lesson is “{pinned.title}”.{' '}
                <button type="button" onClick={() => view(pinned)} className="font-semibold text-[var(--accent)] underline underline-offset-4">Go back to it</button>
              </p>
            )}

            {/* ACTUAL LESSON CONTENT */}
            {!loading && ownerId && <LessonNotes topicKey={shown.key} topicTitle={shown.title} refreshToken={refreshToken} />}

            {/* PREVIOUS / NEXT */}
            <nav aria-label="Lesson navigation" className="mt-8 flex flex-wrap items-stretch justify-between gap-3 border-t border-[var(--line)] pt-5">
              {previous ? (
                <button type="button" onClick={() => view(previous)} className={btnSecondary + ' flex-1 text-left sm:flex-none'}>
                  <span className="flex items-center gap-2"><ArrowLeft size={16} aria-hidden="true" /> Previous lesson</span>
                  <span className="mt-0.5 block max-w-[28ch] truncate text-xs font-normal text-[var(--muted)]">{previous.title}</span>
                </button>
              ) : <span />}
              {next && (
                <button type="button" onClick={() => view(next)} className={btnPrimary + ' flex-1 justify-between text-left sm:flex-none'}>
                  <span>
                    <span className="block">Next lesson</span>
                    <span className="mt-0.5 block max-w-[28ch] truncate text-xs font-normal opacity-90">{next.title}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </nav>
            <p className="mt-2 text-sm text-[var(--muted)]">Moving between lessons only changes what you read. Progress changes only when you press a status button.</p>
          </>
        ) : (
          <p className="text-base text-[var(--fg)]">All listed topics have been marked complete.</p>
        )}
      </section>

      {/* FULL CURRICULUM (collapsed by default) */}
      <section aria-label="Full curriculum" className="study-chrome mt-10 border-t border-[var(--line)] pt-5">
        <button type="button" aria-expanded={showMap} aria-controls="full-curriculum" onClick={() => setShowMap((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between gap-3 text-left">
          <span>
            <span className="block text-lg font-semibold text-[var(--fg)]">Full curriculum</span>
            <span className="block text-sm text-[var(--muted)]">{internshipCurriculum.length} modules · {rows.length} topics</span>
          </span>
          <ChevronDown size={20} aria-hidden="true" className={'shrink-0 text-[var(--muted)] ' + (showMap ? 'rotate-180' : '')} />
        </button>
        {showMap && (
          <div id="full-curriculum" className="mt-4 space-y-4">
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4">
              <Search size={18} aria-hidden="true" className="text-[var(--muted)]" />
              <span className="sr-only">Find a topic</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a topic: Python, CNN, RAG…" type="search"
                className="w-full min-w-0 bg-transparent py-3 text-base text-[var(--fg)] outline-none" />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by priority">
              {(['all', 'P0', 'P1', 'P2'] as Filter[]).map((value) => (
                <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}
                  className={'min-h-11 shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold ' +
                    (filter === value ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]' : 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--fg)]')}>
                  {value === 'all' ? 'All topics' : value === 'P0' ? 'Study first' : value === 'P1' ? 'Study later' : 'Advanced'}
                </button>
              ))}
            </div>
            <div className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)]">
              {filteredModules.map((module) => {
                const moduleRows = rows.filter((row) => row.moduleId === module.id);
                const q = search.trim().toLowerCase();
                const matching = q
                  ? moduleRows.filter((row) => row.title.toLowerCase().includes(q) || module.title.toLowerCase().includes(q))
                  : moduleRows;
                const count = moduleRows.filter((row) => progress[row.key] === 'completed').length;
                const open = expanded === module.id || Boolean(q);
                return (
                  <div key={module.id}>
                    <button type="button" aria-expanded={open} onClick={() => setExpanded(open ? null : module.id)}
                      className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left">
                      <span className="w-8 shrink-0 text-sm font-semibold text-[var(--muted)]">{module.id}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-medium leading-snug text-[var(--fg)]">{module.title}</span>
                        <span className="block text-sm text-[var(--muted)]">
                          {count} of {moduleRows.length} completed · {module.priority === 'P0' ? 'Core' : module.priority === 'P1' ? 'Later' : 'Advanced'}
                        </span>
                      </span>
                      <ChevronDown size={18} aria-hidden="true" className={'shrink-0 text-[var(--muted)] ' + (open ? 'rotate-180' : '')} />
                    </button>
                    {open && (
                      <div className="border-t border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                        <p className="mb-3 text-sm leading-6 text-[var(--muted)]">Prerequisites: {module.prerequisites}. Proof: {module.proof}</p>
                        <ul className="space-y-1">
                          {matching.map((row) => {
                            const st = progress[row.key] ?? 'upcoming';
                            return (
                              <li key={row.key}>
                                <button type="button" onClick={() => view(row)}
                                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-[var(--line-subtle)]">
                                  <StatusIcon status={st} />
                                  <span className="min-w-0 flex-1 text-base text-[var(--fg)]">{row.title}</span>
                                  <span className="shrink-0 text-sm text-[var(--muted)]">{st === 'upcoming' ? '' : STATUS_LABEL[st]}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                        {matching.length === 0 && <p className="text-sm text-[var(--muted)]">No lesson title matches your search.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredModules.length === 0 && <p className="p-4 text-sm text-[var(--muted)]">No matching modules or topics.</p>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/learning" className="font-semibold text-[var(--accent)] underline underline-offset-4">Your personal learning notes</Link>
              <Link href="/roadmap" className="font-semibold text-[var(--accent)] underline underline-offset-4">Original detailed roadmap</Link>
            </div>
          </div>
        )}
      </section>

      {/* LESSON PREPARATION (administration; collapsed by default) */}
      <section aria-label="Lesson preparation" className="study-chrome mt-6 border-t border-[var(--line)] pt-5">
        <button type="button" aria-expanded={showPrep} aria-controls="lesson-preparation" onClick={() => setShowPrep((v) => !v)}
          className="flex min-h-11 w-full items-center justify-between gap-3 text-left">
          <span>
            <span className="block text-lg font-semibold text-[var(--fg)]">Lesson preparation</span>
            <span className="block text-sm text-[var(--muted)]">Import and templates, for when you add lesson content</span>
          </span>
          <ChevronDown size={20} aria-hidden="true" className={'shrink-0 text-[var(--muted)] ' + (showPrep ? 'rotate-180' : '')} />
        </button>
        {showPrep && (
          <div id="lesson-preparation" className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            {ownerId
              ? <LessonPreparation validKeys={rows.map((r) => r.key)} topicTitles={Object.fromEntries(rows.map((r) => [r.key, r.title]))}
                  onImported={() => setRefreshToken((n) => n + 1)} />
              : <p className="text-sm text-[var(--muted)]">Sign in to import lessons.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
