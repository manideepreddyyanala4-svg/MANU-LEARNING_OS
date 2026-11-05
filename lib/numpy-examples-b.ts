import type { PythonCodeExample } from './python-roadmap-code-a';
export const numpyExamplesB: Record<string, PythonCodeExample[]> = {
  "10": [
    {
      "label": "Convert integers to float32 safely",
      "anchor": "astype-float32",
      "code": "import numpy as np\n\npixels = np.array([0, 128, 255], dtype=np.uint8)\nvalues = pixels.astype(np.float32)\nprint(values.dtype)\nprint(values.tolist())",
      "output": "float32\n[0.0, 128.0, 255.0]",
      "explanation": "Images often arrive as uint8 whole numbers from 0 to 255.\nastype(np.float32) converts them to decimal numbers.\nUse floating-point values before dividing or scaling image intensity."
    },
    {
      "label": "Integer overflow in uint8",
      "anchor": "uint8-overflow",
      "code": "import numpy as np\n\npixel = np.array([250], dtype=np.uint8)\nresult = pixel + np.array([10], dtype=np.uint8)\nprint(result.tolist())",
      "output": "[4]",
      "explanation": "uint8 can store only numbers from 0 to 255.\n250 + 10 = 260 does not fit; fixed-width uint8 wraps to 4 here.\nConvert to a wider type or float before arithmetic if you need values above 255."
    },
    {
      "label": "Clip then convert to uint8",
      "anchor": "clip-before-cast",
      "code": "import numpy as np\n\nvalues = np.array([-5, 40, 300])\nsafe = np.clip(values, 0, 255)\nimage = safe.astype(np.uint8)\nprint(image.tolist())",
      "output": "[0, 40, 255]",
      "explanation": "np.clip limits values to an allowed minimum and maximum.\nNegative values become 0; values above 255 become 255.\nThen astype(np.uint8) stores valid image-intensity integers."
    },
    {
      "label": "Why converting too early loses decimals",
      "anchor": "conversion-order",
      "code": "import numpy as np\n\nvalues = np.array([1.2, 2.9], dtype=np.float32)\nintegers = values.astype(np.int32)\nprint(integers.tolist())\nprint(values.tolist())",
      "output": "[1, 2]\n[1.2000000476837158, 2.9000000953674316]",
      "explanation": "astype(int) removes the decimal part rather than rounding normally.\nKeep float values throughout image/model calculations when required.\nConvert only at the final step if the output truly needs integers."
    }
  ],
  "11": [
    {
      "label": "float32 and float64 have different precision",
      "anchor": "float-precision",
      "code": "import numpy as np\n\nsmall = np.array([1.5], dtype=np.float32)\nlarge = np.array([1.5], dtype=np.float64)\nprint(small.dtype)\nprint(large.dtype)\nprint(small.itemsize)\nprint(large.itemsize)",
      "output": "float32\nfloat64\n4\n8",
      "explanation": "float32 stores each number using four bytes; float64 uses eight.\nfloat64 can represent more significant digits.\nDeep-learning models frequently use float32 to reduce memory and computation."
    },
    {
      "label": "Do not compare calculated decimals exactly",
      "anchor": "decimal-precision",
      "code": "import numpy as np\n\nanswer = 0.1 + 0.2\nprint(answer == 0.3)\nprint(np.isclose(answer, 0.3))",
      "output": "False\nTrue",
      "explanation": "Most decimal fractions cannot be stored perfectly in binary floating point.\nAn exact == comparison can fail even when values are mathematically equal.\nnp.isclose checks whether two numbers are sufficiently close."
    },
    {
      "label": "Find missing values with isnan",
      "anchor": "nan-check",
      "code": "import numpy as np\n\nscores = np.array([0.8, np.nan, 0.4])\nprint(np.isnan(scores).tolist())\nprint(np.isnan(scores).sum())",
      "output": "[False, True, False]\n1",
      "explanation": "np.nan represents a missing/undefined floating-point number.\nnp.isnan marks where those values occur.\nCounting True values gives one missing entry here."
    },
    {
      "label": "Choose how to handle NaNs",
      "anchor": "nanmean",
      "code": "import numpy as np\n\nscores = np.array([2.0, np.nan, 4.0])\nprint(np.isnan(scores).sum())\nprint(np.nanmean(scores))",
      "output": "1\n3.0",
      "explanation": "One score is NaN (not a normal number).\nnp.mean would return nan for this input.\nnp.nanmean ignores NaNs and averages the remaining two valid values."
    }
  ],
  "12": [
    {
      "label": "Dot product of two vectors",
      "anchor": "dot-product",
      "code": "import numpy as np\n\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\nresult = np.dot(a, b)\nprint(result)",
      "output": "32",
      "explanation": "Multiply matching values: 1×4, 2×5 and 3×6.\nAdd them together: 4 + 10 + 18 = 32.\nThe dot product is important for comparing embeddings."
    },
    {
      "label": "Length of a vector: norm",
      "anchor": "vector-norm",
      "code": "import numpy as np\n\nvector = np.array([3.0, 4.0])\nlength = np.linalg.norm(vector)\nprint(length)",
      "output": "5.0",
      "explanation": "Square the values: 3² = 9 and 4² = 16.\nAdd them: 9 + 16 = 25.\nTake the square root: √25 = 5, the vector length."
    },
    {
      "label": "Matrix multiplication using @",
      "anchor": "matmul",
      "code": "import numpy as np\n\na = np.array([[1, 2], [3, 4]])\nb = np.array([[2, 0], [0, 2]])\nresult = a @ b\nprint(result.tolist())",
      "output": "[[2, 4], [6, 8]]",
      "explanation": "@ multiplies matrices, using the rows of a and columns of b.\nThis second matrix doubles each entry in this particular example.\nGeneral matrix multiplication is NOT elementwise multiplication."
    },
    {
      "label": "Understand compatible matrix shapes",
      "anchor": "matmul-shapes",
      "code": "import numpy as np\n\na = np.ones((2, 3))\nb = np.ones((3, 4))\nresult = a @ b\nprint(result.shape)\nprint(result[0, 0])",
      "output": "(2, 4)\n3.0",
      "explanation": "a has shape (2, 3); b has shape (3, 4).\nThe INNER sizes must match: here both are 3.\nThe result's OUTER sizes are (2, 4), and each output entry sums 3 products."
    }
  ],
  "13": [
    {
      "label": "Normalize a vector to length one",
      "anchor": "l2-normalize",
      "code": "import numpy as np\n\nvector = np.array([3.0, 4.0])\nlength = np.linalg.norm(vector)\nnormalized = vector / length\nprint(normalized.tolist())\nprint(np.linalg.norm(normalized))",
      "output": "[0.6, 0.8]\n1.0",
      "explanation": "Find the vector length: 5.\nDivide each value by that length: 3/5 and 4/5.\nThe new vector points in the same direction but has length 1."
    },
    {
      "label": "Never divide by a zero norm",
      "anchor": "zero-vector-guard",
      "code": "import numpy as np\n\nvector = np.array([0.0, 0.0])\nlength = np.linalg.norm(vector)\nif length == 0:\n    normalized = vector.copy()\nelse:\n    normalized = vector / length\nprint(normalized.tolist())",
      "output": "[0.0, 0.0]",
      "explanation": "The vector [0,0] has length 0.\nDividing by zero would produce invalid values or warnings.\nCheck the length first; this example leaves the zero vector unchanged."
    },
    {
      "label": "Normalize each row of embeddings",
      "anchor": "normalize-rows",
      "code": "import numpy as np\n\nembeddings = np.array([[3.0, 4.0], [0.0, 2.0]])\nlengths = np.linalg.norm(embeddings, axis=1, keepdims=True)\nnormalized = embeddings / lengths\nprint(normalized.tolist())",
      "output": "[[0.6, 0.8], [0.0, 1.0]]",
      "explanation": "Each row represents a separate embedding vector.\naxis=1 calculates the length across each row; keepdims makes shape (2,1).\nDividing rows by their own lengths normalizes every embedding separately. Guard zero rows for real data."
    }
  ],
  "14": [
    {
      "label": "Cosine similarity between two vectors",
      "anchor": "cosine-similarity",
      "code": "import numpy as np\n\na = np.array([1.0, 0.0])\nb = np.array([1.0, 0.0])\ndot = np.dot(a, b)\nlengths = np.linalg.norm(a) * np.linalg.norm(b)\ncosine = dot / lengths\nprint(cosine)",
      "output": "1.0",
      "explanation": "Multiply the vectors using a dot product.\nDivide by the product of their lengths.\n1.0 means the two nonzero vectors point in exactly the same direction."
    },
    {
      "label": "Cosine similarity for perpendicular embeddings",
      "anchor": "cosine-perpendicular",
      "code": "import numpy as np\n\na = np.array([1.0, 0.0])\nb = np.array([0.0, 1.0])\ncosine = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))\nprint(cosine)",
      "output": "0.0",
      "explanation": "One vector points along the first axis and the other along the second axis.\nTheir dot product is 0, and both lengths are 1.\nCosine similarity 0 means they are perpendicular (unrelated directions), not necessarily different people."
    },
    {
      "label": "Euclidean distance between vectors",
      "anchor": "euclidean",
      "code": "import numpy as np\n\na = np.array([1.0, 2.0])\nb = np.array([4.0, 6.0])\ndifference = a - b\ndistance = np.linalg.norm(difference)\nprint(distance)",
      "output": "5.0",
      "explanation": "Subtract corresponding values: [-3,-4].\nFind the length of this difference vector: √(9+16) = 5.\nEuclidean distance measures straight-line separation, not angle."
    },
    {
      "label": "Cosine similarity needs zero-norm handling",
      "anchor": "cosine-safe",
      "code": "import numpy as np\n\na = np.array([0.0, 0.0])\nb = np.array([1.0, 0.0])\ndenominator = np.linalg.norm(a) * np.linalg.norm(b)\nif denominator == 0:\n    similarity = None\nelse:\n    similarity = np.dot(a, b) / denominator\nprint(similarity)",
      "output": "None",
      "explanation": "A zero vector has no direction.\nIts norm is 0, so ordinary cosine similarity is undefined.\nCheck the denominator first; returning None is an explicit rejection in this example."
    }
  ],
  "08": [
    {
      "label": "Understand axis 0 and axis 1",
      "anchor": "axis-0-axis-1",
      "code": "import numpy as np\n\nscores = np.array([[1, 2, 3], [4, 5, 6]])\nprint(scores.sum(axis=0).tolist())\nprint(scores.sum(axis=1).tolist())",
      "output": "[5, 7, 9]\n[6, 15]",
      "explanation": "axis=0 removes the row dimension by combining values down each column.\naxis=1 removes the column dimension by combining values across each row.\nThe outputs are different because the direction of reduction is different."
    },
    {
      "label": "Mean and maximum across rows",
      "anchor": "axis-mean-max",
      "code": "import numpy as np\n\nscores = np.array([[2, 4], [6, 8]])\nprint(scores.mean(axis=0).tolist())\nprint(scores.max(axis=1).tolist())",
      "output": "[4.0, 6.0]\n[4, 8]",
      "explanation": "mean(axis=0) averages down the rows: (2+6)/2 and (4+8)/2.\nmax(axis=1) finds the largest element in EACH row.\nThe output shape changes when a dimension is reduced."
    },
    {
      "label": "argmax returns position, not value",
      "anchor": "argmax",
      "code": "import numpy as np\n\nscores = np.array([0.1, 0.8, 0.4])\nposition = scores.argmax()\nvalue = scores[position]\nprint(position)\nprint(value)",
      "output": "1\n0.8",
      "explanation": "argmax returns INDEX of the largest value.\nThe largest score is at index 1 (remember indexing starts at zero).\nscores[position] reads the actual value, 0.8."
    },
    {
      "label": "Keep a reduced dimension with keepdims",
      "anchor": "keepdims",
      "code": "import numpy as np\n\nnumbers = np.array([[2, 4, 6], [4, 6, 8]])\nrow_average = numbers.mean(axis=1, keepdims=True)\nprint(row_average.tolist())\nprint(row_average.shape)",
      "output": "[[4.0], [6.0]]\n(2, 1)",
      "explanation": "Normally mean(axis=1) would return shape (2,).\nkeepdims=True keeps the reduced dimension at size 1.\nThat shape can be useful when broadcasting the average back to every column."
    }
  ],
  "09": [
    {
      "label": "Python loop adds each value",
      "anchor": "python-loop",
      "code": "numbers = [1, 2, 3]\nresult = []\nfor number in numbers:\n    result.append(number * 2)\nprint(result)",
      "output": "[2, 4, 6]",
      "explanation": "A Python loop visits each element and calculates a result.\nThe new values go into an output list.\nThis is clear and useful for learning the operation."
    },
    {
      "label": "Vectorization does it without a Python loop",
      "anchor": "vectorization",
      "code": "import numpy as np\n\nnumbers = np.array([1, 2, 3])\nresult = numbers * 2\nprint(result.tolist())",
      "output": "[2, 4, 6]",
      "explanation": "NumPy applies * 2 to the whole array.\nThe element-by-element loop happens inside optimized NumPy code.\nFor large numerical arrays this is often faster than a Python loop."
    },
    {
      "label": "Calculate the mean of every row",
      "anchor": "row-mean-vector",
      "code": "import numpy as np\n\nscores = np.array([[2, 4], [6, 8]])\nmeans = scores.mean(axis=1)\nprint(means.tolist())",
      "output": "[3.0, 7.0]",
      "explanation": "The input has two rows.\nmean(axis=1) averages the values in each row.\nNo Python loop or custom accumulation is needed."
    },
    {
      "label": "Elementwise multiplication versus matrix multiplication",
      "anchor": "elementwise-vs-matmul",
      "code": "import numpy as np\n\na = np.array([[1, 2], [3, 4]])\nb = np.array([[5, 6], [7, 8]])\nprint((a * b).tolist())\nprint((a @ b).tolist())",
      "output": "[[5, 12], [21, 32]]\n[[19, 22], [43, 50]]",
      "explanation": "a * b multiplies matching entries one by one.\na @ b computes matrix multiplication using rows and columns.\nThese are NOT the same operation and usually produce different values."
    }
  ]
};
