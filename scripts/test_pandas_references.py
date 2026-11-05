"""Check all 20 Pandas / dataset / Excel roadmap lessons before release."""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
modules = {}
for part in "abc":
    text = (root / "lib" / f"pandas-examples-{part}.ts").read_text(encoding="utf-8")
    match = re.search(
        r"export const pandasExamples[A-C]: Record<string, PythonCodeExample\\[\\]> = (\\{[\\s\\S]*\\});\\s*$",
        text,
    )
    assert match, f"Could not parse Pandas learning examples {part}"
    parsed = json.loads(match.group(1))
    modules.update(parsed)

expected = {f"{i:02d}" for i in range(1, 21)}
assert set(modules) == expected, "Original 20 roadmap modules must all be covered"
checked = 0
for module, cards in sorted(modules.items()):
    assert len(cards) >= 3, f"Too few cards for {module}"
    anchors = [card["anchor"] for card in cards]
    assert len(anchors) == len(set(anchors)), f"Duplicate link in {module}"
    for card in cards:
        assert card["code"] and card["label"] and card["output"]
        steps = card["explanation"].split("\\n")
        assert len(steps) == 3 and all(step.strip() for step in steps), (
            f"Expected 3 short steps in {module}/{card['anchor']}"
        )
        compile(card["code"], f"pandas-{module}-{card['anchor']}", "exec")
        with tempfile.TemporaryDirectory() as workdir:
            result = subprocess.run(
                [sys.executable, "-I", "-c", card["code"]],
                cwd=workdir,
                capture_output=True, text=True, timeout=20,
            )
        assert result.returncode == 0, (
            f"Runtime failure {module}/{card['anchor']}: {result.stderr}"
        )
        assert result.stdout.strip() == card["output"].strip(), (
            f"Wrong output {module}/{card['anchor']}\n"
            f"Expected: {card['output']!r}\nActual: {result.stdout!r}"
        )
        checked += 1

assert checked == 78, f"Expected 78 code examples, got {checked}"
for required in ("read-csv", "read-excel", "join-multiplication", "identity-leakage",
                 "excel-formulas", "plot-confusion", "train-only-normalization"):
    assert any(c["anchor"] == required for rows in modules.values() for c in rows)
print(f"PASS: {len(modules)} complete Pandas topics, {checked} executable examples, matched outputs and 3-step explanations.")
