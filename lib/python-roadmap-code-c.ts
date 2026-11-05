import type { PythonCodeExample } from './python-roadmap-code-a';
export const pythonCodeExamplesC: Record<string,PythonCodeExample[]>={
  "17": [
    {
      "label": "Read a text file",
      "anchor": "read-file",
      "code": "with open('notes.txt', 'r', encoding='utf-8') as file:\n    text = file.read()\nprint(text)",
      "output": "Text saved in notes.txt",
      "explanation": "Use 'r' to read a real existing file. with closes the file automatically; UTF-8 supports English, Chinese and other text. The file must exist on your computer."
    },
    {
      "label": "Write to a text file",
      "anchor": "write-file",
      "code": "with open('notes.txt', 'w', encoding='utf-8') as file:\n    file.write('Python is useful!')",
      "output": "Creates or replaces notes.txt",
      "explanation": "'w' creates a file or REPLACES its existing contents. Use 'a' to append without deleting old text."
    },
    {
      "label": "Use pathlib for file paths",
      "anchor": "pathlib",
      "code": "from pathlib import Path\npath = Path('images') / 'P01_L.jpg'\nprint(path.name)\nprint(path.stem)\nprint(path.suffix)",
      "output": "P01_L.jpg\nP01_L\n.jpg",
      "explanation": "Path helps build portable paths. name is the filename, stem removes the extension, and suffix contains the extension."
    },
    {
      "label": "Process lines with a loop",
      "anchor": "read-lines",
      "code": "from io import StringIO\ntext = 'P01\\n\\nP02\\n'\nwith StringIO(text) as handle:\n    for line in handle:\n        value = line.strip()\n        if value:\n            print(value)",
      "output": "P01\nP02",
      "explanation": "This in-memory file example runs without external files. Each line is stripped and blank lines are skipped."
    }
  ],
  "18": [
    {
      "label": "Read CSV rows",
      "anchor": "read-csv",
      "code": "import csv\nfrom io import StringIO\ntext = 'id,score\\nP01,0.8\\nP02,0.9\\n'\nfor row in csv.DictReader(StringIO(text)):\n    print(row['id'], float(row['score']))",
      "output": "P01 0.8\nP02 0.9",
      "explanation": "DictReader gives one dictionary per CSV row using the header names. CSV numbers are strings, so convert them to float."
    },
    {
      "label": "Write CSV",
      "anchor": "write-csv",
      "code": "import csv\nfrom io import StringIO\nbuffer = StringIO()\nwriter = csv.writer(buffer)\nwriter.writerow(['id', 'score'])\nwriter.writerow(['P01', 0.9])\nprint(buffer.getvalue().strip())",
      "output": "id,score\nP01,0.9",
      "explanation": "csv.writer handles delimiters and quoting correctly. StringIO stores the result in memory for a copy-and-run example."
    },
    {
      "label": "JSON: parse and serialize",
      "anchor": "json",
      "code": "import json\nperson = json.loads('{\"id\":\"P01\",\"valid\":true}')\nprint(person['id'])\nprint(person['valid'])\nprint(json.dumps({'count': 2}))",
      "output": "P01\nTrue\n{\"count\": 2}",
      "explanation": "json.loads converts JSON text to Python objects, including true→True. dumps converts compatible Python objects back to JSON text."
    },
    {
      "label": "Reject malformed data safely",
      "anchor": "invalid-data",
      "code": "import json\ntry:\n    data = json.loads('{invalid json}')\nexcept json.JSONDecodeError:\n    print('Invalid JSON')",
      "output": "Invalid JSON",
      "explanation": "Bad input should be handled explicitly. Catch the specific decoding error instead of letting malformed records silently corrupt your results."
    }
  ],
  "19": [
    {
      "label": "try and except",
      "anchor": "try-except",
      "code": "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero')",
      "output": "Cannot divide by zero",
      "explanation": "try runs potentially failing code. except ZeroDivisionError handles only that specific error."
    },
    {
      "label": "Raise errors for bad inputs",
      "anchor": "raise",
      "code": "def set_age(age):\n    if age < 0:\n        raise ValueError('Age cannot be negative')\n    return age\n\nprint(set_age(23))",
      "output": "23",
      "explanation": "raise stops invalid operations and reports the problem. Passing a negative age would cause a ValueError."
    },
    {
      "label": "finally runs cleanup",
      "anchor": "finally",
      "code": "try:\n    print('Start processing')\nfinally:\n    print('Cleanup finished')",
      "output": "Start processing\nCleanup finished",
      "explanation": "finally runs when exiting a try block, even if an error occurred. with is usually even better for safely closing files."
    },
    {
      "label": "Read a traceback",
      "anchor": "tracebacks",
      "code": "numbers = [10, 20]\ntry:\n    print(numbers[2])\nexcept IndexError as error:\n    print(type(error).__name__)",
      "output": "IndexError",
      "explanation": "numbers[2] is invalid because the list only has indexes 0 and 1. The error class identifies what went wrong; a full traceback would point to the failing line."
    }
  ],
  "20": [
    {
      "label": "Import a standard module",
      "anchor": "import",
      "code": "import math\nprint(math.sqrt(81))\nprint(math.ceil(2.3))",
      "output": "9.0\n3",
      "explanation": "import loads code from another module. math.sqrt calculates the square root; math.ceil rounds upward."
    },
    {
      "label": "Import a single function",
      "anchor": "from-import",
      "code": "from statistics import mean\nscores = [60, 80, 100]\nprint(mean(scores))",
      "output": "80",
      "explanation": "from ... import ... brings a named function into your code without requiring the module prefix."
    },
    {
      "label": "Create and activate a virtual environment",
      "anchor": "virtual-environment",
      "language": "bash",
      "code": "python -m venv .venv\n# Linux / macOS:\nsource .venv/bin/activate\n# Windows PowerShell:\n.venv\\Scripts\\Activate.ps1",
      "output": "A separate .venv environment for the project",
      "explanation": "A virtual environment keeps a project's packages independent from system Python. Run the activation command for your own operating system—not both."
    },
    {
      "label": "Install packages and track versions",
      "anchor": "pip",
      "language": "bash",
      "code": "python -m pip install numpy\npython -m pip freeze > requirements.txt\npython -m pip install -r requirements.txt",
      "output": "Dependencies installed in the active environment",
      "explanation": "pip installs packages into the chosen Python environment. requirements.txt captures versioned dependencies to help others reproduce the setup."
    }
  ],
  "21": [
    {
      "label": "Class and object",
      "anchor": "class",
      "code": "class Student:\n    def __init__(self, name):\n        self.name = name\n\nstudent = Student('Manu')\nprint(student.name)",
      "output": "Manu",
      "explanation": "A class defines a blueprint. Student('Manu') creates one object; self.name stores information on that object."
    },
    {
      "label": "Instance methods",
      "anchor": "methods",
      "code": "class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def add(self):\n        self.value += 1\n\ncounter = Counter()\ncounter.add()\ncounter.add()\nprint(counter.value)",
      "output": "2",
      "explanation": "Methods are functions attached to a class. self refers to the object being modified."
    },
    {
      "label": "Inheritance",
      "anchor": "inheritance",
      "code": "class Animal:\n    def speak(self):\n        return 'sound'\n\nclass Dog(Animal):\n    def speak(self):\n        return 'bark'\n\nprint(Dog().speak())",
      "output": "bark",
      "explanation": "Dog inherits from Animal but overrides speak with its own behavior. Use inheritance when one class truly specializes another."
    },
    {
      "label": "Dataclasses",
      "anchor": "dataclass",
      "code": "from dataclasses import dataclass\n\n@dataclass\nclass ImageInfo:\n    filename: str\n    width: int\n\ninfo = ImageInfo('P01.jpg', 128)\nprint(info.filename)\nprint(info.width)",
      "output": "P01.jpg\n128",
      "explanation": "@dataclass automatically creates common data-holder behavior such as __init__. This is useful for simple structured records."
    }
  ],
  "22": [
    {
      "label": "Parameter and return types",
      "anchor": "type-hints",
      "code": "def add(a: int, b: int) -> int:\n    return a + b\n\nprint(add(2, 3))",
      "output": "5",
      "explanation": "a: int describes the intended input type. -> int describes the intended return type; hints do not enforce types automatically."
    },
    {
      "label": "Lists, dictionaries and optional values",
      "anchor": "collection-types",
      "code": "def first(items: list[str]) -> str | None:\n    if not items:\n        return None\n    return items[0]\n\nprint(first(['P01', 'P02']))\nprint(first([]))",
      "output": "P01\nNone",
      "explanation": "list[str] means a list of strings. str | None means either a string or None (when the list is empty)."
    },
    {
      "label": "Runtime validation is still needed",
      "anchor": "validate-types",
      "code": "def double(value: int) -> int:\n    if not isinstance(value, int):\n        raise TypeError('Expected an integer')\n    return value * 2\n\nprint(double(4))",
      "output": "8",
      "explanation": "Type hints guide readers and static tools. isinstance and raise perform actual runtime checks when untrusted data enters a program."
    }
  ],
  "23": [
    {
      "label": "Use print for quick inspection",
      "anchor": "print-debugging",
      "code": "scores = [0.6, 0.8, 0.9]\nprint('count =', len(scores))\nprint('max =', max(scores))",
      "output": "count = 3\nmax = 0.9",
      "explanation": "print is useful for a very small script. For long-running applications, structured logging is easier to manage."
    },
    {
      "label": "Logging instead of print",
      "anchor": "logging",
      "code": "import logging\nlogging.basicConfig(level=logging.INFO)\nlogging.info('Image preprocessing complete')",
      "output": "INFO:root:Image preprocessing complete",
      "explanation": "logging writes timestamp/level-style diagnostic messages according to configuration. It can be sent to files or monitoring systems."
    },
    {
      "label": "assert tests developer assumptions",
      "anchor": "assert",
      "code": "scores = [0.2, 0.8]\nassert len(scores) == 2\nassert all(0 <= score <= 1 for score in scores)\nprint('Shapes and ranges checked')",
      "output": "Shapes and ranges checked",
      "explanation": "assert raises AssertionError when a condition fails. It is for development invariants; Python optimization can disable asserts, so do not use them for external security validation."
    },
    {
      "label": "Explicit input validation",
      "anchor": "input-validation",
      "code": "def safe_score(value):\n    if not isinstance(value, (int, float)) or isinstance(value, bool):\n        raise TypeError('Score must be numeric')\n    if not 0 <= value <= 1:\n        raise ValueError('Score must be between 0 and 1')\n    return value\n\nprint(safe_score(0.8))",
      "output": "0.8",
      "explanation": "For inputs from users or files, use if and raise. This remains active even when assertions are disabled."
    }
  ],
  "24": [
    {
      "label": "Write a simple test with assert",
      "anchor": "unit-tests",
      "code": "def square(x):\n    return x * x\n\nassert square(3) == 9\nassert square(0) == 0\nprint('All tests passed')",
      "output": "All tests passed",
      "explanation": "A unit test runs a small piece of code and compares actual output with expected output. Include normal and edge cases."
    },
    {
      "label": "pytest test functions",
      "anchor": "pytest",
      "code": "def square(x):\n    return x * x\n\ndef test_square():\n    assert square(4) == 16\n    assert square(-3) == 9",
      "output": "Save as test_square.py and run: python -m pytest",
      "explanation": "pytest discovers functions named test_... in test files. It reports failed assertions and the relevant traceback."
    },
    {
      "label": "Catch and explain an indexing bug",
      "anchor": "debug-index",
      "code": "items = [10, 20, 30]\n# Wrong: items[3] causes IndexError\nlast = items[-1]\nprint(last)",
      "output": "30",
      "explanation": "Indexes are 0, 1, 2 for a three-item list. -1 is the last item and avoids hardcoding its index."
    },
    {
      "label": "Handle boundary cases",
      "anchor": "boundary-cases",
      "code": "def average(values):\n    if not values:\n        return None\n    return sum(values) / len(values)\n\nprint(average([]))\nprint(average([5]))",
      "output": "None\n5.0",
      "explanation": "Always consider empty and one-element inputs. The early return prevents division by zero for an empty list."
    }
  ]
};
