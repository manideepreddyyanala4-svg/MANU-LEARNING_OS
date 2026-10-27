const ideas = [
  {
    title: 'Same Person, Two Lives',
    type: 'YouTube Channel / Series',
    status: 'Validated concept',
    date: '27 Oct 2026',
    summary:
      'A visual life-simulation series. Start with the same person, change one major decision, then show how the two lives develop over years or decades.',
    rule:
      'Do not make generic A-vs-B slideshows. Use one recurring person, one decision, a timeline, consequences, trade-offs, and an open ending.',
    episodes: [
      'Same 25-year-old: saves ₹10,000/month vs spends ₹10,000/month — 20 years later',
      'Same man: marries at 28 vs never marries',
      'Same couple: two children vs no children',
      'Same salary: village vs town vs major city',
      'Rent vs buy',
      'India vs abroad',
      'High salary + high stress vs lower salary + peaceful life',
    ],
    format: [
      'Hook immediately: SAME PERSON. TWO LIVES.',
      'Introduce one clear decision.',
      'Split into Life A and Life B.',
      'Jump through time: 5, 10, 20+ years.',
      'Show money, freedom, relationships, health, stress and time.',
      'Do not force a winner. Let viewers decide which trade-off they prefer.',
      'Use original script, calculations/research, characters and visual storytelling — not a repetitive AI slideshow.',
    ],
    firstPilot:
      '45-second pilot: Same 25-Year-Old — Saves ₹10,000 vs Spends ₹10,000. 20 Years Later.',
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
            Capture ideas permanently so they are not lost. Improve them before execution.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6">
        {ideas.map((idea) => (
          <article
            key={idea.title}
            className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
          >
            <div className="border-b border-[var(--line)] bg-[var(--sidebar)] px-5 py-4 sm:px-7">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-500">
                  YouTube
                </span>
                <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-[var(--accent)]">
                  {idea.status}
                </span>
                <span className="px-1 py-1 text-[var(--muted)]">{idea.date}</span>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                {idea.type}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--fg)] sm:text-3xl">
                {idea.title}
              </h2>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[var(--muted)]">
                {idea.summary}
              </p>

              <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Core rule
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--fg)]">
                  {idea.rule}
                </p>
              </div>

              <div className="mt-7 grid gap-6 lg:grid-cols-2">
                <section>
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">Episode ideas</h3>
                  <div className="mt-3 space-y-2">
                    {idea.episodes.map((episode) => (
                      <div
                        key={episode}
                        className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm leading-6 text-[var(--fg)]"
                      >
                        {episode}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-extrabold text-[var(--fg)]">Video formula</h3>
                  <div className="mt-3 space-y-2">
                    {idea.format.map((step, index) => (
                      <div
                        key={step}
                        className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3"
                      >
                        <span className="font-black text-[var(--accent)]">{index + 1}</span>
                        <p className="text-sm leading-6 text-[var(--muted)]">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="mt-7 rounded-xl border border-[var(--accent)] bg-[var(--accent-subtle)] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  First test — do this before building the channel
                </p>
                <p className="mt-2 text-base font-extrabold leading-6 text-[var(--fg)]">
                  {idea.firstPilot}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
