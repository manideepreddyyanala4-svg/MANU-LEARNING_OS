"""Verify that every code-only Python lesson runs without syntax or runtime errors."""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
cards = {}
for part in "abc":
    text = (ROOT / "lib" / f"python-roadmap-code-{part}.ts").read_text(encoding="utf-8")
    match = re.search(r"=\s*(\{[\s\S]*\});\s*$", text)
    assert match, f"Invalid code cards file {part}"
    cards.update(json.loads(match.group(1)))

assert set(cards) == {f"{i:02d}" for i in range(1, 25)}
count = 0
executed = 0
for number, lessons in sorted(cards.items()):
    assert len(lessons) >= 3, f"Lesson {number} missing subtopics"
    anchors = [x["anchor"] for x in lessons]
    assert len(set(anchors)) == len(anchors), f"Duplicate anchors in {number}"
    for item in lessons:
        count += 1
        assert item["label"] and item["explanation"] and item["code"]
        if item.get("language") == "bash":
            continue
        code = item["code"]
        compile(code, f"{number}-{item['anchor']}", "exec")
        with tempfile.TemporaryDirectory() as workdir:
            (Path(workdir) / "notes.txt").write_text("Text saved in notes.txt", encoding="utf-8")
            run = subprocess.run([sys.executable, "-I", "-c", code],
                                 cwd=workdir, capture_output=True, text=True, timeout=10)
            if run.returncode:
                raise AssertionError(f"Lesson {number}, {item['anchor']} failed:\n{run.stderr}")
        executed += 1
assert count == 94, count
for name in ("for-loop", "while-loop", "break", "continue", "nested-loops", "while-continue"):
    assert name in [item["anchor"] for item in cards["05"]], name
print(f"PASS: {count} code and explanation sections, {executed} runnable Python examples, all critical loop types present.")
