'use client';
import { useEffect, useMemo, useState } from 'react';
import { Archive, Plus, Trash2 } from 'lucide-react';
import { Page, Empty } from '@/components/ui';
import { createClient } from '@/lib/supabase';

type Item = { id: string; text: string; type: string; archived_at?: string | null; created_at: string };
const fallbackKey = 'manu-inbox';
export default function Inbox() {
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<'active'|'archived'>('active');
  const client = useMemo(() => createClient(), []);
  useEffect(() => {
    let active = true;
    async function load() {
      if (client) {
        const { data } = await client.from('inbox_items').select('*').order('created_at', { ascending: false });
        if (active && data) setItems(data);
      } else {
        const saved = localStorage.getItem(fallbackKey);
        if (active) setItems(saved ? JSON.parse(saved) : []);
      }
    }
    load(); return () => { active = false; };
  }, [client]);
  function persist(next: Item[]) { setItems(next); if (!client) localStorage.setItem(fallbackKey, JSON.stringify(next)); }
  async function add() {
    const value = text.trim(); if (!value) return;
    if (client) {
      const { data } = await client.from('inbox_items').insert({ text: value, type: 'other' }).select().single();
      if (data) setItems(current => [data, ...current]);
    } else persist([{ id: crypto.randomUUID(), text: value, type: 'other', created_at: new Date().toISOString() }, ...items]);
    setText('');
  }
  async function archive(item: Item) {
    const archived_at = item.archived_at ? null : new Date().toISOString();
    if (client) await client.from('inbox_items').update({ archived_at }).eq('id', item.id);
    persist(items.map(x => x.id === item.id ? { ...x, archived_at } : x));
  }
  async function remove(item: Item) {
    if (client) await client.from('inbox_items').delete().eq('id', item.id);
    persist(items.filter(x => x.id !== item.id));
  }
  const visible = items.filter(item => filter === 'archived' ? item.archived_at : !item.archived_at);
  return <Page eyebrow="Capture and sort" title="Inbox"><div className="mt-8 flex max-w-2xl gap-2"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="Capture a thought…" className="min-w-0 flex-1 rounded-lg border bg-transparent p-3"/><button onClick={add} aria-label="Add capture" className="rounded-lg bg-[#ff6b35] px-4 text-white"><Plus size={18}/></button></div><div className="mt-6 flex gap-2 text-sm"><button onClick={()=>setFilter('active')} className={filter==='active'?'font-bold':''}>Active</button><button onClick={()=>setFilter('archived')} className={filter==='archived'?'font-bold':''}>Archived</button></div><div className="mt-4 max-w-2xl space-y-2">{visible.length ? visible.map(item=><article key={item.id} className="flex items-center gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10"><span className="min-w-0 flex-1">{item.text}</span><button onClick={()=>archive(item)} aria-label={item.archived_at?'Restore':'Archive'}><Archive size={17}/></button><button onClick={()=>remove(item)} aria-label="Delete"><Trash2 size={17}/></button></article>) : <Empty title={filter==='active'?'Inbox is clear':'No archived captures'} description="Quick captures, links, and thoughts will land here."/>}</div></Page>;
}
