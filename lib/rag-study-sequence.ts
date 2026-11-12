import type { LearningTrack } from './career-learning-tracks';

/**
 * Concept-first study order for the existing 262 RAG topics.
 * Original track data and original saved completion keys are NEVER reordered.
 * Indices here are one-based positions inside the legacy sections.
 */
export type RagStudyTopic = {
  slug: string;
  title: string;
  originalNumber: number;
  studyNumber: number;
  sourceSection: string;
};

export type RagStudyStage = {
  id: string;
  title: string;
  level: 'START' | 'CORE' | 'BUILD' | 'LATER';
  meaning: string;
  whyNow: string;
  example: string;
  practice: string;
  readyWhen: string;
  topicParts: readonly (readonly [string, readonly number[]])[];
  topics: RagStudyTopic[];
  projectFiles: string[];
};

type PlanStage = Omit<RagStudyStage, 'topics' | 'projectFiles'>;
const numbers = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

// Stage order follows prerequisites, NOT project filenames or original P0 flags.
const plan: PlanStage[] = [
  {
    id: 'understand-the-problem', level: 'START',
    title: 'First understand AI, LLM and RAG — no coding',
    meaning: 'AI helps software work with patterns. An LLM generates language. RAG searches your own evidence first, then asks the LLM to answer using it.',
    whyNow: 'You should be able to explain what you are building before you study Python files or model settings.',
    example: 'Question: “What is the factory threshold?” → Search the SOP → Find “0.50” → Let the LLM answer with that source. That is RAG.',
    practice: 'Explain AI, LLM, RAG, and a source citation in your own words. Draw four boxes: question, search, LLM, answer.',
    readyWhen: 'You can say why the LLM needs the SOP instead of guessing, without reading notes.',
    topicParts: [['r06', [1, 3, 4, 8]], ['r15', [1, 2, 4]]],
  },
  {
    id: 'python-first-steps', level: 'START',
    title: 'Python foundations: values → decisions → loops → functions',
    meaning: 'Python is the language your project uses. Learn tiny programs before reading any large project module.',
    whyNow: 'Functions and dictionaries are the building blocks of almost every later RAG and API example.',
    example: 'rejected = 7\ninspected = 100\nrate = rejected / inspected * 100\nprint(rate)  # 7.0',
    practice: 'Write your own function that accepts inspected and rejected counts and returns the percentage. Then try a zero denominator.',
    readyWhen: 'You can write a function with if/else, a loop, a list and a dictionary without copying.',
    topicParts: [['r01', numbers(1, 8)]],
  },
  {
    id: 'python-real-data', level: 'CORE',
    title: 'Python in real life: files, errors, environments and Git',
    meaning: 'Learn how to split code into functions, load small files, see errors and save your work.',
    whyNow: 'You need to run and debug a small script independently before building an AI application.',
    example: 'row = {"line": "B", "rejected": 7}\nprint(row.get("rejected", 0))  # 7',
    practice: 'Create a tiny CSV file, read it with Python, print each row and save your work in Git.',
    readyWhen: 'You can run a Python script from the terminal and explain one traceback.',
    topicParts: [['r01', numbers(9, 16)], ['r13', numbers(1, 5)]],
  },
  {
    id: 'text-and-documents', level: 'CORE',
    title: 'Understand documents: text, CSV, chunks and sources',
    meaning: 'A RAG system needs documents. Each document becomes small searchable passages called chunks.',
    whyNow: 'You cannot evaluate search results before you understand exactly what is being searched.',
    example: 'document = {"source": "sop.txt", "text": "Check calibration before changing settings."}\nprint(document["text"])',
    practice: 'Read one short TXT file, split it into two passages, and keep its filename with each passage.',
    readyWhen: 'You can explain what a chunk and source metadata mean, using your own two-sentence document.',
    topicParts: [['r03', numbers(1, 9)]],
  },
  {
    id: 'numbers-and-sql', level: 'CORE',
    title: 'Small calculations and databases: rates, SQL and SQLite',
    meaning: 'Use Python for correct arithmetic and SQL for saving and finding structured records.',
    whyNow: 'The project must calculate factory counts, not ask a language model to invent numbers.',
    example: 'inspected = 100\nrejected = 5\nprint(round(100 * rejected / inspected, 2))  # 5.0',
    practice: 'Calculate a rejection rate, then write SELECT and WHERE on a tiny SQLite table.',
    readyWhen: 'You can explain the difference between five rejected units and a five-percent rejection rate.',
    topicParts: [['r04', numbers(1, 6)], ['r07', numbers(1, 9)]],
  },
  {
    id: 'use-a-local-llm', level: 'CORE',
    title: 'Talk to a language model: prompts, Ollama and JSON',
    meaning: 'The generation model takes a question plus context and produces text; a program must check its response.',
    whyNow: 'Start with one small model call before you combine generation with retrieval.',
    example: 'Prompt: “Using only this sentence, answer the question. Evidence: Line B threshold is 0.50. Question: What is the threshold?”',
    practice: 'Send one simple prompt to your existing Ollama model. Print the response and handle the model being unavailable.',
    readyWhen: 'You can distinguish a prompt, a model response, JSON and an error or timeout.',
    topicParts: [['r06', [5, 9, 11, 12, 20, 22]]],
  },
  {
    id: 'keyword-search', level: 'CORE',
    title: 'Search without AI: words, matching, BM25',
    meaning: 'Keyword search uses the actual words in the question and documents; BM25 ranks passages using word statistics.',
    whyNow: 'This is a readable baseline. Understand ordinary search before dense vectors.',
    example: 'question = "camera calibration"\npassage = "check camera calibration"\nprint("calibration" in passage)  # True',
    practice: 'Search three short factory passages using a for-loop. Sort them by a simple shared-word score.',
    readyWhen: 'You can explain one case where keyword search succeeds and one where different wording makes it fail.',
    topicParts: [['r02', numbers(1, 10)]],
  },
  {
    id: 'embeddings-and-vectors', level: 'CORE',
    title: 'Meaning-based search: embeddings, vectors and cosine similarity',
    meaning: 'An embedding model converts text into lists of numbers. Similar meanings can have similar vectors.',
    whyNow: 'Learn vectors and one similarity calculation before trying hybrid retrieval or pgvector.',
    example: 'a = [1, 0]\nb = [1, 0]\n# Same direction: cosine similarity = 1',
    practice: 'Compare two tiny vectors by hand. Then ask your existing Qwen embedding model for one text embedding.',
    readyWhen: 'You can distinguish an embedding model from a text-generation model and explain top-k results.',
    topicParts: [['r06', [10, 13, 14, 15, 16]], ['r02', numbers(11, 14)]],
  },
  {
    id: 'full-rag-flow', level: 'CORE',
    title: 'Your first complete RAG: retrieve → cite → generate → check',
    meaning: 'Combine documents, search and a language model. Answer only when a passage actually supports the claim.',
    whyNow: 'This is the central skill needed before touching the MCP agent.',
    example: 'Question → find three passages → build a prompt → get an answer → check that its quoted text exists in the passage.',
    practice: 'Make a tiny RAG example with three hard-coded passages. Say which passage supports the result.',
    readyWhen: 'You can explain lexical versus semantic retrieval, hybrid ranking and why an answer needs a real citation.',
    topicParts: [['r02', numbers(15, 21)], ['r06', numbers(17, 19)], ['r15', numbers(5, 8)]],
  },
  {
    id: 'trust-the-documents', level: 'BUILD',
    title: 'Keep evidence reliable: versions, hashes and safe ingestion',
    meaning: 'Documents can change. A safe application must distinguish current SOPs from old or deleted versions.',
    whyNow: 'Once RAG works, teach it which evidence is allowed before adding agents.',
    example: '{"id": "SOP-v1", "status": "old"}\n{"id": "SOP-v2", "status": "active"}\n# A current-only answer searches SOP-v2.',
    practice: 'Change a sample SOP, mark the earlier version old, and verify current-only retrieval.',
    readyWhen: 'You can tell why the same filename does not always mean the same document version.',
    topicParts: [['r03', numbers(10, 18)]],
  },
  {
    id: 'web-basics', level: 'BUILD',
    title: 'Understand the web: browser, HTTP, JSON and first FastAPI route',
    meaning: 'The browser sends a request to the Python API. FastAPI returns a structured response.',
    whyNow: 'You must understand how an ordinary web request works before an agent uses tools over a protocol.',
    example: 'from fastapi import FastAPI\napp = FastAPI()\n\n@app.get("/hello")\ndef hello():\n    return {"message": "Hello"}',
    practice: 'Run a tiny GET route and open it in your browser. Explain the returned JSON.',
    readyWhen: 'You can explain GET versus POST, a JSON request body and what HTTP 404 means.',
    topicParts: [['r08', numbers(1, 8)]],
  },
  {
    id: 'real-backend', level: 'BUILD',
    title: 'Make it useful: API safety, inspection calculations and ticket state',
    meaning: 'The backend validates data, calculates counts and stores incident drafts. AI suggestions do not approve tickets.',
    whyNow: 'This connects your search system to actual engineering tasks without sacrificing human control.',
    example: 'ticket = {"state": "pending"}\n# Only a separate authorized human action may change it to approved.',
    practice: 'Trace one inspection-rate calculation through the API and then check a pending incident stays pending.',
    readyWhen: 'You can explain validation, SQLite persistence, and the difference between operator and approver.',
    topicParts: [['r08', numbers(9, 18)], ['r04', numbers(7, 14)]],
  },
  {
    id: 'tools-and-mcp', level: 'BUILD',
    title: 'From RAG to tools: workflows, MCP and the four real actions',
    meaning: 'A workflow follows defined steps; an agent chooses allowed tools. MCP provides a standard tool connection.',
    whyNow: 'Only learn agents after you understand the RAG answer and the backend functions they call.',
    example: 'Question → agent selects “read inspection metrics” → Python returns numbers → agent prepares a pending draft.',
    practice: 'Run an MCP tool listing and name all four approved tools. Explain what each is allowed to do.',
    readyWhen: 'You can say how MCP differs from a normal API and why the agent cannot approve incidents.',
    topicParts: [['r09', [1, 2, 5, 7, 8, 9, 11, 12, 13, 14, 15]], ['r10', numbers(1, 11)]],
  },
  {
    id: 'agents-and-safety', level: 'BUILD',
    title: 'Keep the agent safe: permissions, budgets and failure handling',
    meaning: 'The model can request actions, but Python code enforces which actions are possible and when to stop.',
    whyNow: 'A useful agent is one whose mistakes are contained rather than allowed to change important data.',
    example: 'allowed = {"search_sop", "read_metrics"}\nif tool_name not in allowed:\n    raise ValueError("Tool is not allowed")',
    practice: 'Try a disallowed tool name in a local test. Verify it is rejected and the draft stays pending.',
    readyWhen: 'You can explain prompt injection, allowed-tool lists, retries and human approval boundaries.',
    topicParts: [['r09', [3, 4, 6, 10, 16, 17, 18]], ['r10', numbers(12, 16)], ['r14', numbers(1, 13)]],
  },
  {
    id: 'dashboard', level: 'BUILD',
    title: 'Make a browser demo: HTML, CSS and JavaScript',
    meaning: 'The dashboard is what a recruiter sees. JavaScript sends API requests and shows results and evidence.',
    whyNow: 'Build a clear interface only after the Python backend and answer flow make sense.',
    example: 'fetch("/api/health").then(response => response.json()).then(data => console.log(data));',
    practice: 'Press one search button in the dashboard and follow the request to the FastAPI endpoint.',
    readyWhen: 'You can identify an event listener, a fetch request, a loading state and an error state.',
    topicParts: [['r11', numbers(1, 14)]],
  },
  {
    id: 'debug-and-test', level: 'BUILD',
    title: 'Find mistakes: unit tests, tracebacks and reproducible bugs',
    meaning: 'Tests prove specific behaviors on specific inputs; they do not guarantee every AI answer is correct.',
    whyNow: 'You need to fix one failing example independently before claiming that the project is reliable.',
    example: 'import unittest\n\nclass TestRates(unittest.TestCase):\n    def test_rate(self):\n        self.assertEqual(5 / 100 * 100, 5)',
    practice: 'Write one small test that passes and one that fails. Read the traceback and fix the failing case.',
    readyWhen: 'You can explain the difference between a unit test, a real-model test and a browser test.',
    topicParts: [['r12', numbers(1, 16)]],
  },
  {
    id: 'evaluate-results', level: 'BUILD',
    title: 'Measure RAG honestly: relevance, Hit@k, refusals and experiments',
    meaning: 'Separate retrieving the right passage from writing a supported answer. Review draft labels before accuracy claims.',
    whyNow: 'Metrics become meaningful only after you know what a correct answer and source look like.',
    example: 'Question needs passage A. Top 3 results = [B, A, C]. Hit@3 = 1; the answer can still be wrong.',
    practice: 'Review five source/answer pairs yourself and calculate Hit@3 and false refusals by hand.',
    readyWhen: 'You can explain why unreviewed draft labels do not establish verified retrieval accuracy.',
    topicParts: [['r05', numbers(1, 18)], ['r14', numbers(14, 17)]],
  },
  {
    id: 'advanced-ops', level: 'LATER',
    title: 'Advanced only when needed: pgvector, Docker, deployment and GPU',
    meaning: 'Your main RAG application uses SQLite and Python cosine search; PostgreSQL/pgvector is an optional tested adapter.',
    whyNow: 'These topics help with infrastructure interviews but are not prerequisites for your first RAG explanation.',
    example: 'SQLite stores vectors locally → Python ranks them. PostgreSQL + pgvector is another possible storage/search architecture.',
    practice: 'Explain how your current architecture runs locally, what optional pgvector changes, and how to run its tests.',
    readyWhen: 'You can distinguish local implementation, optional adapter and public production deployment without exaggeration.',
    topicParts: [['r07', numbers(10, 18)], ['r13', numbers(6, 16)], ['r06', [2, 6, 7, 21]]],
  },
  {
    id: 'interview-defense', level: 'LATER',
    title: 'Interview practice: explain the system and rebuild one small part',
    meaning: 'A recruiter should hear your reasoning, not a list of library names.',
    whyNow: 'Use this after the core path, or revisit it briefly each day while applying for internships.',
    example: '“I built a local RAG application for inspection records. It searches documents and checks citations before displaying answers.”',
    practice: 'Give a 60-second explanation, then write a three-passage retrieval function without AI assistance.',
    readyWhen: 'You can demo the app, explain a real failure and correct a small Python function independently.',
    topicParts: [['r15', [3, ...numbers(9, 20)]]],
  },
];

/** Reuses existing v1 progress IDs even when topics are displayed in a new order. */
export function buildRagStudyStages(track: LearningTrack): RagStudyStage[] {
  const topicsBySection = new Map(track.sections.map(section => [section.id, section]));
  const originalNumbers = new Map<string, number>();
  let originalNumber = 0;
  for (const section of track.sections) {
    section.topics.forEach((_, index) => {
      originalNumber += 1;
      originalNumbers.set(section.id + ':' + (index + 1), originalNumber);
    });
  }

  const used = new Set<string>();
  let studyNumber = 0;
  const stages = plan.map(stage => {
    const topics: RagStudyTopic[] = [];
    const projectFiles = new Set<string>();
    for (const [sectionId, indices] of stage.topicParts) {
      const section = topicsBySection.get(sectionId);
      if (!section) throw new Error('Unknown RAG learning section: ' + sectionId);
      for (const index of indices) {
        const identity = sectionId + ':' + index;
        if (used.has(identity)) throw new Error('Duplicated RAG learning topic: ' + identity);
        const title = section.topics[index - 1];
        const number = originalNumbers.get(identity);
        if (!title || !number) throw new Error('Missing RAG learning topic: ' + identity);
        used.add(identity);
        studyNumber += 1;
        topics.push({
          title,
          studyNumber,
          originalNumber: number,
          sourceSection: section.title,
          slug: 'career-track-v1-rag-' + String(number).padStart(3, '0'),
        });
        section.files.forEach(file => projectFiles.add(file));
      }
    }
    return {
      ...stage,
      topics,
      projectFiles: Array.from(projectFiles),
    };
  });

  if (used.size !== originalNumber) {
    throw new Error('The RAG path is incomplete: expected ' + originalNumber + ' topics; mapped ' + used.size);
  }
  return stages;
}
