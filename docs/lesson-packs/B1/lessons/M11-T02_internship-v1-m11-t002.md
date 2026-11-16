> Depth **L3** · about 15 minutes of study  
> Needs first: lesson 11.01 (Embedding vector and L2 normalization)

## UNDERSTAND

Verification is judged on **pairs** of samples. A **genuine** pair comes from the same identity; an **impostor** pair comes from different identities. All error rates are counted over these pairs, so you must know exactly how many pairs of each kind you have and how they were built.

## MECHANISM

**Input:** a list of samples, each labelled with an identity.

**Processing:** for n samples there are n(n-1)/2 unordered pairs. Label a pair genuine if both samples share an identity, impostor otherwise. With 4 identities of 3 samples each: genuine = 4 x C(3,2) = 12, total = C(12,2) = 66, impostor = 66 - 12 = 54.

**Output:** two lists of pairs; later each pair gets a similarity score.

## WORKED EXAMPLE

4 fabricated identities with 3 samples each. Count every pair of samples and label it genuine or impostor.

```python
from itertools import combinations

samples = [(person, shot) for person in "ABCD" for shot in (1, 2, 3)]   # 12 samples
pairs = list(combinations(samples, 2))                                  # unordered pairs
genuine = [p for p in pairs if p[0][0] == p[1][0]]
impostor = [p for p in pairs if p[0][0] != p[1][0]]

print("samples:", len(samples))
print("all pairs n(n-1)/2 =", len(pairs))
print("genuine pairs :", len(genuine))
print("impostor pairs:", len(impostor))
print("one genuine pair:", genuine[0], "| one impostor pair:", impostor[0])
```

Output:

```text
samples: 12
all pairs n(n-1)/2 = 66
genuine pairs : 12
impostor pairs: 54
one genuine pair: (('A', 1), ('A', 2)) | one impostor pair: (('A', 1), ('B', 1))
```

**What to notice:** 12 samples give 66 pairs: 12 genuine and 54 impostor. Impostor pairs outnumber genuine ones 4.5 to 1, and the imbalance grows quickly with more identities.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 explains that a left and a right hand can have distinct biometric identities while still being grouped by person for data splits, and that all-pairs and directed enrollment/probe pairs are different constructions. The Learning OS topic mentions specific people and hand-identity counts; those numbers are **not confirmed** in the audit, so do not quote them without the professor-approved manifest.

## COMMON MISTAKES

- Counting a pair twice ((A,B) and (B,A)). Decide between unordered pairs and directed enrollment/probe pairs.
- Pairing a sample with itself (a perfect score that means nothing).
- Forgetting that, for hands, left and right of one person are different identities but must still be grouped by person when splitting data.
- Quoting an error rate without saying how many pairs it came from.

## INTERVIEW CHECK

**Question:** How many genuine and impostor pairs from 4 identities with 3 samples each?

**Short answer:** Four identities x 3 samples: 12 genuine pairs (4 x 3) and 54 impostor pairs, 66 in total.

**Independent exercise** (do it from a blank file, with no copying): From 4 fabricated identities x 3 samples generate genuine and impostor pair lists; assert counts (12 samples: 66 pairs, 12 genuine, 54 impostor).

**You are done when:** Counts 12 genuine, 54 impostor derived by formula and by code.
