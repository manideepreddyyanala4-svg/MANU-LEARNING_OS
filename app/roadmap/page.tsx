'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Compass, Sparkles, Target } from 'lucide-react';
import { Page, Card } from '@/components/ui';
import { loadRoadmap, type RoadmapItem } from '@/lib/store';

export default function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoadmap().then(setItems).catch((e) => setError(e.message));
  }, []);

  return (
    <Page
      eyebrow="Milestone Sequence"
      title="Technical Roadmap"
      subtitle="Step-by-step milestones to secure your technical internship."
    >
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, i) => {
          const isCompleted = item.status === 'completed';
          const isCurrent = item.is_current;

          return (
            <Link href={`/roadmap/${item.slug}`} key={item.id} className="group">
              <Card
                className={`h-full transition hover:-translate-y-0.5 hover:shadow-xs ${
                  isCurrent
                    ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30 bg-[var(--accent-subtle)]/20'
                    : 'border-[var(--line)]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={`grid h-6 w-6 place-items-center rounded-lg ${
                    isCurrent ? 'bg-[var(--accent)] text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]'
                  }`}>
                    {isCompleted ? <Check size={12} /> : i + 1}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    isCurrent ? 'text-[var(--accent)]' : isCompleted ? 'text-emerald-600' : 'text-[var(--muted)]'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <h2 className="mt-6 text-lg font-bold text-[var(--fg)] group-hover:text-[var(--accent)] transition">
                  {item.title}
                </h2>

                <div className="mt-6 flex items-center justify-between text-xs text-[var(--muted)] pt-3 border-t border-[var(--line-subtle)]">
                  <span>{isCurrent ? 'Active Focus' : isCompleted ? 'Completed' : 'Upcoming'}</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}