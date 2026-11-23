# Interview evidence framework

Actual candidate understanding is **NOT ASSESSED** for every row below. Questions are review prompts derived from the cited JDs, inspected mechanisms and evidence gaps, not testimony from a real interviewer or a prediction of hiring decisions. Micron's official interview guidance asks applicants to explain experiences, challenges and outcomes and prepare for role-dependent technical assessments (S37). ITRI and Appier qualifications establish job relevance, not the candidate's ability (S21/S22/P06).

## HR and employer eligibility review

| Claims / topic | Evidence to inspect | Questions to resolve before an application |
|---|---|---|
| C101–C105 identity/contact | Owner-confirmed professional details privately | Is the spelling consistent? Are links public and owned? What information is actually required by this channel? |
| C111/C116/C201 education | N01 correction, enrollment/expected-completion record | June 2027? Will enrollment continue after this specific internship? |
| C117–C120 degree/grades | Transcript, grading scale, award record | What is the original grade and scale? Is the course completed or ongoing? |
| C121 appointment | Appointment/supervisor confirmation | What was the exact title, start date, work scope and paid/academic arrangement? |
| C104/C145 hours | Permit and institution/employer confirmation | What is permit validity? How much other counted work exists? Can two fixed days fit the total cap? |
| C144 languages | Current self-assessment and interview interaction | Can the candidate work from English specifications? What Mandarin tasks need help? No assumed CEFR score. |
| C114 availability / pay | Thursday timetable, commute plan, actual offer terms | Does travel fit fixed onsite shifts? Is the role paid? Does duration extend past graduation? |
| C203 applications | Actual dated submission/status evidence | Is this submitted, merely saved/viewed, or explicitly rejected/interviewed? |
| C301–C305 publication | N03/N04 plus final camera-ready record | Which title/status is current? Is presentation future? What did the applicant contribute? |

## Technical review

| Claims | Artifact / role relevance | Claim-specific questions | Evidence needed for defensibility |
|---|---|---|---|
| C112/C122/C127 ROI | L04; N02; current code required; E300 CV | Which MediaPipe points form the ROI? How are normalized coordinates converted? Why perspective warp? What fails under occlusion, rotation or degeneracy? | Trace one approved input/output and personally owned change; distinguish localization IoU from recognition EER. |
| C123 hand/person/session | N05/N06; CV/data-quality | Why can two hands be separate biometric identities but one split group? Which session labels are uncertain? Does same-side appearance prove identity? | Approved manifest, grouping logic and acquisition provenance. |
| C124 LAWNet/MPSNet | N21/N22 literature; N05 report | Wrist versus palm versus dorsal? Cross-session versus all-pairs? Which published value belongs to which original dataset? What could a replication gap mean? | Exact configs/checkpoints/logs and independent metric check; no assumed successful replication. |
| C123/C126 normalization | N05; source-only evaluation | Where is channel gain applied relative to saturation? What is fixed across arms? Were dorsal labels used to choose targets? How were paired intervals constructed? | Fidelity/config/seed/fold records and locked protocol, not slides alone. |
| C129/C136 retrieval | P01 hybrid_search/search_bm25; RAG/software | Write RRF for two rankings. Why not add raw cosine and keyword scores? Is this hybrid BM25+dense? How are versions/dimensions checked? | Attributable change and an independently explained miniature example. |
| C130 agent gate | P02 call_tools/available_actions; QA/RAG | When is `used` updated? Does a failed search unlock draft/finish? Which actions, duplicates and budgets are rejected? | Trace successful, failed and empty searches without claiming universal safety. |
| C131 API roles | P03 authorize functions; Appier testing | Access vs operator vs approval? What happens if secrets match or are absent? What does this not establish about authentication? | Explain tested status/error paths and personally written test or endpoint change. |
| C128 grounding | Ollama check_claims/claim_supported | Why does an exact quote not prove entailment? What triggers abstention versus withholding? Can the checker falsely reject Chinese evidence? | Attributable code/evaluation case and failure analysis; no invented accuracy. |
| C132 tests | P04; N08/N09 | Why 84 total but 75 passed? Which missing fixture changes a skip? What revision/log supports 73/8? Which assertions use mocks? | Revision-stamped log, data conditions and owned tests. |
| C136/C138 MCP/Ollama | P02; N08; inspected mcp_server/ollama_client | What crosses stdio? Which secret is excluded? How are loopback/model checks enforced? Which behavior was actually observed live? | Run/recording with date/model/config if claiming runtime; no assumed current demo. |
| C137 SQLite / optional PostgreSQL | L05/N08 code references | Which application data use SQLite? What does the PostgreSQL adapter test? Can the candidate explain a query and transaction boundary? | Owned schema/query changes and data-safe demonstration. |
| C139/C202 ONNX | N02 historical report; N07 export code | What inputs/outputs, preprocessing and tolerances were compared? Were embeddings, decisions and rejection thresholds all checked? | Exported model/config/parity log; current dorsal model lineage if relevant. |
| C141/C305 publications | N03/N04 | What was the applicant's task? Who designed the method? What was accepted, published or merely planned? | Contribution confirmation and final bibliography. |
| C134–C140 general skills | Selected owned functions; exact target JD | Implement a small relevant function, diagnose a failing input, explain tradeoffs and tests. Which parts were AI-assisted? | Observed explanation/coding, recorded separately from repository presence. |

## Assessment record for a later session

Record claim ID, artifact/version, prompt, candidate answer, demonstrated reasoning, errors, assistance used, and outcome (DEMONSTRATED / PARTIAL / NOT DEMONSTRATED / NOT ASSESSED). Do not turn preparation scripts or rehearsed model answers into evidence of competence. One failed optional skill need not invalidate an unrelated truthful claim; narrow or omit the affected wording.

## Role-specific checks

The run or project artifact is established where stated. **Concept understanding, independent coding and individual contribution are unassessed** for each item until demonstrated. Use approved examples and public code. Record the result privately against the claim ID.

| Role | Claim and source | Practical check before claiming the skill |
|---|---|---|
| CV / image processing | C122, C125, C135, C327 and permitted ROI records | Draw the four ROI points and show how an ordering error changes the warp. Explain DoG vs CLAHE, then code one small transformation on a shareable image and identify a failure. |
| AI / ML | C123–C124, C327 and pinned protocol records | Explain subject-disjoint train/validation/test separation, genuine/impostor scores and EER with a toy score list. Explain the all-pairs vs cross-session comparison and why a target result cannot select the model. |
| Python / AI software | C129, C131, C134, C137 and EvidenceOps `api.py` | Parse a CSV into typed rows, handle invalid input and explain one endpoint, status code and transaction. Show a personally attributable edit or test. |
| LLM / RAG / agent | C029–C031, C130, C136, C315 and EvidenceOps `retrieval.py`, `ollama_client.py`, `rag.py` | Compute RRF on two short rank lists. Show a mismatched quote, a refusal, and where tool permissions and a human approval are enforced. |
| Data processing / analyst | C125, C137, C140 and the subject/session evidence or public UCI check | Deduplicate a tiny manifest by a clear key. Write a grouping query, reconcile missing values and explain why missing labels change the analysis. |
| Software testing / AI QA | C132, C308, C328 and original CI smoke jobs | Write a positive test and an invalid-input case. Explain the 8/9-skip difference, fixture boundary and what the PostgreSQL smoke test establishes. |
| HR / ownership / schedule | C104, C116, C121, C145, C326 and private records | Reconcile dates and availability, describe AI-assisted work precisely, and show one significant decision, bug fix or record personally owned. |
