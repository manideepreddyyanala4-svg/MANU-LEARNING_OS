import Link from 'next/link';
import { AseDay2InterviewPrep } from '@/components/ase-day2-interview-prep';

export default function AseDay2Page() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Job Preparation · ASE
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-[var(--fg)]">
            Day 2 Interview Preparation
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/job-preparation/ase-day-1"
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
          >
            ← Day 1
          </Link>
          <Link
            href="/job-preparation"
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
          >
            Job Preparation
          </Link>
        </div>
      </div>

      <AseDay2InterviewPrep />
    </main>
  );
}
