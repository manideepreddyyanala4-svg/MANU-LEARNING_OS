# Global redesign validation

Branch `redesign/warm-cream` (from `a14450b`), validated 2026-11-16. Nothing was merged, pushed or deployed.

## What each check proves

| Check | Result | What it proves / does not prove |
|---|---|---|
| `tsc --noEmit` | no errors | types only |
| `next build` | compiled; 32 static pages generated | the app builds |
| ESLint | 24 errors + 1 warning; the original commit had 25 errors + 1 warning | I added none and removed one. The rest are React-compiler rules in untouched code (python-lesson-lab, RagCorePath, internship-sprint, life-vision, today-learning, …) and were left alone |
| `docs/ux/contrast-check.mjs` | all 20 required pairs pass in each theme | token contrast (see design-system doc) |
| axe-core 4 (`docs/ux/axe-audit.mjs`), tags wcag2a/2aa/21a/21aa/22aa | **0 violations** on 30 routes × (1440, 375 px) × (light, dark) = 120 scans | automated WCAG A/AA rules only (about a third of issues); not a manual audit. One earlier dark sweep flagged a heavy page before its theme had settled; re-scanned with a wait it was clean, and the script now waits |
| Route audit (`route-audit.mjs`), Chrome | 30 routes × 5 widths (320, 375, 430, 768, 1440) × 2 themes = 300 page-views: 0 horizontal overflow, 0 load errors, body background `rgb(245,241,232)` (light) / `rgb(30,35,35)` (dark) on every view, 0 pure-white backgrounds | layout and theme consistency, with no data loaded |
| Study Now E2E (`e2e-study-now.mjs`) against a **mock** Supabase (`mock-supabase.mjs`) | **42/42 checks, two consecutive runs** | UI behaviour with a signed-in user: lesson display, markdown/table/code, 18 px / 1.7 line height / ≈73 chars per line, next/previous change only the view and write nothing, "Needs review", pin, "I can do this independently", nothing auto-completed, Focus Mode hides chrome and Esc/button exit, copy button, curriculum shows all 31 modules and search, JSON import writes the lesson and leaves progress alone, invalid pack rejected, no horizontal scroll at 320/375/430, mobile drawer, dark theme, manual theme persists after reload, "system" follows the OS, a stored light choice is not overridden by an OS dark preference. **Does not prove** real database, RLS, sign-in or live data behaviour |
| Existing Playwright specs (Chromium desktop and mobile) | 40 passed (finance-math, finance-page, finance-budget); 4 failed: `smoke.spec.ts` ×2 projects | The two smoke tests expect UI text that does not exist in the original commit ("Configure Supabase to load your workspace.", placeholder "Capture a thought…"; the inbox placeholder is "Capture a question, idea, or reminder…"). They are stale and fail on the original too. The other specs need live owner credentials and were skipped |

## Browser and screen sizes

Google Chrome (installed) for all audits; Playwright Chromium for the existing specs. Widths 320, 375, 430, 768, 1440. Screenshots in `docs/ux/screenshots/` (15 JPEGs: home, Study Now, Focus Mode, mobile Study Now and menu, roadmap, learning, finance, Python Lab, settings in light and dark). Not tested: Safari/WebKit, Firefox, real phones, screen readers, user-increased browser font size, 200% browser zoom directly (reflow at 320 px, equal to 400% of 1280 px, was checked instead).

## Data protection

- `lib/internship-curriculum.ts` (595 topics, IDs), all of `lib/`, `supabase/`, `proxy.ts` and `tests/` have **zero changes** (`git diff --name-only` shows none).
- No progress, notes or Learning Library record was read or written outside the mock server. The live Supabase project was never contacted; no `.env.local` exists on this machine.
- The study-page save logic (`save()`, `load()`) and the import validation are the original code, moved or reused unchanged.
- No other project (dorsal research, EvidenceOps, internship audit, résumé) was touched.

## Changes in behaviour the owner should know about

- "Study this now" is now "Make this my current lesson"; "Open lesson" is "Open interactive lesson"; previous/next buttons change what you read, not the pinned lesson. The pinned lesson still changes only on an explicit button.
- `Auto` theme in Settings now follows the operating system (it was disabled before). Default remains light; stored choices are kept.
- Home: the long personal sections are inside one collapsed "Direction, projects and workspace overview" block (content unchanged).
- The sidebar no longer shows the account strip with the placeholder email.

## Known limitations

1. Authenticated paths against the real backend are unverified (sign-in, RLS, real notes and progress, real Finance data).
2. No Vercel preview exists; none was created.
3. Automated accessibility coverage is partial; no screen-reader pass.
4. Dense text-link lists under 24 px high remain (see audit); main controls are 44 px.
5. Markdown code has no syntax colouring; Python Lab's own editor was not restyled.
6. Dynamic routes needing data (`/learning/[subjectSlug]/…`, `/roadmap/[slug]`) and feature-flagged ASE pages were not rendered.
7. The reading research is limited to the sources listed (no cream-specific evidence exists in them; several papers could not be read).

## Preview

Local: `cd MANU-LEARNING_OS && git checkout redesign/warm-cream && npx pnpm@10.28.2 install && npx next dev`, then open http://localhost:3000. Without `.env.local` the app runs in development mode without sign-in and shows empty states; add your own `.env.local` (see `.env.example`) to use your data. For a Vercel preview, push the branch (`git push -u origin redesign/warm-cream`); Vercel builds a preview URL for the branch and production is unaffected. This was not done without your approval.

## Reproduce

`node docs/ux/contrast-check.mjs`; start `next dev`, then `node docs/ux/route-audit.mjs <url> <outdir> light|dark`; `node docs/ux/axe-audit.mjs <url> <outdir> light|dark <path-to-axe.min.js>` (axe-core is not a project dependency); for the E2E, start `next dev` with `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54399 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test`, then `node docs/ux/e2e-study-now.mjs <url> <outdir>`.

## Files changed (57 modified, 1 new component, `docs/ux/` added)

New: `components/study-now/lesson-preparation.tsx`; `docs/ux/` (four documents, six scripts, mock backend, 15 screenshots). `docs/ux/codemod-cream.py` is the one-off script that removed gradients, raised small text and lowered weights; it was already applied and must not be re-run.

Core: `app/globals.css`, `app/layout.tsx`, `components/shell.tsx`, `components/ui.tsx`, `components/learning-shell.tsx`, `app/study-now/page.tsx`, `components/study-now/lesson-notes.tsx`, `app/page.tsx`.

Pages (29): `bhagavad-gita/page.tsx`, `files/page.tsx`, `globals.css`, `ideas/page.tsx`, `inbox/page.tsx`, `internship-sprint/page.tsx`, `job-preparation/ase-archive/page.tsx`, `job-preparation/ase-day-1/page.tsx`, `job-preparation/ase-day-2/page.tsx`, `job-preparation/ase-final-interview-bank/page.tsx`, `job-preparation/page.tsx`, `layout.tsx`, `learning/[subjectSlug]/page.tsx`, `learning/page.tsx`, `life-vision/page.tsx`, `login/page.tsx`, `page.tsx`, `progress/page.tsx`, `roadmap/[slug]/page.tsx`, `roadmap/agent-reliability/page.tsx`, `roadmap/numpy/[lesson]/page.tsx`, `roadmap/page.tsx`, `roadmap/pandas/[lesson]/page.tsx`, `roadmap/production-ai/page.tsx`, `roadmap/python-interviews/[lesson]/page.tsx`, `roadmap/python/[lesson]/page.tsx`, `settings/page.tsx`, `study-now/page.tsx`, `today-learning/page.tsx`.

Components (28): `ase-day1-interview-prep.tsx`, `ase-day2-interview-prep.tsx`, `ase-final-day-prep.tsx`, `ase-final-interview/ase-final-interview-bank.tsx`, `ase-quick-prep.tsx`, `career/learning-audit.tsx`, `document-canvas.tsx`, `file-handling-cheatsheet.tsx`, `finance/account-forms.tsx`, `finance/accounts-workspace.tsx`, `finance/budget-workspace.tsx`, `finance/day-breakdown.tsx`, `finance/finance-analytics.tsx`, `finance/finance-calendar.tsx`, `finance/finance-data-ownership.tsx`, `finance/finance-module.tsx`, `finance/overview-snapshot.tsx`, `finance/quick-launcher.tsx`, `finance/reported-payments.tsx`, `finance/transactions-workspace.tsx`, `learning-shell.tsx`, `roadmap/EvidenceOpsRoadmap.tsx`, `roadmap/RagCorePath.tsx`, `roadmap/RagStudyPath.tsx`, `roadmap/TrackChecklist.tsx`, `shell.tsx`, `study-now/lesson-notes.tsx`, `ui.tsx`.
