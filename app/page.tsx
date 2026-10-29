'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Target,
  Plus,
  Send,
  Sparkles,
  Layers,
  ChevronRight,
  Check,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { Page, Card, Empty } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { INTERNSHIP_PLAN } from '@/lib/career-plan';
import { subjects, type Subject, type Topic } from '@/lib/learning';
import {
  loadPriorities,
  loadRoadmap,
  loadSettings,
  type Priority,
  type RoadmapItem,
  type SettingsData,
} from '@/lib/store';

type Event = {
  id: string;
  event_type: string;
  created_at: string;
  metadata: Record<string, string>;
};

export default function Home() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [subjectItems, setSubjectItems] = useState<Subject[]>([]);
  const [topicCount, setTopicCount] = useState(0);
  const [appsSummary, setAppsSummary] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  // Quick capture state on Home
  const [quickText, setQuickText] = useState('');
  const [quickType, setQuickType] = useState('question');
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [s, p, r] = await Promise.all([
          loadSettings(),
          loadPriorities(),
          loadRoadmap(),
        ]);
        const client = createClient();
        if (client) {
          const [actRes, subsRes, topRes, appRes] = await Promise.all([
            client
              .from('activity_events')
              .select('id,event_type,created_at,metadata')
              .order('created_at', { ascending: false })
              .limit(5),
            subjects().catch(() => [] as Subject[]),
            client
              .from('topics')
              .select('*', { count: 'exact' })
              .order('updated_at', { ascending: false })
              .limit(5),
            client.from('applications').select('status'),
          ]);

          if (active) {
            setSubjectItems(subsRes);
            setRecentTopics((topRes.data ?? []) as Topic[]);
            setTopicCount(topRes.count ?? 0);
            setEvents((actRes.data ?? []) as Event[]);

            if (appRes.data) {
              const counts: Record<string, number> = {};
              appRes.data.forEach((a: { status: string }) => {
                counts[a.status] = (counts[a.status] ?? 0) + 1;
              });
              setAppsSummary(counts);
            }
          }
        }

        if (active) {
          setSettings(s);
          setPriorities(p);
          setRoadmap(r);
        }
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : 'Unable to load workspace data');
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleQuickCapture(e: React.FormEvent) {
    e.preventDefault();
    const text = quickText.trim();
    if (!text || quickSaving) return;
    setQuickSaving(true);
    try {
      const client = createClient();
      if (client) {
        const {
          data: { user },
        } = await client.auth.getUser();
        if (user) {
          await client.from('inbox_items').insert({
            user_id: user.id,
            text,
            type: quickType,
          });
          await client.from('activity_events').insert({
            user_id: user.id,
            event_type: 'inbox_created',
            metadata: { text: text.slice(0, 50) },
          });
        }
      }
      setQuickText('');
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 2500);
    } catch {
      // ignore
    } finally {
      setQuickSaving(false);
    }
  }

  const current = roadmap.find((x) => x.is_current);
  const completed = roadmap.filter((x) => x.status === 'completed').length;
  const inPipelineCount =
    (appsSummary.applied ?? 0) +
    (appsSummary.screening ?? 0) +
    (appsSummary.interview ?? 0);

  return (
    <Page
      eyebrow="Personal Operating System"
      title="Workspace Overview"
      subtitle="Execution engine for technical mastery, career preparation, and engineering study."
    >
      {/* Current career priority — applications first, ASE resources preserved */}
      <section className="mb-6 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-[var(--surface)] to-indigo-500/10 p-6 shadow-sm md:p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
          Active Career Plan · From October 29, 2026
        </p>
        <h2 className="mt-3 max-w-4xl text-2xl font-black leading-tight text-[var(--fg)] md:text-3xl">
          {INTERNSHIP_PLAN.mission}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Applications and relevant experience come first. Build strong evidence through your existing
          research, Python, computer vision and software projects. Target desk-based technical roles,
          not equipment maintenance or rotating factory shifts.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/job-preparation" className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white">
            Open Internship Applications →
          </Link>
          <Link href="/settings" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--fg)]">
            Activate Plan in Settings
          </Link>
          <Link href="/job-preparation/ase-archive" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--muted)]">
            ASE Interview · Saved for Later
          </Link>
        </div>
      </section>

      {/* Personal Why — long-term motivation */}
      <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-rose-500/25 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl">
        <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative px-6 py-8 md:px-10 md:py-11 lg:px-12 lg:py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-100 backdrop-blur">
            <Heart size={13} />
            Why I am here
          </div>

          <div className="mt-5 max-w-5xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-300">
              Taiwan → Build → Earn → Return Stronger
            </p>
            <h2 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              I CAME HERE TO BUILD A LIFE —
              <span className="block bg-gradient-to-r from-rose-300 via-amber-200 to-sky-300 bg-clip-text text-transparent">
                NOT TO WASTE ONE.
              </span>
            </h2>
            <p className="mt-5 max-w-4xl text-sm font-semibold leading-7 text-slate-300 md:text-base">
              I came to Taiwan to build my career, earn well, become independent, and go back to India stronger — to be with my mother, father, sister, and family with something real to show for these years.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-rose-300/20 bg-white/[0.07] p-5 backdrop-blur">
              <div className="flex items-center gap-2 text-rose-200">
                <Heart size={17} />
                <p className="text-[11px] font-black uppercase tracking-[0.16em]">
                  My family is the reason
                </p>
              </div>
              <p className="mt-3 text-2xl font-black tracking-tight text-white">
                MOTHER • FATHER • SISTER • FAMILY
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                The goal is not to look successful. The goal is to build a career, financial strength, and freedom that lets me take care of the people who matter most.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.08] p-5 backdrop-blur">
              <div className="flex items-center gap-2 text-emerald-200">
                <ShieldCheck size={17} />
                <p className="text-[11px] font-black uppercase tracking-[0.16em]">
                  My promise from today
                </p>
              </div>
              <p className="mt-3 text-3xl font-black tracking-tight text-white">
                NO ALCOHOL. NO EXCUSES.
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                From today, I do not drink. My focus, health, money, work, and future come first. No wasted nights. No self-sabotage.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-5 border-t border-white/10 pt-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="max-w-3xl text-xl font-black leading-8 text-white md:text-2xl">
                “I can celebrate later. First, I build the life I came here for.”
              </p>
              <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Career • Money • Family • Freedom
              </p>
            </div>

            <Link
              href="/job-preparation"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              Start today&apos;s work <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600 dark:bg-red-950/20">
          {error}
        </p>
      )}

      {/* North Star — fixed long-term goal */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-fuchsia-500/15 shadow-sm">
        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              <Target size={13} />
              North Star
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--fg)] md:text-5xl">
              ₹1 CRORE / YEAR
            </h2>
            <p className="mt-2 text-base font-extrabold text-[var(--fg)] md:text-lg">
              Reach this earning level within 5–7 years.
            </p>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)]">
              Every career decision should move toward deep technical skill, strong engineering experience, international mobility and higher-value AI roles.
            </p>
          </div>

          <div className="grid min-w-[250px] grid-cols-3 gap-2">
            {[
              ['HEALTH', 'Protect it'],
              ['FOOD', 'Fuel yourself'],
              ['STUDY', 'Keep growing'],
            ].map(([title, note]) => (
              <div
                key={title}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/80 px-3 py-4 text-center shadow-2xs backdrop-blur"
              >
                <p className="text-xs font-black tracking-wider text-[var(--fg)]">{title}</p>
                <p className="mt-1 text-[10px] font-semibold text-[var(--muted)]">{note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--line)] bg-[var(--surface)]/55 px-5 py-3 text-center md:px-7">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--fg)]">
            Everything else can come and go. Health • Food • Study stay the foundation.
          </p>
        </div>
      </section>

      {/* Career Focus Lock — intentionally the first thing visible on Home */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[var(--surface)] to-violet-500/10 shadow-sm">
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-5 py-4 md:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white shadow-sm">
                <Target size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                  Career Focus Lock
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--fg)] md:text-3xl">
                  INTERNSHIP APPLICATIONS FIRST. TWO STRONG PROJECTS.
                </h2>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[var(--muted)]">
                  Start with real internship applications and recruiter follow-ups. Protect the two existing projects as proof of technical skill; do not add a third project instead of applying.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
              Depth &gt; Quantity
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 md:p-7">
          <Link
            href="/roadmap/production-ai"
            className="group rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/12 to-emerald-500/8 p-5 transition hover:-translate-y-0.5 hover:border-sky-500/50 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-white">
                <Layers size={18} />
              </div>
              <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Project 1
              </span>
            </div>
            <h3 className="mt-4 text-xl font-black text-[var(--fg)]">
              Dorsal-Hand Verification → Production AI
            </h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              Research depth + real engineering
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              First understand every important part of the model and every architecture change. Finish the research properly, then take the final model through clean inference, ONNX, FastAPI, PostgreSQL, Docker, testing, CI/CD and AWS.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['Understand', 'Research', 'ONNX', 'API', 'SQL', 'Docker', 'AWS'].map((item) => (
                <span key={item} className="rounded-lg border border-sky-500/20 bg-sky-500/8 px-2 py-1 text-[10px] font-bold text-[var(--fg)]">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-sky-700 dark:text-sky-300">
              Open full roadmap <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </p>
          </Link>

          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/12 to-fuchsia-500/8 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500 text-white">
                <Sparkles size={18} />
              </div>
              <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
                Project 2
              </span>
            </div>
            <h3 className="mt-4 text-xl font-black text-[var(--fg)]">
              Agent Reliability Lab
            </h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              RAG + Agents + Evaluation + AI Security
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Build the RAG system yourself first, improve and compare retrieval versions, then add tool-calling agents. Your differentiator is proving when the system works or fails using groundedness, citations, hallucination, tool accuracy, latency, cost and security tests.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['RAG', 'pgvector', 'Agents', 'Tools', 'Evaluation', 'Security', 'Deploy'].map((item) => (
                <span key={item} className="rounded-lg border border-violet-500/20 bg-violet-500/8 px-2 py-1 text-[10px] font-bold text-[var(--fg)]">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs font-extrabold text-violet-700 dark:text-violet-300">
              Start only after Project 1 research is stable and the production path is underway.
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[var(--line)] bg-[var(--bg)]/45 px-5 py-4 text-xs md:grid-cols-3 md:px-7">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="leading-5 text-[var(--fg)]">
              <strong>Understand before adding:</strong> know what each layer, tool and technology actually does.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="leading-5 text-[var(--fg)]">
              <strong>Build before collecting:</strong> no random courses, frameworks or certificates without a project need.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="leading-5 text-[var(--fg)]">
              <strong>New idea rule:</strong> capture it in Inbox if needed, but do not change these two flagship projects.
            </p>
          </div>
        </div>
      </section>

      {/* Top Mission & Direction Hero */}
      <section className="mb-8 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
              <Target size={13} /> Mission Objective
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[var(--fg)] md:text-3xl lg:text-4xl">
              {settings?.mission && !/\b(ase|pte)\b|interview/i.test(settings.mission) ? settings.mission : INTERNSHIP_PLAN.mission}
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--muted)]">
              Internship applications first. Build a relevant AI / CV / software career; ASE PTE interview preparation is saved for later.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 font-semibold text-[var(--fg)]">
                Mode: <span className="text-[var(--accent)]">{settings?.current_mode && !/\b(ase|pte)\b|interview/i.test(settings.current_mode) ? settings.current_mode : INTERNSHIP_PLAN.current_mode}</span>
              </span>
              <span className="hidden sm:inline text-[var(--muted)]">·</span>
              <span className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 font-semibold text-[var(--muted)]">
                Protocol: <span className="text-[var(--fg)]">Paper → ChatGPT → MANU Learning OS</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 lg:flex-col lg:items-end shrink-0">
            <Link
              href="/learning"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)]"
            >
              Resume Study <ArrowRight size={14} />
            </Link>
            <Link
              href="/job-preparation"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition hover:border-[var(--accent)]"
            >
              <Briefcase size={14} /> Track Applications
            </Link>
          </div>
        </div>
      </section>

      {/* Main Workspace 2-Column Composition */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Primary Column: Study & Priorities (8 cols) */}
        <div className="space-y-8 lg:col-span-8">
          {/* Active Milestone & Roadmap Progress */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2.5">
                <Compass size={16} className="text-[var(--accent)]" />
                <h3 className="text-sm font-bold text-[var(--fg)]">Active Roadmap Milestone</h3>
              </div>
              <span className="text-xs font-semibold text-[var(--muted)]">
                {completed} of {roadmap.length} milestones mastered
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  Current Execution Focus
                </p>
                <h4 className="mt-1 text-xl font-extrabold text-[var(--fg)]">
                  {current?.title ?? 'Technical Curriculum Synthesis'}
                </h4>
                <p className="mt-1 text-xs text-[var(--muted)] max-w-lg">
                  Continuous lesson authoring, algorithm implementation, and mathematical note consolidation.
                </p>
              </div>

              {current ? (
                <Link
                  href={`/roadmap/${current.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-subtle)] px-3.5 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition shrink-0"
                >
                  Continue Milestone <ArrowRight size={13} />
                </Link>
              ) : (
                <Link
                  href="/learning"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-subtle)] px-3.5 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition shrink-0"
                >
                  Browse Library <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] font-semibold text-[var(--muted)] mb-1.5">
                <span>Curriculum Completion</span>
                <span>{roadmap.length ? Math.round((completed / roadmap.length) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--line)] overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
                  style={{ width: `${roadmap.length ? (completed / roadmap.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recent Lessons Table */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--fg)]">Recent Curriculum Lessons</h3>
                <p className="text-xs text-[var(--muted)]">Quickly continue your study notes and revisions.</p>
              </div>
              <Link
                href="/learning"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                View all ({topicCount}) <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-4">
              {recentTopics.length ? (
                <div className="divide-y divide-[var(--line-subtle)]">
                  {recentTopics.map((topic, i) => {
                    const parent = subjectItems.find((s) => s.id === topic.subject_id);
                    return (
                      <Link
                        key={topic.id}
                        href={parent ? `/learning/${parent.slug}/${topic.slug}` : '/learning'}
                        className="group flex items-center justify-between py-3 px-2 rounded-xl transition hover:bg-[var(--bg)]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold text-[var(--muted)] group-hover:text-[var(--accent)]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--fg)] group-hover:text-[var(--accent)] truncate">
                              {topic.title}
                            </p>
                            <span className="text-[11px] text-[var(--muted)]">
                              {parent?.title ?? 'Subject'} · Updated {new Date(topic.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] capitalize">
                            {topic.status.replace('_', ' ')}
                          </span>
                          <ChevronRight size={14} className="text-[var(--muted)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Empty
                  icon={<BookOpen size={18} />}
                  title="No lessons created yet"
                  description="Start building your technical knowledge by creating your first subject and lesson."
                  action={
                    <Link
                      href="/learning"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs"
                    >
                      <Plus size={14} /> Open Learning Library
                    </Link>
                  }
                />
              )}
            </div>
          </div>

          {/* Core Priorities Checklist */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--fg)]">Operating Priorities</h3>
                <p className="text-xs text-[var(--muted)]">Ranked order of focus during daily execution.</p>
              </div>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Discipline
              </span>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {(priorities.length
                ? priorities
                : [
                    ...INTERNSHIP_PLAN.priorities.map((title, i) => ({ id: String(i + 1), title })),
                  ]
              ).map((x, i) => (
                <div
                  key={x.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[var(--surface)] font-mono font-bold text-[var(--accent)] shadow-2xs">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-[var(--fg)]">{x.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Secondary Column: Telemetry & Capture (4 cols) */}
        <div className="space-y-8 lg:col-span-4">
          {/* Quick Capture Card */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--fg)]">Fast Capture</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Inbox
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Instantly record study questions, tasks, or insights.
            </p>

            <form onSubmit={handleQuickCapture} className="mt-4 space-y-3">
              <input
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder="What's on your mind? (Enter to save)"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-xs text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              />

              <div className="flex items-center justify-between">
                <select
                  value={quickType}
                  onChange={(e) => setQuickType(e.target.value)}
                  className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)] outline-none"
                >
                  <option value="question">Question</option>
                  <option value="learn_later">Learn Later</option>
                  <option value="reminder">Reminder</option>
                  <option value="idea">Idea</option>
                </select>

                <button
                  type="submit"
                  disabled={!quickText.trim() || quickSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-40"
                >
                  {quickSuccess ? (
                    <>
                      <Check size={13} /> Saved
                    </>
                  ) : (
                    <>
                      <Send size={12} /> Capture
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Internship Pipeline Telemetry */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-[var(--fg)]">Internship Pipeline</h3>
              </div>
              <Link
                href="/job-preparation"
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Manage →
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5">
                <p className="text-2xl font-black text-[var(--fg)]">{inPipelineCount}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Active Pipeline
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <p className="text-2xl font-black text-emerald-600">{appsSummary.offer ?? 0}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Offers Received
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--line-subtle)]">
                <span className="text-[var(--muted)]">Screening</span>
                <span className="font-bold text-[var(--fg)]">{appsSummary.screening ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[var(--line-subtle)]">
                <span className="text-[var(--muted)]">Technical Interviews</span>
                <span className="font-bold text-[var(--fg)]">{appsSummary.interview ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[var(--muted)]">Saved Opportunities</span>
                <span className="font-bold text-[var(--fg)]">{appsSummary.saved ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Workflow Protocol Reference */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--fg)]">Study Protocol Standard</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Workflow
              </span>
            </div>
            <div className="mt-3 space-y-2.5 text-xs text-[var(--muted)]">
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center font-bold text-[10px] text-[var(--accent)] shrink-0">1</span>
                <span><strong>Paper First:</strong> Draft raw mathematical proofs, diagrams, and code snippets on paper.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center font-bold text-[10px] text-[var(--accent)] shrink-0">2</span>
                <span><strong>ChatGPT Synthesis:</strong> Refine technical accuracy and verify intuition with LLM prompts.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center font-bold text-[10px] text-[var(--accent)] shrink-0">3</span>
                <span><strong>MANU OS Commit:</strong> Store canonical, distraction-free notes into your learning library.</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[var(--muted)]" />
                <h3 className="text-sm font-bold text-[var(--fg)]">System Activity</h3>
              </div>
            </div>
            <div className="mt-3">
              {events.length ? (
                <ul className="space-y-3 text-xs">
                  {events.map((x) => (
                    <li key={x.id} className="flex items-center justify-between border-b border-[var(--line-subtle)] pb-2 last:border-0">
                      <span className="font-semibold text-[var(--fg)] capitalize truncate">
                        {x.event_type.replaceAll('_', ' ')}
                      </span>
                      <span className="text-[11px] text-[var(--muted)] shrink-0 ml-2">
                        {new Date(x.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-xs text-[var(--muted)]">
                  Activity events will appear here as you study.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
