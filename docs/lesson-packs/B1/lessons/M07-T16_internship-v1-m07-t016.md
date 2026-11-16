> Depth **L2** · about 15 minutes of study  
> Needs first: lesson 07.11 (Scharr, Laplacian, LoG and DoG)

## UNDERSTAND

**Histogram equalization** stretches an image's brightness values so they use the whole 0 to 255 range. It is global and can over-amplify noise. **CLAHE** (contrast-limited adaptive histogram equalization) does it on small tiles and **limits** the stretch (`clipLimit`), then blends the tiles. It improves local contrast with less noise amplification.

## MECHANISM

**Input:** a low-contrast grayscale image.

**Processing:** global equalization maps each brightness through the image's cumulative histogram. CLAHE splits the image into tiles (for example 4 x 4), equalizes each tile with its histogram clipped at the limit, and interpolates between tiles. For colour images apply it to the lightness channel only.

**Output:** an image with higher local contrast.

## WORKED EXAMPLE

A low-contrast noisy gradient. Compare global histogram equalization with CLAHE.

```python
import numpy as np, cv2

rng = np.random.default_rng(2)
base = np.tile(np.linspace(100, 140, 64), (64, 1))
img = np.clip(base + rng.normal(0, 2, base.shape), 0, 255).astype(np.uint8)

eq = cv2.equalizeHist(img)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4)).apply(img)

def noise(im):                        # spread inside a small flat-ish patch
    return round(float(im[0:6, 0:6].std()), 2)

for name, im in (("original", img), ("equalizeHist", eq), ("CLAHE 2.0", clahe)):
    print(f"{name:13s} min {im.min():3d}  max {im.max():3d}  patch noise {noise(im)}")
```

Output:

```text
original      min  93  max 145  patch noise 2.47
equalizeHist  min   0  max 255  patch noise 12.1
CLAHE 2.0     min  94  max 180  patch noise 7.35
```

**What to notice:** The original uses only 93 to 145. Global equalization stretches it to 0 to 255 and the small patch noise grows from 2.47 to 12.1. CLAHE with clipLimit 2.0 widens the range less (94 to 180) and the patch noise grows only to 7.35.

**Link to the dorsal-hand project (documented facts only):** CLAHE is documented as part of the dorsal preprocessing in audit file 04 ('changes local contrast; creates no new physiological measurements'), with the order and parameters for the current baseline unverified. Do not claim it makes the system illumination-proof.

## COMMON MISTAKES

- Equalizing a noisy image globally and being surprised that the noise becomes visible.
- Setting clipLimit very high, which removes the protection.
- Applying CLAHE to each RGB channel separately and shifting the colours; use the L channel of LAB.
- Believing contrast enhancement adds information. It only redistributes what is there.

## INTERVIEW CHECK

**Question:** Why can histogram equalization make noise worse and how does CLAHE limit it?

**Short answer:** Global equalization stretches the whole histogram, so noise in flat areas is stretched with it. CLAHE works per tile and clips the histogram, which limits that amplification.

**Independent exercise** (do it from a blank file, with no copying): Apply equalizeHist and CLAHE with clipLimit 2 and 5 to a low-contrast image; compare histograms and a noise measure; explain why CLAHE is local.

**You are done when:** Three outputs and metrics produced; CLAHE vs global difference explained.
