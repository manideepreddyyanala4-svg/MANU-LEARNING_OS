/**
 * Instructor-written, independent, original study explanations.
 * Each array matches the study_items ordering in the private sprint for the same day.
 * These are interview practice notes, not proprietary lab code or experimental results.
 */
export type DailyReadingCard = {
  read: string;
  worked: string;
  practice: string;
  question: string;
  answer: string;
};
export const dailyReading: Record<string, DailyReadingCard[]> = {
  '2026-11-01': [
    {
      read: 'LAWNet B1 is the current reference architecture in your research, not MobileNetV3. Its input is a single 128×128 image channel. The stem uses a 3×3 stride-2 convolution followed by batch normalization and Mish. The backbone has four Sandglass stages with 2, 2, 3 and 2 blocks. Sandglass blocks use lightweight channel processing and spatial depthwise operations to extract features without the cost of a large ordinary convolution.',
      worked: 'Trace the reference feature sizes verbally: stem 32×64×64; successive stage outputs 32×32×32, 64×16×16, 64×8×8, 128×8×8. These are reference-specific shapes; explain the downsampling stages rather than assuming every block halves resolution.',
      practice: 'On paper, write the input-to-stage table: stage, block count, output channels and H×W. Then give a 60-second explanation without looking at the table.',
      question: 'Why use a depthwise convolution instead of a standard k×k convolution inside a lightweight block?',
      answer: 'Depthwise convolution processes spatial neighborhoods separately for each channel. A standard convolution costs approximately k²×Cin×Cout weights; depthwise spatial convolution costs k²×Cin, followed by a separate pointwise channel mixer. This often reduces compute, but measured latency still depends on hardware and implementation.'
    },
    {
      read: 'MPCA stands for multi-scale positional/coordinate attention in the B1 reference. The intuitive job is to help a CNN retain WHERE an informative pattern occurs, not only whether it is present. Row-wise and column-wise pooled summaries carry information about horizontal and vertical structure. Attention weights can then rescale features according to location and channel.',
      worked: 'For a feature map shaped C×H×W, row summaries aggregate over width and column summaries aggregate over height. Unlike pooling directly to 1×1, the outputs preserve one spatial coordinate. This is useful when local texture position matters.',
      practice: 'Draw a C×8×8 feature tensor, label row and column aggregation directions, and say what spatial information remains in each. Compare this with ordinary global average pooling.',
      question: 'Why might coordinate-aware attention be useful for veins or palm/wrist line patterns?',
      answer: 'Biometric textures have spatial organization. Preserving row/column position helps the network distinguish where informative patterns appear. This is a design rationale, not proof that MPCA improves every dataset; controlled ablation and held-out evaluation are required.'
    },
    {
      read: 'PSPP uses pooled regional information from grids of 1×1, 2×2 and 4×4. The 1×1 grid gives whole-image context; 2×2 contributes four regional cells; 4×4 contributes sixteen smaller regions. The reference head projects pooled branches and concatenates them into a 384-dimensional embedding. L2 normalization makes embedding magnitude one, so cosine similarity describes direction rather than arbitrary vector scale.',
      worked: 'There are 1+4+16=21 regional cells before projection across pyramid levels. A normalized sample embedding e=(3,4)/5=(0.6,0.8) has Euclidean length one. The actual reference uses 384 elements, not two.',
      practice: 'Explain why pooling every feature to 1×1 loses spatial layout. Write Python to normalize np.array([3.,4.]) and verify norm ≈ 1.',
      question: 'What is the difference between a 384D embedding and 384 biometric identities?',
      answer: 'Embedding dimension is the number of numeric coordinates representing an input. It is not the number of users or classes. The reference head outputs a 384-element feature vector per image; any number of enrolled identities can be compared through similarity.'
    },
    {
      read: 'In 1:1 verification, a claimed user provides or is associated with a reference template; the system compares a query embedding with that template. Cosine score equals (a·b)/(||a||||b||). If the normalized vectors are aligned the score is near 1, and if orthogonal it is 0. A threshold decides accept or reject. Genuine pairs belong to the same enrolled identity; impostor pairs belong to different identities.',
      worked: 'For a=(1,0), genuine-like b=(0.8,0.6) has cosine 0.8; c=(0,1) has cosine 0. At threshold 0.7, b is accepted and c rejected. This is a toy example, not an actual system threshold.',
      practice: 'Write a function cosine(a,b) with a zero-norm check. Print a small genuine/impostor score table, choose a sample threshold and calculate accept/reject outcomes.',
      question: 'How does 1:1 verification differ from open-set 1:N identification?',
      answer: 'Verification evaluates one claimed identity against its template (same/not same). Open-set identification searches across a gallery and may reject unknown users. Your current central evaluation task is 1:1 verification; do not market the project as a finished 1:N deployment.'
    },
    {
      read: 'Interview Python: a dictionary stores key→value pairs and typically supports average O(1) lookup and update. NumPy arrays store homogeneous numeric data and offer vectorized operations. For cosine similarity, NumPy dot computes the inner product and linalg.norm computes the vector norm. Python lists work, but NumPy is a natural interview choice for numerical vision code.',
      worked: 'Two-sum example: nums=[2,7,11,15], target=9. Visit 2 and store {2:0}; visit 7 and look up target-7=2, returning indices (0,1). Time O(n), extra space O(n).',
      practice: 'Without looking up a solution, implement two_sum(nums,target) using a dict in 15 minutes. Then implement cosine(a,b) in NumPy in 15 minutes. Test empty input and zero-vector behavior explicitly.',
      question: 'Why does the hash-map solution to Two Sum take linear expected time?',
      answer: 'Each number is visited once. Hash-table membership and insertion average O(1), so the total is O(n), with up to O(n) stored entries. Worst-case behavior and collision details depend on implementation.'
    }
  ],
  '2026-11-02': [
    {
      read: 'A0 is the reference single-channel input contract, not an RGB 3-channel model. In the frozen source preprocessing, an RGB image can be converted to HSL and the saturation channel selected; an NIR image uses its intensity channel. The selected 2D image then follows the approved enhancement and resize to 128×128. Do not silently switch to green channel or RGB during research comparison.',
      worked: 'A tensor with one 128×128 image has shape (128,128). After adding channel it is (1,128,128); after batching 16 examples it is (16,1,128,128). Channel selection and enhancement are not the same operation.',
      practice: 'Explain the RGB and NIR branches separately on paper. In Python, assert that each preprocessed item has shape (1,128,128); do not modify your sealed experimental preprocessing.',
      question: 'Why is identical input preprocessing necessary when comparing two architectures?',
      answer: 'Otherwise an apparent architecture improvement might come from changing the input distribution. Controlled comparisons keep the preprocessing contract fixed so differences can be attributed more confidently to architecture.'
    },
    {
      read: 'A PyTorch Dataset implements __len__ and __getitem__. DataLoader batches examples and can shuffle training data. A grayscale batch should be float tensor [N,1,128,128]; labels are commonly [N]. CNNs in PyTorch use NCHW, unlike HWC image arrays returned by many image libraries. Dataset splitting must happen by identity before producing training and validation loaders.',
      worked: 'If each sample is torch.randn(1,128,128) and batch_size=8, the DataLoader stacks to torch.Size([8,1,128,128]), except a final partial batch if drop_last=False.',
      practice: 'Write a toy Dataset of ten fake 1×128×128 tensors; use DataLoader(batch_size=4); print shapes for all batches. No research data needed.',
      question: 'What common leakage occurs when you randomly split images of the same person across training and validation?',
      answer: 'Identity-specific cues can appear in both sets, inflating the validation metric. If the intended experiment measures unseen identities, split identities first and ensure no class appears in multiple splits.'
    },
    {
      read: 'CPV1 treats source validation and held-out evaluation differently. Source validation is used to choose checkpoints; held-out folds are for later performance assessment, not iterative tuning. In your current reference, F1 is a wrist dataset, while F2, F3 and F4 are palm datasets from different sources. Performance in one source or fold cannot justify a universal biometric claim.',
      worked: 'Imagine checkpoint A has better source validation than B, but B looks better on a held-out wrist fold. Choosing B only because you inspected the wrist result changes the held-out fold into a selection set.',
      practice: 'Draw train → source validation → checkpoint freeze → held-out F1–F4. State what data is permissible at each decision point and note that identity overlap between some source datasets has not been conclusively resolved.',
      question: 'What is the difference between a holdout evaluation and never-before-seen data?',
      answer: 'Holdout means excluded from a specified training/selection step. It does not mean nobody ever examined that dataset. Your dorsal target was historically inspected, so call it held out from training and model selection, not an untouched blind test.'
    },
    {
      read: 'Your Tokyo paper is ROI extraction, not the architecture-selection paper. MediaPipe detects 21 hand landmarks. p0 is the wrist, p9 is the middle-finger MCP, and p5/p17 define a palm-width reference. A geometric crop can be oriented with the p0→p9 direction, a perpendicular axis and normalized width. A perspective transform maps the four ROI corners to a stable square output.',
      worked: 'A perspective homography is a 3×3 matrix (up to scale) that maps points from the image plane to a normalized plane. It can correct skew better than a simple axis-aligned crop.',
      practice: 'Draw p0,p9,p5,p17 on a hand outline; sketch the ROI center, width, four corners and perspective warp. Explain the pipeline in 90 seconds without referring to AM-15.',
      question: 'Why not just crop a fixed pixel rectangle from every raw smartphone photo?',
      answer: 'Hand translation, size and rotation vary. Landmark-normalized geometry can make the extracted region more repeatable; the exact ROI quality still requires evaluation against annotated or approved references.'
    },
    {
      read: 'Images loaded in OpenCV often use H×W×C and BGR channel order; CNN tensors use N×C×H×W. NumPy transpose reorders axes but does not itself change color channels. float32 conversion and division by 255 may normalize an 8-bit image; whether that is scientifically allowed depends on the frozen preprocessing specification.',
      worked: 'x=np.zeros((128,128,3)); x.transpose(2,0,1).shape is (3,128,128). To build a batch, add one dimension using x[None] after reordering.',
      practice: 'From a toy HWC RGB array, produce shape (1,3,128,128), then produce a one-channel (1,1,128,128) array by explicit channel selection. Print every intermediate shape.',
      question: 'Does transpose from HWC to CHW convert BGR into RGB?',
      answer: 'No. Transpose only rearranges axes; selecting or reversing channels is a different operation. Channel-order bugs can silently alter model inputs.'
    }
  ],
  '2026-11-03': [
    {
      read: 'Your frozen CPV1 reference uses two training stages: Stage 1 Softmax classification with RMSprop; Stage 2 AdaCos with Adam. Stage 2 adjusts embedding-discriminative learning while still updating the permitted model parameters under your CPV1 implementation. Do not describe this as an original-paper training procedure or as a teacher–student model.',
      worked: 'Softmax takes class logits and optimizes cross-entropy. AdaCos uses angular relationships between normalized features and classification weights to improve separability during training. Neither is the same as the cosine threshold used during final pair verification.',
      practice: 'Draw loss → backward → optimizer for each stage. Name the optimizer, what changes between stages and what remains controlled.',
      question: 'Why can a model use a classification loss during training but cosine similarity during verification?',
      answer: 'The classification objective shapes the embedding space. During deployment or verification, the normalized embedding is used to compute a pairwise similarity score without relying on the training-class index.'
    },
    {
      read: 'A checkpoint is a saved model state from a particular training step. Source validation can identify the checkpoint to keep, but evaluating many checkpoints on held-out target data to choose the best is leakage. Identity-disjoint means identities in train and validation do not overlap where unseen-identity generalization is the claim.',
      worked: 'If epoch 8 gets source-validation EER 3.2% and epoch 12 gets 3.6%, a prespecified lower-is-better selection rule chooses epoch 8, regardless of later held-out outcomes.',
      practice: 'Describe three examples of leakage: same identity in both splits, target-driven checkpoint choice, and test-set preprocessing tweaks. Write how each should be prevented.',
      question: 'Why is choosing an architecture from the held-out fold after repeated inspection scientifically risky?',
      answer: 'Repeated adaptation makes results optimistic for that fold. It becomes part of the development feedback loop rather than a fully independent evaluation set.'
    },
    {
      read: 'In PyTorch training: model.train() enables training behavior; optimizer.zero_grad() clears accumulated gradients; forward computes scores; loss.backward() computes gradients; optimizer.step() updates weights. For validation, model.eval() changes layers such as dropout and batch normalization, and torch.no_grad() disables gradient tracking.',
      worked: 'Typical order is optimizer.zero_grad(); logits=model(x); loss=criterion(logits,y); loss.backward(); optimizer.step(). An evaluation loop wraps forward passes in torch.no_grad() and performs no optimizer step.',
      practice: 'Write a toy linear classifier training loop on random data for two epochs, then a separate evaluation loop. Print loss and verify no gradients are updated during evaluation.',
      question: 'Does model.eval() by itself disable gradient computation?',
      answer: 'No. model.eval() sets evaluation mode for certain layers. torch.no_grad() or torch.inference_mode() controls gradient tracking.'
    },
    {
      read: 'FAR or FMR measures impostor attempts incorrectly accepted; FRR measures genuine attempts incorrectly rejected. EER is the operating point where FAR and FRR are approximately equal. TAR = 1−FRR at a specified FMR. A verification paper should report both the verification protocol and the operating metric, not merely an accuracy number.',
      worked: 'With 100 impostor attempts and 2 accepted, empirical FMR=2%. With 100 genuine attempts and 5 rejected, FRR=5%, TAR=95%. This is a hypothetical one-threshold point, not an EER.',
      practice: 'Given genuine=[0.9,0.8,0.5] and impostor=[0.2,0.6,0.1], classify at thresholds 0.7 and 0.5. Calculate confusion counts and explain the trade-off.',
      question: 'Why is EER insufficient to describe security-critical verification performance?',
      answer: 'An application may require a very low impostor acceptance rate. TAR at fixed FMR (for example 1% or 0.1%) describes performance at the operating constraint; EER alone cannot guarantee it.'
    },
    {
      read: 'Python interview basics: dictionaries for membership, sets for distinct values, try/except for expected recoverable errors and specific exception types. Avoid broad except: pass because it hides bugs. Time and space complexity are part of the answer; using a dict trades memory for faster lookup.',
      worked: 'count={} then for word in words: count[word]=count.get(word,0)+1. This counts a list in expected O(n) time and O(k) distinct-key memory.',
      practice: 'Solve “first non-repeating character” in 20 minutes, then write two unit tests. Explain why KeyError might arise and when .get() is appropriate.',
      question: 'What is the difference between except KeyError and a bare except?',
      answer: 'except KeyError handles one expected missing-key failure. Bare except catches many unrelated problems (including interruptions), making debugging and safe recovery much harder.'
    }
  ],
  '2026-11-04': [
    {
      read: 'A standard convolution jointly mixes channels and spatial positions. A depthwise spatial convolution operates one filter per input channel, and a 1×1 pointwise convolution mixes channels. BatchNorm normalizes activations using learned scale/offset, with different behavior in training and evaluation. Mish activation is x×tanh(softplus(x)). Sandglass blocks combine lightweight operations and residual pathways under architectural conditions.',
      worked: 'With Cin=32,Cout=64,k=3, standard conv has roughly 3×3×32×64=18,432 weights, before bias. Depthwise plus pointwise is 3×3×32+32×64=2,336 weights, before bias. This is illustrative, not B1 total.',
      practice: 'Calculate both parameter counts by hand. Explain why a cheaper operation in MACs is not always faster on all hardware.',
      question: 'Why must the residual skip path respect input and output shapes?',
      answer: 'Elementwise addition requires matching tensor dimensions (or an explicit compatible projection). Stride or channel changes can make a direct identity skip invalid.'
    },
    {
      read: 'AM-11 is a completed architecture exploration. It screened modifications through ordered phases (F/B/A/C) with frozen criteria. Some variants appeared promising in narrow screens, but none passed the full adoption rule in fresh checks. The scientifically correct conclusion is that B1 remained the reference, not that a new architecture was proven superior.',
      worked: 'Suppose candidate X improves one exploratory fold but degrades the confirmation fold. If the rule requires robust multi-fold advantage, the candidate fails adoption even if the exploratory metric looks impressive.',
      practice: 'Say this in 45 seconds: purpose of AM-11 → screening → confirmation → reason not adopted → what remains undecided in AM-15.',
      question: 'Why not publish only the strongest exploratory fold?',
      answer: 'It misrepresents evidence and encourages cherry-picking. A prespecified validation rule and independent confirmation are more defensible.'
    },
    {
      read: 'PSPP preserves regional patterns at multiple resolutions. A pure global pooling head collapses spatial position, although it may be cheaper. A controlled ablation replaces one component while preserving data, training and evaluation. Head and attention effects must be measured rather than asserted from intuition; historical GDC and MIX variants did not become adopted B1 replacements.',
      worked: 'Compare two 2×2 feature maps with identical global means but high activation in different quadrants. A 1×1 global mean treats them the same; 2×2 pooling preserves their difference.',
      practice: 'Write two 2×2 NumPy arrays with identical mean but swapped positions. Print global average and flattened 2×2 pool values; explain the information loss.',
      question: 'What makes an ablation convincing?',
      answer: 'Only the targeted architectural factor changes, while the protocol, data and appropriate random seeds remain controlled. Report the full relevant evaluation, not only one favorable metric.'
    },
    {
      read: 'The AM-15 search constraints are up to 0.6 million parameters and 28 million MACs, with measured desktop CPU latency not more than 1.2× the B1 reference. Parameters estimate model storage, MACs estimate arithmetic, and measured latency captures implementation and hardware behavior. These are different quantities.',
      worked: 'A 20M-MAC model can still be slower than a 25M-MAC model if its operators have poor CPU kernel support or memory access patterns. Desktop ONNX latency is not smartphone latency.',
      practice: 'Explain params, MACs and latency separately. Derive a hypothetical 1.2× limit if B1 takes 5 ms: candidate cap would be 6 ms on the SAME measurement setup.',
      question: 'Can 18.73M MACs prove real-world phone inference speed?',
      answer: 'No. MACs are hardware-independent arithmetic estimates. Phone performance requires measurements on the actual phone, runtime, input shape and quantization settings.'
    },
    {
      read: 'Tensor debugging should start with NCHW and the effect of kernel, stride and padding. For ordinary convolution, Hout=floor((Hin+2p−d(k−1)−1)/s +1). Print intermediate shapes rather than guessing. Broadcasting may silently produce a result with an unexpected shape.',
      worked: 'For Hin=128,k=3,p=1,s=2,d=1, Hout=floor((128+2−2−1)/2+1)=64. This explains a stride-2 stem.',
      practice: 'Create torch.randn(4,1,128,128), run Conv2d(1,32,3,stride=2,padding=1), assert output shape (4,32,64,64). Repeat stride=1.',
      question: 'What is the first thing to inspect when a PyTorch CNN fails with a channel mismatch?',
      answer: 'Check actual tensor shape and the expected in_channels at the failing layer; verify NCHW layout and that the preprocessing produced the correct channel count.'
    }
  ],
  '2026-11-05': [
    {
      read: 'AM-15 / ADP-2 is an independent architecture search, not a finalized new model. The saved October 30 handoff listed 35 candidate architectures plus B1: clean-sheet models, a clean-sheet control, partial redesigns and LAWNet-derived designs. These are proposals under evaluation. Do not claim all were accepted, trained to completion or superior.',
      worked: 'The baseline and candidates should share the same frozen training, validation and measurement contract. Family labels describe design origin; they do not indicate ranking or scientific superiority.',
      practice: 'Build a three-column table: baseline B1, candidates under search, rejected/CPU-only prototypes. Explain how their evidence status differs.',
      question: 'What is the most scientifically accurate answer when an interviewer asks your current model?',
      answer: 'LAWNet B1 is the reference baseline; AM-15 is an ongoing/unresolved architecture-selection study based on the last verified handoff. Check the current experiment logs before claiming any new final winner.'
    },
    {
      read: 'The 2026-10-30 handoff recorded 180 of 282 Phase-1 runs at that snapshot. A historical progress count is not a live server status. A run can be queued, executing, failed, invalidated or completed; integrity and metrics must be checked before calling it usable evidence.',
      worked: '180/282 ≈ 63.8% was the reported completion at that snapshot, not a prediction of current completion. Without a current server check, do not report that any remaining run finished.',
      practice: 'Practice this interview sentence: “My last audited status was X as of October 30; I need to inspect the current logs before updating the count.”',
      question: 'Why is using yesterday’s run counter as today’s progress misleading?',
      answer: 'Because the underlying processes, failures and checks may have changed. A timestamped run report is evidence only for its own observation time.'
    },
    {
      read: 'A futility gate may reject an obviously weak candidate early to save compute, but it is not necessarily a selection rule for winners. In the stored AM-15 design, F2 was used as a stop-only criterion; full four-fold evidence and later confirmation govern advancement. This distinction prevents over-selecting for the dataset used in screening.',
      worked: 'If a candidate performs badly on F2, it can be stopped under a prespecified rule. If it performs well on F2, that alone cannot demonstrate overall improvement or automatic promotion.',
      practice: 'Explain the difference between “stop because inadequate” and “promote because superior.” Draw a screening funnel with four-fold and fresh-seed checks.',
      question: 'Can a candidate become the final model based only on its best F2 score?',
      answer: 'No. Under the recorded frozen protocol F2 is a stop-only screen, not standalone evidence for selection.'
    },
    {
      read: 'Cross-domain verification assesses robustness outside one image source. EER summarizes where false acceptance and false rejection intersect, while TAR at low FMR measures how many genuine attempts are accepted under an impostor-risk constraint. Source conditions, identity splits, pair construction and per-fold reporting matter more than a lone percentage.',
      worked: 'At FMR 1%, the system allows about 1 impostor false acceptance per 100 impostor attempts (if measured with enough samples). TAR 90% at that threshold means 10% genuine rejection.',
      practice: 'Draw two overlapping score distributions. Move the acceptance threshold right and explain which error rises and which falls. State why FMR 0.1% requires enough impostor trials.',
      question: 'Why are two papers’ EER figures not directly comparable without protocol details?',
      answer: 'They may use different datasets, biometric definitions, pair sampling, enrollment policies, subject splits, preprocessing and threshold estimation.'
    },
    {
      read: 'Experiment integrity is part of the science. A random seed controls defined pseudorandom operations but does not eliminate all nondeterminism. Configuration hashes identify which frozen settings were used. Model checkpoint names alone are inadequate evidence. When comparing candidates, confirm the seed, data identifiers, preprocessed input version, checkpoint provenance and evaluation script.',
      worked: 'If run A and B both say “baseline” but differ in data split or checkpoint selection, their metrics are not a controlled repeat—even if the architecture name is identical.',
      practice: 'Write a Python dict containing model, data_version, seed and code_commit, serialize it with json.dumps(sort_keys=True), then compute a SHA-256 digest. This is a toy provenance exercise.',
      question: 'Why should a surprising improvement trigger integrity checks first?',
      answer: 'A preprocessing mismatch, leaked split, wrong checkpoint or incorrect metric aggregation can create apparent gains. Verify provenance before drawing a scientific conclusion.'
    }
  ],
  '2026-11-06': [
    {
      read: 'Your target dorsal-hand collection contains 3,134 ROI images across 314 hand identities in the saved study snapshot. Hand identity is the relevant class unit, not necessarily person identity. This target was historically inspected; under the frozen research rules it is kept out of training and model selection, not called a fully blind untouched benchmark.',
      worked: 'Suppose each person contributes left and right hands. The count of hand identities can be about twice the number of people, but identity splitting and session pairing still need their precise protocol definitions.',
      practice: 'Write 4 sentences describing target modality, class unit, held-out status and what cannot be inferred about a production phone system.',
      question: 'Why distinguish 314 hand identities from 314 people?',
      answer: 'The same person may contribute two separate biometric classes, so hands and persons are different statistical units. Confusing them can invalidate protocol descriptions.'
    },
    {
      read: 'DTB-1 was a historical zero-shot dorsal evaluation across six backbone designs. AM-15 is a different architecture-development study with its own frozen screening and selection criteria. The old MobileNetV3 baseline is not the current selected B1 model, and historical target EER should not be compared directly with source-validation, wrist or literature figures.',
      worked: 'A model could have 10% EER on one target protocol but 3% on a different wrist-source split. That says more about protocol differences than a universal 7-point improvement.',
      practice: 'Make a table: study name, task, dataset/protocol, reference model, evidence status. Never mix numbers across rows when answering questions.',
      question: 'What is the danger of comparing a literature 1.8% EER with a held-out dorsal 10.28% EER as though they were same test?',
      answer: 'They concern different data and procedures. Without matched protocols the difference cannot establish an architecture improvement or regression.'
    },
    {
      read: 'Cross-session biometric failure can be caused by image quality, pose, ROI drift, illumination, skin contrast, environmental conditions and enrollment-template variability. These are hypotheses until demonstrated through error inspection and stratified analysis. Do not label one factor as proven without controlled evidence.',
      worked: 'If false rejections cluster under outdoor images, test whether exposure or ROI crop shift changes with the condition before concluding illumination alone caused it.',
      practice: 'Propose an error-analysis table with condition, ROI quality, cosine score and false-reject flag. State which descriptive statistic you would compare first.',
      question: 'How would you diagnose genuine-pair errors without contaminating your held-out test?',
      answer: 'Use an approved diagnostic analysis plan, distinguish exploratory inspection from final evaluation, and avoid tuning model choice or threshold on a designated final test.'
    },
    {
      read: 'ROI extraction quality and identity verification quality are different. Mean IoU compares predicted and reference ROI overlap. EER is derived from pairwise biometric scores. Good localization is useful, but does not automatically prove the downstream verifier is accurate or secure. This distinction matters for your separate Tokyo ROI conference presentation.',
      worked: 'Intersection=80 pixels and union=100 pixels gives IoU 0.8. This is not “80% biometric recognition accuracy.”',
      practice: 'Draw two overlapping rectangles, calculate intersection/union; then explain why you cannot transform that IoU into an EER number.',
      question: 'Can an ROI method with high IoU still lead to poor verification?',
      answer: 'Yes. Crop overlap measures geometry, while verification also depends on identity features, preprocessing, class separation, image conditions and scoring protocol.'
    },
    {
      read: 'A strong technical interview answer has five parts: problem, dataset and units, your implemented technical contribution, evaluation methodology, and limits. Keep the ROI conference work separate from architecture evaluation. Be precise about what you personally coded and what was a team or advisor decision.',
      worked: 'Two-sentence intro: “I work on RGB dorsal-hand biometric verification. I implement and evaluate preprocessing and feature-extraction methods with controlled 1:1 verification metrics.” Add details only if you can substantiate them.',
      practice: 'Record a 90-second project pitch. Then solve one timed dict/list Python question and test edge cases. Re-record the pitch if it confuses ROI IoU with verification EER.',
      question: 'What should you say when asked whether the smartphone app is deployed?',
      answer: 'State only its verified status. The planned mobile deployment is not a completed measured phone deployment unless a device test and released implementation actually exist.'
    }
  ],
  '2026-11-07': [
    {
      read: 'Coding interview simulation: solve one array/hash-map task and one NumPy shape/math task without search or AI assistance. State inputs, outputs, edge cases, time complexity and memory complexity before writing code. Test your function independently with at least three examples.',
      worked: 'For count_occurrences(["a","b","a"]), the answer is {"a":2,"b":1}. A dictionary uses expected constant-time membership and update; a nested-loop implementation is usually unnecessarily quadratic.',
      practice: 'Set a 45-minute timer. Write group_anagrams or first_unique_character in Python, then normalize a batch of vectors in NumPy using axis=1 and keepdims=True.',
      question: 'What evidence means you passed this mock rather than merely read a solution?',
      answer: 'A running implementation, correct outputs on normal and edge inputs, and a concise complexity explanation completed without copying the answer.'
    },
    {
      read: 'End-to-end B1: input grayscale A0 1×128×128 → convolutional stem → 2/2/3/2 Sandglass stages → MPCA positional attention → PSPP regional pooling at 1×1,2×2,4×4 → 384D embedding → L2 normalization → cosine similarity of two inputs. State which pieces are training-only losses and which execute during inference.',
      worked: 'Two images generate two normalized 384D feature vectors. Their dot product equals cosine similarity. The chosen verification threshold then produces accept or reject.',
      practice: 'Whiteboard the entire B1 pipeline from memory in three minutes. Describe two tensor shapes and identify why the classifier used in training is not needed for cosine verification.',
      question: 'What exact architecture are you using now?',
      answer: 'LAWNet B1 is the current reference baseline; the AM-15 model search had no confirmed new adopted winner in the last verified snapshot. The historical MobileNetV3 model is not the current reference.'
    },
    {
      read: 'Scientific protocol rehearsal: two-stage CPV1 training, source-validation checkpoint selection and held-out F1–F4 evidence are separate decisions. Full reports must mention identity split, threshold definition, pair sampling and reproducibility. Cross-modal wrist/palm source evaluation does not guarantee RGB dorsal generalization.',
      worked: 'A paper claiming "strong generalization" based only on a held-out wrist fold while ignoring weaker palm folds would be biased if all folds were part of the locked decision rule.',
      practice: 'Answer aloud: what is source validation, why is F2 stop-only, what is EER, why is TAR@FMR important, and what cannot be claimed about the target data?',
      question: 'Why should the test fold not be used to select a training checkpoint?',
      answer: 'That turns the test fold into development feedback and biases the final evaluation. Select checkpoints using the approved source-validation partition.'
    },
    {
      read: 'Research chronology: AM-11 finished and did not produce an adopted architecture; B1 remained the reference. AM-15 was active and undecided in the audited October 30 report. Do not collapse the two programs or claim a winner based on one favorable trial. The scientific result includes failures and evidence limitations.',
      worked: 'Explain: “We tested structured architecture changes. Some screen improvements failed fresh checks; we retained B1 pending stronger evidence. A separate broader candidate search remains to be validated.”',
      practice: 'Give a 60-second honest research status, including the last-verification date. Do not invent today’s GPU run count.',
      question: 'Why is retaining the baseline sometimes the correct research decision?',
      answer: 'A complex candidate is not an improvement unless it passes the previously defined accuracy, robustness and efficiency criteria in confirmation tests.'
    },
    {
      read: 'Tokyo paper oral rehearsal: first motivate repeatable RGB dorsal-hand ROI extraction under changing pose/background. Then explain landmarks, orientation normalization, homography, image enhancement and ROI metrics. Separate this approved ROI pipeline from AM-15 architecture-search questions and respect confidential NSTC material restrictions.',
      worked: 'An effective 4-step slide story is: variable raw photos → robust hand landmarks → geometric ROI normalization → measured ROI success/overlap plus limitations.',
      practice: 'Speak for five minutes with no slides, then answer: Why MediaPipe? How are failed landmarks handled? What does IoU measure? What data are you permitted to show?',
      question: 'Can you directly reuse unpublished proposal figures in conference slides?',
      answer: 'Not without appropriate rights/permissions. Use approved original figures and correctly cite any third-party material.'
    }
  ],
  '2026-11-08': [
    {
      read: 'AM-11 exploratory screens must be distinguished from confirmation. A metric gain observed on F1 or a favorable seed cannot override a prespecified multi-fold rule. Your status explanation should include the completed experiment, the lack of an adopted winner and the retained B1 reference.',
      worked: 'A candidate wins exploratory F1 by 0.3 percentage points but worsens two independent folds. That does not establish robust superiority.',
      practice: 'Write a three-row comparison: baseline, exploratory candidate, confirmation result; add a conclusion that does not cherry-pick.',
      question: 'Why separate screening and confirmation seeds?',answer:'A new random seed tests whether an observed benefit generalizes beyond one particular run or training fluctuation.'
    },
    {
      read: 'PyTorch state_dict contains model tensor parameters and buffers. Save with torch.save(model.state_dict(), path); recreate the same model architecture, load the state dictionary and call model.eval() for inference. Store compatible configuration metadata separately. Avoid loading unknown, untrusted pickle artifacts.',
      worked: 'Reinitialize two identical torch.nn.Linear(3,2) modules; save one state_dict and load it into the other. On the same input in eval mode, their outputs should agree.',
      practice: 'Perform that toy save/load test and assert torch.allclose(out1,out2); do not alter live lab checkpoints.',
      question: 'Why must architecture definitions match when loading weights?',answer:'state_dict maps named tensors to expected parameter and buffer shapes. Different names or shapes produce missing, unexpected or incompatible tensors.'
    },
    {
      read: 'Binary morphology processes mask shapes. Erosion shrinks foreground features; dilation expands them. Opening is erosion followed by dilation, often used to remove small isolated foreground spots. Closing is dilation followed by erosion, often used to fill small gaps. Effects depend on kernel size and the convention for foreground.',
      worked: 'A single isolated white pixel within black background often vanishes after opening with a 3×3 structuring element.',
      practice: 'Create a toy 8-bit mask with isolated dots and a small gap. Show cv2.morphologyEx(...,MORPH_OPEN,...) and MORPH_CLOSE results side by side.',
      question: 'Why can overly strong erosion harm biometric textures?',answer:'Fine vein/line structures may disappear along with noise. Kernel choices must be justified by evaluation.'
    },
    {
      read: 'ROI errors can include missed hand detection, rotated or shifted crops, clipping and mismatched illumination. An error report should distinguish landmark failure from downstream recognition failure. Report measurable failure counts rather than calling a pipeline robust without evidence.',
      worked: 'If a crop is geometrically correct but verification rejects the hand, that is not automatically a landmark failure.',
      practice: 'List four distinct failure categories and one measurable diagnostic for each. Explain how perspective geometry affects consistency.',
      question: 'Why inspect masks and crop boundaries visually?',answer:'Aggregate scores can hide systematic clipping, background inclusion or viewpoint-specific failures.'
    }
  ],
  '2026-11-09': [
    {
      read: 'PSPP 4×4 divides the feature grid into sixteen regions, retaining spatial arrangement absent from pure global pooling. A GDC or other global head may reduce compute, but the scientific value depends on held-out verification metrics. Your earlier GDC direction did not replace B1 after protocol checks.',
      worked: 'Two maps with bright energy in opposite corners can have equal global means but different 4×4 grid descriptors.',
      practice: 'Explain PSPP versus global pooling using an 8×8 toy NumPy matrix and regional maxima.',
      question:'Is lower MAC count enough to adopt GDC?',answer:'No. It must also satisfy accuracy, robustness and measured-latency rules.'
    },
    {
      read: 'Pandas groupby summarizes groups; merge joins tables on keys; missing values require a defined rule. Validate join cardinality to avoid accidental row multiplication. For research result tables, pair counts, class IDs and fold labels must remain interpretable.',
      worked:'left records with IDs [1,2] and right records with ID [2] produce one matched row under inner merge; a left merge retains ID 1 with missing right fields.',
      practice:'Create a DataFrame of fold/score rows; group by fold and compute count, mean and median. Perform a merge with validate="many_to_one".',
      question:'Why can an unintended many-to-many merge corrupt metrics?',answer:'It duplicates records and changes counts or weights used in aggregates.'
    },
    {
      read: 'A confusion matrix counts predicted/actual categories; ROC plots true-positive rate against false-positive rate over thresholds; precision-recall emphasizes positive predictions and recall. In biometric verification, define which class is genuine/positive before interpreting axes.',
      worked:'10 genuine pairs: 8 accepted and 2 rejected; 20 impostor pairs: 1 accepted and 19 rejected. TAR=0.8, FMR=0.05 at this threshold.',
      practice:'Compute TP,FP,FN,TN in Python for a short pair-score list. Create the arrays needed for an ROC plot and explain threshold direction.',
      question:'Why not call all metrics "accuracy"?',answer:'Different metrics quantify distinct error costs, especially important when impostor attempts are rare or security-sensitive.'
    },
    {
      read: 'Hashing interview questions often need O(n) membership tests, counting or index lookup. A Python set stores distinct elements; dict stores key-value mappings. Explain average complexity and handle repeated keys deliberately.',
      worked:'For nums=[1,2,1,3], first duplicate can be found by scanning with a set and returning 1 on its second appearance.',
      practice:'Solve valid_anagram and contains_duplicate with no internet, then write tests for empty input, repeated values and Unicode.',
      question:'When choose set rather than dict?',answer:'Use a set when only membership matters; a dict when values such as counts or indices must be associated with keys.'
    }
  ],
  '2026-11-10': [
    {
      read: 'Scientific evaluation needs a well-defined split unit. Source-validation identities should be disjoint from training identities if unseen-identity generalization is measured. Dorsal target inspection cannot be silently used for hyperparameter optimization under a holdout claim.',
      worked:'If class A contributes five images to training and five to validation, the split is image-disjoint but not identity-disjoint.',
      practice:'Implement a toy split of identity IDs into two disjoint sets, then assert intersection is empty.',
      question:'Is no shared filename enough to establish no identity leakage?',answer:'No. Multiple files can portray the same identity or near-duplicate capture.'
    },
    {
      read: 'A Python virtual environment isolates project dependencies. python -m venv .venv creates one; activate it according to the shell, then python -m pip install packages from a maintained requirements file. Keep secrets outside version control and inspect Python/interpreter paths when imports fail.',
      worked:'"which python" (Linux) or "where python" (Windows) helps verify which interpreter executes scripts.',
      practice:'Create a throwaway virtual environment, print sys.executable and pip --version, and describe why a mismatched interpreter causes import errors.',
      question:'Why might a package appear installed but Python still cannot import it?',answer:'pip and the executing Python may refer to different environments/interpreters.'
    },
    {
      read: 'Safe inference requires reconstructing the correct model definition, loading compatible weights, applying the exact preprocessing contract and calling eval/inference_mode. A checkpoint that loads successfully can still produce wrong embeddings if its channel convention or crop contract changes.',
      worked:'Input N×1×128×128 passes through the B1 reference to normalized embedding N×384. Any unexpected dimensions signal a mismatch requiring investigation.',
      practice:'Use a toy trained Linear layer for save/load inference; document all inputs and outputs. Do not modify live lab model files.',
      question:'What should accompany a deployable checkpoint?',answer:'Architecture version, preprocessing, input shape, normalization, source checkpoint identity, software/runtime compatibility and test evidence.'
    },
    {
      read: 'Python logging should capture event severity, timestamp, run ID and relevant context. logger.exception inside an exception handler retains the traceback. Prefer structured fields for experiment IDs and configurations; do not log API credentials or confidential raw biometric images.',
      worked:'An entry like event=checkpoint_selected run=toy-fold1 seed=7 is more useful than "done".',
      practice:'Create a logging script that records start, one test metric and an exception with traceback. Review the output and remove sensitive values.',
      question:'Why is print-only debugging insufficient for long experiments?',answer:'Structured persistent logs help trace timing, configuration and failures across runs and machines.'
    }
  ],
  '2026-11-11': [
    {
      read: 'AdaCos belongs to metric-learning/classification training; verification cosine is a similarity calculation on two learned embeddings. The training loss encourages separable classes, while the inference score applies to arbitrary pairs. Do not confuse angular classification logits with an enrolled user threshold.',
      worked:'A training batch has labels known to the classifier. A query from a new user can be compared by embedding cosine without adding that user as a training class.',
      practice:'Draw two pipelines: labeled training → loss; query/reference inference → embeddings → cosine → threshold.',
      question:'Does training with AdaCos mean the system must classify among training identities at inference?',answer:'No. Embeddings can support pairwise comparison to enrolled identities.'
    },
    {
      read: 'Semantic segmentation assigns a class to every pixel; instance segmentation also separates object instances. IoU=intersection/union and Dice=2×intersection/(|A|+|B|). A high segmentation score does not necessarily imply high biometric matching performance.',
      worked:'Predicted 80 foreground pixels, reference 100 pixels, overlap 60: union=120, IoU=0.5, Dice=120/180≈0.667.',
      practice:'Implement IoU and Dice for two binary NumPy arrays, including an explicit convention for two empty masks.',
      question:'Why might Dice exceed IoU on the same nonempty masks?',answer:'Their formulas weigh overlap differently; Dice=2IoU/(1+IoU) for two sets.'
    },
    {
      read: 'The finalized paper ROI detection path is based on MediaPipe landmarks and geometric normalization. Earlier exploratory YOLO fallback should not be stated as part of the finalized method. Model training architecture is a separate research question.',
      worked:'Landmark detection yields geometry; perspective warp produces the normalized ROI; the verification model consumes the processed input under its own contract.',
      practice:'Say, without notes, why you chose the finalized landmark-only method and what errors the ROI evaluation measures.',
      question:'Would saying "our final method uses YOLO fallback" be accurate?',answer:'No. That describes an earlier exploratory direction, not the finalized ROI method reported in your saved handoff.'
    },
    {
      read: 'An OpenCV bounding box has top-left coordinate and width/height, while binary mask is a per-pixel inclusion map. Slicing image[y:y+h,x:x+w] follows row-first indexing; reversing x/y is a common bug. ROI perspective warps are more general than axis-aligned slices.',
      worked:'For image of H=100,W=200, x=20,y=10,w=50,h=30, image[10:40,20:70] has shape (30,50,C).',
      practice:'Generate a toy 100×200 image and assert the bounding-box crop shape. Draw a polygon mask and count mask pixels.',
      question:'Why should clipping checks run before cropping?',answer:'Bounds outside the image can create empty or truncated regions without always throwing a clear exception.'
    }
  ],
  '2026-11-12': [
    {
      read: 'AM-15 explores multiple families: clean-sheet networks, a clean-sheet control, partial redesigns and LAWNet-derived candidates. Origin labels do not predict quality. The scientific goal is reproducible accuracy under compute and latency limits, not architectural novelty alone.',
      worked:'A novel candidate may have fewer params but lower TAR at strict FMR, failing the decision rule despite its originality.',
      practice:'Explain three valid candidate tradeoffs (accuracy, MACs, CPU latency) and one reason an apparently novel design could still be rejected.',
      question:'Does 35 designed candidates mean 35 fully validated successful models?',answer:'No. Design count is different from completed, valid and adopted evaluation count.'
    },
    {
      read: 'Latency benchmarking must control runtime, warm-up, device, threads, batch size, input shape and statistics. GPU kernels may run asynchronously, requiring synchronization before timing. CPU inference differs from smartphone inference.',
      worked:'If first call takes 40ms and later warmed calls take 5ms, including compilation/startup in a steady-state latency average misstates the workload.',
      practice:'Benchmark a toy PyTorch CPU operation with warm-up, torch.inference_mode and repeated timings; report median and p95.',
      question:'Why can a lower-MAC model run slower on a CPU?',answer:'Operator support, parallelism, memory behavior and kernel overhead can dominate arithmetic count.'
    },
    {
      read: 'An inference contract specifies exact image source, channel order, resize, dtype, range, normalization, tensor shape and output interpretation. A mismatch can damage biometric scores without raising an exception.',
      worked:'N×1×128×128 float input is incompatible with silently changing to N×3×128×128 RGB unless the model is redesigned and retrained accordingly.',
      practice:'Write a schema and assertions for a toy preprocess(x) returning a float32 single-channel tensor with shape (1,128,128).',
      question:'What is the most dangerous preprocessing bug?',answer:'One that produces plausible shapes and valid outputs while changing the input distribution, such as a different channel or normalization convention.'
    },
    {
      read: 'A generator yields items lazily, potentially reducing peak memory; a decorator wraps functions for reusable behavior like logging or timing. Both are useful, but avoid needless abstraction during short interview tasks.',
      worked:'def squares(n): for i in range(n): yield i*i produces one value per iteration instead of materializing all values at once.',
      practice:'Write a generator for batching a list into chunks of size k; write a simple decorator that prints a function name before calling it.',
      question:'Does generator iteration always use zero memory?',answer:'No. It typically avoids materializing all outputs, but still holds generator state and any retained inputs.'
    }
  ],
  '2026-11-13': [
    {
      read: 'A0 is the single-channel, 128×128 reference input. RGB-derived sources may use HSL saturation; NIR sources use intensity. Color conversion, enhancement and tensor shaping must follow the frozen contract, not a guessed natural-looking visualization.',
      worked:'An input H×W grayscale image becomes a 1×128×128 sample after resize and channel-dimension addition, then N×1×128×128 as a batch.',
      practice:'Explain RGB versus NIR branch and check that toy preprocessed input has the correct dtype and dimensions.',
      question:'Why not feed the original 3-channel photograph directly to the B1 reference?',answer:'The reference was built and evaluated under a one-channel A0 input contract; changing it breaks compatibility and protocol comparability.'
    },
    {
      read: 'CNNs apply local convolution kernels and strong image inductive biases; Vision Transformers divide images into tokens and use attention to relate positions. Neither is uniformly superior. Dataset size, efficiency and input resolution affect the appropriate choice.',
      worked:'An 8×8 image split into 4×4 patches gives four patch tokens (before any special tokens). Smaller patches create more tokens and can increase attention compute.',
      practice:'Describe two reasons to prefer a small CNN over a ViT for a constrained biometric prototype and two situations where a ViT is worth testing.',
      question:'Why are CNNs often more data-efficient on small vision datasets?',answer:'Their weight sharing, locality and translation-related inductive biases constrain learning; actual comparative results still depend on training and data.'
    },
    {
      read: 'Vision-language models jointly represent images and natural-language information. In vision systems they can help describe scenes, retrieve images from text or answer visual questions. They are not automatically better biometric verifiers and introduce latency, hallucination and privacy considerations.',
      worked:'A warehouse quality assistant could turn a detected visual defect into a natural-language inspection explanation. The numeric defect detector and language explanation have different reliability requirements.',
      practice:'Explain a realistic use case for a VLM in one minute, then state how you would independently validate its grounding and safety.',
      question:'Should your dorsal thesis add a VLM merely because it is popular?',answer:'No. Add a technique only if it solves a real task requirement and supports controlled evaluation; do not damage research focus with decorative complexity.'
    },
    {
      read: 'A medium Python problem requires a clear invariant and tested edge cases. Typical patterns include sliding window, two pointers and dictionary-based counting. Prefer an algorithm you can justify rather than a clever memorized trick.',
      worked:'For maximum sum of length-k contiguous subarray, update previous sum by subtracting outgoing value and adding incoming value, O(n) time.',
      practice:'Implement longest_substring_without_repeating_characters with a sliding window in 30 minutes; test empty string and repeated characters.',
      question:'Why is a sliding window efficient for many contiguous-subarray problems?',answer:'It updates a maintained window state as endpoints move, often avoiding recomputation over every interval.'
    }
  ],
  '2026-11-14': [
    {
      read: 'Frozen runs should preserve seed values, model and data version identifiers, implementation commit, configuration hashes and checkpoint provenance. Auditing integrity means verifying an experiment matches the approved protocol before interpreting its performance.',
      worked:'Two runs with the same model name but different data_split_hash are not direct same-protocol replicas.',
      practice:'Make a toy run manifest JSON and compute its SHA-256; describe what else must be saved to reproduce a metric.',
      question:'Is one random seed sufficient to prove a robust improvement?',answer:'No. Seed sensitivity and independent confirmation matter, especially after exploratory architecture selection.'
    },
    {
      read: 'A scientific interview about datasets should cover subjects versus hand identities, enrollment template count, genuine/impostor pair creation, source/held-out split, threshold selection and missing demographic/condition data. Do not claim indoor and outdoor captures were mixed into enrollment if the protocol forbids it.',
      worked:'An impostor pair links different hand identities; a genuine pair links the same enrolled hand identity under the prescribed enrollment/test conditions.',
      practice:'Sketch a small three-identity verification protocol, list all allowed genuine pairs and three impostor examples.',
      question:'How can template enrollment policy influence EER?',answer:'Enrollment images determine the reference distribution. Template counts and capture conditions can change match scores, so cross-study comparisons require the same policy.'
    },
    {
      read: 'Behavioral interview stories should follow situation → task → action → result → learning. Explain what you personally implemented, not vague team achievements. In Taiwan, state English comfort, basic Mandarin and your semester work-hour limitation accurately, and verify authorization before accepting work.',
      worked:'“I debugged a preprocessing mismatch by comparing tensor shapes and sample outputs, fixed the input conversion, and documented a reproducible test” is concrete if true.',
      practice:'Record two 60-second stories: independently debugging a model and handling failed experiment results. Prepare a clear statement about working up to 20 hours/week during term.',
      question:'What should you do when an interviewer asks about a tool you have never used?',answer:'Say you have not used it in production, explain adjacent skills accurately and outline how you would learn and test it. Do not invent experience.'
    },
    {
      read: 'Weak-topic repair is active recall plus a targeted correction. First attempt the question without notes, then inspect the solution, write the exact misconception, and retest later. Rereading without retrieval practice creates familiarity but not interview competence.',
      worked:'If you confuse FMR and FRR, construct a 10-genuine/10-impostor score table and compute both before rereading the definitions.',
      practice:'Identify your two lowest-confidence topics from the past 13 days. Give each a 20-minute mini-test, then schedule a retest two days later.',
      question:'How can you tell whether a weak topic has actually improved?',answer:'You can produce the correct explanation or program on a fresh prompt without checking notes, and repeat that performance later.'
    }
  ]
};
export function readingFor(day: string, index: number): DailyReadingCard | null {
  return dailyReading[day]?.[index] ?? null;
}
