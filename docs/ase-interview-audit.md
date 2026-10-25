# ASE interview bank audit — October 25, 2026

Route: `/job-preparation/ase-final-interview-bank`

397 questions read and reviewed; 146 spoken answers changed; all 397 receive short memory cues and realistic speaking-time estimates. No question text or number removed. CORE reduced from 197 to 67. Categories A–O now appear explicitly: L was previously folded into K. All older study routes are unchanged.

## Decisions

- Short-event rehearsal is the default based on the candidate's report. Public sources do not establish a fixed duration or question set for this event. Keep technical backup coverage because other reported ASE interviews include written tests.
- Introduction: current study, evidence, role fit. Behavioral answers: real situation, action, result/lesson. Other questions: answer directly, add necessary context, stop.
- Time labels use 105–130 words/minute, rounded to five seconds. Very short factual answers need not reach 10 seconds. These are rehearsal estimates, not universal interview rules.
- Twelve stories connect overlapping personal and behavioral questions. Technical definitions remain stand-alone facts.
- Spoken scripts no longer tell the candidate to “ASK THIS” or “use a real example.” Missing examples have clearly marked fill-in templates and a Facts to confirm filter.
- Team data collection is distinct from the candidate's assigned coding, experiments and analysis. Advisor supervision and reused tools remain explicit.
- LAWNet is published RGB wrist-vein work used as a baseline on the dorsal-hand task. ONNX is a model format, not an architecture. Old MobileNet work is historical. No MPSNet-centered core narrative.
- New-model development remains ongoing. A session gap does not establish lighting as the cause. Mixed preprocessing results are judged by the predefined evaluation rule.
- Batch normalization includes statistics and learned affine parameters; cosine similarity compares direction and is not a probability; EER is an error rate, distinct from a deployment threshold. Failure bins are clues, not confirmed physical causes.
- No fabricated ATE/production experience. Shift and overtime scripts do not make unsupported commitments. Salary answer asks about the complete package rather than accepting any amount.
- Q396 reflects the 2026 graduate residence exemption, while Q394–395 preserve current student restrictions. Eligibility must be checked at graduation.

## Sources and evidence limits

Readable primary and supporting sources are linked in `components/ase-final-interview/stories.ts` and in the page's collapsed sources panel. They include ASE test services, the ASE employer PTE posting (October 23, 2026), Asia University's event announcement, Yale, Virginia Tech, the LAWNet author repository, PyTorch, WDA, and NIA. Interview.tw reports are anecdotal and are not treated as a guaranteed interview script.

YouTube-oriented research located Jeff Su's introduction and weakness material and MIT's interviewing video. The introduction companion article was readable. Direct video/transcript access could not be verified; no claim of watching complete videos or exhaustively reviewing all requested video topics is made.

Candidate facts, project results, contribution boundaries and model status come from the supplied brief. Experiment logs, the current training configuration and the final resume file were not supplied or independently audited. Thus the reported 3.53/5.33/14.57 EER values remain candidate-provided results, not external verification.

37 question cards explicitly request a personal fact or configuration check. They include appointment title, SQL example, paper details/contribution, undergraduate project/course facts, identity-label mapping, ROI/configuration specifics, actual shift availability, family details, mistake/conflict stories, English-test score and permit expiry. The per-question ledger lists the exact cards.

## Verification

- `node scripts/check-ase-interview-bank.cjs`: numbering 1–397, no duplicates or gaps, categories A–O, 12 stories, all cues/times, template flags, answer-length ceilings, audit metadata and server-rendered cards.
- `./node_modules/.bin/tsc --noEmit`: passed.
- `./node_modules/.bin/next build`: passed; route generated, prior study routes retained.
- `git diff --check`: passed.
- Local mobile/browser QA unavailable: managed preview passed Vite-style `--host`/`--strictPort` flags to Next.js and exited. No app/authentication changes made to compensate.
- Vercel confirmed successful deployment of commit 9eaa7f53b08266b64e94c867ba25de3465cd4840. After secure owner sign-in, the existing route displayed 397 questions and 67 CORE. Live checks passed: CORE filter (67), numeric search (Q129), updated BatchNorm answer, memory-mode hide/reveal, facts filter (37), category L (25), and failed-experiment story filter (15). The revised Q65 answer was verified in the live DOM. Desktop page width did not exceed the viewport. Mobile visual verification remains unverified; no supported viewport-emulation control was available.
