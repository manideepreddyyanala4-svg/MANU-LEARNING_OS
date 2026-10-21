'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Flame,
  Layers,
  Sparkles,
  TrendingUp,
  Target,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { Page, Card, Empty } from '@/components/ui';
import { loadRoadmap, type RoadmapItem } from '@/lib/store';
import { requireClient, subjects, type Subject, type Topic } from '@/lib/learning';

export default function ProgressPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [topicsList, setTopicsList] = useState<Topic[]>([]);
  const [appsCount, setAppsCount] = useState<Record<string, number>>({});
  const [totalApps, setTotalApps] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [r, s] = await Promise.all([loadRoadmap(), subjects()]);
        setItems(r);
        setSubjectsList(s);
        const client = requireClient();
        const [topRes, appRes] = await Promise.all([
          client.from('topics').select('id,title,status,subject_id'),
          client.from('applications').select('id,status'),
        ]);
        if (topRes.data) setTopicsList(topRes.data as Topic[]);
        if (appRes.data) {
          const counts: Record<string, number> = {};
          appRes.data.forEach((a: { status: string }) => {
            counts[a.status] = (counts[a.status] ?? 0) + 1;
          });
          setAppsCount(counts);
          setTotalApps(appRes.data.length);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load progress telemetry');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completedMilestones = items.filter((x) => x.status === 'completed').length;
  const currentMilestone = items.find((x) => x.is_current);

  const statusCounts = useMemo(() => ({
    mastered: topicsList.filter((t) => t.status === 'mastered').length,
    understood: topicsList.filter((t) => t.status === 'understood').length,
    learning: topicsList.filter((t) => t.status === 'learning').length,
    not_started: topicsList.filter((t) => t.status === 'not_started').length,
  }), [topicsList]);

  const totalTopics = topicsList.length || 1;
  const masteryPercentage = Math.round((statusCounts.mastered / totalTopics) * 100);
  const activePipelineCount = (appsCount.interview ?? 0) + (appsCount.screening ?? 0) + (appsCount.offer ?? 0);

  // Subject breakdown calculations
  const subjectBreakdown = useMemo(() => {
    return subjectsList.map((sub) => {
      const subTopics = topicsList.filter((t) => t.subject_id === sub.id);
      const total = subTopics.length;
      const mastered = subTopics.filter((t) => t.status === 'mastered').length;
      const understood = subTopics.filter((t) => t.status === 'understood').length;
      const inProgress = subTopics.filter((t) => t.status === 'learning').length;
      const notStarted = subTopics.filter((t) => t.status === 'not_started').length;
      const pct = total > 0 ? Math.round(((mastered + understood * 0.5) / total) * 100) : 0;
      return {
        ...sub,
        total,
        mastered,
        understood,
        inProgress,
        notStarted,
        pct,
      };
    });
  }, [subjectsList, topicsList]);

  return (
    <Page
      eyebrow="Objective Signals"
      title="Progress & Telemetry"
      subtitle="Real telemetry across technical curriculum mastery, milestone roadmaps, and internship pipeline."
    >
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Top Level Metric Cards */}
      <section className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Curriculum Mastery</span>
            <BookOpen size={16} className="text-[var(--accent)]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--fg)]">{statusCounts.mastered}</span>
            <span className="text-xs font-semibold text-[var(--muted)]">/ {topicsList.length} lessons</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{masteryPercentage}%</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Roadmap Milestones</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--fg)]">{completedMilestones}</span>
            <span className="text-xs font-semibold text-[var(--muted)]">/ {items.length} completed</span>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)] truncate">
            Current: <span className="font-semibold text-[var(--fg)]">{currentMilestone?.title ?? 'Technical Study'}</span>
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Career Pipeline</span>
            <Briefcase size={16} className="text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[var(--fg)]">{activePipelineCount}</span>
            <span className="text-xs font-semibold text-[var(--muted)]">/ {totalApps} total</span>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            {appsCount.interview ?? 0} in interview, {appsCount.offer ?? 0} offers
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Operating Protocol</span>
            <Target size={16} className="text-amber-500" />
          </div>
          <p className="mt-3 text-sm font-bold text-[var(--fg)]">Paper → ChatGPT → MANU OS</p>
          <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
            Internship first. Zero startup research until objective is achieved.
          </p>
        </Card>
      </section>

      {/* Full Workspace Grid: 8 Cols Curriculum & Roadmap + 4 Cols Distribution & Funnel */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols): Subject-by-Subject Curriculum Mastery & Roadmap */}
        <section className="lg:col-span-8 space-y-6">
          {/* Subject Mastery Table */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--fg)]">Curriculum Subject Breakdown</h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Mastery telemetry across each technical domain.
                </p>
              </div>
              <Link
                href="/learning"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                <span>Open Curriculum</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-[var(--line-subtle)]">
              {subjectBreakdown.map((sub) => (
                <div key={sub.id} className="py-4 first:pt-2 last:pb-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/learning/${sub.slug}`}
                        className="text-sm font-bold text-[var(--fg)] hover:text-[var(--accent)] transition"
                      >
                        {sub.title}
                      </Link>
                      <p className="text-xs text-[var(--muted)] line-clamp-1">{sub.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[var(--fg)]">{sub.total} {sub.total === 1 ? 'topic' : 'topics'}</span>
                      <span className="ml-2 rounded-md bg-[var(--accent-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--accent)]">
                        {sub.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="mt-3">
                    <div className="flex h-2 w-full rounded-full bg-[var(--line)] overflow-hidden">
                      {sub.total > 0 && (
                        <>
                          <div
                            title={`Mastered: ${sub.mastered}`}
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(sub.mastered / sub.total) * 100}%` }}
                          />
                          <div
                            title={`Understood: ${sub.understood}`}
                            className="bg-blue-500 h-full"
                            style={{ width: `${(sub.understood / sub.total) * 100}%` }}
                          />
                          <div
                            title={`In Progress: ${sub.inProgress}`}
                            className="bg-amber-500 h-full"
                            style={{ width: `${(sub.inProgress / sub.total) * 100}%` }}
                          />
                        </>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--muted)]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {sub.mastered} Mastered
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> {sub.understood} Understood
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {sub.inProgress} Learning
                        </span>
                      </div>
                      <span>{sub.notStarted} Not Started</span>
                    </div>
                  </div>
                </div>
              ))}

              {!subjectBreakdown.length && (
                <div className="py-8 text-center text-xs text-[var(--muted)]">
                  No curriculum subjects found. Create subjects in the Learning workspace.
                </div>
              )}
            </div>
          </div>

          {/* Technical Roadmap Milestones List */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--fg)]">Roadmap Milestone Sequence</h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Step-by-step milestones to secure technical internship readiness.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {items.map((item, idx) => {
                const isCompleted = item.status === 'completed';
                const isCurrent = item.is_current;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 rounded-xl border p-3.5 transition ${
                      isCurrent
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)]/30 ring-1 ring-[var(--accent)]/20'
                        : isCompleted
                        ? 'border-[var(--line)] bg-[var(--surface)] opacity-85'
                        : 'border-[var(--line)] bg-[var(--surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--line)] text-[var(--muted)]'
                      }`}>
                        {isCompleted ? <Check size={14} /> : idx + 1}
                      </div>

                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold truncate ${isCompleted ? 'text-[var(--muted)] line-through' : 'text-[var(--fg)]'}`}>
                            {item.title}
                          </p>
                          {isCurrent && (
                            <span className="rounded-md bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                              Active Focus
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                        isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCurrent
                          ? 'text-[var(--accent)]'
                          : 'text-[var(--muted)]'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}

              {!items.length && (
                <div className="py-8 text-center text-xs text-[var(--muted)]">
                  No roadmap milestones defined.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column (4 cols): Mastery Distribution & Application Pipeline */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Topic Mastery Distribution */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-2xs">
            <h3 className="text-base font-bold text-[var(--fg)]">
              Mastery Distribution
            </h3>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Breakdown of your {topicsList.length} technical study topics.
            </p>

            <div className="mt-5 space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Mastered
                  </span>
                  <span>{statusCounts.mastered} ({Math.round((statusCounts.mastered / totalTopics) * 100)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(statusCounts.mastered / totalTopics) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" /> Understood
                  </span>
                  <span>{statusCounts.understood} ({Math.round((statusCounts.understood / totalTopics) * 100)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(statusCounts.understood / totalTopics) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> In Progress
                  </span>
                  <span>{statusCounts.learning} ({Math.round((statusCounts.learning / totalTopics) * 100)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(statusCounts.learning / totalTopics) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-semibold">
                  <span className="text-[var(--muted)] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--muted)]" /> Not Started
                  </span>
                  <span>{statusCounts.not_started} ({Math.round((statusCounts.not_started / totalTopics) * 100)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--line-subtle)] transition-all duration-500"
                    style={{ width: `${(statusCounts.not_started / totalTopics) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Application Pipeline Funnel */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="text-base font-bold text-[var(--fg)]">Hiring Pipeline Funnel</h3>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Stages across {totalApps} job applications</p>
              </div>
              <Link
                href="/job-preparation"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
              >
                Track <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              {[
                ['saved', 'Saved Target', 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'],
                ['applied', 'Applied', 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400'],
                ['screening', 'Screening', 'border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'],
                ['interview', 'Interview', 'border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400 font-bold'],
                ['offer', 'Offer Received', 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold col-span-2'],
                ['rejected', 'Rejected', 'border-red-500/20 bg-red-500/5 text-red-500'],
                ['withdrawn', 'Withdrawn', 'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'],
              ].map(([st, label, style]) => (
                <div
                  key={st}
                  className={`rounded-xl border p-3 ${style}`}
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">{label}</p>
                  <p className="mt-1 text-xl font-black">{appsCount[st] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Operating Discipline Card */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              Study Protocol Directive
            </h4>
            <div className="mt-3 space-y-2.5 text-xs text-[var(--muted)]">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[var(--accent)] shrink-0">1.</span>
                <span>Work problems on physical paper first without autocomplete or hints.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[var(--accent)] shrink-0">2.</span>
                <span>Use LLM dialogue to interrogate edge cases, proofs, and complexity.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[var(--accent)] shrink-0">3.</span>
                <span>Codify synthesis into BlockNote topic documents in MANU Learning OS.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}