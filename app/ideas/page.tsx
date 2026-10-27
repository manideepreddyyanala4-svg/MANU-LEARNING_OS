import {
  Baby,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clapperboard,
  Heart,
  Lightbulb,
  MapPin,
  Play,
  Sparkles,
  Trees,
  Youtube,
} from 'lucide-react';

const comparisons = [
  {
    title: 'Saving money vs not saving money',
    left: 'Save & build security',
    right: 'Spend now & enjoy now',
    icon: CircleDollarSign,
  },
  {
    title: 'Marriage vs no marriage',
    left: 'Build life with a partner',
    right: 'Stay single / independent',
    icon: Heart,
  },
  {
    title: 'Kids vs no kids',
    left: 'Life with children',
    right: 'Child-free life',
    icon: Baby,
  },
];

export default function IdeasPage() {
  return (
    <div className="manu-workspace">
      <header className="manu-page-header">
        <div>
          <p className="manu-page-eyebrow">Idea Vault</p>
          <h1 className="manu-page-title">Ideas</h1>
          <p className="manu-page-desc">
            A permanent place for ideas worth keeping. Capture first. Judge later.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 md:mt-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--fg)]">
            <Lightbulb size={14} className="text-[var(--accent)]" />
            1 idea saved
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl">
        <article className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--line)] bg-[var(--sidebar)] px-5 py-4 sm:px-7">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-red-500">
                <Youtube size={13} />
                YouTube idea
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-subtle)] px-2.5 py-1 text-[var(--accent)]">
                <Sparkles size={13} />
                Raw idea
              </span>
              <span>Saved 27 Oct 2026</span>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-8">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
                Working title
              </p>
              <h2 className="text-2xl font-black tracking-tight text-[var(--fg)] sm:text-3xl">
                Life Choices — Visual Comparison YouTube Series
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">
                Make simple, highly visual videos that show two different life choices side by side.
                Use small photos, light animation, short text and music instead of heavy talking.
                The viewer should be able to understand the story almost immediately.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {comparisons.map(({ title, left, right, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-sm font-extrabold leading-5 text-[var(--fg)]">
                      {title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                      <div className="mx-auto mb-2 h-12 rounded-lg bg-[var(--accent-subtle)]" />
                      <p className="text-xs font-bold leading-4 text-[var(--fg)]">{left}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                      <div className="mx-auto mb-2 h-12 rounded-lg bg-black/5 dark:bg-white/5" />
                      <p className="text-xs font-bold leading-4 text-[var(--fg)]">{right}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MapPin size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">
                    Village vs town vs city
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Show the same person living three different versions of life: quiet village,
                    balanced town and busy city. Compare money, space, work, family time, travel,
                    stress, convenience and freedom through visuals rather than long explanation.
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-xs font-bold text-[var(--fg)]">
                      <Trees size={15} className="text-emerald-600" />
                      Village
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-xs font-bold text-[var(--fg)]">
                      <Building2 size={15} className="text-[var(--accent)]" />
                      Town
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-xs font-bold text-[var(--fg)]">
                      <Building2 size={15} className="text-[var(--muted)]" />
                      City
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--sidebar)] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Clapperboard size={18} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">Core video format</h3>
                </div>

                <div className="space-y-3 text-sm text-[var(--muted)]">
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-black text-white">1</span>
                    <p><strong className="text-[var(--fg)]">Start with one person / one decision.</strong> Make the choice clear in the first few seconds.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-black text-white">2</span>
                    <p><strong className="text-[var(--fg)]">Split the life paths.</strong> Show both sides with small photo scenes and simple animation.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-black text-white">3</span>
                    <p><strong className="text-[var(--fg)]">Show consequences over time.</strong> Money, freedom, stress, relationships, health and time.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-black text-white">4</span>
                    <p><strong className="text-[var(--fg)]">Do not preach.</strong> End by letting the viewer think about which trade-off fits their life.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Play size={18} className="text-red-500" />
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">Why this idea is interesting</h3>
                </div>

                <div className="space-y-3">
                  {[
                    'Universal topics people already think about.',
                    'Easy to understand even with very little dialogue.',
                    'One visual format can become a repeatable series.',
                    'The contrast creates natural curiosity: “Which life is better for me?”',
                  ].map((item) => (
                    <div key={item} className="flex gap-2.5 text-sm leading-6 text-[var(--muted)]">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg)] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                Keep this part of the idea
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--fg)]">
                The main advantage is the <strong>visual comparison</strong>: small photo/animation scenes,
                simple words, two or three possible lives, and clear long-term trade-offs. Do not turn it
                into a lecture.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
