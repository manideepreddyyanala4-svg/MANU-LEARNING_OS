"""Runnable worked examples for Module 07 lessons (digital images). Each entry: (example id, short intro, code).
Every example is executed by build_b1.py; the printed output is what appears in the lesson. Synthetic data only."""
E = {
"M07-T01": [
("a", "A tiny 4-row by 6-column grayscale image. Rows come first in NumPy, but humans say (x, y) = (column, row).",
"""import numpy as np

img = np.zeros((4, 6), dtype=np.uint8)   # 4 rows (height), 6 columns (width)
height, width = img.shape
print("shape (rows, cols):", img.shape)
print("width x height:", width, "x", height)

x, y = 4, 1                # x = column, y = row
img[y, x] = 200            # NumPy index is [row, column] = [y, x]
print("pixel at x=4, y=1 ->", img[y, x])
print(img)"""),
("b", "Cropping uses the same row-first order. A crop that starts at column 2 and row 0 is img[0:3, 2:6].",
"""import numpy as np

img = np.arange(24, dtype=np.uint8).reshape(4, 6)
crop = img[0:3, 2:6]       # rows 0..2, columns 2..5
print("crop shape (rows, cols):", crop.shape)
print(crop)
print("640 x 480 image has", 640 * 480, "pixels")"""),
],
"M07-T02": [
("a", "OpenCV stores colour as B, G, R. Pure blue is [255, 0, 0] in BGR. Convert it to RGB, gray and HSV.",
"""import numpy as np, cv2

blue = np.array([[[255, 0, 0]]], dtype=np.uint8)      # one pixel, BGR order
print("BGR:", blue[0, 0], "-> RGB:", blue[:, :, ::-1][0, 0])
print("gray:", cv2.cvtColor(blue, cv2.COLOR_BGR2GRAY)[0, 0])
print("HSV of blue:", cv2.cvtColor(blue, cv2.COLOR_BGR2HSV)[0, 0])

red = np.array([[[0, 0, 255]]], dtype=np.uint8)
print("HSV of red: ", cv2.cvtColor(red, cv2.COLOR_BGR2HSV)[0, 0])"""),
],
"M07-T03": [
("a", "uint8 can only hold 0 to 255. NumPy wraps around; OpenCV saturates at 255.",
"""import numpy as np, cv2

a = np.array([[250, 255]], dtype=np.uint8)
b = np.full_like(a, 10)
print("a + b with NumPy (wraps):  ", a + b)
print("cv2.add(a, b) (saturates): ", cv2.add(a, b))

# the safe pattern: widen first, then clip, then go back to uint8
safe = np.clip(a.astype(np.int16) + b, 0, 255).astype(np.uint8)
print("int16 + clip:              ", safe)
print("float32 in [0,1]:          ", (a.astype(np.float32) / 255).round(3))"""),
],
"M07-T04": [
("a", "Histogram, contrast stretch (alpha * x + beta) and gamma on a small low-contrast image.",
"""import numpy as np

img = np.array([[100, 110, 120],
                [105, 115, 130]], dtype=np.uint8)
print("min, max:", img.min(), img.max(), "| mean:", img.mean())
counts = np.bincount(img.ravel(), minlength=256)
print("non-empty histogram bins:", {int(v): int(counts[v]) for v in np.nonzero(counts)[0]})

alpha, beta = 4.0, -380.0          # stretch 100..130 onto about 20..140
stretched = np.clip(alpha * img.astype(np.float32) + beta, 0, 255).astype(np.uint8)
print("after alpha=4, beta=-380:", stretched.tolist())
print("min, max:", stretched.min(), stretched.max())"""),
("b", "Gamma correction with a lookup table: gamma below 1 brightens dark pixels more than bright ones.",
"""import numpy as np

levels = np.array([16, 64, 128, 200], dtype=np.float32)
for gamma in (0.5, 1.0, 2.0):
    out = (255 * (levels / 255) ** gamma).round().astype(int)
    print(f"gamma {gamma}:", out.tolist())"""),
],
"M07-T05": [
("a", "Shrink a 1-pixel checkerboard from 4x4 to 2x2. Nearest-neighbour just picks pixels; INTER_AREA averages them.",
"""import numpy as np, cv2

img = np.array([[0, 255, 0, 255],
                [255, 0, 255, 0],
                [0, 255, 0, 255],
                [255, 0, 255, 0]], dtype=np.uint8)
nearest = cv2.resize(img, (2, 2), interpolation=cv2.INTER_NEAREST)
area = cv2.resize(img, (2, 2), interpolation=cv2.INTER_AREA)
print("nearest:\\n", nearest)
print("area:\\n", area)"""),
("b", "Upsampling invents values. Enlarge a 2x2 image to 4x4 two ways.",
"""import numpy as np, cv2

small = np.array([[0, 100], [200, 255]], dtype=np.uint8)
print("nearest:\\n", cv2.resize(small, (4, 4), interpolation=cv2.INTER_NEAREST))
print("linear:\\n", cv2.resize(small, (4, 4), interpolation=cv2.INTER_LINEAR))"""),
],
"M07-T06": [
("a", "Add Gaussian noise (sigma 10) and salt-and-pepper noise (2%) to a flat gray image, with a fixed seed, and measure the error against the clean image.",
"""import numpy as np

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
print("pixels changed (S&P):", int((sp != clean).sum()), "of", clean.size)"""),
],
"M07-T07": [
("a", "A 3x3 mean filter by hand at one interior pixel and one corner pixel, checked against OpenCV.",
"""import numpy as np, cv2

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
print("corner, zero border:   ", round(float(corner_zero), 3))"""),
],
"M07-T08": [
("a", "One bright outlier ('salt') in a flat patch. See what each filter does at the centre pixel.",
"""import numpy as np, cv2

img = np.full((5, 5), 100, dtype=np.uint8)
img[2, 2] = 255                                   # one salt pixel

print("original centre:", img[2, 2])
print("mean (3x3):     ", cv2.blur(img, (3, 3))[2, 2])
print("gaussian (3x3): ", cv2.GaussianBlur(img, (3, 3), 0)[2, 2])
print("median (3x3):   ", cv2.medianBlur(img, 3)[2, 2])
print("neighbour of the centre after mean:  ", cv2.blur(img, (3, 3))[2, 3], "(was 100)")
print("neighbour of the centre after median:", cv2.medianBlur(img, 3)[2, 3])"""),
],
"M07-T09": [
("a", "A noisy step edge (60 on the left, 200 on the right). Compare how much of the edge, and how much of the noise, survives Gaussian vs bilateral smoothing.",
"""import numpy as np, cv2

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
    print(f"{name:9s} edge jump {edge_jump(im):6.1f}   flat-region noise {flat_noise(im)}")"""),
],
"M07-T10": [
("a", "Sobel on a vertical edge: the image is 0 on the left and 100 on the right.",
"""import numpy as np, cv2

img = np.zeros((5, 6), dtype=np.float32)
img[:, 3:] = 100                                       # vertical edge between columns 2 and 3

gx = cv2.Sobel(img, cv2.CV_32F, 1, 0, ksize=3)         # responds to left-right change
gy = cv2.Sobel(img, cv2.CV_32F, 0, 1, ksize=3)         # responds to up-down change
print("gx middle row:", gx[2].tolist())
print("gy middle row:", gy[2].tolist())
mag = np.sqrt(gx ** 2 + gy ** 2)
print("magnitude at the edge (row 2, col 2):", mag[2, 2])
print("angle at the edge (degrees):", round(float(np.degrees(np.arctan2(gy[2, 2], gx[2, 2]))), 1))"""),
],
"M07-T11": [
("a", "DoG = Gaussian(small sigma) - Gaussian(large sigma). A slow brightness ramp is removed; a small bright dot stays.",
"""import numpy as np, cv2

ramp = np.tile(np.linspace(0, 100, 64, dtype=np.float32), (64, 1))   # slow illumination change
img = ramp.copy()
img[32, 32] += 50                                                    # small bright detail

g_small = cv2.GaussianBlur(img, (0, 0), 1)
g_large = cv2.GaussianBlur(img, (0, 0), 3)
dog = g_small - g_large

print("image value range:    ", round(float(img.min()), 1), "to", round(float(img.max()), 1))
print("DoG on the plain ramp:", round(float(dog[16, 16]), 3), "(near 0)")
print("DoG at the dot:       ", round(float(dog[32, 32]), 3))
print("Laplacian at the dot: ", round(float(cv2.Laplacian(img, cv2.CV_32F)[32, 32]), 1))"""),
],
"M07-T16": [
("a", "A low-contrast noisy gradient. Compare global histogram equalization with CLAHE.",
"""import numpy as np, cv2

rng = np.random.default_rng(2)
base = np.tile(np.linspace(100, 140, 64), (64, 1))
img = np.clip(base + rng.normal(0, 2, base.shape), 0, 255).astype(np.uint8)

eq = cv2.equalizeHist(img)
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4)).apply(img)

def noise(im):                        # spread inside a small flat-ish patch
    return round(float(im[0:6, 0:6].std()), 2)

for name, im in (("original", img), ("equalizeHist", eq), ("CLAHE 2.0", clahe)):
    print(f"{name:13s} min {im.min():3d}  max {im.max():3d}  patch noise {noise(im)}")"""),
],
}
