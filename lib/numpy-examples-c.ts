import type { PythonCodeExample } from './python-roadmap-code-a';
export const numpyExamplesC: Record<string, PythonCodeExample[]> = {
  "15": [
    {
      "label": "Random numbers with a repeatable seed",
      "anchor": "seed-repeatable",
      "code": "import numpy as np\n\nfirst = np.random.default_rng(42)\nsecond = np.random.default_rng(42)\n\nnumbers_a = first.integers(0, 10, size=4)\nnumbers_b = second.integers(0, 10, size=4)\nprint(np.array_equal(numbers_a, numbers_b))",
      "output": "True",
      "explanation": "default_rng(42) starts a random-number generator with a specific seed.\nTwo generators with the same seed produce the same sequence for the same operations.\nThis helps you repeat dataset splits and experiments."
    },
    {
      "label": "Random numbers with integers",
      "anchor": "random-integers",
      "code": "import numpy as np\n\nrng = np.random.default_rng(7)\nnumbers = rng.integers(0, 10, size=5)\nprint(numbers.shape)\nprint(np.all(numbers >= 0))\nprint(np.all(numbers < 10))",
      "output": "(5,)\nTrue\nTrue",
      "explanation": "integers(0,10) generates whole numbers starting at 0 and smaller than 10.\nsize=5 means create five numbers.\nThis code checks the range and size without depending on the exact random sequence."
    },
    {
      "label": "Shuffle data without losing the original",
      "anchor": "shuffle-indices",
      "code": "import numpy as np\n\nrng = np.random.default_rng(42)\nlabels = np.array(['A', 'B', 'C', 'D'])\norder = rng.permutation(len(labels))\nshuffled = labels[order]\nprint(sorted(shuffled.tolist()))\nprint(labels.tolist())",
      "output": "['A', 'B', 'C', 'D']\n['A', 'B', 'C', 'D']",
      "explanation": "permutation creates a random order of indexes.\nlabels[order] selects the labels in that random order.\nThe original array remains unchanged. Real train/test splits must also respect identity/group separation."
    },
    {
      "label": "Sample different items without replacement",
      "anchor": "random-choice",
      "code": "import numpy as np\n\nrng = np.random.default_rng(10)\nids = np.array([11, 22, 33, 44])\nsample = rng.choice(ids, size=3, replace=False)\nprint(len(sample))\nprint(len(set(sample.tolist())))",
      "output": "3\n3",
      "explanation": "choice selects three IDs from the input.\nreplace=False prevents selecting the same ID twice.\nThis example proves all three chosen IDs are distinct."
    }
  ],
  "16": [
    {
      "label": "Understand HWC image shape",
      "anchor": "hwc-image",
      "code": "import numpy as np\n\nimage = np.zeros((2, 4, 3), dtype=np.uint8)\nprint(image.shape)\nprint(image.ndim)",
      "output": "(2, 4, 3)\n3",
      "explanation": "HWC means Height × Width × Channels.\nThis image has height 2, width 4 and 3 color channels.\nMany image-reading libraries use this format."
    },
    {
      "label": "Convert HWC to CHW",
      "anchor": "hwc-to-chw",
      "code": "import numpy as np\n\nimage = np.zeros((2, 4, 3), dtype=np.uint8)\nchw = image.transpose(2, 0, 1)\nprint(image.shape)\nprint(chw.shape)",
      "output": "(2, 4, 3)\n(3, 2, 4)",
      "explanation": "The input shape is (height=2, width=4, channels=3).\ntranspose(2,0,1) brings the channel axis to the front.\nCHW means Channels × Height × Width, used by many PyTorch image models."
    },
    {
      "label": "Add batch dimension: CHW to NCHW",
      "anchor": "chw-to-nchw",
      "code": "import numpy as np\n\nchw = np.zeros((3, 2, 4))\nnchw = np.expand_dims(chw, axis=0)\nprint(chw.shape)\nprint(nchw.shape)",
      "output": "(3, 2, 4)\n(1, 3, 2, 4)",
      "explanation": "CHW represents one image.\nexpand_dims adds a new first dimension, N, to count images.\nNCHW here means 1 image, 3 channels, height 2, width 4."
    },
    {
      "label": "Convert actual color values to NCHW",
      "anchor": "nchw-values",
      "code": "import numpy as np\n\nimage = np.array([[[10, 20, 30]]], dtype=np.uint8)\nchw = image.transpose(2, 0, 1)\nbatch = np.expand_dims(chw, axis=0)\nprint(batch.shape)\nprint(batch[0, :, 0, 0].tolist())",
      "output": "(1, 3, 1, 1)\n[10, 20, 30]",
      "explanation": "The input contains one RGB pixel with 3 channel values.\ntranspose moves those channel values to the first dimension.\nexpand_dims adds the batch axis; the pixel's three values are preserved."
    }
  ],
  "17": [
    {
      "label": "RGB and BGR store channels in different order",
      "anchor": "rgb-bgr",
      "code": "import numpy as np\n\nrgb = np.array([10, 20, 30])\nbgr = rgb[::-1]\nprint(rgb.tolist())\nprint(bgr.tolist())",
      "output": "[10, 20, 30]\n[30, 20, 10]",
      "explanation": "RGB means Red, Green, Blue, in that order.\nBGR means Blue, Green, Red, so the first and last channels swap.\nWrong channel order changes the colors that a model receives."
    },
    {
      "label": "Convert a whole BGR image into RGB",
      "anchor": "bgr-to-rgb",
      "code": "import numpy as np\n\nbgr_image = np.array([[[30, 20, 10], [90, 60, 40]]])\nrgb_image = bgr_image[:, :, ::-1]\nprint(rgb_image.tolist())",
      "output": "[[[10, 20, 30], [40, 60, 90]]]",
      "explanation": "The last image axis stores the color channels.\n[::-1] reverses only those three channel positions.\nHeight and width stay unchanged. This is color-channel conversion, not a matrix transpose."
    },
    {
      "label": "Channel reversal does NOT change image shape",
      "anchor": "channel-reversal-shape",
      "code": "import numpy as np\n\nbgr = np.zeros((2, 4, 3), dtype=np.uint8)\nrgb = bgr[:, :, ::-1]\nprint(bgr.shape)\nprint(rgb.shape)",
      "output": "(2, 4, 3)\n(2, 4, 3)",
      "explanation": "Both arrays have height 2, width 4 and 3 channels.\nOnly the channel order is reversed; the shape stays HWC.\nTo convert HWC to CHW, use transpose separately."
    },
    {
      "label": "Convert BGR to RGB, then to model layout",
      "anchor": "bgr-rgb-chw",
      "code": "import numpy as np\n\nbgr = np.array([[[30, 20, 10]]], dtype=np.uint8)\nrgb = bgr[:, :, ::-1]\nchw = rgb.transpose(2, 0, 1)\nprint(rgb[0, 0].tolist())\nprint(chw.shape)",
      "output": "[10, 20, 30]\n(3, 1, 1)",
      "explanation": "First reverse the BGR channel order to obtain RGB.\nThen transpose the image from HWC to CHW.\nColor conversion and axis reordering solve two DIFFERENT problems."
    }
  ],
  "18": [
    {
      "label": "Grayscale image is a 2D array",
      "anchor": "grayscale-shape",
      "code": "import numpy as np\n\nimage = np.array([[0, 100], [200, 255]], dtype=np.uint8)\nprint(image.shape)\nprint(image.ndim)\nprint(image.dtype)",
      "output": "(2, 2)\n2\nuint8",
      "explanation": "A grayscale image stores one brightness value per pixel.\nRows and columns form two dimensions, so shape is (height, width).\nuint8 stores 0 to 255, from dark to bright in a typical grayscale convention."
    },
    {
      "label": "Select a grayscale pixel",
      "anchor": "grayscale-pixel",
      "code": "import numpy as np\n\nimage = np.array([[0, 100], [200, 255]], dtype=np.uint8)\nprint(image[0, 0])\nprint(image[1, 1])",
      "output": "0\n255",
      "explanation": "image[row,column] accesses one pixel.\nThe upper-left pixel is 0, typically black.\nThe lower-right pixel is 255, typically white."
    },
    {
      "label": "Change image brightness safely",
      "anchor": "grayscale-brightness",
      "code": "import numpy as np\n\nimage = np.array([[100, 250]], dtype=np.uint8)\nwide = image.astype(np.int16)\nbright = np.clip(wide + 20, 0, 255).astype(np.uint8)\nprint(bright.tolist())",
      "output": "[[120, 255]]",
      "explanation": "Convert to int16 first so adding 20 will not overflow uint8.\nClip the result to the allowed 0–255 image range.\nConvert back to uint8. The original 250 becomes 255, not 14."
    },
    {
      "label": "Threshold a grayscale image",
      "anchor": "grayscale-threshold",
      "code": "import numpy as np\n\nimage = np.array([[40, 200], [130, 70]], dtype=np.uint8)\nmask = image >= 128\nbinary = np.where(mask, 255, 0).astype(np.uint8)\nprint(binary.tolist())",
      "output": "[[0, 255], [255, 0]]",
      "explanation": "Compare each grayscale pixel to 128.\nPixels at or above 128 become 255; darker ones become 0.\nThis produces a simple binary (black/white) image."
    }
  ],
  "19": [
    {
      "label": "Convert uint8 image to numbers from 0 to 1",
      "anchor": "normalize-0-1",
      "code": "import numpy as np\n\npixels = np.array([0, 128, 255], dtype=np.uint8)\nvalues = pixels.astype(np.float32) / 255.0\nprint(round(float(values[0]), 3))\nprint(round(float(values[1]), 3))\nprint(round(float(values[2]), 3))",
      "output": "0.0\n0.502\n1.0",
      "explanation": "Start with pixel intensities from 0 to 255.\nConvert to float32 and divide by 255: 128 becomes about 0.502.\nround(float(...),3) prints simple decimals. The underlying float32 values are still approximate."
    },
    {
      "label": "Map image intensities from 0–1 into -1–1",
      "anchor": "normalize-minus-one-one",
      "code": "import numpy as np\n\npixels = np.array([0, 127.5, 255], dtype=np.float32)\nscaled = pixels / 255.0\nnormalized = scaled * 2.0 - 1.0\nprint(normalized.tolist())",
      "output": "[-1.0, 0.0, 1.0]",
      "explanation": "Divide intensities by 255 to get 0–1.\nMultiply by 2 and subtract 1.\nThe pixel values now range from -1 to 1. This is not the normalization used by every model."
    },
    {
      "label": "Normalize each color channel using model statistics",
      "anchor": "normalize-channels",
      "code": "import numpy as np\n\npixel = np.array([0.2, 0.5, 0.8], dtype=np.float32)\nmean = np.array([0.2, 0.4, 0.6], dtype=np.float32)\nstd = np.array([0.1, 0.1, 0.1], dtype=np.float32)\nnormalized = (pixel - mean) / std\nprint(np.round(normalized).astype(int).tolist())",
      "output": "[0, 1, 2]",
      "explanation": "pixel, mean and std each have three entries: one per channel.\nSubtract each channel's mean, then divide by its standard deviation.\nThese numbers are examples. Always use the actual preprocessing statistics expected by your trained model."
    },
    {
      "label": "Prepare one RGB image as NCHW float32",
      "anchor": "full-image-preprocessing",
      "code": "import numpy as np\n\nrgb = np.array([[[0, 128, 255]]], dtype=np.uint8)\nfloat_image = rgb.astype(np.float32) / 255.0\nchw = float_image.transpose(2, 0, 1)\nbatch = np.expand_dims(chw, axis=0)\nprint(batch.shape)\nprint(batch.dtype)",
      "output": "(1, 3, 1, 1)\nfloat32",
      "explanation": "Convert integer pixel values to float32 and scale to 0–1.\nMove channels to the front: HWC becomes CHW.\nAdd batch dimension: NCHW is ready for models expecting that layout and numeric range."
    }
  ],
  "20": [
    {
      "label": "What does contiguous memory mean?",
      "anchor": "contiguous",
      "code": "import numpy as np\n\nnumbers = np.arange(6, dtype=np.int32).reshape(2, 3)\nprint(numbers.flags.c_contiguous)\nprint(numbers.strides)",
      "output": "True\n(12, 4)",
      "explanation": "A C-contiguous array stores neighboring rows in normal row-major order.\nstrides tell how many bytes to move to reach the next row or column.\nEach int32 takes 4 bytes; moving one row takes 3 × 4 = 12 bytes."
    },
    {
      "label": "Transpose often makes a non-contiguous view",
      "anchor": "transpose-contiguous",
      "code": "import numpy as np\n\nnumbers = np.arange(6, dtype=np.int32).reshape(2, 3)\nturned = numbers.T\nprint(numbers.flags.c_contiguous)\nprint(turned.flags.c_contiguous)",
      "output": "True\nFalse",
      "explanation": "The original 2×3 array is C-contiguous.\nT changes how we VIEW the same values across axes, without necessarily copying them.\nAfter transpose, many model/library operations may need a contiguous copy."
    },
    {
      "label": "Make a contiguous array when required",
      "anchor": "ascontiguous",
      "code": "import numpy as np\n\nimage = np.arange(6, dtype=np.int32).reshape(2, 3)\nturned = image.T\nsafe = np.ascontiguousarray(turned)\nprint(safe.flags.c_contiguous)\nprint(np.array_equal(safe, turned))",
      "output": "True\nTrue",
      "explanation": "np.ascontiguousarray makes an array with C-contiguous memory when needed.\nThe displayed values remain the same as the transposed array.\nFor some inputs this may create a copy, so measure memory use in large applications."
    },
    {
      "label": "Check whether two arrays share memory",
      "anchor": "shared-memory",
      "code": "import numpy as np\n\nnumbers = np.array([1, 2, 3, 4])\nview = numbers[1:3]\ncopy = view.copy()\nprint(np.shares_memory(numbers, view))\nprint(np.shares_memory(numbers, copy))",
      "output": "True\nFalse",
      "explanation": "A basic slice is a view and shares stored data with the original.\ncopy() makes separate data that do not share memory.\nnp.shares_memory helps debug unexpected changes caused by views."
    }
  ],
  "21": [
    {
      "label": "Check expected image shape",
      "anchor": "assert-image-shape",
      "code": "import numpy as np\n\nimage = np.zeros((128, 128, 3), dtype=np.uint8)\nassert image.shape == (128, 128, 3)\nprint('Image shape OK')",
      "output": "Image shape OK",
      "explanation": "A color image for this pipeline should have height 128, width 128 and 3 channels.\nassert compares the actual shape with what your code expects.\nIf the assumption is false, a helpful test can catch the problem early."
    },
    {
      "label": "Check data type before preprocessing",
      "anchor": "assert-image-dtype",
      "code": "import numpy as np\n\nimage = np.zeros((2, 2, 3), dtype=np.uint8)\nassert image.dtype == np.uint8\nfloat_image = image.astype(np.float32)\nassert float_image.dtype == np.float32\nprint('Dtypes OK')",
      "output": "Dtypes OK",
      "explanation": "Check that the loaded image has the expected uint8 pixel type.\nConvert to float32 when preparing numerical model input.\nCheck again to catch accidental integer calculations."
    },
    {
      "label": "Understand and report shape mismatch",
      "anchor": "debug-bad-shape",
      "code": "import numpy as np\n\nimage = np.zeros((2, 3), dtype=np.uint8)\nif image.ndim != 3:\n    print('Expected color HWC image, found:', image.shape)",
      "output": "Expected color HWC image, found: (2, 3)",
      "explanation": "This array has only two dimensions, like a grayscale image.\nA color HWC image would normally have three dimensions.\nInspect image.shape before converting channels or passing data into a model."
    },
    {
      "label": "Full interview proof: HWC to NCHW with checks",
      "anchor": "numpy-pipeline-proof",
      "code": "import numpy as np\n\nbgr = np.array([[[30, 20, 10]]], dtype=np.uint8)\nrgb = bgr[:, :, ::-1]\nvalues = rgb.astype(np.float32) / 255.0\nchw = values.transpose(2, 0, 1)\nbatch = np.expand_dims(chw, axis=0)\nassert batch.shape == (1, 3, 1, 1)\nassert batch.dtype == np.float32\nprint('RGB:', rgb[0, 0].tolist())\nprint('NCHW:', batch.shape)\nprint('dtype:', batch.dtype)",
      "output": "RGB: [10, 20, 30]\nNCHW: (1, 3, 1, 1)\ndtype: float32",
      "explanation": "Reverse BGR [30,20,10] into RGB [10,20,30].\nConvert the image to float32 and divide its pixel values by 255, then transpose HWC into CHW.\nAdd one batch dimension; shape (1,3,1,1) and float32 match this demo pipeline's expectations."
    }
  ]
};
