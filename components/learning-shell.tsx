'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Focus,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  requireClient,
  requireUser,
  subjects,
  topics,
  sections,
  orderedTopics,
  slugFor,
  removeAssetsForTopics,
  moveTopic,
  type Subject,
  type Section,
  type Topic,
} from '@/lib/learning';
import type { PartialBlock } from '@blocknote/core';

type Heading = { index: number; text: string; level: number };

const headingsFrom = (blocks: PartialBlock[]): Heading[] =>
  blocks
    .map((block, index) => ({ block, index }))
    .filter(
      ({ block }) =>
        block.type === 'heading' &&
        Number((block.props as { level?: number } | undefined)?.level ?? 2) >= 2
    )
    .map(({ block, index }) => ({
      index,
      level: Number((block.props as { level?: number } | undefined)?.level ?? 2),
      text:
        typeof block.content === 'string'
          ? block.content
          : Array.isArray(block.content)
          ? block.content
              .map((item) =>
                typeof item === 'string'
                  ? item
                  : (item as { text?: string }).text ?? ''
              )
              .join('')
          : `Heading ${index + 1}`,
    }));

const subjectColors = [
  '#2563eb', // blue
  '#6366f1', // indigo
  '#0d9488', // teal
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // rose
];

export function LearningShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [sectionList, setSectionList] = useState<Section[]>([]);
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeading, setActiveHeading] = useState<number | null>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  // Dialog state for inline creation/renaming from sidebar
  const [dialog, setDialog] = useState<{
    type: 'create_section' | 'create_topic' | 'rename_section' | 'rename_topic';
    targetId?: string;
    sectionId?: string | null;
    initialTitle?: string;
  } | null>(null);
  const [dialogInput, setDialogInput] = useState('');
  const [dialogBusy, setDialogBusy] = useState(false);

  const activeRef = useRef<HTMLAnchorElement | null>(null);
  const segments = pathname.split('/').filter(Boolean);
  const subjectSlug = segments[1];
  const topicSlug = segments[2];

  const subject = subjectList.find((x) => x.slug === subjectSlug);
  const currentTopic = topicList.find((x) => x.slug === topicSlug);
  const currentSection = sectionList.find((x) => x.id === currentTopic?.section_id);

  const accent = subject
    ? subjectColors[
        [...subject.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
          subjectColors.length
      ]
    : 'var(--accent)';

  // Load user
  useEffect(() => {
    requireUser()
      .then((u) => setUserEmail(u.email ?? 'User'))
      .catch(() => setUserEmail(null));
  }, []);

  // Load sidebar collapse preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('manuos:sidebar-collapsed');
      if (saved === 'true') {
        const timer = window.setTimeout(() => setCollapsed(true), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleCollapse() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem('manuos:sidebar-collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  // Load subjects
  useEffect(() => {
    void subjects()
      .then(setSubjectList)
      .catch(() => setSubjectList([]));
  }, [pathname]);

  // Load sections & topics
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!subject) {
        setSectionList([]);
        setTopicList([]);
        return;
      }
      void Promise.all([sections(subject.id), topics(subject.id)])
        .then(([ss, ts]) => {
          setSectionList(ss);
          setTopicList(ts);
        })
        .catch(() => {
          setSectionList([]);
          setTopicList([]);
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [subject, pathname]);

  // Auto-expand current section
  useEffect(() => {
    if (!currentSection) return;
    const timer = window.setTimeout(
      () => setExpanded((prev) => ({ ...prev, [currentSection.id]: true })),
      0
    );
    return () => window.clearTimeout(timer);
  }, [currentSection]);

  // Reload listener
  useEffect(() => {
    const reload = () => {
      if (!subject) return;
      void Promise.all([sections(subject.id), topics(subject.id)]).then(
        ([ss, ts]) => {
          setSectionList(ss);
          setTopicList(ts);
        }
      );
    };
    window.addEventListener('manuos:learning-structure-changed', reload);
    return () =>
      window.removeEventListener('manuos:learning-structure-changed', reload);
  }, [subject]);

  // Load active topic headings
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!currentTopic) {
        setHeadings([]);
        return;
      }
      void Promise.resolve(
        requireClient()
          .from('topic_documents')
          .select('content_json')
          .eq('topic_id', currentTopic.id)
          .maybeSingle()
      )
        .then(({ data }) =>
          setHeadings(headingsFrom((data?.content_json as PartialBlock[] | null) ?? []))
        )
        .catch(() => setHeadings([]));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentTopic]);

  // Saved document event
  useEffect(() => {
    const saved = (event: Event) => {
      const detail = (event as CustomEvent<{ topicId: string; content: PartialBlock[] }>)
        .detail;
      if (detail.topicId === currentTopic?.id) {
        setHeadings(headingsFrom(detail.content));
      }
    };
    window.addEventListener('manuos:learning-document-saved', saved);
    return () => window.removeEventListener('manuos:learning-document-saved', saved);
  }, [currentTopic]);

  // Scroll spy on headings
  useEffect(() => {
    if (!headings.length) return;
    const elements = headings
      .map((x) => document.getElementById(`topic-heading-${x.index}`))
      .filter((x): x is HTMLElement => Boolean(x));
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((x) => x.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setActiveHeading(Number(visible.target.id.replace('topic-heading-', '')));
        }
      },
      { rootMargin: '-12% 0px -67% 0px' }
    );
    elements.forEach((x) => observer.observe(x));
    return () => observer.disconnect();
  }, [headings, pathname]);

  // Auto-scroll sidebar item into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentTopic?.id, activeHeading]);

  const ordered = useMemo(
    () => orderedTopics(sectionList, topicList),
    [sectionList, topicList]
  );
  const lower = query.trim().toLowerCase();
  const visibleSections = sectionList.filter(
    (x) =>
      !lower ||
      x.title.toLowerCase().includes(lower) ||
      topicList.some(
        (t) => t.section_id === x.id && t.title.toLowerCase().includes(lower)
      )
  );

  async function handleDialogSubmit() {
    if (!dialog || !dialogInput.trim() || dialogBusy || !subject) return;
    setDialogBusy(true);
    try {
      const client = requireClient();
      const user = await requireUser();
      const title = dialogInput.trim();

      if (dialog.type === 'create_section') {
        const { error } = await client.from('learning_sections').insert({
          user_id: user.id,
          subject_id: subject.id,
          title,
          order_index: sectionList.length,
        });
        if (error) throw error;
        setExpanded((prev) => ({ ...prev, [title]: true }));
      } else if (dialog.type === 'create_topic') {
        const group = topicList.filter((x) => x.section_id === dialog.sectionId);
        const { data, error } = await client
          .from('topics')
          .insert({
            user_id: user.id,
            subject_id: subject.id,
            section_id: dialog.sectionId ?? null,
            title,
            slug: slugFor(title),
            order_index: group.length,
          })
          .select('slug')
          .single();
        if (error) throw error;
        router.push(`/learning/${subject.slug}/${data.slug}`);
      } else if (dialog.type === 'rename_section') {
        const { error } = await client
          .from('learning_sections')
          .update({ title })
          .eq('id', dialog.targetId!);
        if (error) throw error;
      } else if (dialog.type === 'rename_topic') {
        const { error } = await client
          .from('topics')
          .update({ title })
          .eq('id', dialog.targetId!);
        if (error) throw error;
      }

      window.dispatchEvent(new Event('manuos:learning-structure-changed'));
      setDialog(null);
      setDialogInput('');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Operation failed');
    } finally {
      setDialogBusy(false);
    }
  }

  async function reorderSection(sec: Section, direction: -1 | 1) {
    const pos = sectionList.findIndex((x) => x.id === sec.id);
    const neighbor = sectionList[pos + direction];
    if (!neighbor || !subject) return;
    try {
      const client = requireClient();
      const reordered = [...sectionList];
      [reordered[pos], reordered[pos + direction]] = [
        reordered[pos + direction],
        reordered[pos],
      ];
      for (let i = 0; i < reordered.length; i++) {
        await client
          .from('learning_sections')
          .update({ order_index: i })
          .eq('id', reordered[i].id);
      }
      window.dispatchEvent(new Event('manuos:learning-structure-changed'));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Reorder failed');
    }
  }

  async function deleteSection(sec: Section) {
    if (
      !window.confirm(
        `Delete section “${sec.title}”? Its topics will safely become unsectioned.`
      )
    )
      return;
    try {
      const { error } = await requireClient()
        .from('learning_sections')
        .delete()
        .eq('id', sec.id);
      if (error) throw error;
      window.dispatchEvent(new Event('manuos:learning-structure-changed'));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  async function deleteTopicItem(item: Topic) {
    if (!window.confirm(`Delete topic “${item.title}” and its document?`)) return;
    try {
      await removeAssetsForTopics([item.id]);
      const { error } = await requireClient()
        .from('topics')
        .delete()
        .eq('id', item.id);
      if (error) throw error;
      window.dispatchEvent(new Event('manuos:learning-structure-changed'));
      if (currentTopic?.id === item.id) {
        router.push(`/learning/${subject!.slug}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  async function updateTopicStatus(item: Topic, status: Topic['status']) {
    try {
      const { error } = await requireClient()
        .from('topics')
        .update({ status })
        .eq('id', item.id);
      if (error) throw error;
      window.dispatchEvent(new Event('manuos:learning-structure-changed'));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Status update failed');
    }
  }

  function topicLink(item: Topic) {
    const active = item.id === currentTopic?.id;
    const index = ordered.findIndex((t) => t.id === item.id);
    const menuOpen = activeMenu === `topic-${item.id}`;

    return (
      <div key={item.id} className="relative group/topic">
        <div className="learning-side-topic-row">
          <Link
            ref={active ? activeRef : undefined}
            onClick={() => setOpen(false)}
            href={`/learning/${subject!.slug}/${item.slug}`}
            className={`learning-side-topic ${active ? 'is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span>{item.title}</span>
            {item.status === 'mastered' && (
              <span className="text-emerald-500 text-xs font-bold" aria-label="Mastered">
                ✓
              </span>
            )}
          </Link>
          <div className="relative">
            <button
              aria-label={`Sidebar options for ${item.title}`}
              aria-expanded={menuOpen}
              onClick={() => setActiveMenu(menuOpen ? null : `topic-${item.id}`)}
              className="learning-menu-trigger opacity-0 group-hover/topic:opacity-100 transition"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="learning-actions">
                <button
                  onClick={() => {
                    setActiveMenu(null);
                    setDialog({
                      type: 'rename_topic',
                      targetId: item.id,
                      initialTitle: item.title,
                    });
                    setDialogInput(item.title);
                  }}
                >
                  Rename topic
                </button>
                <label>
                  <span>Move to section</span>
                  <select
                    aria-label={`Move ${item.title} to section`}
                    value={item.section_id ?? ''}
                    onChange={(e) => {
                      setActiveMenu(null);
                      void moveTopic(item, e.target.value || null).then(() =>
                        window.dispatchEvent(new Event('manuos:learning-structure-changed'))
                      );
                    }}
                  >
                    <option value="">Unsectioned</option>
                    {sectionList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Status</span>
                  <select
                    aria-label={`Status of ${item.title}`}
                    value={item.status}
                    onChange={(e) => {
                      setActiveMenu(null);
                      void updateTopicStatus(item, e.target.value as Topic['status']);
                    }}
                  >
                    {(
                      [
                        'not_started',
                        'learning',
                        'understood',
                        'review',
                        'mastered',
                      ] as const
                    ).map((st) => (
                      <option key={st} value={st}>
                        {st.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="danger"
                  onClick={() => {
                    setActiveMenu(null);
                    void deleteTopicItem(item);
                  }}
                >
                  Delete topic
                </button>
              </div>
            )}
          </div>
        </div>

        {active && headings.length > 0 && (
          <nav className="learning-side-headings" aria-label="Current topic headings">
            {headings.map((h) => (
              <a
                key={h.index}
                href={`#topic-heading-${h.index}`}
                className={`${activeHeading === h.index ? 'is-active' : ''} ${
                  h.level === 3 ? 'is-h3' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(`topic-heading-${h.index}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setOpen(false);
                }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    );
  }

  return (
    <div className={`learning-context ${focused ? 'focus-mode' : ''}`}>
      {/* 54px Top Bar */}
      <header className="sticky top-0 z-30 flex h-[54px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-[var(--muted)] hover:text-[var(--fg)]"
            aria-label={open ? 'Close learning navigation' : 'Open learning navigation'}
            onClick={() => setOpen((x) => !x)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--fg)]"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">ManuOS</span>
          </Link>

          <span className="h-4 w-px bg-[var(--line)]" />

          <Link
            href="/learning"
            className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-[var(--fg)]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-white">
              <BookOpen size={14} />
            </div>
            <span>MANU LEARN</span>
          </Link>
        </div>

        {/* Global / Command trigger in top bar */}
        <div className="hidden md:flex items-center">
          <Link
            href="/learning"
            className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)] shadow-2xs transition hover:border-color-mix(in srgb, var(--accent) 30%, var(--line)) hover:text-[var(--fg)]"
          >
            <Search size={14} />
            <span>Search library, topics & notes…</span>
            <kbd className="ml-3 rounded border border-[var(--line)] bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Right contextual controls */}
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <button
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleCollapse}
            className="hidden lg:grid place-items-center h-8 w-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:text-[var(--fg)]"
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          <button
            title={focused ? 'Exit focus mode' : 'Focus mode'}
            aria-label={focused ? 'Exit focus mode' : 'Focus mode'}
            onClick={() => {
              setFocused((v) => !v);
              document.documentElement.classList.toggle('focus-mode');
            }}
            className="grid place-items-center h-8 w-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:text-[var(--fg)]"
          >
            <Focus size={15} />
          </button>

          <button
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="grid place-items-center h-8 w-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] hover:text-[var(--fg)]"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenu((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--fg)] hover:border-color-mix(in srgb, var(--accent) 30%, var(--line))"
              aria-label="User profile"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white text-[10px]">
                <User size={11} />
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate text-[11px]">
                {userEmail?.split('@')[0] ?? 'User'}
              </span>
            </button>
            {userMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-lg">
                <div className="px-3 py-1.5 text-xs text-[var(--muted)] border-b border-[var(--line)]">
                  Signed in as <strong className="text-[var(--fg)] block truncate">{userEmail}</strong>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setUserMenu(false)}
                  className="block w-full px-3 py-2 text-xs text-[var(--fg)] hover:bg-[var(--accent-subtle)] rounded-md"
                >
                  Settings
                </Link>
                <Link
                  href="/"
                  onClick={() => setUserMenu(false)}
                  className="block w-full px-3 py-2 text-xs text-[var(--fg)] hover:bg-[var(--accent-subtle)] rounded-md"
                >
                  ManuOS Home
                </Link>
                <button
                  onClick={async () => {
                    setUserMenu(false);
                    const client = requireClient();
                    await client.auth.signOut();
                    router.push('/login');
                  }}
                  className="block w-full px-3 py-2 text-xs text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex">
        {/* Left Navigation Sidebar */}
        <aside
          className={`${
            open ? 'translate-x-0' : '-translate-x-full'
          } learning-sidebar fixed inset-y-[54px] left-0 z-20 w-[min(88vw,300px)] overflow-y-auto transition-transform lg:sticky lg:top-[54px] lg:h-[calc(100vh-54px)] ${
            collapsed ? 'lg:hidden' : 'lg:w-[296px] lg:shrink-0 lg:translate-x-0'
          }`}
        >
          {/* Sticky Header with Subject Switcher */}
          <div className="learning-side-sticky">
            <div className="learning-switcher-wrap">
              <button
                className="learning-switcher"
                aria-label="Switch subject"
                aria-expanded={switcher}
                onClick={() => setSwitcher((x) => !x)}
              >
                <span>{subject?.title ?? 'Learning Library'}</span>
                <ChevronDown size={14} className="shrink-0 text-[var(--muted)]" />
              </button>

              {switcher && (
                <div className="learning-switcher-menu">
                  <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Subjects
                  </div>
                  {subjectList.map((s) => (
                    <Link
                      href={`/learning/${s.slug}`}
                      key={s.id}
                      onClick={() => {
                        setSwitcher(false);
                        setOpen(false);
                      }}
                      className={s.id === subject?.id ? 'font-bold bg-[var(--accent-subtle)] text-[var(--accent)]' : ''}
                    >
                      <span className="truncate">{s.title}</span>
                      {s.id === subject?.id && <Check size={13} />}
                    </Link>
                  ))}
                  <hr />
                  <Link
                    href="/learning"
                    onClick={() => {
                      setSwitcher(false);
                      setOpen(false);
                    }}
                  >
                    <span>Learning Home</span>
                  </Link>
                  <Link
                    href="/learning?new=subject"
                    onClick={() => {
                      setSwitcher(false);
                      setOpen(false);
                    }}
                    className="text-[var(--accent)] font-semibold"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus size={13} /> New Subject
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {subject && (
              <input
                aria-label="Search this subject"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter topics…"
                className="learning-side-search"
              />
            )}
          </div>

          {/* Navigation Tree */}
          {subject ? (
            <nav className="learning-side-tree" aria-label="Subject navigation">
              {visibleSections.map((section) => {
                const group = topicList.filter(
                  (x) =>
                    x.section_id === section.id &&
                    (!lower ||
                      x.title.toLowerCase().includes(lower) ||
                      section.title.toLowerCase().includes(lower))
                );
                const expandedNow = lower ? true : expanded[section.id] ?? false;
                const menuOpen = activeMenu === `sec-${section.id}`;

                return (
                  <div key={section.id} className="learning-side-section">
                    <div className="learning-side-section-header group/sec relative">
                      <button
                        className="learning-side-section-toggle"
                        aria-expanded={expandedNow}
                        aria-label={`${expandedNow ? 'Collapse' : 'Expand'} ${section.title}`}
                        onClick={() =>
                          setExpanded((x) => ({ ...x, [section.id]: !expandedNow }))
                        }
                      >
                        {expandedNow ? (
                          <ChevronDown size={14} className="shrink-0" />
                        ) : (
                          <ChevronRight size={14} className="shrink-0" />
                        )}
                        <span>{section.title}</span>
                        <small>{group.length}</small>
                      </button>

                      <div className="relative">
                        <button
                          aria-label={`Sidebar options for ${section.title}`}
                          aria-expanded={menuOpen}
                          onClick={() =>
                            setActiveMenu(menuOpen ? null : `sec-${section.id}`)
                          }
                          className="learning-menu-trigger opacity-0 group-hover/sec:opacity-100 transition mr-1"
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {menuOpen && (
                          <div className="learning-actions">
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                setDialog({
                                  type: 'rename_section',
                                  targetId: section.id,
                                  initialTitle: section.title,
                                });
                                setDialogInput(section.title);
                              }}
                            >
                              Rename section
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                setDialog({
                                  type: 'create_topic',
                                  sectionId: section.id,
                                });
                                setDialogInput('');
                              }}
                            >
                              Add topic
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                void reorderSection(section, -1);
                              }}
                            >
                              Move up
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenu(null);
                                void reorderSection(section, 1);
                              }}
                            >
                              Move down
                            </button>
                            <button
                              className="danger"
                              onClick={() => {
                                setActiveMenu(null);
                                void deleteSection(section);
                              }}
                            >
                              Delete section
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {expandedNow && (
                      <div className="learning-side-items">
                        {group.map(topicLink)}
                        <button
                          className="learning-side-add"
                          onClick={() => {
                            setDialog({
                              type: 'create_topic',
                              sectionId: section.id,
                            });
                            setDialogInput('');
                          }}
                        >
                          <Plus size={13} /> Topic
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {topicList.some((x) => !x.section_id) && (
                <div className="learning-side-section">
                  <p className="learning-side-other">Other Topics</p>
                  <div className="learning-side-items">
                    {topicList
                      .filter(
                        (x) =>
                          !x.section_id &&
                          (!lower || x.title.toLowerCase().includes(lower))
                      )
                      .map(topicLink)}
                    <button
                      className="learning-side-add"
                      onClick={() => {
                        setDialog({
                          type: 'create_topic',
                          sectionId: null,
                        });
                        setDialogInput('');
                      }}
                    >
                      <Plus size={13} /> Topic
                    </button>
                  </div>
                </div>
              )}

              <button
                className="learning-side-new"
                aria-label="Add section"
                onClick={() => {
                  setDialog({
                    type: 'create_section',
                  });
                  setDialogInput('');
                }}
              >
                <Plus size={14} /> Add section
              </button>
            </nav>
          ) : (
            <div className="learning-side-empty">
              <p>Select a subject to view its curriculum and notes.</p>
              <Link href="/learning">Browse library →</Link>
            </div>
          )}
        </aside>

        {/* Mobile backdrop */}
        {open && (
          <button
            aria-label="Close learning navigation"
            className="fixed inset-x-0 bottom-0 top-[54px] z-10 bg-black/40 backdrop-blur-xs lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Flexible Content Workspace */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Creation / Rename Dialog */}
      {dialog && (
        <div
          className="learning-dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setDialog(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-sidebar-dialog-title"
            className="learning-dialog"
          >
            <h2 id="learning-sidebar-dialog-title">
              {dialog.type === 'create_section'
                ? 'New Section'
                : dialog.type === 'create_topic'
                ? 'New Topic'
                : dialog.type === 'rename_section'
                ? 'Rename Section'
                : 'Rename Topic'}
            </h2>
            <p>
              {dialog.type === 'create_topic'
                ? `Under ${
                    sectionList.find((x) => x.id === dialog.sectionId)?.title ??
                    'Other topics'
                  }`
                : subject?.title}
            </p>
            <input
              autoFocus
              aria-label="Title"
              value={dialogInput}
              onChange={(e) => setDialogInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleDialogSubmit();
                if (e.key === 'Escape') setDialog(null);
              }}
              placeholder={
                dialog.type.includes('section')
                  ? 'e.g. Noise Filtering'
                  : 'e.g. Gaussian Filter'
              }
            />
            <div>
              <button onClick={() => setDialog(null)}>Cancel</button>
              <button
                disabled={dialogBusy || !dialogInput.trim()}
                onClick={() => void handleDialogSubmit()}
              >
                {dialogBusy
                  ? 'Saving…'
                  : dialog.type.startsWith('create')
                  ? 'Create'
                  : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
