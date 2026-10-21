import Link from 'next/link';
import { AseDay1InterviewPrep } from '@/components/ase-day1-interview-prep';

export default function AseDay1Page() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Job Preparation · ASE
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-[var(--fg)]">
            Day 1 Interview Preparation
          </h1>
        </div>
        <Link
          href="/job-preparation"
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
        >
          ← Back to Job Preparation
        </Link>
      </div>

      <AseDay1InterviewPrep />
    </main>
  );
}
