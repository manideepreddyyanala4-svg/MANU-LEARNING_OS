import type { InterviewCategory } from './types';

export const interviewCategoriesPart2: InterviewCategory[] = [
  {
    "id": "project-technical",
    "title": "D. Project Technical Follow-ups — Backup",
    "subtitle": "Only go this deep if the interviewer asks technical follow-ups.",
    "range": "Q110–Q154",
    "items": [
      {
        "number": 110,
        "priority": "PREPARE",
        "question": "How many images are in your current dataset?",
        "answer": "The current target set has 3,134 successfully processed RGB dorsal-hand images.",
        "memory": "3,134 PROCESSED IMAGES",
        "seconds": "5–10 sec"
      },
      {
        "number": 111,
        "priority": "PREPARE",
        "question": "How many identities?",
        "answer": "The current dataset has 314 biometric identities.",
        "memory": "314 BIOMETRIC IDENTITIES",
        "seconds": "5–10 sec"
      },
      {
        "number": 112,
        "priority": "PREPARE",
        "question": "What exactly does “314 identities” mean?",
        "answer": "It means 314 labels used for biometric matching. I need to confirm the person-to-hand mapping before calling that 314 people.",
        "needsFact": "Confirm whether identities refer to people, hands, or another labeling rule.",
        "memory": "IDENTITY LABELS → CHECK MAPPING",
        "seconds": "10–15 sec"
      },
      {
        "number": 113,
        "priority": "PREPARE",
        "question": "What are your indoor/outdoor conditions?",
        "answer": "The target dataset has both indoor and outdoor images, with roughly half in each condition. I use these labels to study how capture conditions affect performance.",
        "memory": "INDOOR → OUTDOOR",
        "seconds": "10–15 sec"
      },
      {
        "number": 114,
        "priority": "PREPARE",
        "question": "What is your final input size?",
        "answer": "The final ROI input size is 224 by 224 pixels.",
        "memory": "224 × 224",
        "seconds": "5–10 sec"
      },
      {
        "number": 115,
        "priority": "PREPARE",
        "question": "Why 224×224?",
        "answer": "It gives every image the same input size and matches the current model setup. It also keeps enough image detail without making the input too large.",
        "memory": "FIXED SIZE → DETAIL → COST",
        "seconds": "10–15 sec"
      },
      {
        "number": 116,
        "priority": "BACKUP",
        "question": "Which MediaPipe landmarks do you use?",
        "answer": "MediaPipe provides 21 landmarks. My two-knuckle ROI rule uses landmarks 1, 2, 5, and 17 to define the crop geometry.",
        "needsFact": "Check these landmark indices against the version of the ROI code you will discuss.",
        "memory": "21 LANDMARKS → 1, 2, 5, 17",
        "seconds": "10–15 sec"
      },
      {
        "number": 117,
        "priority": "BACKUP",
        "question": "How do you estimate hand orientation?",
        "answer": "I estimate the hand direction from its landmarks and use it to align the crop. I have also used PCA for orientation in the ROI workflow.",
        "needsFact": "Confirm whether PCA is in the current ROI pipeline or only an earlier version.",
        "memory": "LANDMARK DIRECTION → ALIGN",
        "seconds": "10–15 sec"
      },
      {
        "number": 118,
        "priority": "BACKUP",
        "question": "How is the ROI transformed/aligned?",
        "answer": "Selected landmarks define the hand geometry. Then I use a geometric or perspective transform to map the dorsal-hand area into a standard square crop.",
        "memory": "GEOMETRY → PERSPECTIVE → SQUARE",
        "seconds": "10–15 sec"
      },
      {
        "number": 119,
        "priority": "BACKUP",
        "question": "What happens if MediaPipe fails?",
        "answer": "I check the failed detection before trusting the crop. In the ROI workflow I have used YOLO-based fallbacks. If the crop is still unreliable, I flag the image for review.",
        "memory": "CHECK → FALLBACK → REVIEW",
        "seconds": "15–20 sec"
      },
      {
        "number": 120,
        "priority": "PREPARE",
        "question": "How do you evaluate ROI quality?",
        "answer": "I compare the crop with a reference region using overlap measures such as IoU. I also inspect failed or unusual crops. A high success rate alone does not prove that every crop is correct.",
        "memory": "REFERENCE → IOU → INSPECTION",
        "seconds": "15–20 sec"
      },
      {
        "number": 121,
        "priority": "BACKUP",
        "question": "What is IoU?",
        "answer": "IoU means Intersection over Union. It measures how much two regions overlap: overlap area divided by the total combined area. Higher IoU means better overlap.",
        "memory": "INTERSECTION ÷ UNION",
        "seconds": "10–15 sec"
      },
      {
        "number": 122,
        "priority": "PREPARE",
        "question": "What preprocessing do you actually use now?",
        "answer": "I kept the original preprocessing for the current baseline because the alternatives did not meet my full evaluation rule. I would check the run configuration before naming its exact normalization steps.",
        "needsFact": "Bring the exact preprocessing and normalization settings from the current baseline configuration.",
        "memory": "ORIGINAL BASELINE → CHECK CONFIG",
        "story": "failed-experiment",
        "seconds": "15–20 sec"
      },
      {
        "number": 123,
        "priority": "PREPARE",
        "question": "Did every preprocessing method improve performance?",
        "answer": "No. Some methods helped only certain folds or conditions and were not better overall. If the improvement was not consistent, I kept the stronger baseline.",
        "memory": "MIXED RESULTS → KEEP BASELINE",
        "story": "failed-experiment",
        "seconds": "10–15 sec"
      },
      {
        "number": 124,
        "priority": "PREPARE",
        "question": "Why can preprocessing make performance worse?",
        "answer": "Preprocessing can remove useful identity information, change the image too much, or help one condition while hurting another. More preprocessing does not always mean better performance.",
        "memory": "LOST FEATURES → UNEVEN EFFECTS",
        "story": "failed-experiment",
        "seconds": "10–15 sec"
      },
      {
        "number": 125,
        "priority": "PREPARE",
        "question": "What is a CNN?",
        "answer": "A CNN is a neural network that uses filters to learn local image patterns. Early layers can learn edges and textures, while later layers combine them into more useful features.",
        "memory": "FILTERS → LOCAL PATTERNS",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 126,
        "priority": "PREPARE",
        "question": "What is convolution?",
        "answer": "A filter moves across the image or feature map. At each position it combines nearby values using its weights. This creates a feature map that responds to patterns.",
        "memory": "FILTER → WEIGHTED VALUES → MAP",
        "seconds": "15–20 sec"
      },
      {
        "number": 127,
        "priority": "BACKUP",
        "question": "What is a feature map?",
        "answer": "A feature map is a grid of numbers created by a layer in the network. It shows where certain learned patterns are present in the input.",
        "memory": "GRID → LEARNED PATTERNS",
        "seconds": "10–15 sec"
      },
      {
        "number": 128,
        "priority": "BACKUP",
        "question": "What is pooling?",
        "answer": "Pooling summarizes values in a region, often by taking the maximum or average. It usually makes the feature map smaller and reduces computation. It can lose detail.",
        "memory": "MAX OR AVERAGE → SMALLER MAP",
        "seconds": "10–15 sec"
      },
      {
        "number": 129,
        "priority": "BACKUP",
        "question": "What is Batch Normalization?",
        "answer": "Batch Normalization uses batch statistics to normalize a layer's values during training, then applies a learned scale and offset. This can help training. At inference, the usual setup uses stored running statistics.",
        "note": "For a CNN, BatchNorm2d normally computes statistics per channel over the batch and spatial positions. With track_running_stats=False, evaluation also uses batch statistics.",
        "memory": "NORMALIZE → SCALE → RUNNING STATS",
        "seconds": "15–20 sec"
      },
      {
        "number": 130,
        "priority": "BACKUP",
        "question": "Training vs inference?",
        "answer": "Training updates the model weights using data and a loss function. Inference uses the trained model to process new data without changing the weights.",
        "memory": "TRAIN UPDATES → INFERENCE USES",
        "seconds": "10–15 sec"
      },
      {
        "number": 131,
        "priority": "PREPARE",
        "question": "What is overfitting?",
        "answer": "Overfitting means a model fits the training data too closely, including details that do not carry over to new data. Training results look good, but new-data results are worse.",
        "memory": "FITS TRAINING → FAILS NEW DATA",
        "seconds": "15–20 sec"
      },
      {
        "number": 132,
        "priority": "PREPARE",
        "question": "What is generalization?",
        "answer": "Generalization means the model can work well on new data or new conditions, not only on the data it saw during training.",
        "memory": "NEW DATA → NEW CONDITIONS",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 133,
        "priority": "PREPARE",
        "question": "Why is generalization important in your research?",
        "answer": "My main problem happens when capture sessions or conditions change. A useful verification model should still recognize the same person under those changes, so generalization is very important.",
        "memory": "CHANGED SESSIONS → STABLE MATCH",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 134,
        "priority": "PREPARE",
        "question": "What is genuine similarity?",
        "answer": "Genuine similarity is the similarity score between two samples from the same biometric identity.",
        "memory": "SAME IDENTITY → SCORE",
        "story": "session-gap",
        "seconds": "5–10 sec"
      },
      {
        "number": 135,
        "priority": "PREPARE",
        "question": "What is impostor similarity?",
        "answer": "Impostor similarity is the similarity score between samples from different identities.",
        "memory": "DIFFERENT IDENTITIES → SCORE",
        "story": "session-gap",
        "seconds": "5–10 sec"
      },
      {
        "number": 136,
        "priority": "PREPARE",
        "question": "What is FAR?",
        "answer": "FAR means False Accept Rate. It is the percentage of impostor attempts that are wrongly accepted.",
        "memory": "IMPOSTOR → WRONGLY ACCEPTED",
        "seconds": "5–10 sec"
      },
      {
        "number": 137,
        "priority": "PREPARE",
        "question": "What is FRR?",
        "answer": "FRR means False Reject Rate. It is the percentage of genuine attempts that are wrongly rejected.",
        "memory": "GENUINE → WRONGLY REJECTED",
        "seconds": "5–10 sec"
      },
      {
        "number": 138,
        "priority": "PREPARE",
        "question": "What is TAR?",
        "answer": "TAR means True Accept Rate. It is the percentage of genuine attempts that are correctly accepted at a chosen threshold.",
        "memory": "GENUINE → CORRECTLY ACCEPTED",
        "seconds": "10–15 sec"
      },
      {
        "number": 139,
        "priority": "PREPARE",
        "question": "What is EER?",
        "answer": "EER means Equal Error Rate. It is the error rate where false accepts and false rejects are equal, or approximately equal on measured data. Lower EER means fewer errors at that balance point.",
        "memory": "FAR = FRR → ERROR RATE",
        "seconds": "15–20 sec"
      },
      {
        "number": 140,
        "priority": "PREPARE",
        "question": "Why is lower EER better?",
        "answer": "A lower EER means the system makes fewer false accepts and false rejects at the balance point. It usually means the genuine and impostor scores are better separated.",
        "memory": "LOWER BALANCED ERROR",
        "seconds": "15–20 sec"
      },
      {
        "number": 141,
        "priority": "BACKUP",
        "question": "What does TAR@0.1% FAR mean?",
        "answer": "It is the percentage of genuine attempts accepted at a threshold chosen for a 0.1 percent false accept rate. It shows how many real users pass at that operating point.",
        "note": "0.1% means one false accept per 1,000 impostor attempts on average at that measured operating point. Deployment rates can change with the data.",
        "memory": "GENUINE ACCEPTS → 0.1% FAR",
        "seconds": "15–20 sec"
      },
      {
        "number": 142,
        "priority": "PREPARE",
        "question": "How is a threshold selected?",
        "answer": "For deployment, I choose a threshold on development data for the required false accept rate, then keep it fixed for testing. EER is a separate evaluation summary found by sweeping thresholds.",
        "memory": "DEVELOPMENT → FIX THRESHOLD → TEST",
        "seconds": "15–20 sec"
      },
      {
        "number": 143,
        "priority": "PREPARE",
        "question": "How are genuine and impostor pairs created?",
        "answer": "Genuine pairs use two samples from the same identity. Impostor pairs use samples from different identities. The exact pairing rules follow the dataset and evaluation protocol.",
        "memory": "SAME LABEL → DIFFERENT LABEL",
        "seconds": "10–15 sec"
      },
      {
        "number": 144,
        "priority": "PREPARE",
        "question": "How do you avoid data leakage?",
        "answer": "I keep test data out of training and tuning, follow the correct identity and session split rules, and avoid using final test results to choose model settings.",
        "memory": "TEST SEPARATE → NO TUNING",
        "seconds": "10–15 sec"
      },
      {
        "number": 145,
        "priority": "BACKUP",
        "question": "What are your train/development/test divisions?",
        "answer": "The exact split depends on the experiment. I need to check the current run configuration to give the correct training, development, and test counts.",
        "needsFact": "Add the exact current dataset split and pairing rules from the experiment configuration.",
        "memory": "CURRENT RUN → CHECK SPLIT",
        "seconds": "10–15 sec"
      },
      {
        "number": 146,
        "priority": "BACKUP",
        "question": "What loss does the current LAWNet setup use?",
        "answer": "I need to check the training configuration for that LAWNet run. I do not want to name a loss from my older model by mistake.",
        "needsFact": "Add the exact loss from the relevant training configuration.",
        "memory": "CURRENT RUN → CHECK LOSS",
        "seconds": "10–15 sec"
      },
      {
        "number": 147,
        "priority": "BACKUP",
        "question": "What optimizer?",
        "answer": "The frozen baseline evaluation does not update weights, so it uses no optimizer. For a training run, I would check the saved configuration before naming the optimizer.",
        "needsFact": "For training questions, add the optimizer and settings from that run; frozen evaluation has no optimizer.",
        "memory": "FROZEN → NO OPTIMIZER",
        "seconds": "10–15 sec"
      },
      {
        "number": 148,
        "priority": "BACKUP",
        "question": "Are the weights frozen, trained, or fine-tuned?",
        "answer": "It depends on the experiment. In the frozen LAWNet target evaluation, I use the pretrained model without updating the weights. Other reproduction or development runs can use different training settings.",
        "memory": "FROZEN RUN → NO WEIGHT UPDATES",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 149,
        "priority": "BACKUP",
        "question": "What is the current embedding dimension?",
        "answer": "I need to confirm the output size in the current LAWNet implementation. I do not want to quote the size from an older model.",
        "needsFact": "Check the current model output tensor and record its dimension.",
        "memory": "CHECK CURRENT OUTPUT SIZE",
        "seconds": "10–15 sec"
      },
      {
        "number": 150,
        "priority": "PREPARE",
        "question": "What is one verified baseline result you can defend?",
        "answer": "In the frozen LAWNet target evaluation, cross-session EER was about 14.57 percent. Same-session indoor EER was about 3.53 percent. The gap is the main problem I am studying.",
        "note": "User-supplied frozen target results: indoor 3.53%, outdoor 5.33%, cross-session 14.57% EER. These are not the published NTUST-IW results or a new-model improvement.",
        "memory": "FROZEN → 3.53% → 14.57%",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 151,
        "priority": "PREPARE",
        "question": "How much worse is cross-session than same-session?",
        "answer": "Cross-session EER is about 14.57%, compared with about 3.53% indoors and 5.33% outdoors for same-session testing. This large gap is why cross-session generalization is my main problem.",
        "memory": "3.53 / 5.33 → 14.57",
        "story": "session-gap",
        "seconds": "10–15 sec"
      },
      {
        "number": 152,
        "priority": "PREPARE",
        "question": "Why are you confident this is a real generalization issue?",
        "answer": "The same evaluation setup shows much worse same-person similarity and much higher error across sessions. This suggests the model has trouble keeping the same identity stable when capture conditions change.",
        "memory": "GENUINE SCORES DOWN → ERROR UP",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 153,
        "priority": "PREPARE",
        "question": "Did you solve the cross-session problem?",
        "answer": "No. I identified and measured the problem, and I am testing ways to improve it. I will not say it is solved until a new model shows a clear and repeatable improvement.",
        "memory": "MEASURED → NOT SOLVED",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 154,
        "priority": "BACKUP",
        "question": "What modification is only proposed versus already implemented?",
        "answer": "I have run preprocessing and architecture experiments. The final lightweight model is still being developed. I would check the experiment record before describing a specific change as implemented or verified.",
        "needsFact": "Prepare one actual implemented architecture change and its verified result; do not invent an improvement.",
        "memory": "IDEA → EXPERIMENT → VERIFIED RESULT",
        "story": "research",
        "seconds": "15–20 sec"
      }
    ]
  },
  {
    "id": "ase-role",
    "title": "E. ASE / Company / Why This Role",
    "subtitle": "Company knowledge and your transition from CS/AI to PTE.",
    "range": "Q155–Q179",
    "items": [
      {
        "number": 155,
        "priority": "CORE",
        "question": "What do you know about ASE?",
        "answer": "ASE is a major semiconductor packaging and testing company. It mainly works in the backend part of semiconductor manufacturing, including packaging and different stages of device testing.",
        "memory": "ASE → PACKAGING → TESTING",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 156,
        "priority": "PREPARE",
        "question": "What does ASE do?",
        "answer": "ASE provides semiconductor assembly, packaging, and testing services. It helps turn dies into usable packaged chips and tests whether the products meet the required specifications.",
        "memory": "ASSEMBLE → PROTECT → TEST",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 157,
        "priority": "PREPARE",
        "question": "What does OSAT mean?",
        "answer": "OSAT means Outsourced Semiconductor Assembly and Test. It refers to companies that provide packaging, assembly, and testing services for semiconductor products.",
        "memory": "OUTSOURCED ASSEMBLY AND TEST",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 158,
        "priority": "PREPARE",
        "question": "Where does ASE fit in the semiconductor supply chain?",
        "answer": "A simple flow is: chip design → wafer fabrication → wafer test → packaging → final test → customer. ASE is mainly strong in the backend packaging and testing stages.",
        "memory": "DESIGN → FAB → TEST → PACKAGE",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 159,
        "priority": "PREPARE",
        "question": "ASE vs TSMC—what is the difference?",
        "answer": "TSMC mainly fabricates circuits on wafers. ASE mainly focuses on backend packaging and testing. Both can work on advanced packaging, so there can be some overlap.",
        "memory": "TSMC FAB → ASE PACKAGE/TEST",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 160,
        "priority": "PREPARE",
        "question": "Why is semiconductor packaging important?",
        "answer": "A bare die is fragile and hard to use directly. Packaging protects it and gives it electrical, mechanical, and thermal connections so it can be used in a product.",
        "memory": "PROTECT → CONNECT → COOL",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 161,
        "priority": "PREPARE",
        "question": "Why is testing important?",
        "answer": "Testing checks whether a chip meets its electrical and functional requirements. It finds bad units, gives data for yield improvement, and helps protect product quality before shipment.",
        "memory": "SPECIFICATIONS → QUALITY → DATA",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 162,
        "priority": "PREPARE",
        "question": "Why ASE specifically?",
        "answer": "ASE's work includes wafer probing and final test, which are areas I want to learn. My research has trained me to compare data and investigate failures. I want to bring those skills to a real test team while learning its products and hardware.",
        "memory": "ASE TEST SERVICES → MY FIT",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 163,
        "priority": "PREPARE",
        "question": "Why PTE specifically?",
        "answer": "PTE combines test-data analysis with practical troubleshooting. In research, I already compare results and test possible causes of failure. I need to learn the semiconductor hardware, but the daily problem-solving work interests me.",
        "memory": "TEST DATA → DEBUG → HARDWARE LEARNING",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 164,
        "priority": "PREPARE",
        "question": "Why not a pure AI/ML job?",
        "answer": "I still like AI, but I do not want to limit myself to model development. I also enjoy using software and data to solve real engineering problems. PTE gives me that chance in a manufacturing environment.",
        "memory": "SOFTWARE → REAL ENGINEERING",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 165,
        "priority": "PREPARE",
        "question": "Why semiconductor after CS?",
        "answer": "Semiconductor testing uses a lot of data and software. My CS background gives me programming and analysis skills, and I want to combine those with new knowledge of test hardware and manufacturing.",
        "memory": "CS DATA → TEST HARDWARE",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 166,
        "priority": "PREPARE",
        "question": "How does your background transfer to PTE?",
        "answer": "My research trained me to check data, compare conditions, automate analysis in Python, investigate bad results, and test ideas step by step. PTE needs the same careful problem-solving style, even though the hardware domain is different.",
        "memory": "CHECK DATA → CONTROLLED TESTS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 167,
        "priority": "CORE",
        "question": "What do you know about a Product Test Engineer?",
        "answer": "A PTE monitors product test performance and yield, supports new-product and test-flow validation, investigates abnormal test results, analyzes test data, and follows problems with other engineering teams.",
        "memory": "YIELD → NPI → VALIDATE → DEBUG",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 168,
        "priority": "PREPARE",
        "question": "What does PTE do every day?",
        "answer": "The exact work depends on the team. Typical work includes checking yield and test data, investigating bad bins or trends, validating test changes or new products, and working with process, equipment, quality, or customer teams.",
        "memory": "CHECK → INVESTIGATE → COLLABORATE",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 169,
        "priority": "PREPARE",
        "question": "What parts of PTE interest you?",
        "answer": "I am most interested in test-data analysis, abnormal-yield investigation, validation, and debugging because they are close to the way I already solve research problems.",
        "memory": "DATA → FAILURES → VALIDATION",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 170,
        "priority": "CORE",
        "question": "What is your biggest gap for PTE?",
        "answer": "My main gap is hands-on semiconductor testing. I have not programmed ATE or worked in chip production. I need training in the product, tester, interface hardware, and test procedures.",
        "memory": "NO ATE EXPERIENCE → TRAINING",
        "story": "learning-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 171,
        "priority": "PREPARE",
        "question": "How will you close that gap?",
        "answer": "I would learn the product and test flow step by step, use company training, study the tester and device requirements, and ask experienced engineers focused questions. I would also connect what I learn to the test data I work with.",
        "memory": "PRODUCT → FLOW → TRAINING → PRACTICE",
        "story": "learning-gap",
        "seconds": "20–25 sec"
      },
      {
        "number": 172,
        "priority": "PREPARE",
        "question": "Why should we hire you over an EE graduate?",
        "answer": "An EE graduate may start with stronger electronics knowledge. My strength is different: Python, automation, data analysis, experiments, and software debugging. I can bring those skills while learning the hardware and test side.",
        "memory": "EE KNOWLEDGE → MY SOFTWARE SKILLS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 173,
        "priority": "PREPARE",
        "question": "Are you also interested in PE?",
        "answer": "Yes. I would consider a suitable Process Engineer role if it involves data-based process improvement and the training fits my background. PTE is still my first choice.",
        "memory": "SUITABLE PE → PTE FIRST",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 174,
        "priority": "PREPARE",
        "question": "Are you interested in EE?",
        "answer": "EE is not my first choice because it is more focused on equipment and hardware maintenance. I prefer PTE, and PE is my stronger backup. I would consider EE only if the actual role and training fit me well.",
        "memory": "EQUIPMENT ROLE → CHECK FIT",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 175,
        "priority": "PREPARE",
        "question": "Why is PTE your first choice?",
        "answer": "PTE is the closest match to my data and debugging skills. I like checking unusual results and finding why they changed. I want to build the hardware knowledge needed to do that in semiconductor testing.",
        "memory": "DATA SKILLS → HARDWARE LEARNING",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 176,
        "priority": "PREPARE",
        "question": "Why do you want to work in manufacturing instead of research only?",
        "answer": "I like research, but I also want to solve problems that affect real products and production. Manufacturing gives direct feedback from real data and needs practical problem solving.",
        "memory": "REAL PRODUCTS → PRACTICAL RESULTS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 177,
        "priority": "PREPARE",
        "question": "Are you comfortable working with hardware even though your degree is CS?",
        "answer": "Yes. I know I need to learn the test hardware and interfaces. I am comfortable learning how the physical system works so I can understand the data and troubleshoot problems correctly.",
        "memory": "LEARN HARDWARE → UNDERSTAND DATA",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 178,
        "priority": "PREPARE",
        "question": "Are you willing to learn electronics?",
        "answer": "Yes. I am already learning the basic electrical and semiconductor-test concepts. I expect to keep learning the specific electronics needed for the product and tester used by the team.",
        "memory": "BASIC ELECTRICAL → PRODUCT NEEDS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 179,
        "priority": "PREPARE",
        "question": "What do you hope to learn at ASE?",
        "answer": "I want to learn real semiconductor test flows, yield debugging, ATE and interface hardware, new-product introduction, and how engineers use test data to make production decisions.",
        "memory": "TEST FLOW → ATE → YIELD → NPI",
        "story": "role-fit",
        "seconds": "10–15 sec"
      }
    ]
  },
  {
    "id": "pte-core",
    "title": "F. PTE / Semiconductor Technical Core",
    "subtitle": "The minimum semiconductor knowledge for a CS candidate targeting Product Test Engineering.",
    "range": "Q180–Q224",
    "items": [
      {
        "number": 180,
        "priority": "CORE",
        "question": "What is a semiconductor wafer?",
        "answer": "A wafer is a thin disk of semiconductor material, usually silicon. Many chip dies are made on it before they are separated.",
        "memory": "WAFER → MANY DIES",
        "seconds": "10–15 sec"
      },
      {
        "number": 181,
        "priority": "CORE",
        "question": "What is a die?",
        "answer": "A die is one individual chip area made on a wafer.",
        "memory": "ONE CHIP AREA",
        "seconds": "5–10 sec"
      },
      {
        "number": 182,
        "priority": "PREPARE",
        "question": "Wafer vs die?",
        "answer": "The wafer is the whole silicon disk with many chips on it. One individual chip area on the wafer is called a die.",
        "memory": "WHOLE DISK → ONE DIE",
        "seconds": "10–15 sec"
      },
      {
        "number": 183,
        "priority": "CORE",
        "question": "What is a semiconductor package?",
        "answer": "A package protects the die and gives it electrical, mechanical, and thermal connections so the chip can be handled and used in a system.",
        "memory": "PROTECT → CONNECT → HEAT",
        "seconds": "10–15 sec"
      },
      {
        "number": 184,
        "priority": "PREPARE",
        "question": "Why package a die?",
        "answer": "A bare die is fragile and hard to connect directly. Packaging protects it and gives it usable connections to a board or system.",
        "memory": "FRAGILE DIE → USABLE CONNECTIONS",
        "seconds": "10–15 sec"
      },
      {
        "number": 185,
        "priority": "PREPARE",
        "question": "What is backend semiconductor manufacturing?",
        "answer": "Backend manufacturing usually means the stages after wafer fabrication, especially wafer testing, packaging or assembly, and final testing.",
        "memory": "AFTER FAB → ASSEMBLY/TEST",
        "seconds": "10–15 sec"
      },
      {
        "number": 186,
        "priority": "CORE",
        "question": "What is CP / wafer probing / wafer sort?",
        "answer": "It is electrical testing of dies while they are still on the wafer, before packaging. It helps find bad dies early and gives wafer-level yield information.",
        "memory": "DIES ON WAFER → ELECTRICAL TEST",
        "seconds": "10–15 sec"
      },
      {
        "number": 187,
        "priority": "PREPARE",
        "question": "Why test before packaging?",
        "answer": "Packaging costs time and money. Testing first can find bad dies early so less time and cost are spent on units that already fail.",
        "memory": "FIND BAD DIES → SAVE PACKAGING",
        "seconds": "10–15 sec"
      },
      {
        "number": 188,
        "priority": "CORE",
        "question": "What is FT / final test?",
        "answer": "Final Test checks a packaged chip's electrical and functional behavior against its requirements. It takes place after assembly.",
        "memory": "PACKAGED CHIP → REQUIREMENTS",
        "seconds": "10–15 sec"
      },
      {
        "number": 189,
        "priority": "PREPARE",
        "question": "Why test again after packaging?",
        "answer": "The chip has gone through more manufacturing steps and is now in its final package. Final Test checks that it still meets the required specifications and can find package-related problems.",
        "memory": "ASSEMBLY CHANGES → RETEST",
        "seconds": "15–20 sec"
      },
      {
        "number": 190,
        "priority": "CORE",
        "question": "CP vs FT?",
        "answer": "CP tests dies on the wafer before packaging. FT tests packaged chips after assembly. CP usually uses a prober and probe card, while FT commonly uses a handler, socket, and load board.",
        "memory": "CP WAFER → FT PACKAGE",
        "seconds": "15–20 sec"
      },
      {
        "number": 191,
        "priority": "PREPARE",
        "question": "What is a prober?",
        "answer": "A prober moves and positions the wafer so each die can make contact with the probe card during wafer testing.",
        "memory": "PROBER → POSITION WAFER",
        "seconds": "10–15 sec"
      },
      {
        "number": 192,
        "priority": "PREPARE",
        "question": "What is a probe card?",
        "answer": "A probe card is the temporary electrical connection between the tester and the small contacts on a die during wafer test.",
        "memory": "PROBE CARD → DIE CONTACT",
        "seconds": "10–15 sec"
      },
      {
        "number": 193,
        "priority": "PREPARE",
        "question": "What is a handler?",
        "answer": "A handler automatically moves packaged chips into and out of the test position during Final Test and can sort them by result.",
        "memory": "HANDLER → MOVE → SORT",
        "seconds": "10–15 sec"
      },
      {
        "number": 194,
        "priority": "PREPARE",
        "question": "What is a test socket?",
        "answer": "A test socket gives temporary electrical contact between a packaged chip and the test hardware during Final Test.",
        "memory": "SOCKET → PACKAGE CONTACT",
        "seconds": "10–15 sec"
      },
      {
        "number": 195,
        "priority": "PREPARE",
        "question": "What is a load board?",
        "answer": "A load board is the circuit board that connects the ATE tester to the socket and chip. It carries power, signals, and measurement paths.",
        "memory": "BOARD → TESTER TO CHIP",
        "seconds": "10–15 sec"
      },
      {
        "number": 196,
        "priority": "CORE",
        "question": "What is ATE?",
        "answer": "ATE means Automated Test Equipment. It sends controlled electrical signals to a device, measures the response, and checks whether the result is inside the required limits.",
        "memory": "ATE → APPLY → MEASURE → COMPARE",
        "seconds": "10–15 sec"
      },
      {
        "number": 197,
        "priority": "CORE",
        "question": "What is a DUT?",
        "answer": "DUT means Device Under Test. It is the die or packaged chip that is being tested.",
        "memory": "DUT → DEVICE UNDER TEST",
        "seconds": "5–10 sec"
      },
      {
        "number": 198,
        "priority": "PREPARE",
        "question": "What does ATE send to the device?",
        "answer": "Depending on the product, ATE can send power, voltage, current, timing, digital patterns, clocks, or other test signals.",
        "memory": "POWER → PATTERNS → SIGNALS",
        "seconds": "10–15 sec"
      },
      {
        "number": 199,
        "priority": "PREPARE",
        "question": "What does ATE measure?",
        "answer": "It measures the device response, such as voltage, current, timing, frequency, digital output, or functional behavior, and compares it with the test limits.",
        "memory": "RESPONSE → MEASURE → LIMITS",
        "seconds": "10–15 sec"
      },
      {
        "number": 200,
        "priority": "PREPARE",
        "question": "Why is automated testing needed?",
        "answer": "Chip production has very high volume. ATE makes testing fast, repeatable, consistent, and traceable, which would be very difficult to do manually.",
        "memory": "VOLUME → SPEED → REPEATABILITY",
        "seconds": "10–15 sec"
      },
      {
        "number": 201,
        "priority": "BACKUP",
        "question": "What are J750/V93K?",
        "answer": "J750 and V93000 are semiconductor ATE platforms from Teradyne and Advantest. I know their purpose, but I have not programmed or operated them.",
        "memory": "J750 / V93000 → NO HANDS-ON",
        "seconds": "10–15 sec"
      },
      {
        "number": 202,
        "priority": "CORE",
        "question": "What is a test program?",
        "answer": "A test program tells the tester what signals to apply, what to measure, what limits to use, and how to classify the result.",
        "memory": "SIGNALS → MEASUREMENTS → LIMITS",
        "seconds": "10–15 sec"
      },
      {
        "number": 203,
        "priority": "PREPARE",
        "question": "What is a test flow?",
        "answer": "A test flow is the order of tests and decision steps that a chip goes through during testing.",
        "memory": "TEST ORDER → DECISIONS",
        "seconds": "10–15 sec"
      },
      {
        "number": 204,
        "priority": "PREPARE",
        "question": "Test program vs test flow?",
        "answer": "The test program contains the test logic, measurements, limits, and controls. The test flow is the order in which those tests are run.",
        "memory": "PROGRAM CONTENT → FLOW ORDER",
        "seconds": "10–15 sec"
      },
      {
        "number": 205,
        "priority": "CORE",
        "question": "What is yield?",
        "answer": "Yield is the percentage of tested units that pass. For example, 950 passing devices out of 1,000 gives 95 percent yield.",
        "memory": "PASS ÷ TOTAL × 100",
        "seconds": "10–15 sec"
      },
      {
        "number": 206,
        "priority": "PREPARE",
        "question": "If 9,500 out of 10,000 devices pass, what is the yield?",
        "answer": "The yield is 95% because 9,500 divided by 10,000 is 0.95.",
        "memory": "9,500 ÷ 10,000 → 95%",
        "seconds": "5–10 sec"
      },
      {
        "number": 207,
        "priority": "CORE",
        "question": "What is binning?",
        "answer": "Binning puts chips or test results into groups based on pass or fail reason, or on performance.",
        "memory": "GROUP RESULTS → PASS/FAIL/PERFORMANCE",
        "seconds": "10–15 sec"
      },
      {
        "number": 208,
        "priority": "PREPARE",
        "question": "What are pass and fail bins?",
        "answer": "Pass bins group units that meet the requirements. Fail bins group failed units by the test program's rules. A bin is a clue for investigation, not proof of the physical cause.",
        "memory": "BIN RULES → CLUES, NOT CAUSE",
        "seconds": "15–20 sec"
      },
      {
        "number": 209,
        "priority": "CORE",
        "question": "What is NPI?",
        "answer": "NPI means New Product Introduction. It is the process of bringing a new product into manufacturing and testing, and making sure the test setup and flow work correctly.",
        "memory": "NEW PRODUCT → READY FOR PRODUCTION",
        "seconds": "15–20 sec"
      },
      {
        "number": 210,
        "priority": "PREPARE",
        "question": "Why does NPI matter?",
        "answer": "A new product needs a stable and correct test setup before high-volume production. NPI helps find test, program, interface, and manufacturing problems early.",
        "memory": "STABLE SETUP → EARLY CHECKS",
        "seconds": "10–15 sec"
      },
      {
        "number": 211,
        "priority": "PREPARE",
        "question": "What does abnormal yield mean?",
        "answer": "It means the pass rate or failure pattern changed unexpectedly from normal and needs investigation.",
        "memory": "UNEXPECTED PASS RATE OR PATTERN",
        "seconds": "5–10 sec"
      },
      {
        "number": 212,
        "priority": "CORE",
        "question": "If yield suddenly drops from 97% to 82%, what do you do?",
        "answer": "First, I would confirm the data and the yield calculation. Then I would find when the drop started and compare lots, wafers, testers, sites, and failure bins. I would check recent changes and test likely causes with the responsible engineers. After an approved fix, I would confirm recovery and keep monitoring. I would not loosen limits just to raise yield.",
        "memory": "CONFIRM → GROUP → TEST → VERIFY",
        "seconds": "30–35 sec"
      },
      {
        "number": 213,
        "priority": "PREPARE",
        "question": "What data would you check first?",
        "answer": "I would start with the yield calculation, sample count, time of the change, and failure bins. Then I would compare lots, wafers, testers, sites, and program versions to find where the drop is concentrated.",
        "memory": "DATA → TIME → BINS → GROUPS",
        "seconds": "15–20 sec"
      },
      {
        "number": 214,
        "priority": "PREPARE",
        "question": "Would you check product/lot/wafer?",
        "answer": "Yes. This helps show whether the problem is limited to one product, lot, or wafer, or whether it affects a wider group.",
        "memory": "PRODUCT → LOT → WAFER SCOPE",
        "seconds": "10–15 sec"
      },
      {
        "number": 215,
        "priority": "PREPARE",
        "question": "Would you compare tester and test site?",
        "answer": "Yes. If one tester or one site has much lower yield, the problem may be related to tester setup, calibration, contact, or that site instead of the whole product.",
        "memory": "TESTER/SITE GAP → SETUP CLUE",
        "seconds": "15–20 sec"
      },
      {
        "number": 216,
        "priority": "PREPARE",
        "question": "Why examine failure bins?",
        "answer": "Bins show which result groups increased. They help narrow the investigation, although one bin can contain failures with different causes.",
        "memory": "CHANGED BINS → NARROW SEARCH",
        "seconds": "10–15 sec"
      },
      {
        "number": 217,
        "priority": "PREPARE",
        "question": "Why check test-program version?",
        "answer": "A new program or test-limit change can create a sudden yield change. Checking the version history helps show whether the problem started after a software or test-flow change.",
        "memory": "VERSION CHANGE → TIMING CLUE",
        "seconds": "15–20 sec"
      },
      {
        "number": 218,
        "priority": "PREPARE",
        "question": "Why check probe/socket/contact issues?",
        "answer": "Poor electrical contact can make a good chip look bad. If failures happen mainly on one site or interface, I would check the probe card, socket, load board, and contact condition.",
        "memory": "POOR CONTACT → FALSE FAILURE",
        "seconds": "15–20 sec"
      },
      {
        "number": 219,
        "priority": "PREPARE",
        "question": "Why check recent changes?",
        "answer": "Recent changes give clues about when the problem began. I would check software, setup, hardware, and material changes, then test the suspected link. Timing alone does not prove the cause.",
        "memory": "RECENT CHANGE → TEST THE LINK",
        "seconds": "15–20 sec"
      },
      {
        "number": 220,
        "priority": "CORE",
        "question": "Why shouldn’t you immediately loosen test limits?",
        "answer": "Because the yield drop may be a real product or test problem. Loosening the limits without evidence could let bad chips pass. I would first find the cause and follow the approved process.",
        "memory": "DO NOT HIDE FAILURES",
        "seconds": "15–20 sec"
      },
      {
        "number": 221,
        "priority": "PREPARE",
        "question": "How would Python/data analysis help PTE?",
        "answer": "Python can help clean test data, calculate yield, group results by lot, tester, site, or bin, show trends, compare before and after changes, and create repeatable reports.",
        "memory": "CLEAN → GROUP → PLOT → REPORT",
        "seconds": "10–15 sec"
      },
      {
        "number": 222,
        "priority": "PREPARE",
        "question": "How could you analyze yield by tester/site/lot?",
        "answer": "I would load the test data, group it by tester, site, or lot, calculate pass count, total count, and yield for each group, compare the groups over time, and flag unusual differences.",
        "memory": "COUNTS → GROUP YIELD → TRENDS",
        "seconds": "15–20 sec"
      },
      {
        "number": 223,
        "priority": "PREPARE",
        "question": "What does root-cause analysis mean to you?",
        "answer": "It means finding the real reason behind a problem instead of only treating the visible symptom. I use data, comparisons, and tests to confirm the suspected cause.",
        "memory": "CAUSE → EVIDENCE → CONFIRM",
        "seconds": "10–15 sec"
      },
      {
        "number": 224,
        "priority": "PREPARE",
        "question": "How would you verify that a corrective action actually worked?",
        "answer": "I would compare the same key results before and after the change, use enough samples, check that the original failure is gone, and make sure the change did not create a new problem. Then I would keep monitoring it.",
        "memory": "BEFORE/AFTER → NO NEW FAILURE",
        "seconds": "20–25 sec"
      }
    ]
  }
];
