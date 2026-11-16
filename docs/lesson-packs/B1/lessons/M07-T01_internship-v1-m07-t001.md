> Depth **L2** · about 10 minutes of study  
> Needs first: NumPy for images and embeddings: HWC/CHW/NCHW, RGB vs BGR, uint8, L2 norm, cosine (RM-SH10)

## UNDERSTAND

A digital image is a grid of numbers. Each number is one pixel. A grayscale pixel is one brightness value; a colour pixel is a few values. **Resolution** is how many pixels the grid has (width x height). It is not the physical size of the object. Every computer-vision step reads or changes this grid, and the most common beginner bug is mixing up (x, y) with [row, column].

## MECHANISM

**Input:** an image file or camera frame, decoded into an array.

**Processing:** NumPy stores a grayscale image as shape (height, width) and a colour image as (height, width, channels). You index it as `img[row, column]`, which is `img[y, x]`. The origin (0, 0) is the **top-left** corner and y grows **downward**. Cropping is slicing rows and columns; counting pixels is width x height.

**Output:** a value, a smaller array, or a changed array.

## WORKED EXAMPLE

A tiny 4-row by 6-column grayscale image. Rows come first in NumPy, but humans say (x, y) = (column, row).

```python
import numpy as np

img = np.zeros((4, 6), dtype=np.uint8)   # 4 rows (height), 6 columns (width)
height, width = img.shape
print("shape (rows, cols):", img.shape)
print("width x height:", width, "x", height)

x, y = 4, 1                # x = column, y = row
img[y, x] = 200            # NumPy index is [row, column] = [y, x]
print("pixel at x=4, y=1 ->", img[y, x])
print(img)
```

Output:

```text
shape (rows, cols): (4, 6)
width x height: 6 x 4
pixel at x=4, y=1 -> 200
[[  0   0   0   0   0   0]
 [  0   0   0   0 200   0]
 [  0   0   0   0   0   0]
 [  0   0   0   0   0   0]]
```

**What to notice:** The shape is (4, 6): 4 rows and 6 columns, so the width is 6 and the height is 4. The 200 written at x=4, y=1 appears in row 1, column 4 of the printed matrix.

Cropping uses the same row-first order. A crop that starts at column 2 and row 0 is img[0:3, 2:6].

```python
import numpy as np

img = np.arange(24, dtype=np.uint8).reshape(4, 6)
crop = img[0:3, 2:6]       # rows 0..2, columns 2..5
print("crop shape (rows, cols):", crop.shape)
print(crop)
print("640 x 480 image has", 640 * 480, "pixels")
```

Output:

```text
crop shape (rows, cols): (3, 4)
[[ 2  3  4  5]
 [ 8  9 10 11]
 [14 15 16 17]]
640 x 480 image has 307200 pixels
```

**What to notice:** Rows come first in the slice too: `img[0:3, 2:6]` gives 3 rows and 4 columns. A 640 x 480 image has 307,200 pixels.

**Link to the dorsal-hand project (documented facts only):** Hand landmarks arrive as normalized (x, y) fractions of the image width and height. To use them as pixels you compute x * width and y * height, then index the array as `[y, x]`. Mixing these orders is a classic ROI bug; practise on synthetic points only.

## COMMON MISTAKES

- Writing `img[x, y]`. NumPy wants `img[y, x]`. On a non-square image it can crash; on a square one it silently reads the wrong pixel.
- Reading `shape` as (width, height). It is (height, width). But OpenCV functions that take a *size* (`cv2.resize`, `cv2.warpPerspective`) want (width, height), the opposite order.
- Treating resolution as physical size. 640 x 480 says how many pixels, not how many millimetres.
- Cropping with `img[x1:x2, y1:y2]`. Rows (y) come first.

## INTERVIEW CHECK

**Question:** Is the shape of a 640x480 image (640, 480)?

**Short answer:** No. A 640 x 480 image (640 wide, 480 high) has shape (480, 640).

**Independent exercise** (do it from a blank file, with no copying): Create a 6x8 array, mark the pixel at x=5, y=2 and print its (row, col) index; resize notion: state shape for a 640x480 image.

**You are done when:** Coordinate conversion correct on 4 test points.
