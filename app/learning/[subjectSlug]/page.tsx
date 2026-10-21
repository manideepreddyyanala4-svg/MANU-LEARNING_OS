'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
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
  sections,
  slugFor,
  removeAssetsForTopics,
  moveTopic,
  type Subject,
  type Section,
  type Topic,
} from '@/lib/learning';

function SubjectPageContent() {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [sectionList, setSections] = useState<Section[]>([]);
  const [list, setList] = useState<Topic[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [creator, setCreator] = useState<{
    kind: 'section' | 'topic';
    sectionId: string | null;
  } | null>(null);
  const [title, setTitle] = useState('');
  const [menu, setMenu] = useState<string | null>(null);

  function closeCreator() {
    setCreator(null);
    if (searchParams.get('newTopic') || searchParams.get('newSection')) {
      router.replace(`/learning/${subjectSlug}`);
    }
  }

  async function refresh() {
    const s = (await subjects()).find((x) => x.slug === subjectSlug);
    setSubject(s ?? null);
    if (s) {
      const [ss, ts] = await Promise.all([sections(s.id), topics(s.id)]);
      setSections(ss);
      setList(ts);
    }
    window.dispatchEvent(new Event('manuos:learning-structure-changed'));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh().catch((e) => setError(e.message));
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectSlug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const sectionId = searchParams.get('newTopic');
      if (sectionId) {
        setCreator({
          kind: 'topic',
          sectionId: sectionId === 'unsectioned' ? null : sectionId,
        });
      } else if (searchParams.get('newSection')) {
        setCreator({ kind: 'section', sectionId: null });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  async function create() {
    if (!subject || !creator || !title.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const client = requireClient();
      const user = await requireUser();
      if (creator.kind === 'section') {
        const { error: e } = await client
          .from('learning_sections')
          .insert({
            user_id: user.id,
            subject_id: subject.id,
            title: title.trim(),
            order_index: sectionList.length,
          });
        if (e) throw e;
      } else {
        const group = list.filter((x) => x.section_id === creator.sectionId);
        const { data, error: e } = await client
          .from('topics')
          .insert({
            user_id: user.id,
            subject_id: subject.id,
            section_id: creator.sectionId,
            title: title.trim(),
            slug: slugFor(title),
            order_index: group.length,
          })
          .select('slug')
          .single();
        if (e) throw e;
        router.push(`/learning/${subject.slug}/${data.slug}`);
      }
      closeCreator();
      setTitle('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create item');
    } finally {
      setBusy(false);
    }
  }

  async function rename(item: Section | Topic) {
    const isTopic = 'slug' in item;
    const name = window
      .prompt(`Rename ${isTopic ? 'topic' : 'section'}`, item.title)
      ?.trim();
    if (!name || name === item.title) return;
    const table = isTopic ? 'topics' : 'learning_sections';
    const { error: e } = await requireClient()
      .from(table)
      .update({ title: name })
      .eq('id', item.id);
    if (e) setError(e.message);
    else await refresh();
  }

  async function remove(item: Section | Topic) {
    const isTopic = 'slug' in item;
    if (
      !window.confirm(
        isTopic
          ? `Delete topic “${item.title}” and its document?`
          : `Delete section “${item.title}”? Its topics will become unsectioned.`
      )
    )
      return;
    try {
      if (isTopic) await removeAssetsForTopics([item.id]);
      const { error: e } = await requireClient()
        .from(isTopic ? 'topics' : 'learning_sections')
        .delete()
        .eq('id', item.id);
      if (e) throw e;
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  async function reorder(item: Section | Topic, direction: -1 | 1) {
    const isTopic = 'slug' in item;
    const peers = isTopic
      ? list.filter((x) => x.section_id === item.section_id)
      : sectionList;
    const position = peers.findIndex((x) => x.id === item.id);
    const neighbor = peers[position + direction];
    if (!neighbor) return;
    try {
      const client = requireClient();
      const table = isTopic ? 'topics' : 'learning_sections';
      const reordered = [...peers];
      [reordered[position], reordered[position + direction]] = [
        reordered[position + direction],
        reordered[position],
      ];
      for (let i = 0; i < reordered.length; i++) {
        const result = await client
          .from(table)
          .update({ order_index: i })
          .eq('id', reordered[i].id);
        if (result.error) throw result.error;
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reorder failed');
    }
  }

  async function move(item: Topic, sectionId: string | null) {
    try {
      await moveTopic(item, sectionId);
      setMenu(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Move failed');
    }
  }

  async function status(item: Topic, value: Topic['status']) {
    const { error: e } = await requireClient()
      .from('topics')
      .update({ status: value })
      .eq('id', item.id);
    if (e) setError(e.message);
    else await refresh();
  }

  function actions(item: Section | Topic) {
    const isTopic = 'slug' in item;
    const isOpen = menu === item.id;
    return (
      <div className="relative">
        <button
          className="learning-menu-trigger"
          aria-label={`Actions for ${item.title}`}
          aria-expanded={isOpen}
          onClick={() => setMenu(isOpen ? null : item.id)}
        >
          <MoreHorizontal size={16} />
        </button>
        {isOpen && (
          <div className="learning-actions">
            <button
              onClick={() => {
                setMenu(null);
                void rename(item);
              }}
            >
              Rename
            </button>
            {isTopic ? (
              <>
                <label>
                  <span>Move to section</span>
                  <select
                    aria-label={`Move ${item.title} to section`}
                    value={item.section_id ?? ''}
                    onChange={(e) => void move(item, e.target.value || null)}
                  >
                    <option value="">Unsectioned</option>
                    {sectionList.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Status</span>
                  <select
                    aria-label={`Status of ${item.title}`}
                    value={item.status}
                    onChange={(e) =>
                      void status(item, e.target.value as Topic['status'])
                    }
                  >
                    {(
                      [
                        'not_started',
                        'learning',
                        'understood',
                        'review',
                        'mastered',
                      ] as const
                    ).map((x) => (
                      <option key={x} value={x}>
                        {x.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <button
                onClick={() => {
                  setMenu(null);
                  setCreator({ kind: 'topic', sectionId: item.id });
                }}
              >
                Add topic
              </button>
            )}
            <button onClick={() => void reorder(item, -1)}>Move up</button>
            <button onClick={() => void reorder(item, 1)}>Move down</button>
            <button
              className="danger"
              onClick={() => {
                setMenu(null);
                void remove(item);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  function topicRows(group: Topic[], includeAll = false) {
    const filtered = group.filter(
      (x) => includeAll || x.title.toLowerCase().includes(query.toLowerCase())
    );
    if (!filtered.length) {
      return (
        <div className="p-4 text-center text-xs text-[var(--muted)]">
          No topics in this section yet.
        </div>
      );
    }
    return (
      <div className="divide-y divide-[var(--line-subtle)]">
        {filtered.map((item, index) => (
          <div className="learning-topic-table-row" key={item.id}>
            <Link
              href={`/learning/${subject!.slug}/${item.slug}`}
              className="learning-topic-table-link"
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span className="truncate">{item.title}</span>
              {item.status === 'mastered' && (
                <span className="text-xs font-bold text-emerald-500">✓</span>
              )}
            </Link>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs capitalize text-[var(--muted)]">
                {item.status.replace('_', ' ')}
              </span>
              <span className="hidden md:inline text-xs text-[var(--muted)]">
                {new Date(item.updated_at).toLocaleDateString()}
              </span>
              {actions(item)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const masteredCount = list.filter((t) => t.status === 'mastered').length;

  return (
    <Page
      eyebrow="Learning Library"
      title={subject?.title ?? 'Subject'}
      subtitle={`${sectionList.length} sections · ${list.length} topics · ${masteredCount} mastered`}
      actions={
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:border-color-mix(in srgb, var(--accent) 30%, var(--line))"
            onClick={() => {
              setTitle('');
              setCreator({ kind: 'section', sectionId: null });
            }}
          >
            <Plus size={14} /> New section
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--accent-hover)]"
            onClick={() => {
              setTitle('');
              setCreator({
                kind: 'topic',
                sectionId: sectionList[0]?.id ?? null,
              });
            }}
          >
            <Plus size={14} /> Add topic
          </button>
        </div>
      }
    >
      {error && (
        <p role="alert" className="mb-6 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20">
          {error}
        </p>
      )}

      {subject && (
        <div className="learning-subject-workspace">
          {/* Search bar inside subject */}
          <div className="mb-8 relative max-w-xl">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              aria-label="Search this subject"
              placeholder="Search sections and topics in this subject…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Section groups */}
          <div className="space-y-6">
            {sectionList
              .filter(
                (s) =>
                  !query ||
                  s.title.toLowerCase().includes(query.toLowerCase()) ||
                  list.some(
                    (t) =>
                      t.section_id === s.id &&
                      t.title.toLowerCase().includes(query.toLowerCase())
                  )
              )
              .map((s, secIndex) => {
                const group = list.filter((t) => t.section_id === s.id);
                return (
                  <section
                    id={`section-${s.id}`}
                    key={s.id}
                    className="learning-section-card"
                  >
                    <div className="learning-section-heading learning-section-card-header">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                          Section {String(secIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[var(--muted)]">·</span>
                        <h2>{s.title}</h2>
                        <span>({group.length})</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          aria-label={`Add topic to ${s.title}`}
                          title="Add topic to this section"
                          onClick={() => {
                            setTitle('');
                            setCreator({ kind: 'topic', sectionId: s.id });
                          }}
                          className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5"
                        >
                          <Plus size={15} />
                        </button>
                        {actions(s)}
                      </div>
                    </div>
                    {topicRows(group, s.title.toLowerCase().includes(query.toLowerCase()))}
                  </section>
                );
              })}

            {/* Other topics (unsectioned) */}
            {(list.some((t) => !t.section_id) || !sectionList.length) && (
              <section className="learning-section-card">
                <div className="learning-section-heading learning-section-card-header">
                  <h2>Other topics</h2>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Add unsectioned topic"
                      title="Add unsectioned topic"
                      onClick={() => {
                        setTitle('');
                        setCreator({ kind: 'topic', sectionId: null });
                      }}
                      className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
                {topicRows(list.filter((t) => !t.section_id))}
              </section>
            )}
          </div>

          {!sectionList.length && !list.length && (
            <Empty
              title="Start with a section"
              description="Group related topics together, then add individual study lessons."
              action={
                <button
                  onClick={() => {
                    setTitle('');
                    setCreator({ kind: 'section', sectionId: null });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
                >
                  <Plus size={14} /> Add section
                </button>
              }
            />
          )}
        </div>
      )}

      {/* Creation Modal */}
      {creator && (
        <div
          className="learning-dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && closeCreator()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-create-title"
            className="learning-dialog"
          >
            <h2 id="learning-create-title">New {creator.kind}</h2>
            <p>
              {creator.kind === 'topic'
                ? sectionList.find((x) => x.id === creator.sectionId)?.title ??
                  'Other topics'
                : subject?.title}
            </p>
            <input
              autoFocus
              aria-label={`${creator.kind === 'topic' ? 'Topic' : 'Section'} name`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void create();
                if (e.key === 'Escape') closeCreator();
              }}
              placeholder={
                creator.kind === 'topic' ? 'e.g. Gaussian Noise' : 'e.g. Noise'
              }
            />
            <div>
              <button onClick={closeCreator}>Cancel</button>
              <button disabled={!title.trim() || busy} onClick={() => void create()}>
                {busy ? 'Creating…' : `Create ${creator.kind}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

export default function SubjectPage() {
  return (
    <Suspense
      fallback={
        <Page eyebrow="Learning" title="Loading Subject…">
          <div className="h-48 animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface)]" />
        </Page>
      }
    >
      <SubjectPageContent />
    </Suspense>
  );
}
