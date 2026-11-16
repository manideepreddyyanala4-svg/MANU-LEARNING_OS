> Depth **L3** · about 20 minutes of study  
> Needs first: lesson 11.03 (Cosine score is not a calibrated probability)

## UNDERSTAND

**1:1 verification** answers: 'is this sample the identity it claims to be?' You compute a similarity score against the claimed identity and **accept if the score is at least a threshold**. Raising the threshold accepts fewer impostors but rejects more genuine users. The threshold must be chosen on development data, never on the test data you report.

## MECHANISM

**Input:** genuine scores, impostor scores, a threshold t.

**Processing:** rule: accept if score >= t. FAR = fraction of impostor scores accepted. FRR = fraction of genuine scores rejected. Sweep t over candidate values and tabulate both.

**Output:** a table of (threshold, FAR, FRR) and a chosen operating point that meets a requirement, for example FAR <= 10%.

## WORKED EXAMPLE

A 1:1 verification rule on toy scores: accept when score >= threshold. Sweep the threshold and read off both error rates.

```python
import numpy as np

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
print("smallest threshold with FAR <= 10% on this toy set:", ok[0])
```

Output:

```text
 t    FAR   FRR
0.30  0.60  0.00
0.40  0.40  0.00
0.50  0.20  0.10
0.60  0.00  0.30
smallest threshold with FAR <= 10% on this toy set: 0.6
```

**What to notice:** As the threshold rises from 0.30 to 0.60, FAR falls from 0.60 to 0.00 and FRR rises from 0.00 to 0.30. On this toy set 0.6 is the smallest tested threshold with FAR at most 10%.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 describes an evaluation-only target rule: thresholds are set on development or source data, applied frozen to held-out target data, and denominators are reported. Do not tune thresholds against current target dorsal evaluation data.

## COMMON MISTAKES

- Choosing the threshold on the same test set you then report results on (leakage).
- Using > when the rule is >= (matters at ties).
- Optimizing one error without stating the other.
- Forgetting that a threshold depends on the model and the data.

## INTERVIEW CHECK

**Question:** How do you choose a verification threshold without leaking test data?

**Short answer:** Fix the threshold on a separate development set (for example for a target FAR), then apply it unchanged to the held-out test set and report the resulting FAR and TAR.

**Independent exercise** (do it from a blank file, with no copying): Given 10 genuine and 10 impostor toy scores write accept(score, t); sweep t over unique scores and list (FAR, FRR); pick t for FAR <= 10% on the toy set.

**You are done when:** Table of thresholds produced; selection rule stated as development-only.
