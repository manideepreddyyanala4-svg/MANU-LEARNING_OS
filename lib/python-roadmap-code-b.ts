import type { PythonCodeExample } from './python-roadmap-code-a';
export const pythonCodeExamplesB: Record<string,PythonCodeExample[]>={
  "10": [
    {
      "label": "Dictionary key and value",
      "anchor": "dictionary-basics",
      "code": "person = {'name': 'Manu', 'age': 23}\nprint(person['name'])\nprint(person['age'])",
      "output": "Manu\n23",
      "explanation": "A dictionary maps each key to a value. Use dictionary[key] when you know the key exists."
    },
    {
      "label": "Safe get() for missing keys",
      "anchor": "get",
      "code": "scores = {'P01': 0.93}\nprint(scores.get('P01', 0))\nprint(scores.get('P99', 0))",
      "output": "0.93\n0",
      "explanation": "get(key, default) returns the value when found and the default when missing, avoiding KeyError."
    },
    {
      "label": "Count with a dictionary",
      "anchor": "dictionary-counting",
      "code": "ids = ['P01', 'P02', 'P01']\ncounts = {}\nfor item in ids:\n    counts[item] = counts.get(item, 0) + 1\nprint(counts)",
      "output": "{'P01': 2, 'P02': 1}",
      "explanation": "For each ID, look up its current count (or start at 0), then add 1. This is the core frequency-counting pattern."
    },
    {
      "label": "Loop over keys and values",
      "anchor": "dictionary-items",
      "code": "scores = {'A': 90, 'B': 70}\nfor name, score in scores.items():\n    print(name, score)",
      "output": "A 90\nB 70",
      "explanation": ".items() gives a pair (key, value) on each loop iteration. This lets you inspect or process both pieces together."
    }
  ],
  "11": [
    {
      "label": "List aliasing",
      "anchor": "alias",
      "code": "a = [1, 2]\nb = a\nb.append(3)\nprint(a)",
      "output": "[1, 2, 3]",
      "explanation": "b = a does not copy the list. Both names refer to the same mutable object, so a changes when b changes."
    },
    {
      "label": "Shallow list copy",
      "anchor": "shallow-copy",
      "code": "a = [1, 2]\nb = a.copy()\nb.append(3)\nprint(a)\nprint(b)",
      "output": "[1, 2]\n[1, 2, 3]",
      "explanation": ".copy() creates another outer list. Appending to b no longer affects a."
    },
    {
      "label": "Nested lists and deepcopy",
      "anchor": "deepcopy",
      "code": "import copy\na = [[1], [2]]\nb = a.copy()\nc = copy.deepcopy(a)\nb[0].append(9)\nprint(a)\nprint(c)",
      "output": "[[1, 9], [2]]\n[[1], [2]]",
      "explanation": "Shallow copies share nested lists. deepcopy recursively copies nested objects so c stays independent in this example."
    },
    {
      "label": "Strings are immutable",
      "anchor": "immutability",
      "code": "text = 'cat'\nnew_text = text.upper()\nprint(text)\nprint(new_text)",
      "output": "cat\nCAT",
      "explanation": "String methods return new strings; they do not mutate the old text. Numbers, strings and tuple slots are immutable."
    }
  ],
  "12": [
    {
      "label": "Define and call a function",
      "anchor": "function-basics",
      "code": "def add(a, b):\n    return a + b\n\nprint(add(3, 4))",
      "output": "7",
      "explanation": "def creates a function. a and b are parameters; 3 and 4 are arguments. return sends the result to the caller."
    },
    {
      "label": "Keyword and default arguments",
      "anchor": "defaults",
      "code": "def welcome(name, greeting='Hello'):\n    return greeting + ', ' + name\n\nprint(welcome('Manu'))\nprint(welcome('Manu', greeting='Hi'))",
      "output": "Hello, Manu\nHi, Manu",
      "explanation": "A default parameter is used when the caller omits it. Keyword arguments specify the parameter by name."
    },
    {
      "label": "Avoid mutable default arguments",
      "anchor": "mutable-default",
      "code": "def add_item(item, values=None):\n    if values is None:\n        values = []\n    values.append(item)\n    return values\n\nprint(add_item(1))\nprint(add_item(2))",
      "output": "[1]\n[2]",
      "explanation": "Default mutable lists are shared across calls if created in the function signature. Use None and create a fresh list inside the function."
    },
    {
      "label": "Return versus print",
      "anchor": "return-vs-print",
      "code": "def double(number):\n    return number * 2\n\nresult = double(4)\nprint(result + 1)",
      "output": "9",
      "explanation": "return gives a value to other code. print only displays a value and normally returns None."
    }
  ],
  "13": [
    {
      "label": "Early return for empty input",
      "anchor": "early-return",
      "code": "def first_item(items):\n    if not items:\n        return None\n    return items[0]\n\nprint(first_item([]))\nprint(first_item([7, 8]))",
      "output": "None\n7",
      "explanation": "The first return exits the function if the list is empty. That prevents an out-of-range error on items[0]."
    },
    {
      "label": "Local variable scope",
      "anchor": "local-scope",
      "code": "score = 10\n\ndef show_score():\n    score = 5\n    print(score)\n\nshow_score()\nprint(score)",
      "output": "5\n10",
      "explanation": "The score assigned inside the function is local. It does not replace the score defined outside."
    },
    {
      "label": "Return multiple values",
      "anchor": "return-tuple",
      "code": "def size(image_shape):\n    height, width = image_shape\n    return height, width\n\nh, w = size((128, 224))\nprint(h, w)",
      "output": "128 224",
      "explanation": "Returning two comma-separated values creates a tuple. The caller can unpack them into two variables."
    }
  ],
  "14": [
    {
      "label": "List comprehension",
      "anchor": "list-comprehension",
      "code": "numbers = [1, 2, 3, 4]\nsquares = [n*n for n in numbers]\nprint(squares)",
      "output": "[1, 4, 9, 16]",
      "explanation": "The expression before for runs for each item. This builds a NEW list of squared values."
    },
    {
      "label": "Comprehension with if",
      "anchor": "comprehension-filter",
      "code": "numbers = [1, 2, 3, 4, 5]\nevens = [n for n in numbers if n % 2 == 0]\nprint(evens)",
      "output": "[2, 4]",
      "explanation": "The if at the end keeps only items that satisfy the condition."
    },
    {
      "label": "Dictionary comprehension",
      "anchor": "dict-comprehension",
      "code": "names = ['A', 'BB', 'CCC']\nlengths = {name: len(name) for name in names}\nprint(lengths)",
      "output": "{'A': 1, 'BB': 2, 'CCC': 3}",
      "explanation": "key: value makes a dictionary from the iterated names. Each name is mapped to its length."
    },
    {
      "label": "Set comprehension",
      "anchor": "set-comprehension",
      "code": "raw = ['L', 'l', 'R', 'r']\nunique = {name.upper() for name in raw}\nprint(sorted(unique))",
      "output": "['L', 'R']",
      "explanation": "A set comprehension transforms each element and removes duplicate results."
    }
  ],
  "15": [
    {
      "label": "range and enumerate",
      "anchor": "range-enumerate",
      "code": "for index, value in enumerate(['cat', 'dog'], start=1):\n    print(index, value)",
      "output": "1 cat\n2 dog",
      "explanation": "enumerate gives both index and item. start=1 changes the first index to 1; without it indexing starts at 0."
    },
    {
      "label": "zip two lists",
      "anchor": "zip",
      "code": "names = ['A', 'B']\nscores = [90, 80]\nfor name, score in zip(names, scores):\n    print(name, score)",
      "output": "A 90\nB 80",
      "explanation": "zip pairs elements at the same positions. By default it stops when the shorter input ends."
    },
    {
      "label": "any and all",
      "anchor": "any-all",
      "code": "scores = [70, 92, 85]\nprint(any(s >= 90 for s in scores))\nprint(all(s >= 60 for s in scores))",
      "output": "True\nTrue",
      "explanation": "any is True if at least one value passes; all is True only when every value passes."
    },
    {
      "label": "Sorting with key and lambda",
      "anchor": "sorted-key",
      "code": "pairs = [('A', 70), ('B', 90), ('C', 80)]\nordered = sorted(pairs, key=lambda x: x[1], reverse=True)\nprint(ordered)",
      "output": "[('B', 90), ('C', 80), ('A', 70)]",
      "explanation": "lambda x: x[1] chooses the score as the sorting key. reverse=True puts the largest scores first."
    }
  ],
  "16": [
    {
      "label": "split and join",
      "anchor": "split-join",
      "code": "text = 'P01,L,0.92'\nparts = text.split(',')\nprint(parts)\nprint('-'.join(parts[:2]))",
      "output": "['P01', 'L', '0.92']\nP01-L",
      "explanation": "split separates text by a delimiter into a list. join combines strings using the chosen separator."
    },
    {
      "label": "Find text using startswith and in",
      "anchor": "string-search",
      "code": "filename = 'P01_L.jpg'\nprint(filename.startswith('P01'))\nprint(filename.endswith('.jpg'))\nprint('_L' in filename)",
      "output": "True\nTrue\nTrue",
      "explanation": "startswith checks the beginning, endswith checks the end, and in finds a substring anywhere."
    },
    {
      "label": "Regex: validate an entire ID",
      "anchor": "regex-fullmatch",
      "code": "import re\npattern = r'P[0-9]{2}_[LR]'\nprint(bool(re.fullmatch(pattern, 'P01_L')))\nprint(bool(re.fullmatch(pattern, 'P1_L')))",
      "output": "True\nFalse",
      "explanation": "re.fullmatch requires the whole text to match. [0-9]{2} means exactly two ASCII digits."
    },
    {
      "label": "Regex: extract groups",
      "anchor": "regex-groups",
      "code": "import re\nmatch = re.fullmatch(r'P([0-9]{2})_([LR])', 'P03_R')\nif match:\n    print(match.group(1))\n    print(match.group(2))",
      "output": "03\nR",
      "explanation": "Parentheses capture pieces. group(1) returns the digits as text, and group(2) returns the hand letter."
    }
  ],
  "09": [
    {
      "label": "A set removes duplicates",
      "anchor": "set-basics",
      "code": "ids = ['P01', 'P02', 'P01']\nunique = set(ids)\nprint(sorted(unique))",
      "output": "['P01', 'P02']",
      "explanation": "A set stores each unique value once. sorted() creates a sorted list so output order is predictable."
    },
    {
      "label": "Membership, add and discard",
      "anchor": "membership",
      "code": "names = {'Manu', 'Ravi'}\nprint('Manu' in names)\nnames.add('Anu')\nnames.discard('Ravi')\nprint(sorted(names))",
      "output": "True\n['Anu', 'Manu']",
      "explanation": "in tests membership. add inserts a value; discard removes it without an error if already absent."
    },
    {
      "label": "Union and intersection",
      "anchor": "union-intersection",
      "code": "a = {1, 2, 3}\nb = {3, 4}\nprint(sorted(a | b))\nprint(sorted(a & b))",
      "output": "[1, 2, 3, 4]\n[3]",
      "explanation": "| combines unique values (union). & selects only values present in both sets (intersection)."
    }
  ]
};
