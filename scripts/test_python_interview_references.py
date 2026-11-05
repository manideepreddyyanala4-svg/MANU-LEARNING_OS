"""Test the code and displayed results of all 62 Python interview snippets."""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
groups = {}
for suffix in "ab":
    source = (root / "lib" / f"python-interview-examples-{suffix}.ts").read_text(encoding="utf-8")
    match = re.search(r"export const pythonInterviewExamples[A-B]: Record<string,PythonCodeExample\[\]>=(\{[\s\S]*\});\s*$", source)
    assert match, f"Malformed example file {suffix}"
    groups.update(json.loads(match.group(1)))

assert set(groups) == {f"{i:02d}" for i in range(1, 21)}
total = 0
for module, cards in sorted(groups.items()):
    assert len(cards) >= 2, module
    assert len({x["anchor"] for x in cards}) == len(cards), module
    for card in cards:
        assert card["label"] and card["code"] and card["explanation"]
        compile(card["code"], f"interview-{module}-{card['anchor']}", "exec")
        with tempfile.TemporaryDirectory() as tmp:
            result = subprocess.run([sys.executable, "-I", "-c", card["code"]],
                                    cwd=tmp, capture_output=True, text=True, timeout=10)
        assert result.returncode == 0, f"{module}/{card['anchor']}: {result.stderr}"
        assert result.stdout.strip() == card["output"].strip(), (
            f"{module}/{card['anchor']}: {result.stdout!r} != {card['output']!r}"
        )
        total += 1
assert total == 62, total
print(f"PASS: 20 topics, {total} code examples executed and outputs matched.")
