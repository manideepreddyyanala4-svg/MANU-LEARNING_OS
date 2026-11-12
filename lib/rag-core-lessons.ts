import type { LearningTrack } from './career-learning-tracks';

export type CoreLesson = {slug:string; title:string; meaning:string; example:string; task:string; check:string; originalNumber:number; number:number};
export type CoreStage = {id:string; title:string; why:string; ready:string; resource:{label:string;url:string}; lessons:CoreLesson[]};
type LessonSpec = {source:string;title:string;meaning:string;example:string;task:string;check:string};
type StageSpec = {id:string;title:string;why:string;ready:string;resource:{label:string;url:string};lessons:LessonSpec[]};

// The 34 indispensable lessons. Everything else stays in the original 262-topic data
// but no longer overwhelms the beginner page. Original completion IDs remain stable.
const specs: StageSpec[] = [
  {
    "id": "big-picture",
    "title": "Understand the goal before studying code",
    "why": "An LLM makes language. Your application needs facts from inspection records. Learn that story first.",
    "ready": "Explain LLM → search → sourced answer in three sentences without notes.",
    "resource": {
      "label": "3Blue1Brown: LLMs explained in 8 minutes (video)",
      "url": "https://www.youtube.com/watch?v=LPZh9BOjkQs"
    },
    "lessons": [
      {
        "source": "r06:1",
        "title": "What is an LLM?",
        "meaning": "An LLM is a model trained to predict and generate sequences of text. It can write an answer, but it does not automatically know your factory's latest SOP.",
        "example": "Question: “What is the threshold?”\nLLM without the SOP: it may guess.\nLLM with the SOP: it can use the value written there.",
        "task": "In your own words, explain why the LLM might answer incorrectly about a recent factory change.",
        "check": "You can explain what it generates and what information it may lack."
      },
      {
        "source": "r15:4",
        "title": "What is RAG, and why does your project use it?",
        "meaning": "RAG means Retrieval-Augmented Generation: find relevant documents, then show them to an LLM when asking for an answer. You do not need to train a new model to do this.",
        "example": "Question → search SOPs → find “threshold 0.50” → LLM answers “0.50” with source.",
        "task": "Draw four boxes with arrows for this flow and say what each box does.",
        "check": "You can explain why RAG is different from just chatting with an LLM."
      },
      {
        "source": "r06:19",
        "title": "What can go wrong: hallucinations and unsupported answers",
        "meaning": "An LLM can produce fluent text that isn't supported by evidence. Even if a quotation is real, the answer can still be about the wrong question.",
        "example": "Evidence: “1941 total fault records.”\nQuestion: “How many Bumps?”\nAnswer: “1941.”\nThe quotation is real, but the answer is wrong.",
        "task": "Invent one example of a believable answer that the supplied document does not support.",
        "check": "You can distinguish a plausible sentence from a supported and relevant answer."
      }
    ]
  },
  {
    "id": "python",
    "title": "Learn only the Python needed for the project",
    "why": "Python variables, decisions, loops, dictionaries and functions are the foundations of the entire application.",
    "ready": "Write a small inspection-rate function without using AI to generate code.",
    "resource": {
      "label": "Harvard CS50P — Python foundations (free lessons)",
      "url": "https://cs50.harvard.edu/python/weeks/"
    },
    "lessons": [
      {
        "source": "r01:2",
        "title": "Python variables: remember a value",
        "meaning": "A variable is a name attached to a value. Numbers and text are different types.",
        "example": "inspected = 100\nrejected = 7\nline = 'B'\nprint(line, rejected)",
        "task": "Change 7 to 5 and print the rejection percentage.",
        "check": "You can predict what print() outputs and calculate rejected / inspected."
      },
      {
        "source": "r01:3",
        "title": "if/else: choose what happens",
        "meaning": "Use if when a program must make a decision. A condition is either true or false.",
        "example": "rejected = 7\nif rejected > 5:\n    print('Check the line')\nelse:\n    print('Normal')",
        "task": "Make the program print a warning only when rejected is greater than 10.",
        "check": "You can say exactly which branch runs for rejected = 7."
      },
      {
        "source": "r01:4",
        "title": "for loops: check many records",
        "meaning": "A for loop repeats a small action for every item in a list.",
        "example": "counts = [5, 7, 2]\nfor count in counts:\n    print(count)",
        "task": "Write a loop that adds the three values together.",
        "check": "You can explain what changes each time the loop runs."
      },
      {
        "source": "r01:6",
        "title": "Lists: keep many items together",
        "meaning": "A list stores multiple values in order. Start with lists; tuples and sets can wait.",
        "example": "records = [5, 7, 2]\nprint(records[0])  # 5\nprint(len(records))  # 3",
        "task": "Create a list with 4 inspection counts and print the largest one.",
        "check": "You can access elements by index and loop over the list."
      },
      {
        "source": "r01:7",
        "title": "Dictionaries: store named fields",
        "meaning": "A dictionary stores information under keys. Your inspection records are often dictionaries.",
        "example": "row = {'line': 'B', 'rejected': 7}\nprint(row['rejected'])\nprint(row.get('camera', 'unknown'))",
        "task": "Create a dictionary with line, inspected and rejected, then calculate its rate.",
        "check": "You know what a key, value and .get() do."
      },
      {
        "source": "r01:8",
        "title": "Functions: inputs → work → result",
        "meaning": "A function is a reusable block of code. return sends its answer back to the caller.",
        "example": "def rejection_rate(rejected, inspected):\n    return rejected / inspected * 100\n\nprint(rejection_rate(7, 100))",
        "task": "Add a safe check for inspected = 0 and call your function twice.",
        "check": "You can write def, arguments and return without copying."
      },
      {
        "source": "r01:11",
        "title": "Errors: understand why code failed",
        "meaning": "Errors are useful signals. A traceback points to a failing line; a try/except can handle expected bad input.",
        "example": "text = '7'\ntry:\n    count = int(text)\n    print(count)\nexcept ValueError:\n    print('Not a number')",
        "task": "Change text to 'seven'. Predict and explain what happens.",
        "check": "You can name the error and decide when to handle it."
      }
    ]
  },
  {
    "id": "data",
    "title": "Understand what the AI searches",
    "why": "Before embeddings or databases, learn to read small real records and turn documents into searchable passages.",
    "ready": "Explain one input CSV row, one document chunk and its source label.",
    "resource": {
      "label": "Python official tutorial: input, output and files",
      "url": "https://docs.python.org/3/tutorial/inputoutput.html"
    },
    "lessons": [
      {
        "source": "r01:10",
        "title": "TXT, CSV and JSON are data formats",
        "meaning": "TXT holds text, CSV holds rows and columns, and JSON holds structured values. All can become evidence.",
        "example": "CSV row: B,100,7\nJSON: {'line': 'B', 'inspected': 100, 'rejected': 7}",
        "task": "Write down how the same inspection record would look as a Python dictionary.",
        "check": "You can explain what fields belong to a row."
      },
      {
        "source": "r03:5",
        "title": "Chunks: split a document into small passages",
        "meaning": "A chunk is a piece of a longer document. Retrieval ranks chunks, not necessarily whole files.",
        "example": "SOP paragraph 1: “Wear gloves.”\nSOP paragraph 2: “Check calibration before changing settings.”",
        "task": "Split a four-sentence SOP into two chunks on paper.",
        "check": "You can say why shorter passages can be easier to retrieve and cite."
      },
      {
        "source": "r03:6",
        "title": "Metadata: remember where a passage came from",
        "meaning": "Metadata is extra information about a passage: filename, version, paragraph or date. Without it, citations are hard to trust.",
        "example": "chunk = {'text': 'Threshold 0.50', 'source': 'sop_v2.txt', 'version': 'v2'}",
        "task": "Add a page or paragraph number to your example dictionary.",
        "check": "You can show a user the source of any answer."
      }
    ]
  },
  {
    "id": "models",
    "title": "Use your existing local models, not new frameworks",
    "why": "One model writes language; a second model creates number vectors. Ollama runs both locally.",
    "ready": "Use the existing Ollama setup to produce one short grounded answer.",
    "resource": {
      "label": "Ollama API: generating text",
      "url": "https://docs.ollama.com/api/generate"
    },
    "lessons": [
      {
        "source": "r06:8",
        "title": "Two models have different jobs",
        "meaning": "A generation model writes an answer. An embedding model turns text into a vector for similarity search. They are not interchangeable.",
        "example": "Qwen2.5:7b → writes: “The threshold is 0.50.”\nQwen3-Embedding:0.6b → returns a list of 1,024 numbers.",
        "task": "Say which model you need to write an answer and which model you need to search by meaning.",
        "check": "You can explain why the project uses both models."
      },
      {
        "source": "r06:9",
        "title": "Ollama: running a local LLM",
        "meaning": "Ollama is software that runs compatible models on your own computer. Your Python program sends a request and receives a response.",
        "example": "ollama list\nollama run qwen2.5:7b\n# Try: Say hello in one short sentence.",
        "task": "On the lab computer, check which models are already installed. Do not download new models.",
        "check": "You can show one model responding locally."
      },
      {
        "source": "r06:17",
        "title": "Prompts: give the model a question plus evidence",
        "meaning": "A prompt is the text/instructions sent to the model. In RAG, include only retrieved evidence and ask for a source-backed answer.",
        "example": "Evidence: 'Current threshold is 0.50.'\nQuestion: 'What is the threshold?'\nInstruction: 'Answer using only the evidence.'",
        "task": "Write a three-line prompt using a different number and source.",
        "check": "You can explain why evidence belongs in the prompt."
      }
    ]
  },
  {
    "id": "search",
    "title": "Learn why RAG finds the right passage",
    "why": "Start with plain word matching. Only then learn BM25, vectors and combining rankings.",
    "ready": "Given three short documents, choose which one matches a question and explain why.",
    "resource": {
      "label": "LangChain docs — search concepts (no installation required)",
      "url": "https://docs.langchain.com/oss/python/langchain/knowledge-base"
    },
    "lessons": [
      {
        "source": "r02:2",
        "title": "Keyword search: find matching words",
        "meaning": "Keyword search looks for literal words in a passage. It is easy to debug, but different wording can cause a miss.",
        "example": "Question: 'calibration'\nDocument: 'Check calibration before changing settings.'\nMatch: yes.",
        "task": "Write a 5-line Python loop that finds passages containing 'camera'.",
        "check": "You can explain exact word matching."
      },
      {
        "source": "r02:8",
        "title": "BM25: better keyword ranking",
        "meaning": "BM25 assigns a relevance score based on word frequency, rarity and document length. For now, learn its purpose, not its full formula.",
        "example": "Question: 'line calibration'\nPassage A mentions both words.\nPassage B only mentions 'line'.\nBM25 often ranks A higher.",
        "task": "Explain why repeating a common word isn't always enough to rank first.",
        "check": "You know BM25 is a scoring method, not an LLM."
      },
      {
        "source": "r02:12",
        "title": "Embeddings and cosine: search by meaning",
        "meaning": "The embedding model turns passages and the question into vectors. Cosine similarity compares their directions.",
        "example": "a = [1, 0]\nb = [1, 0]  # very similar\nc = [0, 1]  # different direction",
        "task": "Explain why 'reject count' and 'number of rejected units' may be semantically close despite different words.",
        "check": "You can explain vectors, cosine similarity and top results without math-heavy detail."
      },
      {
        "source": "r02:18",
        "title": "Hybrid search: combine word and meaning ranks",
        "meaning": "Hybrid retrieval combines keyword and semantic rankings. Your application uses reciprocal-rank fusion (RRF) in Python.",
        "example": "Keyword ranks: A, B, C\nSemantic ranks: B, A, C\nHybrid gives A and B strong combined ranks.",
        "task": "Name one case where keyword search wins and one where semantic search wins.",
        "check": "You can explain why hybrid is a comparison method, not automatically a guarantee of accuracy."
      }
    ]
  },
  {
    "id": "rag",
    "title": "Trace one complete RAG answer",
    "why": "This is the central engineering skill: retrieve the right passage, generate an answer, and verify the citation.",
    "ready": "Explain what happens to a question from the browser until the answer is shown.",
    "resource": {
      "label": "IBM: short RAG explanation",
      "url": "https://www.ibm.com/think/videos/rag"
    },
    "lessons": [
      {
        "source": "r02:15",
        "title": "Citations: show the actual source",
        "meaning": "An answer should name the retrieved passage and quote only words actually present in it.",
        "example": "Source E1: 'Threshold is 0.50.'\nAnswer: '0.50 [E1]'",
        "task": "For a passage you wrote, prepare a one-sentence answer and a valid citation.",
        "check": "You can say which source supports your claim."
      },
      {
        "source": "r06:18",
        "title": "Abstention: sometimes say 'not enough evidence'",
        "meaning": "When the documents do not answer the question, guessing is worse than refusing. A correct refusal is a useful result.",
        "example": "Question: 'Who caused the defect?'\nData: only fault categories and counts.\nGood answer: 'Insufficient evidence.'",
        "task": "Write one question the inspection dataset cannot answer and explain why.",
        "check": "You do not confuse a refusal with a software crash."
      },
      {
        "source": "r15:2",
        "title": "The end-to-end answer flow",
        "meaning": "Your project loads evidence, searches, gives context to an LLM, checks citations and saves an AI run.",
        "example": "User question → retriever → passages E1–E3 → Ollama → verifier → answer + audit record.",
        "task": "Draw the flow, then point to rag.answer_question in the repository.",
        "check": "You can tell a recruiter what input enters and what output leaves each step."
      }
    ]
  },
  {
    "id": "backend",
    "title": "Connect Python to a website",
    "why": "You need only basic SQL and one working API before studying advanced deployment.",
    "ready": "Explain how a browser asks a Python function for a response.",
    "resource": {
      "label": "FastAPI official first steps",
      "url": "https://fastapi.tiangolo.com/tutorial/first-steps/"
    },
    "lessons": [
      {
        "source": "r07:9",
        "title": "SQLite: store information and retrieve it later",
        "meaning": "SQLite is a small database saved in files. Your application stores documents, vectors, tickets and AI runs locally.",
        "example": "SQL: SELECT * FROM tickets WHERE state = 'pending';",
        "task": "Explain why a dictionary disappears on restart but saved database rows do not.",
        "check": "You can describe one piece of information the app keeps between runs."
      },
      {
        "source": "r08:1",
        "title": "HTTP and JSON: browser ↔ backend",
        "meaning": "The browser sends an HTTP request. The Python server processes it and sends a response, often as JSON.",
        "example": "GET /health\nResponse: {'status': 'ok'}",
        "task": "Tell whether the browser or server should calculate an inspection rate.",
        "check": "You can distinguish request, response and JSON."
      },
      {
        "source": "r08:5",
        "title": "FastAPI: turn a Python function into an endpoint",
        "meaning": "FastAPI lets a browser call Python functions through an HTTP endpoint.",
        "example": "from fastapi import FastAPI\napp = FastAPI()\n@app.get('/hello')\ndef hello():\n    return {'message': 'Hello'}",
        "task": "Explain what happens when a browser visits /hello.",
        "check": "You can read a simple FastAPI route and explain its return value."
      }
    ]
  },
  {
    "id": "agents",
    "title": "Only now learn agents and MCP",
    "why": "An agent may choose which allowed tool to call. MCP standardizes tool connections. Python enforces permissions.",
    "ready": "Explain all four tools in your system and why none can approve an incident.",
    "resource": {
      "label": "Official MCP first steps",
      "url": "https://py.sdk.modelcontextprotocol.io/get-started/first-steps/"
    },
    "lessons": [
      {
        "source": "r09:2",
        "title": "Workflow versus agent",
        "meaning": "A workflow follows predetermined steps. An agent may choose its next action based on model output, but only within your code's boundaries.",
        "example": "Workflow: read CSV → calculate → report.\nAgent: choose a permitted tool → inspect result → choose next step.",
        "task": "Describe one fixed step and one model-chosen step in EvidenceOps.",
        "check": "You can explain that an agent is not an unrestricted chatbot."
      },
      {
        "source": "r10:2",
        "title": "MCP host, client, server and tools",
        "meaning": "MCP is a standard for connecting AI apps to tools. The host uses an MCP client to contact an MCP server that exposes tools.",
        "example": "Agent → MCP client → MCP server → read_metrics tool → result",
        "task": "Identify which part exposes tools and which part requests them.",
        "check": "You can name host, client and server."
      },
      {
        "source": "r10:11",
        "title": "Pending drafts and human approval",
        "meaning": "The agent can prepare a pending incident, but only a separate authorized human action can approve it. This boundary is enforced in code.",
        "example": "AI tool: create_ticket(state='pending')\nApproval: separate API with approval token",
        "task": "Explain what should happen if the AI tries to approve its own ticket.",
        "check": "You can explain the difference between a tool call and authorization."
      }
    ]
  },
  {
    "id": "proof",
    "title": "Test honestly, then defend the results",
    "why": "Tests can prove specific behaviors; evaluation measures answer quality and evidence relevance. These are separate.",
    "ready": "Test one function and review one answer's supporting document.",
    "resource": {
      "label": "DeepLearning.AI — RAG evaluation overview (optional)",
      "url": "https://www.deeplearning.ai/courses/building-evaluating-advanced-rag"
    },
    "lessons": [
      {
        "source": "r12:1",
        "title": "Unit tests versus end-to-end tests",
        "meaning": "A unit test checks one small function. An end-to-end test follows a complete user action. Passing tests is not the same as perfect AI answers.",
        "example": "assert 7 / 100 * 100 == 7\n# This tests arithmetic, not the full chatbot.",
        "task": "Write a check for rejection_rate(7, 100). Then name one thing this does not test.",
        "check": "You can say which level a test covers."
      },
      {
        "source": "r05:5",
        "title": "Hit@k: did retrieval find the needed passage?",
        "meaning": "Hit@3 asks whether at least one accepted relevant passage appears in the top three. It does not say whether the final answer is correct.",
        "example": "Needed: B\nTop three: [A, B, C]\nHit@3 = yes.",
        "task": "Change the ranked list so B is fourth and decide Hit@3.",
        "check": "You can separate retrieval success from answer success."
      },
      {
        "source": "r05:9",
        "title": "Answer support, relevance and false refusals",
        "meaning": "A valid citation must point to evidence, and the actual claim must answer the question. A false refusal happens when answerable evidence was available but the system withheld it.",
        "example": "Question: 'How many Bumps?'\nEvidence: 'Bumps: 402.'\nAnswer: 'Total dataset 1941.'\nReal fact, wrong answer.",
        "task": "Review one EvidenceOps output and record source, correctness and refusal reason.",
        "check": "You can explain one real failure and how to test a fix."
      }
    ]
  },
  {
    "id": "interview",
    "title": "Show the system and explain your own work",
    "why": "Your interview goal is not memorizing all code. It is explaining one complete workflow and writing a small Python change independently.",
    "ready": "Do one demo and one independent coding exercise.",
    "resource": {
      "label": "Your EvidenceOps public repository",
      "url": "https://github.com/manideepreddyyanala4-svg/LLM-RAG"
    },
    "lessons": [
      {
        "source": "r15:1",
        "title": "One-minute engineering explanation",
        "meaning": "State the problem, your approach, the technical choices and an honest limitation in plain English.",
        "example": "'Engineers need facts from SOPs and inspection records. I used Python and RAG to retrieve sources, Ollama to generate answers, and MCP tools for a controlled investigation. It is a local portfolio project, not production software.'",
        "task": "Speak for one minute without reading. Avoid listing every library.",
        "check": "You can explain why the project exists and what you personally verified."
      },
      {
        "source": "r15:19",
        "title": "Run one full demo without AI assistance",
        "meaning": "A real demonstration is better than a memorized claim. Show a question, a retrieved source, the checked answer and an example refusal.",
        "example": "Demo: Ask threshold → open cited SOP → ask unsupported question → show safe refusal.",
        "task": "Run the public demo video or local app and explain each output without help.",
        "check": "You can troubleshoot one small failure and answer an interviewer’s follow-up."
      }
    ]
  }
];

export function getRagCoreStages(track:LearningTrack):CoreStage[]{
 const offsets=new Map<string,number>();let n=0;
 for(const section of track.sections){offsets.set(section.id,n);n+=section.topics.length;}
 const used=new Set<number>();let counter=0;
 const result=specs.map(stage=>({
  ...stage,
  lessons:stage.lessons.map(item=>{
    const [sectionId,indexString]=item.source.split(':');
    const section=track.sections.find(s=>s.id===sectionId);
    const index=Number(indexString);
    if(!section||!Number.isInteger(index)||index<1||index>section.topics.length)throw new Error('Invalid core learning source: '+item.source);
    const originalNumber=(offsets.get(sectionId)??0)+index;
    if(used.has(originalNumber))throw new Error('Repeated core learning topic: '+item.source);
    used.add(originalNumber);counter+=1;
    return {title:item.title,meaning:item.meaning,example:item.example,task:item.task,check:item.check,slug:'career-track-v1-rag-'+String(originalNumber).padStart(3,'0'),originalNumber,number:counter};
  })
 }));
 if(result.length!==10||used.size!==34)throw new Error('Core path size changed: '+result.length+' stages, '+used.size+' lessons');
 return result;
}
