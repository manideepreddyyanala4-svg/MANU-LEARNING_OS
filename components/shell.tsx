'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  BookOpen,
  Inbox,
  LayoutDashboard,
  Settings,
  BarChart3,
  Search,
  Plus,
  Sun,
  Moon,
  Briefcase,
  FolderOpen,
  ArrowRight,
  FileText,
  Menu,
  X,
  Target,
  LogOut,
  User,
  Lightbulb,
  Zap,
  ClipboardCheck,
  Compass,
  CalendarDays,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { loadRoadmap, type RoadmapItem } from '@/lib/store';
import { subjects, requireClient, type Subject, type Section, type Topic } from '@/lib/learning';
import type { Route } from 'next';
import { LearningShell } from '@/components/learning-shell';
import { SHOW_ASE_QUICK_PREP, SHOW_ASE_FINAL_DAY_PREP } from '@/lib/feature-flags';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  subtext: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Execution Workspace',
    items: [
      { href: '/', label: 'Home', icon: LayoutDashboard, subtext: 'Overview & Mission' },
      { href: '/life-vision', label: 'Life Vision', icon: Compass, subtext: 'My Values & Long-Term Direction' },
      ...(SHOW_ASE_FINAL_DAY_PREP
        ? [{ href: '/ase-final-day', label: 'ASE Final-Day', icon: ClipboardCheck, subtext: '100 Q&A · Today Only' }]
        : []),
      ...(SHOW_ASE_QUICK_PREP
        ? [{ href: '/ase-quick-prep', label: 'ASE Quick Prep', icon: Zap, subtext: 'Interview Quick Revision' }]
        : []),
      { href: '/learning', label: 'Learning', icon: BookOpen, subtext: 'Technical Curriculum' },
      { href: '/roadmap', label: 'Roadmap', icon: Target, subtext: 'Dorsal → Production AI' },
      { href: '/internship-sprint', label: 'Internship Sprint', icon: CalendarDays, subtext: '45-Day Hiring Campaign' },
      { href: '/job-preparation', label: 'Job Preparation', icon: Briefcase, subtext: 'Internship Pipeline' },
    ],
  },
  {
    title: 'Idea Vault',
    items: [
      { href: '/ideas', label: 'Ideas', icon: Lightbulb, subtext: 'Content & Future Ideas' },
    ],
  },
  {
    title: 'System & Utilities',
    items: [
      { href: '/files', label: 'Files', icon: FolderOpen, subtext: 'Documents & Storage' },
      { href: '/inbox', label: 'Inbox', icon: Inbox, subtext: 'Triage & Fast Capture' },
      { href: '/progress', label: 'Progress', icon: BarChart3, subtext: 'Telemetry & Signals' },
      { href: '/settings', label: 'Settings', icon: Settings, subtext: 'Preferences & Mission' },
    ],
  },
];

const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

type PaletteItem = {
  label: string;
  subtext?: string;
  icon?: typeof LayoutDashboard;
  action: () => void;
};

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [palette, setPalette] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [subjectItems, setSubjectItems] = useState<Subject[]>([]);
  const [sectionItems, setSectionItems] = useState<Section[]>([]);
  const [topicItems, setTopicItems] = useState<Topic[]>([]);

  // Close mobile drawer on route change
  useEffect(() => {
    const id = window.setTimeout(() => {
      setMobileMenuOpen(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [path]);

  // Keyboard shortcut for palette
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === 'Escape') {
        setPalette(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Populate palette items when opened
  useEffect(() => {
    if (palette) {
      loadRoadmap().then(setRoadmapItems).catch(() => {});
      subjects().then(setSubjectItems).catch(() => {});
      try {
        const client = requireClient();
        void client
          .from('learning_sections')
          .select('*')
          .then(({ data }) => setSectionItems((data ?? []) as Section[]), () => {});
        void client
          .from('topics')
          .select('*')
          .then(({ data }) => setTopicItems((data ?? []) as Topic[]), () => {});
      } catch {
        // ignore if not configured
      }
    }
  }, [palette]);

  if (path === '/login') return <>{children}</>;
  if (path === '/learning' || path.startsWith('/learning/')) {
    return <LearningShell>{children}</LearningShell>;
  }

  const current = roadmapItems.find((x) => x.is_current);

  // Build searchable commands
  const commands: PaletteItem[] = [
    // Navigation
    ...allNavItems.map(({ href, label, icon: Icon, subtext }) => ({
      label,
      subtext,
      icon: Icon,
      action: () => router.push(href as Route),
    })),
    // Theme toggle
    {
      label: 'Toggle Theme (Light / Dark)',
      subtext: 'Preference',
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    // Continue current roadmap
    ...(current
      ? [
          {
            label: `Continue: ${current.title}`,
            subtext: 'Roadmap current topic',
            action: () => router.push(`/roadmap/${current.slug}` as Route),
          },
        ]
      : []),
    // Subjects
    ...subjectItems.map((s) => ({
      label: s.title,
      subtext: 'Learning Subject',
      icon: BookOpen,
      action: () => router.push(`/learning/${s.slug}` as Route),
    })),
    // Topics with hierarchical subtext
    ...topicItems.map((t) => {
      const parentSub = subjectItems.find((s) => s.id === t.subject_id);
      const parentSec = sectionItems.find((s) => s.id === t.section_id);
      const hierarchy = [parentSub?.title, parentSec?.title]
        .filter(Boolean)
        .join(' › ');
      return {
        label: t.title,
        subtext: hierarchy ? `Topic · ${hierarchy}` : 'Topic',
        icon: FileText,
        action: () =>
          parentSub &&
          router.push(`/learning/${parentSub.slug}/${t.slug}` as Route),
      };
    }),
  ].filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtext && item.subtext.toLowerCase().includes(query.toLowerCase()))
  );

  function choose(i: number) {
    commands[i]?.action();
    setPalette(false);
    setQuery('');
  }

  return (
    <div className="manu-shell min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Desktop Main Navigation Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] px-4 py-5 lg:flex">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2.5 text-base font-extrabold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white text-xs font-black shadow-xs">
              M
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-[var(--fg)]">
                MANU<span className="text-[var(--accent)]">.</span>OS
              </span>
              <span className="text-[10px] font-semibold text-[var(--muted)]">Technical Learning</span>
            </div>
          </Link>
          <span className="rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[9px] font-bold text-[var(--accent)]">
            v2.0
          </span>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-6 overflow-y-auto pr-1">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {group.title}
              </p>
              <nav className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = path === href || (href !== '/' && path.startsWith(`${href}/`));
                  const quickPrep = href === '/ase-quick-prep' || href === '/ase-final-day';
                  return (
                    <Link
                      key={href}
                      href={href as Route}
                      className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                        active
                          ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                          : quickPrep
                            ? 'border border-[var(--accent-border)] bg-[var(--accent-subtle)]/70 text-[var(--accent)] hover:bg-[var(--accent-subtle)]'
                            : 'text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5 truncate">
                        <Icon
                          size={16}
                          className={
                            active
                              ? 'text-white'
                              : quickPrep
                                ? 'text-[var(--accent)]'
                                : 'text-[var(--muted)] group-hover:text-[var(--fg)]'
                          }
                        />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        {quickPrep && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                              active
                                ? 'bg-white/20 text-white'
                                : 'bg-[var(--surface)] text-[var(--accent)]'
                            }`}
                          >
                            {href === '/ase-final-day' ? 'Today' : 'Interview'}
                          </span>
                        )}
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-white/90" />}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="mt-auto space-y-2 border-t border-[var(--line)] pt-4">
          <Link
            href="/inbox#capture"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] py-2 text-xs font-semibold text-[var(--fg)] shadow-2xs transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={14} className="text-[var(--accent)]" /> Quick capture
          </Link>

          <button
            onClick={() => setPalette(true)}
            aria-label="Open command palette"
            className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)] shadow-2xs transition hover:border-color-mix(in srgb, var(--accent) 30%, var(--line)) hover:text-[var(--fg)]"
          >
            <span className="flex items-center gap-2">
              <Search size={13} /> Search
            </span>
            <kbd className="rounded border border-[var(--line)] bg-[var(--bg)] px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* User Status Strip */}
          <div className="flex items-center justify-between rounded-xl bg-[var(--surface)] p-2.5 border border-[var(--line)] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] font-bold text-[11px] shrink-0">
                M
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[var(--fg)] truncate leading-tight">
                  man@gmail.com
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold leading-tight">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>
            <Link
              href="/settings"
              aria-label="Account Settings"
              className="text-[var(--muted)] hover:text-[var(--fg)] transition p-1"
            >
              <Settings size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main OS Viewport */}
      <main className="pb-12 lg:ml-[250px]">
        {/* Sticky Topbar */}
        <header className="sticky top-0 z-20 flex h-[54px] items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/95 px-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] lg:hidden"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <Link href="/" className="text-sm font-black tracking-tight lg:hidden">
              MANU<span className="text-[var(--accent)]">.</span>OS
            </Link>

            {/* Breadcrumb / Active Context Indicator for Desktop */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <span>MANU OS</span>
              <span>/</span>
              <span className="text-[var(--fg)] font-bold capitalize">
                {allNavItems.find((n) => path === n.href || (n.href !== '/' && path.startsWith(`${n.href}/`)))?.label ?? 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[var(--muted)]">
            <button
              onClick={() => setPalette(true)}
              aria-label="Search"
              className="hidden sm:flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--fg)] transition"
            >
              <Search size={13} />
              <span>Search workspace…</span>
              <kbd className="rounded border border-[var(--line)] bg-[var(--bg)] px-1 py-0.2 text-[10px] font-mono">⌘K</kbd>
            </button>

            <button
              onClick={() => setPalette(true)}
              aria-label="Search"
              className="grid sm:hidden h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)]"
            >
              <Search size={15} />
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] transition"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link
              href="/settings"
              aria-label="Settings"
              className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] transition"
            >
              <Settings size={15} />
            </Link>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-y-0 left-0 w-[280px] bg-[var(--surface)] p-5 shadow-2xl flex flex-col border-r border-[var(--line)]"
          >
            <div className="flex items-center justify-between pb-5 border-b border-[var(--line)]">
              <Link href="/" className="flex items-center gap-2 font-black text-base text-[var(--fg)]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white text-xs">
                  M
                </div>
                <span>MANU<span className="text-[var(--accent)]">.</span>OS</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-5 overflow-y-auto flex-1">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    {group.title}
                  </p>
                  <nav className="space-y-1">
                    {group.items.map(({ href, label, icon: Icon }) => {
                      const active = path === href || (href !== '/' && path.startsWith(`${href}/`));
                      const quickPrep = href === '/ase-quick-prep' || href === '/ase-final-day';
                      return (
                        <Link
                          key={href}
                          href={href as Route}
                          className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                            active
                              ? 'bg-[var(--accent)] text-white font-bold'
                              : quickPrep
                                ? 'border border-[var(--accent-border)] bg-[var(--accent-subtle)]/70 text-[var(--accent)]'
                                : 'text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)] dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon size={16} />
                            <span>{label}</span>
                          </span>
                          {quickPrep && (
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                                active
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[var(--surface)] text-[var(--accent)]'
                              }`}
                            >
                              {href === '/ase-final-day' ? 'Today' : 'Interview'}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--line)] space-y-2">
              <Link
                href="/inbox#capture"
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-xs font-semibold text-white shadow-xs"
              >
                <Plus size={14} /> Quick capture
              </Link>
              <div className="flex items-center justify-between px-2 text-xs text-[var(--muted)] pt-2">
                <span>Signed in as man@gmail.com</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette (⌘K) */}
      {palette && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 grid place-items-start bg-black/45 backdrop-blur-xs p-4 pt-[12vh]"
          onClick={() => setPalette(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(e) => e.stopPropagation()}
            className="mx-auto w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xl"
          >
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                autoFocus
                aria-label="Search commands"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActive((active + 1) % Math.max(commands.length, 1));
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActive(
                      (active - 1 + Math.max(commands.length, 1)) %
                        Math.max(commands.length, 1)
                    );
                  }
                  if (e.key === 'Enter') choose(active);
                }}
                placeholder="Search anything or jump to…"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] py-3 pl-10 pr-4 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              />
            </div>

            <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-[var(--line-subtle)]">
              {commands.map((x, i) => (
                <button
                  key={`${x.label}-${i}`}
                  onClick={() => choose(i)}
                  className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs transition ${
                    i === active
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--fg)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate font-medium">{x.label}</p>
                    {x.subtext && (
                      <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
                        {x.subtext}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={13} className="shrink-0 opacity-40" />
                </button>
              ))}

              {!commands.length && (
                <p className="py-6 text-center text-xs text-[var(--muted)]">
                  No matching commands or learning topics.
                </p>
              )}
            </div>

            <div className="mt-3 border-t border-[var(--line)] pt-2.5 text-right text-[11px] text-[var(--muted)]">
              Navigate with <kbd className="font-mono">↑</kbd>{' '}
              <kbd className="font-mono">↓</kbd> · Select with{' '}
              <kbd className="font-mono">↵</kbd> · Close with{' '}
              <kbd className="font-mono">esc</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
