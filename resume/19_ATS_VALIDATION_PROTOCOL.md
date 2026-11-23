# Future DOCX/PDF validation protocol

**Specification only. No new resume, upload or ATS score was generated.** Greenhouse S16 documents problems with graphics, image-only resumes, column layouts, tables, contact information in headers/footers/text boxes and inconsistent sections. Its 2.5 MB parsing ceiling is vendor-specific; a failed parse may leave the attachment intact. This does not prove rejection or describe every employer's parser. N12/N13 distinguish native 104 fields from the attached English file.

## Inputs and immutable records

For each later authorized resume, retain the approved claim IDs and intended text in a private UTF-8 record, exact target JD/form and date, source DOCX, exported PDF, tool versions, file sizes and SHA-256. Confirm the accepted format and maximum size from that actual form. Test a copy; never overwrite a historical resume. Redact private contact information from public test reports.

## Automated checks to run when a resume exists

| Check | Reproducible procedure | Pass condition / limitation |
|---|---|---|
| DOCX text | Read `word/document.xml`, tables, headers, footers, text boxes and hyperlink relationships with OOXML/python-docx-aware tooling. Preserve paragraph order and identify text located outside the main flow. | Every intended factual token is present; no hidden duplicate claims or contact block dependent on a header/text box. OOXML order alone is not universal ATS order. |
| PDF text | Extract with Poppler `pdftotext` in ordinary and `-layout` modes; independently compare with pypdf where available. Record page count. | Text layer contains all intended content in sensible section/bullet order. An image-only PDF fails; OCR is not assumed. |
| Content comparison | Normalize Unicode to NFC, line endings, nonbreaking spaces and deliberate line wraps; compare extracted tokens against approved text, keeping numbers, minus signs, percentages, dates and names exact. | No unexplained missing/changed factual token. Keep raw extraction and an explicit diff; never normalize away a factual discrepancy. |
| Reading order | Compare section sequence and each bullet's token sequence; inspect both extraction modes. | One-column flow is coherent; dates/roles do not detach from employers; no interleaving across columns. |
| Headings / dates | Check approved names, standard section labels, Month YYYY consistency, current June 2027 self-report and date ranges. | All match the approved ledger; no outdated July, future presentation in past tense or invented employment period. |
| Skills | Compare each displayed skill to a supported, role-relevant claim ID. | No keyword hidden text, repeated skill spam or package-presence-as-proficiency inference. |
| Links | Extract DOCX relationship URLs and PDF link annotations; compare display text and target, check intended public destinations. | All intended links reachable/owned or explicitly marked inaccessible; no private file/library URLs. A URL fetch alone does not verify contribution. |
| Special characters | Detect U+FFFD, broken encoding, invisible characters, missing ligatures and inconsistent hyphen/minus symbols. | Names, punctuation, percentages and Traditional Chinese survive extraction. A simple ASCII-only regex is insufficient for Chinese. |
| Layout objects | Inspect tables, floating shapes, embedded images, headers/footers and font runs. | Necessary text stays in readable main flow. Aesthetic tables are not silently approved from appearance. |
| Size / name | Measure bytes; use a descriptive filename and verify exact portal cap. | File accepted by the actual form; Greenhouse parsing/upload limits are recorded separately. |

Example commands after a file exists (placeholders, not executed here):

```text
pdftotext -enc UTF-8 approved_resume.pdf extracted.txt
pdftotext -layout -enc UTF-8 approved_resume.pdf extracted-layout.txt
pdfinfo approved_resume.pdf
pdffonts approved_resume.pdf
```

Missing tools make the affected check BLOCKED, not passed. Unit tests that only mirror a template do not replace extraction/content checks. No external ATS upload is necessary for this local specification.

## Visual and submission checks

Render every DOCX and PDF page at legible resolution using the document/PDF inspection workflow. Inspect clipping, overlap, line breaks, bullet alignment, spacing, hyperlinks, font substitution, margins, page count, headings and contact details. Check Traditional Chinese glyphs and font embedding/substitution; a multilingual interface is not evidence that the attachment renders correctly. Compare the source and exported versions, including page boundaries. Record review outcome and any tool/rendering failures.

Review the actual employer/platform autofilled fields against the approved text only when a later application is authorized. Keep native profile/autobiography and attached English resume factually consistent. Successful upload, extractable text, human readability, legal eligibility and interview selection are separate outcomes. Do not claim a template passes every ATS or assign a fabricated screening percentage.
