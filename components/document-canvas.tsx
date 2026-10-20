'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/react/style.css';
import { BlockNoteView } from '@blocknote/shadcn';
import { useCreateBlockNote } from '@blocknote/react';
import type { PartialBlock } from '@blocknote/core';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, FileText, ImagePlus, Loader2, Paperclip, X } from 'lucide-react';

type SaveState = 'saved' | 'saving' | 'unsaved' | 'error' | 'recovered';
type Props = {
  topicId: string;
  initialContent: PartialBlock[];
  editable: boolean;
  onSave: (content: PartialBlock[], plainText: string) => Promise<void>;
  onUpload?: (file: File) => Promise<string>;
};

function textOf(blocks: PartialBlock[]): string {
  return blocks.map((block) => {
    const content = Array.isArray(block.content) ? block.content.map((item) => typeof item === 'string' ? item : (item as {text?: string}).text ?? '').join('') : '';
    return [content, block.children ? textOf(block.children) : ''].filter(Boolean).join('\n');
  }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function DocumentCanvas({ topicId, initialContent, editable, onSave, onUpload }: Props) {
  const editor = useCreateBlockNote({ initialContent: initialContent.length ? initialContent : undefined });
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<SaveState>('saved');
  const [uploadError, setUploadError] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const wasEditable = useRef(editable);
  const recoveryKey = `manuos:document:${topicId}`;

  // Persist the current editor document. `force` bypasses the editable guard so
  // we can flush a pending draft when the user leaves edit mode.
  async function persist(force = false) {
    if (!editable && !force) return;
    setState('saving');
    const content = editor.document as PartialBlock[];
    try {
      await onSave(content, textOf(content));
      try { localStorage.removeItem(recoveryKey); } catch { /* storage may be unavailable */ }
      setState('saved');
    } catch {
      setState('error');
    }
  }
  function changed() {
    if (!editable) return;
    setState('unsaved');
    try { localStorage.setItem(recoveryKey, JSON.stringify(editor.document)); } catch { /* storage may be unavailable */ }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void persist(), 900);
  }

  // Recovery + keyboard shortcuts.
  useEffect(() => {
    let draft: string | null = null;
    try { draft = localStorage.getItem(recoveryKey); } catch { /* ignore */ }
    if (draft && editable && window.confirm('Recover your unsaved local draft for this topic?')) {
      try { editor.replaceBlocks(editor.document, JSON.parse(draft)); window.setTimeout(() => setState('recovered'), 0); }
      catch { try { localStorage.removeItem(recoveryKey); } catch { /* ignore */ } }
    }
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); void persist(true); }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); window.clearTimeout(timer.current); };
    // editor is stable for the lifetime of this topic document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, recoveryKey]);

  // Flush any pending edits the moment the user switches back to Study mode so
  // the published view never shows stale content.
  useEffect(() => {
    if (wasEditable.current && !editable) {
      window.clearTimeout(timer.current);
      // Defer so we don't update state synchronously inside the effect body.
      if (state === 'unsaved' || state === 'saving') window.setTimeout(() => void persist(true), 0);
    }
    wasEditable.current = editable;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable]);

  async function insertFile(file: File): Promise<void> {
    if (!onUpload) throw new Error('File uploads are unavailable.');
    const url = await onUpload(file);
    let cursor = editor.document[editor.document.length - 1];
    try { cursor = editor.getTextCursorPosition().block; } catch { /* file picker can steal focus from the editor */ }
    if (!cursor) throw new Error('Could not find an insertion point.');
    const block: PartialBlock = file.type.startsWith('image/')
      ? { type: 'image', props: { url, name: file.name, caption: '' } }
      // Non-image resources keep their stable authenticated URL on a native file
      // block — never flattened to plain text, so they survive save + reload.
      : { type: 'file', props: { url, name: file.name, caption: '' } };
    editor.insertBlocks([block], cursor, 'after');
  }
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setState('saving'); setUploadError('');
    try {
      await insertFile(file);
      changed();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      setState(editable ? 'unsaved' : 'saved');
    } finally {
      // Only clear the input after the awaited upload + insertion has completed.
      event.target.value = '';
    }
  }

  if (!editable) return <StudyDocument blocks={initialContent} />;

  return <section className="document-canvas">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {onUpload && <>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--rust)] hover:text-[var(--fg)]">
            <ImagePlus size={14} /> Image
            <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--rust)] hover:text-[var(--fg)]">
            <Paperclip size={14} /> File
            <input className="sr-only" type="file" accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
          </label>
        </>}
      </div>
      <SaveBadge state={state} />
    </div>
    {uploadError && <p role="alert" className="mb-3 text-xs text-red-600">{uploadError}</p>}
    <BlockNoteView editor={editor} editable onChange={changed} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
    <p className="mt-4 text-[11px] text-[var(--muted)]">Autosaves as you pause · ⌘/Ctrl+S to save now · type <kbd className="rounded bg-black/5 px-1 dark:bg-white/10">/</kbd> for blocks</p>
  </section>;
}

function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { label: string; icon: React.ReactNode; tone: string }> = {
    saved: { label: 'Saved', icon: <Check size={13} />, tone: 'text-[var(--muted)]' },
    saving: { label: 'Saving…', icon: <Loader2 size={13} className="animate-spin" />, tone: 'text-[var(--muted)]' },
    unsaved: { label: 'Unsaved changes', icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />, tone: 'text-amber-600' },
    error: { label: 'Saved locally · retrying', icon: <span className="h-1.5 w-1.5 rounded-full bg-red-500" />, tone: 'text-red-600' },
    recovered: { label: 'Recovered local draft', icon: <Check size={13} />, tone: 'text-[var(--rust)]' },
  };
  const { label, icon, tone } = map[state];
  return <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone}`}>{icon}{label}</span>;
}

function StudyDocument({ blocks }: { blocks: PartialBlock[] }) {
  const [zoom, setZoom] = useState<{ url: string; alt: string } | null>(null);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);
  return <>
    <article className="study-document">
      {blocks.length
        ? blocks.map((block, index) => <StudyBlock key={block.id ?? index} block={block} index={index} onZoom={setZoom} />)
        : <p className="py-16 text-center text-[var(--muted)]">This topic is empty. Switch to Edit to start writing.</p>}
    </article>
    {zoom && <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setZoom(null)}>
      <button aria-label="Close image" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20" onClick={() => setZoom(null)}><X size={20} /></button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={zoom.url} alt={zoom.alt} className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
    </div>}
  </>;
}

function inlineText(item: unknown): string {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return '';
  const value = item as { text?: string; content?: unknown };
  if (typeof value.text === 'string') return value.text;
  if (Array.isArray(value.content)) return value.content.map(inlineText).join('');
  return typeof value.content === 'string' ? value.content : '';
}

function StudyBlock({ block, index, onZoom }: { block: PartialBlock; index: number; onZoom: (v: { url: string; alt: string }) => void }) {
  const content = Array.isArray(block.content) ? block.content.map((item) => inlineText(item)).join('') : '';

  if (block.type === 'heading') {
    const level = Number((block.props as { level?: number } | undefined)?.level ?? 1);
    const Tag = level === 3 ? 'h3' : level === 2 ? 'h2' : 'h1';
    return <Tag id={`topic-heading-${index}`} className="study-h scroll-mt-28">{content}</Tag>;
  }
  if (block.type === 'bulletListItem') return <li className="study-li list-disc"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown></li>;
  if (block.type === 'numberedListItem') return <li className="study-li list-decimal"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown></li>;
  if (block.type === 'checkListItem') return <label className="my-1 flex items-start gap-3"><input type="checkbox" className="mt-1.5 accent-[var(--rust)]" checked={Boolean((block.props as { checked?: boolean } | undefined)?.checked)} readOnly /><span><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown></span></label>;
  if (block.type === 'codeBlock') return <pre className="study-pre"><code>{content}</code></pre>;
  if (block.type === 'quote') return <blockquote className="study-quote"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown></blockquote>;
  if (block.type === 'image') {
    const props = block.props as { url?: string; caption?: string; name?: string } | undefined;
    if (!props?.url) return null;
    const alt = props.caption || props.name || 'Topic image';
    return <figure className="study-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={props.url} alt={alt} className="w-full cursor-zoom-in rounded-xl border border-[var(--line)] object-contain" onClick={() => onZoom({ url: props.url!, alt })} />
      {props.caption && <figcaption className="mt-2 text-center text-sm text-[var(--muted)]">{props.caption}</figcaption>}
    </figure>;
  }
  if (block.type === 'file') {
    const props = block.props as { url?: string; name?: string; caption?: string } | undefined;
    return <ResourceCard url={props?.url} name={props?.name} caption={props?.caption} />;
  }
  // Paragraph that contains an inline link (e.g. legacy resource references).
  if (Array.isArray(block.content) && block.content.some((item) => typeof item === 'object' && item !== null && (item as { type?: string }).type === 'link')) {
    const link = block.content.find((item) => typeof item === 'object' && item !== null && (item as { type?: string }).type === 'link') as { href?: string; content?: unknown } | undefined;
    if (link?.href && content.trim() === '') return <ResourceCard url={link.href} name={inlineText(link) || 'Open resource'} />;
    return <p className="study-p">{block.content.map((item, i) => {
      if (typeof item === 'object' && item !== null && (item as { type?: string }).type === 'link') {
        const l = item as { href?: string };
        return <a key={i} className="study-link" href={l.href} target="_blank" rel="noreferrer">{inlineText(item) || 'link'}</a>;
      }
      return <span key={i}>{inlineText(item)}</span>;
    })}</p>;
  }
  if (!content.trim()) return <div className="h-3" aria-hidden />;
  return <div className="study-p"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{content}</ReactMarkdown></div>;
}

function ResourceCard({ url, name, caption }: { url?: string; name?: string; caption?: string }) {
  return <a href={url} target="_blank" rel="noreferrer" className="study-resource group my-5 flex items-center gap-4 rounded-xl border border-[var(--line)] bg-black/[.02] p-4 no-underline transition hover:border-[var(--rust)] dark:bg-white/[.03]">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--rust)]/10 text-[var(--rust)]"><FileText size={20} /></span>
    <span className="min-w-0">
      <span className="block truncate font-semibold text-[var(--fg)]">{name ?? 'Attached resource'}</span>
      <span className="block text-xs text-[var(--muted)]">{caption || 'Open / download'}</span>
    </span>
  </a>;
}
