"""Builds Batch B1 (19 lessons) from: lessons_m07.py / lessons_m11.py (prose), examples_m07.py / examples_m11.py (code),
and the hand-reviewed topic rows in the internship audit (08b_ROADMAP_TOPIC_LEVEL.csv).
Every code example is EXECUTED and its real output is embedded; prose numbers are guarded by 'expect' substrings.
Writes: lessons/*.md and b1_lesson_pack.json (format accepted by Study Now > Lesson preparation > import).
Usage: python build_b1.py <python-with-numpy-and-opencv> [audit-folder]
No credentials or database access are used."""
import csv, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from run_examples import run, EXAMPLES
from lessons_m07 import L as L07
from lessons_m11 import L as L11
import run_examples
if len(sys.argv) > 1: run_examples.PY = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
LESSONS = {**L07, **L11}
B1 = [f"M07-T{n:02d}" for n in list(range(1, 12)) + [16]] + [f"M11-T{n:02d}" for n in range(1, 8)]
key = lambda tid: f"internship-v1-m{tid[1:3]}-t{int(tid[-2:]):03d}"
rows, units = {}, {}


def load_audit():
    """The audit folder is needed only to BUILD the pack (not to validate it): 2nd CLI argument or MANU_AUDIT_DIR."""
    audit = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("MANU_AUDIT_DIR", "")
    if not audit or not os.path.isdir(audit):
        sys.exit("Give the internship_master_audit folder as the 2nd argument or set MANU_AUDIT_DIR")
    rows.update({r["topic_id"]: r for r in csv.DictReader(open(os.path.join(audit, "08b_ROADMAP_TOPIC_LEVEL.csv"), encoding="utf-8"))})
    units.update({r["topic_id"]: r["title"] for r in csv.DictReader(open(os.path.join(audit, "08_ROADMAP_TOPICS.csv"), encoding="utf-8"))})


def curriculum_titles():
    ts = open(os.path.join(ROOT, "lib", "internship-curriculum.ts"), encoding="utf-8").read(); out = {}
    for blk in re.split(r'\n  \{\n    "id": ', ts)[1:]:
        mid = re.match(r'"(\d\d)"', blk).group(1); body = blk.split('"topics": [', 1)[1].split("\n    ]", 1)[0]
        for i, m in enumerate(re.findall(r'^      (".*?"),?\s*$', body, flags=re.M)): out[(mid, i + 1)] = json.loads(m)
    return out


TITLES = curriculum_titles()
MODULE = {"07": "Digital images, OpenCV and image preprocessing", "11": "Verification, open-set recognition and scientific evaluation"}


def need(prereq):
    p = prereq.strip()
    if not p or p.startswith("NONE"): return "nothing in this batch"
    out = []
    for tok in re.split(r"[;, ]+", p):
        if re.match(r"M\d\d-T\d\d", tok): out.append(f"lesson {tok[1:3]}.{tok[-2:]} ({TITLES[(tok[1:3], int(tok[-2:]))]})")
        elif tok in units: out.append(f"{units[tok]} ({tok})")
        elif tok: out.append(tok)
    return "; ".join(out)


def clean(s):
    s = re.sub(r"\s+", " ", s).strip()
    return s if s.endswith((".", "?", "!")) else s + "."


def build():
    load_audit()
    pack, report = [], []
    for tid in B1:
        r, L = rows[tid], LESSONS[tid]
        assert r["review_status"] == "HAND_REVIEWED" and r["urgent_stage"] == "A1", tid
        title = TITLES[(tid[1:3], int(tid[-2:]))]; assert title == r["title"], (tid, title, r["title"])
        ex_md = []
        for eid, intro, code in EXAMPLES[tid]:
            rc, out, err = run(code)
            assert rc == 0, f"{tid}-{eid} failed: {err[:200]}"
            for needle in L["expect"].get(eid, []):
                assert needle in out, f"{tid}-{eid}: expected text not in real output: {needle!r}\n--- output ---\n{out}"
            report.append((tid, eid, len(out.splitlines())))
            ex_md.append(f"{intro}\n\n```python\n{code}\n```\n\nOutput:\n\n```text\n{out}\n```\n\n**What to notice:** {L['notice'][eid]}")
        mins = max(5, round(float(r["effort_hours"]) * 60 / 5) * 5)
        meta = (f"> Depth **{r['required_depth']}** · about {mins} minutes of study  \n"
                f"> Needs first: {need(r['prerequisites'])}")
        md = (f"{meta}\n\n## UNDERSTAND\n\n{L['understand']}\n\n## MECHANISM\n\n{L['mechanism'].replace(chr(10), chr(10) * 2)}\n\n## WORKED EXAMPLE\n\n" + "\n\n".join(ex_md) +
              "\n\n**Link to the dorsal-hand project (documented facts only):** " + L["dorsal"] +
              "\n\n## COMMON MISTAKES\n\n" + "\n".join(f"- {m}" for m in L["mistakes"]) +
              f"\n\n## INTERVIEW CHECK\n\n**Question:** {clean(r['interview_check'])}\n\n**Short answer:** {L['answer']}\n\n"
              f"**Independent exercise** (do it from a blank file, with no copying): {clean(r['independent_task'])}\n\n"
              f"**You are done when:** {clean(r['completion_criteria'])}\n")
        pack.append({"topic_key": key(tid), "topic_title": title, "content": md})
    return pack, report


if __name__ == "__main__":
    pack, report = build()
    os.makedirs(os.path.join(HERE, "lessons"), exist_ok=True)
    for tid, item in zip(B1, pack):
        open(os.path.join(HERE, "lessons", f"{tid}_{item['topic_key']}.md"), "w", encoding="utf-8", newline="\n").write(item["content"])
    json.dump({"lessons": pack}, open(os.path.join(HERE, "b1_lesson_pack.json"), "w", encoding="utf-8", newline="\n"), ensure_ascii=False, indent=2)
    print(f"built {len(pack)} lessons; {len(report)} examples executed; sizes (chars): min {min(len(p['content']) for p in pack)}, max {max(len(p['content']) for p in pack)}")
