> Depth **L2** · about 10 minutes of study  
> Needs first: lesson 07.05 (Sampling, resampling and interpolation)

## UNDERSTAND

**Noise** is random error added to pixel values. **Gaussian noise** nudges every pixel a little (sensor noise). **Salt-and-pepper noise** sets a few pixels to pure black or white (dead pixels, transmission errors). JPEG compression adds blocky artefacts. Noise matters because edge detectors and thresholds react to it strongly.

## MECHANISM

**Input:** a clean image and a noise model.

**Processing:** Gaussian: add random numbers from a normal distribution (sigma = typical size of the error), then clip. Salt-and-pepper: choose a fraction of pixels at random and set them to 0 or 255. Measure damage with **MSE**, the mean of squared differences from the clean image.

**Output:** a noisy image and a number describing how far it is from the clean one.

## WORKED EXAMPLE

Add Gaussian noise (sigma 10) and salt-and-pepper noise (2%) to a flat gray image, with a fixed seed, and measure the error against the clean image.

```python
import numpy as np

rng = np.random.default_rng(0)
clean = np.full((50, 50), 120, dtype=np.uint8)

gauss = np.clip(clean + rng.normal(0, 10, clean.shape), 0, 255).astype(np.uint8)

sp = clean.copy()
r = rng.random(clean.shape)
sp[r < 0.01] = 0            # pepper
sp[r > 0.99] = 255          # salt

mse = lambda a, b: float(np.mean((a.astype(float) - b.astype(float)) ** 2))
print("Gaussian MSE:        ", round(mse(gauss, clean), 1))
print("salt-pepper MSE:     ", round(mse(sp, clean), 1))
print("pixels changed (S&P):", int((sp != clean).sum()), "of", clean.size)
```

Output:

```text
Gaussian MSE:         100.1
salt-pepper MSE:      290.2
pixels changed (S&P): 44 of 2500
```

**What to notice:** With a fixed seed the run is repeatable. Gaussian noise with sigma 10 gives an MSE of about 100 (roughly sigma squared). Only 44 of 2,500 pixels were changed by salt-and-pepper, yet its MSE is higher (290) because each changed pixel is far wrong.

**Link to the dorsal-hand project (documented facts only):** Real captures differ in lighting and sensor noise between sessions. Audit file 04 treats indoor/outdoor and cross-session differences as a source of error to explain, not something to claim away; noise is one concrete cause you can describe.

## COMMON MISTAKES

- Not fixing the random seed, so results change every run.
- Forgetting to clip after adding noise to uint8, which wraps values.
- Comparing noise levels by eye instead of MSE or standard deviation.
- Using a mean filter on salt-and-pepper noise (a median filter is better).

## INTERVIEW CHECK

**Question:** Why is median filtering good against salt-and-pepper noise?

**Short answer:** Median filtering ignores extreme outliers because it picks the middle value of the window, so isolated black or white pixels disappear without smearing.

**Independent exercise** (do it from a blank file, with no copying): Add Gaussian (sigma 10) and salt-pepper (2%) noise to an image with a fixed seed; compute MSE against the original for each.

**You are done when:** Two MSE values computed and reproducible with the seed.
