'use client';
import { useState } from 'react';
import { FileUp } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { MAX_CHARS } from '@/components/study-now/lesson-notes';

type Lesson = { topic_key: string; content: string };
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Lesson preparation (administration): template download and bulk JSON import into `curriculum_lessons`.
 * Behaviour is unchanged from the previous in-lesson importer (same validation, batching, overwrite flag);
 * it now lives behind a collapsed section so it never competes with reading.
 */
export function LessonPreparation({ validKeys, topicTitles, onImported }: {
  validKeys: string[]; topicTitles: Record<string, string>; onImported: () => void;
}) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pack, setPack] = useState<Lesson[] | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  async function auth() {
    const client = createClient();
    if (!client) throw new Error('Cloud storage is not configured.');
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) throw new Error('Sign in to use your study notes.');
    return { client, user };
  }
  async function choose(file?: File) {
    setPack(null); setError(''); setMessage('');
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json') || file.size > MAX_BYTES) {
      setError('Use a .json file smaller than 12 MB.'); return;
    }
    try {
      const data: unknown = JSON.parse(await file.text());
      const items: unknown = Array.isArray(data) ? data : (data && typeof data === 'object' ? (data as { lessons?: unknown }).lessons : null);
      if (!Array.isArray(items) || !items.length || items.length > validKeys.length)
        throw new Error('Expected a nonempty lessons array within the curriculum topic count.');
      const keys = new Set(validKeys), seen = new Set<string>(), out: Lesson[] = [];
      for (const [index, item] of items.entries()) {
        if (!item || typeof item !== 'object' || typeof (item as Lesson).topic_key !== 'string' || typeof (item as Lesson).content !== 'string')
          throw new Error('Invalid entry at row ' + (index + 1) + '.');
        const { topic_key, content } = item as Lesson;
        if (!keys.has(topic_key)) throw new Error('Unknown topic key: ' + topic_key);
        if (seen.has(topic_key)) throw new Error('Repeated topic key: ' + topic_key);
        if (!content.trim() || content.length > MAX_CHARS) throw new Error('Empty or oversized lesson: ' + topic_key);
        seen.add(topic_key); out.push({ topic_key, content });
      }
      setPack(out);
    } catch (e) { setError(e instanceof Error ? e.message : 'Invalid JSON pack.'); }
  }
  async function importPack() {
    if (!pack || working) return;
    setWorking(true); setError(''); setMessage('');
    let processed = 0;
    try {
      const { client, user } = await auth();
      for (let i = 0; i < pack.length; i += 40) {
        const batch = pack.slice(i, i + 40).map((item) => ({ ...item, user_id: user.id }));
        const { error: dbError } = await client.from('curriculum_lessons')
          .upsert(batch, { onConflict: 'user_id,topic_key', ignoreDuplicates: !overwrite });
        if (dbError) throw dbError;
        processed += batch.length;
      }
      setPack(null);
      setMessage('Import finished: ' + processed + ' topics processed. ' +
        (overwrite ? 'Matching existing notes were replaced.' : 'Existing notes were preserved.'));
      onImported();
    } catch (e) {
      setError('Import stopped after ' + processed + ' entries were processed. ' +
        (e instanceof Error ? e.message : 'Unknown error.') + ' You can retry safely.');
    } finally { setWorking(false); }
  }
  const sample = JSON.stringify({ lessons: [{
    topic_key: 'internship-v1-m01-t001',
    content: '# UNDERSTAND\nA Python script is a .py file.\n\n## MECHANISM\nFile → interpreter → output\n\n## WORKED EXAMPLE\n~~~python\nprint("Hello")\n~~~\nOutput: Hello\n\n## COMMON MISTAKES\nConfusing the file with the interpreter.\n\n## INTERVIEW CHECK\nWhat runs Python code?',
  }] }, null, 2);
  function download(name: string, body: string) {
    const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-base font-semibold text-[var(--fg)]"><FileUp size={18} aria-hidden="true" /> Import prepared lessons (JSON)</p>
      <p className="text-sm leading-6 text-[var(--muted)]">
        Prepare a JSON file with lesson content and matching topic keys, then upload it once; each topic opens its own saved notes.
        Your original learning notes and completed-topic records stay separate.
      </p>
      {error && <p role="alert" className="text-sm font-semibold text-[var(--danger)]">Problem: {error}</p>}
      {message && <p role="status" className="text-sm font-semibold text-[var(--success)]">{message}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => download('manuos-full-course-template.json',
          JSON.stringify({ lessons: validKeys.map((key) => ({ topic_key: key, topic_title: topicTitles[key] || key, content: '' })) }, null, 2))}
          className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--fg)]">
          Download all-topic template
        </button>
        <button type="button" onClick={() => download('manuos-lesson-example.json', sample)}
          className="min-h-11 rounded-lg border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--fg)]">
          Download example
        </button>
      </div>
      <p className="text-sm leading-6 text-[var(--muted)]">The template has your real topic keys and titles but no lesson content. Empty entries are rejected on import.</p>
      <details className="rounded-lg border border-[var(--line)] p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--fg)]">Show the required JSON format</summary>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-[var(--code-bg)] p-3 text-xs text-[var(--code-fg)]">{sample}</pre>
      </details>
      <label htmlFor="lesson-pack-input" className="block text-sm font-semibold text-[var(--fg)]">Choose .json lesson pack (max 12 MB)</label>
      <input id="lesson-pack-input" type="file" accept=".json,application/json" onChange={(e) => void choose(e.target.files?.[0])}
        className="block w-full text-sm text-[var(--fg)]" />
      {pack && (
        <div className="space-y-3 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-3">
          <p className="text-sm font-semibold text-[var(--fg)]">{pack.length} valid lesson keys checked against the existing curriculum.</p>
          <label className="flex items-start gap-2 text-sm leading-6 text-[var(--fg)]">
            <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
            Replace matching existing notes. Leave unchecked to keep all existing notes.
          </label>
          <button type="button" disabled={working} onClick={() => void importPack()}
            className="min-h-11 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
            {working ? 'Importing…' : 'Import prepared lessons'}
          </button>
        </div>
      )}
    </div>
  );
}
