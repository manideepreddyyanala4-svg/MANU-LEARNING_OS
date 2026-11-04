import type { PythonRoadmapLesson } from './python-roadmap-types';
export const pythonLessonsC: PythonRoadmapLesson[] = [
  {
    "id": "17",
    "shortTitle": "Read files with with, pathlib and encoding",
    "essence": "Files hold information beyond a program run. with opens a resource and closes it safely.",
    "analogy": "Borrow a book from a library, read it, and return it automatically when leaving.",
    "why": "Real Python internships involve loading image lists, reading log files and handling file paths safely.",
    "concepts": [
      {
        "label": "open / with",
        "explain": "with open('file.txt', 'r', encoding='utf-8') as f: reads text and closes it even when errors occur."
      },
      {
        "label": "Modes",
        "explain": "'r' read; 'w' write/overwrite; 'a' append; 'rb' read binary."
      },
      {
        "label": "pathlib.Path",
        "explain": "Path objects combine directories with / and offer .name, .suffix, .stem and .exists()."
      },
      {
        "label": "UTF-8 encoding",
        "explain": "Use encoding='utf-8' for text (including Chinese and Telugu) to avoid environment-dependent decoding."
      }
    ],
    "flow": [
      "Open a file/resource",
      "Read inside with",
      "Close automatically"
    ],
    "example": "from io import StringIO\ntext = 'P01\\n\\nP02\\n'\nwith StringIO(text) as handle:\n    ids = [line.strip() for line in handle if line.strip()]\nprint(ids)",
    "output": "['P01', 'P02']",
    "walkthrough": [
      "StringIO gives a file-like object in memory so this example runs in the browser.",
      "with controls its lifetime.",
      "The comprehension strips and filters blank lines.",
      "An actual file uses with open(path, 'r', encoding='utf-8') as f:."
    ],
    "deeper": [
      {
        "question": "Why use with instead of open without closing?",
        "answer": "with reliably releases file handles, including when an exception occurs. File descriptors are limited resources."
      },
      {
        "question": "Why use pathlib?",
        "answer": "It makes paths easier to compose across Windows, Linux and other OSes, rather than string concatenation with slashes."
      }
    ],
    "mistakes": [
      {
        "mistake": "Opening an existing file using mode 'w' just to read it",
        "correction": "'w' truncates the file. Use 'r' for reading."
      },
      {
        "mistake": "Hardcoding Windows path separators everywhere",
        "correction": "Use pathlib.Path('data') / 'image.png' for portable paths."
      }
    ],
    "task": "Write read_nonempty_lines(text) using io.StringIO and with. Return stripped nonempty lines as a list.",
    "starter": "from io import StringIO\n\ndef read_nonempty_lines(text):\n    # Use with StringIO(text) as handle.\n    pass",
    "checks": [
      {
        "name": "Two IDs and blank lines",
        "code": "assert read_nonempty_lines('P01\\n\\n P02 \\n') == ['P01','P02']"
      },
      {
        "name": "Empty input",
        "code": "assert read_nonempty_lines('')==[]"
      },
      {
        "name": "Unicode text",
        "code": "assert read_nonempty_lines('臺中\\n Telangana ') == ['臺中','Telangana']"
      }
    ],
    "hint": "with StringIO(text) as f: return [line.strip() for line in f if line.strip()]",
    "solution": "from io import StringIO\n\ndef read_nonempty_lines(text):\n    with StringIO(text) as handle:\n        return [line.strip() for line in handle if line.strip()]",
    "quiz": {
      "question": "What does with open(...) guarantee?",
      "choices": [
        "That the file will close when the block exits",
        "That the file is saved to the cloud",
        "That the file has no errors"
      ],
      "correct": 0,
      "explain": "The context manager closes the file even when execution exits abnormally."
    },
    "recap": [
      "with closes resources safely",
      "'w' can erase file contents",
      "UTF-8 handles multilingual text"
    ],
    "docs": "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files"
  },
  {
    "id": "18",
    "shortTitle": "Read and write CSV and JSON",
    "essence": "CSV stores table-like rows; JSON stores nested values such as dictionaries and lists.",
    "analogy": "CSV is a spreadsheet with columns; JSON is a labeled box containing other boxes.",
    "why": "Employers expect data cleaning, structured model outputs and robust handling of malformed records.",
    "concepts": [
      {
        "label": "csv.DictReader",
        "explain": "Converts CSV rows into dictionaries keyed by column names; CSV values start as strings."
      },
      {
        "label": "json.loads / dumps",
        "explain": "loads parses a JSON string into Python values; dumps converts compatible Python data to JSON text."
      },
      {
        "label": "Error validation",
        "explain": "CSV rows can be incomplete, and JSON parsing can raise JSONDecodeError. Validate fields and types."
      },
      {
        "label": "Serialization differences",
        "explain": "JSON true/false/null map to Python True/False/None. Avoid dumping private user data."
      }
    ],
    "flow": [
      "Structured text",
      "Parse into Python",
      "Validate and use"
    ],
    "example": "import csv\nimport io\nrows = list(csv.DictReader(io.StringIO('id,score\\nP01,0.9\\n')))\nprint(rows[0]['id'])\nprint(float(rows[0]['score']))",
    "output": "P01\n0.9",
    "walkthrough": [
      "StringIO supplies a CSV text stream in memory.",
      "DictReader reads headings and creates dictionaries.",
      "CSV values are text, so convert scores to floats deliberately."
    ],
    "deeper": [
      {
        "question": "Can JSON include a tuple or a set as-is?",
        "answer": "JSON has arrays, not tuples or sets. Python tuples usually become JSON arrays; sets need explicit conversion."
      },
      {
        "question": "How to handle corrupt data?",
        "answer": "Validate required fields and numeric ranges, record rejects, and never silently change labels to make a metric look better."
      }
    ],
    "mistakes": [
      {
        "mistake": "Using float(row['score']) without validation",
        "correction": "Handle ValueError, missing keys, blanks and nonfinite scores as appropriate."
      },
      {
        "mistake": "Treating CSV numbers as numeric automatically",
        "correction": "CSV generally reads numbers as strings; convert and check."
      }
    ],
    "task": "Write valid_scores(csv_text) returning list of (id, float_score). Skip rows with missing ID, missing score, or non-numeric score.",
    "starter": "import csv\nfrom io import StringIO\n\ndef valid_scores(csv_text):\n    result = []\n    # DictReader, strip, float, try/except.\n    pass",
    "checks": [
      {
        "name": "Valid rows",
        "code": "assert valid_scores('id,score\\nP01,0.5\\nP02,0.8\\n')==[('P01',0.5),('P02',0.8)]"
      },
      {
        "name": "Bad score skipped",
        "code": "assert valid_scores('id,score\\nP01,bad\\nP02,0.4\\n')==[('P02',0.4)]"
      },
      {
        "name": "Empty name skipped",
        "code": "assert valid_scores('id,score\\n,0.5\\nP03,0.9\\n')==[('P03',0.9)]"
      }
    ],
    "hint": "Loop over csv.DictReader(StringIO(csv_text)); use row.get('id'), row.get('score'); convert score inside try/except (TypeError, ValueError).",
    "solution": "import csv\nfrom io import StringIO\n\ndef valid_scores(csv_text):\n    result = []\n    for row in csv.DictReader(StringIO(csv_text)):\n        name = (row.get('id') or '').strip()\n        if not name:\n            continue\n        try:\n            score = float(row.get('score'))\n        except (TypeError, ValueError):\n            continue\n        result.append((name, score))\n    return result",
    "quiz": {
      "question": "What datatype is row['score'] immediately after csv.DictReader?",
      "choices": [
        "float",
        "str (usually)",
        "bool"
      ],
      "correct": 1,
      "explain": "CSV fields are text until explicitly converted."
    },
    "recap": [
      "CSV rows are strings",
      "JSON preserves structured types",
      "Validate before trusting records"
    ],
    "docs": "https://docs.python.org/3/library/csv.html"
  },
  {
    "id": "19",
    "shortTitle": "Exceptions and useful error messages",
    "essence": "Exceptions report when normal execution cannot continue. Catch specific cases you know how to handle.",
    "analogy": "A safety switch: if the machine receives an unsafe input, it switches to a known fallback.",
    "why": "Production Python should detect malformed rows, missing files and division errors instead of silently crashing.",
    "concepts": [
      {
        "label": "try / except",
        "explain": "Put risky code in try; catch only errors you can handle in except."
      },
      {
        "label": "Specific exceptions",
        "explain": "ZeroDivisionError, ValueError, TypeError and FileNotFoundError describe different problems."
      },
      {
        "label": "raise",
        "explain": "Use raise ValueError('message') to reject invalid input explicitly."
      },
      {
        "label": "finally / tracebacks",
        "explain": "finally runs after try/except cleanup. A traceback shows where an uncaught error came from."
      }
    ],
    "flow": [
      "Try operation",
      "If exception occurs",
      "Handle or raise"
    ],
    "example": "def divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n\nprint(divide(6, 2))\nprint(divide(6, 0))",
    "output": "3.0\nNone",
    "walkthrough": [
      "Division is attempted inside try.",
      "Valid division returns a float.",
      "Only ZeroDivisionError gets a fallback None.",
      "Other unexpected errors still surface for debugging."
    ],
    "deeper": [
      {
        "question": "Why not except Exception: pass?",
        "answer": "It hides unexpected bugs and corrupt data. Catch specific known failures or re-raise with context."
      },
      {
        "question": "What is finally for?",
        "answer": "For actions that must run whether a block succeeds or fails, such as cleanup not already handled by a context manager."
      }
    ],
    "mistakes": [
      {
        "mistake": "Using a bare except and doing nothing",
        "correction": "Catch specific errors, log/describe them, or re-raise."
      },
      {
        "mistake": "Treating every exception as 'missing data'",
        "correction": "Distinguish wrong type, wrong value, absent file and system errors."
      }
    ],
    "task": "Write safe_ratio(a,b): return a/b for normal numbers; return None for division by zero or invalid types.",
    "starter": "def safe_ratio(a, b):\n    # Catch ZeroDivisionError and TypeError.\n    pass",
    "checks": [
      {
        "name": "Valid ratio",
        "code": "assert safe_ratio(10,2)==5.0"
      },
      {
        "name": "Zero divisor",
        "code": "assert safe_ratio(1,0) is None"
      },
      {
        "name": "Invalid type",
        "code": "assert safe_ratio('hello',2) is None"
      },
      {
        "name": "Negative divisor",
        "code": "assert safe_ratio(10,-2)==-5.0"
      }
    ],
    "hint": "try: return a/b; except (ZeroDivisionError, TypeError): return None",
    "solution": "def safe_ratio(a, b):\n    try:\n        return a / b\n    except (ZeroDivisionError, TypeError):\n        return None",
    "quiz": {
      "question": "What is wrong with except: pass around an entire training script?",
      "choices": [
        "It hides errors and leaves faulty results",
        "It always fixes bugs",
        "It prints tracebacks"
      ],
      "correct": 0,
      "explain": "Silently swallowing exceptions prevents debugging and safe failure handling."
    },
    "recap": [
      "Catch specific errors",
      "Raise invalid input errors",
      "Don't hide bugs with pass"
    ],
    "docs": "https://docs.python.org/3/tutorial/errors.html"
  },
  {
    "id": "20",
    "shortTitle": "Modules, imports, pip and virtual environments",
    "essence": "Modules organize code. Packages group modules. Virtual environments isolate project dependencies.",
    "analogy": "Every project gets its own toolbox, rather than mixing all tools in one shared drawer.",
    "why": "Taiwan internship teams expect you to run someone else's Python repo reproducibly.",
    "concepts": [
      {
        "label": "import",
        "explain": "import math loads a module, then math.sqrt(9) uses its function."
      },
      {
        "label": "Modules / packages",
        "explain": "A .py module is a file of definitions; packages organize related modules."
      },
      {
        "label": "pip and dependencies",
        "explain": "python -m pip install package installs into the chosen Python environment; use project requirements or lockfiles."
      },
      {
        "label": "venv",
        "explain": "python -m venv .venv creates an isolated environment. Activation depends on operating system."
      }
    ],
    "flow": [
      "Project folder",
      "Create venv and install",
      "Import/run code"
    ],
    "example": "import math\nprint(math.sqrt(81))\nfrom statistics import mean\nprint(mean([3, 6, 9]))",
    "output": "9.0\n6",
    "walkthrough": [
      "math is in Python's standard library.",
      "sqrt(81) calculates a square root.",
      "statistics.mean is imported by name.",
      "The average of 3,6,9 is 6."
    ],
    "deeper": [
      {
        "question": "What commands set up a local environment?",
        "answer": "python -m venv .venv; activate its Python (Windows: .venv\\\\Scripts\\\\activate, Linux/macOS: source .venv/bin/activate); then python -m pip install -r requirements.txt."
      },
      {
        "question": "Why use python -m pip rather than plain pip?",
        "answer": "It more clearly ties package installation to the Python executable you are running."
      }
    ],
    "mistakes": [
      {
        "mistake": "Installing packages in the wrong Python environment",
        "correction": "Check python --version, python -m pip --version and the active venv."
      },
      {
        "mistake": "Listing an imported package as an independently mastered skill",
        "correction": "Master its actual tasks and code; importing alone is not competence."
      }
    ],
    "task": "Write root_if_nonnegative(value): use math.sqrt for nonnegative numbers, return None for negative numbers.",
    "starter": "import math\n\ndef root_if_nonnegative(value):\n    # Reject negatives, otherwise use math.sqrt.\n    pass",
    "checks": [
      {
        "name": "Perfect square",
        "code": "assert root_if_nonnegative(49)==7.0"
      },
      {
        "name": "Zero",
        "code": "assert root_if_nonnegative(0)==0.0"
      },
      {
        "name": "Negative",
        "code": "assert root_if_nonnegative(-9) is None"
      }
    ],
    "hint": "if value < 0: return None; return math.sqrt(value)",
    "solution": "import math\n\ndef root_if_nonnegative(value):\n    if value < 0:\n        return None\n    return math.sqrt(value)",
    "quiz": {
      "question": "What does python -m venv .venv create?",
      "choices": [
        "A project-specific Python environment",
        "A new GitHub account",
        "A cloud GPU"
      ],
      "correct": 0,
      "explain": "venv creates a local environment for isolated packages."
    },
    "recap": [
      "Modules organize code",
      "venv isolates packages",
      "python -m pip targets the chosen Python"
    ],
    "docs": "https://docs.python.org/3/tutorial/venv.html"
  },
  {
    "id": "21",
    "shortTitle": "Classes, objects and dataclasses",
    "essence": "A class groups state (data) and methods (actions). An object is one instance of the class.",
    "analogy": "A class is a blank student record form; each object is a filled-out record for one student.",
    "why": "PyTorch nn.Module, dataset classes and production Python use objects heavily.",
    "concepts": [
      {
        "label": "class and __init__",
        "explain": "class defines a template; __init__ initializes each new instance."
      },
      {
        "label": "self",
        "explain": "self refers to the current object; self.count is state saved on that object."
      },
      {
        "label": "Methods",
        "explain": "Functions defined on a class access or change object state."
      },
      {
        "label": "dataclass",
        "explain": "@dataclass generates common methods for classes mainly storing data; use field(default_factory=list) for mutable lists."
      }
    ],
    "flow": [
      "Define class",
      "Create instances",
      "Call methods on each"
    ],
    "example": "class Counter:\n    def __init__(self):\n        self.total = 0\n    def add(self):\n        self.total += 1\n\nc = Counter()\nc.add()\nprint(c.total)",
    "output": "1",
    "walkthrough": [
      "class Counter declares a reusable template.",
      "__init__ creates per-instance state.",
      "add changes total on this object.",
      "A new Counter starts with its own total."
    ],
    "deeper": [
      {
        "question": "Why does a method need self?",
        "answer": "It identifies which object the method is acting on; c.add() passes c as the receiver."
      },
      {
        "question": "What is the dataclass trap?",
        "answer": "For a list field, use field(default_factory=list), not a single shared mutable default list."
      }
    ],
    "mistakes": [
      {
        "mistake": "Writing count = 0 in the class and assuming per-instance ownership",
        "correction": "Use self.count = 0 inside __init__ for independent instance state."
      },
      {
        "mistake": "Forgetting self in method parameters",
        "correction": "Instance methods normally define self as their first parameter."
      }
    ],
    "task": "Create an ImageCounter class. add(label) increments a label frequency; count(label) returns the frequency or 0.",
    "starter": "class ImageCounter:\n    def __init__(self):\n        self.counts = {}\n\n    def add(self, label):\n        # Increment this label.\n        pass\n\n    def count(self, label):\n        # Return 0 if missing.\n        pass",
    "checks": [
      {
        "name": "Counts repeated IDs",
        "code": "c=ImageCounter(); c.add('L'); c.add('L'); c.add('R'); assert c.count('L')==2 and c.count('R')==1"
      },
      {
        "name": "Unknown label",
        "code": "c=ImageCounter(); assert c.count('X')==0"
      },
      {
        "name": "Independent objects",
        "code": "a=ImageCounter(); b=ImageCounter(); a.add('A'); assert b.count('A')==0"
      }
    ],
    "hint": "self.counts[label] = self.counts.get(label,0)+1; return self.counts.get(label,0)",
    "solution": "class ImageCounter:\n    def __init__(self):\n        self.counts = {}\n\n    def add(self, label):\n        self.counts[label] = self.counts.get(label, 0) + 1\n\n    def count(self, label):\n        return self.counts.get(label, 0)",
    "quiz": {
      "question": "What does self usually refer to in an instance method?",
      "choices": [
        "All objects ever created",
        "The current object",
        "The source .py file"
      ],
      "correct": 1,
      "explain": "self is the instance whose method is being called."
    },
    "recap": [
      "class is a blueprint",
      "self refers to an object",
      "__init__ initializes instance state"
    ],
    "docs": "https://docs.python.org/3/tutorial/classes.html"
  },
  {
    "id": "22",
    "shortTitle": "Type hints and readable function signatures",
    "essence": "Type hints tell readers and checking tools what kinds of values your function expects and returns.",
    "analogy": "A label on a container says 'images: list[str]' so your team knows what should go inside.",
    "why": "Clear contracts improve maintainability, IDE help, testing and code review.",
    "concepts": [
      {
        "label": "Parameter hints",
        "explain": "def f(x: int): indicates the expected input type, without enforcing it at runtime."
      },
      {
        "label": "Return hints",
        "explain": "def f(x: int) -> int: indicates the intended return type."
      },
      {
        "label": "Union and optional",
        "explain": "int | None means an integer or no value; list[str] means a list of strings."
      },
      {
        "label": "Runtime validation",
        "explain": "Type hints are usually not runtime checks. Validate critical user input using isinstance, parsing, or schema tools."
      }
    ],
    "flow": [
      "Declare input type",
      "Implement behavior",
      "Document return type"
    ],
    "example": "def safe_score(text: str) -> float | None:\n    try:\n        return float(text)\n    except ValueError:\n        return None\n\nprint(safe_score('0.75'))\nprint(safe_score('bad'))",
    "output": "0.75\nNone",
    "walkthrough": [
      "text is annotated as a string.",
      "float | None says the function can return a float or None.",
      "Try converting input; catch invalid numeric text.",
      "The type hint does not itself parse the text."
    ],
    "deeper": [
      {
        "question": "Will f(x: int) reject a string automatically?",
        "answer": "No. Python annotations normally do not enforce runtime types. Your function must validate them when necessary."
      },
      {
        "question": "Why avoid too many complex annotations initially?",
        "answer": "Readable signatures are more important. Start with int, str, float, list[T], dict[K,V], and T | None."
      }
    ],
    "mistakes": [
      {
        "mistake": "Assuming type hints guarantee safe external input",
        "correction": "Always validate data crossing API, CSV or user boundaries."
      },
      {
        "mistake": "Leaving return type as int when None is possible",
        "correction": "Use int | None if missing/invalid input returns None."
      }
    ],
    "task": "Write parse_positive_int(text: str) -> int | None. Strip spaces; return positive integer, otherwise None.",
    "starter": "def parse_positive_int(text: str) -> int | None:\n    # Parse with int(); reject <= 0 and invalid text.\n    pass",
    "checks": [
      {
        "name": "Normal and spaces",
        "code": "assert parse_positive_int(' 12 ')==12"
      },
      {
        "name": "Zero or negative",
        "code": "assert parse_positive_int('0') is None and parse_positive_int('-5') is None"
      },
      {
        "name": "Invalid text",
        "code": "assert parse_positive_int('abc') is None and parse_positive_int('3.5') is None"
      }
    ],
    "hint": "try: value = int(text.strip()); except ValueError: return None; return value if value > 0 else None",
    "solution": "def parse_positive_int(text: str) -> int | None:\n    try:\n        number = int(text.strip())\n    except ValueError:\n        return None\n    return number if number > 0 else None",
    "quiz": {
      "question": "Does : int in def f(x: int) automatically reject a string?",
      "choices": [
        "Always",
        "Not by itself",
        "Only when print is used"
      ],
      "correct": 1,
      "explain": "Type annotations guide tools and people; Python generally does not enforce them at runtime."
    },
    "recap": [
      "Hints describe contracts",
      "Union allows more types",
      "Validate untrusted input"
    ],
    "docs": "https://docs.python.org/3/library/typing.html"
  },
  {
    "id": "23",
    "shortTitle": "Logging, assert and input validation",
    "essence": "Logging records what happens; assertions test developer assumptions; validation guards outside input.",
    "analogy": "Logging is a flight recorder, asserts are preflight checks, and validation is airport security.",
    "why": "AI model pipelines need reproducible error details and proper checks—not print spam or silent bad labels.",
    "concepts": [
      {
        "label": "logging",
        "explain": "Use logging.debug/info/warning/error instead of print for structured application status."
      },
      {
        "label": "assert",
        "explain": "assert checks programming assumptions and can be disabled with optimized Python; do not use it for security validation."
      },
      {
        "label": "Validation",
        "explain": "Raise TypeError/ValueError for invalid external data; check ranges, shapes and IDs."
      },
      {
        "label": "Exceptions vs messages",
        "explain": "Errors should identify the failed field and expected condition without exposing secrets."
      }
    ],
    "flow": [
      "Receive value",
      "Validate contract",
      "Log or raise"
    ],
    "example": "import logging\nlogging.basicConfig(level=logging.INFO)\ndef check_score(x):\n    if not 0 <= x <= 1:\n        raise ValueError('score must be 0..1')\n    logging.info('Score accepted')\n    return x\nprint(check_score(0.8))",
    "output": "Score accepted (log)\n0.8",
    "walkthrough": [
      "basicConfig sets a logging level.",
      "The function validates score range.",
      "Invalid values raise a descriptive exception.",
      "A valid value is logged and returned. Logs commonly go to stderr."
    ],
    "deeper": [
      {
        "question": "Can assert be used to validate user input?",
        "answer": "No. assert can be removed by Python optimization; use if/raise for input validation."
      },
      {
        "question": "Why not log every image's private metadata?",
        "answer": "Logs can expose confidential or personal information. Record only what is needed and permitted."
      }
    ],
    "mistakes": [
      {
        "mistake": "assert user_is_authorized for access control",
        "correction": "Perform explicit authorization checks with real error handling; never rely on assert for security."
      },
      {
        "mistake": "logging passwords or biometric data",
        "correction": "Minimize recorded sensitive data and follow lab/company privacy policies."
      }
    ],
    "task": "Write validate_score(value). Return a numeric score within [0,1]; reject bool/non-numeric with TypeError and out-of-range with ValueError.",
    "starter": "def validate_score(value):\n    # No assert for untrusted input.\n    pass",
    "checks": [
      {
        "name": "Valid endpoints",
        "code": "assert validate_score(0)==0 and validate_score(1.0)==1.0"
      },
      {
        "name": "Wrong type rejected",
        "code": "try:\n    validate_score('0.5')\n    assert False, 'TypeError expected'\nexcept TypeError:\n    pass"
      },
      {
        "name": "Boolean rejected",
        "code": "try:\n    validate_score(True)\n    assert False, 'TypeError expected'\nexcept TypeError:\n    pass"
      },
      {
        "name": "Range rejected",
        "code": "try:\n    validate_score(1.1)\n    assert False, 'ValueError expected'\nexcept ValueError:\n    pass"
      }
    ],
    "hint": "if isinstance(value,bool) or not isinstance(value,(int,float)): raise TypeError(...); if not 0 <= value <= 1: raise ValueError(...); return value",
    "solution": "def validate_score(value):\n    if isinstance(value, bool) or not isinstance(value, (int, float)):\n        raise TypeError('score must be numeric')\n    if not 0 <= value <= 1:\n        raise ValueError('score must be 0..1')\n    return value",
    "quiz": {
      "question": "What should validate external API data when asserts might be disabled?",
      "choices": [
        "An explicit if check followed by raise",
        "Only assert",
        "Only print('invalid')"
      ],
      "correct": 0,
      "explain": "Never depend on assert for critical user or security validation."
    },
    "recap": [
      "Logs explain behavior",
      "assert checks developer assumptions",
      "Validate external data explicitly"
    ],
    "docs": "https://docs.python.org/3/howto/logging.html"
  },
  {
    "id": "24",
    "shortTitle": "pytest, tests and systematic debugging",
    "essence": "A test proves a specific behavior. Debugging finds WHY a failing behavior happened.",
    "analogy": "Your code is a machine; each test checks one promise before it reaches a customer.",
    "why": "Testing and debugging skills help more internship interviews than memorizing 100 libraries.",
    "concepts": [
      {
        "label": "assert tests",
        "explain": "assert actual == expected checks one promise. Add edge cases: empty, one item, duplicates and wrong inputs."
      },
      {
        "label": "pytest",
        "explain": "pytest discovers test_*.py and runs test_ functions. Install/run it locally as a development dependency."
      },
      {
        "label": "Debug workflow",
        "explain": "Reproduce error → shrink input → inspect values/traceback → fix cause → rerun test."
      },
      {
        "label": "Regression tests",
        "explain": "Keep a failing example as a permanent test so the same bug does not return."
      }
    ],
    "flow": [
      "Write expected behavior",
      "Run tests",
      "Fix until all pass"
    ],
    "example": "def first_positive(values):\n    for value in values:\n        if value > 0:\n            return value\n    return None\n\nassert first_positive([-3, 0, 4]) == 4\nassert first_positive([]) is None\nprint('2 tests passed')",
    "output": "2 tests passed",
    "walkthrough": [
      "The function scans until a positive number appears.",
      "When none exists, it returns None.",
      "The two assertions verify a normal case and an empty-input edge case.",
      "pytest can run the same assertions inside test_ functions."
    ],
    "deeper": [
      {
        "question": "What is an effective debugging order?",
        "answer": "Reproduce deterministically, read the traceback, inspect the smallest failing case, change one cause, rerun affected tests."
      },
      {
        "question": "Are two passing examples enough to prove correctness?",
        "answer": "No. Tests provide evidence for covered cases, not a proof that all possible inputs are correct."
      }
    ],
    "mistakes": [
      {
        "mistake": "Changing five unrelated lines before rerunning tests",
        "correction": "Use a minimal reproduction and isolate one cause at a time."
      },
      {
        "mistake": "Deleting the failing test after a fix",
        "correction": "Keep it as a regression test to prevent the bug from returning."
      }
    ],
    "task": "Write first_positive(values), returning the FIRST strictly positive number or None. Do not sort the list.",
    "starter": "def first_positive(values):\n    # Scan in the original order. Return early.\n    pass",
    "checks": [
      {
        "name": "First strictly positive",
        "code": "assert first_positive([-2,0,5,3])==5"
      },
      {
        "name": "No positives",
        "code": "assert first_positive([-1,0,-3]) is None"
      },
      {
        "name": "Empty input",
        "code": "assert first_positive([]) is None"
      },
      {
        "name": "Original order matters",
        "code": "assert first_positive([3,1,7])==3"
      }
    ],
    "hint": "for value in values: if value > 0: return value; after loop return None",
    "solution": "def first_positive(values):\n    for value in values:\n        if value > 0:\n            return value\n    return None",
    "quiz": {
      "question": "What should you do immediately after fixing a bug?",
      "choices": [
        "Delete the failing test",
        "Rerun the failing test and keep it",
        "Assume all other code is correct"
      ],
      "correct": 1,
      "explain": "Keep the test as a permanent regression check and rerun related tests."
    },
    "recap": [
      "Test normal AND edge cases",
      "Use tracebacks to locate errors",
      "Keep regression tests"
    ],
    "docs": "https://docs.pytest.org/en/stable/getting-started.html"
  }
];
