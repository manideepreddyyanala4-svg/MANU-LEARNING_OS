import type { PythonCodeExample } from './python-roadmap-code-a';
export const pythonInterviewExamplesB: Record<string,PythonCodeExample[]>={
  "11": [
    {
      "label": "Stack using a list",
      "anchor": "stack-push-pop",
      "code": "stack = []\nstack.append('first')\nstack.append('second')\nnewest = stack.pop()\noldest = stack.pop()\nprint(newest)\nprint(oldest)",
      "output": "second\nfirst",
      "explanation": "Use append to put items on the TOP of the stack.\npop removes the last item that was added.\nsecond comes out before first. This rule is called LIFO."
    },
    {
      "label": "Balanced parentheses with a stack",
      "anchor": "balanced-brackets",
      "code": "def balanced(text):\n    matching = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for letter in text:\n        if letter in '([{':\n            stack.append(letter)\n        elif letter in matching:\n            if len(stack) == 0:\n                return False\n            opened = stack.pop()\n            if opened != matching[letter]:\n                return False\n    return len(stack) == 0\n\nprint(balanced('{[()]}'))\nprint(balanced('{[(])}'))",
      "output": "True\nFalse",
      "explanation": "Store each opening bracket (like '(') in a stack.\nFor a closing bracket, remove the LAST opening bracket and check whether the pair matches.\nIf a pair is wrong or any opening bracket remains, return False. Otherwise return True."
    },
    {
      "label": "Undo operations with a stack",
      "anchor": "stack-undo",
      "code": "history = []\ntext = ''\nfor letter in 'cat':\n    history.append(text)\n    text = text + letter\nprint(text)\nprevious = history.pop()\ntext = previous\nprint(text)",
      "output": "cat\nca",
      "explanation": "Before every change, save the OLD text in history.\nAdd letters until text becomes cat.\npop returns the most recent old text. Restoring it undoes the last letter, giving ca."
    }
  ],
  "12": [
    {
      "label": "Queue using deque",
      "anchor": "queue-deque",
      "code": "from collections import deque\nqueue = deque()\nqueue.append('first')\nqueue.append('second')\nfirst = queue.popleft()\nsecond = queue.popleft()\nprint(first)\nprint(second)",
      "output": "first\nsecond",
      "explanation": "append adds items to the END of the queue.\npopleft removes the item that has waited the longest.\nfirst comes out before second. This rule is called FIFO."
    },
    {
      "label": "Breadth-first traversal with a queue",
      "anchor": "bfs-queue",
      "code": "from collections import deque\nneighbors = {'A': ['B', 'C'], 'B': ['D'], 'C': [], 'D': []}\nqueue = deque(['A'])\nseen = {'A'}\nwhile queue:\n    current = queue.popleft()\n    print(current)\n    for next_node in neighbors[current]:\n        if next_node not in seen:\n            seen.add(next_node)\n            queue.append(next_node)",
      "output": "A\nB\nC\nD",
      "explanation": "Begin at A. Its neighbors B and C go to the end of the queue.\nRead the FIRST waiting node, print it, and add its unseen neighbors.\nThis visits A, B, C, D: nearby nodes before deeper ones. This method is BFS."
    },
    {
      "label": "Stack versus queue",
      "anchor": "stack-queue-compare",
      "code": "from collections import deque\nstack = [1, 2, 3]\nqueue = deque([1, 2, 3])\nlast_item = stack.pop()\nfirst_item = queue.popleft()\nprint(last_item)\nprint(first_item)",
      "output": "3\n1",
      "explanation": "A stack removes the LAST stored number: 3.\nA queue removes the FIRST stored number: 1.\nStack = LIFO. Queue = FIFO."
    }
  ],
  "13": [
    {
      "label": "Binary search by halving",
      "anchor": "binary-search",
      "code": "def search(numbers, target):\n    left = 0\n    right = len(numbers) - 1\n    while left <= right:\n        middle = (left + right) // 2\n        value = numbers[middle]\n        if value == target:\n            return middle\n        if value < target:\n            left = middle + 1\n        else:\n            right = middle - 1\n    return -1\n\nprint(search([1, 3, 5, 7, 9], 7))",
      "output": "3",
      "explanation": "The input MUST already be sorted. Start with the first and last positions.\nLook at the middle number. If it is too small, ignore the left half; if too large, ignore the right half.\nRepeat until you find 7 at position 3, or return -1 if it is missing. This is O(log n)."
    },
    {
      "label": "Missing number in binary search",
      "anchor": "binary-search-missing",
      "code": "def contains(numbers, target):\n    left = 0\n    right = len(numbers) - 1\n    while left <= right:\n        middle = (left + right) // 2\n        value = numbers[middle]\n        if value == target:\n            return True\n        if value < target:\n            left = middle + 1\n        else:\n            right = middle - 1\n    return False\n\nprint(contains([2, 4, 6], 5))",
      "output": "False",
      "explanation": "The sorted list contains 2, 4 and 6. The target is 5.\nKeep only the half where 5 could appear.\nWhen left passes right, nothing remains to inspect, so return False."
    },
    {
      "label": "Leftmost insertion point with bisect",
      "anchor": "bisect-left",
      "code": "import bisect\nnumbers = [1, 3, 3, 5]\nfirst_three = bisect.bisect_left(numbers, 3)\nposition_for_four = bisect.bisect_left(numbers, 4)\nprint(first_three)\nprint(position_for_four)",
      "output": "1\n3",
      "explanation": "bisect_left works on a SORTED list.\nFor 3, it chooses the leftmost 3 at position 1.\nFor 4, it returns position 3, where 4 could be inserted in order."
    }
  ],
  "14": [
    {
      "label": "Sort numbers in ascending and descending order",
      "anchor": "sorting-basics",
      "code": "numbers = [4, 1, 3]\nascending = sorted(numbers)\ndescending = sorted(numbers, reverse=True)\nprint(ascending)\nprint(descending)\nprint(numbers)",
      "output": "[1, 3, 4]\n[4, 3, 1]\n[4, 1, 3]",
      "explanation": "sorted(numbers) gives a new list from small to large.\nreverse=True makes a new list from large to small.\nThe original numbers list is unchanged."
    },
    {
      "label": "Sort tuples by the second element",
      "anchor": "sort-key",
      "code": "pairs = [('A', 70), ('B', 90), ('C', 80)]\ndef get_score(pair):\n    return pair[1]\n\nordered = sorted(pairs, key=get_score, reverse=True)\nprint(ordered)",
      "output": "[('B', 90), ('C', 80), ('A', 70)]",
      "explanation": "Each pair has a name and a score.\nget_score returns the score at position 1. That is what sorting uses.\nreverse=True puts the largest score first. Defining a function makes the logic easier to see than a lambda."
    },
    {
      "label": "Stable sorting preserves equal-score order",
      "anchor": "stable-sort",
      "code": "rows = [('Alice', 80), ('Bob', 90), ('Cara', 80)]\ndef get_score(row):\n    return row[1]\n\nordered = sorted(rows, key=get_score)\nprint(ordered)",
      "output": "[('Alice', 80), ('Cara', 80), ('Bob', 90)]",
      "explanation": "Sort the people using their scores.\nAlice and Cara both have 80, so their scores tie.\nPython's stable sorting keeps Alice before Cara, just as in the original list."
    }
  ],
  "15": [
    {
      "label": "Recursive factorial and its base case",
      "anchor": "factorial-recursion",
      "code": "def factorial(number):\n    if number == 0:\n        return 1\n    return number * factorial(number - 1)\n\nprint(factorial(5))",
      "output": "120",
      "explanation": "5! means 5 × 4 × 3 × 2 × 1.\nThe function calls itself with a number one smaller each time.\nThe stopping rule is factorial(0) = 1. Without a stopping rule, recursion cannot finish."
    },
    {
      "label": "Recursive traversal of a small tree",
      "anchor": "recursive-tree",
      "code": "tree = {\n    'name': 'A',\n    'children': [\n        {'name': 'B', 'children': []},\n        {'name': 'C', 'children': []}\n    ]\n}\ndef visit(node):\n    print(node['name'])\n    for child in node['children']:\n        visit(child)\n\nvisit(tree)",
      "output": "A\nB\nC",
      "explanation": "Visit A and print its name.\nA has two children, B and C. Call the SAME function for each child.\nThose children have empty child lists, so the visits stop."
    },
    {
      "label": "Iterative versus recursive sum",
      "anchor": "recursion-iteration",
      "code": "def recursive_sum(numbers):\n    if len(numbers) == 0:\n        return 0\n    first = numbers[0]\n    rest = numbers[1:]\n    return first + recursive_sum(rest)\n\nprint(recursive_sum([1, 2, 3]))\nprint(sum([1, 2, 3]))",
      "output": "6\n6",
      "explanation": "Take the first number, then add the sum of the remaining numbers.\nAn empty list returns 0, which stops the recursion.\nPython's built-in sum does the same work more efficiently for ordinary lists."
    }
  ],
  "16": [
    {
      "label": "Understand overlapping intervals",
      "anchor": "overlap-intervals",
      "code": "first = [1, 4]\nsecond = [3, 6]\noverlap = second[0] <= first[1]\nprint(overlap)\nif overlap:\n    start = min(first[0], second[0])\n    end = max(first[1], second[1])\n    print([start, end])",
      "output": "True\n[1, 6]",
      "explanation": "The first interval covers 1 to 4. The second covers 3 to 6.\nBecause 3 is less than or equal to 4, they overlap.\nThe combined interval starts at 1 and ends at 6."
    },
    {
      "label": "Merge overlapping intervals",
      "anchor": "merge-intervals",
      "code": "intervals = [[1, 3], [2, 6], [8, 10], [9, 12]]\nintervals.sort()\nmerged = []\nfor start, end in intervals:\n    if len(merged) == 0:\n        merged.append([start, end])\n    elif start > merged[-1][1]:\n        merged.append([start, end])\n    else:\n        previous_end = merged[-1][1]\n        merged[-1][1] = max(previous_end, end)\nprint(merged)",
      "output": "[[1, 6], [8, 12]]",
      "explanation": "Sort intervals by their starting values.\nIf the new interval starts after the previous one ends, add a new interval.\nOtherwise they overlap, so extend the previous end. The result is [1,6] and [8,12]."
    },
    {
      "label": "Handle already-separated intervals",
      "anchor": "separate-intervals",
      "code": "intervals = [[1, 2], [5, 6], [9, 10]]\nintervals.sort()\nmerged = []\nfor start, end in intervals:\n    if len(merged) == 0 or start > merged[-1][1]:\n        merged.append([start, end])\n    else:\n        merged[-1][1] = max(merged[-1][1], end)\nprint(merged)",
      "output": "[[1, 2], [5, 6], [9, 10]]",
      "explanation": "The input intervals do not touch each other.\nEvery new start is greater than the previous end.\nAll intervals remain separate. Nothing needs merging."
    }
  ],
  "17": [
    {
      "label": "Parse space-separated integers",
      "anchor": "parse-ints",
      "code": "line = '10 20 30'\nparts = line.split()\nnumbers = []\nfor part in parts:\n    numbers.append(int(part))\nprint(numbers)\nprint(sum(numbers))",
      "output": "[10, 20, 30]\n60",
      "explanation": "split separates the input text at spaces.\nint converts each piece of text into a number.\nSave the numbers in a list, then add them using sum."
    },
    {
      "label": "Parse comma-separated input safely",
      "anchor": "parse-csv-like",
      "code": "text = '5, 9, 12'\nparts = text.split(',')\nvalues = []\nfor part in parts:\n    number = int(part.strip())\n    values.append(number)\nprint(values)",
      "output": "[5, 9, 12]",
      "explanation": "Split on commas, so you get three text pieces.\nstrip removes spaces and int converts each piece to a number.\nAppend the converted numbers to a new list."
    },
    {
      "label": "Extract filename and extension with pathlib",
      "anchor": "path-parts",
      "code": "from pathlib import Path\npath = Path('data') / 'hand_P01_L.jpg'\nfilename = path.name\nname_without_extension = path.stem\nextension = path.suffix\nprint(filename)\nprint(name_without_extension)\nprint(extension)",
      "output": "hand_P01_L.jpg\nhand_P01_L\n.jpg",
      "explanation": "Path joins a directory and a filename safely.\nname returns the full filename; stem removes the extension.\nsuffix gives the file extension, here .jpg."
    }
  ],
  "18": [
    {
      "label": "Find and fix an off-by-one bug",
      "anchor": "off-by-one",
      "code": "numbers = [2, 4, 6]\n# There are 3 elements: indexes 0, 1, 2.\nfor index in range(len(numbers)):\n    print(numbers[index])",
      "output": "2\n4\n6",
      "explanation": "A list of length 3 has indexes 0, 1 and 2.\nrange(len(numbers)) visits those 3 indexes only.\nUsing range(len(numbers) + 1) would also try index 3 and crash."
    },
    {
      "label": "Fix a bad running-total update",
      "anchor": "running-total-bug",
      "code": "numbers = [2, 3, 4]\ntotal = 0\nfor number in numbers:\n    total = total + number\nprint(total)",
      "output": "9",
      "explanation": "Start total at 0.\nAdd each number to the OLD total. Do not replace it with the current number.\nThe final total is 2 + 3 + 4 = 9."
    },
    {
      "label": "Use assertions to verify a bug fix",
      "anchor": "debug-with-assertions",
      "code": "def count_even(numbers):\n    count = 0\n    for number in numbers:\n        if number % 2 == 0:\n            count = count + 1\n    return count\n\nassert count_even([]) == 0\nassert count_even([1, 2, 4]) == 2\nprint('All checks passed')",
      "output": "All checks passed",
      "explanation": "count_even loops over numbers and counts those with remainder 0 after division by 2.\nThe assert lines check an empty list and a list containing two even numbers.\nIf either result is wrong, Python stops with an AssertionError."
    }
  ],
  "19": [
    {
      "label": "Check empty and singleton input",
      "anchor": "empty-singleton",
      "code": "def first_or_none(items):\n    if len(items) == 0:\n        return None\n    return items[0]\n\nprint(first_or_none([]))\nprint(first_or_none([5]))",
      "output": "None\n5",
      "explanation": "Before accessing items[0], check whether there are any items.\nAn empty list returns None instead of crashing.\nA list containing only 5 returns 5."
    },
    {
      "label": "Check duplicates and negative numbers",
      "anchor": "duplicates-negatives",
      "code": "def second_distinct_largest(numbers):\n    unique = set(numbers)\n    ordered = sorted(unique)\n    if len(ordered) < 2:\n        return None\n    return ordered[-2]\n\nprint(second_distinct_largest([-2, -2, -5]))\nprint(second_distinct_largest([7, 7]))",
      "output": "-5\nNone",
      "explanation": "Remove duplicates, then sort the remaining numbers.\nFor [-5, -2], the second largest is -5 even though it is negative.\nWhen only one different number exists, return None."
    },
    {
      "label": "Validate a range of known edge cases",
      "anchor": "edge-tests",
      "code": "def safe_max(numbers):\n    if len(numbers) == 0:\n        return None\n    return max(numbers)\n\nassert safe_max([]) is None\nassert safe_max([3]) == 3\nassert safe_max([-5, -1]) == -1\nprint('3 cases passed')",
      "output": "3 cases passed",
      "explanation": "Protect against empty input before using max().\nCheck a single-element list and a list of only negative numbers.\nThese three cases catch mistakes that a normal list of positive numbers might not show."
    }
  ],
  "20": [
    {
      "label": "Explain a brute-force Two Sum solution",
      "anchor": "tradeoff-bruteforce",
      "code": "def two_sum_slow(numbers, target):\n    for first in range(len(numbers)):\n        for second in range(first + 1, len(numbers)):\n            total = numbers[first] + numbers[second]\n            if total == target:\n                return (first, second)\n    return None\n\nprint(two_sum_slow([2, 7, 11], 9))",
      "output": "(0, 1)",
      "explanation": "Choose a first number, then compare it with every later number.\nIf the pair adds up to the target, return both positions.\nThe nested loops use O(n²) time but almost no extra memory."
    },
    {
      "label": "Explain the optimized dictionary solution",
      "anchor": "tradeoff-hashmap",
      "code": "def two_sum_fast(numbers, target):\n    seen = {}\n    for index in range(len(numbers)):\n        number = numbers[index]\n        needed = target - number\n        if needed in seen:\n            return (seen[needed], index)\n        seen[number] = index\n    return None\n\nprint(two_sum_fast([2, 7, 11], 9))",
      "output": "(0, 1)",
      "explanation": "Rather than testing every pair, save the numbers already visited.\nFor each number, calculate which partner is needed to reach target.\nA dictionary finds that partner quickly on average: O(n) time and O(n) extra space."
    },
    {
      "label": "Communicate assumptions and edge cases through code",
      "anchor": "explain-assumptions",
      "code": "def find_index(values, target):\n    for index in range(len(values)):\n        if values[index] == target:\n            return index\n    return -1\n\nprint(find_index([], 5))\nprint(find_index([4, 5, 5], 5))",
      "output": "-1\n1",
      "explanation": "Read values from left to right and return the FIRST matching position.\nReturn -1 if the target never appears.\nFor an empty list, the loop runs zero times. For duplicates, the first index wins."
    }
  ]
};
