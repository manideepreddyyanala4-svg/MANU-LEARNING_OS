'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpenCheck, CalendarCheck2, CheckCircle2, ChevronRight, Circle, Clock3,
  Coffee, Dumbbell, ExternalLink, Mail, Minus, Moon, Plus, RefreshCw, Save,
  ShieldCheck, Target, UtensilsCrossed,
} from 'lucide-react';
import { Page } from '@/components/ui';
import { createClient } from '@/lib/supabase';

type StudyStatus = 'todo' | 'reviewed' | 'passed';
type StudyItem = {
  title: string;
  mode: string;
  minutes: number;
  proof?: string;
  status: StudyStatus;
};
type DailyPlan = {
  id: string;
  day: string;
  focus: string;
  phase: string;
  study_items: StudyItem[];
  time_plan: string;
  applications_target: number;
  outreach_target: number;
  applications_done: number;
  outreach_done: number;
  interviews_booked: number;
  technical_done: boolean;
  conference_focus: string;
  conference_done: boolean;
  admin_focus: string;
  admin_done: boolean;
  movement_done: boolean;
  meal_prep_done: boolean;
  gita_done: boolean;
  sleep_done: boolean;
  notes: string;
};

type DailyHabit = 'movement_done' | 'meal_prep_done' | 'gita_done' | 'sleep_done';
type NumericField = 'applications_done' | 'outreach_done' | 'interviews_booked';
const fields = 'id,day,focus,phase,study_items,time_plan,applications_target,outreach_target,applications_done,outreach_done,interviews_booked,technical_done,conference_focus,conference_done,admin_focus,admin_done,movement_done,meal_prep_done,gita_done,sleep_done,notes';

function taiwanParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei', hour12: false, year: 'numeric',
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  return {
    day: map.year + '-' + map.month + '-' + map.day,
    time: map.hour + ':' + map.minute,
  };
}

function longDay(day: string) {
  return new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', {
    timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function toMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : -1;
}
function scheduleRows(value: string) {
  return value.split(';').map((item) => {
    const match = item.trim().match(/^(\d{2}:\d{2})–(\d{2}:\d{2})\s+(.*)$/);
    return match
      ? { start: match[1], end: match[2], title: match[3] }
      : null;
  }).filter((item): item is { start: string; end: string; title: string } => item !== null);
}
function currentRow(start: string, end: string, clock: string) {
  const a = toMinutes(start);
  const b = toMinutes(end);
  const t = toMinutes(clock);
  if (a < 0 || b < 0 || t < 0) return false;
  return b > a ? t >= a && t < b : t >= a || t < b;
}

function Meter({ value, total }: { value: number; total: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--line)]" role="progressbar"
      aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}
      aria-label="Daily topic tests passed">
      <div className="h-full rounded-full bg-[var(--accent)] transition-all"
        style={{ width: (total ? Math.round(value * 100 / total) : 0) + '%' }} />
    </div>
  );
}

function Counter({ label, value, target, busy, onChange }: {
  label: string; value: number; target?: number; busy: boolean; onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
      <p className="text-xs font-semibold text-[var(--muted)]">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-lg font-black tabular-nums text-[var(--fg)]">
          {value}
          {target !== undefined && <span className="ml-1 text-xs font-medium text-[var(--muted)]">/ {target}</span>}
        </span>
        <span className="inline-flex gap-1">
          <button type="button" aria-label={'Decrease ' + label} disabled={busy || value <= 0}
            onClick={() => onChange(Math.max(0, value - 1))}
            className="rounded-lg border border-[var(--line)] p-2 text-[var(--fg)] disabled:opacity-35">
            <Minus size={15} />
          </button>
          <button type="button" aria-label={'Increase ' + label} disabled={busy || value >= 100}
            onClick={() => onChange(value + 1)}
            className="rounded-lg border border-[var(--line)] p-2 text-[var(--fg)] disabled:opacity-35">
            <Plus size={15} />
          </button>
        </span>
      </div>
    </div>
  );
}

export default function TodayLearningPage() {
  const [date, setDate] = useState<string | null>(null);
  const [clock, setClock] = useState('');
  const [day, setDay] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const requestNumber = useRef(0);

  const load = useCallback(async (whichDay: string) => {
    const request = ++requestNumber.current;
    setDay(null);
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const client = createClient();
      if (!client) throw new Error('The private ManuOS connection is not configured.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to the account containing your daily learning plan.');
      const { data, error: queryError } = await client.from('internship_sprint_days')
        .select(fields)
        .eq('user_id', user.id)
        .eq('day', whichDay)
        .maybeSingle();
      if (queryError) throw queryError;
      if (request !== requestNumber.current) return;
      setDay((data ?? null) as DailyPlan | null);
      setNotes(data?.notes ?? '');
    } catch (cause) {
      if (request !== requestNumber.current) return;
      setError(cause instanceof Error ? cause.message : 'Unable to load today’s plan.');
    } finally {
      if (request === requestNumber.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const update = () => {
      const next = taiwanParts(new Date());
      setClock(next.time);
      setDate((previous) => previous === next.day ? previous : next.day);
    };
    update();
    const timer = window.setInterval(update, 30_000);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
      requestNumber.current += 1;
    };
  }, []);
  useEffect(() => {
    if (date) void load(date);
  }, [date, load]);

  async function save(updates: Partial<DailyPlan>) {
    if (!day || !date || busy || day.day !== date) return;
    setBusy(true);
    setError('');
    setNotice('');
    const originalDay = day;
    try {
      const client = createClient();
      if (!client) throw new Error('The private ManuOS connection is not configured.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Your session expired. Sign in again.');
      const { data, error: saveError } = await client.from('internship_sprint_days')
        .update(updates)
        .eq('id', originalDay.id)
        .eq('user_id', user.id)
        .eq('day', originalDay.day)
        .select(fields)
        .single();
      if (saveError) throw saveError;
      const saved = data as DailyPlan;
      if (taiwanParts(new Date()).day === saved.day) {
        setDay(saved);
        if (Object.hasOwn(updates, 'notes')) {
          setNotes(saved.notes);
          setNotice('Daily notes saved.');
        }
      } else {
        const refreshed = taiwanParts(new Date());
        setClock(refreshed.time);
        setDate(refreshed.day);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The update failed. Try refreshing.');
    } finally {
      setBusy(false);
    }
  }

  const tasks = Array.isArray(day?.study_items) ? day.study_items : [];
  const passed = tasks.filter((item) => item.status === 'passed').length;
  const reviewed = tasks.filter((item) => item.status === 'reviewed').length;
  const studyMinutes = tasks.reduce((total, item) => total + (Number(item.minutes) || 0), 0);
  const blocks = scheduleRows(day?.time_plan ?? '');
  const activeIndex = blocks.findIndex((block) => currentRow(block.start, block.end, clock));
  const completeCount = passed + Number(Boolean(day?.movement_done)) + Number(Boolean(day?.meal_prep_done)) +
    Number(Boolean(day?.gita_done)) + Number(Boolean(day?.sleep_done));
  const habitData = [
    { field: 'movement_done' as DailyHabit, title: 'Gym or recovery movement', icon: Dumbbell },
    { field: 'meal_prep_done' as DailyHabit, title: 'Cooking and meals', icon: UtensilsCrossed },
    { field: 'gita_done' as DailyHabit, title: 'Bhagavad Gita — 20–30 min', icon: BookOpenCheck },
    { field: 'sleep_done' as DailyHabit, title: 'Night sleep (log next morning)', icon: Moon },
  ];

  return (
    <Page eyebrow="Execution Workspace / only today" title="Today's Learning"
      subtitle="One day. One schedule. Your exact topics, job actions and daily habits — refreshed on Taiwan time."
      actions={
        <button type="button" onClick={() => date && void load(date)} disabled={loading || busy || !date}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)] disabled:opacity-40">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      }>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-5 shadow-2xs sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">Your focus today</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--fg)] sm:text-2xl">
                {date ? longDay(date) : 'Loading Taiwan date'}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {day?.focus ?? 'Only the tasks scheduled for this Taiwan calendar day are displayed.'}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-right">
              <p className="text-xs font-semibold text-[var(--muted)]">Taiwan time</p>
              <p className="mt-1 font-mono text-xl font-black tabular-nums text-[var(--fg)]">{clock || '—:—'}</p>
            </div>
          </div>
          {day && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                <p className="text-xs font-semibold text-[var(--muted)]">Study topics passed</p>
                <p className="mt-1 text-xl font-black text-[var(--fg)]">{passed} / {tasks.length}</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                <p className="text-xs font-semibold text-[var(--muted)]">Study budget</p>
                <p className="mt-1 text-xl font-black text-[var(--fg)]">{studyMinutes} min</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                <p className="text-xs font-semibold text-[var(--muted)]">Study and routine completed</p>
                <p className="mt-1 text-xl font-black text-[var(--fg)]">{completeCount} / {tasks.length + 4}</p>
              </div>
            </div>
          )}
        </section>

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {notice && <p role="status" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{notice}</p>}
        {loading ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
            Loading the private plan for today…
          </div>
        ) : !day ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6">
            <h3 className="text-lg font-extrabold text-[var(--fg)]">No daily plan found for this date</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This page deliberately never substitutes yesterday's or tomorrow's tasks. Plans currently cover
              October 31 through December 31, 2026. If today's date is within that period, make sure
              you're signed into the ManuOS account containing your saved sprint.
            </p>
            <Link href="/internship-sprint" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent)]">
              View complete Internship Sprint <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.83fr)]">
              <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] p-4 sm:p-5">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--fg)]"><Clock3 size={19} className="text-[var(--accent)]"/> Your schedule</h3>
                  <span className="text-xs font-semibold text-[var(--muted)]">Today only · Asia/Taipei</span>
                </div>
                <div className="space-y-0 px-4 py-2 sm:px-5">
                  {blocks.map((block, index) => {
                    const active = index === activeIndex;
                    const finished = toMinutes(clock) >= toMinutes(block.end) && toMinutes(block.end) > toMinutes(block.start);
                    return (
                      <div key={index}
                        className={'grid grid-cols-[92px_1fr] gap-3 border-b border-[var(--line)] py-3 last:border-b-0 ' +
                          (active ? 'rounded-lg bg-[var(--accent-subtle)] px-2 -mx-2' : '')}>
                        <div className="font-mono text-xs font-bold tabular-nums text-[var(--accent)]">
                          {block.start}
                          <div className="mt-0.5 text-[var(--muted)]">{block.end}</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <p className={'flex-1 text-sm leading-6 ' + (finished ? 'text-[var(--muted)]' : 'text-[var(--fg)]')}>
                            {block.title}
                          </p>
                          {active && <span className="rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-extrabold text-white">Now</span>}
                        </div>
                      </div>
                    );
                  })}
                  {blocks.length === 0 && <p className="py-4 text-sm text-[var(--muted)]">No time blocks saved for today.</p>}
                </div>
              </section>

              <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                <div className="border-b border-[var(--line)] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--fg)]"><BookOpenCheck size={19} className="text-[var(--accent)]"/> Exactly what to learn</h3>
                    <span className="text-xs font-bold text-[var(--accent)]">{passed} / {tasks.length} passed</span>
                  </div>
                  <div className="mt-3"><Meter value={passed} total={tasks.length} /></div>
                  <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                    “Reviewed” means you revisited it. “Test passed” means you could answer independently or run the relevant exercise.
                  </p>
                </div>
                <div className="space-y-3 p-4 sm:p-5">
                  {tasks.map((item, index) => {
                    const next: StudyStatus = item.status === 'todo' ? 'reviewed' : item.status === 'reviewed' ? 'passed' : 'todo';
                    return (
                      <div key={index} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5">
                        <div className="flex items-start gap-2.5">
                          {item.status === 'passed'
                            ? <CheckCircle2 className="mt-1 shrink-0 text-emerald-500" size={19} />
                            : <Circle className="mt-1 shrink-0 text-[var(--muted)]" size={19} />}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold leading-6 text-[var(--fg)]">{index + 1}. {item.title}</h4>
                            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.mode} · {item.minutes} min</p>
                            {item.proof && <p className="mt-2 text-xs leading-5 text-[var(--fg)]"><strong>Pass when:</strong> {item.proof}</p>}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className={'rounded-md px-2 py-1 text-xs font-bold ' +
                                (item.status === 'passed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                  item.status === 'reviewed' ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'bg-[var(--surface)] text-[var(--muted)]')}>
                                {item.status === 'passed' ? 'Test passed' : item.status === 'reviewed' ? 'Reviewed' : 'Not started'}
                              </span>
                              <button type="button" disabled={busy}
                                onClick={() => {
                                  const revised = tasks.map((task, i) => i === index ? { ...task, status: next } : task);
                                  void save({ study_items: revised, technical_done: revised.every((task) => task.status === 'passed') });
                                }}
                                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--fg)] hover:border-[var(--accent)] disabled:opacity-40">
                                {item.status === 'todo' ? 'I reviewed it' : item.status === 'reviewed' ? 'I passed its test' : 'Reopen for review'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <Link href="/learning" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                    <BookOpenCheck size={15}/> Open your saved learning notes <ExternalLink size={13}/>
                  </Link>
                </div>
              </section>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <section className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--fg)]"><Target size={19} className="text-[var(--accent)]"/> Internship actions</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Only count actual applications, direct outreach and booked interviews.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Counter label="Applications" value={day.applications_done} target={day.applications_target}
                    busy={busy} onChange={(v) => void save({ applications_done: v })} />
                  <Counter label="Outreach" value={day.outreach_done} target={day.outreach_target}
                    busy={busy} onChange={(v) => void save({ outreach_done: v })} />
                  <Counter label="Interviews booked" value={day.interviews_booked}
                    busy={busy} onChange={(v) => void save({ interviews_booked: v })} />
                </div>
                <Link href="/job-preparation" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                  Open Job Preparation to record the employer and role <ChevronRight size={14}/>
                </Link>
              </section>

              <section className="min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--fg)]"><Coffee size={19} className="text-[var(--accent)]"/> Everyday foundation</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Exercise, food, Gita and sleep are part of your daily plan, not additional study subjects.</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {habitData.map(({ field, title, icon: Icon }) => (
                    <button key={field} type="button" disabled={busy}
                      aria-pressed={day[field]} onClick={() => void save({ [field]: !day[field] })}
                      className={'flex items-center gap-2.5 rounded-xl border p-3 text-left text-xs font-bold transition disabled:opacity-50 ' +
                        (day[field] ? 'border-emerald-500/40 bg-emerald-500/10 text-[var(--fg)]' :
                          'border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] hover:border-[var(--accent)]')}>
                      {day[field] ? <CheckCircle2 size={17} className="shrink-0 text-emerald-500"/> : <Icon size={17} className="shrink-0 text-[var(--accent)]"/>}
                      <span>{title}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {(day.conference_focus.trim() || day.admin_focus.trim()) && (
              <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--fg)]"><ShieldCheck size={19} className="text-[var(--accent)]"/> Research and administration</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {day.conference_focus.trim() && (
                    <button type="button" disabled={busy} onClick={() => void save({ conference_done: !day.conference_done })}
                      className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 text-left text-[var(--fg)] disabled:opacity-50">
                      {day.conference_done ? <CheckCircle2 size={19} className="shrink-0 text-emerald-500"/> : <Circle size={19} className="shrink-0 text-[var(--muted)]"/>}
                      <span><strong className="block text-xs">Tokyo presentation</strong><span className="mt-1 block text-xs leading-5">{day.conference_focus}</span></span>
                    </button>
                  )}
                  {day.admin_focus.trim() && (
                    <button type="button" disabled={busy} onClick={() => void save({ admin_done: !day.admin_done })}
                      className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 text-left text-[var(--fg)] disabled:opacity-50">
                      {day.admin_done ? <CheckCircle2 size={19} className="shrink-0 text-emerald-500"/> : <Circle size={19} className="shrink-0 text-[var(--muted)]"/>}
                      <span><strong className="block text-xs">Administration and follow-up</strong><span className="mt-1 block text-xs leading-5">{day.admin_focus}</span></span>
                    </button>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-extrabold text-[var(--fg)]">Today's notes and evidence</h3>
                <button type="button" disabled={busy || notes === day.notes} onClick={() => void save({ notes })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">
                  <Save size={14}/> Save
                </button>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Record the actual questions you solved, any weak topics and companies you applied to.
                Notes stay private and are attached to today's date.
              </p>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4}
                maxLength={5000} placeholder="Actual coding output, weak topics, employer/role, what to fix tomorrow…"
                className="mt-3 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm leading-6 text-[var(--fg)] outline-none focus:border-[var(--accent)]" />
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] py-2">
              <p className="text-xs leading-5 text-[var(--muted)]">This page uses today's private sprint record. It changes dates automatically at midnight Taiwan time.</p>
              <Link href="/internship-sprint" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)]">
                Full 62-day plan <CalendarCheck2 size={15}/>
              </Link>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
