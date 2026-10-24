'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Circle,
  Cloud,
  Database,
  GitBranch,
  LockKeyhole,
  Rocket,
  Server,
} from 'lucide-react';
import { Card, Page } from '@/components/ui';

type Stage = {
  id: string;
  title: string;
  tools: string;
  learn: string;
  dorsal: string;
  done: string;
  phase: 'Core' | 'Production' | 'Advanced';
};

const stages: Stage[] = [
  {
    id: 'research',
    title: '1. Understand the model deeply',
    tools: 'PyTorch • CNN fundamentals • LAWNet • Verification',
    learn: 'Before deployment, understand the model you are changing: tensors, channels, convolution, stride, downsampling, residual paths, activations, normalization, embeddings, loss, backpropagation and optimization.',
    dorsal: 'Be able to trace ROI/preprocess → every important LAWNet stage → embedding → cosine similarity → threshold → verification result, and explain why each architecture change is being tested.',
    done: 'You can explain the important layers, tensor changes, training flow, verification metrics and current architecture hypotheses without depending on generated code or notes.',
    phase: 'Core',
  },
  {
    id: 'architecture-research',
    title: '2. Finish the research architecture',
    tools: 'LAWNet • Architecture experiments • Ablations • EER/TAR/FAR',
    learn: 'Research thinking: identify a weakness, form a hypothesis, make one controlled architecture change, predict what it should affect, run the experiment and interpret the result.',
    dorsal: 'For every modification, record what changed, why it may help cross-condition verification, tensor/channel effects, parameter or compute impact, experiment result and what you learned.',
    done: 'You have a defensible final architecture and can explain baseline → hypothesis → modification → result → decision for the important experiments.',
    phase: 'Core',
  },
  {
    id: 'inference',
    title: '3. Clean inference script',
    tools: 'Python • PyTorch',
    learn: 'Practical Python: functions, files, paths, JSON, exceptions, logging and simple testing.',
    dorsal: 'Create one inference.py that loads the final checkpoint, accepts two images, returns similarity, decision and latency.',
    done: 'One command can run verification without the training code.',
    phase: 'Core',
  },
  {
    id: 'onnx',
    title: '4. Export for production',
    tools: 'ONNX • ONNX Runtime',
    learn: 'torch.onnx.export, input/output shapes, CPU/GPU inference and parity checking.',
    dorsal: '.pt → .onnx → ONNX Runtime. Compare embeddings and similarity with PyTorch, then benchmark latency.',
    done: 'ONNX output matches PyTorch closely and runs from a standalone script.',
    phase: 'Core',
  },
  {
    id: 'api',
    title: '5. Turn the model into an API',
    tools: 'FastAPI • REST • JSON • Gradio',
    learn: 'HTTP basics, POST requests, request validation, JSON responses and error handling.',
    dorsal: 'Build /health, /enroll and /verify. Add one simple Gradio upload page only for the demo.',
    done: 'A browser or another program can send hand images and receive the verification result.',
    phase: 'Core',
  },
  {
    id: 'database',
    title: '6. Save real inference data',
    tools: 'SQL • PostgreSQL',
    learn: 'SELECT, WHERE, GROUP BY, JOIN, INSERT, UPDATE, primary keys and basic indexes.',
    dorsal: 'Store timestamp, image/user ID, similarity, threshold, decision, latency and model version.',
    done: 'You can query verification history and average latency with SQL.',
    phase: 'Core',
  },
  {
    id: 'git-linux',
    title: '7. Work like an engineer',
    tools: 'Linux • Git • GitHub',
    learn: 'Ubuntu terminal, processes, permissions, environment variables, SSH, branches, commits and pull requests.',
    dorsal: 'Run the API on Linux, keep secrets out of Git, and maintain a clean repository with README and setup steps.',
    done: 'Someone else can clone the repo and understand how to run it.',
    phase: 'Core',
  },
  {
    id: 'docker',
    title: '8. Containerize it',
    tools: 'Docker • Docker Compose',
    learn: 'Dockerfile, images, containers, ports, volumes, environment variables and logs.',
    dorsal: 'Package FastAPI + ONNX Runtime + OpenCV + model dependencies into one reproducible container.',
    done: 'docker run starts the dorsal verification service on another machine.',
    phase: 'Production',
  },
  {
    id: 'mlops',
    title: '9. Add MLOps discipline',
    tools: 'MLflow • pytest • GitHub Actions',
    learn: 'Experiment tracking, model versions, automated tests and a basic CI pipeline.',
    dorsal: 'Track EER/FAR/TAR, seeds and checkpoints in MLflow. On every push: test → build Docker → verify the app.',
    done: 'You can show which model is deployed, why it was selected and whether the build passed.',
    phase: 'Production',
  },
  {
    id: 'cloud',
    title: '10. Deploy to cloud',
    tools: 'AWS S3 • EC2 • ECR • IAM • CloudWatch',
    learn: 'One cloud only. Learn storage, compute, container registry, permissions and logs.',
    dorsal: 'Store model artifacts in S3, Docker image in ECR, run the API on EC2 and inspect logs in CloudWatch.',
    done: 'Your dorsal API is reachable from a cloud deployment and you can redeploy it safely.',
    phase: 'Production',
  },
  {
    id: 'k8s',
    title: '11. Learn basic orchestration',
    tools: 'Kubernetes • kubectl',
    learn: 'Pod, Deployment, Service, ConfigMap, Secret, replicas, logs and basic troubleshooting.',
    dorsal: 'Run the Dockerized verification API as a Kubernetes Deployment with a Service and 2 replicas.',
    done: 'You can deploy, inspect logs and restart/scale the service without becoming a K8s administrator.',
    phase: 'Advanced',
  },
  {
    id: 'security',
    title: '12. Secure the AI deployment',
    tools: 'IAM • API Auth • Secrets • RBAC • Trivy',
    learn: 'Least privilege, API keys/JWT concepts, secrets management, container scanning and basic RBAC.',
    dorsal: 'Protect /verify, remove credentials from code, restrict S3/model access and scan the Docker image before deployment.',
    done: 'Unauthorized requests are blocked and secrets are not stored in the repository.',
    phase: 'Advanced',
  },
  {
    id: 'optimize',
    title: '13. Optional high-value optimization',
    tools: 'TensorRT • FP16/INT8 • basic C++',
    learn: 'Inference optimization and the speed/accuracy trade-off. C++ only at a basic deployment level.',
    dorsal: 'ONNX → TensorRT. Compare FP32 vs FP16/INT8 for latency, memory and EER/TAR impact.',
    done: 'You can explain a measured production trade-off, not just say “I know TensorRT.”',
    phase: 'Advanced',
  },
];

const ragFlow = [
  'Build a simple baseline RAG yourself',
  'Create a benchmark with known questions and expected evidence',
  'Store embeddings in PostgreSQL + pgvector',
  'Compare chunking, hybrid retrieval and reranking',
  'Measure retrieval, groundedness, citations, hallucination, latency and cost',
  'Add SQL/API tools and tool calling',
  'Turn the system into an AI agent only after RAG works',
  'Measure tool-selection and task-success accuracy',
  'Add prompt-injection, permission and data-leakage tests',
  'FastAPI + Docker + AWS + logging',
];

const storageKey = 'manu-production-ai-roadmap-v1';

export default function ProductionAIRoadmapPage() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setCompleted(JSON.parse(saved));
    } catch {
      // Progress is optional; the roadmap still works without localStorage.
    }
  }, []);

  const toggle = (id: string) => {
    setCompleted((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  };

  const progress = useMemo(
    () => Math.round((completed.length / stages.length) * 100),
    [completed],
  );

  return (
    <Page
      eyebrow="Career Track"
      title="Project 1 — Dorsal → Production AI"
      subtitle="Two-project career plan. Go deep on this research-to-production system first; Project 2 is Agent Reliability Lab. Do not start a third project."
      actions={
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-xs font-bold text-[var(--fg)] transition hover:border-[var(--accent)]"
        >
          <ArrowLeft size={14} />
          Roadmap
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card className="overflow-hidden bg-[var(--accent-subtle)]/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
                  Simple master flow
                </p>
                <h2 className="mt-2 text-xl font-extrabold text-[var(--fg)]">
                  Research → Deployment → Security
                </h2>
              </div>
              <div className="min-w-32 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-right">
                <p className="text-2xl font-black text-[var(--fg)]">{progress}%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  completed
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--fg)]">
              {[
                'PyTorch/CV',
                'Clean inference',
                'ONNX',
                'FastAPI',
                'PostgreSQL',
                'Docker',
                'CI/CD + MLflow',
                'AWS',
                'Kubernetes',
                'Security',
                'TensorRT',
              ].map((item, index, all) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
                    {item}
                  </span>
                  {index < all.length - 1 && (
                    <span className="text-[var(--muted)]">→</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-3">
            {stages.map((stage, index) => {
              const isDone = completed.includes(stage.id);
              return (
                <div key={stage.id}>
                  <Card className={isDone ? 'border-emerald-500/40 bg-emerald-500/5' : ''}>
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => toggle(stage.id)}
                        className="mt-0.5 shrink-0 text-[var(--accent)]"
                        aria-label={isDone ? `Mark ${stage.title} incomplete` : `Mark ${stage.title} complete`}
                      >
                        {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-extrabold text-[var(--fg)] md:text-lg">
                            {stage.title}
                          </h2>
                          <span className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                            {stage.phase}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-bold text-[var(--accent)]">{stage.tools}</p>

                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--bg)]/50 p-3.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                              Learn
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--fg)]">{stage.learn}</p>
                          </div>
                          <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--bg)]/50 p-3.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                              Use in Dorsal
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--fg)]">{stage.dorsal}</p>
                          </div>
                          <div className="rounded-xl border border-[var(--line-subtle)] bg-[var(--bg)]/50 p-3.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                              Finish when
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--fg)]">{stage.done}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  {index < stages.length - 1 && (
                    <div className="flex h-8 items-center justify-center text-[var(--muted)]">
                      <ArrowDown size={18} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <div className="flex items-center gap-2">
              <Rocket size={18} className="text-[var(--accent)]" />
              <h2 className="text-sm font-extrabold text-[var(--fg)]">Graduation target</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Be able to say: “I took my PyTorch biometric model from research to a tested ONNX API, database, Docker container, cloud deployment and secure production workflow.”
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Server size={18} className="text-[var(--accent)]" />
              <h2 className="text-sm font-extrabold text-[var(--fg)]">Priority order</h2>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <p className="font-extrabold text-[var(--fg)]">Before graduation</p>
                <p className="mt-1 leading-5 text-[var(--muted)]">
                  Stages 1–10. Understand and finish the research first, then build the main job-ready production signal.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-[var(--fg)]">After core deployment works</p>
                <p className="mt-1 leading-5 text-[var(--muted)]">
                  Kubernetes, security hardening and TensorRT optimization.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-[var(--accent)]/30">
            <div className="flex items-center gap-2">
              <BrainCircuit size={18} className="text-[var(--accent)]" />
              <h2 className="text-sm font-extrabold text-[var(--fg)]">
                Project 2 — Agent Reliability Lab
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Build one separate RAG + agent evaluation system after the dorsal research is stable and its production path is underway. Do not force RAG into the biometric system, and do not add another portfolio project.
            </p>

            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 p-3.5">
              <p className="text-xs font-extrabold text-[var(--fg)]">
                RAG + Agent Reliability & Security Platform
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                First build a real RAG system, then test and improve it. Add tool-using agents only after the RAG works. The main value is measuring retrieval quality, groundedness, citations, hallucinations, tool accuracy, latency, cost and security failures.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {ragFlow.map((step, index) => (
                <div key={step} className="flex items-start gap-2 text-xs">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[var(--accent-subtle)] text-[10px] font-black text-[var(--accent)]">
                    {index + 1}
                  </span>
                  <span className="leading-5 text-[var(--fg)]">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[var(--line-subtle)] pt-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                Learn
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[var(--fg)]">
                LLM APIs • embeddings • chunking • pgvector • hybrid retrieval • reranking • tool calling • agents • RAG evaluation • AI security • FastAPI • Docker • AWS
              </p>
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <Database className="mx-auto text-[var(--accent)]" size={18} />
                <p className="mt-1 text-[10px] font-bold text-[var(--muted)]">Data</p>
              </div>
              <div>
                <Cloud className="mx-auto text-[var(--accent)]" size={18} />
                <p className="mt-1 text-[10px] font-bold text-[var(--muted)]">Cloud</p>
              </div>
              <div>
                <GitBranch className="mx-auto text-[var(--accent)]" size={18} />
                <p className="mt-1 text-[10px] font-bold text-[var(--muted)]">CI/CD</p>
              </div>
              <div>
                <LockKeyhole className="mx-auto text-[var(--accent)]" size={18} />
                <p className="mt-1 text-[10px] font-bold text-[var(--muted)]">Security</p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </Page>
  );
}
