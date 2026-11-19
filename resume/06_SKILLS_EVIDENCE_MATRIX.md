# Skills, projects and claims matrix
Read with [04](04_RESUME_SECTION_BLUEPRINT.md) and [11](11_CLAIM_TO_SOURCE_LEDGER.csv). Classification separates what the software contains from what the candidate personally did. No project artifact alone establishes personal mastery.

See [07 project claims](07_PROJECTS_AND_RESEARCH_CLAIMS.md) for claim-specific contribution and result gates.

C202 adds historical reported ONNX use; personal proficiency remains unverified. The original workspace-only lack of evidence must not be interpreted as proof the applicant never used it.

## Skill evidence
| Skill | Employer relevance | Available evidence / location | Personal skill level | Decision / claim |
|---|---|---|---|---|
| Python | W100 requirement; repeated historical demand | P01 retrieval functions; P02 agent logic | USER-REPORTED; code documented, proficiency unconfirmed | VERIFY FIRST C134 |
| PyTorch | W100 preferred; CV project | L04 Architecture/training is secondary audit | Documented but personal proficiency unconfirmed | VERIFY FIRST C135 |
| OpenCV | CV/image pipeline relevance, not universal JD keyword | L04 ROI/preprocessing audit | Documented; no raw dorsal source in workspace | VERIFY FIRST C135 |
| MediaPipe | Landmark ROI task | L04 ROI section only | Documented personal use unconfirmed | VERIFY FIRST C135 |
| NumPy | Image/tensor/maths support | L04 and L06; Python cosine code alone is not NumPy use | Partial/documented only | VERIFY FIRST C135 |
| pandas | Data roles | No direct personally owned pandas work inspected | NOT VERIFIED | VERIFY FIRST C140 |
| scikit-learn | ML/data roles | No direct personally owned implementation identified | NOT VERIFIED | VERIFY FIRST C140 |
| SQL | Software/data roles | L05 SQLite persistence; query proficiency not tested | Partially documented | VERIFY FIRST C137 |
| SQLite | Local application storage | L05 Persistence; database.py connection locations found | Documented personal proficiency unconfirmed | VERIFY FIRST C137 |
| PostgreSQL, pgvector | Backend/vector adapters | L05 adapter; P05 CI service configuration | Documented, live checks not performed | VERIFY FIRST C138 |
| FastAPI | API/software roles | P03 role checks directly read; other routes in L05 | Artifact demonstrated; personal ability unconfirmed | VERIFY FIRST C131/C137 |
| RAG / grounded answering | Logitech historical J42; RAG family | P02 run_agent calls grounded_answer; L05 generation/claim checks | Artifact partial source verification, authorship unknown | VERIFY FIRST C113/C128 |
| Lexical/BM25/cosine/RRF | Retrieval roles | P01 functions directly read | Artifact PRIMARY VERIFIED; personal skill unconfirmed | VERIFY FIRST C129/C136 |
| Agent tool sequencing | Agent/reliability roles | P02 available_actions/tool_arguments | Artifact PRIMARY VERIFIED; contribution unknown | VERIFY FIRST C130 |
| MCP | Agent roles | L05 client/server architecture; call path in P02 | Documented, no live run | VERIFY FIRST C136 |
| Ollama | Local inference application | L05 model adapter/configuration | Documented but current inference not verified | VERIFY FIRST C138 |
| Testing | Appier C021; historical QA roles | P04 log, P05 workflow, L05 mocked boundary | Artifact log verified; author/mastery unknown | CONDITIONAL C132 |
| Git | Shared engineering requirements | L05 history report; no current checkout | Documented, no personal workflow observed | VERIFY FIRST C138 |
| Linux | Shared/robotics roles | Job demand and L06 learning gap | Planned/learning or unknown | VERIFY FIRST C138 |
| Docker | Infrastructure roles | P05 container image is configuration evidence only | Not supported as personal Docker proficiency | EXCLUDE C139 |
| ONNX, cloud, Kubernetes | Deployment/inference specialization | No relevant personal implementation evidence identified | Not supported | EXCLUDE C139 |
| CUDA, ROS, C/C++ | Specialized roles | Employer keywords, not personal work | Not supported | EXCLUDE C139 |
| English / Mandarin | Communication and local-team fit | U01 reported professional English and beginner Mandarin | USER-REPORTED, no test scores | VERIFY FIRST C144 |

“Demonstrated” here applies only to directly inspected artifacts. None of the above personal skills has an observed unaided assessment in this audit. Independent exercises are possible future verification methods, not completed work (C033/C035).
