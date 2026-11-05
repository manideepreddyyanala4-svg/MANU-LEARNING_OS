import Link from 'next/link';
import type { Route } from 'next';
import { ArrowLeft, ArrowRight, ChevronRight, Code2 } from 'lucide-react';
import { Page } from '@/components/ui';
import { pandasCodeExamples, pandasModule } from '@/lib/pandas-code';

const shortTitles = [
  "Read CSV, Excel and JSON",
  "DataFrame, Series and dtypes",
  "loc, iloc and row filtering",
  "Missing values and duplicates",
  "Safe type and date conversion",
  "Grouping and counting rows",
  "Joins and accidental row multiplication",
  "Sorting, ranking and outliers",
  "Vectorization and apply",
  "Dataset manifest tables",
  "Stable image and person IDs",
  "Validate labels and class imbalance",
  "Bounding boxes, masks and landmarks",
  "CSV and JSON schemas",
  "Train, validation and test manifests",
  "Checksums and missing files",
  "Excel filters, lookups and pivots",
  "Matplotlib plots",
  "Confusion matrix and class charts",
  "Data privacy and train/test leakage"
];
const pandasLessons = shortTitles.map((shortTitle, i) => ({
  id: String(i+1).padStart(2,'0'),
  shortTitle,
  essence: pandasModule?.topics[i] ?? shortTitle
}));

const colors = [
  { border: 'border-sky-500/25', surface: 'from-sky-500/10 to-cyan-500/5', label: 'text-sky-700 dark:text-sky-300', bar: 'bg-sky-500' },
  { border: 'border-violet-500/25', surface: 'from-violet-500/10 to-fuchsia-500/5', label: 'text-violet-700 dark:text-violet-300', bar: 'bg-violet-500' },
  { border: 'border-emerald-500/25', surface: 'from-emerald-500/10 to-teal-500/5', label: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' },
  { border: 'border-amber-500/25', surface: 'from-amber-500/10 to-orange-500/5', label: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' }
];

export default async function PandasCodeLesson({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson } = await params;
  const lessonNumber = Number(lesson);
  const index = Number.isInteger(lessonNumber) && lessonNumber >= 1 && lessonNumber <= pandasLessons.length
    ? lessonNumber - 1 : -1;
  const current = pandasLessons[index];
  const examples = current ? pandasCodeExamples[current.id] || [] : [];

  if (!current || !pandasModule) {
    return <Page eyebrow="Data preparation" title="Lesson unavailable"
      subtitle="Open a valid Pandas, datasets and practical Excel lesson from the roadmap.">
      <Link href="/roadmap" className="text-sky-600 underline">Back to roadmap</Link>
    </Page>;
  }

  const title = pandasModule.topics[index];
  return (
    <Page eyebrow="ManuOS · Pandas, datasets and practical Excel"
      title={current.shortTitle}
      subtitle={title}>
      <div className="mx-auto max-w-6xl space-y-5 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <Link href="/roadmap" className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline dark:text-sky-300">
            <ArrowLeft size={15}/> Learning roadmap
          </Link>
          <span className="text-xs font-bold text-[var(--muted)]">Lesson {current.id} of 20</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_230px]">
          <main className="min-w-0 space-y-5">
            <header className="rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-emerald-500/5 p-5 sm:p-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-[11px] font-black text-sky-700 dark:text-sky-300">
                <Code2 size={14}/> PANDAS {current.id}
              </div>
              <h1 className="mt-3 text-2xl font-black leading-tight text-[var(--fg)] sm:text-3xl">{current.shortTitle}</h1>
              <p className="mt-3 text-sm leading-7 text-[var(--fg)]">{current.essence}</p>
              <nav aria-label="Code topics in this lesson" className="mt-5 flex flex-wrap gap-2">
                {examples.map((example) =>
                  <a key={example.anchor} href={'#'+example.anchor}
                    className="rounded-lg border border-sky-500/20 bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)] transition hover:border-sky-500 hover:text-sky-600">
                    {example.label}
                  </a>
                )}
              </nav>
            </header>

            {examples.map((example, i) => {
              const color = colors[i % colors.length];
              return <section id={example.anchor} key={example.anchor}
                className={'scroll-mt-24 overflow-hidden rounded-2xl border bg-gradient-to-br '+color.border+' '+color.surface}>
                <div className="flex items-center gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
                  <div className={'h-8 w-1.5 shrink-0 rounded-full '+color.bar} />
                  <div className="min-w-0">
                    <h2 className="text-base font-black leading-6 text-[var(--fg)] sm:text-lg">{example.label}</h2>
                  </div>
                </div>

                <div className="mx-3 overflow-hidden rounded-xl bg-slate-950 shadow-sm sm:mx-5">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300">
                    <Code2 size={14} className="text-cyan-400" /> {example.language==='bash'?'terminal':'python'}
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-6 text-cyan-100 sm:text-[13px]"><code>{example.code}</code></pre>
                  {example.output && <div className="border-t border-white/10 bg-emerald-500/10 px-4 py-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-300">
                      {example.language==='bash'?'Result':'Output'}
                    </span>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-[12px] leading-5 text-emerald-100">{example.output}</pre>
                  </div>}
                </div>

                <div className="p-4 sm:p-5">
                  <p className={'mb-3 text-xs font-black uppercase tracking-wide '+color.label}>How this code works</p>
                  <div className="grid gap-2">
                    {example.explanation.split('\n').filter(Boolean).map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)]/90 p-3">
                        <span className={'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black '+(stepIndex===0?'bg-sky-500/15 text-sky-700 dark:text-sky-300':stepIndex===1?'bg-violet-500/15 text-violet-700 dark:text-violet-300':'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300')}>
                          {stepIndex+1}
                        </span>
                        <p className="min-w-0 pt-0.5 text-sm leading-6 text-[var(--fg)]">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>;
            })}

            <div className="flex items-center justify-between gap-3">
              {index>0 ? <Link href={('/roadmap/pandas/'+index) as Route}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-xs font-bold text-[var(--fg)]">
                <ArrowLeft size={15}/> Previous topic
              </Link> : <span/>}
              {index<pandasLessons.length-1 ? <Link href={('/roadmap/pandas/'+(index+2)) as Route}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white">
                Next topic <ArrowRight size={15}/>
              </Link> : <Link href="/roadmap" className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white">
                Back to roadmap
              </Link>}
            </div>
          </main>

          <aside className="min-w-0 self-start rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 lg:sticky lg:top-20">
            <div className="px-2 pb-3 pt-2 text-sm font-black text-[var(--fg)]">Pandas topics</div>
            <nav aria-label="All Pandas, datasets and practical Excel topics" className="max-h-[73vh] space-y-1 overflow-y-auto">
              {pandasLessons.map((item, i) => <div key={item.id}>
                <Link href={('/roadmap/pandas/'+(i+1)) as Route}
                  aria-current={i===index?'page':undefined}
                  className={'flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold leading-4 transition '+
                    (i===index?'bg-sky-600 text-white':'text-[var(--fg)] hover:bg-sky-500/10')}>
                  <span className="shrink-0 font-black">{item.id}</span>
                  <span className="flex-1">{item.shortTitle}</span>
                  {i===index && <ChevronRight size={13} className="shrink-0"/>}
                </Link>
                {i===index && <div className="ml-6 space-y-1 border-l border-sky-500/20 pl-2">
                  {examples.map(x => <a key={x.anchor} href={'#'+x.anchor}
                    className="block rounded px-2 py-1.5 text-[10px] font-semibold leading-4 text-[var(--muted)] transition hover:bg-sky-500/10 hover:text-sky-600">
                    {x.label}
                  </a>)}
                </div>}
              </div>)}
            </nav>
          </aside>
        </div>
      </div>
    </Page>
  );
}
