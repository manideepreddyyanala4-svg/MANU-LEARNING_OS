# Three interactive pilot lessons — 2026-11-17

Preview-only, separate from B1 and saved notes. Exactly three lessons: M07-T01 (L2), M07-T07 (L2), M11-T05 (L3). Topic titles and keys match the canonical repository curriculum and B1. Depth is inherited from the B1 metadata; the external Windows audit CSVs are unavailable, so their current values cannot be independently confirmed.

## Compact content audit

Inspected at base commit a4775e8: all 19 B1 Markdown lessons and their JSON; source/build/validation scripts; Study Now, LessonNotes, importer, curriculum; Python roadmap lesson 01 and its types; NumPy examples 01–04; PythonLessonLab and its worker; RAG core lessons (intro and evidence checking); LearningShell, theme tokens, existing image assets/screenshots. These are representative repository lessons, not a claim to have read all private notes.

| Material | Preserve | Needed improvement / evidence |
|---|---|---|
| B1 all 19 | Topic IDs, synthetic examples, five-part structure, independent exercises | Static Markdown has no working exploratory controls. Mechanism paragraphs compress several new ideas; interview answers are already visible. Original 22 code examples reproduce in this environment. |
| Pixels T01 | Non-square array, shape and crop examples | Separate row/column reasoning, display axes, expose array updates and bounds. The opening “each number is one pixel” is only suitable for grayscale; colour stores several numbers per location. |
| Filtering T07 | Interior and corner comparison | Original says output is a weighted average although general linear kernels need not average. Name cross-correlation first; show all nine values, weights and products, including invented border values. Distinguish OpenCV output clipping from NumPy arithmetic overflow. |
| Metrics T05 | Correct toy counts and denominators | FAR/FMR and FRR/FNMR are presented as unconditional synonyms. Explain comparison versus transaction accounting, define the lesson's one-comparison/no-capture-failure assumptions, show equality ties and unequal denominators. |
| Remaining image B1 | Colour conversion, signed Sobel, noise, filtering, CLAHE examples | T03 says in-place uint8 division changes dtype; NumPy normally raises a casting error. T08's 1-2-1 Gaussian is not a universal kernel for every sigma. T09's non-local search can be bounded. T16's “whole range” language is too absolute for constant/degenerate inputs. Flagged only; originals unchanged. |
| Remaining verification B1 | Pair construction, cosine/probability distinction, source threshold warning | T06 overstates that discrete EER always requires interpolation; exact empirical crossings can exist. T07 quantile threshold needs finite-sample/tie caveats before promising a target bound. No new lessons authored. |
| Python / NumPy | Runnable examples, line explanations, worker sandbox, task tests | Reuse CodeBlock and PythonLessonLab. Do not add another code-execution engine. |
| RAG | Simple project story, concrete unsupported-answer examples | Preserve; no new roadmap or RAG content generated. |
| Deep learning | B1 embedding example and canonical module prerequisite/proof rows | No standalone deep-learning notes were accessible in the connected data; cannot certify their educational quality. |
| Personal Learning Library | Read-only discovery only | Connected active ManuOS database has zero topic_notes and no curriculum_lessons table. This does not prove the live site's private notes are empty or that this is its backing project. No writes, exports of personal data or schema changes. |

Local Windows folder `C:\Users\manideepreddy\Desktop\Roadmap\internship_master_audit` is not mounted. No audit-file contents inferred from names. No access to research data was needed.

## Educational design evidence → actual implementation

- [Mayer 2017](https://doi.org/10.1111/jcal.12197): use explanatory words with meaningful graphics and remove extraneous detail. Applied through labelled, synthetic grids rather than decoration.
- [Noetel et al. 2022](https://doi.org/10.3102/00346543211052329): review supports careful multimedia design; it does not establish that every extra interaction helps. No claim of a measured learning gain for these pilots.
- [Cambridge Handbook, Mayer & Pilegard 2014](https://doi.org/10.1017/CBO9781139547369.016): segment and introduce terms first. Applied through five separated sections and manually controlled gather/multiply/add steps.
- [Retrieval practice, Roediger & Karpicke 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x): attempt an explanation before revealing the comparison rubric. No automatic semantic grading of free text.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): native keyboard controls, explicit labels, focus rings, text alongside colour, no automatic motion and responsive grids. Browser observations are recorded separately; not a certification of complete WCAG conformance.

Technical references: [NumPy indexing](https://numpy.org/doc/stable/user/basics.indexing.html), [OpenCV filter2D](https://docs.opencv.org/doc/doxygen/html/d4/d86/group__imgproc__filter.html), [NIST 800-76-2 §8](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-76-2.pdf). Sources consulted via accessible abstracts/summaries and documentation; no claim to have read paywalled full books.

## Pilot specifications and integration

| Topic | Learning action | Independent evidence |
|---|---|---|
| M07-T01 | Pick location, edit brightness, watch the corresponding array value | Index a non-square array; create and mark a fresh NumPy array |
| M07-T07 | Move window, change border, choose asymmetric kernel, flip, advance calculation | Compute centre/corner by hand; mean9 coding task |
| M11-T05 | Move threshold, inspect nine decisions, toggle the equality mistake | Compute counts/rates at 0.60; implement rates including empty groups |

`lessons/*.md` are the authoring sources. `node scripts/build-pilot.mjs` produces the static client lesson registry and `manifest.json`. ReactMarkdown skips HTML; it never executes note content. React demos are selected from a fixed topic registry. Original SVG visual flows are generated by ConceptFigure; grids and calculation diagrams use accessible HTML. There are no generated decorative images or external visual assets.

Set `NEXT_PUBLIC_INTERACTIVE_PILOT=1` in a **preview environment only**, then use `/study-now/pilot`. The route rejects unknown topic keys and returns not-found with the flag off. Study Now adds a pilot link only on these exact three topics when the flag is on. Existing notes stay in their existing component. Pilot navigation is explicitly between the three previews, not a replacement curriculum. Focus mode uses the existing class and Escape behavior. The pilot neither imports nor updates cloud lessons or progress.

Reusable Python lab loads Pyodide on demand from its existing CDN. NumPy may need a package download. The OpenCV worked example is verified locally; the browser filtering example uses plain Python arithmetic because the existing browser worker does not ship cv2. Worker failure leaves written examples readable.

## Reproduce

1. Install repository dependencies using its lockfile. This environment's pnpm wrapper reported an ignored build script for unrs-resolver after installing packages; no dependency versions were changed.
2. Use a Python virtual environment containing numpy and opencv-python-headless.
3. `node scripts/build-pilot.mjs`
4. `node scripts/validate-pilot.mjs /path/to/venv/bin/python`
5. `node node_modules/typescript/bin/tsc --noEmit`
6. `node node_modules/next/dist/bin/next build`

`validation.txt` records numerical checks. The original B1 validator passed 14/14 with 22/22 examples. Production build completed successfully after the existing Next.js security reminder; the installed Next.js 16.4.2 reported a known security advisory. Dependency remediation is outside this pilot; no production publication performed.

The development launcher translates generic preview `--host` to Next `--hostname`, discards `--strictPort`, and uses webpack after an observed Turbopack internal Google-font module resolution failure. Production build configuration is unchanged.

## Approval boundary and next batch

No live import artifact is necessary: static preview content is intentionally separate from your notes. `manifest.json` documents exact mapping and how to preview. Production deployment or live-account replacement requires your approval. Do not import these three Markdown files and expect React controls to appear in saved Markdown.

After user review only: a two-topic batch M07-T02/T03 (channels and numeric range) would reuse the pixel grid. Alternatively one demanding M11-T06 EER lesson can stand alone. No additional lessons or topic statuses were created.
