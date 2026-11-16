"""Checks that the internship audit's topic-level roadmap (08b) matches the live curriculum source (lib/internship-curriculum.ts).
Usage: python docs/lesson-packs/verify_audit_ids.py [path to internship_master_audit]
Read-only. Prints counts only."""
import csv, json, re, sys, os
AUDIT = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\manideepreddy\Desktop\Roadmap\internship_master_audit"
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
ts = open(os.path.join(ROOT, "lib", "internship-curriculum.ts"), encoding="utf-8").read()


def parse_curriculum(text):
    """Returns [(module_id, title, [topics])] from the TypeScript source (JSON-style literals)."""
    out = []
    for blk in re.split(r'\n  \{\n    "id": ', text)[1:]:
        mid = re.match(r'"(\d\d)"', blk).group(1)
        title = json.loads(re.search(r'"title": (".*?"),\n', blk).group(1))
        body = blk.split('"topics": [', 1)[1].split("\n    ]", 1)[0]
        topics = [json.loads(m) for m in re.findall(r'^      (".*?"),?\s*$', body, flags=re.M)]
        out.append((mid, title, topics))
    return out


mods = parse_curriculum(ts)
key = lambda m, i: f"internship-v1-m{m}-t{i:03d}"
site = {key(m, i + 1): t for m, _, ts_ in mods for i, t in enumerate(ts_)}
print("website modules:", len(mods), "| topics:", sum(len(t) for _, _, t in mods), "| unique keys:", len(site))
rows = list(csv.DictReader(open(os.path.join(AUDIT, "08b_ROADMAP_TOPIC_LEVEL.csv"), encoding="utf-8")))
mapped = [r for r in rows if r["topic_origin"].startswith("LEARNING_OS")]
bad = [r["topic_id"] for r in mapped if site.get(key(r["module"], int(r["topic_id"][-2:]))) != r["title"]]
print("08b rows mapped to Learning OS:", len(mapped), "| key/title mismatches vs live source:", len(bad), bad[:5])
print("website keys missing from 08b:", len(set(site) - {key(r["module"], int(r["topic_id"][-2:])) for r in mapped}))
inv = json.load(open(os.path.join(AUDIT, "_evidence", "curriculum_inventory.json"), encoding="utf-8"))
print("audit inventory identical to live source:", {key(m["id"], i + 1): t for m in inv for i, t in enumerate(m["topics"])} == site)
b1 = [r for r in mapped if (r["module"] == "07" and (int(r["topic_id"][-2:]) in set(range(1, 12)) | {16})) or (r["module"] == "11" and int(r["topic_id"][-2:]) <= 7)]
print("B1 topics:", len(b1), "| hand-reviewed:", sum(r["review_status"] == "HAND_REVIEWED" for r in b1), "| stages:", sorted({r["urgent_stage"] for r in b1}))
plan = open(os.path.join(AUDIT, "10_LESSON_BATCH_PLAN.md"), encoding="utf-8").read()
print("10_LESSON_BATCH_PLAN names B1 = M07 t01–t11,t16 + M11 t01–t07 (19 topics):", "M07 t01–t11,t16" in plan and "M11 t01–t07" in plan and "| 19 |" in plan)
ok = not bad and len(mapped) == len(site) == 595 and len(b1) == 19
print("RESULT:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
