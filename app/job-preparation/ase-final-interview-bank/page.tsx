import Link from 'next/link';
import { AseFinalInterviewBank } from '@/components/ase-final-interview/ase-final-interview-bank';

export default function AseFinalInterviewBankPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
            Job Preparation · ASE
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-[var(--fg)]">
            Final Interview Bank
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Separate from the older technical-study pages. This bank is for interview performance: story, resume, project defense, PTE, HR, behavioral, language, traps, and closing questions.
          </p>
        </div>
        <Link
          href="/job-preparation"
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
        >
          ← Job Preparation
        </Link>
      </div>
      <AseFinalInterviewBank />
    </main>
  );
}
