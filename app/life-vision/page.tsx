'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen, Brain, Check, Compass, Dumbbell, Globe2, Heart,
  LockKeyhole, Pencil, Plus, RefreshCw, Shield, Trash2, Wallet, X,
} from 'lucide-react';
import { Page } from '@/components/ui';
import { createClient } from '@/lib/supabase';

type Principle = {
  id: string;
  title: string;
  body: string;
  sort_order: number;
  active: boolean;
};

const principleIcons = [Compass, Heart, Dumbbell, Shield, Brain, BookOpen, Globe2, Wallet];

export default function LifeVisionPage() {
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftActive, setDraftActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const client = createClient();
      if (!client) throw new Error('Private storage is not configured.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to view your private life vision.');

      const { data, error: queryError } = await client
        .from('mission_rules')
        .select('id,title,body,sort_order,active')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      if (queryError) throw queryError;
      setPrinciples((data ?? []) as Principle[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load life vision.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function beginEdit(principle?: Principle) {
    setNotice('');
    setError('');
    setEditingId(principle?.id ?? 'new');
    setDraftTitle(principle?.title ?? '');
    setDraftBody(principle?.body ?? '');
    setDraftActive(principle?.active ?? true);
  }

  function cancelEdit() {
    if (busy) return;
    setEditingId(null);
  }

  async function save() {
    const title = draftTitle.trim();
    const body = draftBody.trim();
    if (!title || !body) {
      setError('Add both a title and a description before saving.');
      return;
    }
    if (busy || !editingId) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const client = createClient();
      if (!client) throw new Error('Private storage is not configured.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in before saving.');

      const fields = { title, body, active: draftActive };
      const query = editingId === 'new'
        ? client.from('mission_rules').insert({
            ...fields,
            user_id: user.id,
            sort_order: Math.max(0, ...principles.map((entry) => entry.sort_order)) + 10,
          })
        : client.from('mission_rules').update(fields).eq('id', editingId).eq('user_id', user.id);
      const { data, error: saveError } = await query
        .select('id,title,body,sort_order,active')
        .single();
      if (saveError) throw saveError;
      const saved = data as Principle;
      setPrinciples((previous) =>
        [...previous.filter((entry) => entry.id !== saved.id), saved]
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      setEditingId(null);
      setNotice('Saved to your private ManuOS account.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your changes.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(principle: Principle) {
    if (busy || !window.confirm('Permanently delete this life principle?')) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const client = createClient();
      if (!client) throw new Error('Private storage is not configured.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in before deleting.');
      const { error: deleteError } = await client
        .from('mission_rules')
        .delete()
        .eq('id', principle.id)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      setPrinciples((previous) => previous.filter((entry) => entry.id !== principle.id));
      setNotice('Principle deleted.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete principle.');
    } finally {
      setBusy(false);
    }
  }

  const activeCount = principles.filter((entry) => entry.active).length;

  return (
    <Page
      eyebrow="Personal direction"
      title="My Life Vision"
      subtitle="The life you choose to build. Keep your values clear while your plans evolve."
      actions={
        <button type="button" onClick={() => beginEdit()} disabled={busy || loading || editingId !== null}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          <Plus size={17} /> Add principle
        </button>
      }
    >
      <div className="mb-7 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--accent)]">
              <Compass size={14} /> Your long-term compass
            </span>
            <h2 className="mt-4 max-w-2xl text-xl font-extrabold tracking-tight text-[var(--fg)] sm:text-2xl">
              A life defined by your own values
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              These principles are a direction, not another performance score. Review them when
              making major decisions and revise them as you grow.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--muted)]">
              <LockKeyhole size={14} /> Stored in your signed-in account, protected by owner-only database access
            </div>
          </div>
          <div className="flex gap-3 lg:flex-col lg:items-end">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-5 py-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-[var(--fg)]">{principles.length}</p>
              <p className="text-xs text-[var(--muted)]">Principles</p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-5 py-3 text-center">
              <p className="text-2xl font-extrabold tabular-nums text-[var(--fg)]">{activeCount}</p>
              <p className="text-xs text-[var(--muted)]">Active</p>
            </div>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</div>}
      {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{notice}</div>}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-6 text-sm text-[var(--muted)]">
          <RefreshCw className="animate-spin" size={17} /> Loading your private principles…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {principles.map((principle, index) => {
            const Icon = principleIcons[index % principleIcons.length];
            return (
              <article key={principle.id} className="flex min-w-0 flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs sm:p-6">
                {editingId === principle.id ? (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[var(--muted)]">
                      Principle title
                      <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} maxLength={120}
                        className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm font-medium text-[var(--fg)]" />
                    </label>
                    <label className="block text-xs font-bold text-[var(--muted)]">
                      What this means to me
                      <textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} rows={7} maxLength={5000}
                        className="mt-2 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm font-normal leading-6 text-[var(--fg)]" />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[var(--fg)]">
                      <input type="checkbox" checked={draftActive} onChange={(event) => setDraftActive(event.target.checked)} />
                      Active principle
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => void save()} disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Check size={16} /> Save</button>
                      <button type="button" onClick={cancelEdit} disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--fg)] disabled:opacity-50"><X size={16} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                        <Icon size={21} />
                      </div>
                      <div className="flex items-center gap-1">
                        {!principle.active && <span className="mr-1 rounded-full bg-[var(--bg)] px-2 py-1 text-xs text-[var(--muted)]">Paused</span>}
                        <button type="button" aria-label={`Edit ${principle.title}`} title="Edit"
                          onClick={() => beginEdit(principle)} disabled={editingId !== null || busy}
                          className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] disabled:opacity-40"><Pencil size={16} /></button>
                        <button type="button" aria-label={`Delete ${principle.title}`} title="Delete"
                          onClick={() => void remove(principle)} disabled={editingId !== null || busy}
                          className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-extrabold leading-7 tracking-tight text-[var(--fg)]">{principle.title}</h3>
                    <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">{principle.body}</p>
                  </>
                )}
              </article>
            );
          })}

          {editingId === 'new' && (
            <section className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--surface)] p-5 sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-[var(--fg)]">New life principle</h3>
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[var(--muted)]">
                  Title
                  <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} maxLength={120}
                    placeholder="Name the principle"
                    className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--fg)]" />
                </label>
                <label className="block text-xs font-bold text-[var(--muted)]">
                  Why it matters
                  <textarea value={draftBody} onChange={(event) => setDraftBody(event.target.value)} rows={6} maxLength={5000}
                    placeholder="Describe what kind of life you want to build"
                    className="mt-2 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-sm leading-6 text-[var(--fg)]" />
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void save()} disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Check size={16} /> Save</button>
                  <button type="button" onClick={cancelEdit} disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--fg)] disabled:opacity-50"><X size={16} /> Cancel</button>
                </div>
              </div>
            </section>
          )}

          {principles.length === 0 && editingId !== 'new' && (
            <div className="md:col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-12 text-center">
              <Compass className="mx-auto text-[var(--accent)]" size={30} />
              <h3 className="mt-3 text-lg font-bold text-[var(--fg)]">Your vision starts here</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">Add your first principle to keep it available whenever you need direction.</p>
              <button type="button" onClick={() => beginEdit()} className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white">Add first principle</button>
            </div>
          )}
        </div>
      )}
      <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 text-sm leading-6 text-[var(--muted)]">
        <span className="font-bold text-[var(--fg)]">Daily reminder:</span> Use your time and attention to move toward these principles, without turning every goal into a deadline.
      </div>
    </Page>
  );
}
