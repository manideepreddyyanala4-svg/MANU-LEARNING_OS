"""Lesson text for Module 11 (B1): verification metrics. All numbers are from synthetic toy scores, never from the dorsal-hand research.
Dorsal links use only facts documented in the internship audit file 04."""
L = {
"M11-T01": dict(
 understand="An **embedding** is a list of numbers (a vector) that a model produces for an image so that similar images get similar vectors. **L2 normalization** rescales a vector to length 1. After that, comparing two embeddings is a plain dot product, which equals their **cosine similarity**. Verification systems compare embeddings, so this step must be exact.",
 mechanism="**Input:** embedding vectors from a model (for example 256 numbers each).\n**Processing:** length = square root of the sum of squares. Divide the vector by its length. Check: the new length is 1. Cosine of two raw vectors = dot product divided by the product of their lengths, which equals the dot of the two unit vectors.\n**Output:** unit vectors whose dot products are cosine similarities in the range -1 to 1.",
 notice={"a": "Three random 8-number vectors have lengths 1.86, 3.17 and 2.03. After normalization all lengths are 1. The cosine computed from the raw vectors (-0.2489) equals the dot product of the unit vectors."},
 expect={"a": ["norms before: [1.86 3.17 2.03]", "norms after:  [1. 1. 1.]", "cosine from raw vectors:      -0.2489", "dot product of unit vectors:  -0.2489", "equal: True"]},
 mistakes=["Comparing raw embeddings with a dot product. Longer vectors then score higher for no good reason.", "Forgetting a tiny epsilon when dividing, so an all-zero vector gives NaN.", "Normalizing along the wrong axis (normalize each row/vector, not each column).", "Normalizing the query but not the gallery (or the other way round)."],
 answer="Normalization removes vector length, so the comparison depends only on direction; then the dot product is the cosine similarity and scores stay between -1 and 1.",
 dorsal="Audit file 04 describes the verification path as aligned hand ROI, then a normalized embedding, then a pairwise similarity. It also records that the October source-trained control has a 256-dimensional embedding by constructor default, not the older README's 512. Always quote the dimension with its source."),

"M11-T02": dict(
 understand="Verification is judged on **pairs** of samples. A **genuine** pair comes from the same identity; an **impostor** pair comes from different identities. All error rates are counted over these pairs, so you must know exactly how many pairs of each kind you have and how they were built.",
 mechanism="**Input:** a list of samples, each labelled with an identity.\n**Processing:** for n samples there are n(n-1)/2 unordered pairs. Label a pair genuine if both samples share an identity, impostor otherwise. With 4 identities of 3 samples each: genuine = 4 x C(3,2) = 12, total = C(12,2) = 66, impostor = 66 - 12 = 54.\n**Output:** two lists of pairs; later each pair gets a similarity score.",
 notice={"a": "12 samples give 66 pairs: 12 genuine and 54 impostor. Impostor pairs outnumber genuine ones 4.5 to 1, and the imbalance grows quickly with more identities."},
 expect={"a": ["all pairs n(n-1)/2 = 66", "genuine pairs : 12", "impostor pairs: 54"]},
 mistakes=["Counting a pair twice ((A,B) and (B,A)). Decide between unordered pairs and directed enrollment/probe pairs.", "Pairing a sample with itself (a perfect score that means nothing).", "Forgetting that, for hands, left and right of one person are different identities but must still be grouped by person when splitting data.", "Quoting an error rate without saying how many pairs it came from."],
 answer="Four identities x 3 samples: 12 genuine pairs (4 x 3) and 54 impostor pairs, 66 in total.",
 dorsal="Audit file 04 explains that a left and a right hand can have distinct biometric identities while still being grouped by person for data splits, and that all-pairs and directed enrollment/probe pairs are different constructions. The Learning OS topic mentions specific people and hand-identity counts; those numbers are **not confirmed** in the audit, so do not quote them without the professor-approved manifest."),

"M11-T03": dict(
 understand="A **cosine score** says how similar two embeddings are on a scale of -1 to 1. It is a ranking number, not a probability and not a confidence. A score of 0.8 does **not** mean an 80% chance that two images match. What a score means depends on the population of scores it came from.",
 mechanism="**Input:** a score and the distribution of impostor scores in the situation you care about.\n**Processing:** to interpret a score, ask how often impostors reach that score (the false-accept rate there). A calibration method (for example learned from data) can map scores to probabilities, but only for the data it was fitted on.\n**Output:** an error rate attached to a threshold, in a stated situation.",
 notice={"a": "The same threshold 0.70 admits 25% of impostors in situation A but 50% in situation B, because B's impostors score higher. The number 0.70 is identical; its meaning changed."},
 expect={"a": ["situation A: 0.25", "situation B: 0.5"]},
 mistakes=["Reading 0.8 as '80% sure'.", "Reusing a threshold chosen in one setting (lab) in another (new session or new device) without rechecking error rates.", "Comparing scores from two different models directly.", "Reporting a score without the pair protocol that produced it."],
 answer="No. A cosine score ranks similarity; its error rate depends on the impostor and genuine score distributions, which change with the data.",
 dorsal="Audit file 04 states that source-calibrated thresholds must not be called target FAR guarantees, because distribution shift can change the achieved target FAR. This lesson is the toy version of that sentence."),

"M11-T04": dict(
 understand="**1:1 verification** answers: 'is this sample the identity it claims to be?' You compute a similarity score against the claimed identity and **accept if the score is at least a threshold**. Raising the threshold accepts fewer impostors but rejects more genuine users. The threshold must be chosen on development data, never on the test data you report.",
 mechanism="**Input:** genuine scores, impostor scores, a threshold t.\n**Processing:** rule: accept if score >= t. FAR = fraction of impostor scores accepted. FRR = fraction of genuine scores rejected. Sweep t over candidate values and tabulate both.\n**Output:** a table of (threshold, FAR, FRR) and a chosen operating point that meets a requirement, for example FAR <= 10%.",
 notice={"a": "As the threshold rises from 0.30 to 0.60, FAR falls from 0.60 to 0.00 and FRR rises from 0.00 to 0.30. On this toy set 0.6 is the smallest tested threshold with FAR at most 10%."},
 expect={"a": ["0.30  0.60  0.00", "0.60  0.00  0.30", "smallest threshold with FAR <= 10% on this toy set: 0.6"]},
 mistakes=["Choosing the threshold on the same test set you then report results on (leakage).", "Using > when the rule is >= (matters at ties).", "Optimizing one error without stating the other.", "Forgetting that a threshold depends on the model and the data."],
 answer="Fix the threshold on a separate development set (for example for a target FAR), then apply it unchanged to the held-out test set and report the resulting FAR and TAR.",
 dorsal="Audit file 04 describes an evaluation-only target rule: thresholds are set on development or source data, applied frozen to held-out target data, and denominators are reported. Do not tune thresholds against current target dorsal evaluation data."),

"M11-T05": dict(
 understand="The core verification metrics are rates over pairs. **FAR (false accept rate)**, also written FMR, is the fraction of *impostor* comparisons wrongly accepted. **FRR (false reject rate)**, also FNMR, is the fraction of *genuine* comparisons wrongly rejected. **TAR (true accept rate)** is the fraction of genuine comparisons accepted, so TAR = 1 - FRR. Always say what the denominator is.",
 mechanism="**Input:** genuine scores, impostor scores, a threshold.\n**Processing:** FAR = (impostors with score >= t) / (number of impostor comparisons). TAR = (genuines with score >= t) / (number of genuine comparisons). FRR = 1 - TAR.\n**Output:** three numbers, each with a stated denominator. One-to-many identification uses different rates (FPIR and TPIR) and must not be mixed with these.",
 notice={"a": "At threshold 0.50: 2 of 10 impostor comparisons are accepted, so FAR = 0.20. 9 of 10 genuine comparisons are accepted, so TAR = 0.90 and FRR = 0.10."},
 expect={"a": ["false accepts: 2 of 10 impostor comparisons -> FAR = 0.20", "true accepts:  9 of 10 genuine comparisons   -> TAR = 0.90", "FRR = 1 - TAR = 0.10"]},
 mistakes=["Dividing false accepts by the wrong total, for example by all comparisons instead of impostor comparisons.", "Quoting a rate without its denominator (2 of 10 and 200 of 1,000 are very different evidence).", "Mixing FAR with FPIR (search events).", "Confusing TAR (a rate over genuine pairs) with accuracy."],
 answer="FAR = false accepts / impostor comparisons. TAR = accepted genuine / genuine comparisons. FRR = 1 - TAR. Each must be quoted with its denominator.",
 dorsal="Audit file 04 records that one-to-many FPIR/TPIR count search events and cannot substitute for one-to-one FAR/TAR, and that evaluate_threshold reports denominators. Practise on toy scores like these, not on research data."),

"M11-T06": dict(
 understand="The **Equal Error Rate (EER)** is the point where FAR equals FRR. It is a single number that summarizes how well genuine and impostor scores separate; lower is better. It is **not** an operating point you deploy: it hides which error you can afford, and with discrete scores it has to be interpolated.",
 mechanism="**Input:** genuine and impostor scores.\n**Processing:** use every distinct score as a threshold; compute FAR and FRR at each. Find where FAR drops from above FRR to below it, and **linearly interpolate** between those two thresholds to estimate the crossing. Ties can make the empirical FAR and FRR at the returned threshold differ from the interpolated EER.\n**Output:** one EER value and the table behind it.",
 notice={"a": "FAR is above FRR up to t=0.50 (0.20 vs 0.10) and below it at t=0.55 (0.10 vs 0.20). Interpolating between those two thresholds gives an EER of 0.15, a value that no single tested threshold produces exactly."},
 expect={"a": ["t=0.50  FAR=0.20  FRR=0.10", "t=0.55  FAR=0.10  FRR=0.20", "EER by linear interpolation: 0.15"]},
 mistakes=["Reporting EER as if it were the rate you would see at a deployed threshold.", "Picking the threshold that minimizes EER on the test set.", "Forgetting that with few scores the EER is coarse; quote the pair counts.", "Mixing a legacy EER function (grid based) with an interpolated one without saying which."],
 answer="EER summarizes separation but hides the trade-off: a real system needs a specific FAR or FRR, and the EER threshold may be wrong for that.",
 dorsal="Audit file 04 notes that the metric code uses an interpolated EER that can differ from the empirical FAR/FRR at the returned threshold when scores tie, and that EER is not an application threshold chosen on target test data."),

"M11-T07": dict(
 understand="Security-minded systems usually fix an acceptable **FAR** (for example 1% or 0.1%) and then ask for the **TAR at that FAR**. The threshold is set to hit the FAR on a *development* set. When the data changes (new session, device or lighting), the achieved FAR can move even though the threshold did not. Very low FAR targets also need many impostor pairs to measure at all.",
 mechanism="**Input:** development impostor scores, genuine scores, a target FAR.\n**Processing:** threshold = the (1 - target FAR) quantile of impostor scores. TAR = fraction of genuine scores at or above it. Then apply the same threshold to a different impostor population and recompute FAR.\n**Output:** (threshold, FAR, TAR), plus the shifted FAR as a check.",
 notice={"a": "On 1,000 synthetic impostor scores the 99th percentile threshold is 0.426, giving FAR 0.01 and TAR 0.984. If the impostor scores shift up by only 0.05, the same threshold now accepts 3.7% of impostors, not 1%."},
 expect={"a": ["threshold: 0.426 | FAR: 0.01 | TAR: 0.984", "same threshold, shifted impostors -> FAR: 0.037"]},
 mistakes=["Reporting TAR at a FAR that was tuned on the test data.", "Claiming 'FAR 0.1%' from a few hundred impostor pairs: 0.1% of 500 is half a pair.", "Assuming the development FAR holds on new data.", "Reporting TAR without the FAR (or the reverse)."],
 answer="Because the impostor score distribution moved. A threshold calibrated on one population does not guarantee the same FAR on another, so the achieved FAR must be measured and reported.",
 dorsal="Audit file 04 reports October source-calibrated 1% and 0.1% FMR settings for a source-only model and warns they are not target FAR guarantees. That is exactly the shifted-impostor effect shown here, on synthetic numbers."),
}
