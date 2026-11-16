> Depth **L2** · about 15 minutes of study  
> Needs first: lesson 07.09 (Bilateral and non-local means - intuition)

## UNDERSTAND

An **edge** is a place where brightness changes quickly. The **gradient** measures that change: how fast and in which direction. **Sobel** filters estimate the gradient in x (gx) and y (gy). Combine them to get the edge **magnitude** (strength) and **orientation** (direction). Edge maps feed contour finding, alignment and many classic CV steps.

## MECHANISM

**Input:** a grayscale image (use float32 so negative values are kept).

**Processing:** Sobel X is a 3 x 3 kernel that subtracts the left column from the right column (with the middle row weighted double). Sobel Y does the same top to bottom. Then magnitude = sqrt(gx^2 + gy^2) and angle = arctan2(gy, gx).

**Output:** gx and gy maps, magnitude and orientation maps.

## WORKED EXAMPLE

Sobel on a vertical edge: the image is 0 on the left and 100 on the right.

```python
import numpy as np, cv2

img = np.zeros((5, 6), dtype=np.float32)
img[:, 3:] = 100                                       # vertical edge between columns 2 and 3

gx = cv2.Sobel(img, cv2.CV_32F, 1, 0, ksize=3)         # responds to left-right change
gy = cv2.Sobel(img, cv2.CV_32F, 0, 1, ksize=3)         # responds to up-down change
print("gx middle row:", gx[2].tolist())
print("gy middle row:", gy[2].tolist())
mag = np.sqrt(gx ** 2 + gy ** 2)
print("magnitude at the edge (row 2, col 2):", mag[2, 2])
print("angle at the edge (degrees):", round(float(np.degrees(np.arctan2(gy[2, 2], gx[2, 2]))), 1))
```

Output:

```text
gx middle row: [0.0, 0.0, 400.0, 400.0, 0.0, 0.0]
gy middle row: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
magnitude at the edge (row 2, col 2): 400.0
angle at the edge (degrees): 0.0
```

**What to notice:** The image jumps from 0 to 100 between columns 2 and 3. Sobel X responds with 400 on the two columns next to the edge (1 + 2 + 1 = 4 rows of weight times 100) and 0 elsewhere; Sobel Y is 0 everywhere because nothing changes vertically. The angle is 0 degrees: the gradient points left to right.

**Link to the dorsal-hand project (documented facts only):** Edge strength and orientation are the building blocks for landmark-based alignment and for explaining what DoG and CLAHE do to local structure. Describe them as measured gradients, not as 'veins'.

## COMMON MISTAKES

- Running Sobel on a uint8 image with depth uint8, which clips negative responses to 0 and loses half of the edges. Use `cv2.CV_32F`.
- Mixing up the axes: Sobel X (dx=1) detects *vertical* edges.
- Forgetting to blur noisy images first, so noise looks like edges.
- Displaying the raw output without normalizing it to 0..255.

## INTERVIEW CHECK

**Question:** What does Sobel X respond to?

**Short answer:** Vertical edges, that is, brightness changes from left to right.

**Independent exercise** (do it from a blank file, with no copying): Apply Sobel X/Y to a synthetic vertical-edge image; confirm gradient x is large and y ~0; compute magnitude and orientation at an edge pixel.

**You are done when:** Predicted responses match; orientation of 0 or pi at a vertical edge explained.
