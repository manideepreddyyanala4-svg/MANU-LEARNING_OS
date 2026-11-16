'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createClient } from '@/lib/supabase';

export const MAX_CHARS = 40000;

/** Wraps fenced code with a copy action; indentation is preserved (white-space: pre). */
function CodeBlock({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  async function copy() {
    const text = ref.current?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="code-block">
      <pre ref={ref} tabIndex={0}>{children}</pre>
      <button type="button" className="code-copy" onClick={() => void copy()} aria-label="Copy code">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

/**
 * Reads and edits the saved Markdown note for one curriculum topic (table `curriculum_lessons`, unchanged).
 * Bulk import lives in LessonPreparation; `refreshToken` makes this view reload after an import.
 */
export function LessonNotes({ topicKey, topicTitle, refreshToken = 0 }: {
  topicKey: string; topicTitle: string; refreshToken?: number;
}) {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function auth() {
    const client = createClient();
    if (!client) throw new Error('Cloud storage is not configured.');
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) throw new Error('Sign in to use your study notes.');
    return { client, user };
  }
  async function read(key: string) {
    const { client } = await auth();
    const { data, error: dbError } = await client.from('curriculum_lessons')
      .select('content').eq('topic_key', key).maybeSingle();
    if (dbError) throw dbError;
    return (data?.content ?? '') as string;
  }
  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      setLoaded(false); setEditing(false); setError(''); setMessage('');
      void read(topicKey).then((value) => {
        if (!alive) return;
        setText(value); setDraft(value);
      }).catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : 'Could not load notes.');
      }).finally(() => { if (alive) setLoaded(true); });
    }, 0);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [topicKey, refreshToken]);

  async function save() {
    if (draft.length > MAX_CHARS) { setError('Maximum 40,000 characters.'); return; }
    setWorking(true); setError(''); setMessage('');
    try {
      const { client, user } = await auth();
      const { error: dbError } = await client.from('curriculum_lessons')
        .upsert({ user_id: user.id, topic_key: topicKey, content: draft }, { onConflict: 'user_id,topic_key' });
      if (dbError) throw dbError;
      setText(draft); setEditing(false); setMessage('Notes saved.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); }
    finally { setWorking(false); }
  }

  return (
    <section aria-label={'Lesson content: ' + topicTitle} className="mt-6">
      {error && <p role="alert" className="mb-3 text-sm font-semibold text-[var(--danger)]">Problem: {error}</p>}
      {message && <p role="status" className="mb-3 text-sm font-semibold text-[var(--success)]">{message}</p>}
      {!loaded ? <p className="text-base text-[var(--muted)]">Loading lesson…</p> : editing ? (
        <div className="space-y-3">
          <label htmlFor="study-lesson-text" className="block text-sm font-semibold text-[var(--fg)]">Lesson content (Markdown)</label>
          <textarea id="study-lesson-text" rows={18} value={draft} onChange={(e) => setDraft(e.target.value)}
            className="w-full resize-y rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] p-4 font-mono text-sm leading-6 text-[var(--fg)]"
            placeholder="## UNDERSTAND, ## MECHANISM, ## WORKED EXAMPLE, ## COMMON MISTAKES, ## INTERVIEW CHECK" />
          <p className="text-sm text-[var(--muted)]">{draft.length.toLocaleString()} / 40,000 characters</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={working || draft.length > MAX_CHARS} onClick={() => void save()}
              className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50">Save notes</button>
            <button type="button" disabled={working} onClick={() => { setDraft(text); setEditing(false); }}
              className="min-h-11 rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-semibold text-[var(--fg)]">Cancel</button>
          </div>
        </div>
      ) : text.trim() ? (
        <>
          <article className="reading">
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
              pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
              table: ({ children }) => <div className="table-wrap"><table>{children}</table></div>,
            }}>{text}</ReactMarkdown>
          </article>
          <button type="button" onClick={() => { setDraft(text); setEditing(true); }}
            className="mt-6 min-h-10 rounded-lg border border-[var(--line-strong)] px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--fg)]">
            Edit notes
          </button>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-5">
          <p className="text-base leading-relaxed text-[var(--fg)]">No saved lesson content for this topic yet.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Your other notes and progress are unaffected.</p>
          <button type="button" onClick={() => { setDraft(''); setEditing(true); }}
            className="mt-3 min-h-10 rounded-lg border border-[var(--line-strong)] px-3 py-2 text-sm font-semibold text-[var(--fg)]">
            Add notes
          </button>
        </div>
      )}
    </section>
  );
}
