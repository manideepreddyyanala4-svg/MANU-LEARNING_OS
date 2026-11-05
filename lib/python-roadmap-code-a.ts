export type PythonCodeExample={label:string;anchor:string;code:string;output?:string;explanation:string;language?:'python'|'bash'};
export const pythonCodeExamplesA: Record<string,PythonCodeExample[]>={
  "01": [
    {
      "label": "Print text and numbers",
      "anchor": "print",
      "code": "print('Hello!')\nprint(10 + 5)",
      "output": "Hello!\n15",
      "explanation": "print() displays values on the screen. Python calculates 10 + 5 first, then prints 15."
    },
    {
      "label": "Variables and printing",
      "anchor": "variables",
      "code": "name = 'Manu'\nage = 23\nprint(name)\nprint(age)",
      "output": "Manu\n23",
      "explanation": "= stores a value under a name. The variable name stores text, while age stores a number."
    },
    {
      "label": "Run a .py file",
      "anchor": "run-script",
      "language": "bash",
      "code": "python main.py\n# On some systems:\npython3 main.py",
      "output": "The output from main.py",
      "explanation": "Save Python code in a file named main.py. Run this command in the terminal, not inside Python's >>> shell."
    }
  ],
  "02": [
    {
      "label": "Basic data types",
      "anchor": "types",
      "code": "age = 23                 # int\nheight = 1.75            # float\nname = 'Manu'            # str\nis_student = True        # bool\nprint(type(age).__name__)\nprint(type(height).__name__)\nprint(type(name).__name__)\nprint(type(is_student).__name__)",
      "output": "int\nfloat\nstr\nbool",
      "explanation": "int stores whole numbers; float stores decimals; str stores text; bool stores True or False. type() reveals an object's type."
    },
    {
      "label": "None is not zero",
      "anchor": "none",
      "code": "score = None\nprint(score is None)\nscore = 0\nprint(score is None)",
      "output": "True\nFalse",
      "explanation": "None means no value. Zero is still a real numeric value. Use is None to check for missing data."
    },
    {
      "label": "Convert types",
      "anchor": "conversions",
      "code": "text = '25'\nnumber = int(text)\nprint(number + 5)\nprint(str(number) + ' images')",
      "output": "30\n25 images",
      "explanation": "int() converts numeric text into an integer. str() converts a number into text; Python does not automatically concatenate strings and integers."
    }
  ],
  "03": [
    {
      "label": "Arithmetic operators",
      "anchor": "arithmetic",
      "code": "print(8 + 2)  # addition\nprint(8 - 2)  # subtraction\nprint(8 * 2)  # multiplication\nprint(8 / 2)  # division",
      "output": "10\n6\n16\n4.0",
      "explanation": "/ returns a float in normal division. The arithmetic symbols behave much like ordinary math."
    },
    {
      "label": "Floor division, remainder and powers",
      "anchor": "floor-mod-power",
      "code": "print(7 // 2)\nprint(7 % 2)\nprint(2 ** 3)\nprint((2 + 3) * 4)",
      "output": "3\n1\n8\n20",
      "explanation": "// rounds the quotient down, % returns the remainder, and ** calculates a power. Parentheses run first."
    },
    {
      "label": "Comparison and Boolean operators",
      "anchor": "comparisons",
      "code": "age = 23\nprint(age >= 18)\nprint(age == 23)\nprint(age != 20)\nprint(age > 18 and age < 30)",
      "output": "True\nTrue\nTrue\nTrue",
      "explanation": "Comparisons give True or False. == checks equality; = only assigns. and needs both conditions to be true."
    }
  ],
  "04": [
    {
      "label": "Simple if/else",
      "anchor": "if-else",
      "code": "score = 75\nif score >= 50:\n    print('Pass')\nelse:\n    print('Fail')",
      "output": "Pass",
      "explanation": "Python checks the condition after if. Its indented block runs only when the condition is true; otherwise the else block runs."
    },
    {
      "label": "Multiple decisions with elif",
      "anchor": "elif",
      "code": "marks = 82\nif marks >= 90:\n    print('A')\nelif marks >= 75:\n    print('B')\nelif marks >= 50:\n    print('C')\nelse:\n    print('F')",
      "output": "B",
      "explanation": "elif means else-if. Python checks the branches in order and runs only the first matching branch."
    },
    {
      "label": "Nested if conditions",
      "anchor": "nested-if",
      "code": "has_permit = True\nhours = 16\nif has_permit:\n    if hours <= 20:\n        print('Hours within general semester limit')\n    else:\n        print('Check hours')\nelse:\n    print('Check authorization')",
      "output": "Hours within general semester limit",
      "explanation": "An if can contain another if. Both outer and inner conditions must match to reach the deepest print. This is a coding example, not a legal eligibility decision."
    }
  ],
  "05": [
    {
      "label": "for loop — repeat over values",
      "anchor": "for-loop",
      "code": "names = ['Manu', 'Ravi', 'Anu']\nfor name in names:\n    print(name)",
      "output": "Manu\nRavi\nAnu",
      "explanation": "for takes one item from the list each time. The indented code runs once for every name."
    },
    {
      "label": "for loop with range()",
      "anchor": "range-loop",
      "code": "for number in range(1, 6):\n    print(number)",
      "output": "1\n2\n3\n4\n5",
      "explanation": "range(1, 6) produces 1, 2, 3, 4, 5. The ending value 6 is excluded."
    },
    {
      "label": "while loop — REPEATS while a condition is True",
      "anchor": "while-loop",
      "code": "number = 1\nwhile number <= 5:\n    print(number)\n    number += 1\nprint('Finished')",
      "output": "1\n2\n3\n4\n5\nFinished",
      "explanation": "while checks number <= 5 before every repetition. number += 1 is essential: without changing number, the condition would stay True and the loop could run forever. When number becomes 6, the loop ends."
    },
    {
      "label": "while loop with a countdown",
      "anchor": "while-countdown",
      "code": "seconds = 3\nwhile seconds > 0:\n    print(seconds)\n    seconds -= 1\nprint('Go!')",
      "output": "3\n2\n1\nGo!",
      "explanation": "The condition is checked at the top of each cycle. seconds -= 1 reduces the counter, so the loop eventually stops."
    },
    {
      "label": "break — stop the loop immediately",
      "anchor": "break",
      "code": "for number in [1, 2, 3, 4, 5]:\n    if number == 3:\n        break\n    print(number)",
      "output": "1\n2",
      "explanation": "break exits the nearest loop. The number 3 is not printed, and numbers 4 and 5 are never reached."
    },
    {
      "label": "continue — skip one cycle",
      "anchor": "continue",
      "code": "for number in range(1, 6):\n    if number == 3:\n        continue\n    print(number)",
      "output": "1\n2\n4\n5",
      "explanation": "continue skips the remaining statements in the current iteration, but the loop continues with later values."
    },
    {
      "label": "while and continue — avoid infinite loops",
      "anchor": "while-continue",
      "code": "number = 0\nwhile number < 5:\n    number += 1\n    if number == 3:\n        continue\n    print(number)",
      "output": "1\n2\n4\n5",
      "explanation": "The counter is updated before continue. If you skip the update, a while loop might never reach its stopping condition."
    },
    {
      "label": "Nested loops — one loop inside another",
      "anchor": "nested-loops",
      "code": "for row in range(1, 3):\n    for col in range(1, 4):\n        print(row, col)",
      "output": "1 1\n1 2\n1 3\n2 1\n2 2\n2 3",
      "explanation": "For each row, the inner loop runs through every column. The inner loop completes before the outer loop moves to the next row."
    },
    {
      "label": "while True with a clear stopping rule",
      "anchor": "while-true",
      "code": "attempt = 0\nwhile True:\n    attempt += 1\n    if attempt == 3:\n        break\n    print('Try', attempt)\nprint('Done')",
      "output": "Try 1\nTry 2\nDone",
      "explanation": "while True has no natural stopping condition. The if with break is its exit rule. Use this pattern only when the exit condition is guaranteed or safely handled."
    },
    {
      "label": "Loop else — only when no break happens",
      "anchor": "loop-else",
      "code": "for number in [1, 3, 5]:\n    if number % 2 == 0:\n        print('Found even')\n        break\nelse:\n    print('No even numbers')",
      "output": "No even numbers",
      "explanation": "The else block attached to a loop runs only when the loop finishes without break. It does not mean 'the condition in if was false'."
    }
  ],
  "06": [
    {
      "label": "String indexing",
      "anchor": "indexing",
      "code": "word = 'Python'\nprint(word[0])\nprint(word[2])\nprint(word[-1])",
      "output": "P\nt\nn",
      "explanation": "Strings have positions starting from 0. -1 means the last character."
    },
    {
      "label": "String slicing",
      "anchor": "slicing",
      "code": "word = 'Python'\nprint(word[:3])\nprint(word[2:5])\nprint(word[::-1])",
      "output": "Pyt\ntho\nnohtyP",
      "explanation": "[start:stop] includes start but excludes stop. A step of -1 reverses the string."
    },
    {
      "label": "String methods and f-strings",
      "anchor": "string-methods",
      "code": "name = '  manu  '\nclean = name.strip().title()\nprint(clean)\nprint(f'Hello, {clean}!')",
      "output": "Manu\nHello, Manu!",
      "explanation": "strip() removes outer spaces; title() capitalizes words. f-strings insert values inside text."
    },
    {
      "label": "Unicode strings",
      "anchor": "unicode",
      "code": "message = 'Hello 中文 తెలుగు'\nprint(message)\nprint('中文' in message)",
      "output": "Hello 中文 తెలుగు\nTrue",
      "explanation": "Python 3 strings support Unicode text. in checks whether a piece of text appears in another string."
    }
  ],
  "07": [
    {
      "label": "Create and edit a list",
      "anchor": "list-basics",
      "code": "items = [10, 20, 30]\nitems.append(40)\nprint(items)\nitems[0] = 5\nprint(items)",
      "output": "[10, 20, 30, 40]\n[5, 20, 30, 40]",
      "explanation": "Lists are ordered and mutable. append adds one value at the end; assigning items[0] replaces the first item."
    },
    {
      "label": "Index and slice a list",
      "anchor": "list-slicing",
      "code": "items = ['a', 'b', 'c', 'd']\nprint(items[-1])\nprint(items[1:3])\nprint(items[:2])",
      "output": "d\n['b', 'c']\n['a', 'b']",
      "explanation": "Indexes start at 0; negative indexes count from the end. Slices copy the selected outer list."
    },
    {
      "label": "append versus extend",
      "anchor": "append-extend",
      "code": "a = [1]\na.append([2, 3])\nprint(a)\nb = [1]\nb.extend([2, 3])\nprint(b)",
      "output": "[1, [2, 3]]\n[1, 2, 3]",
      "explanation": "append inserts its entire argument as ONE element. extend inserts each element from the supplied iterable."
    },
    {
      "label": "Remove and copy",
      "anchor": "remove-copy",
      "code": "items = [1, 2, 3]\ncopy_items = items.copy()\ncopy_items.remove(2)\nprint(items)\nprint(copy_items)",
      "output": "[1, 2, 3]\n[1, 3]",
      "explanation": "copy makes a new outer list. remove deletes the first matching value; the original list remains unchanged here."
    }
  ],
  "08": [
    {
      "label": "Create a tuple",
      "anchor": "tuple-basics",
      "code": "shape = (128, 224)\nprint(shape[0])\nprint(type(shape).__name__)",
      "output": "128\ntuple",
      "explanation": "Tuples store ordered values. Unlike lists, tuple positions cannot be reassigned."
    },
    {
      "label": "Unpack tuple into variables",
      "anchor": "unpacking",
      "code": "height, width = (128, 224)\nprint(height)\nprint(width)",
      "output": "128\n224",
      "explanation": "Unpacking assigns each tuple element to a different name. The number of target names must match."
    },
    {
      "label": "Swap two values",
      "anchor": "swap",
      "code": "left = 'L'\nright = 'R'\nleft, right = right, left\nprint(left, right)",
      "output": "R L",
      "explanation": "Python evaluates right-hand values first, then assigns them. No temporary variable is needed."
    }
  ]
};
