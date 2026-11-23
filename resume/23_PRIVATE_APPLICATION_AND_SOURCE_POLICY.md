# Private application and source policy

The GitHub repository is public. Use scoped source IDs in [the register](12_RESEARCH_SOURCE_REGISTER.csv), dated public job facts, claim decisions, and source categories. Keep application dates and statuses, raw or quoted messages, contact details, academic and permit records, restricted research, images, logs and original resumes in owner-controlled private records. November 19 originals and review records are preserved privately.

## Application reconciliation

- Use the private ManuOS job-preparation tracker. Match exact employer, role, platform and submission date. Resolve bilingual aliases against an original record. Treat a missing date or ambiguous role as unresolved where it prevents deduplication.
- Save the approved record owner and the exact original role. Use `applied` when the tracker only has submission or read evidence. Record the read event and date in its notes, because the UI has no read-only state. A generic platform or employer notification is an acknowledgment or message signal. Check original message content before assigning interview, rejection or offer.
- Preserve any user-defined status, notes and date. If a direct reply uses a different role name from the posting, keep the direct evidence and leave the exact role match unresolved unless a common application reference establishes it.
- For additions, restrict data to the authenticated owner, perform a dry-run deduplication against current tracker rows, and apply additions together. Read back counts and verify old user-entered rows are preserved. New platform events can then update the same application by source and dates. Historical unrelated applications and unauthenticated/portal-only items stay in their source records until the exact role and outcome can be reconciled.
- Check postings and the actual employer form again at application time. Never add private application outcomes, personal identifiers, account links or records to a public shortlist.

## Research and authorship

Use [the project guide](07_PROJECTS_AND_RESEARCH_CLAIMS.md) for approved technical scope. Before employer-facing use of restricted work, get written approval for the wording, audience and any metrics, visuals or links. Retain the exact restricted original only through the authorized private source.

## Career workspace storage

Use the existing [ManuOS Job Preparation](https://manu-learning-os.vercel.app/job-preparation) interface. Resumes and other career documents belong to the private Supabase buckets `manu-resumes` and `manu-job-files`. Account authentication and owner-scoped policies govern upload, retrieval and removal. Both buckets cap files at 20 MiB and accept the formats shown by the corresponding upload control.

Store one original per owner and file digest. In the document's evidence editor, record the matching source and claim IDs from [the source register](12_RESEARCH_SOURCE_REGISTER.csv) and [claim ledger](11_CLAIM_TO_SOURCE_LEDGER.csv). Use historical status for original resume versions, then choose a current version explicitly when appropriate. A verified document does not independently approve an achievement for a resume. Current application dates and private evidence/follow-up notes belong to the application record.

Apply and verify the linked career-storage migration before releasing its interface from the review branch. Validate real owner upload, authenticated retrieval, duplicate rejection, deletion, anonymous access denial and cross-account isolation with disposable files before adding private originals. Keep original documents out of GitHub and deployment files. The private source records remain authoritative until a matching canonical original is verified in the career workspace.
