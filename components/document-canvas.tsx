'use client';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/react/style.css';
import { BlockNoteView } from '@blocknote/shadcn';
import { getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import type { PartialBlock } from '@blocknote/core';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  Bold,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FileText,
  HelpCircle,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Loader2,
  Maximize2,
  Paperclip,
  Pencil,
  Quote,
  Underline,
  UploadCloud,
  X,
} from 'lucide-react';

type SaveState = 'saved' | 'saving' | 'unsaved' | 'error' | 'recovered';

export type Props = {
  topicId: string;
  initialContent: PartialBlock[];
  editable: boolean;
  onSave: (content: PartialBlock[], plainText: string) => Promise<void>;
  onUpload?: (file: File) => Promise<string>;
  doneRequest?: number;
  onDone?: () => void;
  onStartEdit?: () => void;
};

export function textOf(blocks: PartialBlock[]): string {
  return blocks
    .map((block) => {
      const content =
        typeof block.content === 'string'
          ? block.content
          : Array.isArray(block.content)
          ? block.content.map(inlineText).join('')
          : block.type === 'table'
          ? (
              (block.content as { rows?: { cells?: unknown[] }[] } | undefined)?.rows ?? []
            )
              .flatMap((row) => row.cells ?? [])
              .map(inlineText)
              .join(' ')
          : '';
      return [content, block.children ? textOf(block.children) : ''].filter(Boolean).join('\n');
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function DocumentCanvas({
  topicId,
  initialContent,
  editable,
  onSave,
  onUpload,
  doneRequest = 0,
  onDone,
  onStartEdit,
}: Props) {
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<SaveState>('saved');
  const [uploadError, setUploadError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMore, setMobileMore] = useState(false);
  const [style, setStyle] = useState('Normal text');
  const [activeStyles, setActiveStyles] = useState<Record<string, unknown>>({});
  const [isDragging, setIsDragging] = useState(false);

  const timer = useRef<number | undefined>(undefined);
  const revision = useRef(0);
  const savedRevision = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);
  const uploading = useRef<Promise<void> | null>(null);
  const handledDone = useRef(0);
  const recoveryKey = `manuos:document:${topicId}`;

  const editor = useCreateBlockNote({
    initialContent: initialContent.length ? initialContent : undefined,
    pasteHandler: ({ event, defaultPasteHandler }) => {
      // 1. Intercept clipboard image paste (Cmd+V / Ctrl+V)
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file && onUpload) {
              event.preventDefault();
              void (async () => {
                try {
                  setState('saving');
                  const task = insertFile(file);
                  uploading.current = task;
                  await task;
                  changed();
                } catch (err) {
                  setUploadError(err instanceof Error ? err.message : 'Image paste failed.');
                  setState(editable ? 'unsaved' : 'saved');
                } finally {
                  uploading.current = null;
                }
              })();
              return true;
            }
          }
        }
      }

      // 2. Intercept ASCII diagram paste (box-drawing or ASCII frame)
      const text = event.clipboardData?.getData('text/plain') || '';
      const isAsciiDiagram =
        (/[\u2500-\u257F]/.test(text) || (/^\s*(\+|-)+(\+|\|)/m.test(text) && text.includes('|'))) &&
        text.split('\n').length >= 2;
      if (isAsciiDiagram) {
        event.preventDefault();
        let cursor = editor.document[editor.document.length - 1];
        try {
          cursor = editor.getTextCursorPosition().block;
        } catch {
          /* cursor outside editor */
        }
        const codeBlock: PartialBlock = {
          type: 'codeBlock',
          props: { language: 'text' },
          content: text,
        };
        if (cursor) {
          editor.insertBlocks([codeBlock], cursor, 'after');
        } else {
          editor.insertBlocks([codeBlock], editor.document[0], 'before');
        }
        changed();
        return true;
      }

      // 3. For rich ChatGPT/web text, preserve HTML structure (headings, tables, lists, bold)
      return defaultPasteHandler({
        prioritizeMarkdownOverHTML: false,
        plainTextAsMarkdown: true,
      });
    },
  });

  // Persist current editor document.
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
        try {
          localStorage.removeItem(recoveryKey);
        } catch {
          /* ignore */
        }
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
    try {
      localStorage.setItem(recoveryKey, JSON.stringify(editor.document));
    } catch {
      /* ignore */
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void persist(), 900);
  }

  // Recovery + keyboard shortcuts.
  useEffect(() => {
    let draft: string | null = null;
    try {
      draft = localStorage.getItem(recoveryKey);
    } catch {
      /* ignore */
    }
    if (draft && editable && window.confirm('Recover your unsaved local draft for this topic?')) {
      try {
        editor.replaceBlocks(editor.document, JSON.parse(draft));
        window.setTimeout(() => setState('recovered'), 0);
      } catch {
        try {
          localStorage.removeItem(recoveryKey);
        } catch {
          /* ignore */
        }
      }
    }
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void persist(true);
      }
    };
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.clearTimeout(timer.current);
    };
    // editor is stable for the lifetime of this topic document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, recoveryKey]);

  useEffect(() => {
    if (!doneRequest || handledDone.current === doneRequest) return;
    handledDone.current = doneRequest;
    void (async () => {
      if (await persist(true)) onDone?.();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneRequest]);

  function syncToolbar() {
    try {
      const block = editor.getTextCursorPosition().block;
      setStyle(
        block.type === 'heading'
          ? `Heading ${Number(block.props.level)}`
          : block.type === 'paragraph'
          ? 'Normal text'
          : ({
              bulletListItem: 'Bulleted list',
              numberedListItem: 'Numbered list',
              checkListItem: 'Checklist',
              quote: 'Quote',
              codeBlock: 'Code',
            } as Record<string, string>)[block.type] ?? 'Normal text'
      );
      setActiveStyles(editor.getActiveStyles());
    } catch {
      /* cursor outside editor */
    }
  }

  function convert(
    type:
      | 'paragraph'
      | 'heading'
      | 'bulletListItem'
      | 'numberedListItem'
      | 'checkListItem'
      | 'quote'
      | 'codeBlock',
    level?: 1 | 2 | 3
  ) {
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
    if (url) {
      editor.createLink(url);
      editor.focus();
    }
  }

  const toolbarButton = (label: string, icon: ReactNode, action: () => void, pressed = false) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onMouseDown={(event) => event.preventDefault()}
      onClick={action}
      className={`editor-tool ${pressed ? 'is-active' : ''}`}
    >
      {icon}
    </button>
  );

  async function insertFile(file: File): Promise<void> {
    if (!onUpload) throw new Error('File uploads are unavailable.');
    const url = await onUpload(file);
    let cursor = editor.document[editor.document.length - 1];
    try {
      cursor = editor.getTextCursorPosition().block;
    } catch {
      /* file picker can steal focus from editor */
    }
    const block: PartialBlock = file.type.startsWith('image/')
      ? { type: 'image', props: { url, name: file.name, caption: '' } }
      : {
          type: 'file',
          props: {
            url,
            name: file.name,
            caption: `${
              file.size < 1024 * 1024
                ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                : `${(file.size / 1024 / 1024).toFixed(1)} MB`
            } · Open / download`,
          },
        };

    // If starting in an empty topic with a single blank block, replace it cleanly
    if (editor.document.length === 1 && !textOf(editor.document as PartialBlock[])) {
      editor.replaceBlocks([editor.document[0]], [block]);
    } else if (cursor) {
      editor.insertBlocks([block], cursor, 'after');
    } else {
      editor.insertBlocks([block], editor.document[editor.document.length - 1], 'after');
    }
  }

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    setState('saving');
    setUploadError('');
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const task = insertFile(file);
        uploading.current = task;
        await task;
      }
      changed();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
      setState(editable ? 'unsaved' : 'saved');
    } finally {
      uploading.current = null;
      event.target.value = '';
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/') ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')
    );
    if (files.length === 0) return;
    setState('saving');
    setUploadError('');
    try {
      for (const file of files) {
        const task = insertFile(file);
        uploading.current = task;
        await task;
      }
      changed();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Drop upload failed.');
      setState(editable ? 'unsaved' : 'saved');
    } finally {
      uploading.current = null;
    }
  };

  if (!editable) {
    return <StudyDocument blocks={initialContent} onStartEdit={onStartEdit} />;
  }

  const isEmpty = editor.document.length === 1 && !textOf(editor.document as PartialBlock[]);

  return (
    <section
      className="document-canvas"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="editor-toolbar-wrap">
        <div className="editor-toolbar" role="toolbar" aria-label="Text formatting">
          <label className="editor-style-select">
            <span className="sr-only">Text style</span>
            <select
              aria-label="Text style"
              title="Text style"
              value={style}
              onChange={(event) => {
                const value = event.target.value;
                if (value.startsWith('Heading')) convert('heading', Number(value.at(-1)) as 1 | 2 | 3);
                else convert('paragraph');
              }}
            >
              <option>Normal text</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
              <option>Heading 3</option>
              {!['Normal text', 'Heading 1', 'Heading 2', 'Heading 3'].includes(style) && (
                <option>{style}</option>
              )}
            </select>
            <ChevronDown size={14} />
          </label>

          <span className="editor-toolbar-divider" />
          {toolbarButton('Bold', <Bold size={17} />, () => toggle('bold'), Boolean(activeStyles.bold))}
          {toolbarButton('Bulleted list', <List size={18} />, () => convert('bulletListItem'), style === 'Bulleted list')}

          {onUpload && (
            <label
              title="Add note images (multiple supported)"
              aria-label="Add note images"
              className="editor-tool cursor-pointer"
            >
              <ImagePlus size={18} />
              <span className="hidden xl:inline">Note Image</span>
              <input
                className="sr-only"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFilesChange}
              />
            </label>
          )}

          <button
            type="button"
            className="editor-tool editor-more"
            aria-label="More formatting"
            aria-expanded={mobileMore}
            onClick={() => setMobileMore((value) => !value)}
          >
            More <ChevronDown size={14} />
          </button>

          <span className={`editor-extra-tools ${mobileMore ? 'is-open' : ''}`}>
            {toolbarButton('Italic', <Italic size={17} />, () => toggle('italic'), Boolean(activeStyles.italic))}
            {toolbarButton('Underline', <Underline size={17} />, () => toggle('underline'), Boolean(activeStyles.underline))}
            <span className="editor-toolbar-divider" />
            {toolbarButton('Numbered list', <ListOrdered size={18} />, () => convert('numberedListItem'), style === 'Numbered list')}
            {toolbarButton('Checklist', <ListChecks size={18} />, () => convert('checkListItem'), style === 'Checklist')}
            {toolbarButton('Quote', <Quote size={17} />, () => convert('quote'), style === 'Quote')}
            {toolbarButton('Code block', <Code2 size={17} />, () => convert('codeBlock'), style === 'Code')}
            {toolbarButton(
              'Inline code',
              <span className="font-mono text-xs">&lt;/&gt;</span>,
              () => toggle('code'),
              Boolean(activeStyles.code)
            )}
            {toolbarButton('Add link', <Link2 size={17} />, addLink)}
            {onUpload && (
              <label title="Add file attachment" aria-label="Add file attachment" className="editor-tool cursor-pointer">
                <Paperclip size={18} />
                <span className="hidden xl:inline">File</span>
                <input
                  className="sr-only"
                  type="file"
                  accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFilesChange}
                />
              </label>
            )}
            {toolbarButton('Writing help', <HelpCircle size={17} />, () => setHelpOpen((value) => !value), helpOpen)}
          </span>
        </div>

        <SaveBadge state={state} />
      </div>

      {helpOpen && (
        <div className="editor-help">
          <strong>Image-First & Technical Note Taking</strong>
          <p>
            Paste handwritten study scans or screenshots directly (⌘V / Ctrl+V). They are kept in full resolution.
            Paste rich ChatGPT explanations with tables and code blocks preserved without flattening. Use Image for multiple scans, or type <kbd>/</kbd> for blocks. Changes save automatically.
          </p>
        </div>
      )}

      {uploadError && <p role="alert" className="mb-3 text-xs text-red-600">{uploadError}</p>}

      {isEmpty && (
        <div
          className={`editor-dropzone ${isDragging ? 'is-dragging' : ''}`}
          onClick={() => {
            // focus the editor
            editor.focus();
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] mb-3">
            <UploadCloud size={24} />
          </div>
          <p className="font-semibold text-sm text-[var(--fg)]">
            Drop notebook scans or paste an image here (⌘V / Ctrl+V)
          </p>
          <p className="mt-1 text-xs text-[var(--muted)] max-w-sm">
            Handwritten notes, diagrams, and equations are preserved in original high-resolution.
          </p>
          {onUpload && (
            <label
              className="mt-3.5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] px-3.5 py-1.5 text-xs font-semibold text-[var(--fg)] shadow-2xs hover:bg-[var(--accent-subtle)] hover:border-[var(--accent)] transition"
              onClick={(e) => e.stopPropagation()}
            >
              <ImagePlus size={14} className="text-[var(--accent)]" />
              <span>Upload notebook sheets</span>
              <input
                className="sr-only"
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFilesChange}
              />
            </label>
          )}
          <span className="mt-3 text-[11px] text-[var(--muted)]">
            Or paste rich ChatGPT text · type <kbd className="font-mono bg-[var(--line-subtle)] px-1 rounded">/</kbd> for blocks
          </span>
        </div>
      )}

      <BlockNoteView
        editor={editor}
        editable
        onChange={changed}
        onSelectionChange={syncToolbar}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            [
              ...getDefaultReactSlashMenuItems(editor).filter((item) =>
                /text|heading|bullet|number|check|quote|code|divider|table|image|file/i.test(item.title)
              ),
              {
                title: 'Callout',
                subtext: 'Highlight an important study point',
                icon: <Quote size={17} />,
                onItemClick: () => {
                  convert('quote');
                  editor.insertInlineContent('NOTE: ');
                },
              },
            ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
          }
        />
      </BlockNoteView>

      <p className="editor-footnote">
        Autosaves as you pause · ⌘/Ctrl+S to save now · Drag & drop or paste images directly
      </p>
    </section>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { label: string; icon: React.ReactNode; tone: string }> = {
    saved: { label: 'Saved', icon: <Check size={13} />, tone: 'text-[var(--muted)]' },
    saving: { label: 'Saving…', icon: <Loader2 size={13} className="animate-spin" />, tone: 'text-[var(--muted)]' },
    unsaved: { label: 'Unsaved changes', icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />, tone: 'text-amber-600' },
    error: { label: 'Save failed — stored locally', icon: <span className="h-1.5 w-1.5 rounded-full bg-red-500" />, tone: 'text-red-600' },
    recovered: { label: 'Recovered local draft', icon: <Check size={13} />, tone: 'text-[var(--accent)]' },
  };
  const { label, icon, tone } = map[state];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tone}`}>
      {icon}
      {label}
    </span>
  );
}

export type StudyImage = {
  url: string;
  alt: string;
  name?: string;
  caption?: string;
};

export function StudyDocument({
  blocks,
  onStartEdit,
}: {
  blocks: PartialBlock[];
  onStartEdit?: () => void;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Extract all study image blocks in document order
  const images = useMemo<StudyImage[]>(() => {
    const list: StudyImage[] = [];
    for (const block of blocks) {
      if (block.type === 'image') {
        const props = block.props as { url?: string; caption?: string; name?: string } | undefined;
        if (props?.url) {
          list.push({
            url: props.url,
            alt: props.caption || props.name || 'Topic study note',
            name: props.name,
            caption: props.caption,
          });
        }
      }
    }
    return list;
  }, [blocks]);

  const hasContent = blocks.some(
    (block) =>
      block.type !== 'paragraph' ||
      (Array.isArray(block.content) && block.content.some((part) => inlineText(part).trim()))
  );

  let currentImageSequence = 0;

  return (
    <>
      <article className="study-document">
        {hasContent ? (
          blocks.map((block, index) => {
            if (block.type === 'image') {
              const imgIndex = currentImageSequence++;
              return (
                <StudyFigure
                  key={block.id ?? index}
                  block={block}
                  imageIndex={imgIndex}
                  totalImages={images.length}
                  onOpenLightbox={() => setActiveImageIndex(imgIndex)}
                />
              );
            }
            return (
              <StudyBlock
                key={block.id ?? index}
                block={block}
                index={index}
                onZoom={(url, alt) => {
                  const idx = images.findIndex((img) => img.url === url);
                  setActiveImageIndex(idx >= 0 ? idx : 0);
                }}
              />
            );
          })
        ) : (
          <div className="study-empty-state">
            <div className="study-empty-icon">
              <ImagePlus size={28} />
            </div>
            <h3 className="text-lg font-bold text-[var(--fg)]">No study notes added yet</h3>
            <p className="mt-1 text-sm text-[var(--muted)] max-w-md">
              Upload handwritten notebook sheets, paste ChatGPT technical explanations, or write notes.
            </p>
            {onStartEdit && (
              <button
                type="button"
                onClick={onStartEdit}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)]"
              >
                <Pencil size={14} /> Start Writing / Add Note
              </button>
            )}
          </div>
        )}
      </article>

      {activeImageIndex !== null && images[activeImageIndex] && (
        <StudyLightbox
          images={images}
          currentIndex={activeImageIndex}
          onIndexChange={setActiveImageIndex}
          onClose={() => setActiveImageIndex(null)}
        />
      )}
    </>
  );
}

function StudyFigure({
  block,
  imageIndex,
  totalImages,
  onOpenLightbox,
}: {
  block: PartialBlock;
  imageIndex: number;
  totalImages: number;
  onOpenLightbox: () => void;
}) {
  const props = block.props as { url?: string; caption?: string; name?: string } | undefined;
  const [mode, setMode] = useState<'normal' | 'wide' | 'full'>('wide');
  const [copied, setCopied] = useState(false);

  if (!props?.url) return null;
  const url = props.url;
  const alt = props.caption || props.name || 'Study note sheet';

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      if (blob.type.includes('png')) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <figure className={`study-figure mode-${mode}`}>
      <div className="study-figure-frame">
        {totalImages > 1 && (
          <span className="study-figure-page-badge">
            Page {imageIndex + 1} of {totalImages}
          </span>
        )}

        <div className="study-figure-toolbar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`study-figure-tool-btn ${mode === 'normal' ? 'is-active' : ''}`}
            onClick={() => setMode('normal')}
            title="Standard reading measure (780px)"
          >
            Fit
          </button>
          <button
            type="button"
            className={`study-figure-tool-btn ${mode === 'wide' ? 'is-active' : ''}`}
            onClick={() => setMode('wide')}
            title="Wide note measure (1240px)"
          >
            Wide
          </button>
          <button
            type="button"
            className={`study-figure-tool-btn ${mode === 'full' ? 'is-active' : ''}`}
            onClick={() => setMode('full')}
            title="Full workspace width"
          >
            Full
          </button>
          <span className="h-3.5 w-px bg-[var(--line)] mx-0.5" />
          <button
            type="button"
            className="study-figure-tool-btn"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy image'}
            aria-label="Copy image"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
          <a
            href={url}
            download={props.name || 'study-note.png'}
            className="study-figure-tool-btn"
            title="Download original sheet"
            aria-label="Download original note sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={13} />
          </a>
          <button
            type="button"
            className="study-figure-tool-btn is-active"
            onClick={onOpenLightbox}
            title="Open study lightbox (Inspect handwriting / equations)"
            aria-label="Open study lightbox"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          loading="lazy"
          onClick={onOpenLightbox}
        />
      </div>

      {props.caption && (
        <figcaption className="mt-2 text-center text-sm text-[var(--muted)]">
          {props.caption}
        </figcaption>
      )}
    </figure>
  );
}

function StudyLightbox({
  images,
  currentIndex,
  onIndexChange,
  onClose,
}: {
  images: StudyImage[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
  onClose: () => void;
}) {
  const [zoomScale, setZoomScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const current = images[currentIndex];
  const total = images.length;

  // Keyboard navigation & Esc handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && total > 1) {
        onIndexChange((currentIndex - 1 + total) % total);
        setZoomScale(1);
        setPan({ x: 0, y: 0 });
      } else if (e.key === 'ArrowRight' && total > 1) {
        onIndexChange((currentIndex + 1) % total);
        setZoomScale(1);
        setPan({ x: 0, y: 0 });
      } else if (e.key === '+' || e.key === '=') {
        setZoomScale((s) => Math.min(4, s + 0.25));
      } else if (e.key === '-' || e.key === '_') {
        setZoomScale((s) => Math.max(0.5, s - 0.25));
      } else if (e.key === '0') {
        setZoomScale(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, total, onIndexChange, onClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoomScale((prev) => {
      const next = Math.min(4, Math.max(0.5, prev + delta));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Study note inspection viewer"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/92 p-4 backdrop-blur-md select-none"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between z-10 px-2 py-1" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          {total > 1 ? (
            <div className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white">
              <button
                type="button"
                aria-label="Previous note page"
                title="Previous page (←)"
                className="rounded p-1 hover:bg-white/20 transition disabled:opacity-30"
                disabled={currentIndex === 0}
                onClick={() => {
                  onIndexChange(Math.max(0, currentIndex - 1));
                  setZoomScale(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-mono text-xs px-1.5 font-semibold">
                Page {currentIndex + 1} of {total}
              </span>
              <button
                type="button"
                aria-label="Next note page"
                title="Next page (→)"
                className="rounded p-1 hover:bg-white/20 transition disabled:opacity-30"
                disabled={currentIndex === total - 1}
                onClick={() => {
                  onIndexChange(Math.min(total - 1, currentIndex + 1));
                  setZoomScale(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Study Note Viewer
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Zoom out"
            title="Zoom out (-)"
            className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.25))}
          >
            -
          </button>
          <span className="text-xs text-white/90 font-mono w-14 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            title="Zoom in (+)"
            className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            onClick={() => setZoomScale((s) => Math.min(4, s + 0.25))}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Fit to screen"
            title="Fit to screen (0)"
            className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            onClick={() => {
              setZoomScale(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            Fit
          </button>
          <button
            type="button"
            aria-label="100% natural resolution"
            title="100% resolution (Inspect equations/details)"
            className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            onClick={() => {
              setZoomScale(1.5);
              setPan({ x: 0, y: 0 });
            }}
          >
            100%
          </button>
          <a
            href={current.url}
            download={current.name || 'study-note.png'}
            className="rounded-lg bg-white/10 p-1.5 text-white transition hover:bg-white/20 ml-1"
            title="Download original image"
            aria-label="Download original note image"
          >
            <Download size={16} />
          </a>
          <button
            type="button"
            aria-label="Close viewer"
            title="Close viewer (Esc)"
            className="ml-2 rounded-lg bg-white/15 p-1.5 text-white transition hover:bg-white/25"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden p-2 w-full"
        onClick={onClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt}
          draggable={false}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
            cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            transition: isDragging ? 'none' : 'transform 0.15s ease',
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => {
            if (zoomScale === 1) {
              setZoomScale(1.75);
            } else {
              setZoomScale(1);
              setPan({ x: 0, y: 0 });
            }
          }}
          className="max-h-[85vh] max-w-[92vw] select-none rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom Caption & Hint */}
      <div className="w-full flex items-center justify-between text-xs text-white/60 px-4 py-1 z-10" onClick={(e) => e.stopPropagation()}>
        <span className="truncate max-w-lg">
          {current.caption || current.name || 'Original high-resolution study note'}
        </span>
        <span className="hidden sm:inline font-mono text-[11px] text-white/40">
          Double-click to zoom · Drag to pan · Scroll wheel to zoom · Esc to exit
        </span>
      </div>
    </div>
  );
}

function inlineText(item: unknown): string {
  if (typeof item === 'string') return item;
  if (!item || typeof item !== 'object') return '';
  const value = item as { text?: string; content?: unknown };
  if (typeof value.text === 'string') return value.text;
  if (Array.isArray(value.content)) return value.content.map(inlineText).join('');
  if (Array.isArray((value as { rows?: unknown[] }).rows))
    return ((value as { rows?: { cells?: unknown[] }[] }).rows ?? [])
      .flatMap((row) => row.cells ?? [])
      .map(inlineText)
      .join(' ');
  return typeof value.content === 'string' ? value.content : '';
}

function RichText({ content }: { content: unknown }) {
  if (content && typeof content === 'object' && !Array.isArray(content) && 'content' in content)
    return <RichText content={(content as { content: unknown }).content} />;
  if (!Array.isArray(content)) return <>{typeof content === 'string' ? content : ''}</>;
  return (
    <>
      {content.map((item, index) => {
        if (typeof item === 'string') return <span key={index}>{item}</span>;
        if (!item || typeof item !== 'object') return null;
        const part = item as {
          type?: string;
          text?: string;
          href?: string;
          content?: unknown;
          styles?: Record<string, unknown>;
        };
        if (part.type === 'link')
          return (
            <a key={index} className="study-link" href={part.href} target="_blank" rel="noreferrer">
              <RichText content={part.content} />
            </a>
          );
        let value: ReactNode = part.text ?? inlineText(part);
        if (part.styles?.code) value = <code>{value}</code>;
        if (part.styles?.bold) value = <strong>{value}</strong>;
        if (part.styles?.italic) value = <em>{value}</em>;
        if (part.styles?.underline) value = <u>{value}</u>;
        if (part.styles?.strike) value = <s>{value}</s>;
        return <span key={index}>{value}</span>;
      })}
    </>
  );
}

function StudyBlock({
  block,
  index,
  onZoom,
}: {
  block: PartialBlock;
  index: number;
  onZoom: (url: string, alt: string) => void;
}) {
  const content =
    typeof block.content === 'string'
      ? block.content
      : Array.isArray(block.content)
      ? block.content.map(inlineText).join('')
      : '';

  if (block.type === 'heading') {
    const level = Number((block.props as { level?: number } | undefined)?.level ?? 1);
    const Tag = level === 3 ? 'h3' : level === 2 ? 'h2' : 'h1';
    return (
      <Tag id={`topic-heading-${index}`} className="study-h scroll-mt-28">
        <RichText content={block.content} />
      </Tag>
    );
  }
  if (block.type === 'bulletListItem')
    return (
      <div className="study-list-item">
        <span aria-hidden>•</span>
        <div>
          <RichText content={block.content} />
          {block.children?.map((child, i) => (
            <StudyBlock key={child.id ?? i} block={child} index={index + i + 1} onZoom={onZoom} />
          ))}
        </div>
      </div>
    );
  if (block.type === 'numberedListItem')
    return (
      <div className="study-list-item numbered">
        <span aria-hidden />
        <div>
          <RichText content={block.content} />
          {block.children?.map((child, i) => (
            <StudyBlock key={child.id ?? i} block={child} index={index + i + 1} onZoom={onZoom} />
          ))}
        </div>
      </div>
    );
  if (block.type === 'checkListItem')
    return (
      <label className="study-check">
        <input type="checkbox" checked={Boolean((block.props as { checked?: boolean } | undefined)?.checked)} readOnly />
        <span>
          <RichText content={block.content} />
        </span>
      </label>
    );
  if (block.type === 'codeBlock')
    return (
      <div className="study-code">
        <div className="study-code-bar">
          <span>{String((block.props as { language?: string } | undefined)?.language || 'Code')}</span>
          <button type="button" onClick={() => void navigator.clipboard.writeText(content)}>
            Copy code
          </button>
        </div>
        <pre className="study-pre">
          <code>{content}</code>
        </pre>
      </div>
    );
  if (block.type === 'quote')
    return (
      <blockquote
        className={`study-quote ${
          /^(note|important|interview|remember)\s*:/i.test(content) ? 'study-callout' : ''
        }`}
      >
        <RichText content={block.content} />
      </blockquote>
    );
  if (block.type === 'table') {
    const rows = (block.content as { rows?: { cells?: unknown[] }[] } | undefined)?.rows ?? [];
    return (
      <div className="study-table-wrap">
        <table>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {(row.cells ?? []).map((cell, cellIndex) =>
                  rowIndex === 0 ? (
                    <th key={cellIndex}>
                      <RichText content={cell} />
                    </th>
                  ) : (
                    <td key={cellIndex}>
                      <RichText content={cell} />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === 'divider') return <hr className="study-divider" />;
  if (block.type === 'file') {
    const props = block.props as { url?: string; name?: string; caption?: string } | undefined;
    return <ResourceCard url={props?.url} name={props?.name} caption={props?.caption} />;
  }
  // Paragraph that contains an inline link
  if (
    Array.isArray(block.content) &&
    block.content.some((item) => typeof item === 'object' && item !== null && (item as { type?: string }).type === 'link')
  ) {
    const link = block.content.find(
      (item) => typeof item === 'object' && item !== null && (item as { type?: string }).type === 'link'
    ) as { href?: string; content?: unknown } | undefined;
    if (link?.href && content.trim() === '')
      return <ResourceCard url={link.href} name={inlineText(link) || 'Open resource'} />;
    return (
      <p className="study-p">
        <RichText content={block.content} />
      </p>
    );
  }
  if (!content.trim()) return <div className="h-3" aria-hidden />;
  return (
    <p className="study-p">
      <RichText content={block.content} />
    </p>
  );
}

function ResourceCard({ url, name, caption }: { url?: string; name?: string; caption?: string }) {
  return (
    <div className="study-resource group my-5 flex items-center gap-4 rounded-xl border border-[var(--line)] bg-black/[.02] p-4 transition hover:border-[var(--accent)] dark:bg-white/[.03]">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
        <FileText size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-[var(--fg)]">{name ?? 'Attached resource'}</span>
        <span className="block text-xs text-[var(--muted)]">{caption?.split(' · ')[0] || 'Study resource'}</span>
      </span>
      {url && (
        <span className="study-resource-actions">
          <a href={url} target="_blank" rel="noreferrer">
            Open
          </a>
          <a href={url} download={name || true}>
            Download
          </a>
        </span>
      )}
    </div>
  );
}
