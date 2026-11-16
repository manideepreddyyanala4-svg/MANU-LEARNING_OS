> Depth **L2** · about 10 minutes of study  
> Needs first: lesson 07.01 (Pixels, image coordinates, width/height and resolution)

## UNDERSTAND

A colour image stores several numbers per pixel. **RGB** means red, green, blue. **OpenCV loads images as BGR**, the reverse order. **Grayscale** keeps one brightness number. **HSV** describes colour as hue (which colour), saturation (how strong) and value (how bright), which makes colour thresholds easier. Wrong channel order gives wrong colours without any error message.

## MECHANISM

**Input:** an array with 3 channels.

**Processing:** reversing the last axis (`img[:, :, ::-1]`) swaps BGR and RGB. `cv2.cvtColor` applies a formula: gray is a weighted sum (green counts most, blue least). In OpenCV's HSV for 8-bit images, hue runs 0 to 179, saturation and value 0 to 255.

**Output:** an array in the new colour space.

## WORKED EXAMPLE

OpenCV stores colour as B, G, R. Pure blue is [255, 0, 0] in BGR. Convert it to RGB, gray and HSV.

```python
import numpy as np, cv2

blue = np.array([[[255, 0, 0]]], dtype=np.uint8)      # one pixel, BGR order
print("BGR:", blue[0, 0], "-> RGB:", blue[:, :, ::-1][0, 0])
print("gray:", cv2.cvtColor(blue, cv2.COLOR_BGR2GRAY)[0, 0])
print("HSV of blue:", cv2.cvtColor(blue, cv2.COLOR_BGR2HSV)[0, 0])

red = np.array([[[0, 0, 255]]], dtype=np.uint8)
print("HSV of red: ", cv2.cvtColor(red, cv2.COLOR_BGR2HSV)[0, 0])
```

Output:

```text
BGR: [255   0   0] -> RGB: [  0   0 255]
gray: 29
HSV of blue: [120 255 255]
HSV of red:  [  0 255 255]
```

**What to notice:** Pure blue is `[255 0 0]` in BGR and becomes `[0 0 255]` in RGB. Its gray value is only 29 because the blue weight is small. In HSV blue has hue 120 and red has hue 0 (half of the usual 0-360 degrees).

**Link to the dorsal-hand project (documented facts only):** Audit file 04 notes that OpenCV arrays are BGR while display and model conventions may need RGB, and that a legacy (R-G)/(R+G+eps) value is only an RGB channel difference, not an NIR-based NDVI and not proof of vein isolation. Keep that wording honest.

## COMMON MISTAKES

- Showing an OpenCV image with matplotlib without converting BGR to RGB. Faces turn blue.
- Assuming hue is 0-360. In OpenCV 8-bit images it is 0-179.
- Converting to gray and expecting equal weights. Green dominates.
- Forgetting that `cv2.imread` returns BGR while PyTorch pretrained models usually expect RGB.

## INTERVIEW CHECK

**Question:** Why do colors look wrong when you show an OpenCV image with matplotlib?

**Short answer:** Matplotlib assumes RGB but OpenCV gives BGR, so red and blue are swapped. Convert with `cv2.cvtColor(img, cv2.COLOR_BGR2RGB)` or `img[:, :, ::-1]`.

**Independent exercise** (do it from a blank file, with no copying): Load or build an image, swap BGR<->RGB with slicing and cvtColor, and show both give the same array; threshold a hue range in HSV.

**You are done when:** Both conversions equal; wrong-color display reproduced.
