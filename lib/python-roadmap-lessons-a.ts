import type { PythonRoadmapLesson } from './python-roadmap-types';
export const pythonLessonsA: PythonRoadmapLesson[] = [
  {
    "id": "01",
    "shortTitle": "Run your first Python program",
    "essence": "Python reads instructions and executes them. A .py file is a saved set of instructions.",
    "analogy": "A recipe is your .py file; the Python interpreter is the cook who follows it.",
    "why": "Every CV pipeline, script, test and interview coding task starts by running and checking Python code.",
    "concepts": [
      {
        "label": "Interpreter",
        "explain": "The program that executes Python code. Start with python or python3 in a terminal."
      },
      {
        "label": "Script (.py)",
        "explain": "A text file such as main.py containing Python instructions; run it with python main.py."
      },
      {
        "label": "Interactive shell",
        "explain": "Enter one statement at a time after >>> for quick experiments; exit() returns to the terminal."
      },
      {
        "label": "print()",
        "explain": "Displays values for inspection. It does not return a result from your function."
      }
    ],
    "flow": [
      "Write instructions",
      "Python executes them",
      "Read output or errors"
    ],
    "example": "print('Hello from Python!')\nsubject = 'Computer Vision'\nprint('Studying:', subject)",
    "output": "Hello from Python!\nStudying: Computer Vision",
    "walkthrough": [
      "print(...) displays text in the terminal.",
      "subject = ... stores a text value.",
      "print with a comma shows the label and stored value."
    ],
    "deeper": [
      {
        "question": "How is the terminal different from Python?",
        "answer": "The terminal starts programs. The Python interpreter reads your Python instructions. >>> means you are already inside the Python shell."
      },
      {
        "question": "What if the command python does not work?",
        "answer": "Check your installation, PATH, or try python3. Windows often supports py. In ManuOS the code runs in a browser worker."
      }
    ],
    "mistakes": [
      {
        "mistake": "Typing python main.py inside >>>",
        "correction": "Run that command in the OS terminal, not inside the Python interactive shell."
      },
      {
        "mistake": "Assuming print() returns a value",
        "correction": "print displays output and returns None; use return inside functions."
      }
    ],
    "task": "Write greet(name) that returns 'Hello, <name>!' without calling print inside the function.",
    "starter": "def greet(name):\n    # Return a greeting string.\n    pass",
    "checks": [
      {
        "name": "Name Manu",
        "code": "assert greet('Manu') == 'Hello, Manu!'"
      },
      {
        "name": "Other name",
        "code": "assert greet('AI') == 'Hello, AI!'"
      },
      {
        "name": "Empty name",
        "code": "assert greet('') == 'Hello, !'"
      }
    ],
    "hint": "Use 'Hello, ' + name + '!'. Return the constructed string.",
    "solution": "def greet(name):\n    return 'Hello, ' + name + '!'",
    "quiz": {
      "question": "Which command runs a saved file named main.py from a terminal?",
      "choices": [
        "python main.py",
        "print(main.py)",
        ">>> python main.py"
      ],
      "correct": 0,
      "explain": "python main.py tells the terminal to start the interpreter with that script."
    },
    "recap": [
      ".py = saved instructions",
      "Interpreter executes code",
      "print shows; return gives a value"
    ],
    "docs": "https://docs.python.org/3/tutorial/interpreter.html"
  },
  {
    "id": "02",
    "shortTitle": "Variables, data types and None",
    "essence": "A variable is a name pointing to a value. Its type tells Python what you can do with it.",
    "analogy": "A labeled shelf holds a value. You can replace the item without changing the shelf's name.",
    "why": "Image labels, confidence scores and file names have different types; mixing them creates subtle bugs.",
    "concepts": [
      {
        "label": "int / float",
        "explain": "int is a whole number (7); float is a decimal (0.95). A float can be imprecise."
      },
      {
        "label": "str / bool",
        "explain": "str stores text ('hand'); bool is either True or False."
      },
      {
        "label": "None",
        "explain": "Represents missing/no value, not 0, not an empty string. Use is None to check it."
      },
      {
        "label": "type() / assignment",
        "explain": "= assigns a name; type(x) reports the current object's type."
      }
    ],
    "flow": [
      "name = value",
      "Value has a type",
      "Operations depend on type"
    ],
    "example": "image_count = 20\nscore = 0.97\nis_valid = True\nmissing_id = None\nprint(type(score).__name__)\nprint(missing_id is None)",
    "output": "float\nTrue",
    "walkthrough": [
      "The first four lines assign int, float, bool and None values.",
      "type(score).__name__ reports float.",
      "is None checks whether the same singleton object is used."
    ],
    "deeper": [
      {
        "question": "Is 1 the same as True?",
        "answer": "1 == True is True, but 1 is True is False. Values and types differ; use explicit booleans for logic."
      },
      {
        "question": "Why not write x == None?",
        "answer": "Use x is None. Identity is the standard and cannot be redefined by a custom equality method."
      }
    ],
    "mistakes": [
      {
        "mistake": "'10' + 5",
        "correction": "Convert types deliberately: int('10') + 5 = 15, or '10' + str(5)."
      },
      {
        "mistake": "if value: to detect missing numbers",
        "correction": "Zero and False are falsy too. Use value is None when only a missing value is invalid."
      }
    ],
    "task": "Write describe_value(x). Return 'missing' for None, 'flag' for a bool, 'number' for int or float, otherwise 'text' for a string; return 'other' for anything else.",
    "starter": "def describe_value(x):\n    # Order matters: bool is a subclass of int.\n    pass",
    "checks": [
      {
        "name": "Missing",
        "code": "assert describe_value(None) == 'missing'"
      },
      {
        "name": "Boolean before integer",
        "code": "assert describe_value(True) == 'flag'"
      },
      {
        "name": "Numeric types",
        "code": "assert describe_value(3) == 'number' and describe_value(3.5) == 'number'"
      },
      {
        "name": "String and other",
        "code": "assert describe_value('hand') == 'text' and describe_value([]) == 'other'"
      }
    ],
    "hint": "Check x is None first. Then isinstance(x, bool), then isinstance(x, (int, float)).",
    "solution": "def describe_value(x):\n    if x is None:\n        return 'missing'\n    if isinstance(x, bool):\n        return 'flag'\n    if isinstance(x, (int, float)):\n        return 'number'\n    if isinstance(x, str):\n        return 'text'\n    return 'other'",
    "quiz": {
      "question": "What does x is None check?",
      "choices": [
        "Whether x is the missing-value object",
        "Whether x is zero",
        "Whether x is an empty string"
      ],
      "correct": 0,
      "explain": "None is a dedicated singleton missing-value marker."
    },
    "recap": [
      "= assigns names",
      "Types matter",
      "Use is None for missing values"
    ],
    "docs": "https://docs.python.org/3/tutorial/introduction.html"
  },
  {
    "id": "03",
    "shortTitle": "Numbers, comparisons and precedence",
    "essence": "Operators calculate results. Parentheses make the intended order explicit.",
    "analogy": "Like arithmetic on paper: multiply before adding, unless brackets say otherwise.",
    "why": "Interview bugs often come from integer division, off-by-one comparisons and wrong order of operations.",
    "concepts": [
      {
        "label": "+ - * /",
        "explain": "Add, subtract, multiply, divide; / always returns a float for ordinary numbers."
      },
      {
        "label": "// % **",
        "explain": "// is floor division, % is remainder, ** is exponentiation."
      },
      {
        "label": "== != < <= > >=",
        "explain": "Compare values. == tests equality; = assigns a variable."
      },
      {
        "label": "Precedence / and or not",
        "explain": "Multiplication comes before addition; comparisons combine with not, and, or. Prefer parentheses for clarity."
      }
    ],
    "flow": [
      "Inputs",
      "Operators and precedence",
      "Computed or boolean result"
    ],
    "example": "print(3 + 4 * 2)\nprint((3 + 4) * 2)\nprint(7 // 3, 7 % 3)\nprint(0.1 + 0.2 == 0.3)",
    "output": "11\n14\n2 1\nFalse",
    "walkthrough": [
      "Multiplication (4*2) runs before addition in line 1.",
      "Parentheses change the order in line 2.",
      "// and % give quotient and remainder for positive values here.",
      "Binary floating-point decimals are approximate; use tolerance when needed."
    ],
    "deeper": [
      {
        "question": "What does -7 // 3 return?",
        "answer": "-3. Floor division rounds down toward negative infinity, not toward zero."
      },
      {
        "question": "How to compare decimal calculations?",
        "answer": "Use math.isclose(a, b, rel_tol=..., abs_tol=...) rather than exact == for calculations."
      }
    ],
    "mistakes": [
      {
        "mistake": "Using = instead of == in if statements",
        "correction": "Use if x == 5:, because = assigns and == compares."
      },
      {
        "mistake": "Assuming 7 / 3 is 2",
        "correction": "7 / 3 is about 2.333; 7 // 3 is 2."
      }
    ],
    "task": "Write hours_and_remainder(minutes): return a tuple (whole_hours, remaining_minutes) for a nonnegative integer number of minutes.",
    "starter": "def hours_and_remainder(minutes):\n    # Use // and %, not /.\n    pass",
    "checks": [
      {
        "name": "One hour and a half",
        "code": "assert hours_and_remainder(90)==(1,30)"
      },
      {
        "name": "Zero",
        "code": "assert hours_and_remainder(0)==(0,0)"
      },
      {
        "name": "Multiple hours",
        "code": "assert hours_and_remainder(185)==(3,5)"
      }
    ],
    "hint": "hours = minutes // 60 and remainder = minutes % 60.",
    "solution": "def hours_and_remainder(minutes):\n    return minutes // 60, minutes % 60",
    "quiz": {
      "question": "What is the result of 2 + 3 * 4?",
      "choices": [
        "20",
        "14",
        "24"
      ],
      "correct": 1,
      "explain": "Multiplication happens first: 3*4=12, then add 2."
    },
    "recap": [
      "/ differs from //",
      "% gives remainder",
      "Parentheses clarify order"
    ],
    "docs": "https://docs.python.org/3/reference/expressions.html"
  },
  {
    "id": "04",
    "shortTitle": "Make decisions with if/elif/else",
    "essence": "A condition chooses which block of code executes.",
    "analogy": "Like traffic lights: green means go, red means stop; only the matching branch runs.",
    "why": "Quality filtering, handling invalid predictions and input validation are full of decision rules.",
    "concepts": [
      {
        "label": "if",
        "explain": "Test a condition; enter the indented block when it is true."
      },
      {
        "label": "elif / else",
        "explain": "elif handles another condition; else handles cases not matched earlier."
      },
      {
        "label": "Indentation",
        "explain": "Four spaces is the usual convention; indentation is part of Python syntax."
      },
      {
        "label": "and / or / not",
        "explain": "Combine or invert boolean checks. Conditions are evaluated left to right with short-circuiting."
      }
    ],
    "flow": [
      "Check first rule",
      "Else check next rule",
      "Run one matching branch"
    ],
    "example": "score = 0.86\nif score >= 0.9:\n    print('high')\nelif score >= 0.7:\n    print('medium')\nelse:\n    print('low')",
    "output": "medium",
    "walkthrough": [
      "First test asks if 0.86 is at least 0.9: false.",
      "Second test is true; Python prints medium.",
      "else is skipped because a prior branch already ran."
    ],
    "deeper": [
      {
        "question": "What does elif change?",
        "answer": "Only the first matching branch in the same if/elif/else chain runs. Separate if statements can all run."
      },
      {
        "question": "What is short-circuiting?",
        "answer": "With A and B, B is not evaluated if A is false. This avoids mistakes like checking x[0] on an empty list."
      }
    ],
    "mistakes": [
      {
        "mistake": "Using if score > 0.7 before if score > 0.9",
        "correction": "Order overlapping conditions from most specific/highest threshold to broadest."
      },
      {
        "mistake": "Forgetting the colon or indentation",
        "correction": "Write if condition: then indent all statements in its block."
      }
    ],
    "task": "Write quality_label(score): return 'invalid' for values outside [0,1], 'high' for >=0.9, 'medium' for >=0.7, otherwise 'low'.",
    "starter": "def quality_label(score):\n    # Handle invalid values first.\n    pass",
    "checks": [
      {
        "name": "High",
        "code": "assert quality_label(0.9)=='high'"
      },
      {
        "name": "Medium",
        "code": "assert quality_label(0.7)=='medium'"
      },
      {
        "name": "Low",
        "code": "assert quality_label(0.2)=='low'"
      },
      {
        "name": "Outside range",
        "code": "assert quality_label(-0.1)=='invalid' and quality_label(1.1)=='invalid'"
      }
    ],
    "hint": "Start with if score < 0 or score > 1. Then elif >= 0.9, elif >= 0.7, else.",
    "solution": "def quality_label(score):\n    if score < 0 or score > 1:\n        return 'invalid'\n    if score >= 0.9:\n        return 'high'\n    if score >= 0.7:\n        return 'medium'\n    return 'low'",
    "quiz": {
      "question": "How many branches run in one if/elif/else chain?",
      "choices": [
        "All true branches",
        "Exactly the first matching branch, or else",
        "Only else"
      ],
      "correct": 1,
      "explain": "The chain stops once a branch matches."
    },
    "recap": [
      "Conditions decide flow",
      "elif checks the next case",
      "Indentation defines the block"
    ],
    "docs": "https://docs.python.org/3/tutorial/controlflow.html#if-statements"
  },
  {
    "id": "05",
    "shortTitle": "Loops: for, while, break and continue",
    "essence": "A for loop visits each item. A while loop repeats while a condition is true. Both stop when their work is finished.",
    "analogy": "for is checking every person on a list. while is continuing a task until a condition changes.",
    "why": "Loops let you process image files, dataset rows and repeated tasks without writing the same instruction again.",
    "concepts": [
      {
        "label": "for loop",
        "explain": "Use for when you have a sequence or collection and want to visit its items one by one."
      },
      {
        "label": "range()",
        "explain": "range(stop) produces numbers from 0 up to (but not including) stop. Use range(len(items)) when you need indexes."
      },
      {
        "label": "while loop",
        "explain": "Use while when repetition depends on a condition, such as while an index is still inside a list."
      },
      {
        "label": "break",
        "explain": "Stops the nearest loop immediately, even if items or repetitions remain."
      },
      {
        "label": "continue",
        "explain": "Skips the rest of the current iteration and moves to the next item or condition check."
      }
    ],
    "flow": [
      "for: take the next item",
      "while: check the condition",
      "Run the loop body; break, continue or repeat"
    ],
    "example": "images = ['hand_1.jpg', 'hand_2.jpg', 'hand_3.jpg']\\n\\n# FOR: visit every item\\nfor image in images:\\n    print('Checking', image)\\n\\n# WHILE: repeat while the condition is true\\nindex = 0\\nwhile index < len(images):\\n    print('Index:', index)\\n    index += 1",
    "output": "Checking hand_1.jpg\\nChecking hand_2.jpg\\nChecking hand_3.jpg\\nIndex: 0\\nIndex: 1\\nIndex: 2",
    "walkthrough": [
      "The for loop takes each filename from images automatically; you do not update an index yourself.",
      "range(3) would produce 0, 1, 2. The stop value 3 is not included.",
      "The while loop checks index < len(images) before each repetition.",
      "index += 1 changes the condition's value so the while loop eventually stops.",
      "If index is not updated, the condition may stay true forever and create an infinite loop."
    ],
    "deeper": [
      {
        "question": "Should I use for or while?",
        "answer": "Use for when you want to visit each item or repeat a known number of times. Use while when you must keep going until a condition changes, such as waiting for valid input."
      },
      {
        "question": "What is the difference between break and continue?",
        "answer": "break exits the loop completely. continue skips only the current iteration; the loop then moves on."
      }
    ],
    "mistakes": [
      {
        "mistake": "Forgetting to update the condition variable in a while loop",
        "correction": "Update the variable inside the loop or use break when the stopping condition is met. Otherwise the loop may never end."
      },
      {
        "mistake": "Using range(1, 5) but expecting it to include 5",
        "correction": "The stop value is excluded. range(1, 5) produces 1, 2, 3, 4."
      },
      {
        "mistake": "Confusing break with continue",
        "correction": "break ends the loop; continue skips the current iteration only."
      }
    ],
    "task": "Write first_acceptable_score(scores). Use a while loop and an index to return the first score between 0.0 and 1.0 inclusive. Return None if no acceptable score exists.",
    "starter": "def first_acceptable_score(scores):\\n    index = 0\\n    # Use while to check each score.\\n    pass",
    "checks": [
      {
        "name": "First score is acceptable",
        "code": "assert first_acceptable_score([0.8, 0.4]) == 0.8"
      },
      {
        "name": "Skip invalid values",
        "code": "assert first_acceptable_score([-0.2, 1.4, 0.65]) == 0.65"
      },
      {
        "name": "No acceptable score",
        "code": "assert first_acceptable_score([-1, 2]) is None"
      },
      {
        "name": "Empty list",
        "code": "assert first_acceptable_score([]) is None"
      },
      {
        "name": "Boundary values",
        "code": "assert first_acceptable_score([1.0]) == 1.0 and first_acceptable_score([0.0]) == 0.0"
      }
    ],
    "hint": "While index < len(scores): read scores[index]. If it is between 0.0 and 1.0, return it. Otherwise increase index by 1. After the loop, return None.",
    "solution": "def first_acceptable_score(scores):\\n    index = 0\\n    while index < len(scores):\\n        score = scores[index]\\n        if 0.0 <= score <= 1.0:\\n            return score\\n        index += 1\\n    return None",
    "quiz": {
      "question": "When should you normally choose a while loop?",
      "choices": [
        "When you need to visit every item in a list",
        "When repetition should continue while a condition is true",
        "Whenever you want Python to choose a random number"
      ],
      "correct": 1,
      "explain": "A while loop checks its condition before each repetition and continues only while that condition is true."
    },
    "recap": [
      "for visits items in a sequence",
      "while repeats while a condition is true",
      "break exits; continue skips one iteration"
    ],
    "docs": "https://docs.python.org/3/tutorial/controlflow.html#for"
  },
  {
    "id": "06",
    "shortTitle": "Strings, slicing and Unicode",
    "essence": "A string is an ordered sequence of text characters. Index and slice it to select parts.",
    "analogy": "A row of labeled characters: the first is index 0; negative indexes count from the end.",
    "why": "You will handle file names, user inputs, image IDs and multilingual labels in Taiwan.",
    "concepts": [
      {
        "label": "Index / slice",
        "explain": "text[0] picks first character; text[1:4] returns positions 1, 2, 3 (end excluded)."
      },
      {
        "label": "Negative indexes",
        "explain": "text[-1] is the last character. text[::-1] reverses a string."
      },
      {
        "label": "Methods",
        "explain": ".strip() removes edge whitespace; .lower(), .upper(), .replace() transform text and return new strings."
      },
      {
        "label": "Unicode / f-strings",
        "explain": "Python str represents Unicode text, including 中文. f'{name}' inserts values into readable strings."
      }
    ],
    "flow": [
      "Raw text",
      "Clean or slice",
      "Normalized value"
    ],
    "example": "name = '  p01_l  '\nclean = name.strip().upper()\nprint(clean)\nprint(clean[:3])\nprint(f'ID: {clean}')",
    "output": "P01_L\nP01\nID: P01_L",
    "walkthrough": [
      "strip removes leading/trailing spaces.",
      "upper produces an uppercase copy.",
      "[:3] selects characters at indices 0 to 2.",
      "f-string inserts the cleaned ID."
    ],
    "deeper": [
      {
        "question": "Can a Python string be changed in place?",
        "answer": "No. Strings are immutable. name.upper() makes a new string; assign the result if you need it."
      },
      {
        "question": "Does len() always mean human-visible characters?",
        "answer": "No. Unicode combining marks and emoji sequences can contain multiple code points; len counts code points, not always what a reader sees as one character."
      }
    ],
    "mistakes": [
      {
        "mistake": "text[5] on a shorter string",
        "correction": "Check length or use a safe slice such as text[:5]."
      },
      {
        "mistake": "Calling name.strip() without assigning",
        "correction": "Strings are immutable. Save the new value: name = name.strip()."
      }
    ],
    "task": "Write normalize_hand_id(text) returning uppercased text with outer spaces removed and internal spaces replaced by underscores.",
    "starter": "def normalize_hand_id(text):\n    # Combine strip(), upper(), replace().\n    pass",
    "checks": [
      {
        "name": "Basic cleanup",
        "code": "assert normalize_hand_id(' p01 l ') == 'P01_L'"
      },
      {
        "name": "Already normalized",
        "code": "assert normalize_hand_id('P02_R')=='P02_R'"
      },
      {
        "name": "Empty text",
        "code": "assert normalize_hand_id('   ')==''"
      }
    ],
    "hint": "text.strip().upper().replace(' ', '_')",
    "solution": "def normalize_hand_id(text):\n    return text.strip().upper().replace(' ', '_')",
    "quiz": {
      "question": "What is 'python'[1:4]?",
      "choices": [
        "'yth'",
        "'ytho'",
        "'pyt'"
      ],
      "correct": 0,
      "explain": "Slice starts at index 1 (y) and stops before index 4."
    },
    "recap": [
      "Indexes start at 0",
      "Slice stop is excluded",
      "Strings return new values"
    ],
    "docs": "https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str"
  },
  {
    "id": "07",
    "shortTitle": "Lists and safe copying",
    "essence": "A list is an ordered, editable collection of values.",
    "analogy": "A numbered tray: you can replace, append or remove items while keeping the same tray.",
    "why": "Image paths, predictions, labels, training batches and interview exercises commonly use lists.",
    "concepts": [
      {
        "label": "append vs extend",
        "explain": "append(x) adds one element; extend(xs) adds each element from an iterable."
      },
      {
        "label": "Index and slice",
        "explain": "items[0] is first, items[-1] last, items[-3:] last three. Slices produce a new list."
      },
      {
        "label": "Copy and alias",
        "explain": "b = a points to the same list; b = a.copy() creates a separate shallow list."
      },
      {
        "label": "remove and pop",
        "explain": "remove(x) deletes first matching value; pop(i) deletes and returns a chosen item."
      }
    ],
    "flow": [
      "Start a list",
      "Append or edit",
      "Read or copy safely"
    ],
    "example": "paths = ['a.png', 'b.png']\npaths.append('c.png')\nlast_two = paths[-2:]\nprint(paths)\nprint(last_two)",
    "output": "['a.png', 'b.png', 'c.png']\n['b.png', 'c.png']",
    "walkthrough": [
      "Create a two-item list.",
      "append adds c.png as a third element.",
      "[-2:] selects the final two elements into a new list.",
      "Both lists are printed."
    ],
    "deeper": [
      {
        "question": "Does .copy() clone nested lists too?",
        "answer": "No. It is shallow: the outer list is new, but inner mutable objects are shared."
      },
      {
        "question": "What is the difference between append([1,2]) and extend([1,2])?",
        "answer": "append adds one nested list; extend adds two separate integer elements."
      }
    ],
    "mistakes": [
      {
        "mistake": "Doing result = paths.append(x)",
        "correction": "append mutates the list and returns None. Append first, then use paths."
      },
      {
        "mistake": "Using list[-1] on an empty list",
        "correction": "Check if the list has elements first."
      }
    ],
    "task": "Write tail_copy(items, n). Return the last n items in a new list; for n=0 return []; do not mutate items.",
    "starter": "def tail_copy(items, n):\n    # Be careful: items[-0:] is the entire list!\n    pass",
    "checks": [
      {
        "name": "Tail",
        "code": "x=[1,2,3,4]; assert tail_copy(x,2)==[3,4] and x==[1,2,3,4]"
      },
      {
        "name": "Zero",
        "code": "assert tail_copy([1,2,3],0)==[]"
      },
      {
        "name": "Too many",
        "code": "assert tail_copy([1,2],5)==[1,2]"
      },
      {
        "name": "New list",
        "code": "x=[1,2]; y=tail_copy(x,2); assert y is not x"
      }
    ],
    "hint": "For n <= 0 return []. Otherwise return items[-n:] (a slice).",
    "solution": "def tail_copy(items, n):\n    if n <= 0:\n        return []\n    return items[-n:]",
    "quiz": {
      "question": "After x=[1]; y=x; y.append(2), what is x?",
      "choices": [
        "[1]",
        "[1,2]",
        "None"
      ],
      "correct": 1,
      "explain": "x and y point to the same mutable list."
    },
    "recap": [
      "Lists are mutable",
      "append adds one item",
      "Slices copy the outer list"
    ],
    "docs": "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists"
  },
  {
    "id": "08",
    "shortTitle": "Tuples and unpacking",
    "essence": "A tuple is an ordered collection whose elements cannot be reassigned.",
    "analogy": "A sealed envelope containing coordinates; you can read the two values but not replace slots.",
    "why": "Function results, (height,width) shapes, coordinates and paired values are often tuples.",
    "concepts": [
      {
        "label": "Tuple",
        "explain": "Use (a, b) or a, b. Tuples preserve order, but cannot have their elements reassigned."
      },
      {
        "label": "Unpacking",
        "explain": "height, width = (128, 256) assigns each tuple value to its own variable."
      },
      {
        "label": "Single item",
        "explain": "(5,) is a one-element tuple; (5) is just the number 5."
      },
      {
        "label": "Return multiple",
        "explain": "return a, b builds a tuple; the caller can unpack both values."
      }
    ],
    "flow": [
      "Pair values",
      "Unpack into names",
      "Use together or swap"
    ],
    "example": "shape = (128, 256)\nheight, width = shape\nwidth, height = height, width\nprint(width, height)",
    "output": "128 256",
    "walkthrough": [
      "shape stores a two-element tuple.",
      "Unpacking assigns 128 and 256 to separate names.",
      "Simultaneous assignment swaps both values.",
      "The print shows the swapped names."
    ],
    "deeper": [
      {
        "question": "Are tuples deeply immutable?",
        "answer": "No. A tuple can hold a mutable list; you cannot replace the tuple's slot, but the list itself may change."
      },
      {
        "question": "When are tuples useful?",
        "answer": "For fixed-size related values like (height,width), function results or immutable keys when all elements are hashable."
      }
    ],
    "mistakes": [
      {
        "mistake": "Writing x = (5) to create a tuple",
        "correction": "Use x = (5,) for a one-element tuple."
      },
      {
        "mistake": "height, width = (128, 256, 3)",
        "correction": "Unpacking requires matching counts (unless starred unpacking is used)."
      }
    ],
    "task": "Write swap_pair(pair) that returns a two-element tuple in reverse order without modifying the original.",
    "starter": "def swap_pair(pair):\n    # Unpack and return a tuple.\n    pass",
    "checks": [
      {
        "name": "Normal",
        "code": "assert swap_pair((3,7))==(7,3)"
      },
      {
        "name": "Strings",
        "code": "assert swap_pair(('L','R'))==('R','L')"
      },
      {
        "name": "Original unchanged",
        "code": "x=(1,2); swap_pair(x); assert x==(1,2)"
      }
    ],
    "hint": "a, b = pair; return b, a",
    "solution": "def swap_pair(pair):\n    a, b = pair\n    return b, a",
    "quiz": {
      "question": "Which expression creates a one-element tuple?",
      "choices": [
        "(5)",
        "(5,)",
        "[5]"
      ],
      "correct": 1,
      "explain": "The comma creates the one-element tuple."
    },
    "recap": [
      "Tuples keep ordered values",
      "Unpacking assigns multiple names",
      "One-element tuple needs a comma"
    ],
    "docs": "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences"
  }
];
