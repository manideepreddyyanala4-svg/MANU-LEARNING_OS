"""Safety-conscious local/CI audit of the 24 authored Python roadmap lessons.

Checks every code example for syntax and executes each reference solution
against every independent practice check, using isolated subprocesses.
No project secrets, lab checkpoints, or user data are needed.
"""
from __future__ import annotations
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ["a", "b", "c"]
all_lessons = []

for part in FILES:
    path = ROOT / "lib" / f"python-roadmap-lessons-{part}.ts"
    source = path.read_text(encoding="utf-8")
    match = re.search(r"=\s*(\[[\s\S]*\]);\s*$", source)
    if not match:
        raise SystemExit(f"ERROR: malformed guided lesson data file: {path}")
    all_lessons.extend(json.loads(match.group(1)))

assert len(all_lessons) == 24, f"Expected 24 lessons, got {len(all_lessons)}"
assert [entry["id"] for entry in all_lessons] == [f"{n:02d}" for n in range(1, 25)]

checks_tested = 0
for lesson in all_lessons:
    name = lesson["id"]
    assert len(lesson["concepts"]) >= 3, name
    assert len(lesson["walkthrough"]) >= 3, name
    assert len(lesson["deeper"]) >= 1, name
    assert len(lesson["mistakes"]) >= 1, name
    assert len(lesson["recap"]) == 3, name
    assert len(lesson["quiz"]["choices"]) == 3, name
    assert lesson["quiz"]["correct"] in (0, 1, 2), name
    assert lesson["docs"].startswith(("https://docs.python.org/", "https://docs.pytest.org/")), name
    compile(lesson["example"], f"lesson-{name}-example", "exec")
    compile(lesson["solution"], f"lesson-{name}-solution", "exec")
    assert lesson["checks"], f"No independent checks for lesson {name}"

    lines = [lesson["solution"], "", "# Automated independent practice checks"]
    for check in lesson["checks"]:
        lines.append(check["code"])
        checks_tested += 1
    result = subprocess.run(
        [sys.executable, "-I", "-c", "\n".join(lines)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        timeout=8,
    )
    if result.returncode != 0:
        raise SystemExit(f"FAIL lesson {name} ({lesson['shortTitle']}):\n{result.stderr}")

print(f"PASS: {len(all_lessons)} guided lessons, {checks_tested} executable checks, 24 code examples.")
