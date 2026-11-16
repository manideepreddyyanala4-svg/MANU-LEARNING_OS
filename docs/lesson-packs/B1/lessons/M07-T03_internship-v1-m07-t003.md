> Depth **L2** · about 10 minutes of study  
> Needs first: lesson 07.02 (RGB, BGR, grayscale and HSV)

## UNDERSTAND

A **uint8** pixel holds a whole number from 0 to 255 (8 bits, 256 levels). That limited range is the **dynamic range**. Arithmetic that leaves the range either **wraps around** (NumPy) or **saturates** (OpenCV `cv2.add`). Float images usually use 0.0 to 1.0. Choosing the right type avoids silent errors.

## MECHANISM

**Input:** a uint8 array and a number to add.

**Processing:** NumPy `a + b` on uint8 computes modulo 256, so 250 + 10 becomes 4. `cv2.add` clips at 255. The safe pattern is: widen to int16 or float32, compute, `np.clip` to 0..255, convert back to uint8.

**Output:** values still inside the valid range.

## WORKED EXAMPLE

uint8 can only hold 0 to 255. NumPy wraps around; OpenCV saturates at 255.

```python
import numpy as np, cv2

a = np.array([[250, 255]], dtype=np.uint8)
b = np.full_like(a, 10)
print("a + b with NumPy (wraps):  ", a + b)
print("cv2.add(a, b) (saturates): ", cv2.add(a, b))

# the safe pattern: widen first, then clip, then go back to uint8
safe = np.clip(a.astype(np.int16) + b, 0, 255).astype(np.uint8)
print("int16 + clip:              ", safe)
print("float32 in [0,1]:          ", (a.astype(np.float32) / 255).round(3))
```

Output:

```text
a + b with NumPy (wraps):   [[4 9]]
cv2.add(a, b) (saturates):  [[255 255]]
int16 + clip:               [[255 255]]
float32 in [0,1]:           [[0.98 1.  ]]
```

**What to notice:** With NumPy, 250 + 10 gives 4 and 255 + 10 gives 9: bright pixels turn dark. `cv2.add` and the int16-then-clip pattern both give 255. Dividing by 255 maps 0..255 to 0..1.

**Link to the dorsal-hand project (documented facts only):** Images are H x W x C uint8 until they are converted to floating point and C x H x W tensors for a network (audit file 04). The conversion order (scale, then normalize) is exactly where overflow bugs hide.

## COMMON MISTAKES

- Using `+` on uint8 images to brighten them. Bright areas wrap to dark.
- Subtracting uint8 images and getting huge numbers (0 - 1 wraps to 255).
- Forgetting to convert back to uint8 before saving or displaying a float image.
- Dividing a uint8 array by 255 in place; the result is float and the dtype changes.

## INTERVIEW CHECK

**Question:** What is the difference between a+b and cv2.add(a,b) for uint8?

**Short answer:** NumPy wraps modulo 256 (250 + 10 = 4). `cv2.add` saturates at 255.

**Independent exercise** (do it from a blank file, with no copying): Add two uint8 images with + and cv2.add and show different results; convert to float32 [0,1] and back with rounding.

**You are done when:** Saturation vs wraparound shown on one pixel.
