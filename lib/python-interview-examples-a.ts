import type { PythonCodeExample } from './python-roadmap-code-a';
export const pythonInterviewExamplesA: Record<string,PythonCodeExample[]>={
  "10": [
    {
      "label": "Fixed-size sliding window sum",
      "anchor": "fixed-window",
      "code": "numbers = [2, 1, 5, 1, 3, 2]\nsize = 3\nwindow_sum = sum(numbers[:size])\nbest = window_sum\nfor right in range(size, len(numbers)):\n    entering = numbers[right]\n    leaving = numbers[right - size]\n    window_sum = window_sum + entering - leaving\n    if window_sum > best:\n        best = window_sum\nprint(best)",
      "output": "9",
      "explanation": "First add the first 3 numbers: 2 + 1 + 5 = 8.\nMove the window: add the NEW number and subtract the number that leaves.\nRemember the largest total seen. Here it is 9."
    },
    {
      "label": "Longest substring without repeated characters",
      "anchor": "distinct-window",
      "code": "text = 'abcabcbb'\nlast_seen = {}\nleft = 0\nbest = 0\nfor right in range(len(text)):\n    letter = text[right]\n    if letter in last_seen:\n        if last_seen[letter] >= left:\n            left = last_seen[letter] + 1\n    last_seen[letter] = right\n    length = right - left + 1\n    if length > best:\n        best = length\nprint(best)",
      "output": "3",
      "explanation": "left and right mark a piece of text with no repeated letters.\nWhen a letter repeats inside that piece, move left past the previous copy.\nStore the longest length reached. For abcabcbb, the longest is 3."
    },
    {
      "label": "Minimum-length window meeting a positive target",
      "anchor": "variable-window",
      "code": "numbers = [2, 3, 1, 2, 4, 3]\ntarget = 7\nleft = 0\ncurrent_sum = 0\nbest = len(numbers) + 1\nfor right in range(len(numbers)):\n    current_sum = current_sum + numbers[right]\n    while current_sum >= target:\n        length = right - left + 1\n        if length < best:\n            best = length\n        current_sum = current_sum - numbers[left]\n        left = left + 1\nif best > len(numbers):\n    print(0)\nelse:\n    print(best)",
      "output": "2",
      "explanation": "This method assumes POSITIVE numbers. Add new numbers on the right until the sum reaches 7.\nWhile the sum is large enough, record the window length and remove leftmost numbers.\nThe shortest window is [4, 3], so print 2."
    }
  ],
  "01": [
    {
      "label": "O(1) — constant time",
      "anchor": "constant-time",
      "code": "scores = [80, 95, 70]\nprint(scores[1])\nprint(len(scores))",
      "output": "95\n3",
      "explanation": "numbers is a list of 3 values.\nnumbers[1] reads the SECOND value. Python starts counting at index 0.\nlen(numbers) returns how many items are in the list. Neither operation needs a loop."
    },
    {
      "label": "O(n) — one loop",
      "anchor": "linear-time",
      "code": "numbers = [2, 4, 6, 8]\ntotal = 0\nfor number in numbers:\n    total = total + number\nprint(total)",
      "output": "20",
      "explanation": "Start total at 0.\nTake one number at a time and add it to total.\nFour numbers need four additions. For n numbers, the work grows as O(n)."
    },
    {
      "label": "O(n²) — nested loops",
      "anchor": "quadratic-time",
      "code": "numbers = [1, 2, 3]\ncount = 0\nfor first in numbers:\n    for second in numbers:\n        count = count + 1\nprint(count)",
      "output": "9",
      "explanation": "The outside loop runs 3 times.\nFor EACH outside turn, the inside loop also runs 3 times.\nThat means 3 × 3 = 9 pairs. For n items this grows as O(n²)."
    },
    {
      "label": "O(n log n) — sorting",
      "anchor": "sorting-complexity",
      "code": "numbers = [9, 2, 7, 1]\nordered = sorted(numbers)\nprint(ordered)\nprint(numbers)",
      "output": "[1, 2, 7, 9]\n[9, 2, 7, 1]",
      "explanation": "sorted(numbers) makes a new list in increasing order.\nThe original numbers list remains unchanged.\nSorting generally needs O(n log n) comparisons/work, not just one pass."
    },
    {
      "label": "Space complexity — extra storage",
      "anchor": "space-complexity",
      "code": "numbers = [1, 2, 3]\ntotal = sum(numbers)\ncopy_numbers = numbers.copy()\nprint(total)\nprint(copy_numbers)",
      "output": "6\n[1, 2, 3]",
      "explanation": "total is one number, so it needs O(1) extra space.\ncopy() creates a new list containing all 3 numbers.\nIf the list grows to n items, the extra copy needs O(n) space."
    }
  ],
  "02": [
    {
      "label": "Find minimum and maximum",
      "anchor": "min-max",
      "code": "numbers = [8, 3, 11, 5]\nsmallest = min(numbers)\nlargest = max(numbers)\nprint(smallest)\nprint(largest)",
      "output": "3\n11",
      "explanation": "min checks the list for the lowest value.\nmax checks it for the highest value.\nFor n items, each scan takes O(n) time."
    },
    {
      "label": "Find the second distinct largest",
      "anchor": "second-largest",
      "code": "numbers = [4, 9, 9, 7, 2]\nunique = set(numbers)\nordered = sorted(unique)\nif len(ordered) >= 2:\n    print(ordered[-2])\nelse:\n    print(None)",
      "output": "7",
      "explanation": "set removes repeated values, so 9 is counted only once.\nsorted puts the different values in order.\nordered[-2] reads the second largest DISTINCT number. If there are fewer than 2, print None."
    },
    {
      "label": "Top-k largest elements",
      "anchor": "top-k",
      "code": "numbers = [8, 3, 11, 5, 9]\nordered = sorted(numbers, reverse=True)\ntop_three = ordered[:3]\nprint(top_three)",
      "output": "[11, 9, 8]",
      "explanation": "Sort from biggest to smallest using reverse=True.\n[:3] takes the first three values.\nThis beginner-friendly method sorts everything. Later you can learn heapq for larger lists and small k."
    }
  ],
  "03": [
    {
      "label": "Reverse a string with slicing",
      "anchor": "reverse-string",
      "code": "word = 'python'\nbackward = word[::-1]\nprint(backward)\nprint(word)",
      "output": "nohtyp\npython",
      "explanation": "[::-1] means read characters from right to left.\nThe reversed characters are stored in backward.\nThe original word does not change because strings are immutable."
    },
    {
      "label": "Reverse a list without changing it",
      "anchor": "reverse-list-copy",
      "code": "values = [1, 2, 3]\nbackward = values[::-1]\nprint(backward)\nprint(values)",
      "output": "[3, 2, 1]\n[1, 2, 3]",
      "explanation": "[::-1] reads the list backwards.\nbackward is a NEW list containing [3, 2, 1].\nvalues is still [1, 2, 3]. This uses extra memory for the copy."
    },
    {
      "label": "Reverse a list in place",
      "anchor": "reverse-in-place",
      "code": "values = [1, 2, 3]\nvalues.reverse()\nprint(values)",
      "output": "[3, 2, 1]",
      "explanation": "reverse() changes the original list directly.\nThe last item becomes first and the first becomes last.\nIt does not create or return a new reversed list."
    }
  ],
  "04": [
    {
      "label": "Count frequencies using a dictionary",
      "anchor": "frequency-dict",
      "code": "letters = ['a', 'b', 'a', 'c', 'a']\ncounts = {}\nfor letter in letters:\n    if letter not in counts:\n        counts[letter] = 0\n    counts[letter] = counts[letter] + 1\nprint(counts)",
      "output": "{'a': 3, 'b': 1, 'c': 1}",
      "explanation": "Start with an empty dictionary counts.\nFor a new letter, first save a count of 0.\nAdd 1 every time the letter appears. This gives a:3, b:1, c:1."
    },
    {
      "label": "Count frequencies using Counter",
      "anchor": "frequency-counter",
      "code": "from collections import Counter\nword = 'banana'\ncounts = Counter(word)\nprint(counts['a'])\nprint(counts['n'])\nprint(counts['z'])",
      "output": "3\n2\n0",
      "explanation": "Counter counts each character automatically.\na appears 3 times and n appears 2 times.\nA missing character such as z has count 0."
    },
    {
      "label": "Most frequent items and ties",
      "anchor": "most-common",
      "code": "from collections import Counter\nhands = ['L', 'R', 'L', 'R', 'L']\ncounts = Counter(hands)\ntop_two = counts.most_common(2)\nprint(top_two)",
      "output": "[('L', 3), ('R', 2)]",
      "explanation": "Count each hand label using Counter.\nmost_common(2) asks for the 2 most frequent labels.\nThe answer shows each label next to its frequency."
    }
  ],
  "05": [
    {
      "label": "Two Sum with a dictionary",
      "anchor": "two-sum",
      "code": "def two_sum(numbers, target):\n    seen = {}\n    for index in range(len(numbers)):\n        number = numbers[index]\n        needed = target - number\n        if needed in seen:\n            return [seen[needed], index]\n        seen[number] = index\n    return None\n\nprint(two_sum([2, 7, 11, 15], 9))",
      "output": "[0, 1]",
      "explanation": "The target is 9. At number 2, the missing partner is 7.\nSave previous values in seen. When 7 arrives, Python finds its partner 2.\nReturn the TWO different positions [0, 1]. Average O(n) time; O(n) extra memory."
    },
    {
      "label": "Two Sum with duplicate numbers",
      "anchor": "two-sum-duplicates",
      "code": "def two_sum(numbers, target):\n    seen = {}\n    for index in range(len(numbers)):\n        number = numbers[index]\n        needed = target - number\n        if needed in seen:\n            return [seen[needed], index]\n        seen[number] = index\n    return None\n\nprint(two_sum([3, 3], 6))",
      "output": "[0, 1]",
      "explanation": "The first 3 is stored at position 0.\nThe second 3 needs another 3, which is already saved.\nBecause lookup happens before saving the current element, the answer uses TWO separate positions."
    },
    {
      "label": "Two Sum when no pair exists",
      "anchor": "two-sum-none",
      "code": "def two_sum(numbers, target):\n    seen = {}\n    for index in range(len(numbers)):\n        number = numbers[index]\n        needed = target - number\n        if needed in seen:\n            return [seen[needed], index]\n        seen[number] = index\n    return None\n\nprint(two_sum([1, 2, 4], 10))",
      "output": "None",
      "explanation": "Scan the values and look for their missing partners.\nNo two different numbers add up to 10.\nIf the loop ends with no match, return None instead of guessing."
    }
  ],
  "06": [
    {
      "label": "Remove duplicates but keep first appearance",
      "anchor": "unique-order",
      "code": "values = ['B', 'A', 'B', 'C', 'A']\nunique = []\nfor value in values:\n    if value not in unique:\n        unique.append(value)\nprint(unique)",
      "output": "['B', 'A', 'C']",
      "explanation": "Start with an empty output list.\nRead the values left to right. Add a value ONLY if it is not already present.\nThis keeps the original order: B, A, C. Using a list can be O(n²) for large inputs."
    },
    {
      "label": "Manual order-preserving deduplication",
      "anchor": "unique-loop",
      "code": "values = [3, 1, 3, 2, 1]\nseen = set()\nresult = []\nfor value in values:\n    if value not in seen:\n        seen.add(value)\n        result.append(value)\nprint(result)",
      "output": "[3, 1, 2]",
      "explanation": "seen remembers which values we have visited.\nresult stores only the FIRST occurrence in the same order.\nA set makes membership checking fast on average, giving O(n) time."
    },
    {
      "label": "Deduplicate while ignoring capitalization",
      "anchor": "unique-normalized",
      "code": "names = ['manu', 'Manu', 'ANU', 'anu']\nseen = set()\nresult = []\nfor name in names:\n    key = name.lower()\n    if key not in seen:\n        seen.add(key)\n        result.append(name)\nprint(result)",
      "output": "['manu', 'ANU']",
      "explanation": "Convert each name to lowercase ONLY for comparison.\nThe second version of the same name is skipped.\nKeep the original spelling of the first occurrence in result."
    }
  ],
  "07": [
    {
      "label": "Palindrome with two pointers",
      "anchor": "palindrome",
      "code": "def is_palindrome(text):\n    left = 0\n    right = len(text) - 1\n    while left < right:\n        if text[left] != text[right]:\n            return False\n        left = left + 1\n        right = right - 1\n    return True\n\nprint(is_palindrome('level'))\nprint(is_palindrome('python'))",
      "output": "True\nFalse",
      "explanation": "left starts at the first letter. right starts at the last letter.\nCompare both letters, then move toward the middle.\nA mismatch means False. If every pair matches, return True."
    },
    {
      "label": "Ignore case and punctuation in palindrome checks",
      "anchor": "palindrome-normalized",
      "code": "text = 'Never odd or even!'\nclean = ''\nfor letter in text:\n    if letter.isalnum():\n        clean = clean + letter.lower()\nprint(clean)\nprint(clean == clean[::-1])",
      "output": "neveroddoreven\nTrue",
      "explanation": "Keep only letters and digits; remove spaces and punctuation.\nConvert each kept character to lowercase.\nCompare the cleaned text with its reverse. They match, so it is a palindrome."
    },
    {
      "label": "Anagrams with Counter",
      "anchor": "anagram",
      "code": "from collections import Counter\nfirst = 'listen'\nsecond = 'silent'\nfirst_counts = Counter(first)\nsecond_counts = Counter(second)\nprint(first_counts == second_counts)\nprint(Counter('cat') == Counter('car'))",
      "output": "True\nFalse",
      "explanation": "Count how often each letter appears in the first and second words.\nThe first two words contain the same letters and counts, so True.\ncat and car differ in one letter, so False."
    }
  ],
  "08": [
    {
      "label": "Running total with a loop",
      "anchor": "running-total",
      "code": "numbers = [2, 3, 5]\ntotal = 0\nfor number in numbers:\n    total = total + number\n    print(total)",
      "output": "2\n5\n10",
      "explanation": "Start total at zero.\nAdd the next number to the previous total.\nThe running sums become 2, then 5, then 10."
    },
    {
      "label": "Build prefix sums",
      "anchor": "prefix-sums",
      "code": "numbers = [2, 3, 5, 7]\nprefix = [0]\nfor number in numbers:\n    next_total = prefix[-1] + number\n    prefix.append(next_total)\nprint(prefix)",
      "output": "[0, 2, 5, 10, 17]",
      "explanation": "Start with 0: the sum of zero numbers.\nAdd each next number to the previous sum.\nThe prefix list stores 0, then 2, 5, 10 and 17."
    },
    {
      "label": "Range sum in O(1) after preprocessing",
      "anchor": "range-sum",
      "code": "numbers = [2, 3, 5, 7]\nprefix = [0]\nfor number in numbers:\n    prefix.append(prefix[-1] + number)\nleft = 1\nright = 3\nrange_total = prefix[right + 1] - prefix[left]\nprint(range_total)",
      "output": "15",
      "explanation": "First build a list of running sums.\nTo add positions 1 through 3, subtract the sum BEFORE position 1.\nThe result is 3 + 5 + 7 = 15. After setup, each range sum is O(1)."
    }
  ],
  "09": [
    {
      "label": "Two pointers from both ends",
      "anchor": "two-pointers",
      "code": "numbers = [1, 2, 4, 6, 9]\ntarget = 10\nleft = 0\nright = len(numbers) - 1\nwhile left < right:\n    total = numbers[left] + numbers[right]\n    if total == target:\n        print(numbers[left], numbers[right])\n        break\n    if total < target:\n        left = left + 1\n    else:\n        right = right - 1",
      "output": "1 9",
      "explanation": "Because the list is sorted, start at both ends.\nIf the sum is too small, move left rightward. If too large, move right leftward.\nStop when the sum equals the target. This needs one pass, O(n)."
    },
    {
      "label": "Move nonzero numbers in place",
      "anchor": "two-pointer-compaction",
      "code": "numbers = [0, 3, 0, 2, 5]\nwrite = 0\nfor read in range(len(numbers)):\n    if numbers[read] != 0:\n        numbers[write] = numbers[read]\n        write = write + 1\nfor index in range(write, len(numbers)):\n    numbers[index] = 0\nprint(numbers)",
      "output": "[3, 2, 5, 0, 0]",
      "explanation": "read visits every element. write tells where to save the next nonzero number.\nKeep the nonzero numbers in their original order.\nFill the remaining positions with zeros. The same list is updated."
    },
    {
      "label": "Check a sorted array for duplicates",
      "anchor": "two-pointer-duplicates",
      "code": "numbers = [1, 1, 2, 3, 3]\nunique = []\nfor number in numbers:\n    if not unique or number != unique[-1]:\n        unique.append(number)\nprint(unique)",
      "output": "[1, 2, 3]",
      "explanation": "The input is sorted, so repeated values are next to each other.\nCompare the current number with the LAST unique number.\nOnly append when it is different. The answer is 1, 2, 3."
    }
  ]
};
