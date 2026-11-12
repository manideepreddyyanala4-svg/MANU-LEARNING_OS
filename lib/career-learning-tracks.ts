// Two independent interview tracks. Topic numbers are computed globally by the UI.
// Do not modify the existing internship curriculum or its saved progress.
export type LearningSection = {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  files: string[];
  goal: string;
  practice: string;
  topics: string[];
};
export type LearningTrack = {
  key: 'cv' | 'rag';
  eyebrow: string;
  title: string;
  subtitle: string;
  summary: string;
  sections: LearningSection[];
  references: { name: string; url: string }[];
};
export const ragTrack: LearningTrack = {
  "key": "rag",
  "eyebrow": "Job preparation · Project 2",
  "title": "LLM → RAG → MCP: Beginner-to-Interview Learning Path",
  "subtitle": "Understand the idea → practice tiny Python examples → trace project code → explain it in interviews.",
  "summary": "An ordered study guide, built from the same 262 topics and saved checkmarks; basic concepts come before source files and optional advanced infrastructure.",
  "sections": [
    {
      "id": "r01",
      "title": "Python basics and the CLI",
      "priority": "P0",
      "files": [
        "main.py"
      ],
      "goal": "Understand the entry point and basic Python before studying AI frameworks.",
      "practice": "Run a command and explain what each function receives and returns.",
      "topics": [
        "Run Python scripts and understand the interpreter",
        "Variables: int, float, str, bool and None",
        "if, elif, else and Boolean conditions",
        "for, while, break and continue",
        "Strings: strip, split, lower, slicing and Unicode",
        "Lists, tuples, sets and membership",
        "Dictionaries: keys, get, items and updates",
        "Functions, arguments, return values and scope",
        "Modules, imports and file paths with pathlib",
        "Read and write CSV and JSON",
        "Exceptions, tracebacks and input validation",
        "Command-line arguments and subcommands",
        "Virtual environments, pip and requirements",
        "Read main.py and trace one real user command",
        "Basic Big-O: O(1), O(n), O(n log n)",
        "Independently write a small CSV inspection-rate CLI"
      ]
    },
    {
      "id": "r02",
      "title": "Text retrieval and ranking",
      "priority": "P0",
      "files": [
        "retrieval.py"
      ],
      "goal": "Understand what keyword, BM25 and semantic ranking each do.",
      "practice": "Implement keyword overlap and cosine ranking on a tiny synthetic corpus.",
      "topics": [
        "Tokenization and stop words",
        "English lowercase normalization and matching",
        "Traditional Chinese character-pair retrieval",
        "Unicode and cross-language search limitations",
        "Documents, paragraphs, chunks and metadata",
        "Inverted index and term frequency",
        "Document frequency and inverse document frequency",
        "BM25 intuition and length normalization",
        "BM25 parameters k1 and b",
        "Why BM25 can miss paraphrases",
        "Dense retrieval versus lexical retrieval",
        "Dot product, magnitude and cosine similarity",
        "Zero-vector and dimension checks",
        "Top-k results and stable sorting",
        "Source IDs, paragraph numbers and citations",
        "Current versus historical document filtering",
        "Deleted-document and unauthorized-source exclusion",
        "Hybrid search and Reciprocal Rank Fusion",
        "Reranking and relevance-vs-latency trade-offs",
        "Precision, recall and ranking trade-offs",
        "Read search_bilingual and search_bm25 in retrieval.py"
      ]
    },
    {
      "id": "r03",
      "title": "Evidence ingestion and document versions",
      "priority": "P0",
      "files": [
        "data_io.py"
      ],
      "goal": "Understand how raw files become safe, searchable evidence.",
      "practice": "Ingest, change and restore a sample SOP and check that citations follow the right version.",
      "topics": [
        "TXT encoding and UTF-8 BOM",
        "CSV headers, types and missing values",
        "PDF text extraction and scanned-image limitations",
        "Image OCR and when it is needed",
        "Chunk boundaries, overlap and paragraph references",
        "Document metadata and source provenance",
        "Document ID versus source filename",
        "SHA-256 hashes and integrity checks",
        "Duplicate ingestion and idempotency",
        "Current and superseded SOP versions",
        "Soft deletion versus physical deletion",
        "Safe document restoration",
        "File-size and file-type validation",
        "Path traversal and safe filenames",
        "Atomic writes and failed-import rollback",
        "Parquet metadata and safe row sampling",
        "Backup, restore and source licensing",
        "Explain load_documents and ingest_document"
      ]
    },
    {
      "id": "r04",
      "title": "Operational analysis and incident tickets",
      "priority": "P0",
      "files": [
        "investigation.py"
      ],
      "goal": "Defend deterministic calculations and evidence-linked decisions.",
      "practice": "Recalculate the real synthetic Line B 3.05% vs 7.25% figures.",
      "topics": [
        "Numerator, denominator and rejection rate",
        "Percentages versus percentage points",
        "CSV count and deployment record validation",
        "Group-by line, version and time window",
        "Correlations versus causal claims",
        "Confounding variables and missing evidence",
        "Structured incident investigation reports",
        "Source-linked calculations and audit references",
        "Ticket creation and pending state",
        "Approval versus rejection state transitions",
        "Request IDs and duplicate-action prevention",
        "SQLite persistence across restarts",
        "Explain summarize_metrics and prepare_ticket",
        "Test invalid total counts and missing deployments"
      ]
    },
    {
      "id": "r05",
      "title": "Evaluation and scientific comparisons",
      "priority": "P0",
      "files": [
        "evaluation.py"
      ],
      "goal": "Measure retrieval without inventing ground truth.",
      "practice": "Review a small evidence set and explain Hit@k, Recall@k and MRR.",
      "topics": [
        "Ground truth versus proposed answer labels",
        "Human label review and source confirmation",
        "Evidence hashes and invalidated reviews",
        "Development and locked test set separation",
        "Hit@1 and Hit@k",
        "Precision@k and Recall@k",
        "Mean Reciprocal Rank",
        "nDCG and graded relevance",
        "Citation correctness and answer support",
        "Faithfulness and unsupported-answer rate",
        "Correct abstention on unanswerable questions",
        "Keyword versus BM25 comparison",
        "Semantic versus hybrid retrieval comparison",
        "Latency: mean, median, P95",
        "Failure-case analysis and confidence intervals",
        "Input/model/version reproducibility",
        "JSON exports and what can be claimed",
        "Explain why 10 unreviewed labels cannot establish accuracy"
      ]
    },
    {
      "id": "r06",
      "title": "Ollama, language models and embeddings",
      "priority": "P0",
      "files": [
        "ollama_client.py"
      ],
      "goal": "Know what the generator and embedding models actually do.",
      "practice": "Call Ollama /api/tags, /api/embed and /api/generate on approved synthetic text.",
      "topics": [
        "What an LLM is and how token prediction works",
        "Transformer attention and Q/K/V intuition",
        "Tokenization and context windows",
        "Prompt roles and instruction hierarchy",
        "Generation temperature and top-p",
        "KV cache and inference memory",
        "Quantization, GPU VRAM and throughput",
        "Generation model versus embedding model",
        "Local Ollama API and model discovery",
        "/api/embed requests, batching and truncate:false",
        "/api/generate and /api/chat response formats",
        "Tool-calling responses and structured outputs",
        "Embedding dimensions and model identifiers",
        "Qwen3-Embedding 0.6B versus 4B trade-offs",
        "Document/query embedding consistency",
        "Reindexing when an embedding model changes",
        "Evidence-grounded prompt construction",
        "Missing evidence and safe abstention",
        "LLM hallucinations and unsupported citations",
        "Timeouts, retries and invalid JSON",
        "Lab GPU diagnostics with nvidia-smi",
        "Explain ask_ollama and failure codes"
      ]
    },
    {
      "id": "r07",
      "title": "SQL, SQLite, PostgreSQL and pgvector",
      "priority": "P0",
      "files": [
        "database.py",
        "postgres_smoke.py"
      ],
      "goal": "Understand storage, concurrency, and indexed vector queries.",
      "practice": "Write a SQL query and demonstrate a safe transaction with rollback.",
      "topics": [
        "SELECT, WHERE, ORDER BY and LIMIT",
        "INSERT, UPDATE and DELETE",
        "COUNT, SUM, AVG and GROUP BY",
        "INNER JOIN, LEFT JOIN and keys",
        "Schema constraints, indexes and migrations",
        "ACID transactions, COMMIT and ROLLBACK",
        "Race conditions in concurrent document updates",
        "Per-source transaction locks and version uniqueness",
        "SQLite for local application state",
        "PostgreSQL connections and parameterized SQL",
        "pgvector storage and cosine distance operators",
        "Exact versus approximate nearest-neighbor search",
        "HNSW versus IVFFlat",
        "vector index dimension limits and halfvec",
        "2,560D Qwen 4B embeddings and index choices",
        "Model/version-aware vector storage and reindexing",
        "Vector data privacy and access filtering",
        "Explain real PostgreSQL smoke and restart checks"
      ]
    },
    {
      "id": "r08",
      "title": "FastAPI and web backend",
      "priority": "P0",
      "files": [
        "api.py"
      ],
      "goal": "Trace a user request from browser to validated response.",
      "practice": "Create and test a tiny GET route and a protected POST route.",
      "topics": [
        "Client-server architecture and HTTP",
        "GET, POST, PATCH and DELETE",
        "HTTP status codes: 200, 400, 401, 403, 404, 422, 500",
        "Request headers, path, query and JSON body",
        "FastAPI route decorators and parameter types",
        "Pydantic input validation",
        "Response schemas and HTTP exceptions",
        "FastAPI TestClient",
        "Authentication versus authorization",
        "Access, operator and approval token separation",
        "Safe request-size and upload limits",
        "CORS and why it is not authorization",
        "async versus sync endpoints",
        "Timeouts and server error handling",
        "Uvicorn startup and 127.0.0.1 binding",
        "Streaming results and error states",
        "No secret/path exposure in API responses",
        "Read api.py and explain one complete request"
      ]
    },
    {
      "id": "r09",
      "title": "Fixed workflows and real agents",
      "priority": "P1",
      "files": [
        "workflow.py"
      ],
      "goal": "Distinguish deterministic workflows from LLM-chosen actions.",
      "practice": "Draw three actual workflow routes and explain what the model is not allowed to change.",
      "topics": [
        "What is a deterministic workflow",
        "What makes an LLM-driven agent different",
        "LangGraph state, nodes and edges",
        "Conditional edges and routing",
        "Bounded iterations and maximum tool calls",
        "State checkpoints and persistent traces",
        "Tool selection and argument validation",
        "Human approval before any write action",
        "Read-only operations versus state changes",
        "Workflow retries, idempotency and recovery",
        "Investigation workflow for rejection-rate changes",
        "Deployment-version comparison workflow",
        "SOP conflict investigation workflow",
        "Evidence collection before conclusions",
        "Deterministic arithmetic outside the model",
        "Agent tool-use correctness and task success",
        "Failure modes when Ollama or MCP is unavailable",
        "Explain run_workflow end to end"
      ]
    },
    {
      "id": "r10",
      "title": "MCP tool integration",
      "priority": "P1",
      "files": [
        "mcp_server.py",
        "mcp_client.py"
      ],
      "goal": "Understand how hosts, clients and servers exchange restricted tools.",
      "practice": "Run the actual stdio MCP round trip and explain all four tools.",
      "topics": [
        "What MCP standardizes",
        "MCP host, client and server roles",
        "MCP tools, resources and prompts",
        "JSON-RPC and protocol versioning",
        "stdio transport versus Streamable HTTP",
        "Tool discovery and input schema",
        "Tool arguments and return content",
        "Approved document-search tool",
        "Inspection-metrics tool",
        "Deployment-comparison tool",
        "Incident-draft tool",
        "Tool permission and authentication boundaries",
        "Missing evidence and tool exceptions",
        "Timeouts, retries and duplicated calls",
        "MCP versus REST versus LangGraph",
        "Test real server/client discovery and execution"
      ]
    },
    {
      "id": "r11",
      "title": "Dashboard, HTML, CSS and JavaScript",
      "priority": "P1",
      "files": [
        "dashboard.html"
      ],
      "goal": "Explain every important UI control and its API request.",
      "practice": "Open the page and trace search, citations, ticket approval and review export.",
      "topics": [
        "Basic HTML structure and semantic elements",
        "CSS selectors and responsive layouts",
        "JavaScript let/const, functions and arrays",
        "DOM selection and event listeners",
        "fetch API and async/await",
        "JSON requests and response parsing",
        "Search form, result ranking and citations",
        "Current-document and version filters",
        "Document upload, delete and restore",
        "Review controls and evaluation export",
        "Incident draft and approval controls",
        "Progress and workflow trace rendering",
        "Loading and error UI states",
        "XSS risks when rendering untrusted evidence"
      ]
    },
    {
      "id": "r12",
      "title": "Tests, debugging and failure modes",
      "priority": "P0",
      "files": [
        "test_evidenceops.py"
      ],
      "goal": "Prove that expected behaviors and failures are covered.",
      "practice": "Add an independent regression test for a real bug.",
      "topics": [
        "Unit tests versus integration tests",
        "End-to-end tests versus mocks",
        "unittest and assert methods",
        "FastAPI TestClient patterns",
        "Test fixtures and temporary data stores",
        "Deterministic synthetic evidence",
        "Invalid input and zero-count tests",
        "Document hash and version conflicts",
        "Race and concurrent-update testing",
        "Real MCP protocol round trips",
        "SQLite persistence and restart tests",
        "PostgreSQL live smoke versus mocked test",
        "Browser integration and UI regression tests",
        "Traceback reading and log-based debugging",
        "Bug reports and minimal reproduction",
        "Avoiding fake passing tests and false coverage claims"
      ]
    },
    {
      "id": "r13",
      "title": "Git, Linux, Docker and CI",
      "priority": "P1",
      "files": [
        "Dockerfile",
        "compose.yaml",
        ".github/workflows/offline.yml",
        "README.md"
      ],
      "goal": "Reproduce the application from a clean clone.",
      "practice": "Clone, run tests, start the local API and explain why containers need volumes.",
      "topics": [
        "Git clone, status, diff, add, commit and push",
        "Branches, pull requests and merge conflicts",
        ".gitignore and secret hygiene",
        "Linux pwd, ls, cd, cat, grep and ps",
        "Virtual environments and dependency pinning",
        "Docker image versus container",
        "Dockerfile layers and builds",
        "Ports and localhost versus 0.0.0.0",
        "Docker Compose services and profiles",
        "Persistent volumes and backup",
        "Environment variables and credentials",
        "PostgreSQL and pgvector containers",
        "Container health checks and logs",
        "GitHub Actions CI versus local tests",
        "Reproducible setup and README claims",
        "GPU sharing and safe lab-system usage"
      ]
    },
    {
      "id": "r14",
      "title": "Reliability, security and experimentation",
      "priority": "P1",
      "files": [
        "api.py",
        "retrieval.py",
        "evaluation.py",
        "workflow.py"
      ],
      "goal": "Explain why an AI answer cannot bypass trusted application controls.",
      "practice": "Demonstrate one indirect prompt-injection defense and one unsupported-answer case.",
      "topics": [
        "Direct and indirect prompt injection",
        "Retrieved documents as untrusted data",
        "Instruction priority and prompt boundaries",
        "Data exfiltration and secret protection",
        "Least-privilege MCP tools",
        "Unauthorized document access and tenant scope",
        "Approval guard enforced in backend code",
        "SQL injection and safe parameter binding",
        "Browser XSS and escaping text",
        "Path traversal, malformed files and uploads",
        "Idempotency and rate/resource limits",
        "Failure recovery and incident audit trails",
        "Groundedness and human-in-the-loop review",
        "Baseline versus ablation experiments",
        "Latency and error-rate reporting",
        "Open-set or adversarial evidence questions",
        "No premature claims of enterprise security"
      ]
    },
    {
      "id": "r15",
      "title": "Interview defense and business reasoning",
      "priority": "P0",
      "files": [
        "README.md",
        "main.py",
        "retrieval.py",
        "investigation.py"
      ],
      "goal": "Give a confident, honest, independent project defense.",
      "practice": "Deliver a two-minute architecture explanation and solve a short Python exercise.",
      "topics": [
        "Explain EvidenceOps business problem in one minute",
        "Draw document ingestion to search to report flow",
        "Explain your real code versus Codex-assisted code",
        "Why RAG instead of fine-tuning",
        "Why keyword/BM25 before embeddings",
        "Why bilingual retrieval matters",
        "Explain cosine similarity without a library",
        "Explain why larger models are not always better",
        "Why pgvector and SQL belong together",
        "Explain four MCP tools and human approval",
        "Why the Line B rate increase is not causation",
        "Explain the PostgreSQL version race and fix",
        "Describe one failure and regression test",
        "Explain where hallucinations are detected",
        "Explain 0.6B versus 4B and VRAM tradeoffs",
        "Explain where project limitations remain",
        "Defend one architecture decision with measured evidence",
        "Independently write a small Python retrieval function",
        "Run a complete demo without AI assistance",
        "Prepare a truthful GitHub/resume project description"
      ]
    }
  ],
  "references": [
    {
      "name": "Python Tutorial",
      "url": "https://docs.python.org/3/tutorial/"
    },
    {
      "name": "FastAPI official tutorial",
      "url": "https://fastapi.tiangolo.com/tutorial/"
    },
    {
      "name": "Ollama Embeddings API",
      "url": "https://docs.ollama.com/api/embed"
    },
    {
      "name": "LangGraph Learn",
      "url": "https://docs.langchain.com/oss/python/learn"
    },
    {
      "name": "MCP Python SDK",
      "url": "https://py.sdk.modelcontextprotocol.io/"
    },
    {
      "name": "pgvector Documentation",
      "url": "https://github.com/pgvector/pgvector"
    },
    {
      "name": "OWASP LLM Security",
      "url": "https://genai.owasp.org/llm-top-10/"
    }
  ]
};
export const cvTrack: LearningTrack = {
  "key": "cv",
  "eyebrow": "Job preparation · Project 1",
  "title": "Computer Vision · OpenCV · Dorsal-Hand Interview Track",
  "subtitle": "Digital images → OpenCV → PyTorch → research evaluation → deployment. One ordered study path.",
  "summary": "Career preparation for Python, image processing, computer vision and machine-learning interviews. Research claims remain separate from learning goals.",
  "sections": [
    {
      "id": "c01",
      "title": "Python foundation for computer vision",
      "priority": "P0",
      "files": [
        "Python"
      ],
      "goal": "Write small image-processing scripts without assistance.",
      "practice": "Read an image and safely handle a missing file.",
      "topics": [
        "Python values, variables and data types",
        "Conditions, comparisons and loops",
        "Strings and file paths",
        "Lists and tuples",
        "Dictionaries and sets",
        "Functions, arguments and returns",
        "Modules, imports and packages",
        "Errors, exceptions and tracebacks",
        "Read CSV and JSON manifests",
        "Virtual environments and reproducible requirements",
        "Logging, assertions and basic unit tests",
        "Basic time complexity and problem-solving"
      ]
    },
    {
      "id": "c02",
      "title": "NumPy and image tensors",
      "priority": "P0",
      "files": [
        "NumPy"
      ],
      "goal": "Manipulate array dimensions, image channels and normalizations.",
      "practice": "Convert a synthetic HWC image to CHW/NCHW and verify shapes.",
      "topics": [
        "ndarray, dtype, shape, ndim and size",
        "Integer uint8 versus float32",
        "Array indexing, slicing and masking",
        "Views versus copies",
        "reshape, transpose and moveaxis",
        "Broadcasting and vectorization",
        "axis, mean, sum, min and max",
        "HWC, CHW, NCHW and batch dimensions",
        "RGB to BGR channel swap",
        "Grayscale and pixel intensity",
        "Normalization into [0,1]",
        "Standardization and model preprocessing",
        "Dot products, vector norms and cosine similarity",
        "Assertions for invalid shapes and NaNs"
      ]
    },
    {
      "id": "c03",
      "title": "Digital image foundations",
      "priority": "P0",
      "files": [
        "Image basics"
      ],
      "goal": "Explain what an image represents before applying OpenCV.",
      "practice": "Explain pixels, sampling and channel order using a tiny image.",
      "topics": [
        "Pixel coordinates, height, width and resolution",
        "Color channels RGB, BGR and grayscale",
        "HSV, HSL and LAB basics",
        "Image bit depth and dynamic range",
        "Intensity histograms",
        "Brightness, contrast and gamma",
        "Sampling and aliasing",
        "Resize interpolation: nearest, linear, cubic",
        "Compression artifacts and JPEG versus PNG",
        "Gaussian and salt-and-pepper noise",
        "Convolution filters and border handling",
        "Image gradients and edges",
        "Color space mismatch and normalization errors"
      ]
    },
    {
      "id": "c04",
      "title": "OpenCV core operations",
      "priority": "P0",
      "files": [
        "OpenCV / cv2"
      ],
      "goal": "Read, transform and save images while checking shapes.",
      "practice": "Implement loading, grayscale, resizing and saving with error handling.",
      "topics": [
        "cv2.imread and None checks",
        "cv2.imwrite and supported formats",
        "cv2.cvtColor conversions",
        "cv2.resize and preserving aspect ratio",
        "Crop and region of interest",
        "Pixel selection and Boolean masks",
        "cv2.split and cv2.merge",
        "Basic drawing and annotation functions",
        "Image rotation and flipping",
        "Affine warp with cv2.warpAffine",
        "Perspective warp with cv2.warpPerspective",
        "Interpolation flags and boundary modes",
        "Batch processing of image folders",
        "Visualization with Matplotlib"
      ]
    },
    {
      "id": "c05",
      "title": "Filtering and image enhancement",
      "priority": "P0",
      "files": [
        "OpenCV / image processing"
      ],
      "goal": "Explain filter effects rather than blindly applying them.",
      "practice": "Compare original, Gaussian, median and CLAHE images.",
      "topics": [
        "Mean blur and moving-average filters",
        "Gaussian blur and sigma",
        "Median blur for impulse noise",
        "Bilateral filtering intuition",
        "Sharpening and unsharp masking",
        "Histogram equalization",
        "CLAHE and local contrast",
        "Gamma correction",
        "Denoising and compression artifacts",
        "Convolution kernel design",
        "Edge preservation versus smoothing",
        "When enhancement harms recognition"
      ]
    },
    {
      "id": "c06",
      "title": "Thresholding, morphology, edges",
      "priority": "P0",
      "files": [
        "OpenCV / segmentation"
      ],
      "goal": "Understand the fundamental image-processing interview questions.",
      "practice": "Demonstrate erosion, dilation, opening and closing on a binary mask.",
      "topics": [
        "Binary and inverse thresholding",
        "Adaptive thresholding",
        "Otsu threshold selection",
        "Erosion: structuring element and pixel effect",
        "Dilation: structuring element and pixel effect",
        "Opening to remove small bright noise",
        "Closing to fill small gaps",
        "Morphological gradient, top hat and black hat",
        "Sobel X/Y gradients",
        "Laplacian edges",
        "Canny thresholds and hysteresis",
        "Connected components",
        "Contours and cv2.findContours",
        "Bounding boxes and binary masks",
        "Watershed and simple segmentation intuition",
        "Failure cases from noise and illumination"
      ]
    },
    {
      "id": "c07",
      "title": "Geometry, landmarks and hand ROI",
      "priority": "P0",
      "files": [
        "OpenCV",
        "MediaPipe"
      ],
      "goal": "Explain your real dorsal-hand ROI processing and failure handling.",
      "practice": "Recreate an ROI crop and measure sensitivity to landmark errors.",
      "topics": [
        "Coordinate systems and landmark order",
        "MediaPipe hand landmark concepts",
        "Landmark visibility and detection failures",
        "Hand region of interest definition",
        "Landmark-based rotation and alignment",
        "Scale normalization and crop geometry",
        "Affine matrix calculation",
        "Homography versus affine transform",
        "ROI border handling and missing pixels",
        "Left/right hand mirroring and orientation",
        "Landmark error and alignment sensitivity",
        "Background, lighting and domain shift",
        "Failure logs and visual inspection",
        "Privacy and identity-based dataset restrictions"
      ]
    },
    {
      "id": "c08",
      "title": "Classical CV and feature extraction",
      "priority": "P1",
      "files": [
        "OpenCV",
        "scikit-learn"
      ],
      "goal": "Recognize basic CV approaches outside deep learning.",
      "practice": "Implement one contour-based detection pipeline.",
      "topics": [
        "Contour area, perimeter and hierarchy",
        "Image moments and centroids",
        "Hough lines and circles",
        "Template matching",
        "Harris corners and Shi-Tomasi",
        "SIFT/ORB feature points concepts",
        "Descriptor matching and distance",
        "Optical flow concepts",
        "Object tracking basics",
        "Segmentation versus classification versus detection",
        "Precision, recall and false positives",
        "Use classical CV when data or compute is limited"
      ]
    },
    {
      "id": "c09",
      "title": "ML, probability and data splits",
      "priority": "P0",
      "files": [
        "scikit-learn",
        "math"
      ],
      "goal": "Explain scientific evaluation and leakage avoidance.",
      "practice": "Split synthetic identities into disjoint train/dev/test groups.",
      "topics": [
        "Regression versus classification",
        "Train/dev/test partitions",
        "Stratified versus grouped splits",
        "Identity-disjoint data partition",
        "Data leakage and information leakage",
        "Class imbalance and weighted losses",
        "Confusion matrix",
        "Precision, recall, F1 and specificity",
        "ROC and PR curves",
        "AUROC versus AUPRC",
        "Confidence intervals and multi-seed variability",
        "Overfitting, bias and variance",
        "Cross validation and reproducible seeds",
        "Correlation versus causation",
        "Baseline comparisons and ablations"
      ]
    },
    {
      "id": "c10",
      "title": "Deep learning and CNNs",
      "priority": "P0",
      "files": [
        "PyTorch"
      ],
      "goal": "Explain what CNN layers learn and how training works.",
      "practice": "Compute tensor shapes through a small CNN and write one training step.",
      "topics": [
        "Tensors, weights and activations",
        "Forward pass and computation graph",
        "Convolution kernel, stride and padding",
        "Output spatial dimension formula",
        "Pooling and receptive fields",
        "ReLU, SiLU, sigmoid and softmax",
        "Batch normalization, dropout and eval mode",
        "Residual shortcuts",
        "Depthwise and pointwise convolution",
        "CNN parameters, FLOPs and MACs",
        "Cross-entropy and metric learning losses",
        "Backpropagation and chain rule",
        "SGD, Adam and learning rates",
        "Underfitting versus overfitting",
        "Transfer learning and feature embeddings",
        "Batch, epoch, iteration and scheduler"
      ]
    },
    {
      "id": "c11",
      "title": "Practical PyTorch and experiments",
      "priority": "P0",
      "files": [
        "PyTorch",
        "research"
      ],
      "goal": "Know how to execute a faithful training and evaluation run.",
      "practice": "Write Dataset, DataLoader, forward and no_grad evaluation code.",
      "topics": [
        "torch.Tensor and dtype/device",
        "Dataset and __getitem__",
        "DataLoader and batch composition",
        "Model forward and loss",
        "zero_grad, backward and optimizer.step",
        "train versus eval and no_grad",
        "Checkpoint save and load",
        "Device and GPU memory handling",
        "Deterministic seeds and cuDNN settings",
        "Model selection using source development data",
        "Accuracy and ROC evaluation",
        "Batch-size and learning-rate debugging",
        "Failure reproduction with minimal examples",
        "Checkpoint provenance and test leakage",
        "Multi-seed reporting with mean and variability"
      ]
    },
    {
      "id": "c12",
      "title": "Biometrics, open-set verification and research",
      "priority": "P0",
      "files": [
        "Dorsal-hand research"
      ],
      "goal": "Explain your actual research claims and limitations precisely.",
      "practice": "Defend an identity-disjoint evaluation protocol and an EER calculation.",
      "topics": [
        "1:1 verification versus 1:N identification",
        "Closed-set versus open-set recognition",
        "Feature vectors and cosine distance",
        "Enrollment, reference and probe images",
        "Verification threshold and operating point",
        "False accept rate and false reject rate",
        "Equal Error Rate (EER)",
        "TAR at fixed FAR/FMR",
        "TPIR at fixed FPIR for open-set identification",
        "Reference quality and domain variation",
        "Indoor/outdoor and cross-condition testing",
        "Enrollment/probe leakage prevention",
        "Faithful paper reproduction versus modification",
        "Model checkpoints and protocol amendments",
        "Multi-fold and multi-seed evidence",
        "Independent benchmarks and negative results",
        "Explain six actual research contributions without inventing training claims"
      ]
    },
    {
      "id": "c13",
      "title": "ONNX, Python API and deployment",
      "priority": "P1",
      "files": [
        "ONNX Runtime",
        "FastAPI",
        "SQLite"
      ],
      "goal": "Move a tested model toward reliable inference.",
      "practice": "Export a tiny PyTorch model and compare ONNX outputs.",
      "topics": [
        "torch.onnx.export fundamentals",
        "Static and dynamic input shapes",
        "ONNX graph and operators",
        "ONNX Runtime inference",
        "Parity checks between PyTorch and ONNX",
        "Preprocessing consistency",
        "Embedding normalization and thresholding",
        "Embedding persistence in SQLite",
        "Simple inference CLI and error messages",
        "FastAPI prediction endpoint concepts",
        "Docker image and dependency management",
        "Latency, throughput and memory measurement",
        "Model versioning and rollback",
        "Real-time versus batch inference choices"
      ]
    },
    {
      "id": "c14",
      "title": "CV debugging and interviews",
      "priority": "P1",
      "files": [
        "Interview practice"
      ],
      "goal": "Explain failures and independently solve practical tasks.",
      "practice": "Complete a 90-second research defense and five live coding questions.",
      "topics": [
        "Explain erosion versus dilation visually",
        "Explain Canny versus Sobel",
        "Choose threshold method for uneven lighting",
        "Debug wrong BGR/RGB channels",
        "Diagnose bad image normalization",
        "Explain HWC versus NCHW conversion",
        "Detect dataset leakage",
        "Interpret confusion matrix and ROC",
        "Explain why EER changed across datasets",
        "Describe landmark failure and ROI fix",
        "Explain CNN shape and parameter counts",
        "Explain one real PyTorch/ONNX failure",
        "Show honest research contributions",
        "Write a simple OpenCV processing script from scratch",
        "Answer interview follow-ups without reading notes"
      ]
    }
  ],
  "references": [
    {
      "name": "OpenCV Python Tutorials",
      "url": "https://docs.opencv.org/5.0/py_tutorials/py_table_of_contents_py_tutorials.html"
    },
    {
      "name": "OpenCV Image Processing",
      "url": "https://docs.opencv.org/5.0/py_tutorials/py_imgproc/py_table_of_contents_imgproc.html"
    },
    {
      "name": "PyTorch Tutorials",
      "url": "https://docs.pytorch.org/tutorials/"
    },
    {
      "name": "NumPy user guide",
      "url": "https://numpy.org/doc/stable/user/"
    },
    {
      "name": "ONNX Runtime Python",
      "url": "https://onnxruntime.ai/docs/get-started/with-python.html"
    },
    {
      "name": "scikit-learn Model Evaluation",
      "url": "https://scikit-learn.org/stable/modules/model_evaluation.html"
    }
  ]
};
