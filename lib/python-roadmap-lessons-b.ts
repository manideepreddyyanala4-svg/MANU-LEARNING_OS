import type { PythonRoadmapLesson } from './python-roadmap-types';
export const pythonLessonsB: PythonRoadmapLesson[] = [
  {
    "id": "09",
    "shortTitle": "Sets: unique values and membership",
    "essence": "A set keeps unique hashable values and supports fast membership checks.",
    "analogy": "A club's guest list: a person appears once, even if they knock five times.",
    "why": "Deduplicating image IDs and checking whether a label already exists are common data-cleaning tasks.",
    "concepts": [
      {
        "label": "Create / deduplicate",
        "explain": "set([1,1,2]) becomes {1,2}. {} is an empty dictionary; set() is an empty set."
      },
      {
        "label": "Membership",
        "explain": "x in my_set tests membership; average lookup is fast, though worst-case performance can differ."
      },
      {
        "label": "add / discard",
        "explain": "add inserts; discard removes safely even if the item is absent."
      },
      {
        "label": "Union / intersection",
        "explain": "a | b combines unique members; a & b keeps elements common to both sets."
      }
    ],
    "flow": [
      "Repeated IDs",
      "Convert to set",
      "Unique IDs"
    ],
    "example": "ids = ['P01', 'P02', 'P01']\nunique = set(ids)\nprint(len(unique))\nprint('P02' in unique)\nprint(sorted(unique))",
    "output": "2\nTrue\n['P01', 'P02']",
    "walkthrough": [
      "Convert repeated IDs to unique members.",
      "len counts unique elements.",
      "in checks membership.",
      "sorted returns a deterministic list rather than relying on set iteration order."
    ],
    "deeper": [
      {
        "question": "Why are list or dictionary values invalid inside a set?",
        "answer": "Set elements must be hashable. Mutable lists and dictionaries are not hashable."
      },
      {
        "question": "Should I rely on order when iterating a set?",
        "answer": "No. Use sorted(set_values) whenever stable display or reproducible output is required."
      }
    ],
    "mistakes": [
      {
        "mistake": "empty = {} to create an empty set",
        "correction": "Use empty = set(). Braces without items create a dictionary."
      },
      {
        "mistake": "Using .remove() for possibly absent items",
        "correction": "Use discard() to avoid KeyError when the item might not exist."
      }
    ],
    "task": "Write sorted_unique(items), returning a sorted list of distinct values without modifying the input.",
    "starter": "def sorted_unique(items):\n    # Make a set, then return a sorted list.\n    pass",
    "checks": [
      {
        "name": "Deduplicate sorted",
        "code": "assert sorted_unique(['B','A','B'])==['A','B']"
      },
      {
        "name": "Empty input",
        "code": "assert sorted_unique([])==[]"
      },
      {
        "name": "Input preserved",
        "code": "a=[3,1,3]; assert sorted_unique(a)==[1,3] and a==[3,1,3]"
      }
    ],
    "hint": "sorted(set(items))",
    "solution": "def sorted_unique(items):\n    return sorted(set(items))",
    "quiz": {
      "question": "Which expression makes an EMPTY set?",
      "choices": [
        "{}",
        "set()",
        "[]"
      ],
      "correct": 1,
      "explain": "{} means dictionary; set() makes an empty set."
    },
    "recap": [
      "Sets remove duplicates",
      "Membership is fast on average",
      "Sort for predictable order"
    ],
    "docs": "https://docs.python.org/3/tutorial/datastructures.html#sets"
  },
  {
    "id": "10",
    "shortTitle": "Dictionaries: keys and counting",
    "essence": "A dictionary maps unique keys to values, like ID → number of images.",
    "analogy": "A locker room: each locker number (key) leads directly to its contents (value).",
    "why": "Frequency counting, lookups and Two Sum are among the highest-value Python interview patterns.",
    "concepts": [
      {
        "label": "Key : value",
        "explain": "counts['P01'] = 3 associates one key with a count. Keys must be hashable."
      },
      {
        "label": ".get()",
        "explain": "dict.get(key, default) returns a fallback instead of raising KeyError when absent."
      },
      {
        "label": ".items() / .keys()",
        "explain": "items yields key–value pairs, keys yields keys, values yields values."
      },
      {
        "label": "Update / overwrite",
        "explain": "counts['P01'] += 1 changes that value; assigning an existing key overwrites the previous value."
      }
    ],
    "flow": [
      "Read each ID",
      "Look up count",
      "Add one"
    ],
    "example": "ids = ['L', 'R', 'L']\ncounts = {}\nfor hand in ids:\n    counts[hand] = counts.get(hand, 0) + 1\nprint(counts)",
    "output": "{'L': 2, 'R': 1}",
    "walkthrough": [
      "Start with an empty mapping.",
      "Loop through each hand value.",
      "get returns 0 for a new hand, then +1 counts it.",
      "The resulting map contains both frequencies."
    ],
    "deeper": [
      {
        "question": "Why does get(key, 0) help?",
        "answer": "It initializes unseen keys without needing a separate if key in counts branch."
      },
      {
        "question": "What is its time complexity?",
        "answer": "Counting n elements is average O(n) with hash-map operations; hash-table collisions can affect worst-case behavior."
      }
    ],
    "mistakes": [
      {
        "mistake": "counts[key] += 1 for a new key",
        "correction": "If key is missing, KeyError occurs. Initialize it or use get(key, 0)."
      },
      {
        "mistake": "Assuming dict keys may be lists",
        "correction": "Keys must be hashable; use tuples instead of lists where appropriate."
      }
    ],
    "task": "Write count_ids(ids) to return a dictionary of how many times each ID appears.",
    "starter": "def count_ids(ids):\n    result = {}\n    # Loop and count with get().\n    pass",
    "checks": [
      {
        "name": "Repeated values",
        "code": "assert count_ids(['P01','P01','P02'])=={'P01':2,'P02':1}"
      },
      {
        "name": "Empty input",
        "code": "assert count_ids([])=={}"
      },
      {
        "name": "Different IDs",
        "code": "assert count_ids(['L','R','R','L','R'])=={'L':2,'R':3}"
      }
    ],
    "hint": "result[item] = result.get(item, 0) + 1 inside a loop; then return result.",
    "solution": "def count_ids(ids):\n    result = {}\n    for item in ids:\n        result[item] = result.get(item, 0) + 1\n    return result",
    "quiz": {
      "question": "What does d.get('x', 0) return when x is missing?",
      "choices": [
        "KeyError",
        "None",
        "0"
      ],
      "correct": 2,
      "explain": "The second argument supplies the default value."
    },
    "recap": [
      "Dictionary maps keys → values",
      "get avoids missing-key errors",
      "Frequency counting is average O(n)"
    ],
    "docs": "https://docs.python.org/3/tutorial/datastructures.html#dictionaries"
  },
  {
    "id": "11",
    "shortTitle": "Mutable, immutable, alias and copy",
    "essence": "Some objects can change in place; other objects must be replaced.",
    "analogy": "A shared whiteboard (list) is visible to everyone holding its pointer; a printed number (int) is replaced rather than edited.",
    "why": "Subtle aliasing bugs can corrupt dataset paths, labels and experiment lists.",
    "concepts": [
      {
        "label": "Mutable",
        "explain": "list, dict and set contents can change in place."
      },
      {
        "label": "Immutable",
        "explain": "int, str and tuple slots cannot change in place (but tuple members can be mutable objects)."
      },
      {
        "label": "Aliasing",
        "explain": "b = a does not copy a list; both names refer to the same object."
      },
      {
        "label": "Shallow/deep copy",
        "explain": "a.copy() duplicates the outer container. copy.deepcopy handles nested containers, with caveats."
      }
    ],
    "flow": [
      "a points to list",
      "b = a points to same list",
      "Mutation affects both"
    ],
    "example": "a = [1, 2]\nb = a\nb.append(3)\nprint(a)\nc = a.copy()\nc.append(4)\nprint(a, c)",
    "output": "[1, 2, 3]\n[1, 2, 3] [1, 2, 3, 4]",
    "walkthrough": [
      "b is another name for a, not a separate list.",
      "Appending through b changes the shared object.",
      "copy creates a new outer list.",
      "Appending through c does not change a."
    ],
    "deeper": [
      {
        "question": "What does 'is' compare?",
        "answer": "Object identity: whether two names refer to the same object. == compares values."
      },
      {
        "question": "What about nested lists?",
        "answer": "Shallow copies share inner lists. For independent nested structures, use copy.deepcopy when appropriate."
      }
    ],
    "mistakes": [
      {
        "mistake": "Believing b = a copies a list",
        "correction": "Use a.copy() or a[:] for a separate outer list."
      },
      {
        "mistake": "Assuming a tuple containing a list is deeply immutable",
        "correction": "The tuple slot cannot be replaced, but its inner list can change."
      }
    ],
    "task": "Write add_without_mutating(items, item) returning a new list with the extra item; original stays unchanged.",
    "starter": "def add_without_mutating(items, item):\n    # Copy, then append.\n    pass",
    "checks": [
      {
        "name": "New list",
        "code": "x=[1,2]; y=add_without_mutating(x,3); assert y==[1,2,3] and x==[1,2] and y is not x"
      },
      {
        "name": "Empty list",
        "code": "assert add_without_mutating([],10)==[10]"
      },
      {
        "name": "Preserve nested values",
        "code": "a=[[1]]; b=add_without_mutating(a,[2]); assert b==[[1],[2]] and len(a)==1"
      }
    ],
    "hint": "new_items = items.copy(); new_items.append(item); return new_items",
    "solution": "def add_without_mutating(items, item):\n    new_items = items.copy()\n    new_items.append(item)\n    return new_items",
    "quiz": {
      "question": "When a=[1]; b=a, which statement is true?",
      "choices": [
        "a is b",
        "a and b are independent copies",
        "b.append(2) cannot change a"
      ],
      "correct": 0,
      "explain": "Both variables refer to the same mutable list object."
    },
    "recap": [
      "Lists/dicts mutate",
      "b=a creates an alias",
      "copy avoids many side effects"
    ],
    "docs": "https://docs.python.org/3/library/copy.html"
  },
  {
    "id": "12",
    "shortTitle": "Functions, parameters and defaults",
    "essence": "A function is reusable logic with inputs (parameters) and outputs (return values).",
    "analogy": "A vending machine: insert inputs, it follows rules and gives one result.",
    "why": "Interviewers expect you to break code into clean functions, not write a long untestable script.",
    "concepts": [
      {
        "label": "def / parameter",
        "explain": "def f(x): defines reusable code; x is a parameter, f(3) passes an argument."
      },
      {
        "label": "Positional/keyword",
        "explain": "f(2, 3) passes by position; f(a=2, b=3) names arguments."
      },
      {
        "label": "Default values",
        "explain": "def f(x, limit=10) lets callers omit limit. Defaults are evaluated once when the function is defined."
      },
      {
        "label": "Docstrings",
        "explain": "A triple-quoted first string explains purpose, inputs and output to readers/tools."
      }
    ],
    "flow": [
      "Input arguments",
      "Function body",
      "Returned output"
    ],
    "example": "def cap_score(score, maximum=1.0):\n    return min(score, maximum)\n\nprint(cap_score(1.2))\nprint(cap_score(1.2, maximum=0.8))",
    "output": "1.0\n0.8",
    "walkthrough": [
      "Define a function with a default maximum.",
      "min keeps the smaller of score and maximum.",
      "First call uses default 1.0.",
      "Second call overrides the default with a keyword argument."
    ],
    "deeper": [
      {
        "question": "Why avoid a list as a default value?",
        "answer": "Default mutable objects are reused across calls. Prefer None and create a fresh list inside when needed."
      },
      {
        "question": "Do functions print or return by default?",
        "answer": "Without return, a function returns None. print inside a function is not the same as returning a value."
      }
    ],
    "mistakes": [
      {
        "mistake": "def add(x, values=[]): values.append(x)",
        "correction": "Use values=None, then if values is None: values = [] inside the function."
      },
      {
        "mistake": "Calling a function without required arguments",
        "correction": "Pass the required parameters, by position or by keyword, in the correct order."
      }
    ],
    "task": "Write clipped_values(scores, maximum=1.0) returning a new list with every score limited to maximum.",
    "starter": "def clipped_values(scores, maximum=1.0):\n    # Return a new list; do not mutate scores.\n    pass",
    "checks": [
      {
        "name": "Default maximum",
        "code": "assert clipped_values([0.2,1.5])==[0.2,1.0]"
      },
      {
        "name": "Custom maximum",
        "code": "assert clipped_values([0.4,0.9],maximum=0.7)==[0.4,0.7]"
      },
      {
        "name": "Empty and original unchanged",
        "code": "x=[2.0]; assert clipped_values([])==[] and clipped_values(x)==[1.0] and x==[2.0]"
      }
    ],
    "hint": "Use a list comprehension [min(score, maximum) for score in scores].",
    "solution": "def clipped_values(scores, maximum=1.0):\n    return [min(score, maximum) for score in scores]",
    "quiz": {
      "question": "What happens when no return runs in a function?",
      "choices": [
        "It returns 0",
        "It returns None",
        "It returns the most recent print"
      ],
      "correct": 1,
      "explain": "Python implicitly returns None."
    },
    "recap": [
      "Parameters take inputs",
      "return produces outputs",
      "Avoid mutable default lists"
    ],
    "docs": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"
  },
  {
    "id": "13",
    "shortTitle": "Return, scope and early exit",
    "essence": "return stops a function and sends a result back. Variables inside a function are usually local.",
    "analogy": "A restaurant order: return delivers the meal and ends the service; local variables are kitchen notes.",
    "why": "A clean early-return pattern makes validation and model-inference code easier to read and test.",
    "concepts": [
      {
        "label": "return",
        "explain": "Immediately leaves the function with a value; code below that return in the same path does not run."
      },
      {
        "label": "Local scope",
        "explain": "Variables assigned inside a function are local unless declared global or nonlocal."
      },
      {
        "label": "Early return",
        "explain": "Reject invalid or empty input at the top instead of nesting many if statements."
      },
      {
        "label": "None vs print",
        "explain": "return is for calling code; print is for humans observing output."
      }
    ],
    "flow": [
      "Validate input",
      "Return early if invalid",
      "Otherwise compute and return"
    ],
    "example": "def average(values):\n    if not values:\n        return None\n    return sum(values) / len(values)\n\nprint(average([2, 4, 6]))\nprint(average([]))",
    "output": "4.0\nNone",
    "walkthrough": [
      "If the list is empty, return None and stop immediately.",
      "For nonempty lists, compute sum/length.",
      "The calling print shows results from two cases."
    ],
    "deeper": [
      {
        "question": "How does early return simplify code?",
        "answer": "It removes unnecessary nesting: validate and exit immediately, then keep the main calculation at the top level."
      },
      {
        "question": "What if a variable is only assigned inside a false if branch?",
        "answer": "Later reading it may cause UnboundLocalError or NameError. Ensure every path defines variables used after the branch."
      }
    ],
    "mistakes": [
      {
        "mistake": "Replacing return with print in helper functions",
        "correction": "print displays text but does not give the caller the computed value."
      },
      {
        "mistake": "Trying to read a local variable from outside the function",
        "correction": "Return it explicitly or pass it to another function."
      }
    ],
    "task": "Write safe_mean(values). Return None when input is empty; otherwise return the arithmetic mean as a float.",
    "starter": "def safe_mean(values):\n    # Guard empty input first.\n    pass",
    "checks": [
      {
        "name": "Three numbers",
        "code": "assert safe_mean([1,2,3])==2.0"
      },
      {
        "name": "One number",
        "code": "assert safe_mean([5])==5.0"
      },
      {
        "name": "Empty input",
        "code": "assert safe_mean([]) is None"
      }
    ],
    "hint": "if not values: return None; return sum(values) / len(values)",
    "solution": "def safe_mean(values):\n    if not values:\n        return None\n    return sum(values) / len(values)",
    "quiz": {
      "question": "What runs after return in the same executed function path?",
      "choices": [
        "Everything",
        "No later statement in that function call",
        "Only print"
      ],
      "correct": 1,
      "explain": "return ends the current function call immediately."
    },
    "recap": [
      "return exits and sends data",
      "Local names stay inside",
      "Validate, early return, then main logic"
    ],
    "docs": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"
  },
  {
    "id": "14",
    "shortTitle": "List, dict and set comprehensions",
    "essence": "A comprehension creates a collection from an iterable using one clear expression.",
    "analogy": "A small factory: take an item, transform it, optionally filter it, put the result in a new box.",
    "why": "Short comprehensions are common in ML preprocessing, interview questions and data-cleaning scripts.",
    "concepts": [
      {
        "label": "List comprehension",
        "explain": "[f(x) for x in items if condition] creates a list."
      },
      {
        "label": "Dictionary comprehension",
        "explain": "{key: value for item in items} builds a mapping."
      },
      {
        "label": "Set comprehension",
        "explain": "{f(x) for x in items} builds unique transformed elements."
      },
      {
        "label": "When not to use",
        "explain": "Use normal loops when branching or nesting makes a comprehension hard to explain."
      }
    ],
    "flow": [
      "Iterate items",
      "Filter + transform",
      "New collection"
    ],
    "example": "raw = [' p01 ', 'p02', ' p01 ']\nclean = [x.strip().upper() for x in raw]\nunique = {x for x in clean}\nlengths = {x: len(x) for x in unique}\nprint(sorted(unique))\nprint(lengths)",
    "output": "['P01', 'P02']\n{'P01': 3, 'P02': 3} (order may vary)",
    "walkthrough": [
      "Each string is stripped and uppercased.",
      "A set removes duplicates.",
      "A dict maps unique IDs to their string lengths.",
      "Set/dictionary iteration order should not be relied on for this generated mapping."
    ],
    "deeper": [
      {
        "question": "Is comprehension faster than a loop?",
        "answer": "Often concise and efficient, but clarity comes first. For complex logic, a regular loop is easier to debug."
      },
      {
        "question": "Why might dictionary comprehension overwrite keys?",
        "answer": "Dictionary keys are unique: later values with the same key replace earlier ones."
      }
    ],
    "mistakes": [
      {
        "mistake": "Nested comprehensions several levels deep",
        "correction": "Prefer explicit loops and helper functions when readability suffers."
      },
      {
        "mistake": "Assuming a set comprehension returns an ordered list",
        "correction": "Sets do not promise useful ordering. Sort explicitly when deterministic output matters."
      }
    ],
    "task": "Write normalize_unique(items) returning a SORTED list of unique uppercased, stripped, NONEMPTY strings.",
    "starter": "def normalize_unique(items):\n    # Create normalized unique nonempty IDs.\n    pass",
    "checks": [
      {
        "name": "Normal IDs",
        "code": "assert normalize_unique([' p01 ','P02','p01'])==['P01','P02']"
      },
      {
        "name": "Ignore blanks",
        "code": "assert normalize_unique(['  ',' a ',''])==['A']"
      },
      {
        "name": "Empty input",
        "code": "assert normalize_unique([])==[]"
      }
    ],
    "hint": "normalized = {x.strip().upper() for x in items if x.strip()}; return sorted(normalized)",
    "solution": "def normalize_unique(items):\n    normalized = {x.strip().upper() for x in items if x.strip()}\n    return sorted(normalized)",
    "quiz": {
      "question": "What does {x for x in [1,1,2]} create?",
      "choices": [
        "A list",
        "A set with 1 and 2",
        "A dictionary with two keys"
      ],
      "correct": 1,
      "explain": "Curly braces with a comprehension and no key:value form a set."
    },
    "recap": [
      "Comprehensions transform/filter",
      "{} with one expression makes a set",
      "Keep complex logic readable"
    ],
    "docs": "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions"
  },
  {
    "id": "15",
    "shortTitle": "range, enumerate, zip, any, all and sorting",
    "essence": "Python has built-ins that simplify counting, pairing, checking conditions and ordering.",
    "analogy": "Tools in your kit: one tool counts shelves, another pairs labels with scores, another checks them all.",
    "why": "You will write much cleaner interview code and ML-data loops using these helpers.",
    "concepts": [
      {
        "label": "range / enumerate",
        "explain": "range(3) yields 0,1,2; enumerate(items) yields index and item together."
      },
      {
        "label": "zip",
        "explain": "zip(labels, scores) pairs corresponding elements; by default it stops at the shortest input."
      },
      {
        "label": "any / all",
        "explain": "any checks whether at least one value is truthy; all checks whether every value is truthy."
      },
      {
        "label": "sorted and key",
        "explain": "sorted(..., key=..., reverse=True) returns a sorted list without mutating input; sorting is stable."
      }
    ],
    "flow": [
      "Pair labels and scores",
      "Filter by condition",
      "Sort the result"
    ],
    "example": "names = ['A', 'B', 'C']\nscores = [0.4, 0.9, 0.7]\npairs = list(zip(names, scores))\nprint(pairs)\nprint(any(s >= 0.8 for s in scores))\nprint(sorted(pairs, key=lambda x: x[1], reverse=True))",
    "output": "[('A', 0.4), ('B', 0.9), ('C', 0.7)]\nTrue\n[('B', 0.9), ('C', 0.7), ('A', 0.4)]",
    "walkthrough": [
      "zip pairs each name with its score.",
      "any checks whether at least one score is at least 0.8.",
      "sorted orders pairs by the score at index 1, from high to low."
    ],
    "deeper": [
      {
        "question": "What happens with mismatched zip lengths?",
        "answer": "Default zip silently stops at the shortest iterable. When mismatches are errors, validate lengths or use zip(..., strict=True) in supported Python versions."
      },
      {
        "question": "Are sorted and list.sort identical?",
        "answer": "sorted returns a NEW list; list.sort mutates the existing list and returns None."
      }
    ],
    "mistakes": [
      {
        "mistake": "for i in range(len(items)) always",
        "correction": "Use for item in items, or enumerate(items) when you really need the index."
      },
      {
        "mistake": "Using sorted(items, reverse='True')",
        "correction": "reverse must be a boolean True, not a string."
      }
    ],
    "task": "Write passing_names(names, scores, threshold). Pair with zip, keep scores >= threshold, and return names in DESCENDING score order.",
    "starter": "def passing_names(names, scores, threshold):\n    # Pair, filter, sort by score, return names.\n    pass",
    "checks": [
      {
        "name": "Descending passing labels",
        "code": "assert passing_names(['A','B','C'],[0.5,0.9,0.7],0.7)==['B','C']"
      },
      {
        "name": "None passing",
        "code": "assert passing_names(['A'],[0.2],0.5)==[]"
      },
      {
        "name": "All passing",
        "code": "assert passing_names(['L','R'],[0.8,0.9],0.1)==['R','L']"
      }
    ],
    "hint": "pairs = [(n,s) for n,s in zip(names,scores) if s>=threshold]; sorted(pairs,key=lambda pair:pair[1],reverse=True)",
    "solution": "def passing_names(names, scores, threshold):\n    pairs = [(name, score) for name, score in zip(names, scores) if score >= threshold]\n    ordered = sorted(pairs, key=lambda pair: pair[1], reverse=True)\n    return [name for name, _ in ordered]",
    "quiz": {
      "question": "What does enumerate(['A','B']) produce?",
      "choices": [
        "('A','B') only",
        "(0,'A'), (1,'B')",
        "(1,'A'), (2,'B')"
      ],
      "correct": 1,
      "explain": "Default enumerate starts indices at 0."
    },
    "recap": [
      "enumerate adds indexes",
      "zip pairs items",
      "sorted with key orders results"
    ],
    "docs": "https://docs.python.org/3/library/functions.html"
  },
  {
    "id": "16",
    "shortTitle": "Parsing strings and regular expressions",
    "essence": "Parsing extracts structured pieces from text. Regex expresses a reusable pattern.",
    "analogy": "A stamp template checks whether a label looks like P03_L, then extracts its parts.",
    "why": "Cleaning captured image labels, filenames and logs often requires reliable parsing.",
    "concepts": [
      {
        "label": "split / startswith",
        "explain": "Simple patterns often need only str.split, strip, startswith, endswith or partition."
      },
      {
        "label": "re.fullmatch",
        "explain": "Checks that the ENTIRE string matches the pattern; safer than partial matching for IDs."
      },
      {
        "label": "Groups and classes",
        "explain": "(\\d+) captures digits; [LR] matches L or R. Use [0-9] for ASCII digits only."
      },
      {
        "label": "Raw string",
        "explain": "Use r'pattern' to avoid Python interpreting regex backslashes before the regex engine sees them."
      }
    ],
    "flow": [
      "Raw ID 'P03_L'",
      "Pattern validation",
      "Extract (3,'L')"
    ],
    "example": "import re\npattern = r'P([0-9]{2})_([LR])'\nmatch = re.fullmatch(pattern, 'P03_L')\nprint(match.groups() if match else None)",
    "output": "('03', 'L')",
    "walkthrough": [
      "The regex requires P + exactly two digits + underscore + L or R.",
      "fullmatch rejects extra characters.",
      "groups returns the captured number and hand as strings."
    ],
    "deeper": [
      {
        "question": "Why use fullmatch rather than search for IDs?",
        "answer": "search may accept a partial match inside invalid text such as 'trash_P03_L_backup'. fullmatch rejects the entire invalid string."
      },
      {
        "question": "When not to use regex?",
        "answer": "Prefer straightforward str operations for simple delimiters. Regex adds complexity when not needed."
      }
    ],
    "mistakes": [
      {
        "mistake": "Using search() when validation requires exact IDs",
        "correction": "Use re.fullmatch(pattern, text) to reject trailing/leading characters."
      },
      {
        "mistake": "Forgetting that captured numbers are text",
        "correction": "Convert with int(match.group(1)) when numeric operations are required."
      }
    ],
    "task": "Write parse_hand_id(value): accept exactly P followed by TWO ASCII digits, underscore, L or R. Return (participant_number_as_int, hand) or None.",
    "starter": "import re\n\ndef parse_hand_id(value):\n    # Use re.fullmatch and return (int, str) or None.\n    pass",
    "checks": [
      {
        "name": "Valid left",
        "code": "assert parse_hand_id('P03_L')==(3,'L')"
      },
      {
        "name": "Valid right",
        "code": "assert parse_hand_id('P99_R')==(99,'R')"
      },
      {
        "name": "Invalid forms",
        "code": "assert parse_hand_id('P3_L') is None and parse_hand_id('junkP03_L') is None and parse_hand_id('P03_X') is None"
      }
    ],
    "hint": "match = re.fullmatch(r'P([0-9]{2})_([LR])', value); if not match: return None; return int(match.group(1)),match.group(2)",
    "solution": "import re\n\ndef parse_hand_id(value):\n    match = re.fullmatch(r'P([0-9]{2})_([LR])', value)\n    if not match:\n        return None\n    return int(match.group(1)), match.group(2)",
    "quiz": {
      "question": "Which regex function verifies an entire string's format?",
      "choices": [
        "re.fullmatch",
        "re.search",
        "str.replace"
      ],
      "correct": 0,
      "explain": "fullmatch requires the complete text to match the pattern."
    },
    "recap": [
      "Simple split may be enough",
      "fullmatch validates the whole ID",
      "Capture groups extract fields"
    ],
    "docs": "https://docs.python.org/3/library/re.html"
  }
];
