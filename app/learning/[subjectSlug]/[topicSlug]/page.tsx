'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Page } from '@/components/ui';
import { DocumentCanvas } from '@/components/document-canvas';
import { requireClient, requireUser, subjects, topics, statuses, type Subject, type Topic } from '@/lib/learning';
import type { PartialBlock } from '@blocknote/core';

const emptyDocument: PartialBlock[] = [{ type: 'paragraph', content: '' }];

export default function TopicPage() {
  const { subjectSlug, topicSlug } = useParams<{ subjectSlug: string; topicSlug: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [siblings, setSiblings] = useState<Topic[]>([]);
  const [content, setContent] = useState<PartialBlock[]>(emptyDocument);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [activeHeading, setActiveHeading] = useState<number | null>(null);
  const outline = useMemo(() => content
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === 'heading')
    .map(({ block, index }) => ({
      index,
      text: Array.isArray(block.content)
        ? block.content.map((item) => typeof item === 'string' ? item : (item as { text?: string }).text ?? '').join('')
        : `Section ${index + 1}`,
    })), [content]);

  async function load() {
    const client = requireClient();
    const currentSubject = (await subjects()).find((item) => item.slug === subjectSlug);
    if (!currentSubject) throw new Error('Subject not found');
    const allTopics = await topics(currentSubject.id);
    const currentTopic = allTopics.find((item) => item.slug === topicSlug);
    if (!currentTopic) throw new Error('Topic not found');
    const document = await client.from('topic_documents').select('content_json').eq('topic_id', currentTopic.id).maybeSingle();
    if (document.error) throw document.error;
    let next = (document.data?.content_json as PartialBlock[] | null) ?? null;
    if (!next) {
      const legacy = await client.from('topic_blocks').select('text_content,block_type').eq('topic_id', currentTopic.id).order('order_index');
      if (legacy.error) throw legacy.error;
      next = (legacy.data ?? []).filter((block) => block.block_type === 'text' && block.text_content).map((block) => ({ type: 'paragraph' as const, content: block.text_content ?? '' }));
    }
    setSubject(currentSubject); setSiblings(allTopics); setTopic(currentTopic); setContent(next?.length ? next : emptyDocument);
    localStorage.setItem('manuos:last-learning-topic', JSON.stringify({ subjectSlug, topicSlug }));
  }
  useEffect(() => {
    const timer = window.setTimeout(() => load().catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Could not load topic')), 0);
    return () => window.clearTimeout(timer);
    // Route params are the intentional reload boundary for this client workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectSlug, topicSlug]);

  useEffect(() => {
    if (editing || !outline.length) return;
    const headings = outline.map((item) => document.getElementById(`topic-heading-${item.index}`)).filter((item): item is HTMLElement => Boolean(item));
    if (!headings.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveHeading(Number(visible.target.id.replace('topic-heading-', '')));
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [editing, outline]);

  async function saveDocument(next: PartialBlock[], plainText: string) {
    if (!topic) return;
    const client = requireClient(); const user = await requireUser();
    const { error } = await client.from('topic_documents').upsert({
      user_id: user.id, topic_id: topic.id, content_json: next, plain_text: plainText,
      version: 1, updated_at: new Date().toISOString(),
    }, { onConflict: 'topic_id' });
    if (error) throw error;
    setContent(next);
  }
  async function uploadAsset(file: File) {
    if (!topic || file.size > 50 * 1024 * 1024) throw new Error('Choose a file up to 50 MB.');
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
    if (!allowed.includes(file.type)) throw new Error('Unsupported file type.');
    const client = requireClient(); const user = await requireUser();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
    const path = `${user.id}/${topic.id}/${crypto.randomUUID()}-${safeName}`;
    const uploaded = await client.storage.from('learning-assets').upload(path, file, { contentType: file.type });
    if (uploaded.error) {
      const detail = uploaded.error.message ?? '';
      if (/mime type/i.test(detail)) throw new Error(`This file type isn't enabled for upload yet (${file.type || 'unknown type'}). Images work now; other document types need the storage bucket to be updated once.`);
      throw new Error('Upload failed — please try again.');
    }
    if (!file.type.startsWith('image/')) {
      return `/api/learning-assets?path=${encodeURIComponent(path)}`;
    }
    const { error } = await client.from('topic_assets').insert({ user_id: user.id, topic_id: topic.id, storage_path: path, original_filename: file.name, mime_type: file.type });
    if (error) { await client.storage.from('learning-assets').remove([path]); throw error; }
    return `/api/learning-assets?path=${encodeURIComponent(path)}`;
  }
  const index = siblings.findIndex((item) => item.id === topic?.id);
  return <Page eyebrow={`${subject?.title??'Learning'} / Study`} title={topic?.title ?? 'Topic'} actions={topic&&<span className="text-sm text-[var(--muted)]">{editing?'Editing':'Study mode'}</span>}>
    {message && <p role="alert" className="mt-4 text-sm text-red-600">{message}</p>}
    {topic && subject && <div className="mx-auto max-w-4xl">
      <div className="min-w-0">
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <Link href={`/learning/${subject.slug}`} className="underline">← {subject.title}</Link>
        <label>Status <select aria-label="Topic status" value={topic.status} onChange={async (event) => {
          const value = event.target.value as Topic['status']; const { error } = await requireClient().from('topics').update({ status: value }).eq('id', topic.id);
          if (error) setMessage(error.message); else setTopic({ ...topic, status: value });
        }} className="ml-2 rounded-lg border bg-[var(--bg)] p-2">{statuses.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></label>
        <span className="opacity-60">{editing ? 'Editing document' : 'Study mode'}</span>
        <button className="rounded-lg border px-3 py-1.5" onClick={() => setEditing((value) => !value)}>{editing ? 'Done' : 'Edit'}</button>
      </div>
      <div className="mt-4 flex gap-5 text-sm">{index > 0 && <Link href={`/learning/${subject.slug}/${siblings[index - 1].slug}`}>← Previous</Link>}{index >= 0 && index < siblings.length - 1 && <Link href={`/learning/${subject.slug}/${siblings[index + 1].slug}`}>Next →</Link>}</div>
      <div className={`mt-8 border border-[var(--line)] bg-white/35 p-5 dark:bg-white/[.03] sm:p-10 ${editing ? 'min-h-[60vh]' : ''}`}>
        <DocumentCanvas key={topic.id} topicId={topic.id} initialContent={content} editable={editing} onSave={saveDocument} onUpload={uploadAsset} />
      </div>
      </div>
    </div>}
  </Page>;
}
