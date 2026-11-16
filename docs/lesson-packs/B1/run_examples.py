"""Executes every worked example and prints its output (used while authoring and by the validator).
Usage: python run_examples.py [python-executable-with-numpy-and-opencv]"""
import os, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from examples_m07 import E as E07
from examples_m11 import E as E11
EXAMPLES = {**E07, **E11}
PY = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else sys.executable


def run(code, timeout=60):
    with tempfile.TemporaryDirectory() as d:
        f = os.path.join(d, "ex.py")
        open(f, "w", encoding="utf-8").write(code)
        r = subprocess.run([PY, "-I", f], capture_output=True, text=True, encoding="utf-8", timeout=timeout, cwd=d)
    return r.returncode, r.stdout.replace("\r\n", "\n").rstrip("\n"), r.stderr.strip()


if __name__ == "__main__":
    n = bad = 0
    for tid, items in EXAMPLES.items():
        for eid, intro, code in items:
            rc, out, err = run(code); n += 1
            if rc != 0: bad += 1
            print(f"=== {tid}-{eid} (exit {rc})\n{out}" + (f"\nSTDERR: {err[:300]}" if err else ""))
    print(f"\n{n} examples run, {bad} failed")
    sys.exit(1 if bad else 0)
