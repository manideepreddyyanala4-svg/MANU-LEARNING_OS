> Depth **L2** · about 15 minutes of study  
> Needs first: lesson 07.10 (Sobel X/Y, gradients and edge orientation)

## UNDERSTAND

**Second-derivative** filters respond to change *of* change. The **Laplacian** finds blobs and edges in all directions. **LoG** is a Gaussian blur followed by a Laplacian. **DoG (difference of Gaussians)** is a fast approximation: blur with a small sigma, blur with a large sigma, subtract. The result is a **band-pass** filter: it removes very slow changes (like uneven lighting) and very fine noise, and keeps mid-sized structure.

## MECHANISM

**Input:** an image.

**Processing:** G1 = Gaussian(image, sigma 1), G2 = Gaussian(image, sigma 3), DoG = G1 - G2. Slow gradients appear almost equally in G1 and G2 and cancel. A small bright dot is spread more by G2 than by G1, so the difference is positive at the dot.

**Output:** a map that is near zero on smooth backgrounds and non-zero on mid-scale detail.

## WORKED EXAMPLE

DoG = Gaussian(small sigma) - Gaussian(large sigma). A slow brightness ramp is removed; a small bright dot stays.

```python
import numpy as np, cv2

ramp = np.tile(np.linspace(0, 100, 64, dtype=np.float32), (64, 1))   # slow illumination change
img = ramp.copy()
img[32, 32] += 50                                                    # small bright detail

g_small = cv2.GaussianBlur(img, (0, 0), 1)
g_large = cv2.GaussianBlur(img, (0, 0), 3)
dog = g_small - g_large

print("image value range:    ", round(float(img.min()), 1), "to", round(float(img.max()), 1))
print("DoG on the plain ramp:", round(float(dog[16, 16]), 3), "(near 0)")
print("DoG at the dot:       ", round(float(dog[32, 32]), 3))
print("Laplacian at the dot: ", round(float(cv2.Laplacian(img, cv2.CV_32F)[32, 32]), 1))
```

Output:

```text
image value range:     0.0 to 100.8
DoG on the plain ramp: 0.0 (near 0)
DoG at the dot:        7.074
Laplacian at the dot:  -200.0
```

**What to notice:** The image is a smooth 0-to-100 ramp with one small bright dot. On the plain ramp the DoG is 0.0; at the dot it is 7.074, so the background cancelled and the dot remained. The Laplacian at the dot is -200: the dot is 50 brighter than its surroundings and the Laplacian kernel multiplies the centre by -4 (-4 x 50), so a bright peak gives a negative value.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 documents DoG and CLAHE as part of the dorsal preprocessing, but the order and parameters for the current baseline are **not verified**, and DoG 'creates no new physiological measurement'. Say what the filter does mathematically and call the parameters unverified.

## COMMON MISTAKES

- Using sigmas that are too close, giving a near-zero output; the second sigma is usually 2 to 4 times the first.
- Forgetting the result has negative values; scale it before saving as uint8.
- Subtracting in the wrong order and flipping the sign of everything.
- Claiming DoG 'removes illumination effects' in general; here it only removed a perfectly smooth ramp.

## INTERVIEW CHECK

**Question:** What does DoG do to an image and why is it used before a CNN?

**Short answer:** It is a band-pass filter: it subtracts a heavily blurred copy from a lightly blurred copy, removing slow lighting changes and keeping mid-size detail.

**Independent exercise** (do it from a blank file, with no copying): Compute DoG = Gaussian(sigma1) - Gaussian(sigma2) on a noisy image with two sigma pairs; show it removes slow illumination and keeps mid-frequency detail (print variance before/after).

**You are done when:** Two sigma pairs compared numerically; effect described; dorsal use stated only as documented (04: DoG/CLAHE ordering and parameters unverified for the current baseline).
