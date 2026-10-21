'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react';
import { Page, Empty } from '@/components/ui';
import {
  requireClient,
  requireUser,
  subjects,
  topics,
  slugFor,
  removeAssetsForTopics,
  type Subject,
  type Section,
  type Topic,
} from '@/lib/learning';

const subjectColors = [
  '#2563eb', // blue
  '#6366f1', // indigo
  '#0d9488', // teal
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // rose
];

const colorFor = (subject: Subject) =>
  subjectColors[
    [...subject.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      subjectColors.length
  ];

type Result = { topic: Topic; subject: Subject; section: Section | null };

function LearningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [list, setList] = useState<Subject[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [searched, setSearched] = useState(false);

  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [continueTopic, setContinueTopic] = useState<Result | null>(null);

  async function refresh() {
    const ss = await subjects();
    const client = requireClient();
    setList(ss);

    const [sectionResponse, topicResponse] = await Promise.all([
      client.from('learning_sections').select('*').order('order_index').order('created_at'),
      client.from('topics').select('*').order('updated_at', { ascending: false }),
    ]);

    if (sectionResponse.error) throw sectionResponse.error;
    if (topicResponse.error) throw topicResponse.error;

    const sec = (sectionResponse.data ?? []) as Section[];
    const top = (topicResponse.data ?? []) as Topic[];
    setAllSections(sec);
    setAllTopics(top);

    // Look for last studied topic from localStorage, or default to the most recently updated topic
    const saved = localStorage.getItem('manuos:last-learning-topic');
    if (saved) {
      try {
        const val = JSON.parse(saved) as { subjectSlug?: string; topicSlug?: string };
        const s = ss.find((x) => x.slug === val.subjectSlug);
        const t = top.find((x) => x.subject_id === s?.id && x.slug === val.topicSlug);
        if (s && t) {
          setContinueTopic({
            subject: s,
            topic: t,
            section: sec.find((x) => x.id === t.section_id) ?? null,
          });
          return;
        }
      } catch {
        localStorage.removeItem('manuos:last-learning-topic');
      }
    }

    if (top.length > 0) {
      const t = top[0];
      const s = ss.find((x) => x.id === t.subject_id);
      if (s) {
        setContinueTopic({
          subject: s,
          topic: t,
          section: sec.find((x) => x.id === t.section_id) ?? null,
        });
      }
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh().catch((e) => setError(e.message));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchParams.get('new') === 'subject') setCreateOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    if (!createOpen) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCreateOpen(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [createOpen]);

  async function create() {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const client = requireClient();
      const user = await requireUser();
      const { data, error: e } = await client
        .from('subjects')
        .insert({
          user_id: user.id,
          title: title.trim(),
          slug: slugFor(title),
          order_index: list.length + 1,
        })
        .select('slug')
        .single();
      if (e) throw e;
      setTitle('');
      setCreateOpen(false);
      await refresh();
      router.push(`/learning/${data.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create subject');
    } finally {
      setBusy(false);
    }
  }

  async function rename(subject: Subject) {
    const name = window.prompt('Rename subject', subject.title)?.trim();
    if (!name || name === subject.title) return;
    const { error: e } = await requireClient()
      .from('subjects')
      .update({ title: name })
      .eq('id', subject.id);
    if (e) setError(e.message);
    else void refresh().catch((err) => setError(err.message));
  }

  async function remove(subject: Subject) {
    if (
      !window.confirm(
        `Delete “${subject.title}” and all its topics, documents and images?`
      )
    )
      return;
    try {
      await removeAssetsForTopics((await topics(subject.id)).map((x) => x.id));
      const { error: e } = await requireClient()
        .from('subjects')
        .delete()
        .eq('id', subject.id);
      if (e) throw e;
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  async function search() {
    const q = query.trim();
    setSearched(Boolean(q));
    if (!q) {
      setResults([]);
      return;
    }
    try {
      const client = requireClient();
      const documents = await client
        .from('topic_documents')
        .select('topic_id')
        .ilike('plain_text', `%${q}%`)
        .limit(50);
      const legacy = await client
        .from('topic_blocks')
        .select('topic_id')
        .eq('block_type', 'text')
        .ilike('text_content', `%${q}%`)
        .limit(50);
      if (documents.error && legacy.error) throw documents.error;

      const ids = new Set([
        ...(documents.data ?? []).map((x) => x.topic_id),
        ...(legacy.data ?? []).map((x) => x.topic_id),
      ]);
      const lower = q.toLowerCase();
      setResults(
        allTopics
          .filter((t) => t.title.toLowerCase().includes(lower) || ids.has(t.id))
          .map((topic) => ({
            topic,
            subject: list.find((s) => s.id === topic.subject_id)!,
            section: allSections.find((s) => s.id === topic.section_id) ?? null,
          }))
          .filter((x) => x.subject)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
    }
  }

  return (
    <Page
      eyebrow="Knowledge Workspace"
      title="Technical Learning Library"
      subtitle="Curated curriculums, structured engineering topics, and deep reference notes."
      actions={
        <button
          aria-label="+ New subject"
          onClick={() => {
            setTitle('');
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)]"
        >
          <Plus size={15} /> New subject
        </button>
      }
    >
      {error && (
        <p role="alert" className="mb-6 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20">
          {error}
        </p>
      )}

      {/* Hero: Continue Learning Banner */}
      <section className="mb-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-subtle)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              <Clock size={12} /> Continue learning
            </span>
            {continueTopic ? (
              <>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg)] md:text-3xl">
                  {continueTopic.topic.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {continueTopic.subject.title}
                  {continueTopic.section ? ` › ${continueTopic.section.title}` : ''}
                </p>
                <div className="mt-5">
                  <Link
                    aria-label="Continue →"
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                    href={`/learning/${continueTopic.subject.slug}/${continueTopic.topic.slug}`}
                  >
                    Continue →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--fg)]">
                  Build your technical library one topic at a time.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  Create subjects for core computer science disciplines, organize them into sections, and write rich study notes with diagrams, code, and math.
                </p>
                <div className="mt-5">
                  <button
                    onClick={() => {
                      setTitle('');
                      setCreateOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)]"
                  >
                    <Plus size={14} /> Create your first subject
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick stats highlight */}
          <div className="grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0 shrink-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Subjects
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--fg)]">
                {list.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Topics
              </p>
              <p className="mt-1 text-2xl font-extrabold text-[var(--fg)]">
                {allTopics.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Search Bar */}
      <div className="mb-10 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            aria-label="Search learning material"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) {
                setSearched(false);
                setResults([]);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && void search()}
            placeholder="Search subjects, sections, topics or notes"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--fg)] outline-none shadow-2xs transition focus:border-[var(--accent)]"
          />
        </div>
        <button
          onClick={() => void search()}
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-xs font-semibold text-[var(--fg)] transition hover:border-color-mix(in srgb, var(--accent) 30%, var(--line))"
        >
          Search
        </button>
      </div>

      {/* Search Results Display */}
      {searched && (
        <section className="mb-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
          <h2 className="text-base font-bold text-[var(--fg)]">Search Results</h2>
          <div className="mt-4 divide-y divide-[var(--line)]">
            {list
              .filter((x) => x.title.toLowerCase().includes(query.toLowerCase()))
              .map((x) => (
                <Link
                  className="block py-3 transition hover:text-[var(--accent)]"
                  key={x.id}
                  href={`/learning/${x.slug}`}
                >
                  <p className="font-semibold text-[var(--fg)]">{x.title}</p>
                  <span className="text-xs text-[var(--muted)]">Subject</span>
                </Link>
              ))}

            {allSections
              .filter((x) => x.title.toLowerCase().includes(query.toLowerCase()))
              .map((x) => {
                const parent = list.find((s) => s.id === x.subject_id);
                return parent ? (
                  <Link
                    className="block py-3 transition hover:text-[var(--accent)]"
                    key={x.id}
                    href={`/learning/${parent.slug}#section-${x.id}`}
                  >
                    <p className="font-semibold text-[var(--fg)]">{x.title}</p>
                    <span className="text-xs text-[var(--muted)]">
                      {parent.title} › Section
                    </span>
                  </Link>
                ) : null;
              })}

            {results.map(({ topic, subject, section }) => (
              <Link
                className="block py-3 transition hover:text-[var(--accent)]"
                key={topic.id}
                href={`/learning/${subject.slug}/${topic.slug}`}
              >
                <p className="font-semibold text-[var(--fg)]">{topic.title}</p>
                <span className="text-xs text-[var(--muted)]">
                  {subject.title} › {section?.title ?? 'Other topics'}
                </span>
              </Link>
            ))}

            {!results.length &&
              !allSections.some((x) =>
                x.title.toLowerCase().includes(query.toLowerCase())
              ) &&
              !list.some((x) =>
                x.title.toLowerCase().includes(query.toLowerCase())
              ) && (
                <p className="py-6 text-center text-xs text-[var(--muted)]">
                  No matching subjects, sections, or topics found.
                </p>
              )}
          </div>
        </section>
      )}

      {/* Subjects Library Grid */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--fg)]">
            Your Subjects
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {list.length} {list.length === 1 ? 'subject' : 'subjects'} total
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((s) => {
            const subjectSections = allSections.filter((sec) => sec.subject_id === s.id);
            const subjectTopics = allTopics.filter((top) => top.subject_id === s.id);
            const masteredCount = subjectTopics.filter(
              (top) => top.status === 'mastered'
            ).length;
            const accentTone = colorFor(s);

            return (
              <div
                key={s.id}
                className="group relative flex flex-col justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs transition hover:border-color-mix(in srgb, var(--accent) 40%, var(--line)) hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="h-2.5 w-8 rounded-full"
                      style={{ backgroundColor: accentTone }}
                    />
                    <div className="relative">
                      <button
                        aria-label={`Actions for ${s.title}`}
                        aria-expanded={menuOpen === s.id}
                        onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                        className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpen === s.id && (
                        <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1 shadow-lg">
                          <button
                            className="block w-full rounded px-2.5 py-1.5 text-left text-xs font-medium text-[var(--fg)] hover:bg-[var(--accent-subtle)]"
                            onClick={() => {
                              setMenuOpen(null);
                              void rename(s);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            className="block w-full rounded px-2.5 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={() => {
                              setMenuOpen(null);
                              void remove(s);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link href={`/learning/${s.slug}`} className="mt-5 block no-underline">
                    <h3 className="text-xl font-bold tracking-tight text-[var(--fg)] transition group-hover:text-[var(--accent)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {subjectSections.length} sections · {subjectTopics.length} topics
                    </p>
                  </Link>
                </div>

                <div className="mt-6 border-t border-[var(--line)] pt-4 flex items-center justify-between text-xs">
                  <span className="text-[var(--muted)]">
                    {masteredCount} of {subjectTopics.length} mastered
                  </span>
                  <Link
                    href={`/learning/${s.slug}`}
                    className="font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                  >
                    Open <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {!list.length && (
          <Empty
            title="Start your learning library"
            description="Create a subject for anything you're studying (e.g. Computer Vision, Algorithms, System Design)."
            action={
              <button
                onClick={() => {
                  setTitle('');
                  setCreateOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                <Plus size={14} /> New subject
              </button>
            }
          />
        )}
      </section>

      {/* Quick Access: Recently Updated Topics Table */}
      {allTopics.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-[var(--fg)]">
              Recently Modified Lessons
            </h2>
            <span className="text-xs text-[var(--muted)]">Latest updates</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
            <div className="divide-y divide-[var(--line)]">
              {allTopics.slice(0, 8).map((top) => {
                const s = list.find((sub) => sub.id === top.subject_id);
                const sec = allSections.find((se) => se.id === top.section_id);
                if (!s) return null;

                return (
                  <div
                    key={top.id}
                    className="flex flex-col gap-2 p-4 transition hover:bg-[var(--accent-subtle)] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/learning/${s.slug}/${top.slug}`}
                        className="font-bold text-sm text-[var(--fg)] hover:text-[var(--accent)] block truncate"
                      >
                        {top.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {s.title} {sec ? `› ${sec.title}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <span className="capitalize rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                        {top.status.replace('_', ' ')}
                      </span>
                      <span className="text-[var(--muted)] text-[11px]">
                        {new Date(top.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* New Subject Modal */}
      {createOpen && (
        <div
          className="learning-dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setCreateOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-subject-title"
            className="learning-dialog"
          >
            <h2 id="new-subject-title">New Subject</h2>
            <p>Create a dedicated technical area (e.g. Computer Vision, Algorithms).</p>
            <input
              autoFocus
              aria-label="Subject name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void create()}
              placeholder="e.g. Image Processing"
            />
            <div>
              <button onClick={() => setCreateOpen(false)}>Cancel</button>
              <button disabled={busy || !title.trim()} onClick={() => void create()}>
                {busy ? 'Creating…' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function Learning() {
  return (
    <Suspense
      fallback={
        <Page eyebrow="Learning" title="Loading Library…">
          <div className="h-48 animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface)]" />
        </Page>
      }
    >
      <LearningContent />
    </Suspense>
  );
}
