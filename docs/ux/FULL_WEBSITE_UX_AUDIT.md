# Full website UX audit

Audit of the original commit `a14450b` (2026-11-16), then the redesign on branch `redesign/warm-cream`. "Rendered" means opened in Google Chrome at 320/375/430/768/1440 px in both themes (screenshots in `docs/ux/screenshots/`); other routes were reviewed from source only.

## Route inventory (35 page routes + 1 API route)

| Route | Purpose | Browser-audited | Page file modified |
|---|---|:-:|:-:|
| `/` Home | overview, mission, career plan | yes | yes |
| `/study-now` | current lesson, next lesson, full curriculum | yes + mock-backend E2E | yes (rewritten) |
| `/learning`, `/learning/[subjectSlug]`, `/learning/[subjectSlug]/[topicSlug]` | personal learning library (own shell `learning-shell.tsx`) | all three (dynamic ones with mock data) | yes (2 of 3) |
| `/python-lab` | in-browser Python practice | yes | no (follows tokens; `globals.css` blocks recoloured) |
| `/roadmap`, `/roadmap/[slug]`, `agent-reliability`, `cv-interview`, `evidenceops-from-zero`, `production-ai`, `rag-interview` | internship roadmaps | all but `[slug]` | yes (4 of 7) |
| `/roadmap/python/[lesson]`, `numpy`, `pandas`, `python-interviews` | built interactive lessons for modules 01–04 | yes (lesson 1 each) | yes (4) |
| `/internship-sprint`, `/job-preparation`, `/job-preparation/ase-archive`, `ase-day-1`, `ase-day-2`, `ase-final-interview-bank` | applications and preparation | yes | yes (6) |
| `/finance` | accounts, budget, analytics | yes (no-data/error state only) | no (components recoloured by tokens) |
| `/life-vision`, `/bhagavad-gita`, `/ideas` | personal | yes | yes (3) |
| `/files`, `/inbox`, `/progress`, `/settings`, `/today-learning`, `/login` | utilities | yes | yes (6) |
| `/ase-final-day`, `/ase-quick-prep` | feature-flagged pages | no (flags off) | components recoloured |
| `/api/learning-assets` | API | n/a | no |

27 of 35 page files were edited; the other pages and the finance components change only through shared tokens, the Tailwind remap and shared components (`shell.tsx`, `ui.tsx`, `globals.css`).

## Problems found in the original, and what was done

| Priority | Problem (evidence) | Action |
|---|---|---|
| High | Cool slate-blue/sky design on pure-white cards (`--bg #f8fafc`, `--surface #fff`); blue accent; about 700 hardcoded palette classes with sky, violet, fuchsia, cyan, indigo, emerald mixed on single pages | Cream/forest-green token system + `@theme` remap (one accent; semantic green/ochre/brick for status) |
| High | Study Now showed a progress bar, a heavy "current lesson" card with three buttons, then a "preview" card, then the notes panel with a bulk-import tool inside it; the 595-topic list sat below | Rewritten: title and status, saved lesson content, previous/next; curriculum and lesson preparation collapsed; Focus Mode |
| High | Bulk JSON import and template downloads inside the lesson note panel | Moved into collapsed "Lesson preparation" (`lesson-preparation.tsx`), logic unchanged |
| High | `dark:` classes followed the OS, not the app switch; "Auto" theme option did nothing (`enableSystem={false}`) | Class-based `dark` variant; system theme enabled; stored choice preserved |
| High | 12 flat sidebar links, subtext lines, version badge, "Online" pulse, fake `man@gmail.com` account strip; header breadcrumb, duplicate search, duplicate settings | 4 primary links + 3 collapsible groups, one nav component for desktop and mobile; strip and badges removed; skip link |
| Medium | Gradients and blurred blobs on Home, Roadmap, lesson headers (39 lines) | Gradients removed (tinted → flat surface, dark → flat deep green); Home keeps two cards and one collapsed section containing the existing content |
| Medium | 273 text classes between 8 and 11 px and 25 CSS declarations at 9–11 px; 422 `font-black`/`font-extrabold` classes | Raised to ≥ 12 px; weights lowered |
| Medium | Markdown notes: `li` all given `list-disc` (ordered lists showed bullets), slate-900 code blocks hard-coded, tables as `display:block` | `.reading` styles: proper lists, token-based code blocks with copy, scrollable table wrapper |
| Medium | Settings showed a hardcoded default email `man@gmail.com` before sign-in | Shows "Not signed in" until the real address loads |
| Medium | `/files` overflowed horizontally at 320 and 375 px | `min-w-0` on grid children |
| Medium | Accessibility (axe): Search/subject-switcher label mismatch, unlabeled file input and home link, non-focusable scroll regions, low-contrast tinted text | Fixed; axe now reports 0 violations (A/AA, WCAG 2.2 tags) on 30 routes × 2 widths × 2 themes |
| Low | Decorative `animate-pulse` in sidebar | Removed there; 3 loading spinners and skeletons kept |
| Low | Duplicate nav/search/capture entry points | Search kept in header and palette; Quick capture kept once |

## Intentionally preserved

Curriculum file `lib/internship-curriculum.ts` untouched (595 topics, IDs and `internshipTopicKey`); `lib/`, `supabase/`, `proxy.ts` and `tests/` untouched; Supabase reads/writes in Study Now (`roadmap_items` upsert and in-progress clearing, `curriculum_lessons` read/upsert) kept identical; JSON import validation and 40-row batching unchanged; Learning Library, Python Lab, Finance, Files, Inbox logic untouched; the existing Focus Mode on Learning topic pages (`html.focus-mode`) still works and its CSS was kept; subject colour picker kept.

## Accepted deviations and remaining issues

- The original home page content (mission, "Why I am here", North Star, projects, roadmap milestone) is kept but now behind one collapsed section; the owner may prefer a different split.
- The Learning Library keeps its own shell and some heavy statistics panels; only recoloured.
- Link and button sizes: the study and navigation routes now have no interactive element under 24 px; the sidebar and header controls are 40 px. Other routes were not all measured.
- Lesson Markdown code has no syntax colouring (adding a highlighter library was avoided); code is monochrome on a themed code surface.
- Python Lab keeps its dark code editor in both themes.
- `app/page.tsx`, `roadmap/page.tsx` and others still contain many tiny decorative chips/badges; they are now ≥ 12 px and low-saturation but not removed.
- 24 pre-existing ESLint errors (React compiler rules in untouched components) remain.
