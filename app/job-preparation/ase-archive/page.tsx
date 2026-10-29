import Link from 'next/link';
import { Page } from '@/components/ui';

const resources = [
  {
    href: '/job-preparation/ase-final-interview-bank',
    title: 'ASE PTE Final Interview Bank',
    detail: '397 question-and-answer prompts spanning projects, technical topics, HR, language and company knowledge.',
  },
  {
    href: '/job-preparation/ase-day-1',
    title: 'ASE Day 1 — Foundations',
    detail: 'Research project explanations and introductory ASE preparation.',
  },
  {
    href: '/job-preparation/ase-day-2',
    title: 'ASE Day 2 — Technical',
    detail: 'Deep learning fundamentals, packaging, wafer and test engineering study.',
  },
  {
    href: '/ase-final-day',
    title: 'ASE Final-Day Review',
    detail: 'Saved final revision pack and concise interview answers.',
  },
  {
    href: '/ase-quick-prep',
    title: 'ASE Quick Preparation',
    detail: 'Fast revision for whenever the ASE interview becomes relevant again.',
  },
] as const;

export default function AseArchivePage() {
  return (
    <Page
      eyebrow="Saved for Later · On Hold"
      title="ASE Interview Archive"
      subtitle="All ASE Product Test Engineer preparation is preserved. The active priority is now AI, computer vision and software internship applications."
    >
      <div className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="text-sm font-bold text-[var(--fg)]">Nothing here has been deleted.</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Return to these notes if ASE PTE becomes relevant again. Equipment Engineer and
          hands-on machine maintenance are not part of the current target career path.
        </p>
        <Link
          href="/job-preparation"
          className="mt-4 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Back to internship applications
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {resources.map((resource) => (
          <Link
            key={resource.href}
            href={resource.href}
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition hover:border-[var(--accent)]"
          >
            <h2 className="font-bold text-[var(--fg)]">{resource.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{resource.detail}</p>
            <p className="mt-3 text-xs font-bold text-[var(--accent)]">Open saved material →</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}
