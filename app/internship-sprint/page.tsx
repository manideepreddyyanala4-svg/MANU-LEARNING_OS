'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown, ArrowUp, BookOpen, CalendarDays, Check, CheckCircle2,
  ChevronRight, Circle, Clock3, ExternalLink, FileText, HeartPulse,
  Mail, Minus, Plus, RefreshCw, Save, ShieldCheck, Sparkles, Target,
} from 'lucide-react';
import { Page } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { LearningAudit } from '@/components/career/learning-audit';

type StudyItem = {
  title: string;
  mode: string;
  minutes: number;
  status: 'todo' | 'reviewed' | 'passed';
};

type SprintDay = {
  id: string;
  day: string;
  phase: string;
  focus: string;
  applications_target: number;
  outreach_target: number;
  technical_focus: string;
  study_items: StudyItem[];
  conference_focus: string;
  admin_focus: string;
  time_plan: string;
  applications_done: number;
  outreach_done: number;
  interviews_booked: number;
  technical_done: boolean;
  conference_done: boolean;
  admin_done: boolean;
  movement_done: boolean;
  meal_prep_done: boolean;
  gita_done: boolean;
  sleep_done: boolean;
  notes: string;
};
type Editable = Pick<SprintDay, 'focus' | 'applications_target' | 'outreach_target' |
  'technical_focus' | 'conference_focus' | 'admin_focus' | 'time_plan'>;
type View = 'today' | 'calendar';

const BEGIN = '2026-10-31';
const PRIMARY_END = '2026-12-14';
const FINAL_END = '2026-12-31';
const RECORD_COLUMNS = 'id,day,phase,focus,applications_target,outreach_target,technical_focus,study_items,conference_focus,admin_focus,time_plan,applications_done,outreach_done,interviews_booked,technical_done,conference_done,admin_done,movement_done,meal_prep_done,gita_done,sleep_done,notes';

const starterLeads = [
  { name: 'Phison — Computer Vision Intern', location: 'Miaoli / Zhunan', href: 'https://www.104.com.tw/jobs/search/?keyword=%E9%9B%BB%E8%85%A6%E8%A6%96%E8%A6%BA%E5%AF%A6%E7%BF%92%E7%94%9F' },
  { name: 'ITRI — CV Systems / VLM (U102)', location: 'Hsinchu / Chutung', href: 'https://www.1111.com.tw/job/132820684' },
  { name: 'ITRI — Computer Vision (E300)', location: 'Hsinchu / Chutung', href: 'https://itri.applytojob.com/apply/wKTbQo7QmF/MMSLComputer-Vision-Intern-E300' },
  { name: 'ITRI — VLM Development (W100)', location: 'Hsinchu / Chutung', href: 'https://itri.applytojob.com/apply/4Xubx7wdEv/ICLVisionLanguage-Model-Development-Intern-W100' },
];

function taiwanToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei', day: '2-digit', month: '2-digit', year: 'numeric',
  }).formatToParts(new Date());
  const p: Record<string, string> = {};
  parts.forEach((part) => { p[part.type] = part.value; });
  return p.year + '-' + p.month + '-' + p.day;
}

function addDays(day: string, n: number) {
  const value = new Date(day + 'T00:00:00Z');
  value.setUTCDate(value.getUTCDate() + n);
  return value.toISOString().slice(0, 10);
}

function labelDate(day: string, full = false) {
  return new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', {
    timeZone: 'UTC', weekday: full ? 'long' : 'short', month: 'short', day: 'numeric',
    ...(full ? { year: 'numeric' } : {}),
  });
}

function fmt(n: number) { return n.toLocaleString('en-US'); }

function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0;
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
      <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: String(pct) + '%' }} />
    </div>
  );
}

function Counter({
  label, value, target, disabled, onChange,
}: {
  label: string; value: number; target?: number; disabled: boolean; onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3">
      <div>
        <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
        <p className="mt-1 text-lg font-extrabold tabular-nums text-[var(--fg)]">
          {value}<span className="ml-1 text-xs font-semibold text-[var(--muted)]">{target === undefined ? 'booked' : ' / ' + target}</span>
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" disabled={disabled || value === 0} aria-label={'Decrease ' + label}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2 text-[var(--fg)] transition hover:border-[var(--accent)] disabled:opacity-35"><Minus size={17} /></button>
        <button type="button" disabled={disabled || value >= 100} aria-label={'Increase ' + label}
          onClick={() => onChange(value + 1)}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-2 text-[var(--fg)] transition hover:border-[var(--accent)] disabled:opacity-35"><Plus size={17} /></button>
      </div>
    </div>
  );
}

function Checklist({
  label, text, checked, disabled, onClick,
}: {
  label: string; text: string; checked: boolean; disabled: boolean; onClick: () => void;
}) {
  if (!text.trim()) return null;
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5">
      <button type="button" disabled={disabled} onClick={onClick}
        aria-pressed={checked} className="flex w-full items-start gap-3 text-left disabled:opacity-60">
        {checked ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={20} /> :
          <Circle className="mt-0.5 shrink-0 text-[var(--muted)]" size={20} />}
        <span className="min-w-0">
          <span className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{label}</span>
          <span className={'mt-1.5 block whitespace-pre-line text-sm leading-6 ' +
            (checked ? 'text-[var(--muted)] line-through' : 'text-[var(--fg)]')}>{text}</span>
        </span>
      </button>
    </div>
  );
}

export default function InternshipSprint() {
  const [days, setDays] = useState<SprintDay[]>([]);
  const [view, setView] = useState<View>('today');
  const [today, setToday] = useState(BEGIN);
  const [selectedDay, setSelectedDay] = useState(BEGIN);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPlan, setDraftPlan] = useState<Editable | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const client = createClient();
      if (!client) throw new Error('Your private workspace is not configured.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to load your internship plan.');
      const { data, error: dbError } = await client
        .from('internship_sprint_days')
        .select(RECORD_COLUMNS)
        .eq('user_id', user.id)
        .gte('day', BEGIN).lte('day', FINAL_END)
        .order('day', { ascending: true });
      if (dbError) throw dbError;
      setDays((data ?? []) as SprintDay[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load your private plan.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const localDay = taiwanToday();
    setToday(localDay);
    setSelectedDay(localDay >= BEGIN && localDay <= FINAL_END ? localDay : BEGIN);
    void load();
  }, [load]);

  const primary = useMemo(() => days.filter((d) => d.day <= PRIMARY_END), [days]);
  const stats = useMemo(() => ({
    targetApplications: primary.reduce((total, d) => total + d.applications_target, 0),
    applications: primary.reduce((total, d) => total + d.applications_done, 0),
    targetOutreach: primary.reduce((total, d) => total + d.outreach_target, 0),
    outreach: primary.reduce((total, d) => total + d.outreach_done, 0),
    interviews: days.reduce((total, d) => total + d.interviews_booked, 0),
    practice: days.filter((d) => d.technical_done).length,
    conference: days.filter((d) => d.conference_focus.trim() && d.conference_done).length,
  }), [days, primary]);

  const nextDay = addDays(today, 1);
  const daily = days.find((d) => d.day === today);
  const tomorrow = days.find((d) => d.day === nextDay);
  const calendarDay = days.find((d) => d.day === selectedDay) ?? days[0];
  const daysRemaining = Math.max(0, Math.floor(
    (Date.parse(PRIMARY_END + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000
  ));
  const months = useMemo(() => {
    return [...new Set(days.map((d) => d.day.slice(0, 7)))];
  }, [days]);

  async function patch(day: SprintDay, updates: Partial<SprintDay>) {
    if (busy) return false;
    setBusy(day.id);
    setError('');
    setNotice('');
    try {
      const client = createClient();
      if (!client) throw new Error('Private storage unavailable.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in and retry.');
      const { data, error: saveError } = await client
        .from('internship_sprint_days')
        .update(updates)
        .eq('id', day.id).eq('user_id', user.id)
        .select(RECORD_COLUMNS).single();
      if (saveError) throw saveError;
      const saved = data as SprintDay;
      setDays((current) => current.map((item) => item.id === saved.id ? saved : item));
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your progress.');
      return false;
    } finally { setBusy(null); }
  }

  function startEdit(day: SprintDay) {
    if (busy) return;
    setEditingId(day.id);
    setDraftPlan({
      focus: day.focus,
      applications_target: day.applications_target,
      outreach_target: day.outreach_target,
      technical_focus: day.technical_focus,
      conference_focus: day.conference_focus,
      admin_focus: day.admin_focus,
      time_plan: day.time_plan,
    });
  }

  async function savePlan(day: SprintDay) {
    if (!draftPlan || !draftPlan.focus.trim()) { setError('Daily focus cannot be empty.'); return; }
    const ok = await patch(day, {
      ...draftPlan,
      applications_target: Math.max(0, Math.min(20, draftPlan.applications_target || 0)),
      outreach_target: Math.max(0, Math.min(20, draftPlan.outreach_target || 0)),
    });
    if (ok) { setEditingId(null); setDraftPlan(null); setNotice('Daily plan saved.'); }
  }

  function dayCard(day: SprintDay, compact = false) {
    const isCurrent = day.day === today;
    const isNext = day.day === nextDay;
    const changedNotes = (draftNotes[day.id] ?? day.notes) !== day.notes;
    const conferencePresent = Boolean(day.conference_focus.trim());
    const adminPresent = Boolean(day.admin_focus.trim());
    const studyItems = Array.isArray(day.study_items) ? day.study_items : [];
    const passedCount = studyItems.filter((item) => item.status === 'passed').length;
    const reviewedCount = studyItems.filter((item) => item.status === 'reviewed').length;
    const minutes = studyItems.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0);
    const checksTotal = 1 + studyItems.length + (conferencePresent ? 1 : 0) + (adminPresent ? 1 : 0) + 4;
    const checksDone = Number(day.technical_done) + passedCount + Number(conferencePresent && day.conference_done) +
      Number(adminPresent && day.admin_done) + Number(day.movement_done) +
      Number(day.meal_prep_done) + Number(day.gita_done) + Number(day.sleep_done);

    return (
      <article key={day.id} className={'min-w-0 overflow-hidden rounded-2xl border bg-[var(--surface)] shadow-2xs ' +
        (isCurrent ? 'border-[var(--accent)]' : 'border-[var(--line)]')}>
        <div className="border-b border-[var(--line)] px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--accent)]">
                {isCurrent ? 'Today' : isNext ? 'Tomorrow' : day.phase}
              </span>
              <span className="text-xs text-[var(--muted)]">{labelDate(day.day, true)}</span>
            </div>
            <button type="button" disabled={Boolean(busy)} onClick={() => editingId === day.id ? (setEditingId(null), setDraftPlan(null)) : startEdit(day)}
              className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-[var(--fg)] transition hover:border-[var(--accent)] disabled:opacity-50">
              {editingId === day.id ? 'Cancel edit' : 'Edit day'}
            </button>
          </div>
          {editingId === day.id && draftPlan ? (
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-[var(--muted)]">
                Daily outcome
                <textarea rows={2} value={draftPlan.focus} maxLength={1000}
                  onChange={(event) => setDraftPlan({ ...draftPlan, focus: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 text-sm text-[var(--fg)]" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['applications_target','outreach_target'] as const).map((field) => (
                  <label key={field} className="text-xs font-bold text-[var(--muted)]">
                    {field === 'applications_target' ? 'Application target' : 'Outreach target'}
                    <input type="number" min={0} max={20} value={draftPlan[field]}
                      onChange={(event) => setDraftPlan({ ...draftPlan, [field]: Number(event.target.value) })}
                      className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 text-sm text-[var(--fg)]" />
                  </label>
                ))}
              </div>
              {([
                ['technical_focus','Interview practice'],
                ['conference_focus','Conference preparation'],
                ['admin_focus','Follow-up / administration'],
                ['time_plan','Time-block schedule'],
              ] as const).map(([field,label]) => (
                <label key={field} className="block text-xs font-bold text-[var(--muted)]">
                  {label}
                  <textarea rows={field === 'time_plan' ? 4 : 2} value={draftPlan[field]} maxLength={5000}
                    onChange={(event) => setDraftPlan({ ...draftPlan, [field]: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] p-2.5 text-sm text-[var(--fg)]" />
                </label>
              ))}
              <button type="button" disabled={Boolean(busy)} onClick={() => void savePlan(day)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                <Save size={15} /> Save plan
              </button>
            </div>
          ) : (
            <>
              <h3 className="mt-3 text-lg font-extrabold leading-7 tracking-tight text-[var(--fg)]">{day.focus}</h3>
              <p className="mt-2 text-xs font-semibold text-[var(--muted)]">{checksDone} of {checksTotal} preparation tasks complete</p>
              <Progress value={checksDone} max={checksTotal} />
            </>
          )}
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <section>
            <h4 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
              Measurable execution
            </h4>
            <div className="grid gap-2 sm:grid-cols-3">
              <Counter label="Applications" value={day.applications_done} target={day.applications_target}
                disabled={Boolean(busy)} onChange={(value) => void patch(day, { applications_done: value })} />
              <Counter label="Direct outreach" value={day.outreach_done} target={day.outreach_target}
                disabled={Boolean(busy)} onChange={(value) => void patch(day, { outreach_done: value })} />
              <Counter label="Interviews" value={day.interviews_booked}
                disabled={Boolean(busy)} onChange={(value) => void patch(day, { interviews_booked: value })} />
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Counters are manual. Record company, role, status and contact details separately in{' '}
              <Link href="/job-preparation" className="font-bold text-[var(--accent)] underline-offset-2 hover:underline">Job Preparation</Link>.
            </p>
          </section>

          <section>
            <h4 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
              Daily baseline · movement, cooking, spirituality and sleep
            </h4>
            <p className="mb-3 text-xs leading-5 text-[var(--muted)]">
              Mark only what you actually did. Recovery days count when you complete the scheduled walk or mobility.
              Mark sleep after the following morning, never in advance.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['movement_done', 'Gym / movement'],
                ['meal_prep_done', 'Cooking + food'],
                ['gita_done', 'Bhagavad Gita 20–30 min'],
                ['sleep_done', 'Night sleep'],
              ] as const).map(([field, label]) => (
                <button key={field} type="button" disabled={Boolean(busy)}
                  aria-pressed={day[field]}
                  onClick={() => void patch(day, { [field]: !day[field] })}
                  className={'flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition disabled:opacity-50 ' +
                    (day[field] ? 'border-emerald-500/40 bg-emerald-500/10 text-[var(--fg)]' :
                      'border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--accent)]')}>
                  {day[field] ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> :
                    <Circle size={18} className="shrink-0" />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>

          {studyItems.length > 0 && (
            <section>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-[var(--fg)]">
                    Today's accelerated study topics
                  </h4>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {studyItems.length} connected tasks · approx. {minutes} minutes · {passedCount} passed · {reviewedCount} reviewed
                  </p>
                </div>
                <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-xs font-bold text-[var(--accent)]">
                  {passedCount} / {studyItems.length} tested
                </span>
              </div>
              <Progress value={passedCount} max={studyItems.length} />
              <p className="my-3 text-xs leading-5 text-[var(--muted)]">
                Advance each topic through Not started → Reviewed → Test passed.
                “Previously encountered” means you have saved related notes, not proven mastery.
                Mark Test passed only if you explained the idea without notes and completed its coding/question check.
              </p>
              <div className="space-y-2">
                {studyItems.map((item, index) => {
                  const nextStatus: StudyItem['status'] = item.status === 'todo'
                    ? 'reviewed' : item.status === 'reviewed' ? 'passed' : 'todo';
                  return (
                    <div key={index} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-3.5">
                      <div className="flex items-start gap-2.5">
                        {item.status === 'passed'
                          ? <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-500" />
                          : <Circle size={19} className="mt-0.5 shrink-0 text-[var(--muted)]" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-6 text-[var(--fg)]">{index + 1}. {item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                            {item.mode} · {item.minutes} min
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={'rounded-lg px-2 py-1 text-xs font-semibold ' +
                              (item.status === 'passed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                item.status === 'reviewed' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' :
                                'bg-[var(--surface)] text-[var(--muted)]')}>
                              {item.status === 'passed' ? 'Test passed' : item.status === 'reviewed' ? 'Reviewed' : 'Not started'}
                            </span>
                            <button type="button" disabled={Boolean(busy)}
                              onClick={() => {
                                const next = studyItems.map((current, i) => i === index
                                  ? { ...current, status: nextStatus } : current);
                                void patch(day, {
                                  study_items: next,
                                  technical_done: next.length > 0 && next.every((current) => current.status === 'passed'),
                                });
                              }}
                              className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--fg)] hover:border-[var(--accent)] disabled:opacity-40">
                              {item.status === 'todo' ? 'I reviewed it' :
                                item.status === 'reviewed' ? 'I passed the test' : 'Revisit topic'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h4 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
              Daily preparation checklist
            </h4>
            <div className="grid gap-2">
              {studyItems.length === 0 ? (
                <Checklist label="Technical interview practice" text={day.technical_focus} checked={day.technical_done}
                  disabled={Boolean(busy)} onClick={() => void patch(day, { technical_done: !day.technical_done })} />
              ) : (
                <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5">
                  <div className="flex items-start gap-2">
                    {day.technical_done ? <CheckCircle2 size={18} className="mt-0.5 text-emerald-500" /> :
                      <Circle size={18} className="mt-0.5 text-[var(--muted)]" />}
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">Daily technical pass gate</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--fg)]">
                        {day.technical_done ? 'All topic checks have passed.' :
                          'Explain each reviewed topic and test with code, a calculation or an interview-style question. Passing all topics completes this gate.'}
                      </p>
                    </div>
                  </div>
                  <details className="mt-3 border-t border-[var(--line)] pt-3">
                    <summary className="cursor-pointer text-xs font-bold text-[var(--accent)]">Show full topic list and study rules</summary>
                    <p className="mt-2 whitespace-pre-line text-xs leading-6 text-[var(--muted)]">{day.technical_focus}</p>
                  </details>
                </div>
              )}
              <Checklist label="Tokyo conference / presentation" text={day.conference_focus} checked={day.conference_done}
                disabled={Boolean(busy)} onClick={() => void patch(day, { conference_done: !day.conference_done })} />
              <Checklist label="Administration / follow-ups" text={day.admin_focus} checked={day.admin_done}
                disabled={Boolean(busy)} onClick={() => void patch(day, { admin_done: !day.admin_done })} />
            </div>
          </section>

          {day.time_plan.trim() && (
            <section>
              <h4 className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
                <Clock3 size={15} /> Time blocks (Taiwan time)
              </h4>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                {day.time_plan.split(';').filter(Boolean).map((block, i) => {
                  const match = block.trim().match(/^(\d{2}:\d{2}–\d{2}:\d{2})\s+(.*)$/);
                  return (
                    <div key={i} className="grid grid-cols-[94px_1fr] gap-3 border-b border-[var(--line)] py-2.5 text-sm leading-6 last:border-b-0">
                      <span className="font-mono text-xs font-bold tabular-nums text-[var(--accent)]">{match ? match[1] : '—'}</span>
                      <span className="text-[var(--fg)]">{match ? match[2] : block.trim()}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!compact && (
            <section>
              <label htmlFor={'sprint-note-' + day.id} className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
                Execution notes / interview replies
              </label>
              <textarea id={'sprint-note-' + day.id} rows={3} maxLength={10000}
                placeholder="What was submitted? Any response? What is tomorrow's adjustment?"
                value={draftNotes[day.id] ?? day.notes}
                onChange={(event) => setDraftNotes((previous) => ({ ...previous, [day.id]: event.target.value }))}
                className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm leading-6 text-[var(--fg)] placeholder:text-[var(--muted)]" />
              <button type="button" disabled={Boolean(busy) || !changedNotes}
                onClick={async () => {
                  const ok = await patch(day, { notes: draftNotes[day.id] ?? day.notes });
                  if (ok) setNotice('Daily notes saved.');
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-bold text-white disabled:opacity-40">
                <Save size={15} /> Save notes
              </button>
            </section>
          )}
        </div>
      </article>
    );
  }

  return (
    <Page
      eyebrow="45-day primary sprint · 62-day contingency"
      title="Internship Execution Sprint"
      subtitle="A daily Taiwan AI / CV / Python internship campaign with conference preparation, real progress and a December backup."
      actions={
        <button type="button" disabled={loading || Boolean(busy)} onClick={() => void load()}
          aria-label="Refresh sprint" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-xs font-bold text-[var(--fg)] disabled:opacity-50">
          <RefreshCw size={15} /> Refresh
        </button>
      }
    >
      <div className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--accent)]">
            <Target size={15} /> Interview invitations: 2–3 by Nov 30 (goal, not guaranteed)
          </span>
          <span className="text-xs font-bold text-[var(--muted)]">
            {today <= PRIMARY_END ? daysRemaining + ' days to Dec 14' : 'Primary deadline passed · contingency active'}
          </span>
        </div>
        <h2 className="mt-4 max-w-3xl text-xl font-extrabold tracking-tight text-[var(--fg)] sm:text-2xl">
          One outcome: a suitable, paid, legally permitted technical internship.
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Prioritize desk-based computer vision, Python, applied AI, image processing and software roles.
          Do not take inappropriate physical shifts or roles exceeding your student work hours.
          Applications and outreach are inputs; interviews and offers depend on employers.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
              <span>Qualified applications</span><Mail size={17} />
            </div>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--fg)]">{fmt(stats.applications)}<span className="ml-1 text-sm font-medium text-[var(--muted)]"> / {fmt(stats.targetApplications || 61)}</span></p>
            <Progress value={stats.applications} max={stats.targetApplications || 61} />
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
              <span>Direct outreach</span><ExternalLink size={17} />
            </div>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--fg)]">{fmt(stats.outreach)}<span className="ml-1 text-sm font-medium text-[var(--muted)]"> / {fmt(stats.targetOutreach || 26)}</span></p>
            <Progress value={stats.outreach} max={stats.targetOutreach || 26} />
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
              <span>Interviews booked</span><CheckCircle2 size={17} />
            </div>
            <p className="mt-2 text-2xl font-extrabold tabular-nums text-[var(--fg)]">{fmt(stats.interviews)}<span className="ml-1 text-sm font-medium text-[var(--muted)]"> / 3 goal</span></p>
            <Progress value={stats.interviews} max={3} />
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[var(--muted)]">
          <ShieldCheck size={16} className="shrink-0" /> Student work permit is mandatory; semester work is generally capped at 20 hours/week.
          Confirm schedule with the employer and Asia University before accepting.
        </p>
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{notice}</div>}

      <LearningAudit />

      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setView('today')}
          className={'rounded-xl px-4 py-2.5 text-sm font-bold transition ' +
            (view === 'today' ? 'bg-[var(--accent)] text-white' : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]')}>
          Today & tomorrow
        </button>
        <button type="button" onClick={() => setView('calendar')}
          className={'inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition ' +
            (view === 'calendar' ? 'bg-[var(--accent)] text-white' : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)]')}>
          <CalendarDays size={16} /> All 62 days
        </button>
        <Link href="/job-preparation"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm font-semibold text-[var(--fg)]">
          Job Preparation <ChevronRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
          <RefreshCw size={18} className="animate-spin" /> Loading your saved 62-day schedule…
        </div>
      ) : days.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8">
          <h3 className="text-lg font-bold text-[var(--fg)]">No sprint scheduled for this account</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Sign in with the ManuOS account where you store your personal Learning notes and Life Vision.
            The daily plan is private, not published in the public source code.
          </p>
        </div>
      ) : view === 'today' ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {daily ? dayCard(daily) : (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
              No entry for today. Use All 62 days to inspect the campaign.
            </div>
          )}
          {tomorrow ? dayCard(tomorrow) : null}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-[var(--accent)]" />
              <h3 className="text-base font-extrabold text-[var(--fg)]">Daily calendar · tap a date to open its plan</h3>
            </div>
            {months.map((month) => (
              <section key={month} className="mb-4 last:mb-0">
                <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  {new Date(month + '-15T12:00:00Z').toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </h4>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-10">
                  {days.filter((day) => day.day.startsWith(month)).map((day) => {
                    const achieved = day.applications_done >= day.applications_target &&
                      day.outreach_done >= day.outreach_target &&
                      day.technical_done &&
                      (!day.conference_focus.trim() || day.conference_done) &&
                      (!day.admin_focus.trim() || day.admin_done);
                    return (
                      <button key={day.id} type="button" onClick={() => setSelectedDay(day.day)}
                        aria-pressed={selectedDay === day.day}
                        className={'min-h-16 rounded-xl border p-2 text-left transition ' +
                          (selectedDay === day.day ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]' :
                            'border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] hover:border-[var(--accent)]')}>
                        <span className="block text-xs font-semibold opacity-70">
                          {labelDate(day.day).split(' ')[0]}
                        </span>
                        <span className="block text-lg font-extrabold tabular-nums">{Number(day.day.slice(8))}</span>
                        {achieved ? <Check size={14} className="mt-1 text-emerald-500" /> :
                          day.day === today ? <Circle size={12} className="mt-1 text-[var(--accent)]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          {calendarDay && dayCard(calendarDay)}
        </div>
      )}

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Sparkles size={19} /><h3 className="text-base font-extrabold text-[var(--fg)]">First leads to verify</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            These roles were surfaced on October 31. Check whether they remain open and whether they accept an international master's student working at most 20 hours/week. Do not count a saved link as an application.
          </p>
          <div className="mt-4 space-y-2">
            {starterLeads.map((lead) => (
              <a key={lead.name} href={lead.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] transition hover:border-[var(--accent)]">
                <span className="min-w-0">
                  <span className="block font-bold">{lead.name}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">{lead.location}</span>
                </span>
                <ExternalLink size={16} className="shrink-0 text-[var(--accent)]" />
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <HeartPulse size={19} /><h3 className="text-base font-extrabold text-[var(--fg)]">Operating rules</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
            <p><strong className="text-[var(--fg)]">One primary objective:</strong> relevant paid, desk-based technical work in Taiwan. No new unnecessary portfolio projects.</p>
            <p><strong className="text-[var(--fg)]">Every application:</strong> suitable hours, role match, salary and language requirements checked. Keep a company/application record.</p>
            <p><strong className="text-[var(--fg)]">Every week:</strong> review response rate, send follow-ups, test project explanation in an interview mock.</p>
            <p><strong className="text-[var(--fg)]">Conference:</strong> December 9 is provisional until the official Tokyo program is confirmed; never invent scientific results.</p>
            <p><strong className="text-[var(--fg)]">Financial contingency:</strong> review runway weekly. If necessary, pursue legal short-term support or university help before cash becomes critical.</p>
            <p><strong className="text-[var(--fg)]">Biological baseline:</strong> consistent sleep, food, exercise and reasonable breaks. Losing health weakens the campaign.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/job-preparation" className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white">
              <FileText size={15} /> Track an application
            </Link>
            <Link href="/life-vision" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--fg)]">
              <BookOpen size={15} /> Life vision
            </Link>
          </div>
        </section>
      </div>
    </Page>
  );
}
