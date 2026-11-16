> Depth **L3** · about 15 minutes of study  
> Needs first: NumPy for images and embeddings: HWC/CHW/NCHW, RGB vs BGR, uint8, L2 norm, cosine (RM-SH10)

## UNDERSTAND

An **embedding** is a list of numbers (a vector) that a model produces for an image so that similar images get similar vectors. **L2 normalization** rescales a vector to length 1. After that, comparing two embeddings is a plain dot product, which equals their **cosine similarity**. Verification systems compare embeddings, so this step must be exact.

## MECHANISM

**Input:** embedding vectors from a model (for example 256 numbers each).

**Processing:** length = square root of the sum of squares. Divide the vector by its length. Check: the new length is 1. Cosine of two raw vectors = dot product divided by the product of their lengths, which equals the dot of the two unit vectors.

**Output:** unit vectors whose dot products are cosine similarities in the range -1 to 1.

## WORKED EXAMPLE

L2-normalize 3 random 8-dimensional vectors (fixed seed). After normalization the dot product equals cosine similarity.

```python
import numpy as np

rng = np.random.default_rng(0)
e = rng.normal(size=(3, 8))                      # three embeddings
norm = np.linalg.norm(e, axis=1, keepdims=True)
u = e / norm                                     # unit-length versions

print("norms before:", norm.ravel().round(2))
print("norms after: ", np.linalg.norm(u, axis=1).round(6))

cos = (e[0] @ e[1]) / (norm[0, 0] * norm[1, 0])  # cosine from the raw vectors
print("cosine from raw vectors:     ", round(float(cos), 4))
print("dot product of unit vectors: ", round(float(u[0] @ u[1]), 4))
print("equal:", bool(np.isclose(cos, u[0] @ u[1])))
```

Output:

```text
norms before: [1.86 3.17 2.03]
norms after:  [1. 1. 1.]
cosine from raw vectors:      -0.2489
dot product of unit vectors:  -0.2489
equal: True
```

**What to notice:** Three random 8-number vectors have lengths 1.86, 3.17 and 2.03. After normalization all lengths are 1. The cosine computed from the raw vectors (-0.2489) equals the dot product of the unit vectors.

**Link to the dorsal-hand project (documented facts only):** Audit file 04 describes the verification path as aligned hand ROI, then a normalized embedding, then a pairwise similarity. It also records that the October source-trained control has a 256-dimensional embedding by constructor default, not the older README's 512. Always quote the dimension with its source.

## COMMON MISTAKES

- Comparing raw embeddings with a dot product. Longer vectors then score higher for no good reason.
- Forgetting a tiny epsilon when dividing, so an all-zero vector gives NaN.
- Normalizing along the wrong axis (normalize each row/vector, not each column).
- Normalizing the query but not the gallery (or the other way round).

## INTERVIEW CHECK

**Question:** Why L2-normalize embeddings before comparing them?

**Short answer:** Normalization removes vector length, so the comparison depends only on direction; then the dot product is the cosine similarity and scores stay between -1 and 1.

**Independent exercise** (do it from a blank file, with no copying): Normalize 6 random 8-D vectors (seed); assert norms are 1; show cosine = dot product after normalization and not before.

**You are done when:** Norm asserts pass; dot==cosine shown; dimensions quoted with their source.
