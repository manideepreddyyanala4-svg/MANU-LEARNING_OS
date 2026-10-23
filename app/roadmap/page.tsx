'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Check, ChevronRight, Sparkles, Target } from 'lucide-react';
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
      subtitle="Step-by-step milestones to secure your technical internship and build a high-value production AI profile."
    >
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600">
          {error}
        </p>
      )}

      <Link href="/roadmap/production-ai" className="group mb-6 block">
        <Card className="border-[var(--accent)]/35 bg-[var(--accent-subtle)]/20 transition group-hover:-translate-y-0.5 group-hover:shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
                  Pinned career track
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[var(--fg)]">
                  Dorsal Project → Production AI
                </h2>
                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                  PyTorch/CV → clean inference → ONNX → FastAPI → SQL → Docker → MLOps → AWS → Kubernetes → security → TensorRT.
                  Includes the separate LLM + RAG portfolio project.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs font-extrabold text-[var(--accent)]">
              <Target size={16} />
              Open roadmap
              <ChevronRight size={15} className="transition group-hover:translate-x-0.5" />
            </div>
          </div>
        </Card>
      </Link>

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
