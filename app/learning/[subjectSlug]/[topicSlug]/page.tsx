'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Focus,
  ImagePlus,
  Pencil,
} from 'lucide-react';
import { DocumentCanvas, textOf } from '@/components/document-canvas';
import {
  requireClient,
  requireUser,
  subjects,
  topics,
  sections,
  orderedTopics,
  statuses,
  type Subject,
  type Topic,
  type Section,
} from '@/lib/learning';
import type { PartialBlock } from '@blocknote/core';

const emptyDocument: PartialBlock[] = [{ type: 'paragraph', content: '' }];

export default function TopicPage() {
  const { subjectSlug, topicSlug } = useParams<{
    subjectSlug: string;
    topicSlug: string;
  }>();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [siblings, setSiblings] = useState<Topic[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [section, setSection] = useState<Section | null>(null);
  const [content, setContent] = useState<PartialBlock[]>(emptyDocument);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [doneRequest, setDoneRequest] = useState(0);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => () => document.documentElement.classList.remove('focus-mode'), []);

  async function load() {
    const client = requireClient();
    const currentSubject = (await subjects()).find((item) => item.slug === subjectSlug);
    if (!currentSubject) throw new Error('Subject not found');

    const [allT, allS] = await Promise.all([
      topics(currentSubject.id),
      sections(currentSubject.id),
    ]);
    const currentTopic = allT.find((item) => item.slug === topicSlug);
    if (!currentTopic) throw new Error('Topic not found');

    const doc = await client
      .from('topic_documents')
      .select('content_json')
      .eq('topic_id', currentTopic.id)
      .maybeSingle();
    if (doc.error) throw doc.error;

    let next = (doc.data?.content_json as PartialBlock[] | null) ?? null;
    if (!next) {
      const legacy = await client
        .from('topic_blocks')
        .select('text_content,block_type')
        .eq('topic_id', currentTopic.id)
        .order('order_index');
      if (legacy.error) throw legacy.error;
      next = (legacy.data ?? [])
        .filter((block) => block.block_type === 'text' && block.text_content)
        .map((block) => ({
          type: 'paragraph' as const,
          content: block.text_content ?? '',
        }));
    }

    setSubject(currentSubject);
    setAllSections(allS);
    setSiblings(orderedTopics(allS, allT));
    setSection(allS.find((item) => item.id === currentTopic.section_id) ?? null);
    setTopic(currentTopic);
    setTitleDraft(currentTopic.title);
    setContent(next?.length ? next : emptyDocument);

    localStorage.setItem(
      'manuos:last-learning-topic',
      JSON.stringify({ subjectSlug, topicSlug })
    );
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const timer = window.setTimeout(
      () =>
        load().catch((error: unknown) =>
          setMessage(error instanceof Error ? error.message : 'Could not load topic')
        ),
      0
    );
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectSlug, topicSlug]);

  const imageCount = useMemo(() => {
    return content.filter((b) => b.type === 'image').length;
  }, [content]);

  const isImageNote = useMemo(() => {
    if (!content || !content.length) return false;
    const textChars = textOf(content).trim().length;
    return imageCount > 0 && textChars < 150;
  }, [content, imageCount]);

  async function saveDocument(next: PartialBlock[], plainText: string) {
    if (!topic) return;
    const client = requireClient();
    const user = await requireUser();
    const { error } = await client.from('topic_documents').upsert(
      {
        user_id: user.id,
        topic_id: topic.id,
        content_json: next,
        plain_text: plainText,
        version: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'topic_id' }
    );
    if (error) throw error;
    setContent(next);
    window.dispatchEvent(
      new CustomEvent('manuos:learning-document-saved', {
        detail: { topicId: topic.id, content: next },
      })
    );
  }

  async function uploadAsset(file: File) {
    if (!topic || file.size > 50 * 1024 * 1024)
      throw new Error('Choose a file up to 50 MB.');
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];
    if (!allowed.includes(file.type)) throw new Error('Unsupported file type.');
    const client = requireClient();
    const user = await requireUser();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
    const path = `${user.id}/${topic.id}/${crypto.randomUUID()}-${safeName}`;
    const uploaded = await client.storage
      .from('learning-assets')
      .upload(path, file, { contentType: file.type });
    if (uploaded.error) {
      const detail = uploaded.error.message ?? '';
      if (/mime type/i.test(detail))
        throw new Error(
          `This file type isn't enabled for upload yet (${
            file.type || 'unknown type'
          }).`
        );
      throw new Error('Upload failed — please try again.');
    }
    if (!file.type.startsWith('image/')) {
      return `/api/learning-assets?path=${encodeURIComponent(path)}`;
    }
    const { error } = await client.from('topic_assets').insert({
      user_id: user.id,
      topic_id: topic.id,
      storage_path: path,
      original_filename: file.name,
      mime_type: file.type,
    });
    if (error) {
      await client.storage.from('learning-assets').remove([path]);
      throw error;
    }
    return `/api/learning-assets?path=${encodeURIComponent(path)}`;
  }

  const index = siblings.findIndex((item) => item.id === topic?.id);
  const prevTopic = index > 0 ? siblings[index - 1] : null;
  const nextTopic = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const prevSection = prevTopic
    ? allSections.find((s) => s.id === prevTopic.section_id)
    : null;
  const nextSection = nextTopic
    ? allSections.find((s) => s.id === nextTopic.section_id)
    : null;

  async function saveTitle() {
    if (!topic) return;
    const title = titleDraft.trim();
    if (!title || title === topic.title) {
      setTitleDraft(topic.title);
      setTitleEditing(false);
      return;
    }
    const { error } = await requireClient()
      .from('topics')
      .update({ title })
      .eq('id', topic.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setTopic({ ...topic, title });
    setTitleEditing(false);
    window.dispatchEvent(new Event('manuos:learning-structure-changed'));
  }

  return (
    <div className={`topic-page ${focused ? 'topic-focused' : ''}`}>
      {message && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20">
          {message}
        </p>
      )}

      {topic && subject && (
        <div className={`topic-layout ${isImageNote ? 'is-image-note' : ''}`}>
          {/* Topline Bar */}
          <div className="topic-topline">
            <nav className="topic-crumbs" aria-label="Breadcrumb">
              <Link href={`/learning/${subject.slug}`}>{subject.title}</Link>
              <span className="text-[var(--muted-light)]">/</span>
              {section && (
                <>
                  <Link href={`/learning/${subject.slug}#section-${section.id}`}>
                    {section.title}
                  </Link>
                  <span className="text-[var(--muted-light)]">/</span>
                </>
              )}
              <span aria-current="page">{topic.title}</span>
            </nav>

            <div className="topic-topline-actions">
              {imageCount > 0 && (
                <span
                  className="topic-note-badge"
                  title={`${imageCount} visual note ${imageCount === 1 ? 'sheet' : 'sheets'}`}
                >
                  <ImagePlus size={13} />
                  <span>
                    {imageCount} {imageCount === 1 ? 'note sheet' : 'note sheets'}
                  </span>
                </span>
              )}

              <span className="topic-mode">
                {editing ? 'Writing Mode' : 'Study Mode'}
              </span>

              <button
                className="topic-icon-button"
                type="button"
                title={focused ? 'Exit focus mode' : 'Focus mode'}
                aria-label={focused ? 'Exit focus mode' : 'Focus mode'}
                onClick={() => {
                  setFocused((v) => !v);
                  document.documentElement.classList.toggle('focus-mode');
                }}
              >
                <Focus size={15} />
              </button>

              <button
                className="topic-primary-button"
                type="button"
                onClick={() =>
                  editing ? setDoneRequest((n) => n + 1) : setEditing(true)
                }
              >
                {editing ? (
                  <>
                    <Check size={15} /> Done
                  </>
                ) : (
                  <>
                    <Pencil size={14} /> Edit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Article Header */}
          <header className="topic-header">
            <p className="topic-eyebrow">
              {section?.title ?? 'Other topics'} <span>·</span> Lesson {String(index + 1).padStart(2, '0')}
            </p>

            {titleEditing ? (
              <input
                aria-label="Topic title"
                autoFocus
                className="topic-title-input"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={() => void saveTitle()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void saveTitle();
                  if (event.key === 'Escape') {
                    setTitleDraft(topic.title);
                    setTitleEditing(false);
                  }
                }}
              />
            ) : (
              <h1 className="topic-title">
                {topic.title}
                {editing && (
                  <button
                    type="button"
                    title="Edit topic title"
                    aria-label="Edit topic title"
                    className="topic-title-edit"
                    onClick={() => setTitleEditing(true)}
                  >
                    <Pencil size={18} />
                  </button>
                )}
              </h1>
            )}

            <div className="topic-meta">
              <label className="flex items-center">
                <span>Status</span>
                <select
                  aria-label="Topic status"
                  value={topic.status}
                  onChange={async (event) => {
                    const value = event.target.value as Topic['status'];
                    const { error } = await requireClient()
                      .from('topics')
                      .update({ status: value })
                      .eq('id', topic.id);
                    if (error) setMessage(error.message);
                    else {
                      setTopic({ ...topic, status: value });
                      window.dispatchEvent(
                        new Event('manuos:learning-structure-changed')
                      );
                    }
                  }}
                >
                  {statuses.map((value) => (
                    <option key={value} value={value}>
                      {value.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>

              <span className="topic-meta-separator">·</span>
              <span>{editing ? 'Notebook canvas' : 'Published note'}</span>
            </div>
          </header>

          {/* Open Article Canvas (No border box) */}
          <div className="topic-canvas-wrapper">
            <DocumentCanvas
              key={topic.id}
              topicId={topic.id}
              initialContent={content}
              editable={editing}
              onSave={saveDocument}
              onUpload={uploadAsset}
              doneRequest={doneRequest}
              onDone={() => setEditing(false)}
              onStartEdit={() => setEditing(true)}
            />
          </div>

          {/* Previous / Next Lesson Navigation Cards */}
          <nav className="topic-pagination" aria-label="Lessons">
            {prevTopic ? (
              <Link
                href={`/learning/${subject.slug}/${prevTopic.slug}`}
                aria-label="← Previous lesson"
                className="topic-pagination-card"
              >
                <span>
                  ← Previous lesson · {prevSection?.title ?? 'Lesson'}
                </span>
                <span>{prevTopic.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {nextTopic ? (
              <Link
                href={`/learning/${subject.slug}/${nextTopic.slug}`}
                aria-label="Next lesson →"
                className="topic-pagination-card is-next"
              >
                <span>
                  Next lesson → · {nextSection?.title ?? 'Lesson'}
                </span>
                <span>{nextTopic.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
