'use client';

import { useMemo, useState } from 'react';
import { interviewCategoriesPart1 } from './data-part1';
import { interviewCategoriesPart2 } from './data-part2';
import { interviewCategoriesPart3 } from './data-part3';
import { interviewCategoriesPart4 } from './data-part4';
import { interviewCategoriesPart5 } from './data-part5';
import type { InterviewPriority } from './types';

const categories = [
  ...interviewCategoriesPart1,
  ...interviewCategoriesPart2,
  ...interviewCategoriesPart3,
  ...interviewCategoriesPart4,
  ...interviewCategoriesPart5,
];

const priorityStyles: Record<InterviewPriority, string> = {
  CORE: 'border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400',
  PREPARE: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  BACKUP: 'border-slate-500/25 bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

export function AseFinalInterviewBank() {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<'ALL' | InterviewPriority>('ALL');
  const [activeCategory, setActiveCategory] = useState('all');

  const total = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const coreCount = categories.flatMap((c) => c.items).filter((i) => i.priority === 'CORE').length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((cat) => activeCategory === 'all' || cat.id === activeCategory)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const priorityOk = priority === 'ALL' || item.priority === priority;
          const queryOk =
            !q ||
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q) ||
            String(item.number) === q;
          return priorityOk && queryOk;
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query, priority, activeCategory]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
          ASE FINAL INTERVIEW BANK
        </div>
        <h2 className="mt-2 text-xl font-extrabold text-[var(--fg)]">
          {total} questions · separate from Day 1 / Day 2 technical study
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)]">
          This page is for interview performance, not for learning everything. Start with CORE questions. PREPARE questions come next. BACKUP questions are only for follow-ups.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Total bank</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--fg)]">{total}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">CORE first</p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--fg)]">{coreCount}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Rule</p>
            <p className="mt-1 text-sm font-bold leading-5 text-[var(--fg)]">Answer first → one example → stop.</p>
          </div>
        </div>
      </div>

      <div className="sticky top-2 z-20 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search question, answer, or number…"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          />
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'CORE', 'PREPARE', 'BACKUP'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  priority === p
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                    : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold ${
              activeCategory === 'all' ? 'bg-[var(--accent)] text-white' : 'bg-black/5 text-[var(--muted)] dark:bg-white/5'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                activeCategory === cat.id ? 'bg-[var(--accent)] text-white' : 'bg-black/5 text-[var(--muted)] dark:bg-white/5'
              }`}
            >
              {cat.title.split('. ')[0]} · {cat.range}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-[var(--muted)]">
        <strong className="text-[var(--fg)]">Truth rule:</strong> Some answers contain a verification reminder because your final resume/research facts are still being corrected. Never replace uncertainty with an invented claim. For questions about shifts, family, salary, or availability, use your real situation on interview day.
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Tell me about yourself</p>
          <p className="mt-2 text-sm font-bold text-[var(--fg)]">PRESENT → PROOF → FIT</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Who you are now → one strong piece of evidence → why PTE/ASE is the logical next step. Default target: about 45–60 seconds.</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Behavioral question</p>
          <p className="mt-2 text-sm font-bold text-[var(--fg)]">STAR — keep ACTION biggest</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Situation/Task briefly → what YOU did → result/learning. Do not spend one minute explaining background before your action.</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Short-event rule</p>
          <p className="mt-2 text-sm font-bold text-[var(--fg)]">ANSWER → EXAMPLE → STOP</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Do not dump every technical detail. Let the manager pull you deeper with follow-up questions.</p>
        </div>
      </div>

      {visible.map((category) => (
        <section key={category.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
          <div className="border-b border-[var(--line)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[var(--fg)]">{category.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{category.subtitle}</p>
              </div>
              <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-bold text-[var(--muted)] dark:bg-white/5">
                {category.range}
              </span>
            </div>
          </div>

          <div className="divide-y divide-[var(--line-subtle)]">
            {category.items.map((item) => (
              <details key={item.number} className="group p-5">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-[var(--accent-subtle)] text-[11px] font-extrabold text-[var(--accent)]">
                    {item.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-wide ${priorityStyles[item.priority]}`}>
                        {item.priority}
                      </span>
                      <span className="text-sm font-bold leading-6 text-[var(--fg)]">{item.question}</span>
                    </div>
                  </div>
                  <span className="mt-1 text-xs text-[var(--muted)] transition group-open:rotate-180">⌄</span>
                </summary>

                <div className="ml-11 mt-4 space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                      Clear interview answer
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-[var(--fg)]">{item.answer}</p>
                  </div>

                  {item.note && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
                        Important
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.note}</p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      {!visible.length && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
          No questions match this filter.
        </div>
      )}

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Interview use</p>
        <p className="mt-2 text-sm leading-6 text-[var(--fg)]">
          Do not memorize 397 scripts. Master the CORE answers aloud, use PREPARE for the second pass, and keep BACKUP only as protection if a manager goes deeper.
        </p>
      </div>
    </section>
  );
}
