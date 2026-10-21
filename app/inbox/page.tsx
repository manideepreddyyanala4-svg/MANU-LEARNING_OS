'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Archive,
  ArchiveRestore,
  Check,
  CheckCircle2,
  Copy,
  Filter,
  HelpCircle,
  Inbox as InboxIcon,
  Lightbulb,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
  BookOpen,
  Compass,
} from 'lucide-react';
import { Page, Card, Empty } from '@/components/ui';
import { createClient } from '@/lib/supabase';

type Item = {
  id: string;
  text: string;
  type: string;
  archived_at: string | null;
  created_at: string;
};

const fallbackKey = 'manu-inbox';
const types = [
  { id: 'question', label: 'Question', color: 'text-purple-600 bg-purple-500/10 border-purple-500/20' },
  { id: 'learn_later', label: 'Learn Later', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  { id: 'reminder', label: 'Reminder', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  { id: 'idea', label: 'Idea', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'research', label: 'Research', color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'other', label: 'General', color: 'text-slate-600 bg-slate-500/10 border-slate-500/20' },
] as const;

export default function InboxPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [value, setValue] = useState('');
  const [type, setType] = useState<string>('other');
  const [filter, setFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const client = useMemo(() => createClient(), []);

  useEffect(() => {
    if (window.location.hash === '#capture') {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      if (client) {
        const { data, error: e } = await client
          .from('inbox_items')
          .select('id,text,type,archived_at,created_at')
          .order('created_at', { ascending: false });
        if (active) {
          if (e) setError(e.message);
          else setItems(data ?? []);
        }
      } else {
        try {
          const saved = localStorage.getItem(fallbackKey);
          if (active) setItems(saved ? JSON.parse(saved) : []);
        } catch {
          if (active) setItems([]);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [client]);

  function persist(next: Item[]) {
    setItems(next);
    if (!client) localStorage.setItem(fallbackKey, JSON.stringify(next));
  }

  async function save() {
    const text = value.trim();
    if (!text) return;
    setError('');

    if (client) {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) {
        setError('Sign in required');
        return;
      }

      if (editingId) {
        const { data, error: e } = await client
          .from('inbox_items')
          .update({ text, type })
          .eq('id', editingId)
          .select('id,text,type,archived_at,created_at')
          .single();
        if (e) {
          setError(e.message);
          return;
        }
        persist(items.map((x) => (x.id === editingId ? data : x)));
      } else {
        const { data, error: e } = await client
          .from('inbox_items')
          .insert({ user_id: user.id, text, type })
          .select('id,text,type,archived_at,created_at')
          .single();
        if (e) {
          setError(e.message);
          return;
        }
        persist([data, ...items]);
        await client
          .from('activity_events')
          .insert({
            user_id: user.id,
            event_type: 'inbox_created',
            metadata: { item_id: data.id },
          });
      }
    } else {
      const item: Item = {
        id: crypto.randomUUID(),
        text,
        type,
        archived_at: null,
        created_at: new Date().toISOString(),
      };
      persist(
        editingId
          ? items.map((x) => (x.id === editingId ? { ...x, text, type } : x))
          : [item, ...items]
      );
    }

    setValue('');
    setType('other');
    setEditingId(null);
  }

  async function toggleArchive(item: Item) {
    const archived_at = item.archived_at ? null : new Date().toISOString();
    if (client) {
      const { error: e } = await client
        .from('inbox_items')
        .update({ archived_at })
        .eq('id', item.id);
      if (e) {
        setError(e.message);
        return;
      }
    }
    persist(
      items.map((x) => (x.id === item.id ? { ...x, archived_at } : x))
    );
  }

  async function confirmDelete() {
    if (!itemToDelete) return;
    if (client) {
      const { error: e } = await client
        .from('inbox_items')
        .delete()
        .eq('id', itemToDelete.id);
      if (e) {
        setError(e.message);
        return;
      }
    }
    persist(items.filter((x) => x.id !== itemToDelete.id));
    setItemToDelete(null);
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setValue(item.text);
    setType(item.type);
    inputRef.current?.focus();
  }

  function cancelEdit() {
    setEditingId(null);
    setValue('');
    setType('other');
  }

  function copyText(item: Item) {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Filtered Items
  const visible = useMemo(() => {
    return items.filter((x) => {
      if (filter === 'active' && x.archived_at) return false;
      if (filter === 'archived' && !x.archived_at) return false;
      if (typeFilter !== 'all' && x.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!x.text.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [items, filter, typeFilter, searchQuery]);

  const activeCount = items.filter((x) => !x.archived_at).length;
  const archivedCount = items.filter((x) => x.archived_at).length;

  return (
    <Page
      eyebrow="Triage & Quick Capture"
      title="Inbox"
      subtitle="Zero-friction capture for interview questions, study backlog, and quick notes."
      actions={
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--muted)] shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{activeCount} active items</span>
          </span>
        </div>
      }
    >
      {error && (
        <div role="alert" className="mb-6 flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600 dark:text-red-400">
          <span>{error}</span>
          <button onClick={() => setError('')} className="p-1 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      {/* Prominent Fast Capture Workstation Box */}
      <section className="mb-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <label
            htmlFor="capture"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]"
          >
            <Sparkles size={14} />
            <span>{editingId ? 'Edit Thought' : 'Quick Capture Thought'}</span>
          </label>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="text-xs text-[var(--muted)] hover:underline"
            >
              Cancel edit
            </button>
          )}
        </div>

        {/* Type Selector Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {types.map((t) => {
            const isSelected = type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  isSelected
                    ? `${t.color} font-bold ring-2 ring-[var(--accent)]/30`
                    : 'border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              id="capture"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void save();
                if (e.key === 'Escape' && editingId) cancelEdit();
              }}
              placeholder="Capture a question, idea, or reminder… (Press Enter to save)"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)] shadow-2xs"
            />
          </div>

          <button
            onClick={() => void save()}
            disabled={!value.trim()}
            aria-label={editingId ? 'Save edit' : 'Add capture'}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-6 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--accent-hover)] disabled:opacity-40"
          >
            {editingId ? <Check size={16} /> : <Plus size={16} />}
            <span>{editingId ? 'Save Changes' : 'Capture'}</span>
          </button>
        </div>

        <p className="mt-2 text-[11px] text-[var(--muted)]">
          Tip: Captured items can be transformed into full study notes or tagged for technical interview preparation.
        </p>
      </section>

      {/* Filter Tabs, Type Chips & Search */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-3">
          {/* Main Status Tabs */}
          <div className="flex items-center gap-1">
            {(['active', 'archived', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === tab
                    ? 'bg-[var(--accent)] text-white shadow-2xs'
                    : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]'
                }`}
              >
                <span>{tab}</span>
                <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                  filter === tab ? 'bg-white/20 text-white' : 'bg-[var(--line-subtle)] text-[var(--muted)]'
                }`}>
                  {tab === 'active' ? activeCount : tab === 'archived' ? archivedCount : items.length}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captures…"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--fg)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Type tag filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-[var(--muted)] mr-1">Filter:</span>
          <button
            onClick={() => setTypeFilter('all')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
              typeFilter === 'all'
                ? 'bg-[var(--fg)] text-[var(--bg)] shadow-2xs'
                : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            All Types
          </button>
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                typeFilter === t.id
                  ? 'bg-[var(--accent)] text-white shadow-2xs'
                  : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Captured Items Grid */}
      <div className="space-y-3">
        {visible.map((item) => {
          const typeConfig = types.find((t) => t.id === item.type) || types[5];
          const isCopied = copiedId === item.id;

          return (
            <article
              key={item.id}
              className="group relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xs transition hover:border-color-mix(in srgb, var(--accent) 40%, var(--line)) hover:shadow-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeConfig.color}`}>
                    <Tag size={10} />
                    <span>{typeConfig.label}</span>
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {item.archived_at && (
                    <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Archived
                    </span>
                  )}
                </div>

                <p className="text-sm font-normal text-[var(--fg)] leading-relaxed whitespace-pre-wrap break-words">
                  {item.text}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1 sm:self-start shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--line)]">
                <button
                  onClick={() => copyText(item)}
                  title="Copy thought to clipboard"
                  className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--accent-subtle)] transition"
                >
                  {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>

                <button
                  onClick={() => startEdit(item)}
                  aria-label="Edit"
                  title="Edit thought"
                  className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => void toggleArchive(item)}
                  aria-label={item.archived_at ? 'Restore' : 'Archive'}
                  title={item.archived_at ? 'Restore to active' : 'Archive thought'}
                  className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:text-amber-600 hover:bg-amber-500/10 transition"
                >
                  {item.archived_at ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                </button>

                <button
                  onClick={() => setItemToDelete(item)}
                  aria-label="Delete"
                  title="Delete thought"
                  className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          );
        })}

        {!visible.length && (
          <div className="py-16 text-center">
            <Empty
              title={
                filter === 'archived'
                  ? 'No archived captures'
                  : searchQuery
                  ? `No items matching "${searchQuery}"`
                  : 'Your inbox is clear'
              }
              description={
                filter === 'archived'
                  ? 'Archived thoughts will be stored here for future reference.'
                  : 'Use the capture bar above to quickly record interview questions, study items, or reminders.'
              }
            />
            {filter !== 'active' && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setFilter('active');
                    setTypeFilter('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--fg)] hover:bg-[var(--accent-subtle)]"
                >
                  <RotateCcw size={13} /> View Active Inbox
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          className="learning-dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setItemToDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-item-title"
            className="learning-dialog"
          >
            <h2 id="delete-item-title">Delete Captured Thought?</h2>
            <p>
              This capture will be permanently deleted from your inbox. This cannot be undone.
            </p>
            <div className="my-2 rounded-lg bg-[var(--bg)] p-3 text-xs text-[var(--fg)] italic line-clamp-3">
              &ldquo;{itemToDelete.text}&rdquo;
            </div>
            <div>
              <button onClick={() => setItemToDelete(null)}>Cancel</button>
              <button
                onClick={() => void confirmDelete()}
                className="!bg-red-600 hover:!bg-red-700 !text-white"
              >
                Delete Thought
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}