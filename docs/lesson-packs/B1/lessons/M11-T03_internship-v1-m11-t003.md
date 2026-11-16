> Depth **L3** · about 15 minutes of study  
> Needs first: lesson 11.02 (Genuine versus impostor trials)

## UNDERSTAND

A **cosine score** says how similar two embeddings are on a scale of -1 to 1. It is a ranking number, not a probability and not a confidence. A score of 0.8 does **not** mean an 80% chance that two images match. What a score means depends on the population of scores it came from.

## MECHANISM

**Input:** a score and the distribution of impostor scores in the situation you care about.

**Processing:** to interpret a score, ask how often impostors reach that score (the false-accept rate there). A calibration method (for example learned from data) can map scores to probabilities, but only for the data it was fitted on.

**Output:** an error rate attached to a threshold, in a stated situation.

## WORKED EXAMPLE

The same cosine score 0.70 means different error rates when the impostor scores come from a different situation.

```python
import numpy as np

impostors_lab = np.array([0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80])   # situation A
impostors_shift = np.array([0.30, 0.40, 0.50, 0.60, 0.70, 0.75, 0.80, 0.85]) # situation B (harder)

t = 0.70
print("fraction of impostors scoring >= 0.70, situation A:", (impostors_lab >= t).mean())
print("fraction of impostors scoring >= 0.70, situation B:", (impostors_shift >= t).mean())
print("a score of 0.70 is the same number in both; its meaning is not")
```

Output:

```text
fraction of impostors scoring >= 0.70, situation A: 0.25
fraction of impostors scoring >= 0.70, situation B: 0.5
a score of 0.70 is the same number in both; its meaning is not
```

**What to notice:** The same threshold 0.70 admits 25% of impostors in situation A but 50% in situation B, because B's impostors score higher. The number 0.70 is identical; its meaning changed.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 states that source-calibrated thresholds must not be called target FAR guarantees, because distribution shift can change the achieved target FAR. This lesson is the toy version of that sentence.

## COMMON MISTAKES

- Reading 0.8 as '80% sure'.
- Reusing a threshold chosen in one setting (lab) in another (new session or new device) without rechecking error rates.
- Comparing scores from two different models directly.
- Reporting a score without the pair protocol that produced it.

## INTERVIEW CHECK

**Question:** Is a cosine score of 0.8 an 80% chance of a match?

**Short answer:** No. A cosine score ranks similarity; its error rate depends on the impostor and genuine score distributions, which change with the data.

**Independent exercise** (do it from a blank file, with no copying): Take two score distributions (toy normal draws) and show that a score of 0.7 maps to different error rates under two different impostor distributions.

**You are done when:** Two error rates for the same score computed and contrasted.
