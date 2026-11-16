# Lesson pack B1: digital images and verification metrics

**Status: prepared and validated locally. NOT imported into any live account.** No database was contacted and no credentials were used to produce it.

## What it contains (19 lessons, the approved first batch)

| Module | Lessons (topic keys `internship-v1-mNN-tNNN`) |
|---|---|
| 07 Digital images, OpenCV and image preprocessing | t001 pixels and coordinates · t002 colour spaces · t003 bit depth and dynamic range · t004 histogram, contrast, gamma · t005 resampling and interpolation · t006 image noise · t007 kernels, filtering, borders · t008 mean, Gaussian, median · t009 bilateral and non-local means · t010 Sobel and gradients · t011 Scharr, Laplacian, LoG, DoG · **t016** histogram equalization and CLAHE |
| 11 Verification, open-set recognition and scientific evaluation | t001 embeddings and L2 normalization · t002 genuine vs impostor trials · t003 cosine score is not a probability · t004 1:1 verification and thresholding · t005 FAR/FMR, FRR, TAR · t006 Equal Error Rate · t007 TAR at a fixed FAR |

Exact names, required depth, prerequisites, exercises and completion criteria come from the hand-reviewed rows of `08b_ROADMAP_TOPIC_LEVEL.csv` in the internship audit. Each lesson follows UNDERSTAND → MECHANISM → WORKED EXAMPLE → COMMON MISTAKES → INTERVIEW CHECK, with 22 executed Python examples (NumPy and OpenCV) on synthetic data. Dorsal-hand links state only documented facts (audit file 04) and no research results.

## Files

- `b1_lesson_pack.json`: the pack to import (`{"lessons": [{topic_key, topic_title, content}]}`, the format the app's importer reads).
- `lessons/*.md`: the same 19 lessons as separate Markdown files for reading and review.
- `lessons_m07.py`, `lessons_m11.py`, `examples_m07.py`, `examples_m11.py`: sources. `build_b1.py` regenerates the pack; it **runs every example** and refuses to build if a number quoted in the prose is missing from the real output.
- `validate_b1.py`: checks the shipped JSON (keys, titles against the live curriculum, importer rules, sections, Markdown fences, secrets scan, no result figures in dorsal paragraphs, and re-executes all 22 examples found inside the JSON comparing outputs).
- `import-and-render-test.mjs`: browser test against the **mock** backend (imports through the real importer UI, checks that an existing note is not overwritten, renders all 19 lessons at 375 and 1440 px in light and dark).
- `../verify_audit_ids.py`: confirms the audit's 595 topic IDs and titles match `lib/internship-curriculum.ts` and that B1 is 19 hand-reviewed topics.

## Reproduce the checks

Needs Python with `numpy` and `opencv-python-headless` (a virtual environment is enough):

```
python docs/lesson-packs/verify_audit_ids.py <path-to-internship_master_audit>
python docs/lesson-packs/B1/build_b1.py <python-exe> <path-to-internship_master_audit>
python docs/lesson-packs/B1/validate_b1.py <python-exe>
```

Last results: ID check PASS; 14/14 pack checks; 22/22 examples reproduce exactly; browser import and render test 10/10 (mock backend).

## The one remaining step: import into your account (needs you)

1. Open Study Now on the live site and sign in.
2. Open **Lesson preparation** and choose `docs/lesson-packs/B1/b1_lesson_pack.json`.
3. Leave **"Replace matching existing notes" unchecked.** Any topic that already has a saved note is skipped; topics without one receive the new lesson.
4. Press **Import prepared lessons**. The message should say 19 topics processed.

Nothing else is needed. Importing does not change your completed or in-progress topics. If you want to try one lesson first, make a copy of the JSON that keeps only one entry and import that.

## Limits

- The lessons were checked by code, by the app's importer logic and by browser rendering against a mock. They have **not** been imported or read in your live account.
- Example outputs come from NumPy 2.5.5 and OpenCV 5.0.0. Random-seed examples (noise, synthetic scores) could differ slightly in the last digit on other library versions; the structural results do not change.
- Time estimates are the audit's planning figures, not measurements.
