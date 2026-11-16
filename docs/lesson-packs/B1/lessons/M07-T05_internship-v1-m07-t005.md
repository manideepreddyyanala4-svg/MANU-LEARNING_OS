> Depth **L2** · about 10 minutes of study  
> Needs first: lesson 07.04 (Histogram, contrast, brightness and gamma)

## UNDERSTAND

**Resampling** changes the number of pixels. Shrinking throws information away; enlarging has to **invent** values. **Interpolation** is the rule used to decide those values: nearest-neighbour copies the closest pixel, linear blends neighbours, area averages the source pixels. Shrinking a detailed pattern with the wrong rule creates **aliasing** (false patterns).

## MECHANISM

**Input:** an image and a target size (width, height).

**Processing:** for each output pixel, map back to a position in the source. Nearest takes one source pixel. Linear blends the 4 closest. `INTER_AREA` averages all source pixels covered by the output pixel.

**Output:** an image of the new size.

## WORKED EXAMPLE

Shrink a 1-pixel checkerboard from 4x4 to 2x2. Nearest-neighbour just picks pixels; INTER_AREA averages them.

```python
import numpy as np, cv2

img = np.array([[0, 255, 0, 255],
                [255, 0, 255, 0],
                [0, 255, 0, 255],
                [255, 0, 255, 0]], dtype=np.uint8)
nearest = cv2.resize(img, (2, 2), interpolation=cv2.INTER_NEAREST)
area = cv2.resize(img, (2, 2), interpolation=cv2.INTER_AREA)
print("nearest:\n", nearest)
print("area:\n", area)
```

Output:

```text
nearest:
 [[0 0]
 [0 0]]
area:
 [[128 128]
 [128 128]]
```

**What to notice:** The 1-pixel checkerboard shrunk to 2 x 2: nearest gives all 0 (it happened to pick black pixels), area gives 128 everywhere (the true average). Nearest produced a wrong picture.

Upsampling invents values. Enlarge a 2x2 image to 4x4 two ways.

```python
import numpy as np, cv2

small = np.array([[0, 100], [200, 255]], dtype=np.uint8)
print("nearest:\n", cv2.resize(small, (4, 4), interpolation=cv2.INTER_NEAREST))
print("linear:\n", cv2.resize(small, (4, 4), interpolation=cv2.INTER_LINEAR))
```

Output:

```text
nearest:
 [[  0   0 100 100]
 [  0   0 100 100]
 [200 200 255 255]
 [200 200 255 255]]
linear:
 [[  0  25  75 100]
 [ 50  72 117 139]
 [150 167 200 216]
 [200 214 241 255]]
```

**What to notice:** Enlarging 2 x 2 to 4 x 4: nearest makes blocks; linear makes smooth in-between values such as 25, 50 and 72 that were not in the original.

**Link to the dorsal-hand project (documented facts only):** Images are resized to a fixed network input (the legacy loader in audit file 04 resizes to 224 x 224). The interpolation choice there changes the pixels the network sees, so it belongs in the documented preprocessing version.

## COMMON MISTAKES

- Shrinking with `INTER_NEAREST` and getting aliasing. Use `INTER_AREA` to shrink.
- Passing (height, width) to `cv2.resize`. It wants (width, height).
- Resizing a bounding box's image but not the box coordinates.
- Assuming enlarging adds detail. It only adds estimated values.

## INTERVIEW CHECK

**Question:** Which interpolation do you use to shrink an image and why?

**Short answer:** Use `INTER_AREA` to shrink because it averages the pixels it replaces and avoids aliasing; `INTER_LINEAR` or `INTER_CUBIC` are typical for enlarging.

**Independent exercise** (do it from a blank file, with no copying): Shrink a 1-pixel checkerboard with INTER_NEAREST and INTER_AREA and print the results; explain aliasing.

**You are done when:** Two outputs differ as predicted; explanation given.
