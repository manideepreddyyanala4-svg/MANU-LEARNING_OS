import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, ClipboardCheck,
  Cpu, Database, ExternalLink, FileText, FlaskConical, LockKeyhole,
  Rocket, Search, ShieldCheck, Terminal, Workflow,
} from 'lucide-react';
import { Page, Card } from '@/components/ui';

export const metadata = {
  title: 'Project 2 — Agent Reliability Lab: EvidenceOps | ManuOS',
  description: 'Evidence-first, bilingual enterprise RAG, MCP agents, safe business workflows, evaluation and production engineering roadmap.',
};

const phases = [
  {
    num: '01',
    label: 'FIRST PORTFOLIO PROOF',
    title: 'A working RAG baseline',
    learn: 'LLMs, tokens, embeddings, similarity, Python, API basics, and how RAG differs from a tool-using agent.',
    build: 'Inspect the existing lab Ollama models and GPU. Create a legally usable synthetic/public corpus. Parse PDF, Markdown and HTML; preserve page/table locations. Add metadata, chunks, embeddings, PostgreSQL/pgvector, source-cited answers and a FastAPI endpoint.',
    evidence: 'A reproducible demo and 30 human-checked questions, including missing-evidence cases. Compare simple keyword search with dense retrieval.',
    pass: 'Questions produce attributable, accessible citations; unanswerable cases can abstain; extraction checks, ingestion and API smoke tests run from clean setup.',
  },
  {
    num: '02',
    label: 'INTERNSHIP-READY MILESTONE',
    title: 'Reliable enterprise retrieval',
    learn: 'SQL, indexes, BM25/full-text search, ranking metrics, multilingual embeddings, retrieval thresholds and controlled experiments.',
    build: 'Compare dense, lexical, hybrid and reranked retrieval. Add English/Traditional-Chinese cross-language queries, technical error codes, tables, deduplication, document versioning, incremental updates, deletes, failed-ingestion recovery and permission-aware filtering.',
    evidence: '60 verified questions, an ablation table, failing examples, measured Recall@5/MRR/citation support and latency on the lab hardware.',
    pass: 'Document updates do not leak stale/unauthorized text, bilingual examples work, and the selected retrieval approach is justified with held-out results.',
  },
  {
    num: '03',
    label: 'REAL AGENT & MCP',
    title: 'A useful investigation workflow',
    learn: 'Function calling, typed schemas, state machines, retries, database transactions, tool safety and the Model Context Protocol.',
    build: 'Implement three incident workflows: rejection-rate investigation, model-version comparison and SOP conflict resolution. Add validated read-only SQL/REST tools, one real MCP server and MCP client, bounded LangGraph steps, streaming status, a draft-ticket integration and human approval before write actions.',
    evidence: 'Recorded tool calls, correct arguments, final incident reports, approved ticket state and RAG-only vs fixed-workflow vs agent comparisons.',
    pass: 'An end-to-end simulated incident completes, unauthorized tool actions fail, timeout/invalid-argument tests pass and the final ticket state is independently checked.',
  },
  {
    num: '04',
    label: 'PRODUCTION RELIABILITY',
    title: 'Secure, observable backend',
    learn: 'AuthN/AuthZ, tenant boundaries, async jobs, queue semantics, idempotency, observability, concurrency and security testing.',
    build: 'Add role-based access, backend-enforced document filters, per-user scope, audit trails, safe error handling, ingestion jobs, cancellation, retries, idempotency, rate and concurrency limits, structured logs, tracing and robust prompt-injection defenses.',
    evidence: 'Automated unit/integration/security tests, cross-user isolation checks, adversarial cases, request traces and load-test measurements.',
    pass: 'No successful unauthorized read/write in the defined regression suite; documented recovery and concurrency behavior; failed requests are diagnosable from traces.',
  },
  {
    num: '05',
    label: 'FULL-TIME ENGINEERING PROOF',
    title: 'Product release and engineering report',
    learn: 'Docker Compose, CI/CD, typed API contracts, system design, software documentation, deployment and experiment reporting.',
    build: 'Finish the bilingual investigation dashboard, evidence viewer, document management, evaluation dashboard and approvals UI. Run all benchmark variants, write deployment/runbooks, Dockerize, add CI, performance profiling, restore drill and a clear GitHub demo.',
    evidence: '120 verified scenarios (40 development / 80 locked test), automated comparison report, failure analysis, setup guide, reproducible demo and screenshots/video.',
    pass: 'A clean checkout starts successfully, end-to-end tests pass, latency and accuracy results are real, and limitations are honestly reported.',
  },
] as const;

const workflows = [
  {
    n: '01',
    name: 'Investigate inspection errors',
    ask: 'Why did Line B reject more products after the model update?',
    result: 'Compare verified rejection rates, time windows and deployment records; cite evidence and distinguish correlation from causation.',
  },
  {
    n: '02',
    name: 'Compare deployments',
    ask: 'What changed between model version 3 and version 4?',
    result: 'Fetch version metadata, preprocessing settings, evaluation records and change logs; produce a structured comparison.',
  },
  {
    n: '03',
    name: 'Resolve SOP conflicts and create a ticket',
    ask: 'Which procedure is valid now, and can you prepare an incident?',
    result: 'Retrieve the permitted current SOP, flag conflicting versions, prepare a report and create a simulated ticket only after user approval.',
  },
] as const;

const stack = [
  ['LLM serving', 'Lab RTX 5080: qwen2.5:7b and qwen3-embedding:0.6b installed; live RAG and agent benchmarks still require verification'],
  ['Document processing', 'Existing Python TXT/PDF/CSV ingestion, source hashes, versions and citations; scanned OCR is optional'],
  ['Search and storage', 'Current application uses SQLite; PostgreSQL/pgvector adapter was tested; semantic/hybrid needs real lab embeddings'],
  ['Agents and MCP', 'Existing bounded fixed LangGraph workflows and tested MCP server/client; LLM-driven tool selection must be verified'],
  ['Application backend', 'FastAPI, Pydantic, structured JSON, streaming, retries, transactions, API contracts'],
  ['Frontend', 'Existing lightweight HTML/CSS/JavaScript dashboard, connected to FastAPI'],
  ['Reliability and security', 'pytest, experiment harness, OpenTelemetry traces, prompt-injection/tenant tests'],
  ['Release', 'Git and Docker Compose tested locally; CI configuration exists; hosted runs and live AI results require verification'],
] as const;

const testCases = [
  ['Direct document lookup', 20],
  ['Multi-document reasoning', 20],
  ['Tables and numeric reasoning', 15],
  ['Temporal and document-version questions', 15],
  ['Unanswerable / missing evidence', 20],
  ['Tool use and workflow state', 15],
  ['Adversarial and conflicting evidence', 15],
] as const;

const jobMatrix = [
  ['AI Application / LLM / RAG Engineer', 'Parsing, multilingual retrieval, embeddings, grounded citations, measurable evaluations'],
  ['AI Agent / MCP Integration Engineer', 'Function calling, MCP server+client, safe tools, approval gates, workflow completion'],
  ['Python Backend / AI Software Engineer', 'FastAPI, SQL, typed contracts, async jobs, streaming, retries, integration tests'],
  ['AI Platform / LLMOps Engineer', 'Ollama inference, tracing, benchmarking, CI/CD, Docker, operational runbooks'],
  ['Data Engineering / Analytics roles', 'Data quality, ingestion, schemas, incremental updates and SQL metrics (partial overlap)'],
  ['Computer Vision / ML Engineer', 'Industrial vision domain familiarity; your separate dorsal-hand research remains primary CV evidence'],
] as const;

const sources = [
  ['RAG benchmark — CRAG', 'https://proceedings.neurips.cc/paper_files/paper/2024/file/1435d2d0fca85a84d83ddcb754f58c29-Paper-Datasets_and_Benchmarks_Track.pdf'],
  ['RAG evaluation — ARES', 'https://aclanthology.org/2024.naacl-long.20/'],
  ['Agent security tasks — AgentDojo', 'https://proceedings.neurips.cc/paper_files/paper/2024/hash/97091a5177d8dc64b1da8bf3e1f6fb54-Abstract-Datasets_and_Benchmarks_Track.html'],
  ['RAG security — OWASP', 'https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html'],
  ['Official MCP Python SDK', 'https://py.sdk.modelcontextprotocol.io/v2/'],
  ['PostgreSQL vector search — pgvector', 'https://github.com/pgvector/pgvector'],
  ['Industrial agent precedent — AssetOpsBench', 'https://github.com/IBM/AssetOpsBench'],
  ['Taiwan employer requirements — 104 search', 'https://www.104.com.tw/jobs/search/?action=jobSearch&jobcat=2007001020'],
] as const;

const anchorClass = 'rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-extrabold text-[var(--fg)] transition hover:border-violet-400 hover:text-violet-600';

export default function AgentReliabilityPage() {
  return (
    <Page
      eyebrow="Career portfolio · Project 2"
      title="Agent Reliability Lab — EvidenceOps"
      subtitle="A bilingual AI investigation project: tested local retrieval, workflows and MCP, with live RAG/agent evaluation as the next lab milestone."
      actions={<Link href="/roadmap" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--fg)]"><ArrowLeft size={15} /> Roadmap</Link>}
    >
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-lg md:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-[11px] font-bold text-amber-200">LOCAL NON-LLM SYSTEM TESTED · LIVE AI EVALUATION PENDING</span>
              <span className="rounded-full bg-sky-400/15 px-3 py-1 text-[11px] font-bold text-sky-200">LOCAL OLLAMA IN LAB</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-200">INTERNSHIP → FULL-TIME</span>
            </div>
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-violet-200">One flagship project, not another chatbot clone</p>
            <h2 className="mt-2 max-w-4xl text-3xl font-black leading-tight md:text-4xl">Evidence-backed answers. Controlled AI actions. Measured reliability.</h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200">
              Build a reusable AI application for companies that must investigate operational problems using changing documents, databases and tools. The flagship scenario is simulated industrial computer-vision inspection. No private lab data or real factory-control connections.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              {['RAG + hybrid retrieval', 'English + 繁體中文', 'Agent tool calling', 'MCP server + client', 'FastAPI + SQL', 'Evidence citations', 'Security', 'Evaluation', 'Docker + CI'].map((x) =>
                <span key={x} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2">{x}</span>
              )}
            </div>
          </div>
        </section>

        <Link href="/roadmap/rag-interview" className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 transition hover:border-violet-500/60">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-300">Separate job interview learning track</p>
            <h2 className="mt-1 text-lg font-black text-[var(--fg)]">262 numbered topics mapped to the EvidenceOps source files</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Python → retrieval → Ollama → FastAPI → SQL → LangGraph → MCP → evaluation → Docker. Save progress in ManuOS.</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-violet-600 dark:text-violet-300">Open learning track <ArrowRight size={15}/></span>
        </Link>

        <nav aria-label="Project sections" className="flex flex-wrap gap-2">
          <a className={anchorClass} href="#problem">What it does</a>
          <a className={anchorClass} href="#architecture">Architecture</a>
          <a className={anchorClass} href="#build">Build phases</a>
          <a className={anchorClass} href="#evaluation">Evaluation</a>
          <a className={anchorClass} href="#jobs">Job fit</a>
          <a className={anchorClass} href="#start">Start here</a>
        </nav>

        <section id="problem" className="scroll-mt-20 space-y-4">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300"><BrainCircuit size={19} /><h2 className="text-xl font-black text-[var(--fg)]">1. What are we building, in simple words?</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">Why companies need it</p>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">An LLM understands language but may not know private or changing company facts. RAG searches approved evidence before answering. An AI agent uses permitted tools to check live records or prepare an action. Our reliability lab tests whether all three behave correctly.</p>
            </Card>
            <Card>
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">What makes it different</p>
              <p className="mt-2 text-sm leading-7 text-[var(--fg)]">Not just chat with PDFs: bilingual search, exact versioned citations, numerical investigation, real MCP integration, ticket approvals, multi-tenant access, failure replay, RAG-versus-agent ablations and independent accuracy/security tests.</p>
            </Card>
          </div>
          <h3 className="text-base font-extrabold text-[var(--fg)]">Three business workflows — deliberately narrow and testable</h3>
          <div className="grid gap-3 lg:grid-cols-3">
            {workflows.map((w) => (
              <div key={w.n} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <span className="text-xs font-black text-violet-600 dark:text-violet-300">WORKFLOW {w.n}</span>
                <h4 className="mt-2 font-extrabold text-[var(--fg)]">{w.name}</h4>
                <p className="mt-3 rounded-xl bg-[var(--bg)] p-3 text-xs font-semibold leading-5 text-[var(--fg)]">{w.ask}</p>
                <p className="mt-3 text-xs leading-6 text-[var(--muted)]">{w.result}</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-medium leading-5 text-[var(--muted)]">Business data is synthetic and clearly labeled. Reported relationships are hypotheses unless the evidence supports a causal conclusion. No real production changes are automated.</p>
        </section>

        <section id="architecture" className="scroll-mt-20 space-y-4">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300"><Workflow size={19} /><h2 className="text-xl font-black text-[var(--fg)]">2. How the complete system works</h2></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6">
            <div className="rounded-xl bg-violet-500/10 p-4 text-center">
              <p className="text-sm font-black text-[var(--fg)]">Engineer → Next.js investigation dashboard → FastAPI authorization</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Authenticated request, tenant scope, validated inputs</p>
            </div>
            <div className="py-2 text-center text-[var(--muted)]">↓</div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-4"><Search size={19} className="text-sky-600 dark:text-sky-300"/><p className="mt-2 text-sm font-bold text-[var(--fg)]">Evidence retrieval</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Parse PDFs/tables → chunks → embeddings → pgvector + full-text → citations and versions</p></div>
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-4"><Cpu size={19} className="text-violet-600 dark:text-violet-300"/><p className="mt-2 text-sm font-bold text-[var(--fg)]">Ollama + bounded agent</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Local LLM, typed outputs, LangGraph states, evidence checks and abstention</p></div>
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4"><Database size={19} className="text-emerald-600 dark:text-emerald-300"/><p className="mt-2 text-sm font-bold text-[var(--fg)]">SQL, REST and MCP</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Read-only operational tools, one tested MCP client/server and approved ticket submission</p></div>
            </div>
            <div className="py-2 text-center text-[var(--muted)]">↓</div>
            <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
              <p className="text-sm font-black text-[var(--fg)]">Evidence-backed result → human approval if needed → audited action</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Independent evaluation, tracing and regression tests surround the whole system</p>
            </div>
          </div>
          <Card>
            <h3 className="text-base font-extrabold text-[var(--fg)]">Technology decisions (proposed, not installed)</h3>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {stack.map(([label, detail]) => (
                <div key={label} className="rounded-xl border border-[var(--line-subtle)] p-3">
                  <p className="text-xs font-black text-[var(--fg)]">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Model size, quantization, embedding choice and performance budgets are decided after checking the real lab hardware. Ollama is already installed; do not reinstall it.</p>
          </Card>
        </section>

        <section id="build" className="scroll-mt-20 space-y-4">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-300"><Rocket size={19} /><h2 className="text-xl font-black text-[var(--fg)]">3. Learn → build → test → prove: five milestones</h2></div>
          <p className="text-sm leading-6 text-[var(--muted)]">Applications continue while building. Milestone 2 is the first employer-facing result. Full-time/platform depth comes later. Mark a stage complete only after its acceptance evidence exists.</p>
          <div className="space-y-3">
            {phases.map((p) => (
              <details key={p.num} className="group overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]" open={p.num === '01'}>
                <summary className="flex cursor-pointer list-none items-center gap-4 p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 font-black text-violet-600 dark:text-violet-300">{p.num}</div>
                  <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{p.label}</p><h3 className="mt-1 text-base font-extrabold text-[var(--fg)]">{p.title}</h3></div>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-300 group-open:rotate-90 transition-transform">Open →</span>
                </summary>
                <div className="grid gap-3 border-t border-[var(--line-subtle)] p-5 lg:grid-cols-2">
                  <div className="rounded-xl bg-[var(--bg)] p-4"><p className="text-xs font-black text-sky-600 dark:text-sky-300">LEARN</p><p className="mt-2 text-sm leading-6 text-[var(--fg)]">{p.learn}</p></div>
                  <div className="rounded-xl bg-[var(--bg)] p-4"><p className="text-xs font-black text-violet-600 dark:text-violet-300">BUILD</p><p className="mt-2 text-sm leading-6 text-[var(--fg)]">{p.build}</p></div>
                  <div className="rounded-xl bg-emerald-500/5 p-4"><p className="text-xs font-black text-emerald-700 dark:text-emerald-300">EVIDENCE TO SHOW</p><p className="mt-2 text-sm leading-6 text-[var(--fg)]">{p.evidence}</p></div>
                  <div className="rounded-xl bg-amber-500/5 p-4"><p className="text-xs font-black text-amber-700 dark:text-amber-300">PASS GATE</p><p className="mt-2 text-sm leading-6 text-[var(--fg)]">{p.pass}</p></div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="evaluation" className="scroll-mt-20 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300"><FlaskConical size={19} /><h2 className="text-xl font-black text-[var(--fg)]">4. What will prove it is more than a tutorial?</h2></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="text-base font-extrabold text-[var(--fg)]">Benchmark: build from 30 → 60 → 120 cases</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">All numbers are targets, not results. Human-check expected answers, evidence IDs, permitted tools and expected state. Keep related incident cases together when splitting development (40) versus locked test (80).</p>
              <div className="mt-4 space-y-2">
                {testCases.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[var(--fg)]">{name}</span><span className="rounded-lg bg-[var(--bg)] px-2 py-1 font-black tabular-nums text-[var(--fg)]">{count}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-[var(--line-subtle)] pt-3 text-xs font-bold text-[var(--fg)]">Total: 120 planned scenarios + separate security regressions</p>
            </Card>
            <Card>
              <h3 className="text-base font-extrabold text-[var(--fg)]">Metrics and controlled comparisons</h3>
              <div className="mt-3 space-y-2 text-xs leading-6 text-[var(--fg)]">
                <p><strong>Retrieval:</strong> Recall@5, Precision@k, MRR, cross-language and table accuracy.</p>
                <p><strong>Generation:</strong> Answer correctness, unsupported claims, citation support, correct abstention.</p>
                <p><strong>Agent:</strong> Tool choice/arguments, workflow completion, state verification, approval compliance.</p>
                <p><strong>System:</strong> p50/p95 latency, tokens, throughput, error rate, resource use and recovery.</p>
                <p><strong>Ablations:</strong> keyword vs dense vs hybrid vs reranker; RAG-only vs fixed tools vs agent; normal vs stale/poisoned evidence.</p>
              </div>
              <p className="mt-3 rounded-xl bg-[var(--bg)] p-3 text-xs leading-5 text-[var(--muted)]">Run the same held-out scenarios with recorded model versions, prompts, code commits and data snapshots. Don't claim an improvement without measured results.</p>
            </Card>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300"><LockKeyhole size={18}/><h3 className="font-extrabold">Security release gates</h3></div>
            <p className="mt-2 text-sm leading-6 text-[var(--fg)]">Backend-enforced tenant filtering, zero authorized-boundary violations in the defined tests, safe SQL/REST tool allowlists, prompt-injection and poisoned-document tests, no secret leakage, rate limits, human approval for writes, and verifiable source IDs. Passing these tests is not proof that every possible attack is blocked.</p>
          </div>
        </section>

        <section id="jobs" className="scroll-mt-20 space-y-4">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300"><ClipboardCheck size={19} /><h2 className="text-xl font-black text-[var(--fg)]">5. Taiwan internship + full-time job fit</h2></div>
          <p className="text-sm leading-6 text-[var(--muted)]">The November 2026 sample of Taiwan AI application positions explicitly mentions AI agents, RAG, function calling, MCP, REST/JSON/SQL, testing, monitoring and responsible deployment. Requirements vary by employer. This is a portfolio skill map, not a promise that one project satisfies every job.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {jobMatrix.map(([role, proof]) => (
              <div key={role} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="text-sm font-extrabold text-[var(--fg)]">{role}</p>
                <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{proof}</p>
              </div>
            ))}
          </div>
          <Card>
            <h3 className="text-base font-extrabold text-[var(--fg)]">Portfolio / résumé truth policy</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--fg)]">Do not list the proposed technology stack as completed experience. When a milestone is independently verified, report its actual implementation, measured comparisons and personal contributions. A working evaluation report beats a polished but untested dashboard.</p>
            <p className="mt-3 text-xs leading-6 text-[var(--muted)]">Project 1 remains your dorsal-hand Computer Vision research. Project 2 is the AI software/RAG/agent platform. No third flagship project and no mixing private research assets into this public portfolio.</p>
          </Card>
        </section>

        <section id="start" className="scroll-mt-20 space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300"><Terminal size={19} /><h2 className="text-xl font-black text-[var(--fg)]">6. Start on the lab computer — no unnecessary installation</h2></div>
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
            <p className="text-sm font-bold text-[var(--fg)]">First task: inventory the actual local model and GPU environment.</p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-emerald-200"><code>{'ollama list\nnvidia-smi\npython --version'}</code></pre>
            <p className="mt-3 text-sm leading-6 text-[var(--fg)]">Ollama is already installed in the lab. Check downloaded models, VRAM and Python, confirm permission to use the machine, and then choose our local model/embedding sizes. No arbitrary model downloads or paid cloud expenses yet.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"><BookOpen size={18} className="text-sky-600 dark:text-sky-300"/><h3 className="mt-2 text-sm font-bold text-[var(--fg)]">Learn first</h3><p className="mt-2 text-xs leading-5 text-[var(--muted)]">LLM → token → embedding → retrieval → RAG → tool → agent → MCP. Explain each in your own words.</p></div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"><CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-300"/><h3 className="mt-2 text-sm font-bold text-[var(--fg)]">Code first</h3><p className="mt-2 text-xs leading-5 text-[var(--muted)]">A plain Python document parser and an inspectable search baseline before frameworks or dashboards.</p></div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4"><ShieldCheck size={18} className="text-violet-600 dark:text-violet-300"/><h3 className="mt-2 text-sm font-bold text-[var(--fg)]">Never skip</h3><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Tests, permissions, recorded failures, fixed data splits, real source references and truthful results.</p></div>
          </div>
          <p className="text-xs leading-6 text-[var(--muted)]">Deferred until justified: arbitrary multi-agent swarms, fine-tuning, Kubernetes, real equipment control, expensive AWS infrastructure and optional OCR/multimodal image pipelines.</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--muted)]"><FileText size={18}/><h2 className="text-lg font-extrabold text-[var(--fg)]">Research and implementation references</h2></div>
          <div className="grid gap-2 md:grid-cols-2">
            {sources.map(([title, url]) => (
              <a key={title} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-xs font-semibold text-[var(--fg)] transition hover:border-violet-500/40">
                {title}<ExternalLink size={14} className="shrink-0 text-[var(--muted)]"/>
              </a>
            ))}
          </div>
          <p className="text-xs leading-5 text-[var(--muted)]">These sources guide engineering decisions. Framework examples and benchmark scores are not our project's results. Scope last audited against a representative Taiwan job sample in November 2026.</p>
        </section>
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-5">
          <Link href="/roadmap" className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-3 text-xs font-bold text-[var(--fg)]"><ArrowLeft size={15}/> All learning modules</Link>
          <Link href="/job-preparation" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-extrabold text-white">Continue applying while building <ArrowRight size={15}/></Link>
        </div>
      </div>
    </Page>
  );
}
