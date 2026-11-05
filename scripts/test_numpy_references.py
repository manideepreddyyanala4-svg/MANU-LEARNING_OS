"""Verify all public NumPy lesson examples against their displayed output.

Test metadata and actual Python execution, never user data.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
modules = {}
for part in "abc":
    source = (root / "lib" / f"numpy-examples-{part}.ts").read_text(encoding="utf-8")
    found = re.search(
        r"export const numpyExamples[A-C]: Record<string, PythonCodeExample\[\]> = (\{[\s\S]*\});\s*$",
        source,
    )
    assert found is not None, f"Failed to read NumPy source file: {part}"
    modules.update(json.loads(found.group(1)))

expected_ids = {f"{i:02d}" for i in range(1, 22)}
assert set(modules) == expected_ids, "21 original NumPy roadmap topics must be represented"

checked = 0
for topic_id, examples in sorted(modules.items()):
    assert len(examples) >= 3, f"Not enough examples for topic {topic_id}"
    anchors = [example["anchor"] for example in examples]
    assert len(set(anchors)) == len(anchors), f"Duplicate links in topic {topic_id}"
    for example in examples:
        assert example["label"] and example["code"] and example["output"]
        steps = example["explanation"].split("\n")
        assert len(steps) == 3 and all(x.strip() for x in steps), (
            f"Need exactly 3 simple explanations: {topic_id}/{example['anchor']}"
        )
        code = example["code"]
        compile(code, f"numpy-{topic_id}-{example['anchor']}", "exec")
        with tempfile.TemporaryDirectory() as folder:
            result = subprocess.run(
                [sys.executable, "-I", "-c", code],
                cwd=folder, capture_output=True, text=True, timeout=12
            )
        assert result.returncode == 0, (
            f"Runtime failure {topic_id}/{example['anchor']}: {result.stderr}"
        )
        assert result.stdout.strip() == example["output"].strip(), (
            f"Wrong displayed output {topic_id}/{example['anchor']}\n"
            f"Expected: {example['output']!r}\nActual: {result.stdout!r}"
        )
        checked += 1

assert checked == 83, f"Expected 83 NumPy code examples, received {checked}"
for key in ("hwc-to-chw", "chw-to-nchw", "bgr-to-rgb", "cosine-similarity", "zero-vector-guard", "numpy-pipeline-proof"):
    assert any(item["anchor"] == key for cards in modules.values() for item in cards), key

print(f"PASS: {len(modules)} NumPy topics, {checked} executable code blocks, outputs and 3-step explanations verified.")
