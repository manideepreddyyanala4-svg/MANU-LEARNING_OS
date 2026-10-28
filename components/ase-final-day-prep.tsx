'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronDown, ClipboardCheck, Eye, EyeOff, RotateCcw, Search, Star, Zap } from 'lucide-react';
import { finalDayPriorityNumbers, finalDaySections, finalDayTotal, type FinalDayQuestion } from './ase-final-day/questions';

type Filter = 'priority' | 'all' | 'unprepared';
const STORAGE_KEY = 'manu-ase-2026-final-day-ready-v1';

const essentialNumbers = [1, 3, 4, 5, 6, 7, 16, 20, 26, 28, 29, 31, 35, 36, 39, 41, 47, 56, 57, 61, 62, 69];
const critical = finalDaySections.flatMap(section => section.items).filter(item => essentialNumbers.includes(item.number));

export function AseFinalDayPrep() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('priority');
  const [sectionId, setSectionId] = useState('all');
  const [answersVisible, setAnswersVisible] = useState(true);
  const [ready, setReady] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [onlyEssentials, setOnlyEssentials] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const values: unknown = JSON.parse(raw);
      if (Array.isArray(values)) {
        setReady(values.filter((value): value is number => typeof value === 'number' && value >= 1 && value <= 100));
      }
    } catch {
      // Non-critical progress storage
    }
  }, []);

  function markPrepared(number: number) {
    setReady(previous => {
      const next = previous.includes(number) ? previous.filter(value => value !== number) : [...previous, number];
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const totalPriority = finalDaySections.flatMap(section => section.items).filter(item => finalDayPriorityNumbers.has(item.number)).length;
  const readyPriority = ready.filter(n => finalDayPriorityNumbers.has(n)).length;

  const visible = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return finalDaySections.filter(section => sectionId === 'all' || sectionId === section.id).map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (onlyEssentials && !essentialNumbers.includes(item.number)) return false;
        if (!onlyEssentials && filter === 'priority' && !finalDayPriorityNumbers.has(item.number)) return false;
        if (filter === 'unprepared' && ready.includes(item.number)) return false;
        return !normalized || String(item.number) === normalized || item.question.toLowerCase().includes(normalized) || item.answer.toLowerCase().includes(normalized) || (item.note?.toLowerCase().includes(normalized) ?? false);
      }),
    })).filter(section => section.items.length > 0);
  }, [search, filter, sectionId, ready, onlyEssentials]);

  const visibleCount = visible.reduce((sum, section) => sum + section.items.length, 0);

  function jumpToQuestions() {
    document.getElementById('final-day-questions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setEssentialView() {
    setOnlyEssentials(true);
    setFilter('all');
    setSectionId('all');
    setSearch('');
    jumpToQuestions();
  }

  function renderQuestion(item: FinalDayQuestion) {
    const isReady = ready.includes(item.number);
    const isExpanded = expanded.includes(item.number);
    const showAnswer = answersVisible || isExpanded;
    return (
      <article key={item.number} id={`ase-final-q-${item.number}`} className={`scroll-mt-24 rounded-2xl border bg-[var(--surface)] p-4 sm:p-5 ${isReady ? 'border-emerald-500/30' : 'border-[var(--line)]'}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${finalDayPriorityNumbers.has(item.number) ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>
            {item.number}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="max-w-3xl text-sm font-bold leading-6 text-[var(--fg)] sm:text-base">{item.question}</h3>
              {finalDayPriorityNumbers.has(item.number) && <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2 py-1 text-[10px] font-bold text-[var(--accent)]">PRIORITY</span>}
            </div>
            {showAnswer && (
              <div className="mt-3 rounded-xl bg-[var(--bg)] p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Simple answer — speak this idea, not every word</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--fg)]">{item.answer}</p>
                {item.note && <p className="mt-3 border-t border-[var(--line)] pt-3 text-xs leading-6 text-[var(--muted)]"><strong className="text-[var(--fg)]">Meaning / note:</strong> {item.note}</p>}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => markPrepared(item.number)} aria-pressed={isReady} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${isReady ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'}`}>
                <Check size={13} /> {isReady ? 'Prepared' : 'Mark prepared'}
              </button>
              {!answersVisible && (
                <button type="button" onClick={() => setExpanded(prev => isExpanded ? prev.filter(n => n !== item.number) : [...prev, item.number])} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]">
                  {isExpanded ? <EyeOff size={13} /> : <Eye size={13} />} {isExpanded ? 'Hide answer' : 'Show answer'}
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 text-[11px] font-extrabold text-[var(--accent)]"><Zap size={13} /> TODAY ONLY · ASE OCT 29</span>
          <span className="text-xs font-semibold text-[var(--muted)]">100 questions · short answers · 1-day preparation</span>
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-[var(--fg)] sm:text-3xl">ASE Final-Day Interview Prep</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          Your dedicated one-day interview page. Start with priority questions, explain your actual research honestly, and speak the answers aloud. Do not memorize complicated paragraphs.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">Priority prepared</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--fg)]">{readyPriority} <span className="text-base text-[var(--muted)]">/ {totalPriority}</span></p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--line)]"><div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${totalPriority ? readyPriority / totalPriority * 100 : 0}%` }} /></div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">All prepared</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--fg)]">{ready.length} <span className="text-base text-[var(--muted)]">/ {finalDayTotal}</span></p>
            <p className="mt-2 text-xs text-[var(--muted)]">Progress saves on this device</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">Best speaking method</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[var(--fg)]">Answer → one example → stop.</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Avoid over-explaining or claiming unfinished work is complete.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={setEssentialView} className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white"><Star size={15} /> Start 22 must-know questions</button>
          <Link href="/ase-quick-prep" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-bold text-[var(--fg)] hover:border-[var(--accent)]"><BookOpen size={15} /> Semiconductor flow</Link>
          <Link href="/job-preparation/ase-final-interview-bank" className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-bold text-[var(--fg)] hover:border-[var(--accent)]"><ClipboardCheck size={15} /> Full 397-question bank</Link>
        </div>
      </header>

      <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
        <h2 className="text-sm font-extrabold text-[var(--fg)]">30-second memory sheet</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          {['ASE = Assembly + Test', 'Design → Fab → CP → Dicing → Package → FT → Ship', 'CP = before packaging', 'FT = after packaging', 'ATE = Automatic Test Equipment', 'DUT = Device Under Test', 'Yield = pass / tested × 100'].map(item => <span key={item} className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)]">{item}</span>)}
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--muted)]">Research reminder: LAWNet is a published baseline, not your invention. The final model and complete mobile recognition deployment are still ongoing. The 3,134-image research dataset is different from the 1,600-image ROI paper dataset.</p>
      </div>

      <section id="final-day-questions" className="scroll-mt-20 mt-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--fg)]">Practice questions</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{visibleCount} questions shown. Say the answer out loud before marking it prepared.</p>
          </div>
          <button type="button" onClick={() => setAnswersVisible(v => !v)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)]">
            {answersVisible ? <EyeOff size={15} /> : <Eye size={15} />}{answersVisible ? 'Hide answers · mock mode' : 'Show all answers'}
          </button>
        </div>

        <div className="sticky top-[54px] z-10 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 p-3 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input aria-label="Search ASE interview questions" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search question, answer or Q number…" className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]" />
            </label>
            <select aria-label="Question section" value={sectionId} onChange={e => {setSectionId(e.target.value);setOnlyEssentials(false);}} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-semibold text-[var(--fg)]">
              <option value="all">All sections</option>
              {finalDaySections.map(section => <option value={section.id} key={section.id}>{section.title}</option>)}
            </select>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {([
              ['priority', 'Priority first'],
              ['all', 'All 100'],
              ['unprepared', 'Not prepared'],
            ] as const).map(([value,label]) => <button key={value} type="button" onClick={() => {setFilter(value);setOnlyEssentials(false);}} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter===value && !onlyEssentials ? 'bg-[var(--accent)] text-white' : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'}`}>{label}</button>)}
            <button type="button" onClick={setEssentialView} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${onlyEssentials ? 'bg-[var(--accent)] text-white' : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]'}`}>22 must-know</button>
            {ready.length > 0 && <button type="button" onClick={() => { if(window.confirm('Clear all prepared check marks?')){setReady([]);try{window.localStorage.removeItem(STORAGE_KEY);}catch{}} }} className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--fg)]"><RotateCcw size={13} /> Reset</button>}
          </div>
        </div>

        <div className="mt-5 space-y-7">
          {visible.length === 0 && <div className="rounded-xl border border-[var(--line)] p-8 text-center text-sm text-[var(--muted)]">No matching questions. Try another search or choose All 100.</div>}
          {visible.map(section => (
            <section key={section.id} className="space-y-3" aria-label={section.title}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-[var(--fg)]">{section.title}</h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">{section.subtitle}</p>
                </div>
                <span className="rounded-full bg-[var(--bg)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{section.items.length} shown</span>
              </div>
              {section.items.map(item => renderQuestion(item))}
            </section>
          ))}
        </div>
        {visibleCount > 0 && <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center">
          <p className="text-sm font-bold text-[var(--fg)]">Finished reviewing? Test yourself.</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Hide answers and say each answer without notes. Spend extra time on questions not yet prepared.</p>
          <button type="button" onClick={() => {setAnswersVisible(false);setFilter('unprepared');setOnlyEssentials(false);jumpToQuestions();}} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white"><ChevronDown size={15}/> Practice unanswered questions</button>
        </div>}
      </section>
    </main>
  );
}
