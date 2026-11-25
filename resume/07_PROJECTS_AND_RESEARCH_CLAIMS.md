# Project and research claims

## RGB Dorsal-Hand Biometric Verification Research

The work concerns verification using RGB smartphone images and a fixed four-knuckle region. Research records describe MediaPipe landmarks, OpenCV perspective alignment, and image enhancement. Verification uses genuine and impostor comparisons and metrics such as EER, FAR and TAR. Describe a method as personal work only after tracing it to an attributable artifact and confirming the allowed level of external detail. See C028, C112, C122–C127, C135 and C327.

- Use external eligible data for training and selection. Dorsal data is evaluation-only. Preserve the fixed ROI for protocol comparisons and hold the target-data firewall.
- MPSNet's paper comparison uses all-pairs on the relevant source benchmark. Its cross-session result is a separate result. LAWNet's comparison uses cross-session pairs with actual session assignment verified.
- Color-normalized runs are distinct from original-pipeline reproductions. Treat scientific correspondence as guidance and reports as recorded results. Do not quote provisional dorsal results, counts or improvements. Require the advisor-confirmed correction/exclusion log, frozen subject and session manifest, exact evaluation revision, per-seed/fold results and uncertainty appropriate to the protocol before approving a metric.
- Historical ONNX claims require a current attributable export, numerical parity and a timed inference result with hardware and settings before use as outcomes. Keep raw notes, images, session assignments, papers and correspondence private.

For external use, obtain advisor approval covering the exact wording and audience, including the title, status, authorship or presentation details if needed. Request separate permission for numerical claims, images, slides, links, or a manuscript. Use the published 2023 citation only where relevant, and verify individual contributions before describing them.

## EvidenceOps / Agent Reliability Lab

The public repository's current revision is [3e919f9b740e3c5516c40a77072c42c59e22e70c](https://github.com/manideepreddyyanala4-svg/LLM-RAG/tree/3e919f9b740e3c5516c40a77072c42c59e22e70c). The source and CI support these artifact-level statements. The [November 25 EvidenceOps audit in PR #2](https://github.com/manideepreddyyanala4-svg/LLM-RAG/pull/2) consolidates the linked implementation, test, contribution and limitation evidence. See C029–C033, C128–C132, C308, C315 and C328 with P01–P03, V02 and V03.

| Area | Verified scope | Claim gate |
|---|---|---|
| Retrieval | `retrieval.py` implements keyword, bilingual lexical, BM25, cosine vector and hybrid retrieval. Hybrid fuses bilingual keyword and semantic vector rankings using reciprocal-rank fusion (RRF). BM25 is implemented separately. | Explain rank fusion using a tiny example and show personal changes. Do not call the hybrid path BM25 + vector. |
| Answers | `rag.py` selects evidence and calls the local Ollama integration. `ollama_client.py` checks reply shape, source ID and exact quotes, and applies an additional support check. | Demonstrate a refusal and a citation failure. Verified code supports the checks, with no benchmark claim about answer accuracy. |
| Tools | `rag.py` limits the tool loop and gates later actions on a recorded search invocation. `mcp_server.py` scopes tools, and the API separates operator and approval checks. | Show the point where a pending record needs a human decision. An attempted search does not establish a useful result. |
| API and storage | `api.py` exposes FastAPI endpoints. Local records use SQLite. `database.py` has separate optional PostgreSQL and pgvector support. | Explain request validation, persistence and one failure path. No evidence of a production deployment. |
| Tests | [Original Actions run](https://github.com/manideepreddyyanala4-svg/LLM-RAG/actions/runs/43042149127) on the same head. Smoke job ran 84 cases, 8 skipped and 76 non-skipped. Separate synthetic PostgreSQL/pgvector smoke check succeeded. | Eight cases require the gitignored full starter dataset. Without downloaded UCI raw files one additional check skips, explaining the archived 75/9 result. The older 73/8 source log remains unavailable. |

The audit describes actual Ollama case results reported by the project. Their raw evaluation output was unavailable for independent reproduction, so no answer-accuracy claim is approved. Commit history explicitly credits Claude on core implementation and evaluation changes. Repository authorship and commit metadata support provenance, while individual coding contributions and proficiency still need a dated diff, decision or owned test with a clear explanation. Production readiness, security certification and broad prompt-injection resistance have no approved claim. See C033 and the candidate-claim gates C128–C131 and C134–C138.
