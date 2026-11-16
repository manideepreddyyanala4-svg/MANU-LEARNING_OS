> Depth **L2** · about 10 minutes of study  
> Needs first: lesson 07.03 (Bit depth, uint8 and dynamic range)

## UNDERSTAND

A **histogram** counts how many pixels have each brightness value. **Brightness** shifts all values up or down; **contrast** spreads them apart. A simple linear change is `out = alpha * x + beta`. **Gamma** changes brightness non-linearly: gamma below 1 lifts dark areas, gamma above 1 darkens them. Histograms show at a glance if an image uses its range.

## MECHANISM

**Input:** an image.

**Processing:** count values with `np.bincount`. Contrast stretch: multiply by alpha (spread) and add beta (shift), then clip to 0..255. Gamma: `255 * (x/255) ** gamma`, usually applied once through a 256-entry lookup table.

**Output:** a new image whose histogram is wider (stretch) or shifted (gamma).

## WORKED EXAMPLE

Histogram, contrast stretch (alpha * x + beta) and gamma on a small low-contrast image.

```python
import numpy as np

img = np.array([[100, 110, 120],
                [105, 115, 130]], dtype=np.uint8)
print("min, max:", img.min(), img.max(), "| mean:", img.mean())
counts = np.bincount(img.ravel(), minlength=256)
print("non-empty histogram bins:", {int(v): int(counts[v]) for v in np.nonzero(counts)[0]})

alpha, beta = 4.0, -380.0          # stretch 100..130 onto about 20..140
stretched = np.clip(alpha * img.astype(np.float32) + beta, 0, 255).astype(np.uint8)
print("after alpha=4, beta=-380:", stretched.tolist())
print("min, max:", stretched.min(), stretched.max())
```

Output:

```text
min, max: 100 130 | mean: 113.33333333333333
non-empty histogram bins: {100: 1, 105: 1, 110: 1, 115: 1, 120: 1, 130: 1}
after alpha=4, beta=-380: [[20, 60, 100], [40, 80, 140]]
min, max: 20 140
```

**What to notice:** The six pixels use only values 100 to 130, a narrow band. With alpha 4 and beta -380 they spread to 20 to 140.

Gamma correction with a lookup table: gamma below 1 brightens dark pixels more than bright ones.

```python
import numpy as np

levels = np.array([16, 64, 128, 200], dtype=np.float32)
for gamma in (0.5, 1.0, 2.0):
    out = (255 * (levels / 255) ** gamma).round().astype(int)
    print(f"gamma {gamma}:", out.tolist())
```

Output:

```text
gamma 0.5: [64, 128, 181, 226]
gamma 1.0: [16, 64, 128, 200]
gamma 2.0: [1, 16, 64, 157]
```

**What to notice:** Gamma 0.5 lifts 16 to 64 and 64 to 128, so dark values gain the most; gamma 2.0 pushes 128 down to 64. Gamma 1.0 changes nothing.

**Link to the dorsal-hand project (documented facts only):** Contrast and gamma are the vocabulary for describing lighting differences between indoor and outdoor captures. Audit file 04 documents CLAHE and DoG as preprocessing, but the exact order and parameters for the current baseline are not verified, so describe them as 'documented, parameters unverified'.

## COMMON MISTAKES

- Expecting brightness and contrast to be the same thing. Beta shifts; alpha spreads.
- Forgetting to clip, so values above 255 wrap in uint8.
- Applying gamma to a 0..255 image without scaling to 0..1 first.
- Judging an image by eye instead of looking at its histogram.

## INTERVIEW CHECK

**Question:** What does gamma < 1 do to dark regions?

**Short answer:** Gamma below 1 raises dark pixels much more than bright ones (16 becomes 64 at gamma 0.5), so shadow detail becomes visible.

**Independent exercise** (do it from a blank file, with no copying): Compute a 256-bin histogram of a low-contrast image, apply alpha/beta and gamma 0.5 and 2.0, and compare histograms numerically.

**You are done when:** Histograms before/after printed; direction of change predicted correctly.
