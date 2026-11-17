# Interview-first learning audit and teaching rule

## Priority
Manu Learning OS lessons must prepare a beginner to answer **technical interviews**, not only to follow an interactive demonstration. Future lessons should present: **definition in plain English → why it matters → one accurate example → mechanism and code → common mistakes → one self-attempted interview follow-up with a revealable answer**. The definition must be visible before interactions; extra answers should stay collapsed to minimize distraction.

## Verified sources inspected
- The ten CV10 lessons in `lib/library-cv10-lessons.json` and their interactive renderer: they contain UNDERSTAND, mechanism, examples and numerical exercises, but lack a consistently labelled concise spoken definition and model follow-up answer at the beginning.
- All 24 guided Python fundamentals have an `essence` sentence and code; some essentials are definitions, others only describe use, with no consistent spoken interview follow-up on the code-lesson route.
- The 21 guided NumPy code topics start with a topical summary and code. The array-versus-list definition and its interview answer were not presented consistently before code.
- Five personal Python Learning Library topics have written BlockNote content with interview prompts or quick notes. These must NOT be overwritten merely to add definitions.
- The 19 B1 Markdown lessons on GitHub have UNDERSTAND and INTERVIEW CHECK sections with short answers. At audit time `curriculum_lessons` in the connected live database contained zero entries, so that pack is not claimed to be in the live Study Now account.
- Original CV and LLM image-first notes are user-owned. Their images/PDFs were not exhaustively visually inspected in this pass; no claim is made that a specific image is missing an interview definition.

## Implemented scope
A **display-only** reusable Interview Foundation section appears:
1. Above the saved rich-text notes for the ten CV10 topics, using the existing verified topic titles, without changing database records.
2. Above the five existing personal Python topic collections (including `NumPy Essentials` and its exact interview definition of an array).
3. On the 24 Python and 21 NumPy guided code-lesson routes, before code examples.

Each section provides a precise definition, why it matters, a small example, and an interview follow-up whose sample answer stays hidden until requested. It never sets progress, changes user notes or modifies the original Python exercises.

## Interview test example
**Question: What is an array?** An array is an indexed collection of elements. A NumPy `ndarray` has a defined shape and a common element dtype, allowing multidimensional numerical operations. For example, `np.array([[1,2],[3,4]])` has shape `(2,2)`. A Python list may contain objects of different types; a NumPy array is designed for efficient operations on homogeneous numerical data. NumPy arrays can be noncontiguous views, so do not claim every ndarray occupies one contiguous memory block.

## Scope and non-goals
- This is a focused interview-readiness correction for **60 topic contexts**: 24 guided Python, 21 guided NumPy, 10 CV10, 5 personal Python collections. It is **not an audit of all 595 curriculum topics**, nor an assertion that every question has been exhaustively covered.
- No private note content or image is committed, regenerated, deleted or overwritten.
- No B1 import is performed and no research protocol or Finance code is touched.
- Later work should inspect image-only personal notes through authorized access and add explicit definitions only where missing, instead of inventing summaries of unviewed images.
- Future authoring must meet the interview-first rule above rather than writing prose-only or diagram-only lessons.

## Release gate
Verify React/TypeScript compilation and deployment status for the commit, that the live routes load, and that the spoken-answer panel appears after authentication. Browser interaction behind authenticated user sessions cannot be claimed tested without an actual signed-in session.
