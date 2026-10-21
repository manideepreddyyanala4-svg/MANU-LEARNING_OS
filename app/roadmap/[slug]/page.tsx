'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { Page, Card, Empty } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { loadRoadmap, type RoadmapItem } from '@/lib/store';

export default function RoadmapDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoadmap().then(setItems).catch((e) => setError(e.message));
  }, []);

  const item = items.find((x) => x.slug === slug);
  const index = items.findIndex((x) => x.slug === slug);

  async function changeStatus(status: RoadmapItem['status']) {
    if (!item) return;
    const client = createClient();
    if (!client) return;
    const { error: e } = await client
      .from('roadmap_items')
      .update({ status })
      .eq('id', item.id);
    if (e) {
      setError(e.message);
      return;
    }
    await client.from('activity_events').insert({
      user_id: (await client.auth.getUser()).data.user?.id,
      event_type: 'roadmap_status_changed',
      metadata: { item_id: item.id, status },
    });
    setItems(items.map((x) => (x.id === item.id ? { ...x, status } : x)));
    router.refresh();
  }

  async function setCurrent() {
    if (!item) return;
    const client = createClient();
    if (!client) return;
    const { error: e } = await client.rpc('set_current_roadmap', {
      target_id: item.id,
    });
    if (e) {
      setError(e.message);
      return;
    }
    setItems(await loadRoadmap());
    router.refresh();
  }

  return (
    <Page
      eyebrow="Milestone Detail"
      title={item?.title ?? 'Loading topic…'}
      subtitle="Milestone objective and associated curriculum progress."
      actions={
        <Link
          href="/progress"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--fg)] hover:bg-[var(--accent-subtle)]"
        >
          <ArrowLeft size={13} /> Back to Telemetry
        </Link>
      }
    >
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600">
          {error}
        </p>
      )}

      {item && (
        <div className="max-w-3xl space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Milestone Status
                </span>
                <p className="mt-1 text-sm font-bold capitalize text-[var(--fg)]">
                  {item.status.replace('_', ' ')}
                  {item.is_current && (
                    <span className="ml-2 rounded-md bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Active Focus
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  id="roadmap-status"
                  aria-label="Change status"
                  value={item.status}
                  onChange={(e) => void changeStatus(e.target.value as RoadmapItem['status'])}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold text-[var(--fg)] outline-none focus:border-[var(--accent)]"
                >
                  {(['upcoming', 'in_progress', 'completed', 'review'] as const).map((x) => (
                    <option key={x} value={x}>
                      {x.replace('_', ' ')}
                    </option>
                  ))}
                </select>

                {!item.is_current && (
                  <button
                    onClick={() => void setCurrent()}
                    className="rounded-xl bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[var(--accent-hover)] transition"
                  >
                    Set as active focus
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-semibold">
              {index > 0 ? (
                <Link
                  href={`/roadmap/${items[index - 1].slug}`}
                  className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline"
                >
                  <ArrowLeft size={13} /> {items[index - 1].title}
                </Link>
              ) : <div />}

              {index < items.length - 1 && (
                <Link
                  href={`/roadmap/${items[index + 1].slug}`}
                  className="inline-flex items-center gap-1.5 text-[var(--accent)] hover:underline"
                >
                  {items[index + 1].title} <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </Card>
        </div>
      )}
    </Page>
  );
}