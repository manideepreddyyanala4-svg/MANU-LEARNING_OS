'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  CheckCircle2, ChevronDown, ChevronUp, CircleAlert, Code2, Copy,
  Download, FlaskConical, Loader2, Play, RotateCcw, SquareTerminal, StopCircle
} from 'lucide-react';
import { PYTHON_CHALLENGES, type PythonCheck } from '@/lib/python-challenges';

type TestResult = { name: string; passed: boolean; error: string };
type WorkerResult = {
  id: number;
  type: 'status' | 'result';
  label?: string;
  output?: string;
  error?: string;
  checks?: TestResult[];
  duration?: number;
};
type LabMode = 'practice' | 'example';
type RequestHandle = { id: number; watchdog: number; check: boolean };
const RUN_LIMIT = 15000;
const BOOT_LIMIT = 120000;

export function PythonLessonLab({
  lessonId,
  exampleCode = '',
  defaultOpen = false,
}: {
  lessonId: string;
  exampleCode?: string;
  defaultOpen?: boolean;
}) {
  const challenge = PYTHON_CHALLENGES[lessonId];
  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<LabMode>('practice');
  const [practiceCode, setPracticeCode] = useState(challenge?.starter ?? '');
  const [editedExample, setEditedExample] = useState(exampleCode);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [tests, setTests] = useState<TestResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [passedBefore, setPassedBefore] = useState(false);
  const [savedAt, setSavedAt] = useState('');
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef<RequestHandle | null>(null);
  const requestCount = useRef(0);
  const busyRef = useRef(false);
  const persistKey = 'manuos:python-draft:v1:' + lessonId;
  const passedKey = 'manuos:python-practice-pass:v1:' + lessonId;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved !== null) setPracticeCode(saved);
      else setPracticeCode(challenge?.starter ?? '');
      setPassedBefore(localStorage.getItem(passedKey) === 'passed');
    } catch { /* storage can be disabled */ }
    setEditedExample(exampleCode);
    setMode('practice');
    setOutput('');
    setError('');
    setTests([]);
  }, [lessonId, persistKey, passedKey, challenge?.starter, exampleCode]);

  const finishWorker = useCallback(() => {
    if (requestRef.current) window.clearTimeout(requestRef.current.watchdog);
    requestRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    busyRef.current = false;
    setBusy(false);
    setLoadingText('');
  }, []);

  useEffect(() => () => {
    if (requestRef.current) window.clearTimeout(requestRef.current.watchdog);
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  const code = mode === 'practice' ? practiceCode : editedExample;

  function editCode(value: string) {
    setTests([]);
    if (mode === 'practice') {
      setPracticeCode(value);
      try {
        localStorage.setItem(persistKey, value);
        setSavedAt('Draft saved on this device');
      } catch {
        setSavedAt('Browser storage unavailable');
      }
    } else {
      setEditedExample(value);
    }
  }

  function stop() {
    if (!busyRef.current) return;
    finishWorker();
    setError('Execution stopped. You can edit and run again.');
  }

  function startRun(check: boolean) {
    if (busyRef.current || !code.trim()) return;
    if (check && (mode !== 'practice' || !challenge)) return;
    let worker: Worker;
    try {
      worker = workerRef.current || new Worker('/python-runtime-worker.mjs', { type: 'module' });
      workerRef.current = worker;
    } catch (cause) {
      setError('This browser could not create the Python worker: ' + String(cause));
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setOutput('');
    setError('');
    setTests([]);
    setLoadingText('Starting Python in your browser...');
    const id = ++requestCount.current;

    const timeout = (milliseconds: number) => {
      if (requestRef.current) window.clearTimeout(requestRef.current.watchdog);
      const watchdog = window.setTimeout(() => {
        finishWorker();
        setError('Program exceeded the execution limit. Check for an infinite loop, then retry.');
      }, milliseconds);
      requestRef.current = { id, watchdog, check };
    };
    timeout(BOOT_LIMIT);

    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      const message = event.data;
      if (!requestRef.current || message.id !== requestRef.current.id) return;
      if (message.type === 'status') {
        setLoadingText(message.label || 'Working...');
        if (message.label === 'Running Python...') timeout(RUN_LIMIT);
        return;
      }
      if (requestRef.current) window.clearTimeout(requestRef.current.watchdog);
      requestRef.current = null;
      busyRef.current = false;
      setBusy(false);
      setLoadingText('');
      setOutput(message.output || '');
      setError(message.error || '');
      const results = message.checks || [];
      setTests(results);
      if (check && results.length > 0 && results.every((result) => result.passed) && !message.error) {
        setPassedBefore(true);
        try { localStorage.setItem(passedKey, 'passed'); } catch { /* storage unavailable */ }
        window.dispatchEvent(new CustomEvent('manuos:python-test-passed', { detail: { lessonId } }));
      }
    };
    worker.onerror = (event: ErrorEvent) => {
      finishWorker();
      setError('Unable to start the Python engine. Check the internet connection and refresh. ' + (event.message || ''));
    };
    const requestedChecks: PythonCheck[] = check && challenge ? challenge.checks : [];
    worker.postMessage({ id, source: code, checks: requestedChecks, stdin });
  }

  function resetCode() {
    if (busy) return;
    if (!window.confirm('Replace your current code with the starter version?')) return;
    editCode(mode === 'practice' ? (challenge?.starter || '') : exampleCode);
    setOutput('');
    setError('');
    setTests([]);
  }

  function downloadCode() {
    const blob = new Blob([code + '\n'], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'manuos-lesson-' + lessonId + '.py';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Tab') {
      event.preventDefault();
      const input = event.currentTarget;
      const next = code.slice(0, input.selectionStart) + '    ' + code.slice(input.selectionEnd);
      const pos = input.selectionStart + 4;
      editCode(next);
      requestAnimationFrame(() => { input.selectionStart = pos; input.selectionEnd = pos; });
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      startRun(false);
    }
  }

  if (!challenge) return null;

  return (
    <div className="python-lab" data-lesson={lessonId}>
      <button className="python-lab-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="python-lab-toggle-title">
          <Code2 size={20} />
          <span><strong>Python Coding Lab</strong><small>Write · Run · Debug · Verify</small></span>
          {passedBefore && <span className="python-lab-passed-tag"><CheckCircle2 size={13} /> Tests passed</span>}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="python-lab-body">
          <p className="python-lab-intro">
            Your code runs locally in a browser WebAssembly worker. Nothing is sent to a code-execution server.
            Drafts and practice checks stay on this device.
          </p>
          <div className="python-lab-mode" role="group" aria-label="Code mode">
            <button type="button" className={mode === 'practice' ? 'active' : ''} onClick={() => setMode('practice')}>✍️ Practice challenge</button>
            <button type="button" className={mode === 'example' ? 'active' : ''} onClick={() => setMode('example')}>📖 Lesson example</button>
          </div>

          {mode === 'practice' && <div className="python-lab-challenge"><strong>YOUR TASK</strong><p>{challenge.prompt}</p></div>}

          <div className="python-lab-editor-head">
            <span><span className="python-lab-file-dot" /> main.py <span className="python-lab-language">Python 3</span></span>
            <div className="python-lab-tools">
              <button type="button" title="Copy Python code" onClick={() => void navigator.clipboard?.writeText(code)}><Copy size={14} /></button>
              <button type="button" title="Download a .py file" onClick={downloadCode}><Download size={14} /></button>
              <button type="button" title="Reset to starter" onClick={resetCode}><RotateCcw size={14} /></button>
            </div>
          </div>
          <div className="python-lab-editor">
            <div aria-hidden className="python-lab-line-numbers">{code.split('\n').map((_,i) => <span key={i}>{i+1}</span>)}</div>
            <textarea
              value={code}
              onChange={(e) => editCode(e.target.value)}
              onKeyDown={handleKey}
              spellCheck={false}
              aria-label="Python source code editor"
              autoCapitalize="off" autoComplete="off" autoCorrect="off"
              rows={Math.max(9, Math.min(22, code.split('\n').length + 3))}
            />
          </div>
          <div className="python-lab-toolbar">
            <button className="python-lab-run" type="button" disabled={busy || !code.trim()} onClick={() => startRun(false)}>
              <Play size={15} fill="currentColor" /> Run Python
            </button>
            <button className="python-lab-test" type="button" disabled={busy || mode !== 'practice' || !code.trim()} onClick={() => startRun(true)}>
              <FlaskConical size={16} /> Check solution <span>({challenge.checks.length})</span>
            </button>
            {busy && <button className="python-lab-stop" type="button" onClick={stop}><StopCircle size={15} /> Stop</button>}
            {busy && <span className="python-lab-loading"><Loader2 className="animate-spin" size={14} /> {loadingText}</span>}
            <span className="python-lab-shortcut">Ctrl / ⌘ + Enter to run</span>
          </div>
          <details className="python-lab-stdin">
            <summary>Optional input() values (one per line)</summary>
            <textarea rows={2} aria-label="Standard input values" value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder="Type input values here, one per line..." />
          </details>
          <div className="python-lab-console">
            <div className="python-lab-console-title"><SquareTerminal size={15} /> Console output <button type="button" onClick={() => {setOutput('');setError('');setTests([]);}}>Clear</button></div>
            <pre aria-live="polite">{output || (busy ? loadingText : 'Press Run Python to see the result here.')}</pre>
            {error && <pre className="python-lab-error" role="alert"><CircleAlert size={15} /> {error}</pre>}
          </div>
          {tests.length > 0 && (
            <div className="python-lab-results" aria-live="polite">
              <strong>{tests.every((test) => test.passed) && !error ? '✅ Practice tests passed!' : '🔎 Review your solution'} <span>{tests.filter((test) => test.passed).length}/{tests.length} passed</span></strong>
              {tests.map((test,i) => <div key={i} className={test.passed ? 'python-lab-test-pass' : 'python-lab-test-fail'}>
                {test.passed ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
                <span>{test.name}{!test.passed && <small>{test.error.split('\n').slice(-2).join(' ')}</small>}</span>
              </div>)}
            </div>
          )}
          <p className="python-lab-footnote">{savedAt || 'Practice edits are autosaved in this browser.'} · Passing code checks does not automatically mark the ManuOS lesson as mastered. No Python libraries beyond the available browser runtime are guaranteed. Never paste secrets.</p>
        </div>
      )}
    </div>
  );
}
