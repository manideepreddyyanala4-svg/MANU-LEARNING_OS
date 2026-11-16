'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  BookOpen,
  Inbox,
  LayoutDashboard,
  Wallet,
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
  Code2,
  Compass,
  CalendarDays,
  ChevronDown,
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
  /** Primary group is always visible; others are collapsible and open only when they contain the current page. */
  primary?: boolean;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Study',
    primary: true,
    items: [
      { href: '/study-now', label: 'Study Now', icon: Target, subtext: 'Current lesson, next lesson, full path' },
      { href: '/learning', label: 'Learning', icon: BookOpen, subtext: 'Your notes and technical curriculum' },
      { href: '/python-lab', label: 'Python Lab', icon: Code2, subtext: 'Run and verify Python' },
      { href: '/roadmap', label: 'Roadmap', icon: Compass, subtext: 'Internship preparation tracks' },
    ],
  },
  {
    title: 'Career',
    items: [
      { href: '/internship-sprint', label: 'Internship Sprint', icon: CalendarDays, subtext: '45-day hiring campaign' },
      { href: '/job-preparation', label: 'Job Preparation', icon: Briefcase, subtext: 'Internship pipeline' },
      ...(SHOW_ASE_FINAL_DAY_PREP
        ? [{ href: '/ase-final-day', label: 'ASE Final-Day', icon: ClipboardCheck, subtext: '100 Q&A, today only' }]
        : []),
      ...(SHOW_ASE_QUICK_PREP
        ? [{ href: '/ase-quick-prep', label: 'ASE Quick Prep', icon: Zap, subtext: 'Interview quick revision' }]
        : []),
    ],
  },
  {
    title: 'Personal',
    items: [
      { href: '/', label: 'Home', icon: LayoutDashboard, subtext: 'Overview and mission' },
      { href: '/life-vision', label: 'Life Vision', icon: Compass, subtext: 'Values and long-term direction' },
      { href: '/bhagavad-gita', label: 'Bhagavad Gita', icon: BookOpen, subtext: 'Chapter 1 reading' },
      { href: '/finance', label: 'Finance', icon: Wallet, subtext: 'Accounts and balances' },
      { href: '/ideas', label: 'Ideas', icon: Lightbulb, subtext: 'Content and future ideas' },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/files', label: 'Files', icon: FolderOpen, subtext: 'Documents and storage' },
      { href: '/inbox', label: 'Inbox', icon: Inbox, subtext: 'Triage and fast capture' },
      { href: '/progress', label: 'Progress', icon: BarChart3, subtext: 'Progress and signals' },
      { href: '/settings', label: 'Settings', icon: Settings, subtext: 'Preferences and mission' },
    ],
  },
];

function isActivePath(path: string, href: string) {
  return path === href || (href !== '/' && path.startsWith(`${href}/`));
}

function NavLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <div className="space-y-5">
      {navGroups.map((group) => (
        <NavSection key={group.title} group={group} path={path} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function NavSection({ group, path, onNavigate }: { group: NavGroup; path: string; onNavigate?: () => void }) {
  const containsActive = group.items.some((item) => isActivePath(path, item.href));
  // A section is open when the user toggled it, otherwise when it holds the current page.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? (group.primary || containsActive);
  const list = (
    <nav aria-label={group.title} className="space-y-0.5">
      {group.items.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(path, href);
        return (
          <Link
            key={href}
            href={href as Route}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-10 items-center gap-2.5 rounded-lg border-l-[3px] px-2.5 py-2 text-sm transition ${
              active
                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] font-semibold text-[var(--accent)]'
                : 'border-transparent font-medium text-[var(--muted)] hover:bg-[var(--line-subtle)] hover:text-[var(--fg)]'
            }`}
          >
            <Icon size={17} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
  if (group.primary) return list;
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setUserOpen(!open)}
        className="flex min-h-10 w-full items-center justify-between rounded-lg px-2.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
      >
        <span>{group.title}</span>
        <ChevronDown size={15} aria-hidden="true" className={open ? 'rotate-180' : ''} />
      </button>
      {open && <div className="mt-1">{list}</div>}
    </div>
  );
}

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
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [palette, setPalette] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [subjectItems, setSubjectItems] = useState<Subject[]>([]);
  const [sectionItems, setSectionItems] = useState<Section[]>([]);
  const [topicItems, setTopicItems] = useState<Topic[]>([]);

  // Close mobile drawer on route change; leaving a page also leaves Focus Mode so navigation is never hidden by accident.
  useEffect(() => {
    document.documentElement.classList.remove('focus-mode');
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
      action: () => setTheme(isDark ? 'light' : 'dark'),
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

  const currentLabel = allNavItems.find((n) => isActivePath(path, n.href))?.label ?? 'Workspace';

  return (
    <div className="manu-shell min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--fg)] focus:shadow-md"
      >
        Skip to content
      </a>

      {/* Desktop navigation */}
      <aside
        aria-label="Main navigation"
        className="fixed inset-y-0 left-0 hidden w-[240px] flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] px-3 py-5 lg:flex"
      >
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2 text-[var(--fg)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-[var(--on-accent)]">M</span>
          <span className="text-sm font-bold tracking-tight">MANU Learning OS</span>
        </Link>

        <div className="flex-1 overflow-y-auto pr-1">
          <NavLinks path={path} />
        </div>

        <div className="mt-4 border-t border-[var(--line)] pt-3">
          <Link
            href="/inbox#capture"
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--line-subtle)] hover:text-[var(--fg)]"
          >
            <Plus size={17} aria-hidden="true" /> Quick capture
          </Link>
        </div>
      </aside>

      {/* Main viewport */}
      <main id="main-content" className="pb-12 lg:ml-[240px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[var(--bg)] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--fg)] lg:hidden"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-sm font-semibold text-[var(--fg)]">{currentLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--muted)] hover:text-[var(--fg)]"
            >
              <Search size={16} aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Search</span>
              <kbd aria-hidden="true" className="hidden rounded border border-[var(--line)] bg-[var(--bg)] px-1.5 text-xs font-mono sm:inline">⌘K</kbd>
            </button>
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle light or dark theme"
              className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)]"
            >
              <Sun size={17} aria-hidden="true" className="hidden dark:block" />
              <Moon size={17} aria-hidden="true" className="dark:hidden" />
            </button>
          </div>
        </header>

        {children}
      </main>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-y-0 left-0 flex w-[min(300px,88vw)] flex-col border-r border-[var(--line)] bg-[var(--sidebar)] p-4 shadow-lg"
          >
            <div className="flex items-center justify-between pb-4">
              <Link href="/" className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-[var(--on-accent)]">M</span>
                MANU Learning OS
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="grid h-11 w-11 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--line-subtle)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavLinks path={path} onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <div className="mt-3 border-t border-[var(--line)] pt-3">
              <Link
                href="/inbox#capture"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--line-subtle)]"
              >
                <Plus size={17} aria-hidden="true" /> Quick capture
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette (⌘K) */}
      {palette && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 grid place-items-start bg-black/40 p-4 pt-[12vh]"
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
                      : 'text-[var(--fg)] hover:bg-[var(--line-subtle)]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate font-medium">{x.label}</p>
                    {x.subtext && (
                      <p className="text-xs text-[var(--muted)] truncate mt-0.5">
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

            <div className="mt-3 border-t border-[var(--line)] pt-2.5 text-right text-xs text-[var(--muted)]">
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
