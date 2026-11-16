> Depth **L3** · about 20 minutes of study  
> Needs first: lesson 11.04 (1:1 verification and thresholding)

## UNDERSTAND

The core verification metrics are rates over pairs. **FAR (false accept rate)**, also written FMR, is the fraction of *impostor* comparisons wrongly accepted. **FRR (false reject rate)**, also FNMR, is the fraction of *genuine* comparisons wrongly rejected. **TAR (true accept rate)** is the fraction of genuine comparisons accepted, so TAR = 1 - FRR. Always say what the denominator is.

## MECHANISM

**Input:** genuine scores, impostor scores, a threshold.

**Processing:** FAR = (impostors with score >= t) / (number of impostor comparisons). TAR = (genuines with score >= t) / (number of genuine comparisons). FRR = 1 - TAR.

**Output:** three numbers, each with a stated denominator. One-to-many identification uses different rates (FPIR and TPIR) and must not be mixed with these.

## WORKED EXAMPLE

FAR, FRR and TAR at threshold 0.50 on the same toy scores, with the counts behind each denominator.

```python
import numpy as np

genuine = np.array([0.90, 0.80, 0.75, 0.60, 0.55, 0.40, 0.85, 0.70, 0.65, 0.50])
impostor = np.array([0.10, 0.20, 0.30, 0.35, 0.45, 0.50, 0.25, 0.40, 0.55, 0.15])
t = 0.50

fa = int((impostor >= t).sum())      # false accepts
ta = int((genuine >= t).sum())       # true accepts
print(f"false accepts: {fa} of {impostor.size} impostor comparisons "
      f"-> FAR = {fa / impostor.size:.2f}")
print(f"true accepts:  {ta} of {genuine.size} genuine comparisons   "
      f"-> TAR = {ta / genuine.size:.2f}")
print(f"FRR = 1 - TAR = {1 - ta / genuine.size:.2f}")
```

Output:

```text
false accepts: 2 of 10 impostor comparisons -> FAR = 0.20
true accepts:  9 of 10 genuine comparisons   -> TAR = 0.90
FRR = 1 - TAR = 0.10
```

**What to notice:** At threshold 0.50: 2 of 10 impostor comparisons are accepted, so FAR = 0.20. 9 of 10 genuine comparisons are accepted, so TAR = 0.90 and FRR = 0.10.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 records that one-to-many FPIR/TPIR count search events and cannot substitute for one-to-one FAR/TAR, and that evaluate_threshold reports denominators. Practise on toy scores like these, not on research data.

## COMMON MISTAKES

- Dividing false accepts by the wrong total, for example by all comparisons instead of impostor comparisons.
- Quoting a rate without its denominator (2 of 10 and 200 of 1,000 are very different evidence).
- Mixing FAR with FPIR (search events).
- Confusing TAR (a rate over genuine pairs) with accuracy.

## INTERVIEW CHECK

**Question:** Define FAR and TAR with their denominators.

**Short answer:** FAR = false accepts / impostor comparisons. TAR = accepted genuine / genuine comparisons. FRR = 1 - TAR. Each must be quoted with its denominator.

**Independent exercise** (do it from a blank file, with no copying): Compute FAR, FRR, TAR at t=0.5 on the toy score set by hand and with a function; state each denominator.

**You are done when:** Hand and code values equal; denominators written for each number.
