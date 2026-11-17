# Ten missing Learning Library lessons

2026-11-17. Exactly ten existing empty topics, no substitutions. All use the existing Basics and Preprocessing subject, topic identities, titles and statuses. No changes to B1, the 595-topic curriculum, research, finance, authentication, storage policies or original images.

## Audit

The earlier pilot audit checked only topic_notes and was insufficient to assess the personal Learning Library. This audit inspected the actual topic_documents.content_json blocks, linked topic_assets, legacy topic_blocks and topic_notes.

Current inventory: 65 topics total; 53 Basics and Preprocessing; 26 CV topics with asset records, 43 CV assets; six LLM topics with 14 assets; five Python topics with written notes. Resume content is outside scope. `inventory.csv` covers the 64 relevant topics and identifies content to preserve, empty targets and unverified image notes. Empty plain_text and not_started statuses were never treated as proof of missing content.

Existing pixels, noise, kernel, padding, bilateral/NLM, histogram/CLAHE, edge, Sobel/Scharr/Laplacian/LoG/DoG/Canny and thresholding image notes were skipped. The combined “some basic topics written by me” document contains a linked PDF and was preserved. Resizing and Interpolation is still empty but was not substituted into this explicitly bounded assignment.

Actual Python Fundamentals and NumPy Essentials text was inspected, including type, shape, slicing, code/output and independent exercises. Existing PythonLessonLab, BlockNote editor, read renderer and theme tokens were reused. Image block metadata and URLs were inspected, but the current browser session showed an empty library while the connected database contained the notes. Consequently private image/PDF contents are **NOT VISUALLY VERIFIED**. No claims about their technical correctness or exact visual contents are made. Existing explanations cannot be simplified responsibly without reading those images; no replacements were attempted.

## What was saved

All ten newly authored documents were inserted, with guards, into the **existing** topic_documents records after a fresh ownership/content/assets/legacy check. No upsert/overwrite or status update was used. A transaction locked the target topic rows, checked exact IDs/titles/slugs and account ownership, skipped any topic with existing content or assets, and used ON CONFLICT DO NOTHING. All ten inserts succeeded. All ten JSON documents and plain-text values were reloaded and compared with the generated snapshots. Existing document hashes, asset counts and statuses were compared with the pre-write inventory and matched.

No RLS policy, role, security-definer function, service key or schema was added or changed. Operations used the connected project's authorized database workflow; no private account payload is committed here.

Written content is now saved in the Learning Library. The trusted React enhancements require the accompanying application branch. They are **not claimed live in production** before deployment approval. Current production shows the editable written snapshots. The new branch has no production merge or release authorization.

## Authoritative content and rendering

`lib/library-cv10-lessons.json` is the single authoring source: five teaching sections, worked code, actually executed output, line explanations, mistakes, interview/task/rubric and Python exercise tests/solution. `lib/cv10-document.ts` derives BlockNote snapshots. Database documents are editable snapshots, not continuously synchronized copies. Editing either the source or a note never automatically overwrites the other. Do not rerun an importer to replace user edits.

`Cv10Enhancement` matches a fixed topic ID plus a generated marker block ID. Only these trusted React modules run; no user-provided JavaScript or HTML is executed. The marker paragraphs contain fallback text. An error boundary leaves the written mechanism and code available if a demonstration fails. Original rich-text editing remains unchanged. The normal renderer adds enhancements; existing notes without the fixed markers render as before.

Ten topics in the requested sequence:

1. Binary Segmentation Masks — edit selection pixels; compare 0/1 and 0/255.
2. Image Masking and Bitwise Operations — select original values; AND/OR/XOR/logical NOT; demonstrate the direct-AND-with-1 mistake.
3. Erosion — inspect active neighbours, minimum, square/cross and neutral/zero outside.
4. Dilation — inspect maximum and expansion with the same controls.
5. Opening — edit input and step through erosion then dilation.
6. Closing — step through dilation then erosion; compare border effects.
7. Morphological Gradient — compare both intermediate masks and subtract.
8. Connected Components and Labels — toggle pixels, switch 4/8 connectivity, inspect labels and areas.
9. Removing Small Regions from Binary Masks — adjust minimum area; inspect retained groups.
10. Contours (findContours) — choose exact OpenCV presets, retrieval and approximation modes; step through coordinates and hierarchy.

Each has introductory input/output graphics or a labelled numerical flow, a working state-driven mechanism, a self-attempted conceptual check, numerical feedback and a separate runnable Python exercise. The browser Python exercises use lists/NumPy as supported by the existing worker. OpenCV worked examples are executable locally; no browser cv2 availability is claimed. Contours use **16 exact precomputed OpenCV reference cases**, not a browser approximation of arbitrary contour tracing. No decorative or repeated generated images were added.

## Evidence reused, not re-researched

Mayer (2017), https://doi.org/10.1111/jcal.12197; Noetel et al. (2022), https://doi.org/10.3102/00346543211052329; retrieval practice, https://doi.org/10.1111/j.1467-9280.2006.01693.x; WCAG 2.2 https://www.w3.org/TR/WCAG22/. Applied: one decision at a time, manually advanced intermediate states, terms before code, feedback after an attempt, labelled controls and text beyond colour. These design choices are not proof of measured learning improvement.

Technical references: OpenCV filtering/morphology https://docs.opencv.org/doc/doxygen/html/d4/d86/group__imgproc__filter.html and connected components/contours https://docs.opencv.org/doc/doxygen/html/d3/dc0/group__imgproc__shape.html. The morphology convention is a symmetric centred 3×3 structuring element; default binary outside values are neutral (erosion 1, dilation 0), with an explicit outside-zero option. No weighted-average or asymmetric mathematical-convolution claims are made.

## Reproduce and preview

- `node scripts/validate-cv10.mjs /path/to/python-with-numpy-opencv`
- `node node_modules/typescript/bin/tsc --noEmit`
- `node node_modules/eslint/bin/eslint.js components/learning/cv10 lib/cv10-math.ts lib/cv10-document.ts app/learning-preview scripts/validate-cv10.mjs scripts/prepare-cv10-save.mjs`
- `node node_modules/next/dist/bin/next build`

The existing full repository lint has 25 errors and one warning outside new CV10 files. Do not confuse scoped pass with a clean repository-wide lint.

Safe preview routes: `/learning-preview/cv10/{binary,masking,erosion,dilation,opening,closing,gradient,components,regions,contours}`. `/learning-preview/cv10/qa` loads the same StudyDocument renderer in an iframe at 320/375/430/768/1440 CSS pixels. This is a viewport review harness, not another application or roadmap. Preview routes do not load or save account data and are disabled on production builds. Existing authentication still applies.

The ten real topic URLs are obtained from their saved existing subject/topic slugs in the lesson source: `/learning/what-is-an-image-9243452e/<slug>`. Private storage/account URLs and IDs are not included in this report.

Browser QA status and preview address are recorded separately. Mathematical tests and a green build alone do not pass the visual/interaction acceptance gate.
