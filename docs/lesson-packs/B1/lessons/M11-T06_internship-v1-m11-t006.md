> Depth **L3** · about 15 minutes of study  
> Needs first: lesson 11.05 (FAR/FMR versus FRR/FNMR and TAR)

## UNDERSTAND

The **Equal Error Rate (EER)** is the point where FAR equals FRR. It is a single number that summarizes how well genuine and impostor scores separate; lower is better. It is **not** an operating point you deploy: it hides which error you can afford, and with discrete scores it has to be interpolated.

## MECHANISM

**Input:** genuine and impostor scores.

**Processing:** use every distinct score as a threshold; compute FAR and FRR at each. Find where FAR drops from above FRR to below it, and **linearly interpolate** between those two thresholds to estimate the crossing. Ties can make the empirical FAR and FRR at the returned threshold differ from the interpolated EER.

**Output:** one EER value and the table behind it.

## WORKED EXAMPLE

Find the Equal Error Rate on the toy scores: sweep every score as a threshold, then interpolate where FAR and FRR cross.

```python
import numpy as np

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
print("EER by linear interpolation:", round(float(eer), 3))
```

Output:

```text
t=0.10  FAR=1.00  FRR=0.00
t=0.15  FAR=0.90  FRR=0.00
t=0.20  FAR=0.80  FRR=0.00
t=0.25  FAR=0.70  FRR=0.00
t=0.30  FAR=0.60  FRR=0.00
t=0.35  FAR=0.50  FRR=0.00
t=0.40  FAR=0.40  FRR=0.00
t=0.45  FAR=0.30  FRR=0.10
t=0.50  FAR=0.20  FRR=0.10
t=0.55  FAR=0.10  FRR=0.20
t=0.60  FAR=0.00  FRR=0.30
t=0.65  FAR=0.00  FRR=0.40
t=0.70  FAR=0.00  FRR=0.50
t=0.75  FAR=0.00  FRR=0.60
t=0.80  FAR=0.00  FRR=0.70
t=0.85  FAR=0.00  FRR=0.80
t=0.90  FAR=0.00  FRR=0.90
EER by linear interpolation: 0.15
```

**What to notice:** FAR is above FRR up to t=0.50 (0.20 vs 0.10) and below it at t=0.55 (0.10 vs 0.20). Interpolating between those two thresholds gives an EER of 0.15, a value that no single tested threshold produces exactly.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 notes that the metric code uses an interpolated EER that can differ from the empirical FAR/FRR at the returned threshold when scores tie, and that EER is not an application threshold chosen on target test data.

## COMMON MISTAKES

- Reporting EER as if it were the rate you would see at a deployed threshold.
- Picking the threshold that minimizes EER on the test set.
- Forgetting that with few scores the EER is coarse; quote the pair counts.
- Mixing a legacy EER function (grid based) with an interpolated one without saying which.

## INTERVIEW CHECK

**Question:** Why is EER not enough to deploy a verifier?

**Short answer:** EER summarizes separation but hides the trade-off: a real system needs a specific FAR or FRR, and the EER threshold may be wrong for that.

**Independent exercise** (do it from a blank file, with no copying): Compute EER on the toy set by sweeping thresholds and linear interpolation; show FAR and FRR at the nearest empirical threshold and explain the gap.

**You are done when:** EER computed two ways; difference explained.
