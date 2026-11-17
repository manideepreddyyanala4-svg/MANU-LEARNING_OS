/** Interview-first explanations, reviewed against the existing guided Python and NumPy lesson topics.
 * Display-only additions: these never overwrite user-authored Learning Library notes.
 */
export type InterviewBrief = {
  term: string;
  definition: string;
  why: string;
  example: string;
  followUp: string;
  followUpAnswer: string;
};
type Row = readonly [string, string, string, string, string, string, string];
function fromRows(rows: readonly Row[]): Record<string, InterviewBrief> {
  return Object.fromEntries(rows.map(([key, term, definition, why, example, followUp, followUpAnswer]) =>
    [key, { term, definition, why, example, followUp, followUpAnswer }]
  )) as Record<string, InterviewBrief>;
}

export const pythonInterview: Record<string, InterviewBrief> = fromRows([
  [
    "01",
    "Python program",
    "A Python program is a sequence of instructions executed by the Python interpreter.",
    "It automates repeatable tasks and lets you test each result.",
    "A script can read image filenames and print their counts.",
    "How is a script different from the interpreter?",
    "A script contains instructions; the interpreter executes them."
  ],
  [
    "02",
    "Variable",
    "A variable is a name that refers to a Python object or value.",
    "Names let code reuse information without repeating literals.",
    "image_count = 10 stores the integer 10 under a name.",
    "Does assigning b = a copy a list?",
    "No. Both names initially refer to the same list; use a deliberate copy when independent mutation is needed."
  ],
  [
    "03",
    "Operator",
    "An operator performs an operation on values, such as addition, comparison or logical testing.",
    "It expresses calculations and conditions in readable code.",
    "5 // 2 gives 2, but 5 / 2 gives 2.5.",
    "What changes an expression's order of evaluation?",
    "Parentheses make precedence explicit; otherwise operators follow Python's precedence rules."
  ],
  [
    "04",
    "Conditional statement",
    "An if/elif/else statement runs different blocks depending on Boolean conditions.",
    "It lets a program make decisions about inputs and results.",
    "if confidence >= 0.8: accept = True checks a threshold.",
    "Does elif run after an earlier true if branch?",
    "No. Only the first matching branch of one if/elif/else chain runs."
  ],
  [
    "05",
    "Loop",
    "A loop repeats a block of code, either over items with for or while a condition stays true with while.",
    "It processes collections and repeated tasks without copying instructions.",
    "for name in image_names: print(name) visits each filename.",
    "When would while risk an infinite loop?",
    "When the condition never becomes false and the loop has no reachable break."
  ],
  [
    "06",
    "String",
    "A string is an immutable sequence of Unicode characters used to represent text.",
    "It supports reading filenames, labels and messages.",
    "'hand_01.png'[:4] gives 'hand'.",
    "Does slicing a string modify the original?",
    "No. Strings are immutable; slicing creates a new string value."
  ],
  [
    "07",
    "List",
    "A Python list is an ordered, mutable collection that can hold different types of objects.",
    "Use it for groups of values when you need to add, remove or replace items.",
    "scores = [0.7, 0.9]; scores.append(0.8) adds an item.",
    "How is a list different from a NumPy array?",
    "Lists hold references to Python objects and may mix types; NumPy ndarrays use a homogeneous dtype and efficient array operations."
  ],
  [
    "08",
    "Tuple",
    "A tuple is an ordered collection whose elements cannot be reassigned after creation.",
    "It groups values that should keep the same positions and structure.",
    "shape = (224, 224, 3) stores height, width and channels.",
    "Can a tuple contain a mutable list?",
    "Yes. Tuple membership is fixed, but a list inside a tuple can still be mutated."
  ],
  [
    "09",
    "Set",
    "A set is an unordered collection of unique, hashable elements.",
    "It is useful for membership checks and removing duplicate values.",
    "set([2, 2, 3]) gives {2, 3}.",
    "Can a list be a set element?",
    "Not normally: lists are mutable and unhashable."
  ],
  [
    "10",
    "Dictionary",
    "A dictionary maps unique hashable keys to values and preserves insertion order.",
    "It supports fast lookups and frequency counting.",
    "counts['hand'] = 3 associates a key with a count.",
    "What happens when you assign an existing key?",
    "Its value is replaced, rather than creating a duplicate key."
  ],
  [
    "11",
    "Mutability",
    "Mutability means an object can change its contents in place; immutable objects cannot.",
    "It determines whether aliases see each other's changes.",
    "a = [1]; b = a; b.append(2) also changes what a sees.",
    "Is reassignment the same as mutation?",
    "No. a = [3] rebinds a name, while a.append(3) modifies the shared list."
  ],
  [
    "12",
    "Function",
    "A function is a named reusable block of code that can receive inputs and return an output.",
    "It breaks large programs into smaller, testable pieces.",
    "def square(x): return x*x defines a function.",
    "How are parameters different from arguments?",
    "Parameters are names in the definition; arguments are values supplied when calling it."
  ],
  [
    "13",
    "Return value and scope",
    "A return statement exits a function and sends a value to its caller; scope determines where names can be accessed.",
    "It makes data flow and function boundaries explicit.",
    "def add(a,b): return a+b returns a value rather than printing it.",
    "What is the difference between print and return?",
    "print displays output; return hands a value to the caller for further use."
  ],
  [
    "14",
    "Comprehension",
    "A comprehension is a compact expression that constructs a list, set or dictionary from an iterable.",
    "It can express simple transformations clearly.",
    "[x*x for x in [1,2,3]] gives [1,4,9].",
    "When should you avoid a comprehension?",
    "When nested logic becomes hard to read; use a regular loop instead."
  ],
  [
    "15",
    "Iterable and built-ins",
    "An iterable is an object whose items can be visited one at a time; Python built-ins help process them.",
    "Functions like enumerate, zip, any and all simplify common loops.",
    "list(enumerate(['a','b'])) gives [(0,'a'),(1,'b')].",
    "Does zip always raise when lengths differ?",
    "No. Standard zip stops at the shortest input; zip(..., strict=True) checks lengths."
  ],
  [
    "16",
    "Parsing and regular expressions",
    "Parsing converts input text into structured values; a regular expression describes a pattern to match text.",
    "It helps extract IDs, numbers and file naming patterns.",
    "A regex can extract the digits in 'subject_013'.",
    "Should every string operation use regex?",
    "No. Prefer split, slicing or other simple methods when the pattern is straightforward."
  ],
  [
    "17",
    "File handling",
    "File handling means reading from and writing to files, usually through file objects.",
    "It loads images, CSV data and saved results safely.",
    "with open('notes.txt', encoding='utf-8') as f: text = f.read().",
    "Why use with?",
    "It closes the resource when the block exits, including if an exception occurs."
  ],
  [
    "18",
    "CSV and JSON",
    "CSV represents rows and columns as delimited text; JSON represents structured data with arrays, objects and primitive values.",
    "Both move data between programs, but support different structures.",
    "A CSV has image_id,label columns; JSON can store nested annotation lists.",
    "Can CSV represent nested data naturally?",
    "Not directly. JSON is better suited to hierarchical structures."
  ],
  [
    "19",
    "Exception",
    "An exception is an object representing an error or unexpected condition during execution.",
    "Handling known exceptions makes programs fail clearly and recover appropriately.",
    "int('abc') raises ValueError.",
    "Should you catch every exception with except Exception?",
    "Usually not. Catch specific expected errors and let unexpected failures remain visible."
  ],
  [
    "20",
    "Module and package",
    "A module is a Python file containing code; a package organizes related modules.",
    "They make projects reusable and keep dependencies manageable.",
    "import pathlib loads a module; a venv isolates installed packages.",
    "What is a virtual environment?",
    "An isolated set of Python packages for a project, reducing version conflicts."
  ],
  [
    "21",
    "Class and object",
    "A class defines attributes and methods; an object is an instance created from that class.",
    "They group data and behavior around a clear concept.",
    "An ImageRecord object may hold a path and a validation method.",
    "Is a class the same as an object?",
    "No. The class defines the structure; objects are instances with their own state."
  ],
  [
    "22",
    "Type hint",
    "A type hint describes the intended types of parameters, variables or return values.",
    "It helps readers, editors and static type checkers catch errors earlier.",
    "def count(xs: list[int]) -> int: return len(xs).",
    "Do Python type hints enforce types at runtime by default?",
    "No. Standard hints are not automatically runtime-enforced."
  ],
  [
    "23",
    "Logging and validation",
    "Logging records events; assertions test programmer assumptions; validation checks whether external input is acceptable.",
    "They help find problems and protect data pipelines.",
    "assert image.ndim == 3 checks a development assumption.",
    "Should assert be used for security-critical input validation?",
    "No. Assertions may be disabled; use explicit input checks and exceptions."
  ],
  [
    "24",
    "Unit test",
    "A unit test checks one small behavior using inputs and expected results.",
    "Tests catch regressions and reveal incorrect assumptions.",
    "assert add(2,3) == 5 checks a simple function.",
    "Does one passing test prove a function correct?",
    "No. Tests establish only the cases and properties they actually check."
  ]
]);

export const numpyInterview: Record<string, InterviewBrief> = fromRows([
  [
    "01",
    "NumPy array (ndarray)",
    "A NumPy ndarray is a multidimensional array of elements with one data type, described by its shape and dtype.",
    "It stores pixels and numerical data for efficient vectorized computation.",
    "np.array([[1,2],[3,4]]) has shape (2,2) and dtype inferred from its values.",
    "How is an ndarray different from a Python list?",
    "An ndarray uses a common dtype and supports elementwise array operations; a list stores Python object references and may mix types."
  ],
  [
    "02",
    "Array creation",
    "Array creation allocates or converts data into an ndarray with a chosen shape, dtype and initial values.",
    "It creates reproducible inputs, masks and model tensors.",
    "np.zeros((2,3), dtype=np.uint8) creates six zeros in two rows.",
    "How do zeros and empty differ?",
    "zeros initializes elements to zero; empty allocates memory without initializing values."
  ],
  [
    "03",
    "Indexing and slicing",
    "Indexing selects elements by position; slicing selects a range; NumPy basic slicing usually returns a view.",
    "It lets you address precise pixels or regions without copying unnecessarily.",
    "img[2,4] reads row 2, column 4.",
    "Does every NumPy slice copy data?",
    "No. Basic slicing commonly shares memory; advanced indexing commonly produces a copy."
  ],
  [
    "04",
    "Boolean mask",
    "A Boolean mask is an array of True/False conditions used to select or modify elements.",
    "It supports thresholding, filtering and region selection.",
    "a[a>100] selects all values above 100.",
    "Is a Boolean mask always the same as a 0/255 OpenCV mask?",
    "No. They represent related selection concepts but have different data types and numeric encodings."
  ],
  [
    "05",
    "Reshape and transpose",
    "Reshape changes how elements are grouped into dimensions; transpose changes the order of axes.",
    "They prepare arrays for algorithms expecting specific dimensions.",
    "a.reshape(2,3) changes shape, while a.T exchanges rows and columns of a 2D array.",
    "Does reshape always copy?",
    "No. It can return a view when the memory layout allows, otherwise a copy."
  ],
  [
    "06",
    "Stack and concatenate",
    "Concatenation joins arrays along an existing axis; stacking creates a new axis.",
    "They combine images and batches while preserving intended shape.",
    "np.stack([a,b],axis=0) makes a new batch dimension.",
    "How is stack different from concatenate?",
    "stack adds a new axis; concatenate extends an existing one."
  ],
  [
    "07",
    "Broadcasting",
    "Broadcasting lets NumPy apply operations to compatible array shapes without explicitly copying smaller operands.",
    "It makes elementwise image transformations concise and efficient.",
    "An RGB image of shape (H,W,3) can subtract a length-3 channel mean.",
    "When are shapes incompatible?",
    "When, compared from the right, a pair of dimensions differs and neither is 1."
  ],
  [
    "08",
    "Axis",
    "An axis is one dimension of a NumPy array; an axis argument specifies the dimension across which an operation is applied.",
    "It controls which rows, columns or channels are reduced.",
    "For shape (2,3), mean(axis=0) returns three column means.",
    "Does axis=0 always mean channel?",
    "No. Axis meanings depend on the particular array layout."
  ],
  [
    "09",
    "Vectorization",
    "Vectorization expresses operations on whole arrays through compiled numerical routines instead of Python loops.",
    "It often improves speed and readability for large numerical workloads.",
    "img.astype(float)/255.0 normalizes all pixels at once.",
    "Is vectorization guaranteed faster for every task?",
    "No. Temporary arrays, memory access and small workloads can change performance."
  ],
  [
    "10",
    "dtype and overflow",
    "A dtype defines the type and representation of each array element, including its numeric range and precision.",
    "It affects image arithmetic and memory usage.",
    "uint8 stores integers from 0 to 255; adding with uint8 output can overflow.",
    "Does casting to uint8 automatically protect from overflow?",
    "No. Clip or compute in a wider dtype when necessary."
  ],
  [
    "11",
    "Floating-point precision",
    "Floating-point values approximate real numbers using finite binary precision; NaN represents an undefined numerical result.",
    "Precision affects comparisons, scores and reproducibility.",
    "0.1+0.2 is not exactly 0.3 in typical binary floating point.",
    "Should you compare floats with == in all calculations?",
    "Often use an appropriate tolerance such as np.isclose instead."
  ],
  [
    "12",
    "Matrix multiplication",
    "Matrix multiplication combines rows of one matrix with columns of another through dot products.",
    "It underlies neural network layers and linear transformations.",
    "A (2,3) matrix multiplied by a (3,4) matrix yields shape (2,4).",
    "How is @ different from * for NumPy arrays?",
    "@ performs matrix multiplication; * multiplies elements with broadcasting."
  ],
  [
    "13",
    "L2 normalization",
    "L2 normalization divides a nonzero vector by its Euclidean length so its norm becomes 1.",
    "It makes vector comparisons depend on direction rather than scale.",
    "[3,4]/5 becomes [0.6,0.8].",
    "What must you check before normalizing?",
    "Handle a zero norm to avoid division by zero."
  ],
  [
    "14",
    "Cosine similarity",
    "Cosine similarity measures the angle alignment of two nonzero vectors using their normalized dot product.",
    "It compares embeddings by direction in many retrieval and verification systems.",
    "Vectors [1,0] and [0,1] have cosine similarity 0.",
    "Is cosine similarity a calibrated probability?",
    "No. It is a geometric score, not a probability without separate calibration."
  ],
  [
    "15",
    "Random generator",
    "A random-number generator produces a deterministic sequence of pseudorandom values from a state or seed.",
    "It helps make sampling, data augmentation and tests reproducible.",
    "np.random.default_rng(17) creates a reproducible generator.",
    "Does a fixed seed guarantee complete model-training determinism?",
    "No. GPU kernels, software versions and other nondeterministic steps may still matter."
  ],
  [
    "16",
    "Image tensor layout",
    "HWC, CHW and NCHW name the order of height, width, channels and batch dimensions in an image array.",
    "Models require the expected axis order.",
    "A (224,224,3) RGB image can become (1,3,224,224) for a channel-first model.",
    "Is reshaping enough to convert HWC to CHW?",
    "No. Use transpose or moveaxis to reorder dimensions, not a raw reshape."
  ],
  [
    "17",
    "RGB versus BGR",
    "RGB and BGR use the same three colour channels but store them in different orders.",
    "Mixing them causes wrong colours and incorrect model input.",
    "OpenCV often decodes a colour image as BGR; many displays expect RGB.",
    "Does transpose swap RGB and BGR?",
    "No. Reorder the channel axis, for example image[..., ::-1] for a standard three-channel array."
  ],
  [
    "18",
    "Grayscale image",
    "A grayscale image stores one intensity per pixel instead of separate red, green and blue channel values.",
    "It simplifies operations based on brightness.",
    "A grayscale image might have shape (128,128) and dtype uint8.",
    "Is grayscale a binary mask?",
    "No. Grayscale can have many intensity levels; a binary mask has two logical classes."
  ],
  [
    "19",
    "Image normalization",
    "Image normalization transforms pixel values into a defined numerical range or distribution expected by an algorithm.",
    "It keeps model inputs comparable with training conditions.",
    "A uint8 value 128 becomes about 0.502 when divided by 255.",
    "Is normalization the same as contrast enhancement?",
    "No. Rescaling for model input and altering local/global contrast are different operations."
  ],
  [
    "20",
    "Array memory layout",
    "An array's strides describe how many bytes to move in memory when its indices change.",
    "Layout affects whether an operation returns a view and whether code can process it efficiently.",
    "A transposed view can be non-contiguous without copying values.",
    "Does an ndarray have to be contiguous?",
    "No. Many valid arrays are strided views."
  ],
  [
    "21",
    "Shape debugging",
    "Shape debugging checks the number of dimensions, their lengths and data types at each pipeline stage.",
    "It catches silent CV/ML errors before training or evaluation.",
    "assert image.shape[-1] == 3 checks a channel-last RGB input.",
    "Why check shape and dtype together?",
    "A correct shape with the wrong dtype can still produce incorrect computations."
  ]
]);
