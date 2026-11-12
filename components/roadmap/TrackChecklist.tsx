'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown,
  ClipboardCopy, FileCode2, Filter, Search, ShieldCheck, Target,
} from 'lucide-react';
import { Page } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import type { LearningTrack } from '@/lib/career-learning-tracks';
import RagStudyPath from '@/components/roadmap/RagStudyPath';

type Row = { number: number; slug: string; title: string; sectionId: string };
type Status = 'loading' | 'ready' | 'error';

export default function TrackChecklist({ track }: { track: LearningTrack }) {
  const prefix = 'career-track-v1-' + track.key + '-';
  const all: Row[] = [];
  for (const section of track.sections) {
    for (const title of section.topics) {
      const number = all.length + 1;
      all.push({
        number, title, sectionId: section.id,
        slug: prefix + String(number).padStart(3, '0'),
      });
    }
  }

  const [completed, setCompleted] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([track.sections[0]?.id || '']);
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      try {
        const client = createClient();
        if (!client) throw new Error('Cloud connection is unavailable.');
        const { data: auth, error: authError } = await client.auth.getUser();
        if (authError) throw authError;
        if (!auth.user) throw new Error('Sign in to save your learning progress.');
        const owner = auth.user.id;
        const { data: existing, error: readError } = await client
          .from('roadmap_items').select('slug,status')
          .eq('user_id', owner).like('slug', prefix + '%').limit(1000);
        if (readError) throw readError;
        const found = new Set((existing || []).map(row => row.slug));
        const missing = all.filter(row => !found.has(row.slug));
        for (let offset = 0; offset < missing.length; offset += 100) {
          const batch = missing.slice(offset, offset + 100).map(row => ({
            user_id: owner, slug: row.slug, title: row.title,
            order_index: (track.key === 'cv' ? 3000 : 4000) + row.number,
            status: 'upcoming', is_current: false,
          }));
          const { error } = await client.from('roadmap_items')
            .upsert(batch, { onConflict: 'user_id,slug', ignoreDuplicates: true });
          if (error) throw error;
        }
        const { data: rows, error: latestError } = await client
          .from('roadmap_items').select('slug,status')
          .eq('user_id', owner).like('slug', prefix + '%').limit(1000);
        if (latestError) throw latestError;
        if (!rows || rows.length !== all.length) {
          throw new Error('Progress did not load completely. Refresh to retry.');
        }
        if (!cancelled) {
          setUserId(owner);
          setCompleted(rows.filter(row => row.status === 'completed').map(row => row.slug));
          setStatus('ready');
          setMessage('');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setMessage(error instanceof Error ? error.message : 'Unable to load progress.');
        }
      }
    }
    void loadProgress();
    return () => { cancelled = true; };
    // Track data is static; initialize only when switching tracks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.key]);

  async function toggle(slug: string) {
    if (status !== 'ready' || !userId || saving.includes(slug)) return;
    const wasDone = completed.includes(slug);
    const next = wasDone ? 'upcoming' : 'completed';
    setSaving(items => [...items, slug]);
    setCompleted(items => wasDone ? items.filter(item => item !== slug) : [...items, slug]);
    try {
      const client = createClient();
      if (!client) throw new Error('Cloud connection is unavailable.');
      const { data, error } = await client.from('roadmap_items')
        .update({ status: next }).eq('user_id', userId).eq('slug', slug).select('slug');
      if (error) throw error;
      if (!data || data.length !== 1) throw new Error('Progress update was not saved.');
      setMessage('');
    } catch (error) {
      setCompleted(items => wasDone ? [...items, slug] : items.filter(item => item !== slug));
      setMessage(error instanceof Error ? error.message : 'Could not save progress.');
    } finally {
      setSaving(items => items.filter(item => item !== slug));
    }
  }

  function toggleSection(id: string) {
    setOpen(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
  }

  async function copyChecklist() {
    const lines = track.sections.flatMap(section => {
      const rows = all.filter(row => row.sectionId === section.id);
      return [section.title, ...rows.map(row => String(row.number) + '. ' + row.title), ''];
    });
    try {
      await navigator.clipboard.writeText(track.title + '\n\n' + lines.join('\n'));
      setCopied(true);
    } catch {
      setMessage('Clipboard permission was denied. You can still select and copy the topics.');
    }
  }

  const isRag = track.key === 'rag';
  // Keep the 262 legacy slugs in all[] for saved progress; only the display order changes.
  if (isRag) {
    return <RagStudyPath track={track} completed={completed} saving={saving} status={status} message={message} onToggle={slug => { void toggle(slug); }} />;
  }
  const sectionColors = isRag
    ? 'from-violet-700 via-indigo-700 to-slate-900'
    : 'from-cyan-700 via-sky-700 to-slate-900';
  const accent = isRag ? 'text-violet-600 dark:text-violet-300' : 'text-sky-600 dark:text-sky-300';
  const percentage = all.length ? Math.round(completed.length / all.length * 100) : 0;
  const search = query.toLowerCase().trim();

  return (
    <Page
      eyebrow={track.eyebrow}
      title={track.title}
      subtitle={track.subtitle}
      actions={<Link href="/roadmap" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)]"><ArrowLeft size={15}/> All roadmaps</Link>}
    >
      <div className="space-y-6">
        <section className={'overflow-hidden rounded-3xl bg-gradient-to-br ' + sectionColors + ' p-6 text-white shadow-lg md:p-8'}>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/75">
            <BookOpen size={15}/> Dedicated interview track
          </div>
          <h2 className="mt-3 text-2xl font-black leading-tight md:text-3xl">{isRag ? 'Understand every EvidenceOps file.' : 'Master image processing and defend your research.'}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/85">{track.summary}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-xl">
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{track.sections.length}</p><p className="text-[10px] text-white/75">Learning modules</p></div>
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{all.length}</p><p className="text-[10px] text-white/75">Numbered topics</p></div>
            <div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{completed.length}</p><p className="text-[10px] text-white/75">Completed</p></div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: percentage + '%' }}/>
          </div>
          <p className="mt-2 text-xs font-semibold text-white/80">
            {status === 'ready' ? percentage + '% completed · saved to your ManuOS account' : status === 'loading' ? 'Loading your saved progress…' : 'Progress unavailable — topics remain readable'}
          </p>
        </section>

        <section className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 md:grid-cols-3">
          <div className="flex gap-2"><Target className={'mt-0.5 shrink-0 ' + accent} size={18}/><div><p className="text-xs font-extrabold text-[var(--fg)]">01 · Learn</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Read the concept and inspect the matching project file.</p></div></div>
          <div className="flex gap-2"><FileCode2 className={'mt-0.5 shrink-0 ' + accent} size={18}/><div><p className="text-xs font-extrabold text-[var(--fg)]">02 · Rebuild</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Write a tiny example without copying generated code.</p></div></div>
          <div className="flex gap-2"><ShieldCheck className={'mt-0.5 shrink-0 ' + accent} size={18}/><div><p className="text-xs font-extrabold text-[var(--fg)]">03 · Defend</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Explain inputs, outputs, errors and trade-offs aloud.</p></div></div>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[210px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"/>
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search topics, files and modules…" aria-label="Search learning topics"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 pl-10 pr-3 text-sm text-[var(--fg)] outline-none focus:border-sky-500"/>
          </div>
          <div className="relative flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-2">
            <Filter size={15} className="text-[var(--muted)]"/>
            <select value={priority} onChange={event => setPriority(event.target.value)} aria-label="Filter by priority"
              className="bg-transparent py-3 pr-3 text-xs font-bold text-[var(--fg)]">
              <option value="all">All priorities</option><option value="P0">P0 · Learn first</option><option value="P1">P1 · Learn next</option><option value="P2">P2 · Advanced</option>
            </select>
          </div>
          <button type="button" onClick={() => setOpen(track.sections.map(section => section.id))}
            className="rounded-xl border border-[var(--line)] px-3 py-3 text-xs font-bold text-[var(--fg)]">Expand all</button>
          <button type="button" onClick={() => setOpen([])}
            className="rounded-xl border border-[var(--line)] px-3 py-3 text-xs font-bold text-[var(--fg)]">Collapse all</button>
          <button type="button" onClick={() => void copyChecklist()}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--fg)] px-3 py-3 text-xs font-bold text-[var(--bg)]">
            <ClipboardCopy size={14}/>{copied ? 'Copied!' : 'Copy numbered list'}
          </button>
        </div>

        {message && <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">{message}</p>}

        <div className="space-y-3">
          {track.sections.map((section, index) => {
            const rows = all.filter(row => row.sectionId === section.id);
            const matching = rows.filter(row =>
              !search || (row.title + ' ' + section.title + ' ' + section.files.join(' ')).toLowerCase().includes(search)
            );
            if ((priority !== 'all' && section.priority !== priority) || matching.length === 0) return null;
            const show = search ? true : open.includes(section.id);
            const done = rows.filter(row => completed.includes(row.slug)).length;
            const first = rows[0]?.number || 1;
            const last = rows[rows.length - 1]?.number || first;
            return (
              <section key={section.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
                <button type="button" onClick={() => toggleSection(section.id)} aria-expanded={show}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left md:p-5">
                  <span className="flex min-w-0 items-start gap-3">
                    <span className={'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ' + (isRag ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300' : 'bg-sky-500/10 text-sky-600 dark:text-sky-300')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-[var(--fg)] md:text-base">{section.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{section.goal}</span>
                      <span className="mt-2 flex flex-wrap gap-1">
                        {section.files.map(file => <span key={file} className="rounded-lg bg-sky-500/10 px-2 py-1 font-mono text-[10px] font-semibold text-sky-700 dark:text-sky-300">{file}</span>)}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-right text-xs font-bold text-[var(--muted)] sm:block">{first}–{last}<br/>{done}/{rows.length} done</span>
                    <span className={'rounded-md px-2 py-1 text-[10px] font-black ' + (section.priority === 'P0' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300' : 'bg-sky-500/10 text-sky-600 dark:text-sky-300')}>{section.priority}</span>
                    <ChevronDown size={17} className={'text-[var(--muted)] transition ' + (show ? 'rotate-180' : '')}/>
                  </span>
                </button>
                {show && <div className="border-t border-[var(--line)] px-4 pb-5 pt-3 md:px-5">
                  <p className="mb-3 rounded-xl bg-emerald-500/10 p-3 text-xs leading-5 text-[var(--fg)]">
                    <strong>Practice proof:</strong> {section.practice}
                  </p>
                  <div className="grid gap-2 lg:grid-cols-2">
                    {matching.map(row => {
                      const checked = completed.includes(row.slug);
                      return (
                        <label key={row.slug} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)]/60 p-3">
                          <input type="checkbox" checked={checked} disabled={status !== 'ready' || saving.includes(row.slug)}
                            onChange={() => void toggle(row.slug)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500"/>
                          <span className="min-w-0">
                            <span className={'mr-2 font-mono text-xs font-bold ' + accent}>{String(row.number).padStart(3, '0')}</span>
                            <span className={'text-xs leading-5 ' + (checked ? 'text-[var(--muted)] line-through' : 'text-[var(--fg)]')}>{row.title}</span>
                            {checked && <CheckCircle2 size={13} className="ml-1 inline text-emerald-500"/>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>}
              </section>
            );
          })}
        </div>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2"><BookOpen size={18} className={accent}/><h2 className="text-base font-black text-[var(--fg)]">Official learning references</h2></div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {track.references.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] px-3 py-3 text-xs font-bold text-[var(--fg)] hover:border-sky-500">
              {link.name}<ArrowRight size={13} className="shrink-0 text-[var(--muted)]"/>
            </a>)}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Progress is self-reported and saved to your existing ManuOS account. This checklist does not modify your original internship curriculum or research progress.</p>
        </section>
      </div>
    </Page>
  );
}
