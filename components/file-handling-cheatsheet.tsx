'use client';

import { useMemo, useState } from 'react';
import type { PartialBlock } from '@blocknote/core';
import {
  BookOpen, Check, ChevronDown, ChevronUp, Clipboard, Code2,
  Copy, FileText, FolderOpen, Search, ShieldAlert, Sparkles,
} from 'lucide-react';

type NoteBlock = PartialBlock;
type Group = { title: string; key: string; blocks: NoteBlock[] };
const palettes = [
  { frame: 'border-indigo-200/80 dark:border-indigo-800', stripe: 'bg-indigo-500', heading: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50/60 dark:bg-indigo-950/15' },
  { frame: 'border-amber-200/80 dark:border-amber-800', stripe: 'bg-amber-500', heading: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-50/60 dark:bg-amber-950/15' },
  { frame: 'border-sky-200/80 dark:border-sky-800', stripe: 'bg-sky-500', heading: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50/60 dark:bg-sky-950/15' },
  { frame: 'border-rose-200/80 dark:border-rose-800', stripe: 'bg-rose-500', heading: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50/60 dark:bg-rose-950/15' },
  { frame: 'border-emerald-200/80 dark:border-emerald-800', stripe: 'bg-emerald-500', heading: 'text-emerald-800 dark:text-emerald-300', bg: 'bg-emerald-50/60 dark:bg-emerald-950/15' },
  { frame: 'border-fuchsia-200/80 dark:border-fuchsia-800', stripe: 'bg-fuchsia-500', heading: 'text-fuchsia-700 dark:text-fuchsia-300', bg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/15' },
];

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(toText).join('');
  if (value && typeof value === 'object') {
    const item = value as { text?: string; content?: unknown };
    if (typeof item.text === 'string') return item.text;
    return toText(item.content);
  }
  return '';
}

function blockText(block: NoteBlock) { return toText(block.content); }

function CodeSnippet({ content, language }: { content: string; language: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-300"><Code2 size={12} />{language}</span>
        <button type="button" onClick={() => {
          void navigator.clipboard.writeText(content).then(() => setCopied(true)).catch(() => setCopied(false));
        }} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10" aria-label="Copy code">
          {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-emerald-200 sm:text-[13px]"><code>{content}</code></pre>
    </div>
  );
}

function ContentBlock({ block }: { block: NoteBlock }) {
  const text = blockText(block);
  if (block.type === 'codeBlock') return <CodeSnippet content={text} language={String((block.props as { language?: string } | undefined)?.language || 'python')} />;
  if (block.type === 'heading') return <h3 className="mt-3 text-sm font-extrabold text-[var(--fg)]">{text}</h3>;
  if (block.type === 'bulletListItem') return <p className="flex gap-2 py-0.5 text-[13px] leading-6 text-[var(--fg)]"><span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-violet-500" /><span>{text}</span></p>;
  if (block.type === 'quote') return <p className="my-2 rounded-r-lg border-l-4 border-amber-500 bg-amber-100/70 px-3 py-2 text-[13px] font-medium leading-6 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">{text}</p>;
  if (block.type === 'divider') return <hr className="my-3 border-[var(--line)]" />;
  if (!text.trim()) return null;
  return <p className="py-0.5 text-[13px] leading-6 text-[var(--fg)]">{text}</p>;
}

const coreModes = [
  { key: 'r', title: 'Read', description: 'Existing file only', className: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/35 dark:text-sky-200' },
  { key: 'w', title: 'Write', description: 'ERASES old text', className: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/35 dark:text-rose-200' },
  { key: 'a', title: 'Append', description: 'Adds at the end', className: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200' },
  { key: 'x', title: 'Create', description: 'Fails if it exists', className: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/35 dark:text-violet-200' },
];

export default function FileHandlingCheatSheet({ blocks, onStartEdit }: { blocks: NoteBlock[]; onStartEdit: () => void }) {
  const groups = useMemo(() => {
    const result: Group[] = [];
    for (const block of blocks) {
      const isSection = block.type === 'heading' && Number((block.props as { level?: number } | undefined)?.level) === 2;
      if (isSection) {
        result.push({ title: blockText(block), key: String(result.length), blocks: [] });
      } else if (result.length) {
        result[result.length - 1].blocks.push(block);
      }
    }
    return result;
  }, [blocks]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>(['0', '1', '2']);
  const [copiedAll, setCopiedAll] = useState(false);
  const matches = groups.filter(g => !search.trim() || (g.title + ' ' + g.blocks.map(blockText).join(' ')).toLowerCase().includes(search.toLowerCase().trim()));
  const totalExamples = groups.reduce((sum, group) => sum + group.blocks.filter(b => b.type === 'codeBlock').length, 0);
  const allText = blocks.map(blockText).filter(Boolean).join('\n\n');

  function toggle(key: string) {
    setExpanded(items => items.includes(key) ? items.filter(item => item !== key) : [...items, key]);
  }

  return (
    <div className="space-y-5 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-600 p-5 text-white shadow-lg sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="relative">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/85"><Sparkles size={15} /> Python • Quick Revision</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">File handling, at a glance.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">Short meanings, correct syntax, real code. Pick one topic when you need to revise — no long lectures.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">{groups.length} sections</span>
            <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">{totalExamples} code examples</span>
            <button type="button" onClick={() => {
              void navigator.clipboard.writeText(allText).then(() => setCopiedAll(true)).catch(() => setCopiedAll(false));
            }} className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-bold transition hover:bg-white/25">
              {copiedAll ? <Check size={14} /> : <Clipboard size={14} />}{copiedAll ? 'Copied all notes' : 'Copy all notes'}
            </button>
            <button type="button" onClick={onStartEdit} className="rounded-lg border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-bold transition hover:bg-white/25">Edit my notes</button>
          </div>
        </div>
      </section>

      <section aria-label="Quick file mode reference" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2"><BookOpen size={17} className="text-violet-600 dark:text-violet-300" /><h3 className="text-sm font-black text-[var(--fg)]">Remember these 4 modes first</h3></div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {coreModes.map(mode => (
            <div key={mode.key} className={'rounded-xl border p-3 ' + mode.className}>
              <div className="font-mono text-2xl font-black">{mode.key}</div>
              <p className="text-xs font-extrabold">{mode.title}</p>
              <p className="mt-1 text-[11px]">{mode.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]"><strong>+</strong> = read AND write · <strong>b</strong> = bytes instead of text · <strong>t</strong> = text (default) · <strong>UTF-8</strong> = rules for turning text into bytes</p>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 sm:items-center">
          <label className="flex min-w-[185px] flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3">
            <Search size={16} className="text-[var(--muted)]" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find: r+, utf-8, seek, errors..." aria-label="Search file handling notes" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[var(--fg)] outline-none" />
          </label>
          <button className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--fg)]" type="button" onClick={() => setExpanded(groups.map(g => g.key))}>Expand all</button>
          <button className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--fg)]" type="button" onClick={() => setExpanded([])}>Collapse all</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {groups.map(group => <a key={group.key} href={'#file-cheat-' + group.key} onClick={() => setExpanded(items => items.includes(group.key) ? items : [...items, group.key])} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-800 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/25 dark:text-violet-200">{group.title.replace(/^\d+\.\s*/, '')}</a>)}
        </div>
        <p className="mt-2 text-[11px] text-[var(--muted)]">Showing {matches.length} of {groups.length} sections. Open a card for short examples.</p>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        {matches.map(group => {
          const index = Number(group.key);
          const theme = palettes[index % palettes.length];
          const show = Boolean(search.trim()) || expanded.includes(group.key);
          const first = group.blocks.find(b => b.type === 'paragraph' || b.type === 'quote');
          const summary = first ? blockText(first).slice(0, 145) : 'Quick syntax and revision notes';
          return (
            <section id={'file-cheat-' + group.key} key={group.key} className={'scroll-mt-28 overflow-hidden rounded-2xl border shadow-sm ' + theme.frame + ' ' + theme.bg}>
              <div className={'h-1 w-full ' + theme.stripe} />
              <button type="button" aria-expanded={show} onClick={() => toggle(group.key)} className="flex w-full items-start justify-between gap-2 p-4 text-left">
                <span className="min-w-0">
                  <span className={'flex items-center gap-2 text-sm font-extrabold ' + theme.heading}><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/80 font-mono text-xs shadow-sm dark:bg-white/10">{String(index+1).padStart(2, '0')}</span>{group.title.replace(/^\d+\.\s*/, '')}</span>
                  {!show && <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">{summary}</span>}
                </span>
                {show ? <ChevronUp size={16} className="shrink-0 text-[var(--muted)]" /> : <ChevronDown size={16} className="shrink-0 text-[var(--muted)]" />}
              </button>
              {show && <div className="border-t border-current/10 bg-[var(--surface)]/80 px-4 pb-4 pt-3">
                {group.blocks.map((block, itemIndex) => <ContentBlock key={itemIndex} block={block} />)}
              </div>}
            </section>
          );
        })}
        {matches.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">No matching topic. Try “write”, “binary”, “read”, or “r+”.</div>}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
        <p className="flex items-center gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldAlert size={16} className="shrink-0 text-amber-500" /> Test destructive modes like w and w+ on disposable files, never on your research data.</p>
        <FileText size={18} className="shrink-0 text-[var(--muted)]" />
      </div>
    </div>
  );
}
