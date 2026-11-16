> Depth **L1** · about 15 minutes of study  
> Needs first: lesson 07.08 (Mean, Gaussian and median filtering)

## UNDERSTAND

Plain smoothing blurs edges because it averages across them. The **bilateral filter** averages only pixels that are both close in space *and* similar in brightness, so it smooths flat regions but leaves strong edges. **Non-local means** goes further and averages similar patches from anywhere in the image. Both are slower than a Gaussian. This lesson is about understanding the idea (depth L1), not tuning it.

## MECHANISM

**Input:** a noisy image.

**Processing:** each pixel becomes a weighted average of its neighbours. The weight has two parts: a spatial part (nearby pixels count more, as in Gaussian) and a range part (pixels with very different brightness count almost zero). Across an edge the range part is tiny, so the other side of the edge is ignored.

**Output:** a smoothed image with preserved edges. Cost grows with window size.

## WORKED EXAMPLE

A noisy step edge (60 on the left, 200 on the right). Compare how much of the edge, and how much of the noise, survives Gaussian vs bilateral smoothing.

```python
import numpy as np, cv2

rng = np.random.default_rng(1)
img = np.full((20, 20), 60, dtype=np.uint8)
img[:, 10:] = 200
noisy = np.clip(img + rng.normal(0, 8, img.shape), 0, 255).astype(np.uint8)

gauss = cv2.GaussianBlur(noisy, (9, 9), 3)
bilat = cv2.bilateralFilter(noisy, 9, 50, 3)

def edge_jump(im):                       # step across the edge (true jump: 140)
    return round(float(im[10, 10]) - float(im[10, 9]), 1)

def flat_noise(im):                      # spread inside a flat region, away from the edge
    return round(float(im[:, 0:5].std()), 2)

for name, im in (("noisy", noisy), ("gaussian", gauss), ("bilateral", bilat)):
    print(f"{name:9s} edge jump {edge_jump(im):6.1f}   flat-region noise {flat_noise(im)}")
```

Output:

```text
noisy     edge jump  147.0   flat-region noise 7.86
gaussian  edge jump   22.0   flat-region noise 0.84
bilateral edge jump  138.0   flat-region noise 1.21
```

**What to notice:** True edge jump is 140. Gaussian smoothing reduces the measured jump to 22 (edge destroyed) while noise falls to 0.84. The bilateral filter keeps the jump at 138 and still cuts noise from 7.86 to 1.21.

**Link to the dorsal-hand project (documented facts only):** No documented use in the dorsal pipeline is claimed here. It is a useful comparison point when you explain why DoG or CLAHE were chosen instead.

## COMMON MISTAKES

- Expecting bilateral to be as fast as Gaussian. It is much slower on large images.
- Choosing very large sigma values, which flatten texture and give a cartoon look.
- Assuming it removes salt-and-pepper noise; outliers are 'different', so they keep their own value.
- Treating it as always better. If you want to remove edges, Gaussian is fine.

## INTERVIEW CHECK

**Question:** How does a bilateral filter preserve edges?

**Short answer:** It weights neighbours by both distance and brightness difference, so pixels on the other side of an edge get almost no weight and the edge stays sharp.

**Independent exercise** (do it from a blank file, with no copying): Apply cv2.bilateralFilter to a step-edge image with noise and report edge sharpness vs Gaussian blur at equal smoothing (measure gradient at the edge).

**You are done when:** Edge gradient values compared; one-sentence conclusion.
