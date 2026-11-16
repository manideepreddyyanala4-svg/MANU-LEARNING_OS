"""Runnable worked examples for Module 11 lessons (verification metrics). Synthetic toy scores only: none of these numbers
come from the dorsal-hand research. Each entry: (example id, short intro, code)."""
E = {
"M11-T01": [
("a", "L2-normalize 3 random 8-dimensional vectors (fixed seed). After normalization the dot product equals cosine similarity.",
"""import numpy as np

rng = np.random.default_rng(0)
e = rng.normal(size=(3, 8))                      # three embeddings
norm = np.linalg.norm(e, axis=1, keepdims=True)
u = e / norm                                     # unit-length versions

print("norms before:", norm.ravel().round(2))
print("norms after: ", np.linalg.norm(u, axis=1).round(6))

cos = (e[0] @ e[1]) / (norm[0, 0] * norm[1, 0])  # cosine from the raw vectors
print("cosine from raw vectors:     ", round(float(cos), 4))
print("dot product of unit vectors: ", round(float(u[0] @ u[1]), 4))
print("equal:", bool(np.isclose(cos, u[0] @ u[1])))"""),
],
"M11-T02": [
("a", "4 fabricated identities with 3 samples each. Count every pair of samples and label it genuine or impostor.",
"""from itertools import combinations

samples = [(person, shot) for person in "ABCD" for shot in (1, 2, 3)]   # 12 samples
pairs = list(combinations(samples, 2))                                  # unordered pairs
genuine = [p for p in pairs if p[0][0] == p[1][0]]
impostor = [p for p in pairs if p[0][0] != p[1][0]]

print("samples:", len(samples))
print("all pairs n(n-1)/2 =", len(pairs))
print("genuine pairs :", len(genuine))
print("impostor pairs:", len(impostor))
print("one genuine pair:", genuine[0], "| one impostor pair:", impostor[0])"""),
],
"M11-T03": [
("a", "The same cosine score 0.70 means different error rates when the impostor scores come from a different situation.",
"""import numpy as np

impostors_lab = np.array([0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80])   # situation A
impostors_shift = np.array([0.30, 0.40, 0.50, 0.60, 0.70, 0.75, 0.80, 0.85]) # situation B (harder)

t = 0.70
print("fraction of impostors scoring >= 0.70, situation A:", (impostors_lab >= t).mean())
print("fraction of impostors scoring >= 0.70, situation B:", (impostors_shift >= t).mean())
print("a score of 0.70 is the same number in both; its meaning is not")"""),
],
"M11-T04": [
("a", "A 1:1 verification rule on toy scores: accept when score >= threshold. Sweep the threshold and read off both error rates.",
"""import numpy as np

genuine = np.array([0.90, 0.80, 0.75, 0.60, 0.55, 0.40, 0.85, 0.70, 0.65, 0.50])
impostor = np.array([0.10, 0.20, 0.30, 0.35, 0.45, 0.50, 0.25, 0.40, 0.55, 0.15])

def accept(score, t):
    return score >= t                                  # the verification rule

print(" t    FAR   FRR")
for t in (0.30, 0.40, 0.50, 0.60):
    far = accept(impostor, t).mean()                   # impostors wrongly accepted
    frr = 1 - accept(genuine, t).mean()                # genuines wrongly rejected
    print(f"{t:.2f}  {far:.2f}  {frr:.2f}")

ok = [t for t in (0.30, 0.40, 0.50, 0.60, 0.70) if accept(impostor, t).mean() <= 0.10]
print("smallest threshold with FAR <= 10% on this toy set:", ok[0])"""),
],
"M11-T05": [
("a", "FAR, FRR and TAR at threshold 0.50 on the same toy scores, with the counts behind each denominator.",
"""import numpy as np

genuine = np.array([0.90, 0.80, 0.75, 0.60, 0.55, 0.40, 0.85, 0.70, 0.65, 0.50])
impostor = np.array([0.10, 0.20, 0.30, 0.35, 0.45, 0.50, 0.25, 0.40, 0.55, 0.15])
t = 0.50

fa = int((impostor >= t).sum())      # false accepts
ta = int((genuine >= t).sum())       # true accepts
print(f"false accepts: {fa} of {impostor.size} impostor comparisons "
      f"-> FAR = {fa / impostor.size:.2f}")
print(f"true accepts:  {ta} of {genuine.size} genuine comparisons   "
      f"-> TAR = {ta / genuine.size:.2f}")
print(f"FRR = 1 - TAR = {1 - ta / genuine.size:.2f}")"""),
],
"M11-T06": [
("a", "Find the Equal Error Rate on the toy scores: sweep every score as a threshold, then interpolate where FAR and FRR cross.",
"""import numpy as np

genuine = np.array([0.90, 0.80, 0.75, 0.60, 0.55, 0.40, 0.85, 0.70, 0.65, 0.50])
impostor = np.array([0.10, 0.20, 0.30, 0.35, 0.45, 0.50, 0.25, 0.40, 0.55, 0.15])

ts = np.unique(np.concatenate([genuine, impostor]))
far = np.array([(impostor >= t).mean() for t in ts])
frr = np.array([(genuine < t).mean() for t in ts])
for t, a, r in zip(ts, far, frr):
    print(f"t={t:.2f}  FAR={a:.2f}  FRR={r:.2f}")

i = int(np.argmax(far <= frr))               # first t where FAR <= FRR
x0, x1 = i - 1, i
d0, d1 = far[x0] - frr[x0], far[x1] - frr[x1]
w = d0 / (d0 - d1)
eer = far[x0] + w * (far[x1] - far[x0])
print("EER by linear interpolation:", round(float(eer), 3))"""),
],
"M11-T07": [
("a", "TAR at a fixed FAR on synthetic scores (1,000 impostor and 1,000 genuine), then what happens when the impostor scores shift upward.",
"""import numpy as np

rng = np.random.default_rng(0)
genuine = rng.normal(0.70, 0.12, 1000)
impostor = rng.normal(0.20, 0.10, 1000)

t = np.quantile(impostor, 0.99)               # FAR about 1% on THIS set
far = (impostor >= t).mean()
tar = (genuine >= t).mean()
r = lambda v: round(float(v), 3)         # rounding is for display only
print("threshold:", r(t), "| FAR:", r(far), "| TAR:", r(tar))

shifted = impostor + 0.05                     # a harder, shifted impostor population
print("same threshold, shifted impostors -> FAR:", round(float((shifted >= t).mean()), 3))"""),
],
}
