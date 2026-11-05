import type { PythonCodeExample } from './python-roadmap-code-a';
export const numpyExamplesA: Record<string, PythonCodeExample[]> = {
  "01": [
    {
      "label": "What is a NumPy array?",
      "anchor": "ndarray",
      "code": "import numpy as np\n\nnumbers = np.array([10, 20, 30])\nprint(numbers.tolist())\nprint(type(numbers).__name__)",
      "output": "[10, 20, 30]\nndarray",
      "explanation": "np.array converts a Python list into a NumPy array.\nAn ndarray stores values arranged in one or more dimensions.\ntolist() displays the values as a familiar Python list."
    },
    {
      "label": "Understand shape, ndim and size",
      "anchor": "shape-ndim-size",
      "code": "import numpy as np\n\nimage = np.zeros((2, 3, 4))\nprint(image.shape)\nprint(image.ndim)\nprint(image.size)",
      "output": "(2, 3, 4)\n3\n24",
      "explanation": "shape tells us how many values are on each dimension (2 by 3 by 4).\nndim means number of dimensions, here 3.\nsize counts all values: 2 × 3 × 4 = 24."
    },
    {
      "label": "dtype and itemsize",
      "anchor": "dtype-itemsize",
      "code": "import numpy as np\n\nnumbers = np.array([1, 2, 3], dtype=np.float32)\nprint(numbers.dtype)\nprint(numbers.itemsize)\nprint(numbers.nbytes)",
      "output": "float32\n4\n12",
      "explanation": "dtype is the data type of the stored values; float32 means 32-bit decimal values.\nitemsize tells you bytes per value. A float32 uses 4 bytes.\nnbytes is total stored bytes: 3 values × 4 bytes = 12."
    },
    {
      "label": "1D versus 2D arrays",
      "anchor": "array-dimensions",
      "code": "import numpy as np\n\nrow = np.array([1, 2, 3])\ngrid = np.array([[1, 2, 3], [4, 5, 6]])\nprint(row.shape)\nprint(grid.shape)",
      "output": "(3,)\n(2, 3)",
      "explanation": "One-dimensional row has 3 positions.\nThe grid has 2 rows and 3 columns.\nIn image processing, a grayscale image is usually a 2D grid."
    }
  ],
  "02": [
    {
      "label": "Create arrays with zeros and ones",
      "anchor": "zeros-ones",
      "code": "import numpy as np\n\nzeros = np.zeros((2, 3), dtype=np.int32)\nones = np.ones((2, 2), dtype=np.int32)\nprint(zeros.tolist())\nprint(ones.tolist())",
      "output": "[[0, 0, 0], [0, 0, 0]]\n[[1, 1], [1, 1]]",
      "explanation": "zeros creates an array filled with 0.\nones creates an array filled with 1.\nThe shape (2, 3) means 2 rows and 3 columns."
    },
    {
      "label": "arange — numbers in steps",
      "anchor": "arange",
      "code": "import numpy as np\n\nnumbers = np.arange(1, 7, 2)\nprint(numbers.tolist())",
      "output": "[1, 3, 5]",
      "explanation": "Start at 1 and add 2 each time.\nThe stop value 7 is not included.\narange is useful for creating positions, sample indexes and sequences."
    },
    {
      "label": "linspace — evenly spaced numbers",
      "anchor": "linspace",
      "code": "import numpy as np\n\nnumbers = np.linspace(0, 1, 5)\nprint(numbers.tolist())",
      "output": "[0.0, 0.25, 0.5, 0.75, 1.0]",
      "explanation": "linspace starts at 0 and ends at 1.\nThe last number 5 means create exactly five evenly spaced values.\nUnlike arange, linspace includes the endpoint by default."
    },
    {
      "label": "Create a 2D grid from a list",
      "anchor": "array-from-list",
      "code": "import numpy as np\n\npixels = [[0, 100], [200, 255]]\nimage = np.array(pixels, dtype=np.uint8)\nprint(image.tolist())\nprint(image.shape)",
      "output": "[[0, 100], [200, 255]]\n(2, 2)",
      "explanation": "The nested Python list has two rows and two columns.\nnp.array turns it into a NumPy image-style grid.\nuint8 stores whole numbers from 0 through 255, common in images."
    }
  ],
  "03": [
    {
      "label": "Read a row and column",
      "anchor": "index-2d",
      "code": "import numpy as np\n\nimage = np.array([[10, 20, 30], [40, 50, 60]])\nprint(image[0, 1])\nprint(image[1, 2])",
      "output": "20\n60",
      "explanation": "image[row, column] finds one element.\nRow 0 and column 1 contains 20.\nRow 1 and column 2 contains 60. Counting starts at 0."
    },
    {
      "label": "Slice rows and columns",
      "anchor": "slice-2d",
      "code": "import numpy as np\n\nimage = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])\nsmall = image[:2, 1:3]\nprint(small.tolist())",
      "output": "[[2, 3], [5, 6]]",
      "explanation": "[:2] selects rows 0 and 1.\n[1:3] selects columns 1 and 2.\nNumPy slicing returns a view when basic slicing is used."
    },
    {
      "label": "View: changing the slice changes the original",
      "anchor": "views",
      "code": "import numpy as np\n\nnumbers = np.array([10, 20, 30])\npart = numbers[:2]\npart[0] = 99\nprint(numbers.tolist())",
      "output": "[99, 20, 30]",
      "explanation": "part is a view into the original numbers array.\nChanging part[0] also changes numbers[0].\nThis can cause bugs if you expect a separate copy."
    },
    {
      "label": "Copy: changes stay separate",
      "anchor": "copies",
      "code": "import numpy as np\n\nnumbers = np.array([10, 20, 30])\npart = numbers[:2].copy()\npart[0] = 99\nprint(numbers.tolist())\nprint(part.tolist())",
      "output": "[10, 20, 30]\n[99, 20]",
      "explanation": "copy() allocates separate values.\nChanging part no longer changes the original numbers.\nUse a copy when you need to edit one image without changing another."
    }
  ],
  "04": [
    {
      "label": "Boolean comparison makes a mask",
      "anchor": "boolean-mask",
      "code": "import numpy as np\n\nscores = np.array([0.2, 0.8, 0.9])\nmask = scores >= 0.7\nprint(mask.tolist())",
      "output": "[False, True, True]",
      "explanation": "Compare each score with 0.7.\nThe result has True where a score passes and False where it fails.\nThis array of True/False values is called a boolean mask."
    },
    {
      "label": "Choose only values that pass",
      "anchor": "boolean-index",
      "code": "import numpy as np\n\nscores = np.array([0.2, 0.8, 0.9])\nselected = scores[scores >= 0.7]\nprint(selected.tolist())",
      "output": "[0.8, 0.9]",
      "explanation": "scores >= 0.7 creates a boolean mask.\nscores[mask] keeps values where the mask is True.\nBoolean indexing returns a NEW selected array."
    },
    {
      "label": "Change dark pixels to zero",
      "anchor": "mask-image",
      "code": "import numpy as np\n\nimage = np.array([[40, 180], [200, 70]], dtype=np.uint8)\nimage[image < 100] = 0\nprint(image.tolist())",
      "output": "[[0, 180], [200, 0]]",
      "explanation": "image < 100 finds pixels darker than 100.\nAssigning 0 replaces only those pixels in the image.\nThis is a simple thresholding operation used in image processing."
    },
    {
      "label": "Combine masks correctly",
      "anchor": "combine-masks",
      "code": "import numpy as np\n\nscores = np.array([0.1, 0.5, 0.9])\nmask = (scores >= 0.3) & (scores <= 0.8)\nprint(scores[mask].tolist())",
      "output": "[0.5]",
      "explanation": "Use parentheses around each elementwise comparison.\n& means BOTH conditions must be true for each value.\nPython and is not a replacement for & on NumPy boolean arrays."
    }
  ],
  "05": [
    {
      "label": "reshape changes dimensions",
      "anchor": "reshape",
      "code": "import numpy as np\n\nnumbers = np.arange(6)\ngrid = numbers.reshape(2, 3)\nprint(grid.tolist())\nprint(grid.shape)",
      "output": "[[0, 1, 2], [3, 4, 5]]\n(2, 3)",
      "explanation": "Begin with six values in one row.\nreshape(2, 3) organizes them into 2 rows and 3 columns.\nreshape needs the same total number of elements."
    },
    {
      "label": "Transpose rows and columns",
      "anchor": "transpose-2d",
      "code": "import numpy as np\n\nmatrix = np.array([[1, 2, 3], [4, 5, 6]])\ntransposed = matrix.T\nprint(transposed.tolist())\nprint(transposed.shape)",
      "output": "[[1, 4], [2, 5], [3, 6]]\n(3, 2)",
      "explanation": "The original shape is (2, 3): two rows and three columns.\nT swaps the row and column axes.\nThe new shape is (3, 2), with the values rearranged by axis."
    },
    {
      "label": "Move image channels with transpose",
      "anchor": "transpose-image",
      "code": "import numpy as np\n\nimage = np.zeros((2, 4, 3))\nchannels_first = image.transpose(2, 0, 1)\nprint(image.shape)\nprint(channels_first.shape)",
      "output": "(2, 4, 3)\n(3, 2, 4)",
      "explanation": "A typical color image has (height, width, channels).\ntranspose(2, 0, 1) moves axis 2 (channels) to the front.\nImage values are not recolored; only the arrangement of axes changes."
    },
    {
      "label": "moveaxis and PyTorch permute idea",
      "anchor": "moveaxis",
      "code": "import numpy as np\n\nimage = np.zeros((2, 4, 3))\nchanged = np.moveaxis(image, 2, 0)\nprint(changed.shape)",
      "output": "(3, 2, 4)",
      "explanation": "Axis 2 contains the image color channels.\nmoveaxis(image, 2, 0) moves the channel axis to position 0.\nIt gives the same shape as transpose(2, 0, 1). PyTorch uses .permute for rearranging tensor dimensions."
    }
  ],
  "06": [
    {
      "label": "Add a dimension with expand_dims",
      "anchor": "expand-dims",
      "code": "import numpy as np\n\nimage = np.zeros((4, 5, 3))\nbatch = np.expand_dims(image, axis=0)\nprint(image.shape)\nprint(batch.shape)",
      "output": "(4, 5, 3)\n(1, 4, 5, 3)",
      "explanation": "The original image is height × width × channels.\nexpand_dims adds one new dimension at position 0.\nThat new dimension holds the number of images: one batch item."
    },
    {
      "label": "Remove a size-one dimension with squeeze",
      "anchor": "squeeze",
      "code": "import numpy as np\n\nbatch = np.zeros((1, 3, 2, 4))\nimage = np.squeeze(batch, axis=0)\nprint(image.shape)",
      "output": "(3, 2, 4)",
      "explanation": "The first dimension has size 1.\nsqueeze(axis=0) removes only that size-one dimension.\nIt cannot remove an axis whose size is greater than one."
    },
    {
      "label": "Stack identical-size images",
      "anchor": "stack",
      "code": "import numpy as np\n\nfirst = np.ones((2, 2), dtype=np.int32)\nsecond = np.zeros((2, 2), dtype=np.int32)\nbatch = np.stack([first, second], axis=0)\nprint(batch.shape)\nprint(batch[0].tolist())",
      "output": "(2, 2, 2)\n[[1, 1], [1, 1]]",
      "explanation": "Both images have shape (2, 2).\nstack creates a NEW dimension with two images.\nbatch[0] selects the first image."
    },
    {
      "label": "Concatenate arrays along an existing axis",
      "anchor": "concatenate",
      "code": "import numpy as np\n\nfirst = np.array([[1, 2]])\nsecond = np.array([[3, 4]])\ncombined = np.concatenate([first, second], axis=0)\nprint(combined.tolist())\nprint(combined.shape)",
      "output": "[[1, 2], [3, 4]]\n(2, 2)",
      "explanation": "Both inputs have one row and two columns.\nconcatenate joins them along axis 0 (rows).\nUnlike stack, it joins an EXISTING dimension instead of adding a new one."
    }
  ],
  "07": [
    {
      "label": "Broadcast a number across an array",
      "anchor": "scalar-broadcast",
      "code": "import numpy as np\n\nnumbers = np.array([1, 2, 3])\nresult = numbers + 10\nprint(result.tolist())",
      "output": "[11, 12, 13]",
      "explanation": "The number 10 is added to EVERY array element.\nYou do not need a Python for loop.\nThis is a simple case of NumPy broadcasting."
    },
    {
      "label": "Broadcast one channel value per color",
      "anchor": "channel-broadcast",
      "code": "import numpy as np\n\npixel = np.array([[10, 20, 30], [40, 50, 60]])\nchange = np.array([1, 2, 3])\nresult = pixel + change\nprint(result.tolist())",
      "output": "[[11, 22, 33], [41, 52, 63]]",
      "explanation": "pixel has shape (2, 3): two pixels, three channels each.\nchange has three values, so they line up with the LAST dimension.\nThe same three channel adjustments are applied to each pixel."
    },
    {
      "label": "Understand matching broadcasting shapes",
      "anchor": "broadcast-shapes",
      "code": "import numpy as np\n\nrows = np.array([[1], [2]])\ncolumns = np.array([[10, 20, 30]])\nresult = rows + columns\nprint(result.shape)\nprint(result.tolist())",
      "output": "(2, 3)\n[[11, 21, 31], [12, 22, 32]]",
      "explanation": "rows has shape (2, 1). columns has shape (1, 3).\nDimensions match if they are equal OR one is 1.\nThe result has shape (2, 3): every row value combines with every column value."
    },
    {
      "label": "Recognize incompatible shapes",
      "anchor": "broadcast-error",
      "code": "import numpy as np\n\nleft = np.ones((2, 3))\nright = np.ones((2, 2))\ntry:\n    result = left + right\nexcept ValueError:\n    print('Shapes do not match')",
      "output": "Shapes do not match",
      "explanation": "The trailing dimensions are 3 and 2.\nNeither value is 1, so NumPy cannot broadcast them together.\nA ValueError is expected; inspect .shape before combining arrays."
    }
  ]
};
