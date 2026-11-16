# Global redesign validation

Branch `redesign/warm-cream` (from `a14450b`). First pass 2026-11-16; **final pre-deployment verification (second pass) is section 0.** The first-pass results follow in section 1.

## 0. Final pre-deployment verification: result and recommendation

**Recommendation: GO for a Vercel preview deployment of the branch. NO-GO for merging to production until one blocker is cleared.**

Every check that can run without your credentials passes, and nothing is worse than the original. The one production blocker: authenticated behaviour against your real Supabase project could not be tested here (no `.env.local`, no credentials), so it is **BLOCKED**, not passed. It can be cleared in about ten minutes on the preview URL (checklist in 0.4). The redesign leaves every data-access call unchanged (0.2), so the expected risk is low, but "expected" is not "verified".

| # | Item | Result |
|---|---|---|
| 1 | The five previously unrendered routes | **PASS** against the mock backend with safe seeded data: `/learning/[subjectSlug]`, `/learning/[subjectSlug]/[topicSlug]`, `/roadmap/[slug]`, `/ase-final-day`, `/ase-quick-prep`. HTTP 200, real content, no horizontal overflow, no runtime errors, axe 0 violations, light and dark at 320, 768, 1440 px (30 checks), plus Learning note editing: typing autosaves to `topic_documents` and reloads (3 checks). 33/33. The ASE pages are hidden from navigation by feature flags but render at their URLs |
| 2 | Undersized links in study and navigation flows | **FIXED, PASS.** Audit of 9 routes (Study Now, Home, Learning ×3, Roadmap, Python Lab, a built lesson, Settings) at 1440 and 375 px: 65 interactive elements under 24 px before, **0 after**. Study Now itself had 0. Sidebar and mobile header controls are 40 px tall. Other routes were not all measured |
| 3 | Code readability in both themes | **PASS**, 22/22. Rendered contrast: code 11.63:1 light and 14.21:1 dark, inline code 11.86:1 and 9.74:1; indentation preserved; a 300-character line scrolls inside the block without page overflow; the block is keyboard-focusable; copy returns the exact code; font ≥ 14.6 px. **Syntax highlighting not added**: it needs a highlighter dependency and a separately validated token palette per theme, and the monochrome blocks already pass at over 11:1, so it is neither straightforward nor justified now |
| 4 | Authentication, Supabase, lesson loading, note editing, progress, JSON import | **Mock backend PASS. Real backend BLOCKED.** See 0.2 |
| 5 | Theme persistence, Focus Mode, Previous/Next, mobile | **PASS**, 42/42 Study Now checks re-run on the final code: persistence after reload, `system` follows the OS without overriding a stored choice, Focus Mode hide/restore by button and Esc, Previous/Next write nothing, mobile drawer, no overflow at 320/375/430 |
| 6 | Baseline failures vs new regressions | **No new failures.** Identical tests run on the untouched original commit `a14450b` in its own worktree give identical results (0.3) |
| 7 | Build, typecheck, lint, tests | 0.3 |
| 8 | Evidence saved | This document; scripts and screenshots in `docs/ux/` |

### 0.1 Defects found and fixed in this pass

1. **Hydration mismatch in dark mode on every route** (React "Hydration failed" on the theme icon). The original code had the same pattern (`theme === 'dark' ? Sun : Moon`). Fixed in both shells by drawing both icons and showing one with CSS; the button's accessible name is now the constant "Toggle light or dark theme".
2. **Learning Library shell**: accessible-name mismatches (section toggles, Next lesson link, profile button); white text on the dark-mode accent button (1.94:1); a scrollable table keyboard users could not reach (ASE quick prep). Fixed; axe clean.
3. **Undersized targets**: Learning header hamburger (19 px) and home link (14 px), breadcrumbs, Learning topic links, roadmap topic links (20 px), Home "View all" and "Manage", Python Lab links and the stdin summary, a Settings dismiss button (22 px, now labeled). Fixed with padding or minimum heights on those elements only.
4. **A regression I introduced and caught**: my first fix for the 14 px home link made the Learning header 20 px too wide at 320 px. The re-run caught it; corrected and re-verified (33/33).

### 0.2 Data access and authentication

- **Static comparison:** for all 57 changed code files, the call sites for Supabase and auth (`.from('…')`, `.auth.*`, `upsert/insert/update/delete/rpc`, `createClient/requireClient/requireUser`, `onConflict`, `.eq/.like/.in` filters) were compared with the original. The only difference is that the JSON import moved from `lesson-notes.tsx` to the new `lesson-preparation.tsx` (one read, one save and one import on `curriculum_lessons`, before and after). `lib/`, `proxy.ts`, `supabase/` and `tests/` have zero diff.
- **Mock backend** (`docs/ux/mock-supabase.mjs`, in-memory, safe seeded data only): Study Now loads a signed-in user and shows saved lesson content; "Needs review", "Make this my current lesson" and "I can do this independently" write the expected `roadmap_items` rows and nothing else; viewing or moving between lessons writes nothing; notes edit and save; a valid JSON import writes `curriculum_lessons` and leaves progress alone; a pack with an unknown key is rejected; Learning topic note autosave and reload work.
- **BLOCKED (not claimed as passed):** sign-in against the real Supabase, `proxy.ts` redirects with a real session, row-level security, your real notes and progress, real Finance and Internship data, real storage (Files, topic assets). No real account or record was touched.

### 0.3 Gates on the final code

| Gate | Redesign branch | Original `a14450b` |
|---|---|---|
| `tsc --noEmit` | 0 errors | 0 errors |
| ESLint | 24 errors, 1 warning | 25 errors, 1 warning |
| `next build` | compiled; 32 pages generated | not run |
| Playwright (desktop and mobile Chromium): `smoke`, `finance-math`, `finance-page`, `finance-budget` | 40 passed, 4 failed | 40 passed, 4 failed |
| axe-core, 30 routes × (1440, 375 px) × (light, dark) | 0 violations | not run |
| Layout audit, 30 routes × 5 widths × 2 themes (300 views) | 0 overflow, 0 load errors | not run |
| Study Now E2E, mock backend | 42/42 | n/a (new) |
| Five routes + Learning note editing, mock backend | 33/33 | n/a |
| Code readability | 22/22 | n/a |

The 4 failures are `smoke.spec.ts` on both desktop and mobile projects, on both commits: that spec expects text absent from the original source ("Configure Supabase to load your workspace.", placeholder "Capture a thought…"). They are not caused by this redesign. The other Playwright specs need live owner credentials and are skipped, which is also **BLOCKED**. The 24 ESLint errors are existing React-compiler rule violations in code this redesign did not touch (one fewer than the original).

### 0.4 Check on the preview URL before merging (about 10 minutes, with your real login)

1. Sign in. `/` loads and `/study-now` shows your pinned lesson and your existing completed count.
2. Open a lesson that has saved notes: content renders. Edit, Save, reload: the change persists (then revert it).
3. Press "Needs review" on a lesson whose status you can restore, reload, restore it.
4. In "Lesson preparation", import a one-lesson test JSON for a topic with no notes; leave "Replace matching existing notes" unchecked; confirm other notes are untouched; delete the test note.
5. Open `/learning` and a topic, edit and save a note; open `/finance` and `/files` and confirm your data appears.
6. Toggle theme, reload, confirm it persists; set Settings → Auto and confirm it follows your operating system.

---

## 1. First-pass results

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
4. (Resolved in the second pass: 0 interactive elements under 24 px on nine study and navigation routes; other routes not all measured.)
5. Markdown code has no syntax colouring; Python Lab's own editor was not restyled.
6. (Resolved in the second pass: those five routes were rendered against the mock backend.)
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
