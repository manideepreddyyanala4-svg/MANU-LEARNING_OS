/* Supporting checklists transcribed from the 2026-11-05 employer-audited PDF.
 * These 85 PDF boxes are distinct from the 574 module boxes and 20 final exam boxes.
 * Some are review/repetition tasks, so their progress is displayed separately from technical mastery.
 */
export type InternshipExtraChecklist={id:string;title:string;priority:'P0'|'P1'|'P2';items:string[]};
export const internshipExtraChecklists: InternshipExtraChecklist[]=[
  {
    "id": "demand",
    "title": "Employer evidence practice",
    "priority": "P0",
    "items": [
      "Process invalid CSV/JSON rows and test the Python data pipeline (Phison, Jingfeng, COMMEET).",
      "Explain and debug one reproducible OpenCV pipeline (Phison, Synology, ITRI).",
      "Write Dataset/DataLoader, train/eval and a reproducible PyTorch checkpoint (Phison, Synology).",
      "Handle SQL joins, NULL records and aggregate summaries correctly (COMMEET, Judian).",
      "Write pytest fixtures, API cases, regressions and precise bug reports (IsCoolLab, Polymer).",
      "Build a citation-grounded LLM/RAG benchmark only after core Python/API pass gates (Zhousi, Jingfeng, AUO)."
    ]
  },
  {
    "id": "eligibility",
    "title": "Eligibility and job-fit checks",
    "priority": "P0",
    "items": [
      "ITRI E300/Q500: ask whether exactly two 8-hour workdays are acceptable; three full days exceed the general semester 20-hour cap.",
      "COMMEET J64: do not overlook its 24-hours/week on-site condition, incompatible with the general semester 20-hour cap.",
      "IsCoolLab J42: confirm whether a published native-Mandarin requirement can actually be waived.",
      "inline J23: account for its Chinese-language requirement before spending preparation time.",
      "Check legally applicable hourly wages for the year actually worked; 2026 and 2027 minimums differ.",
      "Verify how all existing paid RA, restaurant and internship hours count under your actual permit.",
      "Calculate practical Taichung to Taipei/Hsinchu travel and fixed on-site days.",
      "Save official 104/Cake/company submission proof before labeling a job applied.",
      "Keep one accurate 104 master profile; tailor truthful attached English resume variants for roles.",
      "Prioritize desk-based CV, Python/data, QA/API and English-compatible applied-AI work over physical-only roles."
    ]
  },
  {
    "id": "top",
    "title": "Top 30 ranked practical priorities",
    "priority": "P0",
    "items": [
      "[P0] Python dictionaries/Counter: count image identities, solve Two Sum, handle empty and duplicate cases.",
      "[P0] Python functions, returns and scope: write a validator with three functions and error paths.",
      "[P0] Python lists/strings/sets: clean IDs and normalize text independently.",
      "[P0] File I/O, CSV/JSON and exceptions: safely reject corrupt records and explain output.",
      "[P0] Python interview patterns: solve eight unseen easy problems with time complexity.",
      "[P0] NumPy dimensions and axes: HWC to NCHW with correct dtype/shape assertions.",
      "[P0] NumPy vectorization/normalization: safe cosine similarity and zero-vector handling.",
      "[P0] Pandas labels and missing data: data-quality report with duplicate/NULL counts.",
      "[P0] RGB/BGR and pixels: image read, channel conversion and tensor-shape explanation.",
      "[P0] OpenCV filters, CLAHE and DoG: six-step sample-image pipeline and parameter rationale.",
      "[P0] ROI landmarks and perspective: explain warp geometry and border failure cases.",
      "[P0] Train/test splits and leakage: zero hand-identity overlap, justified protocol.",
      "[P0] Precision/recall/F1/ROC: compute correct denominators and threshold interpretation.",
      "[P0] CNN, batch norm and embeddings: shape calculations and end-to-end tensor explanation.",
      "[P0] PyTorch tensors and autograd: correct requires_grad, gradient reset and update.",
      "[P0] PyTorch Dataset/DataLoader: show batches 4,4,2 with consistent transforms.",
      "[P0] PyTorch train/eval/checkpoint: reproducible minimal training and evaluation.",
      "[P0] Biometric verification versus 1:N: implement synthetic gallery and FMR/FPIR sweep.",
      "[P0] Defend research: 90-second ROI and LAWNet narratives without mixing results.",
      "[P0] Git/Linux debugging: reproduce bug, fix, write test and explain commit.",
      "[P1] SQL JOIN/GROUP BY: ten correct queries across three tables including NULL handling.",
      "[P1] PostgreSQL and Redis awareness: simple SQL schema and Redis role without overclaiming.",
      "[P1] pytest and bug reporting: unit and integration tests for failing edge cases.",
      "[P1] HTTP, REST and FastAPI: validated endpoint and 200/4xx handling.",
      "[P1] ONNX and inference: permitted PyTorch/ONNX parity and latency measurement.",
      "[P1] Docker and CI fundamentals: reproducible container and automated test run.",
      "[P1] LLM API and structured output: bounded text extraction with JSON validation.",
      "[P1] Embeddings, cosine and RAG: public-document retrieval, citations and Recall@k.",
      "[P2] LLM tools and prompt injection: ten hostile document tests with no unauthorized tools.",
      "[P1] Technical Mandarin and eligibility: accurate schedule/permit explanation without fluency claims."
    ]
  },
  {
    "id": "start",
    "title": "First independent Python challenge",
    "priority": "P0",
    "items": [
      "Implement an image/hand identity frequency dictionary independently, including empty inputs.",
      "Implement most_common_hand with a deterministic tie-breaking rule.",
      "Test singleton, tied counts, repeated IDs and invalid item types.",
      "Explain dictionary lookup and O(n) counting; save tests and explanation in ManuOS.",
      "Find one real desk-based paid job that fits work-permit hours and practical commuting."
    ]
  },
  {
    "id": "claims",
    "title": "Truthful interview and resume evidence",
    "priority": "P0",
    "items": [
      "Demonstrate independent Python programming, debugging, data reading and basic tests.",
      "Explain each Computer Vision preprocessing operation and evaluation metric.",
      "Explain PyTorch training code rather than merely citing model imports.",
      "Separate personal research contributions, lab work, current experiments and legacy results.",
      "Personally implement and validate an inference demo before claiming applied engineering experience.",
      "Claim LLM/RAG competence only after retrieval, groundedness and tool behavior are demonstrated."
    ]
  },
  {
    "id": "dorsal",
    "title": "Project 1 — Dorsal research to production AI",
    "priority": "P1",
    "items": [
      "Document the currently verified ROI method, recognition model and applicable benchmark version.",
      "Obtain explicit authorization before using any lab checkpoint or university material in a demo.",
      "Implement a clean permitted inference CLI and document input/output shapes.",
      "Use synthetic/public data whenever private project images cannot be shared.",
      "Compare PyTorch predictions with permitted ONNX export and measure parity.",
      "Add an API only after a working CLI and parity tests.",
      "Write automatic tests and clear setup/failure-case documentation.",
      "Distinguish your personal work from team/lab contributions in every public explanation.",
      "Defer cloud, Kubernetes and TensorRT until performance need and permissions justify them."
    ]
  },
  {
    "id": "rag",
    "title": "Project 2 — Agent Reliability Lab (planned)",
    "priority": "P1",
    "items": [
      "Choose a narrow question-answering use case with a permissibly licensed document corpus.",
      "Create ingestion and a fixed set of evaluation questions before adopting complex frameworks.",
      "Build dense-retrieval RAG that cites exact supporting passages.",
      "Measure retrieval Recall@k, groundedness, unsupported claims and answer factuality.",
      "Compare chunking/hybrid retrieval/reranking against the same fixed benchmark.",
      "Add safe read-only tools, scoped permissions and explicit approval gates.",
      "Test hostile retrieved instructions; block prompt injection, secrets and unauthorized tools.",
      "Measure cost, latency, error rate and document limitations.",
      "Claim Agent/RAG skills only after a working reproducible demo and safety tests."
    ]
  },
  {
    "id": "pipeline",
    "title": "Application evidence and follow-up fields",
    "priority": "P0",
    "items": [
      "Record the unique company, exact role and original job URL.",
      "Record the platform (104, official site, 1111, Cake, LinkedIn or direct employer email).",
      "Capture full JD or dated copy of the exact role's requirements.",
      "Check eligibility, language, location, scheduled days and working hours.",
      "Record the truthful resume version and custom application message submitted.",
      "Verify real submission date/time and save application receipt.",
      "Track exact status: saved, applied, read, screened, interview, offer or rejected.",
      "Record employer rejection reason only if disclosed, otherwise 'not disclosed'.",
      "Track contact, recruiter messages and next appropriate follow-up date.",
      "Save interview feedback and the technical topics it revealed."
    ]
  }
];
export const internshipExtraKey=(groupId:string,index:number)=>'internship-v1-extra-'+groupId+'-'+String(index+1).padStart(2,'0');
export const internshipExtraCount=internshipExtraChecklists.reduce((sum,g)=>sum+g.items.length,0);
