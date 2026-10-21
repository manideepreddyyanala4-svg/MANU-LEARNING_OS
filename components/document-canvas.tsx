'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/react/style.css';
import { BlockNoteView } from '@blocknote/shadcn';
import { getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import type { PartialBlock } from '@blocknote/core';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { Bold, Check, ChevronDown, Code2, FileText, HelpCircle, ImagePlus, Italic, Link2, List, ListChecks, ListOrdered, Loader2, Paperclip, Quote, Underline, X } from 'lucide-react';

type SaveState = 'saved' | 'saving' | 'unsaved' | 'error' | 'recovered';
type Props = {
  topicId: string;
  initialContent: PartialBlock[];
  editable: boolean;
  onSave: (content: PartialBlock[], plainText: string) => Promise<void>;
  onUpload?: (file: File) => Promise<string>;
  doneRequest?: number;
  onDone?: () => void;
};

function textOf(blocks: PartialBlock[]): string {
  return blocks.map((block) => {
    const content = typeof block.content === 'string' ? block.content : Array.isArray(block.content) ? block.content.map(inlineText).join('') : block.type === 'table' ? ((block.content as { rows?: { cells?: unknown[] }[] } | undefined)?.rows ?? []).flatMap((row) => row.cells ?? []).map(inlineText).join(' ') : '';
    return [content, block.children ? textOf(block.children) : ''].filter(Boolean).join('\n');
  }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function DocumentCanvas({ topicId, initialContent, editable, onSave, onUpload, doneRequest = 0, onDone }: Props) {
  const editor = useCreateBlockNote({ initialContent: initialContent.length ? initialContent : undefined });
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<SaveState>('saved');
  const [uploadError, setUploadError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMore, setMobileMore] = useState(false);
  const [style, setStyle] = useState('Normal text');
  const [activeStyles, setActiveStyles] = useState<Record<string, unknown>>({});
  const timer = useRef<number | undefined>(undefined);
  const revision = useRef(0);
  const savedRevision = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);
  const uploading = useRef<Promise<void> | null>(null);
  const handledDone = useRef(0);
  const recoveryKey = `manuos:document:${topicId}`;

  // Persist the current editor document. `force` bypasses the editable guard so
  // we can flush a pending draft when the user leaves edit mode.
  async function persist(force = false): Promise<boolean> {
    if (!editable && !force) return false;
    window.clearTimeout(timer.current);
    try {
      if (uploading.current) await uploading.current;
      if (inFlight.current) await inFlight.current;
      if (revision.current === savedRevision.current) return true;
      const savingRevision = revision.current;
      const content = editor.document as PartialBlock[];
      setState('saving');
      const task = onSave(content, textOf(content));
      inFlight.current = task;
      await task;
      inFlight.current = null;
      savedRevision.current = savingRevision;
      if (revision.current === savingRevision) {
        try { localStorage.removeItem(recoveryKey); } catch { /* storage may be unavailable */ }
        setState('saved');
      } else {
        setState('unsaved');
        timer.current = window.setTimeout(() => void persist(), 900);
      }
      return true;
    } catch {
      inFlight.current = null;
      setState('error');
      return false;
    }
  }
  function changed() {
    if (!editable) return;
    revision.current += 1;
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

  useEffect(() => {
    if (!doneRequest || handledDone.current === doneRequest) return;
    handledDone.current = doneRequest;
    void (async () => { if (await persist(true)) onDone?.(); })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneRequest]);

  function syncToolbar() {
    try {
      const block = editor.getTextCursorPosition().block;
      setStyle(block.type === 'heading' ? `Heading ${Number(block.props.level)}` : block.type === 'paragraph' ? 'Normal text' : ({ bulletListItem: 'Bulleted list', numberedListItem: 'Numbered list', checkListItem: 'Checklist', quote: 'Quote', codeBlock: 'Code' } as Record<string, string>)[block.type] ?? 'Normal text');
      setActiveStyles(editor.getActiveStyles());
    } catch { /* cursor may be outside the editor */ }
  }
  function convert(type: 'paragraph' | 'heading' | 'bulletListItem' | 'numberedListItem' | 'checkListItem' | 'quote' | 'codeBlock', level?: 1 | 2 | 3) {
    const block = editor.getTextCursorPosition().block;
    editor.updateBlock(block, { type, ...(level ? { props: { level } } : {}) } as PartialBlock);
    editor.focus();
    syncToolbar();
  }
  function toggle(key: 'bold' | 'italic' | 'underline' | 'code') {
    editor.toggleStyles({ [key]: true });
    editor.focus();
    syncToolbar();
  }
  function addLink() {
    const url = window.prompt('Link URL');
    if (url) { editor.createLink(url); editor.focus(); }
  }
  const toolbarButton = (label: string, icon: ReactNode, action: () => void, pressed = false) => <button type="button" title={label} aria-label={label} aria-pressed={pressed} onMouseDown={(event) => event.preventDefault()} onClick={action} className={`editor-tool ${pressed ? 'is-active' : ''}`}>{icon}</button>;

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
      : { type: 'file', props: { url, name: file.name, caption: `${file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`} · Open / download` } };
    editor.insertBlocks([block], cursor, 'after');
  }
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setState('saving'); setUploadError('');
    try {
      const task = insertFile(file);
      uploading.current = task;
      await task;
      changed();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      setState(editable ? 'unsaved' : 'saved');
    } finally {
      uploading.current = null;
      // Only clear the input after the awaited upload + insertion has completed.
      event.target.value = '';
    }
  }

  if (!editable) return <StudyDocument blocks={initialContent} />;

  return <section className="document-canvas">
    <div className="editor-toolbar-wrap">
      <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
        <label className="editor-style-select"><span className="sr-only">Text style</span><select aria-label="Text style" title="Text style" value={style} onChange={(event) => { const value = event.target.value; if (value.startsWith('Heading')) convert('heading', Number(value.at(-1)) as 1 | 2 | 3); else convert('paragraph'); }}><option>Normal text</option><option>Heading 1</option><option>Heading 2</option><option>Heading 3</option>{!['Normal text', 'Heading 1', 'Heading 2', 'Heading 3'].includes(style) && <option>{style}</option>}</select><ChevronDown size={14} /></label>
        <span className="editor-toolbar-divider" />
        {toolbarButton('Bold', <Bold size={17} />, () => toggle('bold'), Boolean(activeStyles.bold))}
        {toolbarButton('Bulleted list', <List size={18} />, () => convert('bulletListItem'), style === 'Bulleted list')}
        {onUpload && <label title="Add image" aria-label="Add image" className="editor-tool cursor-pointer"><ImagePlus size={18} /><span className="hidden xl:inline">Image</span><input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} /></label>}
        <button type="button" className="editor-tool editor-more" aria-label="More formatting" aria-expanded={mobileMore} onClick={() => setMobileMore((value) => !value)}>More <ChevronDown size={14} /></button>
        <span className={`editor-extra-tools ${mobileMore ? 'is-open' : ''}`}>
        {toolbarButton('Italic', <Italic size={17} />, () => toggle('italic'), Boolean(activeStyles.italic))}
        {toolbarButton('Underline', <Underline size={17} />, () => toggle('underline'), Boolean(activeStyles.underline))}
        <span className="editor-toolbar-divider" />
        {toolbarButton('Numbered list', <ListOrdered size={18} />, () => convert('numberedListItem'), style === 'Numbered list')}
        {toolbarButton('Checklist', <ListChecks size={18} />, () => convert('checkListItem'), style === 'Checklist')}
        {toolbarButton('Quote', <Quote size={17} />, () => convert('quote'), style === 'Quote')}
        {toolbarButton('Code block', <Code2 size={17} />, () => convert('codeBlock'), style === 'Code')}
        {toolbarButton('Inline code', <span className="font-mono text-xs">&lt;/&gt;</span>, () => toggle('code'), Boolean(activeStyles.code))}
        {toolbarButton('Add link', <Link2 size={17} />, addLink)}
        {onUpload && <>
          <label title="Add file" aria-label="Add file" className="editor-tool cursor-pointer"><Paperclip size={18} /><span className="hidden xl:inline">File</span>
            <input className="sr-only" type="file" accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
          </label>
        </>}
        {toolbarButton('Writing help', <HelpCircle size={17} />, () => setHelpOpen((value) => !value), helpOpen)}
        </span>
      </div>
      <SaveBadge state={state} />
    </div>
    {helpOpen && <div className="editor-help"><strong>Writing help</strong><p>Choose Text above for normal text or Heading 1–3. Select words, then use B or I. Add lists with the toolbar or type <kbd>-</kbd> and Space. Use Image or type <kbd>/</kbd> for code, tables and more. Changes save automatically.</p></div>}
    {uploadError && <p role="alert" className="mb-3 text-xs text-red-600">{uploadError}</p>}
    {editor.document.length === 1 && !textOf(editor.document as PartialBlock[]) && <p className="editor-empty-help">Start writing… <span>Type / for blocks, or choose Text above for headings.</span></p>}
    <BlockNoteView editor={editor} editable onChange={changed} onSelectionChange={syncToolbar} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} slashMenu={false}>
      <SuggestionMenuController triggerCharacter="/" getItems={async (query) => [...getDefaultReactSlashMenuItems(editor).filter((item) => /text|heading|bullet|number|check|quote|code|divider|table|image|file/i.test(item.title)), { title: 'Callout', subtext: 'Highlight an important study point', icon: <Quote size={17} />, onItemClick: () => { convert('quote'); editor.insertInlineContent('NOTE: '); } }].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))} />
    </BlockNoteView>
    <p className="editor-footnote">Autosaves as you pause · ⌘/Ctrl+S to save now · type <kbd>/</kbd> for blocks</p>
  </section>;
}

function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { label: string; icon: React.ReactNode; tone: string }> = {
    saved: { label: 'Saved', icon: <Check size={13} />, tone: 'text-[var(--muted)]' },
    saving: { label: 'Saving…', icon: <Loader2 size={13} className="animate-spin" />, tone: 'text-[var(--muted)]' },
    unsaved: { label: 'Unsaved changes', icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />, tone: 'text-amber-600' },
    error: { label: 'Save failed — stored locally', icon: <span className="h-1.5 w-1.5 rounded-full bg-red-500" />, tone: 'text-red-600' },
    recovered: { label: 'Recovered local draft', icon: <Check size={13} />, tone: 'text-[var(--rust)]' },
  };
  const { label, icon, tone } = map[state];
  return <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone}`}>{icon}{label}</span>;
}

function StudyDocument({ blocks }: { blocks: PartialBlock[] }) {
  const [zoom, setZoom] = useState<{ url: string; alt: string } | null>(null);
  const hasContent = blocks.some((block) => block.type !== 'paragraph' || (Array.isArray(block.content) && block.content.some((part) => inlineText(part).trim())));
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);
  return <>
    <article className="study-document">
      {hasContent
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
  if (Array.isArray((value as { rows?: unknown[] }).rows)) return ((value as { rows?: { cells?: unknown[] }[] }).rows ?? []).flatMap((row) => row.cells ?? []).map(inlineText).join(' ');
  return typeof value.content === 'string' ? value.content : '';
}

function RichText({ content }: { content: unknown }) {
  if (content && typeof content === 'object' && !Array.isArray(content) && 'content' in content) return <RichText content={(content as { content: unknown }).content} />;
  if (!Array.isArray(content)) return <>{typeof content === 'string' ? content : ''}</>;
  return <>{content.map((item, index) => {
    if (typeof item === 'string') return <span key={index}>{item}</span>;
    if (!item || typeof item !== 'object') return null;
    const part = item as { type?: string; text?: string; href?: string; content?: unknown; styles?: Record<string, unknown> };
    if (part.type === 'link') return <a key={index} className="study-link" href={part.href} target="_blank" rel="noreferrer"><RichText content={part.content} /></a>;
    let value: ReactNode = part.text ?? inlineText(part);
    if (part.styles?.code) value = <code>{value}</code>;
    if (part.styles?.bold) value = <strong>{value}</strong>;
    if (part.styles?.italic) value = <em>{value}</em>;
    if (part.styles?.underline) value = <u>{value}</u>;
    if (part.styles?.strike) value = <s>{value}</s>;
    return <span key={index}>{value}</span>;
  })}</>;
}

function StudyBlock({ block, index, onZoom }: { block: PartialBlock; index: number; onZoom: (v: { url: string; alt: string }) => void }) {
  const content = typeof block.content === 'string' ? block.content : Array.isArray(block.content) ? block.content.map(inlineText).join('') : '';

  if (block.type === 'heading') {
    const level = Number((block.props as { level?: number } | undefined)?.level ?? 1);
    const Tag = level === 3 ? 'h3' : level === 2 ? 'h2' : 'h1';
    return <Tag id={`topic-heading-${index}`} className="study-h scroll-mt-28"><RichText content={block.content} /></Tag>;
  }
  if (block.type === 'bulletListItem') return <div className="study-list-item"><span aria-hidden>•</span><div><RichText content={block.content} />{block.children?.map((child, i) => <StudyBlock key={child.id ?? i} block={child} index={index + i + 1} onZoom={onZoom} />)}</div></div>;
  if (block.type === 'numberedListItem') return <div className="study-list-item numbered"><span aria-hidden /><div><RichText content={block.content} />{block.children?.map((child, i) => <StudyBlock key={child.id ?? i} block={child} index={index + i + 1} onZoom={onZoom} />)}</div></div>;
  if (block.type === 'checkListItem') return <label className="study-check"><input type="checkbox" checked={Boolean((block.props as { checked?: boolean } | undefined)?.checked)} readOnly /><span><RichText content={block.content} /></span></label>;
  if (block.type === 'codeBlock') return <div className="study-code"><div className="study-code-bar"><span>{String((block.props as { language?: string } | undefined)?.language || 'Code')}</span><button type="button" onClick={() => void navigator.clipboard.writeText(content)}>Copy code</button></div><pre className="study-pre"><code>{content}</code></pre></div>;
  if (block.type === 'quote') return <blockquote className={`study-quote ${/^(note|important|interview|remember)\s*:/i.test(content) ? 'study-callout' : ''}`}><RichText content={block.content} /></blockquote>;
  if (block.type === 'table') {
    const rows = (block.content as { rows?: { cells?: unknown[] }[] } | undefined)?.rows ?? [];
    return <div className="study-table-wrap"><table><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{(row.cells ?? []).map((cell, cellIndex) => rowIndex === 0 ? <th key={cellIndex}><RichText content={cell} /></th> : <td key={cellIndex}><RichText content={cell} /></td>)}</tr>)}</tbody></table></div>;
  }
  if (block.type === 'divider') return <hr className="study-divider" />;
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
    return <p className="study-p"><RichText content={block.content} /></p>;
  }
  if (!content.trim()) return <div className="h-3" aria-hidden />;
  return <p className="study-p"><RichText content={block.content} /></p>;
}

function ResourceCard({ url, name, caption }: { url?: string; name?: string; caption?: string }) {
  return <div className="study-resource group my-5 flex items-center gap-4 rounded-xl border border-[var(--line)] bg-black/[.02] p-4 transition hover:border-[var(--rust)] dark:bg-white/[.03]">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--rust)]/10 text-[var(--rust)]"><FileText size={20} /></span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-semibold text-[var(--fg)]">{name ?? 'Attached resource'}</span>
      <span className="block text-xs text-[var(--muted)]">{caption?.split(' · ')[0] || 'Study resource'}</span>
    </span>
    {url && <span className="study-resource-actions"><a href={url} target="_blank" rel="noreferrer">Open</a><a href={url} download={name || true}>Download</a></span>}
  </div>;
}
