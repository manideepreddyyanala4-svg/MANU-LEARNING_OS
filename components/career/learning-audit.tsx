'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, CheckCircle2, ClipboardList, FolderOpen, RefreshCw, SearchCheck, Target, TriangleAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type TopicRow = {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  status: string;
};
type SubjectRow = { id: string; title: string; slug: string };
type DocumentRow = {
  topic_id: string;
  plain_text: string | null;
  content_json: unknown;
};
type Summary = {
  topics: TopicRow[];
  subjects: SubjectRow[];
  documents: DocumentRow[];
  applications: number;
  interviewNotes: number;
  resumes: number;
  roadmapTotal: number;
  roadmapCompleted: number;
};

export function LearningAudit() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const client = createClient();
      if (!client) throw new Error('Supabase connection is not configured.');
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Sign in to inspect your private preparation records.');
      const userId = user.id;
      const [subjects, topics, docs, roadmap, applications, notes, resumes] = await Promise.all([
        client.from('subjects').select('id,title,slug').eq('user_id', userId),
        client.from('topics').select('id,title,slug,status,subject_id').eq('user_id', userId),
        client.from('topic_documents').select('topic_id,plain_text,content_json').eq('user_id', userId),
        client.from('roadmap_items').select('status').eq('user_id', userId),
        client.from('applications').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        client.from('interview_notes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        client.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);
      const firstFailure = [subjects, topics, docs, roadmap, applications, notes, resumes]
        .find((query) => query.error);
      if (firstFailure?.error) throw firstFailure.error;
      const roadmapRows = (roadmap.data ?? []) as { status: string }[];
      setData({
        subjects: (subjects.data ?? []) as SubjectRow[],
        topics: (topics.data ?? []) as TopicRow[],
        documents: (docs.data ?? []) as DocumentRow[],
        roadmapTotal: roadmapRows.length,
        roadmapCompleted: roadmapRows.filter((item) => item.status === 'completed').length,
        applications: applications.count ?? 0,
        interviewNotes: notes.count ?? 0,
        resumes: resumes.count ?? 0,
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to audit learning records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    if (!data) return null;
    const richImages = data.documents.filter((doc) => (
      Array.isArray(doc.content_json) && doc.content_json.some((item) => (
        typeof item === 'object' && item !== null && 'type' in item && item.type === 'image'
      ))
    )).length;
    const written = data.documents.filter((doc) => (doc.plain_text ?? '').trim().length >= 80).length;
    const marked = data.topics.filter((topic) => ['understood','completed','review'].includes(topic.status)).length;
    return { richImages, written, marked };
  }, [data]);

  const review = useMemo(() => {
    if (!data) return [];
    const desired = ['What is an image','Kernal','Sobel X and Sobel Y','DOG','CLAHE','CANNY','OTSU THRESHOLD','ADAPTIVE THRESHOLD'];
    const map = new Map(data.subjects.map((subject) => [subject.id, subject]));
    return desired
      .map((title) => data.topics.find((topic) => topic.title.toLowerCase() === title.toLowerCase()))
      .filter((topic): topic is TopicRow => Boolean(topic))
      .map((topic) => ({ ...topic, subject: map.get(topic.subject_id) }))
      .filter((topic) => topic.subject !== undefined);
  }, [data]);

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Live private records · audit</p>
          <h2 className="mt-1 text-lg font-extrabold text-[var(--fg)]">What you have prepared so far</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">This reads your existing ManuOS notes and tracking data, not a guessed proficiency score.</p>
        </div>
        <button type="button" disabled={loading} onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--fg)] disabled:opacity-40">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Re-audit
        </button>
      </div>

      {error && <p role="alert" className="m-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="p-5 text-sm text-[var(--muted)]">Reading learning, roadmap and career records…</p>}

      {data && counts && !loading && (
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Saved learning topics', value: data.topics.length, icon: BookOpenCheck },
              { label: 'Marked understood', value: counts.marked, icon: CheckCircle2 },
              { label: 'Roadmap completed', value: data.roadmapCompleted + ' / ' + data.roadmapTotal, icon: Target },
              { label: 'Applications tracked', value: data.applications, icon: ClipboardList },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                <Icon size={17} className="text-[var(--accent)]" />
                <p className="mt-3 text-xl font-extrabold tabular-nums text-[var(--fg)]">{value}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
            <div className="flex items-start gap-2">
              <TriangleAlert size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <p className="text-sm leading-6 text-[var(--fg)]">
                <strong>What these records mean:</strong> {counts.richImages} learning documents contain image blocks
                and {counts.written} have at least 80 characters of searchable written notes.
                Saved diagrams and a status label do not prove interview mastery.
                Test every topic by independently explaining it and solving a small Python/OpenCV task.
                Zero tracked applications does not prove you have applied nowhere else.
              </p>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Additional saved items: {data.interviewNotes} career interview notes; {data.resumes} resume file records.
              These are live counts, not an assessment of files outside ManuOS.
            </p>
          </div>

          {review.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[var(--fg)]">
                <SearchCheck size={17} className="text-[var(--accent)]" />
                Reuse your saved learning notes
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {review.map((topic) => (
                  <Link key={topic.id}
                    href={('/learning/' + topic.subject!.slug + '/' + topic.slug) as Route}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-3 text-sm font-semibold text-[var(--fg)] hover:border-[var(--accent)]">
                    <span className="truncate">{topic.title}</span>
                    <FolderOpen size={16} className="shrink-0 text-[var(--accent)]" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
