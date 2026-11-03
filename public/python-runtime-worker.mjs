// ManuOS Python Lab: run student code inside a dedicated, disposable browser worker.
// The Python runtime is fetched only when the student first presses Run.
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.mjs";

let interpreterPromise;
const MAX_OUTPUT = 30000;
function interpreter() {
  if (!interpreterPromise) {
    interpreterPromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/"
    }).catch((error) => {
      interpreterPromise = undefined;
      throw error;
    });
  }
  return interpreterPromise;
}
function friendlyError(error) {
  return String(error?.message || error || "Unknown Python error").slice(0, 6000);
}
self.onmessage = async (event) => {
  const { id, source, checks = [], stdin = "" } = event.data || {};
  if (!id || typeof source !== "string") return;
  let scope;
  const started = performance.now();
  const stdout = [];
  const stderr = [];
  let chars = 0;
  const capture = (into) => (line) => {
    const value = String(line);
    if (chars + value.length <= MAX_OUTPUT) {
      into.push(value);
      chars += value.length;
    } else if (chars <= MAX_OUTPUT) {
      into.push("[Output truncated]");
      chars = MAX_OUTPUT + 1;
    }
  };
  try {
    self.postMessage({ id, type: "status", label: "Loading Python runtime..." });
    const py = await interpreter();
    self.postMessage({ id, type: "status", label: "Preparing packages..." });
    const testCode = checks.map((test) => test.code).join("\n");
    await py.loadPackagesFromImports(source + "\n" + testCode);
    const lines = String(stdin).split(/\r?\n/);
    let inputIndex = 0;
    py.setStdin({ stdin: () => inputIndex < lines.length ? lines[inputIndex++] : undefined });
    py.setStdout({ batched: capture(stdout) });
    py.setStderr({ batched: capture(stderr) });
    const dict = py.globals.get("dict");
    scope = dict();
    dict.destroy();
    self.postMessage({ id, type: "status", label: "Running Python..." });
    try {
      await py.runPythonAsync(source, { globals: scope });
    } catch (error) {
      self.postMessage({
        id, type: "result", output: stdout.join("\n"),
        error: friendlyError(error) + (stderr.length ? "\n" + stderr.join("\n") : ""),
        checks: [], duration: Math.round(performance.now() - started)
      });
      return;
    }
    const results = [];
    for (const test of checks) {
      try {
        await py.runPythonAsync(test.code, { globals: scope });
        results.push({ name: test.name, passed: true, error: "" });
      } catch (error) {
        results.push({ name: test.name, passed: false, error: friendlyError(error) });
      }
    }
    self.postMessage({
      id, type: "result", output: stdout.join("\n"),
      error: stderr.join("\n"), checks: results,
      duration: Math.round(performance.now() - started)
    });
  } catch (error) {
    self.postMessage({
      id, type: "result", output: stdout.join("\n"),
      error: "Python runtime error: " + friendlyError(error), checks: [],
      duration: Math.round(performance.now() - started)
    });
  } finally {
    try { scope?.destroy(); } catch { /* already released */ }
  }
};
