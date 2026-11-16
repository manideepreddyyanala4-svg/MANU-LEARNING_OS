> Depth **L3** · about 20 minutes of study  
> Needs first: lesson 11.06 (Equal Error Rate and interpolation caveats)

## UNDERSTAND

Security-minded systems usually fix an acceptable **FAR** (for example 1% or 0.1%) and then ask for the **TAR at that FAR**. The threshold is set to hit the FAR on a *development* set. When the data changes (new session, device or lighting), the achieved FAR can move even though the threshold did not. Very low FAR targets also need many impostor pairs to measure at all.

## MECHANISM

**Input:** development impostor scores, genuine scores, a target FAR.

**Processing:** threshold = the (1 - target FAR) quantile of impostor scores. TAR = fraction of genuine scores at or above it. Then apply the same threshold to a different impostor population and recompute FAR.

**Output:** (threshold, FAR, TAR), plus the shifted FAR as a check.

## WORKED EXAMPLE

TAR at a fixed FAR on synthetic scores (1,000 impostor and 1,000 genuine), then what happens when the impostor scores shift upward.

```python
import numpy as np

rng = np.random.default_rng(0)
genuine = rng.normal(0.70, 0.12, 1000)
impostor = rng.normal(0.20, 0.10, 1000)

t = np.quantile(impostor, 0.99)               # FAR about 1% on THIS set
far = (impostor >= t).mean()
tar = (genuine >= t).mean()
r = lambda v: round(float(v), 3)         # rounding is for display only
print("threshold:", r(t), "| FAR:", r(far), "| TAR:", r(tar))

shifted = impostor + 0.05                     # a harder, shifted impostor population
print("same threshold, shifted impostors -> FAR:", round(float((shifted >= t).mean()), 3))
```

Output:

```text
threshold: 0.426 | FAR: 0.01 | TAR: 0.984
same threshold, shifted impostors -> FAR: 0.037
```

**What to notice:** On 1,000 synthetic impostor scores the 99th percentile threshold is 0.426, giving FAR 0.01 and TAR 0.984. If the impostor scores shift up by only 0.05, the same threshold now accepts 3.7% of impostors, not 1%.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 reports October source-calibrated 1% and 0.1% FMR settings for a source-only model and warns they are not target FAR guarantees. That is exactly the shifted-impostor effect shown here, on synthetic numbers.

## COMMON MISTAKES

- Reporting TAR at a FAR that was tuned on the test data.
- Claiming 'FAR 0.1%' from a few hundred impostor pairs: 0.1% of 500 is half a pair.
- Assuming the development FAR holds on new data.
- Reporting TAR without the FAR (or the reverse).

## INTERVIEW CHECK

**Question:** Why can a threshold set for 1% FAR on source data give a different FAR on target data?

**Short answer:** Because the impostor score distribution moved. A threshold calibrated on one population does not guarantee the same FAR on another, so the achieved FAR must be measured and reported.

**Independent exercise** (do it from a blank file, with no copying): On a toy set with 1,000 impostor scores find the threshold for FAR <= 1% and report TAR; then shift impostor scores by +0.05 and report the new FAR.

**You are done when:** Threshold, TAR and shifted FAR computed; 04's statement on source-calibrated thresholds cited.
