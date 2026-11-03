export type PythonCheck = { name: string; code: string };
export type PythonChallenge = {
  prompt: string;
  starter: string;
  checks: PythonCheck[];
};
/** Every challenge has independent tests. Results are practice evidence, not a ManuOS mastery status. */
export const PYTHON_CHALLENGES: Record<string, PythonChallenge> = {
  "10": {
    "prompt": "Implement linear_find(items,target) using one loop. Return its index or -1. Explain the worst-case Big-O verbally.",
    "starter": "def linear_find(items,target):\n    # TODO: use a for loop (no list.index)\n    pass",
    "checks": [
      {
        "name": "Existing value",
        "code": "assert linear_find([2,4,6,8],6)==2"
      },
      {
        "name": "Not found",
        "code": "assert linear_find([2,4,6],7)==-1"
      },
      {
        "name": "Duplicate uses first index",
        "code": "assert linear_find([4,2,4],4)==0"
      }
    ]
  },
  "11": {
    "prompt": "Write two_sum(nums,target) returning TWO DISTINCT indices whose values add to target. Use a dictionary, not nested loops.",
    "starter": "def two_sum(nums,target):\n    seen = {}\n    # TODO: use complement = target - number\n    pass",
    "checks": [
      {
        "name": "Basic pair",
        "code": "assert set(two_sum([2,7,11,15],9))=={0,1}"
      },
      {
        "name": "Duplicate values",
        "code": "assert set(two_sum([3,3],6))=={0,1}"
      },
      {
        "name": "Negative values",
        "code": "assert set(two_sum([-4,8,10,1],6))=={0,2}"
      },
      {
        "name": "Indices are distinct and valid",
        "code": "a=[5,1,9,12]; i,j=two_sum(a,13); assert 0<=i<len(a) and 0<=j<len(a) and i!=j and a[i]+a[j]==13"
      }
    ]
  },
  "12": {
    "prompt": "Implement count_vowels(text). Count a, e, i, o, u; handle uppercase too.",
    "starter": "def count_vowels(text):\n    # TODO\n    pass",
    "checks": [
      {
        "name": "Computer",
        "code": "assert count_vowels('computer')==3"
      },
      {
        "name": "Uppercase",
        "code": "assert count_vowels('AEIOU')==5"
      },
      {
        "name": "No vowels",
        "code": "assert count_vowels('rhythm')==0"
      }
    ]
  },
  "13": {
    "prompt": "Fix the out-of-range indexing. Store the last value in last_value without causing an error.",
    "starter": "values=[10,20]\n# This is wrong: last_value = values[2]\n# TODO:",
    "checks": [
      {
        "name": "Correct last item",
        "code": "assert last_value == 20"
      }
    ]
  },
  "14": {
    "prompt": "Implement safe_divide(a,b): return a/b; if b is 0, catch ZeroDivisionError and return None.",
    "starter": "def safe_divide(a,b):\n    # TODO: try / except ZeroDivisionError\n    pass",
    "checks": [
      {
        "name": "Normal division",
        "code": "assert safe_divide(9,3)==3"
      },
      {
        "name": "Zero divisor",
        "code": "assert safe_divide(9,0) is None"
      },
      {
        "name": "Negative divisor",
        "code": "assert safe_divide(8,-2)==-4"
      }
    ]
  },
  "15": {
    "prompt": "Using NumPy, create a variable named ones containing a 4x4 array of ones.",
    "starter": "import numpy as np\n# ones = ...",
    "checks": [
      {
        "name": "Array shape",
        "code": "assert ones.shape==(4,4)"
      },
      {
        "name": "Values equal one",
        "code": "assert bool(np.all(ones==1))"
      }
    ]
  },
  "16": {
    "prompt": "Create an array called batch with shape (2,3,128,128) using NumPy zeros.",
    "starter": "import numpy as np\n# batch = ...",
    "checks": [
      {
        "name": "4D batch",
        "code": "assert batch.ndim==4 and batch.shape==(2,3,128,128)"
      }
    ]
  },
  "17": {
    "prompt": "Create arr, a NumPy uint8 array of zeros with shape (3,5).",
    "starter": "import numpy as np\n# arr = ...",
    "checks": [
      {
        "name": "Shape and ndim",
        "code": "assert arr.shape==(3,5) and arr.ndim==2"
      },
      {
        "name": "Correct dtype",
        "code": "assert arr.dtype==np.uint8"
      }
    ]
  },
  "18": {
    "prompt": "From grid (3x4), select only the first row and its last two columns into crop.",
    "starter": "import numpy as np\ngrid = np.arange(12).reshape(3,4)\n# crop = ...",
    "checks": [
      {
        "name": "Right selection",
        "code": "assert bool(np.array_equal(crop, np.array([2,3])))"
      }
    ]
  },
  "19": {
    "prompt": "Reshape np.arange(12) into an array named matrix with shape (3,4), preserving element order.",
    "starter": "import numpy as np\nnumbers = np.arange(12)\n# matrix = ...",
    "checks": [
      {
        "name": "Expected shape",
        "code": "assert matrix.shape==(3,4)"
      },
      {
        "name": "Values unchanged in row order",
        "code": "assert bool(np.array_equal(matrix.reshape(-1),np.arange(12)))"
      }
    ]
  },
  "20": {
    "prompt": "Move the channel axis of hwc from (10,20,3) to the front. Save as chw. Use transpose, not reshape.",
    "starter": "import numpy as np\nhwc=np.arange(10*20*3).reshape(10,20,3)\n# chw = ...",
    "checks": [
      {
        "name": "CHW axes",
        "code": "assert chw.shape==(3,10,20)"
      },
      {
        "name": "Correct channel values",
        "code": "assert bool(np.array_equal(chw, np.transpose(hwc,(2,0,1))))"
      }
    ]
  },
  "21": {
    "prompt": "Add a batch axis to chw so that batch is shaped (1,3,128,128).",
    "starter": "import numpy as np\nchw=np.zeros((3,128,128))\n# batch = ...",
    "checks": [
      {
        "name": "New batch dimension",
        "code": "assert batch.shape==(1,3,128,128)"
      },
      {
        "name": "Element count preserved",
        "code": "assert batch.size==chw.size"
      }
    ]
  },
  "22": {
    "prompt": "Convert uint8 pixels [0,64,255] to a float32 array called normalized in [0,1].",
    "starter": "import numpy as np\npixels=np.array([0,64,255], dtype=np.uint8)\n# normalized = ...",
    "checks": [
      {
        "name": "float32 result",
        "code": "assert normalized.dtype==np.float32"
      },
      {
        "name": "Correct scaling",
        "code": "assert bool(np.allclose(normalized,[0,64/255,1]))"
      }
    ]
  },
  "23": {
    "prompt": "Create an RGB HWC array called image with height 64, width 96, 3 channels, and uint8 dtype.",
    "starter": "import numpy as np\n# image = ...",
    "checks": [
      {
        "name": "HWC shape",
        "code": "assert image.shape==(64,96,3)"
      },
      {
        "name": "Pixel type",
        "code": "assert image.dtype==np.uint8"
      }
    ]
  },
  "24": {
    "prompt": "Convert an HWC image (64,96,3) into CHW using transpose; save it as chw.",
    "starter": "import numpy as np\nhwc=np.arange(64*96*3).reshape(64,96,3)\n# chw = ...",
    "checks": [
      {
        "name": "Correct CHW shape",
        "code": "assert chw.shape==(3,64,96)"
      },
      {
        "name": "Channels were moved, not reshaped",
        "code": "assert bool(np.array_equal(chw,hwc.transpose(2,0,1)))"
      }
    ]
  },
  "25": {
    "prompt": "Stack four separate CHW images into a NumPy array called batch of shape (4,3,128,128).",
    "starter": "import numpy as np\nimage=np.ones((3,128,128),dtype=np.float32)\n# batch = ...",
    "checks": [
      {
        "name": "Four images in NCHW",
        "code": "assert batch.shape==(4,3,128,128)"
      },
      {
        "name": "All values preserved",
        "code": "assert bool(np.all(batch==1))"
      }
    ]
  },
  "26": {
    "prompt": "Convert the given BGR pixel to RGB using NumPy channel slicing (no OpenCV dependency). Save the result as rgb.",
    "starter": "import numpy as np\nbgr=np.array([[[10,20,200]]],dtype=np.uint8)\n# rgb = ...",
    "checks": [
      {
        "name": "R and B channels swapped",
        "code": "assert rgb.shape==(1,1,3) and rgb[0,0].tolist()==[200,20,10]"
      },
      {
        "name": "G channel unchanged",
        "code": "assert int(rgb[0,0,1])==20"
      }
    ]
  },
  "27": {
    "prompt": "Create hwc (128,128,3) float32; convert it to chw (3,128,128); add batch axis -> batch (1,3,128,128).",
    "starter": "import numpy as np\n# hwc = ...\n# chw = ...\n# batch = ...",
    "checks": [
      {
        "name": "HWC correct",
        "code": "assert hwc.shape==(128,128,3) and hwc.dtype==np.float32"
      },
      {
        "name": "CHW correct",
        "code": "assert chw.shape==(3,128,128)"
      },
      {
        "name": "NCHW correct",
        "code": "assert batch.shape==(1,3,128,128)"
      }
    ]
  },
  "28": {
    "prompt": "Define verify_shape(batch) using assert. It must accept ONLY float32 batches shaped (1,3,128,128) and raise AssertionError otherwise.",
    "starter": "import numpy as np\ndef verify_shape(batch):\n    # TODO: use assert for both shape and dtype\n    pass",
    "checks": [
      {
        "name": "Valid batch accepted",
        "code": "verify_shape(np.zeros((1,3,128,128),dtype=np.float32))"
      },
      {
        "name": "Wrong shape rejected",
        "code": "try:\n    verify_shape(np.zeros((3,128,128),dtype=np.float32))\nexcept AssertionError:\n    pass\nelse:\n    raise AssertionError('Wrong shape was not rejected')"
      },
      {
        "name": "Wrong dtype rejected",
        "code": "try:\n    verify_shape(np.zeros((1,3,128,128),dtype=np.uint8))\nexcept AssertionError:\n    pass\nelse:\n    raise AssertionError('Wrong dtype was not rejected')"
      }
    ]
  },
  "01": {
    "prompt": "Create name (str), age (int), height (float), and studying (bool).",
    "starter": "# Define these four variables yourself:\n# name = ...\n# age = ...\n# height = ...\n# studying = ...",
    "checks": [
      {
        "name": "Correct data types",
        "code": "assert type(name) is str and name.strip()\nassert type(age) is int\nassert type(height) is float\nassert type(studying) is bool"
      }
    ]
  },
  "02": {
    "prompt": "Make cities = ['Taipei', 'Taichung', 'Tainan']; replace the SECOND city with 'Hsinchu'.",
    "starter": "cities = ['Taipei', 'Taichung', 'Tainan']\n# Change the second city here:",
    "checks": [
      {
        "name": "List size and order",
        "code": "assert len(cities)==3 and cities == ['Taipei', 'Hsinchu', 'Tainan']"
      }
    ]
  },
  "03": {
    "prompt": "Define describe_temperature(temp): above 30 -> 'Hot'; 20 to 30 -> 'Warm'; otherwise 'Cool'.",
    "starter": "def describe_temperature(temp):\n    # TODO: use if / elif / else\n    pass",
    "checks": [
      {
        "name": "Hot",
        "code": "assert describe_temperature(31)=='Hot'"
      },
      {
        "name": "Warm boundaries",
        "code": "assert describe_temperature(20)=='Warm' and describe_temperature(30)=='Warm'"
      },
      {
        "name": "Cool",
        "code": "assert describe_temperature(19)=='Cool'"
      }
    ]
  },
  "04": {
    "prompt": "Use a while loop inside count_to_four() to return [1,2,3,4].",
    "starter": "def count_to_four():\n    numbers = []\n    # TODO: use while to append 1 through 4\n    return numbers",
    "checks": [
      {
        "name": "Correct loop output",
        "code": "assert count_to_four()==[1,2,3,4]"
      }
    ]
  },
  "05": {
    "prompt": "Implement add_tax(price): return the price after adding 5% tax.",
    "starter": "def add_tax(price):\n    # TODO\n    pass",
    "checks": [
      {
        "name": "Tax for 100",
        "code": "assert abs(add_tax(100)-105)<1e-9"
      },
      {
        "name": "Tax for 0 and 80",
        "code": "assert add_tax(0)==0 and abs(add_tax(80)-84)<1e-9"
      }
    ]
  },
  "06": {
    "prompt": "Create a products dictionary with at least 3 prices. Include 'apple' and change its price to 200.",
    "starter": "products = {'apple': 100, 'egg': 50, 'rice': 75}\n# TODO: update the apple price",
    "checks": [
      {
        "name": "Dictionary has three prices",
        "code": "assert isinstance(products,dict) and len(products)>=3"
      },
      {
        "name": "Lookup and update",
        "code": "assert products.get('apple') == 200"
      }
    ]
  },
  "07": {
    "prompt": "Remove duplicates from [1,2,1,3,2] using a set, save it as unique; set four_present to whether 4 is in unique.",
    "starter": "numbers = [1,2,1,3,2]\n# unique = ...\n# four_present = ...",
    "checks": [
      {
        "name": "Unique values",
        "code": "assert isinstance(unique,set) and unique=={1,2,3}"
      },
      {
        "name": "Membership result",
        "code": "assert four_present is False"
      }
    ]
  },
  "08": {
    "prompt": "Use a list comprehension to save the cubes of odd numbers in [1,2,3,4,5] into cubes.",
    "starter": "numbers = [1,2,3,4,5]\n# cubes = ...",
    "checks": [
      {
        "name": "Odd-number cubes",
        "code": "assert cubes==[1,27,125]"
      }
    ]
  },
  "09": {
    "prompt": "Write count_items(numbers), returning a dictionary of item frequencies. Use a loop and dictionary.",
    "starter": "def count_items(numbers):\n    counts = {}\n    # TODO\n    return counts",
    "checks": [
      {
        "name": "Counts repeated numbers",
        "code": "assert count_items([2,3,2,4,3,2])=={2:3,3:2,4:1}"
      },
      {
        "name": "Empty input",
        "code": "assert count_items([])=={}"
      },
      {
        "name": "Strings also work",
        "code": "assert count_items(['x','y','x'])=={'x':2,'y':1}"
      }
    ]
  }
};
export const PYTHON_LESSON_PAGES = [
  { slug: "python-fundamentals-01-08", title: "Python Fundamentals", start: 1, end: 8 },
  { slug: "python-coding-interviews-09-14", title: "Python Coding Interviews", start: 9, end: 14 },
  { slug: "numpy-essentials-15-22", title: "NumPy Essentials", start: 15, end: 22 },
  { slug: "numpy-for-computer-vision-23-28", title: "NumPy for Computer Vision", start: 23, end: 28 }
] as const;
