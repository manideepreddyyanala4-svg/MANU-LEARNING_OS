"""Validates the shipped B1 lesson pack (b1_lesson_pack.json) as the importer would receive it.
Re-executes every Python block found INSIDE the JSON content and compares it with the embedded output.
Usage: python validate_b1.py <python-with-numpy-and-opencv>      (read-only; no network; no credentials)"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import run_examples
if len(sys.argv) > 1: run_examples.PY = sys.argv[1]
from build_b1 import B1, TITLES, key
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
pack = json.load(open(os.path.join(HERE, "b1_lesson_pack.json"), encoding="utf-8"))
res = []
def chk(name, ok, detail=""): res.append(ok); print(("PASS " if ok else "FAIL ") + name + (" — " + str(detail) if detail else ""))

items = pack["lessons"]
valid = {f"internship-v1-m{m}-t{i:03d}" for (m, i) in TITLES}
want = [key(t) for t in B1]
chk("exactly 19 lessons", len(items) == 19, len(items))
chk("topic keys are exactly the approved B1 set (M07 t01-t11,t16; M11 t01-t07), in order", [x["topic_key"] for x in items] == want)
chk("topic keys unique", len({x["topic_key"] for x in items}) == 19)
chk("every key exists in the live curriculum (595 keys)", all(x["topic_key"] in valid for x in items) and len(valid) == 595)
chk("topic_title equals the live curriculum title for each key", all(x["topic_title"] == TITLES[(x["topic_key"][15:17], int(x["topic_key"][-3:]))] for x in items))
# importer rules (components/study-now/lesson-preparation.tsx): nonempty array, string keys/content, known + unique keys, nonempty content, <= 40,000 chars
chk("importer rules: strings, non-empty, <= 40,000 characters", all(isinstance(x["topic_key"], str) and isinstance(x["content"], str) and x["content"].strip() and len(x["content"]) <= 40000 for x in items), f"max {max(len(x['content']) for x in items)} chars")
SEC = ["## UNDERSTAND", "## MECHANISM", "## WORKED EXAMPLE", "## COMMON MISTAKES", "## INTERVIEW CHECK"]
def sections_ok(c): pos = [c.find("\n" + s + "\n") for s in SEC]; return all(p >= 0 for p in pos) and pos == sorted(pos) and all(c.count(s) == 1 for s in SEC)
chk("all five sections present once, in order (UNDERSTAND, MECHANISM, WORKED EXAMPLE, COMMON MISTAKES, INTERVIEW CHECK)", all(sections_ok("\n" + x["content"]) for x in items))
chk("Markdown fences balanced; no raw HTML tags (the renderer skips HTML)", all(x["content"].count("```") % 2 == 0 and not re.search(r"<\/?[a-zA-Z][^>]*>", re.sub(r"```.*?```", "", x["content"], flags=re.S)) for x in items))
chk("no secrets, e-mail addresses or links", not any(re.search(r"@[A-Za-z0-9.-]+\.[a-z]{2,}|https?://|supabase|eyJ[A-Za-z0-9_-]{20,}|password", x["content"], re.I) for x in items))
n_blocks = n_ok = 0; bad = []; maxline = 0
for x in items:
    blocks = re.findall(r"```python\n(.*?)\n```\n\nOutput:\n\n```text\n(.*?)\n```", x["content"], flags=re.S)
    code_blocks = x["content"].count("```python")
    if len(blocks) != code_blocks: bad.append((x["topic_key"], "python block without Output block"))
    for code, out in blocks:
        n_blocks += 1; compile(code, x["topic_key"], "exec"); maxline = max(maxline, max(len(l) for l in code.split("\n")))
        rc, got, err = run_examples.run(code)
        if rc == 0 and got == out.replace("\r\n", "\n"): n_ok += 1
        else: bad.append((x["topic_key"], "output differs" if rc == 0 else err[:100]))
chk(f"all {n_blocks} Python examples inside the pack execute and reproduce their embedded output exactly", n_blocks == 22 and n_ok == n_blocks and not bad, f"{n_ok}/{n_blocks} {bad[:3]}")
chk("every coding lesson has at least one executed example (19 of 19)", all("```python" in x["content"] for x in items))
chk("exercise and completion criteria taken from the hand-reviewed audit rows present in every lesson", all("**Independent exercise**" in x["content"] and "**You are done when:**" in x["content"] for x in items))
ALLOWED = {"04", "256", "512", "224", "1", "0.1"}
def dorsal_digits_ok(c):
    m = re.search(r"\*\*Link to the dorsal-hand project[^\n]*", c); nums = set(re.findall(r"\d+(?:\.\d+)?", re.sub(r"uint8", "", m.group(0)))) if m else set()
    return m is not None and nums <= ALLOWED
chk("dorsal-project paragraphs contain no result figures (only documented dimensions and the file number)", all(dorsal_digits_ok(x["content"]) for x in items))
chk(f"code lines short enough for phones (longest {maxline} chars)", maxline <= 100, maxline)
print(f"\n{sum(res)}/{len(res)} checks passed"); sys.exit(0 if all(res) else 1)
