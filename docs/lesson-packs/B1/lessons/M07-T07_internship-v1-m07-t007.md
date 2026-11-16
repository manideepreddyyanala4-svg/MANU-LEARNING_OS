> Depth **L2** · about 15 minutes of study  
> Needs first: Digital images: pixels, channels, bit depth, histograms, resampling, noise (RM-CV01)

## UNDERSTAND

A **kernel** is a small grid of weights. **Filtering** slides it over the image; at each position it multiplies the neighbours by the weights and adds them up. This is **convolution** (strictly, OpenCV's `filter2D` does cross-correlation, which is the same for symmetric kernels). Near the border some neighbours do not exist, so a **border mode** decides what to use.

## MECHANISM

**Input:** an image and a kernel, for example a 3 x 3 mean kernel (nine weights of 1/9).

**Processing:** for each pixel, take the 3 x 3 window, multiply by the weights, sum. At the border, pad the image: zeros (`BORDER_CONSTANT`), mirrored pixels (`BORDER_REFLECT_101`, the default for most OpenCV filters), or repeated edge pixels.

**Output:** an image of the same size, each pixel a weighted average of its neighbourhood.

## WORKED EXAMPLE

A 3x3 mean filter by hand at one interior pixel and one corner pixel, checked against OpenCV.

```python
import numpy as np, cv2

a = np.arange(1, 26, dtype=np.float32).reshape(5, 5)      # values 1..25
k = np.ones((3, 3), np.float32) / 9                       # mean kernel

centre = a[1:4, 1:4].mean()                               # window around (row 2, col 2)
print("hand centre:", centre, "| OpenCV:", cv2.filter2D(a, -1, k)[2, 2])

pad = np.pad(a, 1, mode="reflect")                        # what "reflect_101" border does
corner_hand = round(float(pad[0:3, 0:3].mean()), 3)
reflect = cv2.BORDER_REFLECT_101
corner_cv = round(float(cv2.filter2D(a, -1, k, borderType=reflect)[0, 0]), 3)
corner_zero = cv2.filter2D(a, -1, k, borderType=cv2.BORDER_CONSTANT)[0, 0]
print("corner, reflect (hand):", corner_hand, "| OpenCV:", corner_cv)
print("corner, zero border:   ", round(float(corner_zero), 3))
```

Output:

```text
hand centre: 13.0 | OpenCV: 13.0
corner, reflect (hand): 5.0 | OpenCV: 5.0
corner, zero border:    1.778
```

**What to notice:** At the centre the hand average of the window is 13.0 and OpenCV agrees. At the corner, a reflect border gives 5.0 (matching `np.pad` in reflect mode) but a zero border gives 1.778 because the missing neighbours count as 0 and drag the average down.

**Link to the dorsal-hand project (documented facts only):** After the ROI is cut out, smoothing and edge filters operate on it. Because the ROI crop has borders, the border mode affects the outermost pixels the network sees.

## COMMON MISTAKES

- Ignoring the border. Corners can be wrong or dark with a zero border.
- Using integer kernels on uint8 images and overflowing; use float32 or normalize the kernel.
- Forgetting to normalize a smoothing kernel (weights should sum to 1).
- Believing `filter2D` flips the kernel; it does not, so asymmetric kernels behave unexpectedly.

## INTERVIEW CHECK

**Question:** What happens at the image border during filtering?

**Short answer:** The window hangs outside the image, so a border mode must invent the missing values. The choice (zeros, reflect, replicate) changes the border pixels.

**Independent exercise** (do it from a blank file, with no copying): Hand-convolve a 5x5 array with a 3x3 mean kernel at one interior and one border pixel; confirm with filter2D under two border modes.

**You are done when:** Hand values equal filter2D at both pixels.
