import type { PythonCodeExample } from './python-roadmap-code-a';
export const pythonInterviewExamplesA: Record<string,PythonCodeExample[]>={
  "10": [
    {
      "label": "Fixed-size sliding window sum",
      "anchor": "fixed-window",
      "code": "numbers = [2, 1, 5, 1, 3, 2]\nk = 3\nwindow = sum(numbers[:k])\nbest = window\nfor right in range(k, len(numbers)):\n    window += numbers[right] - numbers[right - k]\n    best = max(best, window)\nprint(best)",
      "output": "9",
      "explanation": "The window slides one step: add the new rightmost value and subtract the leftmost outgoing value. O(n) after the initial sum."
    },
    {
      "label": "Longest substring without repeated characters",
      "anchor": "distinct-window",
      "code": "text = 'abcabcbb'\nlast_seen = {}\nleft = 0\nbest = 0\nfor right, char in enumerate(text):\n    if char in last_seen and last_seen[char] >= left:\n        left = last_seen[char] + 1\n    last_seen[char] = right\n    best = max(best, right - left + 1)\nprint(best)",
      "output": "3",
      "explanation": "Move left forward past the previous occurrence when a character repeats inside the current window. The longest unique-character substring has length 3."
    },
    {
      "label": "Minimum-length window meeting a positive target",
      "anchor": "variable-window",
      "code": "numbers = [2, 3, 1, 2, 4, 3]\ntarget = 7\nleft = 0\ncurrent = 0\nbest = float('inf')\nfor right, value in enumerate(numbers):\n    current += value\n    while current >= target:\n        best = min(best, right - left + 1)\n        current -= numbers[left]\n        left += 1\nprint(best if best != float('inf') else 0)",
      "output": "2",
      "explanation": "For POSITIVE numbers, expanding adds values and shrinking removes from the left while the target is met. The shortest valid window is [4,3]."
    }
  ],
  "01": [
    {
      "label": "O(1) — constant time",
      "anchor": "constant-time",
      "code": "scores = [80, 95, 70]\nprint(scores[1])\nprint(len(scores))",
      "output": "95\n3",
      "explanation": "Reading one known list position or its length takes constant time: O(1). A larger list does not require visiting more elements for these operations."
    },
    {
      "label": "O(n) — one loop",
      "anchor": "linear-time",
      "code": "numbers = [2, 4, 6, 8]\ntotal = 0\nfor number in numbers:\n    total += number\nprint(total)",
      "output": "20",
      "explanation": "The loop processes every number once. With n numbers, the number of steps grows approximately with n: O(n)."
    },
    {
      "label": "O(n²) — nested loops",
      "anchor": "quadratic-time",
      "code": "numbers = [1, 2, 3]\ncount = 0\nfor a in numbers:\n    for b in numbers:\n        count += 1\nprint(count)",
      "output": "9",
      "explanation": "Each of the n outer iterations repeats n inner iterations: n × n = n² work. A list twice as large makes about four times as many pairs."
    },
    {
      "label": "O(n log n) — sorting",
      "anchor": "sorting-complexity",
      "code": "numbers = [9, 2, 7, 1]\nprint(sorted(numbers))\nprint(numbers)",
      "output": "[1, 2, 7, 9]\n[9, 2, 7, 1]",
      "explanation": "Python's sorted() is O(n log n) in the general worst case and returns a new list. Time complexity describes how work scales, not literal seconds."
    },
    {
      "label": "Space complexity — extra storage",
      "anchor": "space-complexity",
      "code": "numbers = [1, 2, 3]\ntotal = sum(numbers)\ncopy_numbers = numbers[:]\nprint(total)\nprint(copy_numbers)",
      "output": "6\n[1, 2, 3]",
      "explanation": "total stores one number: O(1) extra space. Copying all n elements into a new list takes O(n) extra space."
    }
  ],
  "02": [
    {
      "label": "Find minimum and maximum",
      "anchor": "min-max",
      "code": "numbers = [8, 3, 11, 5]\nprint(min(numbers))\nprint(max(numbers))",
      "output": "3\n11",
      "explanation": "min() and max() inspect the elements to find the smallest and largest. Each takes O(n) time on an ordinary list."
    },
    {
      "label": "Find the second distinct largest",
      "anchor": "second-largest",
      "code": "numbers = [4, 9, 9, 7, 2]\nunique = sorted(set(numbers))\nprint(unique[-2] if len(unique) >= 2 else None)",
      "output": "7",
      "explanation": "Set removes duplicates; sorting orders unique numbers. The second-to-last value is the second DISTINCT largest. Check that at least two distinct numbers exist."
    },
    {
      "label": "Top-k largest elements",
      "anchor": "top-k",
      "code": "import heapq\nnumbers = [8, 3, 11, 5, 9]\nprint(heapq.nlargest(3, numbers))",
      "output": "[11, 9, 8]",
      "explanation": "nlargest(k, values) finds the k largest values. It is useful when k is much smaller than n; heap-based behavior is often O(n log k)."
    }
  ],
  "03": [
    {
      "label": "Reverse a string with slicing",
      "anchor": "reverse-string",
      "code": "word = 'python'\nprint(word[::-1])\nprint(word)",
      "output": "nohtyp\npython",
      "explanation": "[::-1] reads characters backward and returns a NEW string. Strings cannot be changed in place."
    },
    {
      "label": "Reverse a list without changing it",
      "anchor": "reverse-list-copy",
      "code": "values = [1, 2, 3]\nbackward = values[::-1]\nprint(backward)\nprint(values)",
      "output": "[3, 2, 1]\n[1, 2, 3]",
      "explanation": "Slicing makes a new reversed outer list, using O(n) additional space. The original list remains unchanged."
    },
    {
      "label": "Reverse a list in place",
      "anchor": "reverse-in-place",
      "code": "values = [1, 2, 3]\nvalues.reverse()\nprint(values)",
      "output": "[3, 2, 1]",
      "explanation": "reverse() changes the SAME list instead of returning a new one. It takes O(n) time but O(1) extra space."
    }
  ],
  "04": [
    {
      "label": "Count frequencies using a dictionary",
      "anchor": "frequency-dict",
      "code": "letters = ['a', 'b', 'a', 'c', 'a']\ncounts = {}\nfor letter in letters:\n    counts[letter] = counts.get(letter, 0) + 1\nprint(counts)",
      "output": "{'a': 3, 'b': 1, 'c': 1}",
      "explanation": "Every key stores one frequency. Dictionary lookups are average O(1), so counting n items is typically O(n)."
    },
    {
      "label": "Count frequencies using Counter",
      "anchor": "frequency-counter",
      "code": "from collections import Counter\ncounts = Counter('banana')\nprint(counts['a'])\nprint(counts['n'])\nprint(counts['z'])",
      "output": "3\n2\n0",
      "explanation": "Counter is a dictionary designed for counting. Missing keys return zero rather than raising a KeyError."
    },
    {
      "label": "Most frequent items and ties",
      "anchor": "most-common",
      "code": "from collections import Counter\ncounts = Counter(['L', 'R', 'L', 'R', 'L'])\nprint(counts.most_common(2))",
      "output": "[('L', 3), ('R', 2)]",
      "explanation": "most_common(k) returns the highest-frequency items. For equal counts, Counter retains first-encountered order in modern Python."
    }
  ],
  "05": [
    {
      "label": "Two Sum with a dictionary",
      "anchor": "two-sum",
      "code": "def two_sum(nums, target):\n    seen = {}\n    for i, number in enumerate(nums):\n        needed = target - number\n        if needed in seen:\n            return [seen[needed], i]\n        seen[number] = i\n    return None\n\nprint(two_sum([2, 7, 11, 15], 9))",
      "output": "[0, 1]",
      "explanation": "For each number, ask whether target - number appeared EARLIER. If yes, return both indices. One pass gives average O(n) time and O(n) extra space."
    },
    {
      "label": "Two Sum with duplicate numbers",
      "anchor": "two-sum-duplicates",
      "code": "def two_sum(nums, target):\n    seen = {}\n    for i, number in enumerate(nums):\n        if target - number in seen:\n            return [seen[target - number], i]\n        seen[number] = i\n    return None\n\nprint(two_sum([3, 3], 6))",
      "output": "[0, 1]",
      "explanation": "The lookup happens BEFORE storing the current index. That prevents using the same element twice, while allowing two different copies of 3."
    },
    {
      "label": "Two Sum when no pair exists",
      "anchor": "two-sum-none",
      "code": "def two_sum(nums, target):\n    seen = {}\n    for i, number in enumerate(nums):\n        if target - number in seen:\n            return [seen[target - number], i]\n        seen[number] = i\n    return None\n\nprint(two_sum([1, 2, 4], 10))",
      "output": "None",
      "explanation": "After scanning the entire list without a valid pair, return None instead of inventing an index or crashing."
    }
  ],
  "06": [
    {
      "label": "Remove duplicates but keep first appearance",
      "anchor": "unique-order",
      "code": "values = ['B', 'A', 'B', 'C', 'A']\nunique = list(dict.fromkeys(values))\nprint(unique)",
      "output": "['B', 'A', 'C']",
      "explanation": "Dictionary keys are unique and preserve insertion order in modern Python. This keeps the first occurrence of each hashable value."
    },
    {
      "label": "Manual order-preserving deduplication",
      "anchor": "unique-loop",
      "code": "values = [3, 1, 3, 2, 1]\nseen = set()\nresult = []\nfor value in values:\n    if value not in seen:\n        seen.add(value)\n        result.append(value)\nprint(result)",
      "output": "[3, 1, 2]",
      "explanation": "A set detects repeats and a list preserves first-seen order. Average O(n) time; it uses extra O(n) space."
    },
    {
      "label": "Deduplicate while ignoring capitalization",
      "anchor": "unique-normalized",
      "code": "names = ['manu', 'Manu', 'ANU', 'anu']\nseen = set()\nresult = []\nfor name in names:\n    key = name.lower()\n    if key not in seen:\n        seen.add(key)\n        result.append(name)\nprint(result)",
      "output": "['manu', 'ANU']",
      "explanation": "Create a normalized key for equality, but keep the original spelling of the first occurrence."
    }
  ],
  "07": [
    {
      "label": "Palindrome with two pointers",
      "anchor": "palindrome",
      "code": "def is_palindrome(text):\n    left, right = 0, len(text) - 1\n    while left < right:\n        if text[left] != text[right]:\n            return False\n        left += 1\n        right -= 1\n    return True\n\nprint(is_palindrome('level'))\nprint(is_palindrome('python'))",
      "output": "True\nFalse",
      "explanation": "Compare the first and last characters, move inward, and stop at a mismatch. O(n) time and O(1) extra space."
    },
    {
      "label": "Ignore case and punctuation in palindrome checks",
      "anchor": "palindrome-normalized",
      "code": "text = 'Never odd or even!'\nclean = ''.join(c.lower() for c in text if c.isalnum())\nprint(clean)\nprint(clean == clean[::-1])",
      "output": "neveroddoreven\nTrue",
      "explanation": "First remove spaces and punctuation and lowercase the text. Then compare it against a reversed copy."
    },
    {
      "label": "Anagrams with Counter",
      "anchor": "anagram",
      "code": "from collections import Counter\n\ndef are_anagrams(a, b):\n    return Counter(a) == Counter(b)\n\nprint(are_anagrams('listen', 'silent'))\nprint(are_anagrams('cat', 'car'))",
      "output": "True\nFalse",
      "explanation": "Two words are anagrams when every character appears the same number of times in both. Counting is O(n + m)."
    }
  ],
  "08": [
    {
      "label": "Running total with a loop",
      "anchor": "running-total",
      "code": "numbers = [2, 3, 5]\ntotal = 0\nfor value in numbers:\n    total += value\n    print(total)",
      "output": "2\n5\n10",
      "explanation": "total stores the sum of all values seen so far. It updates once per item, so this takes O(n) time."
    },
    {
      "label": "Build prefix sums",
      "anchor": "prefix-sums",
      "code": "numbers = [2, 3, 5, 7]\nprefix = [0]\nfor value in numbers:\n    prefix.append(prefix[-1] + value)\nprint(prefix)",
      "output": "[0, 2, 5, 10, 17]",
      "explanation": "prefix[i] holds the sum of the first i elements. The leading 0 lets you handle a range beginning at index 0."
    },
    {
      "label": "Range sum in O(1) after preprocessing",
      "anchor": "range-sum",
      "code": "numbers = [2, 3, 5, 7]\nprefix = [0]\nfor value in numbers:\n    prefix.append(prefix[-1] + value)\nleft, right = 1, 3\nprint(prefix[right + 1] - prefix[left])",
      "output": "15",
      "explanation": "To add elements from index left through right (inclusive), subtract two prefix sums. Here 3 + 5 + 7 = 15."
    }
  ],
  "09": [
    {
      "label": "Two pointers from both ends",
      "anchor": "two-pointers",
      "code": "numbers = [1, 2, 4, 6, 9]\ntarget = 10\nleft, right = 0, len(numbers) - 1\nwhile left < right:\n    total = numbers[left] + numbers[right]\n    if total == target:\n        print(numbers[left], numbers[right])\n        break\n    elif total < target:\n        left += 1\n    else:\n        right -= 1",
      "output": "1 9",
      "explanation": "For SORTED data, a sum too small means moving the left pointer right; too large means moving the right pointer left. O(n) time."
    },
    {
      "label": "Move nonzero numbers in place",
      "anchor": "two-pointer-compaction",
      "code": "numbers = [0, 3, 0, 2, 5]\nwrite = 0\nfor read in range(len(numbers)):\n    if numbers[read] != 0:\n        numbers[write] = numbers[read]\n        write += 1\nfor i in range(write, len(numbers)):\n    numbers[i] = 0\nprint(numbers)",
      "output": "[3, 2, 5, 0, 0]",
      "explanation": "read scans items; write tracks the next nonzero position. This modifies the list in O(n) time with O(1) extra space."
    },
    {
      "label": "Check a sorted array for duplicates",
      "anchor": "two-pointer-duplicates",
      "code": "numbers = [1, 1, 2, 3, 3]\nunique = [numbers[0]] if numbers else []\nfor number in numbers[1:]:\n    if number != unique[-1]:\n        unique.append(number)\nprint(unique)",
      "output": "[1, 2, 3]",
      "explanation": "Equal values appear together in sorted input. Comparing against the last unique value avoids storing duplicates."
    }
  ]
};
