import type { InterviewBrief } from '@/lib/interview-foundations';

/** A visible, short, spoken definition plus one learner-controlled interview rehearsal.
 * Read-only: never edits personal notes or assessment status.
 */
export function InterviewFoundation({ brief }: { brief?: InterviewBrief }) {
  if (!brief) return null;
  return (
    <section aria-label={`Interview definition: ${brief.term}`}
      className="my-5 min-w-0 rounded-2xl border border-[var(--line-strong)] bg-[var(--surface)] p-4 sm:p-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Interview foundation · learn this first</p>
      <h2 className="text-lg font-bold leading-snug text-[var(--fg)] sm:text-xl">What is {brief.term}?</h2>
      <p className="mt-3 text-base leading-7 text-[var(--fg)]"><strong>Definition:</strong> {brief.definition}</p>
      <p className="mt-3 text-base leading-7 text-[var(--fg)]"><strong>Why it matters:</strong> {brief.why}</p>
      <p className="mt-3 text-base leading-7 text-[var(--fg)]"><strong>Simple example:</strong> {brief.example}</p>
      <div className="mt-5 border-t border-[var(--line)] pt-4">
        <p className="text-sm font-semibold leading-6 text-[var(--fg)]">Interview follow-up: {brief.followUp}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Try answering aloud before revealing the example answer.</p>
        <details className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--fg)]">Reveal a short model answer</summary>
          <p className="mt-3 text-base leading-7 text-[var(--fg)]">{brief.followUpAnswer}</p>
        </details>
      </div>
    </section>
  );
}
