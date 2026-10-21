'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { requireClient, subjects, topics, type Subject, type Topic } from '@/lib/learning';
import type { PartialBlock } from '@blocknote/core';

type Props = { children: React.ReactNode };
const accents = ['#ad7964', '#748fa0', '#6d948b', '#8a7f9f', '#a8946d', '#7f9a7c', '#ae7c88'];
const accentFor = (subject: Subject) => accents[[...subject.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length];
const headingsFrom = (blocks: PartialBlock[]) => blocks.map((block, index) => ({ block, index }))
  .filter(({ block }) => block.type === 'heading')
  .map(({ block, index }) => ({
    index,
    text: typeof block.content === 'string' ? block.content : Array.isArray(block.content)
      ? block.content.map((item) => typeof item === 'string' ? item : (item as { text?: string }).text ?? '').join('')
      : `Section ${index + 1}`,
  }));

export function LearningShell({ children }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [headings, setHeadings] = useState<{ index: number; text: string }[]>([]);
  const [activeHeading, setActiveHeading] = useState<number | null>(null);
  const [topicQuery, setTopicQuery] = useState('');
  const [open, setOpen] = useState(false);

  const segments = pathname.split('/').filter(Boolean);
  const subjectSlug = segments[1];
  const topicSlug = segments[2];
  const subject = subjectList.find((item) => item.slug === subjectSlug);
  const currentTopic = topicList.find((item) => item.slug === topicSlug);

  useEffect(() => {
    subjects().then(setSubjectList).catch(() => setSubjectList([]));
  }, []);

  useEffect(() => {
    if (!subject) {
      Promise.resolve().then(() => setTopicList([]));
      return;
    }
    Promise.resolve(topics(subject.id)).then(setTopicList).catch(() => setTopicList([]));
  }, [subject]);

  useEffect(() => {
    if (!currentTopic) {
      Promise.resolve().then(() => setHeadings([]));
      return;
    }
    Promise.resolve(requireClient().from('topic_documents').select('content_json').eq('topic_id', currentTopic.id).maybeSingle())
      .then(({ data }) => {
        const blocks = (data?.content_json as PartialBlock[] | null) ?? [];
        setHeadings(headingsFrom(blocks));
      })
      .catch(() => setHeadings([]));
  }, [currentTopic]);

  useEffect(() => {
    const saved = (event: Event) => {
      const detail = (event as CustomEvent<{ topicId: string; content: PartialBlock[] }>).detail;
      if (detail.topicId === currentTopic?.id) setHeadings(headingsFrom(detail.content));
    };
    window.addEventListener('manuos:learning-document-saved', saved);
    return () => window.removeEventListener('manuos:learning-document-saved', saved);
  }, [currentTopic]);

  useEffect(() => {
    if (!headings.length) return;
    const elements = headings.map((heading) => document.getElementById(`topic-heading-${heading.index}`)).filter((item): item is HTMLElement => Boolean(item));
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveHeading(Number(visible.target.id.replace('topic-heading-', '')));
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  const progress = useMemo(() => {
    const complete = topicList.filter((item) => item.status === 'mastered').length;
    return topicList.length ? Math.round((complete / topicList.length) * 100) : 0;
  }, [topicList]);
  const visibleTopics = topicList.filter((item) => item.title.toLowerCase().includes(topicQuery.toLowerCase()));
  const accent = subject ? accentFor(subject) : 'var(--rust)';

  return <div className="learning-context min-h-screen bg-[var(--bg)] text-[var(--fg)]">
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" aria-label={open ? 'Close learning navigation' : 'Open learning navigation'} onClick={() => setOpen((value) => !value)}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={15} /><span className="hidden sm:inline">ManuOS</span></Link>
        <span className="h-4 w-px bg-[var(--line)]" />
        <Link href="/learning" className="flex items-center gap-2 text-sm font-bold tracking-wide"><BookOpen size={16} className="text-[var(--rust)]" /> MANU LEARN</Link>
      </div>
      <div className="flex items-center gap-3 text-[var(--muted)]">
        <Link href="/learning" aria-label="Search learning"><Search size={17} /></Link>
        <button aria-label="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
      </div>
    </header>
    <div className="flex">
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-14 left-0 z-20 w-[min(86vw,285px)] overflow-y-auto border-r border-[var(--line)] bg-[var(--bg)] transition-transform lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-[270px] lg:shrink-0 lg:translate-x-0`}>
        <div className="p-5">
          <Link href="/learning" className="text-xs font-bold uppercase tracking-[.18em] text-[var(--rust)]">Learning library</Link>
          {subject && <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em]" style={{ color: accent }}>{subject.title}</p><p className="mt-2 text-xs text-[var(--muted)]">{topicList.filter((item) => item.status === 'mastered').length} / {topicList.length} topics complete</p><div className="mt-3 h-1 bg-[var(--line)]"><div className="h-full" style={{ width: `${progress}%`, backgroundColor: accent }} /></div><input aria-label="Search this subject" value={topicQuery} onChange={(event) => setTopicQuery(event.target.value)} placeholder="Search this subject…" className="mt-5 w-full border-b border-[var(--line)] bg-transparent py-2 text-xs outline-none placeholder:text-[var(--muted)]" /></div>}
          {subject && <nav className="mt-4 space-y-1" aria-label="Subject topics">{visibleTopics.map((item) => { const index = topicList.findIndex((topic) => topic.id === item.id); return <Link onClick={() => setOpen(false)} key={item.id} href={`/learning/${subject.slug}/${item.slug}`} className={`flex items-center gap-3 border-l-2 px-3 py-2 text-sm ${item.id === currentTopic?.id ? 'bg-[var(--rust)]/10 font-semibold' : 'border-transparent text-[var(--muted)] hover:bg-black/5 hover:text-[var(--fg)]'}`} style={item.id === currentTopic?.id ? { borderColor: accent, color: accent } : undefined}><span className="w-5 text-[11px]" style={{ color: accent }}>{String(index + 1).padStart(2, '0')}</span><span className="truncate">{item.title}</span>{item.status === 'mastered' && <span className="ml-auto" style={{ color: accent }}>✓</span>}</Link>; })}</nav>}
          {currentTopic && headings.length > 0 && <nav className="mt-9 border-t border-[var(--line)] pt-6" aria-label="On this page"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--rust)]">On this page</p><div className="mt-3 space-y-1">{headings.map((heading) => <a onClick={() => setOpen(false)} key={heading.index} href={`#topic-heading-${heading.index}`} className={`block truncate border-l-2 px-2 py-1 text-xs ${activeHeading === heading.index ? 'border-[var(--rust)] font-semibold text-[var(--rust)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--fg)]'}`}>{heading.text || `Section ${heading.index + 1}`}</a>)}</div></nav>}
          {!subject && <p className="mt-8 text-sm text-[var(--muted)]">Choose a subject to see its topics.</p>}
        </div>
      </aside>
      {open && <button aria-label="Close learning navigation" className="fixed inset-14 z-10 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  </div>;
}
