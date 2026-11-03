'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Code2, FlaskConical } from 'lucide-react';
import { PYTHON_CHALLENGES, PYTHON_LESSON_PAGES } from '@/lib/python-challenges';
import { PythonLessonLab } from '@/components/python-lesson-lab';
import { Page } from '@/components/ui';

const LESSON_NAMES = [
  'Variables & data types', 'Lists & tuples', 'Conditions', 'for & while',
  'Functions', 'Dictionaries', 'Sets', 'List comprehensions',
  'Dictionary counting', 'Time complexity', 'Two Sum', 'Strings & lists',
  'Debugging', 'Exceptions', 'Creating NumPy arrays', 'Array dimensions',
  'shape, ndim, dtype', 'Indexing & slicing', 'reshape()', 'transpose()',
  'expand_dims() & newaxis', 'Dtypes & normalization',
  'HWC image layout', 'CHW image layout', 'NCHW batches',
  'RGB versus BGR', 'HWC → CHW → NCHW', 'Assertions & image shapes',
] as const;

function idFor(number: number): string {
  return String(number).padStart(2, '0');
}
function titleFor(number: number) {
  return LESSON_NAMES[number - 1] || 'Python practice';
}

export default function PythonLabPage() {
  const [selected, setSelected] = useState('09');
  const [passed, setPassed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const load = () => {
      const result: string[] = [];
      for (let n = 1; n <= 28; n++) {
        const id = idFor(n);
        try {
          if (localStorage.getItem('manuos:python-practice-pass:v1:' + id) === 'passed') result.push(id);
        } catch { /* private browsing */ }
      }
      setPassed(result);
    };
    const timer = window.setTimeout(() => { setMounted(true); load(); }, 0);
    window.addEventListener('manuos:python-test-passed', load);
    return () => { window.clearTimeout(timer); window.removeEventListener('manuos:python-test-passed', load); };
  }, []);

  const challenge = PYTHON_CHALLENGES[selected];
  const group = PYTHON_LESSON_PAGES.find((item) =>
    Number(selected) >= item.start && Number(selected) <= item.end
  );

  return (
    <Page eyebrow="Interactive Learning / Python" title="Python Coding Lab"
      subtitle="Write Python, run programs, inspect errors and verify your own solutions — without leaving ManuOS.">
      <div className="python-lab-page">
        <div className="python-lab-page-header">
          <h1>🐍 Your Python Coding Workspace</h1>
          <p>28 short challenges across Python, interview coding and NumPy. Practice in your own browser; independent code tests do not replace oral interview preparation.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-blue-700 dark:text-blue-300"><Code2 size={14}/> In-browser Python 3</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-700 dark:text-emerald-300"><FlaskConical size={14}/> {mounted ? passed.length : '–'} / 28 practice checks passed</span>
            <Link href="/learning/python-a0e156aa" className="inline-flex items-center gap-1.5 font-bold text-[var(--accent)] hover:underline"><ArrowLeft size={14}/> Back to lesson notes</Link>
          </div>
        </div>
        <div className="python-lab-page-grid">
          <aside className="python-lab-sidebar" aria-label="Choose a Python lesson">
            <div className="python-lab-sidebar-title">Choose an exercise</div>
            {PYTHON_LESSON_PAGES.map((section) => (
              <div className="python-lab-sidebar-group" key={section.slug}>
                <div className="python-lab-sidebar-group-label">{section.title}</div>
                {Array.from({ length: section.end - section.start + 1 }, (_, offset) => section.start + offset).map((number) => {
                  const lessonId = idFor(number);
                  return (
                    <button type="button" key={lessonId} className={selected === lessonId ? 'active' : ''}
                      aria-current={selected === lessonId ? 'true' : undefined}
                      onClick={() => setSelected(lessonId)}>
                      <span><span className="python-lab-sidebar-num">{lessonId}.</span> {titleFor(number)}</span>
                      {passed.includes(lessonId) && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
          <main className="python-lab-workspace">
            <h2 className="python-lab-workspace-heading">Exercise {selected} · {titleFor(Number(selected))}</h2>
            <p className="python-lab-workspace-subtitle">{group?.title} · {challenge?.prompt}</p>
            <PythonLessonLab key={selected} lessonId={selected} defaultOpen />
            <div className="mt-4 text-sm text-[var(--muted)]">
              <strong className="text-[var(--fg)]">Study rule:</strong> Use Run to debug. Use Check solution to test.
              A pass here means your code handles the listed checks; finish the interview question in your notes before marking ManuOS as mastered.
            </div>
          </main>
        </div>
      </div>
    </Page>
  );
}
