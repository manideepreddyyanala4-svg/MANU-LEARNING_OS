> Depth **L2** · about 15 minutes of study  
> Needs first: lesson 07.07 (Kernels, filtering, convolution and border modes)

## UNDERSTAND

Three basic smoothers: the **mean** filter averages the window, the **Gaussian** filter averages with centre-heavy weights, and the **median** filter takes the middle value. Mean and Gaussian are linear and blur edges; the median is non-linear and removes isolated outliers without blurring them into neighbours.

## MECHANISM

**Input:** a noisy image.

**Processing:** mean: sum of the window divided by its size. Gaussian: weights from a bell curve controlled by sigma (the 3 x 3 version uses 1-2-1 / 2-4-2 / 1-2-1 divided by 16). Median: sort the window values and pick the middle one.

**Output:** a smoothed image. Larger windows smooth more and blur more.

## WORKED EXAMPLE

One bright outlier ('salt') in a flat patch. See what each filter does at the centre pixel.

```python
import numpy as np, cv2

img = np.full((5, 5), 100, dtype=np.uint8)
img[2, 2] = 255                                   # one salt pixel

print("original centre:", img[2, 2])
print("mean (3x3):     ", cv2.blur(img, (3, 3))[2, 2])
print("gaussian (3x3): ", cv2.GaussianBlur(img, (3, 3), 0)[2, 2])
print("median (3x3):   ", cv2.medianBlur(img, 3)[2, 2])
print("neighbour of the centre after mean:  ", cv2.blur(img, (3, 3))[2, 3], "(was 100)")
print("neighbour of the centre after median:", cv2.medianBlur(img, 3)[2, 3])
```

Output:

```text
original centre: 255
mean (3x3):      117
gaussian (3x3):  139
median (3x3):    100
neighbour of the centre after mean:   117 (was 100)
neighbour of the centre after median: 100
```

**What to notice:** One bright outlier (255) in a flat patch of 100. The mean filter spreads it: the centre becomes 117 and a neighbour that was 100 also becomes 117. Gaussian leaves 139 at the centre. The median returns 100 for both: the outlier is gone and nothing else changed.

**Link to the dorsal-hand project (documented facts only):** Which smoother to use before a later step is a documented preprocessing choice. Describe what the filter does to noise and edges, not that it 'improves recognition'.

## COMMON MISTAKES

- Using mean or Gaussian blur to remove salt-and-pepper noise. The outlier smears into neighbours.
- Using an even window size; OpenCV needs odd sizes.
- Setting sigma to 0 and not knowing OpenCV then derives it from the window size.
- Blurring before an edge detector without checking that the edges you need still exist.

## INTERVIEW CHECK

**Question:** Which filter would you choose for salt-and-pepper noise?

**Short answer:** Median. It ignores extreme values, so a black or white pixel does not contaminate its neighbours.

**Independent exercise** (do it from a blank file, with no copying): Apply all three to a noisy image; compute MSE vs the clean image and report which wins on Gaussian vs salt-pepper noise.

**You are done when:** MSE table of 3 filters x 2 noise types produced.
