import type { PythonCodeExample } from './python-roadmap-code-a';
export const pythonInterviewExamplesB: Record<string,PythonCodeExample[]>={
  "11": [
    {
      "label": "Stack using a list",
      "anchor": "stack-push-pop",
      "code": "stack = []\nstack.append('first')\nstack.append('second')\nprint(stack.pop())\nprint(stack.pop())",
      "output": "second\nfirst",
      "explanation": "A stack is LIFO: last in, first out. append() pushes onto the stack, and pop() removes the newest item."
    },
    {
      "label": "Balanced parentheses with a stack",
      "anchor": "balanced-brackets",
      "code": "def balanced(text):\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for char in text:\n        if char in '([{':\n            stack.append(char)\n        elif char in pairs:\n            if not stack or stack.pop() != pairs[char]:\n                return False\n    return not stack\n\nprint(balanced('{[()]}'))\nprint(balanced('{[(])}'))",
      "output": "True\nFalse",
      "explanation": "Push opening brackets. For each closing bracket, pop the most recent opening bracket and verify it matches. An empty stack at the end means all were closed."
    },
    {
      "label": "Undo operations with a stack",
      "anchor": "stack-undo",
      "code": "history = []\ntext = ''\nfor letter in 'cat':\n    history.append(text)\n    text += letter\nprint(text)\ntext = history.pop()\nprint(text)",
      "output": "cat\nca",
      "explanation": "Save the previous state before each change. Undo restores the most recent stored state, like a stack."
    }
  ],
  "12": [
    {
      "label": "Queue using deque",
      "anchor": "queue-deque",
      "code": "from collections import deque\nqueue = deque()\nqueue.append('first')\nqueue.append('second')\nprint(queue.popleft())\nprint(queue.popleft())",
      "output": "first\nsecond",
      "explanation": "A queue is FIFO: first in, first out. deque.append adds at the end; deque.popleft removes from the beginning efficiently."
    },
    {
      "label": "Breadth-first traversal with a queue",
      "anchor": "bfs-queue",
      "code": "from collections import deque\ngraph = {'A': ['B', 'C'], 'B': ['D'], 'C': [], 'D': []}\nqueue = deque(['A'])\nseen = {'A'}\nwhile queue:\n    node = queue.popleft()\n    print(node)\n    for neighbor in graph[node]:\n        if neighbor not in seen:\n            seen.add(neighbor)\n            queue.append(neighbor)",
      "output": "A\nB\nC\nD",
      "explanation": "Breadth-first search visits nearby nodes before deeper nodes. The deque stores the next nodes in arrival order."
    },
    {
      "label": "Stack versus queue",
      "anchor": "stack-queue-compare",
      "code": "from collections import deque\nstack = [1, 2, 3]\nqueue = deque([1, 2, 3])\nprint(stack.pop())\nprint(queue.popleft())",
      "output": "3\n1",
      "explanation": "Stack pop removes the newest element (3). Queue popleft removes the oldest element (1)."
    }
  ],
  "13": [
    {
      "label": "Binary search by halving",
      "anchor": "binary-search",
      "code": "def search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nprint(search([1, 3, 5, 7, 9], 7))",
      "output": "3",
      "explanation": "Binary search only works on SORTED input. Each step discards half of the remaining search space, giving O(log n) time."
    },
    {
      "label": "Missing number in binary search",
      "anchor": "binary-search-missing",
      "code": "def contains(nums, value):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == value:\n            return True\n        if nums[mid] < value:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return False\n\nprint(contains([2, 4, 6], 5))",
      "output": "False",
      "explanation": "If no middle element matches and the search bounds cross, the target is absent. Return False rather than accessing an invalid index."
    },
    {
      "label": "Leftmost insertion point with bisect",
      "anchor": "bisect-left",
      "code": "import bisect\nnumbers = [1, 3, 3, 5]\nprint(bisect.bisect_left(numbers, 3))\nprint(bisect.bisect_left(numbers, 4))",
      "output": "1\n3",
      "explanation": "bisect_left finds where a value could be inserted without breaking sorted order. For duplicates it returns the first matching position."
    }
  ],
  "14": [
    {
      "label": "Sort numbers in ascending and descending order",
      "anchor": "sorting-basics",
      "code": "numbers = [4, 1, 3]\nprint(sorted(numbers))\nprint(sorted(numbers, reverse=True))\nprint(numbers)",
      "output": "[1, 3, 4]\n[4, 3, 1]\n[4, 1, 3]",
      "explanation": "sorted returns a NEW list; reverse=True gives descending order. The original list is unchanged."
    },
    {
      "label": "Sort tuples by the second element",
      "anchor": "sort-key",
      "code": "pairs = [('A', 70), ('B', 90), ('C', 80)]\nresult = sorted(pairs, key=lambda item: item[1], reverse=True)\nprint(result)",
      "output": "[('B', 90), ('C', 80), ('A', 70)]",
      "explanation": "A key function chooses the value used for sorting. lambda item: item[1] sorts by score instead of name."
    },
    {
      "label": "Stable sorting preserves equal-score order",
      "anchor": "stable-sort",
      "code": "rows = [('Alice', 80), ('Bob', 90), ('Cara', 80)]\nresult = sorted(rows, key=lambda row: row[1])\nprint(result)",
      "output": "[('Alice', 80), ('Cara', 80), ('Bob', 90)]",
      "explanation": "Python sorting is stable: items with equal keys keep their original relative order (Alice before Cara)."
    }
  ],
  "15": [
    {
      "label": "Recursive factorial and its base case",
      "anchor": "factorial-recursion",
      "code": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))",
      "output": "120",
      "explanation": "Recursion means a function calls itself. The base case n <= 1 stops the calls; otherwise the input becomes smaller. This example assumes n is nonnegative."
    },
    {
      "label": "Recursive traversal of a small tree",
      "anchor": "recursive-tree",
      "code": "tree = {'value': 'A', 'children': [\n    {'value': 'B', 'children': []},\n    {'value': 'C', 'children': []}\n]}\ndef walk(node):\n    print(node['value'])\n    for child in node['children']:\n        walk(child)\n\nwalk(tree)",
      "output": "A\nB\nC",
      "explanation": "The function visits the current node, then recursively visits each child. A leaf with no children stops naturally."
    },
    {
      "label": "Iterative versus recursive sum",
      "anchor": "recursion-iteration",
      "code": "def recursive_sum(nums):\n    if not nums:\n        return 0\n    return nums[0] + recursive_sum(nums[1:])\n\nprint(recursive_sum([1, 2, 3]))\nprint(sum([1, 2, 3]))",
      "output": "6\n6",
      "explanation": "Both approaches compute the same result. The recursive slicing version creates extra lists and uses call-stack space; an iterative loop or sum() is more efficient here."
    }
  ],
  "16": [
    {
      "label": "Understand overlapping intervals",
      "anchor": "overlap-intervals",
      "code": "a = [1, 4]\nb = [3, 6]\nprint(b[0] <= a[1])\nprint([min(a[0], b[0]), max(a[1], b[1])])",
      "output": "True\n[1, 6]",
      "explanation": "After intervals are sorted by start, two closed intervals overlap when the next start is <= the current end. Their union spans the smallest start to the largest end."
    },
    {
      "label": "Merge overlapping intervals",
      "anchor": "merge-intervals",
      "code": "intervals = [[1, 3], [2, 6], [8, 10], [9, 12]]\nmerged = []\nfor start, end in sorted(intervals):\n    if not merged or start > merged[-1][1]:\n        merged.append([start, end])\n    else:\n        merged[-1][1] = max(merged[-1][1], end)\nprint(merged)",
      "output": "[[1, 6], [8, 12]]",
      "explanation": "Sort intervals by start. Add a new interval if there is a gap; otherwise extend the current interval's end. Sorting dominates: O(n log n) time."
    },
    {
      "label": "Handle already-separated intervals",
      "anchor": "separate-intervals",
      "code": "intervals = [[1, 2], [5, 6], [9, 10]]\nmerged = []\nfor start, end in sorted(intervals):\n    if not merged or start > merged[-1][1]:\n        merged.append([start, end])\n    else:\n        merged[-1][1] = max(merged[-1][1], end)\nprint(merged)",
      "output": "[[1, 2], [5, 6], [9, 10]]",
      "explanation": "If the next start is greater than the current end, there is no overlap and a new output interval is needed."
    }
  ],
  "17": [
    {
      "label": "Parse space-separated integers",
      "anchor": "parse-ints",
      "code": "line = '10 20 30'\nnumbers = [int(x) for x in line.split()]\nprint(numbers)\nprint(sum(numbers))",
      "output": "[10, 20, 30]\n60",
      "explanation": "split() separates whitespace-delimited words. int() converts each word into a number before calculations."
    },
    {
      "label": "Parse comma-separated input safely",
      "anchor": "parse-csv-like",
      "code": "text = '5, 9, 12'\nvalues = [int(part.strip()) for part in text.split(',')]\nprint(values)",
      "output": "[5, 9, 12]",
      "explanation": "split(',') separates columns. strip() removes surrounding whitespace. Invalid numeric text would raise ValueError and should be validated in real input."
    },
    {
      "label": "Extract filename and extension with pathlib",
      "anchor": "path-parts",
      "code": "from pathlib import Path\npath = Path('data') / 'hand_P01_L.jpg'\nprint(path.name)\nprint(path.stem)\nprint(path.suffix)",
      "output": "hand_P01_L.jpg\nhand_P01_L\n.jpg",
      "explanation": "Path.name gives the file name, stem removes the extension, and suffix returns the extension. This works across operating systems."
    }
  ],
  "18": [
    {
      "label": "Find and fix an off-by-one bug",
      "anchor": "off-by-one",
      "code": "numbers = [2, 4, 6]\n# Wrong: range(len(numbers) + 1) accesses numbers[3]\nfor i in range(len(numbers)):\n    print(numbers[i])",
      "output": "2\n4\n6",
      "explanation": "Valid indexes run from 0 through len(numbers) - 1. range(len(numbers)) is safe; adding 1 would cause IndexError."
    },
    {
      "label": "Fix a bad running-total update",
      "anchor": "running-total-bug",
      "code": "values = [2, 3, 4]\ntotal = 0\nfor value in values:\n    total += value  # correct: accumulate, don't overwrite\nprint(total)",
      "output": "9",
      "explanation": "Using total = value inside the loop discards earlier values. total += value keeps adding to the previous sum."
    },
    {
      "label": "Use assertions to verify a bug fix",
      "anchor": "debug-with-assertions",
      "code": "def count_even(numbers):\n    return sum(1 for n in numbers if n % 2 == 0)\n\nassert count_even([]) == 0\nassert count_even([1, 2, 4]) == 2\nprint('All checks passed')",
      "output": "All checks passed",
      "explanation": "Tests compare actual behavior against expected behavior. Empty input and mixed numbers expose mistakes that a single normal example might miss."
    }
  ],
  "19": [
    {
      "label": "Check empty and singleton input",
      "anchor": "empty-singleton",
      "code": "def first_or_none(items):\n    return items[0] if items else None\n\nprint(first_or_none([]))\nprint(first_or_none([5]))",
      "output": "None\n5",
      "explanation": "An empty list has no index 0. Check before indexing. A one-element list should also work."
    },
    {
      "label": "Check duplicates and negative numbers",
      "anchor": "duplicates-negatives",
      "code": "def second_distinct_largest(numbers):\n    values = sorted(set(numbers))\n    return values[-2] if len(values) >= 2 else None\n\nprint(second_distinct_largest([-2, -2, -5]))\nprint(second_distinct_largest([7, 7]))",
      "output": "-5\nNone",
      "explanation": "Check distinctness and negative values; initializing largest to zero would fail for an all-negative list."
    },
    {
      "label": "Validate a range of known edge cases",
      "anchor": "edge-tests",
      "code": "def safe_max(numbers):\n    return max(numbers) if numbers else None\n\nfor items, expected in [([], None), ([3], 3), ([-5, -1], -1)]:\n    assert safe_max(items) == expected\nprint('3 cases passed')",
      "output": "3 cases passed",
      "explanation": "Run the same logic over multiple cases: empty, singleton, and negative-only. Keep these checks as regression tests."
    }
  ],
  "20": [
    {
      "label": "Explain a brute-force Two Sum solution",
      "anchor": "tradeoff-bruteforce",
      "code": "def two_sum_slow(numbers, target):\n    for i in range(len(numbers)):\n        for j in range(i + 1, len(numbers)):\n            if numbers[i] + numbers[j] == target:\n                return i, j\n    return None\n\nprint(two_sum_slow([2, 7, 11], 9))",
      "output": "(0, 1)",
      "explanation": "Two nested loops check all distinct pairs: O(n²) time and O(1) extra space. This is simple but slow for large inputs."
    },
    {
      "label": "Explain the optimized dictionary solution",
      "anchor": "tradeoff-hashmap",
      "code": "def two_sum_fast(numbers, target):\n    seen = {}\n    for i, number in enumerate(numbers):\n        needed = target - number\n        if needed in seen:\n            return seen[needed], i\n        seen[number] = i\n    return None\n\nprint(two_sum_fast([2, 7, 11], 9))",
      "output": "(0, 1)",
      "explanation": "A dictionary replaces repeated pair checks with average constant-time lookups: O(n) time, but O(n) additional memory. Explain this time–space tradeoff in an interview."
    },
    {
      "label": "Communicate assumptions and edge cases through code",
      "anchor": "explain-assumptions",
      "code": "def find_index(values, target):\n    for index, value in enumerate(values):\n        if value == target:\n            return index\n    return -1\n\nprint(find_index([], 5))\nprint(find_index([4, 5, 5], 5))",
      "output": "-1\n1",
      "explanation": "This function returns the FIRST matching index and -1 if missing. State those assumptions clearly before coding. Time O(n), extra space O(1)."
    }
  ]
};
