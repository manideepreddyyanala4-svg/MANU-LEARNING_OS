import type { InterviewCategory } from './types';

export const interviewCategoriesPart4: InterviewCategory[] = [
  {
    "id": "language",
    "title": "J. Language / International-Student Questions",
    "subtitle": "Short, honest answers for English, Mandarin, and communication fit.",
    "range": "Q316–Q329",
    "items": [
      {
        "number": 316,
        "priority": "CORE",
        "question": "How good is your Chinese?",
        "answer": "My Mandarin is still basic. I can handle simple daily communication and introductions, but technical discussion is still difficult for me in Chinese. I can explain technical work more clearly in English, and I am continuing to study Mandarin.",
        "memory": "BASIC MANDARIN → TECHNICAL ENGLISH",
        "story": "availability",
        "seconds": "20–25 sec"
      },
      {
        "number": 317,
        "priority": "PREPARE",
        "question": "Do you have Chinese B1?",
        "answer": "No. My Mandarin is basic, around A1 or A2 level. I do not have B1 certification.",
        "memory": "A1/A2 → NO B1 CERTIFICATE",
        "story": "availability",
        "seconds": "5–10 sec"
      },
      {
        "number": 318,
        "priority": "PREPARE",
        "question": "Do you have a TOEIC score?",
        "answer": "My English-test status is [test name and exact score, or no score]. I can also explain my research in English during this interview.",
        "needsFact": "Confirm whether you have a TOEIC or other official English score; no score is assumed.",
        "memory": "CONFIRM SCORE → SHOW ENGLISH",
        "story": "availability",
        "seconds": "Time after filling facts"
      },
      {
        "number": 319,
        "priority": "PREPARE",
        "question": "Can you communicate at work in Chinese?",
        "answer": "I can handle simple daily Chinese. For technical details, I would use English, written information, and translation support when needed. I would also confirm that I understood the instruction correctly.",
        "memory": "SIMPLE CHINESE → CONFIRM TECHNICAL DETAILS",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 320,
        "priority": "CORE",
        "question": "What will you do if you do not understand a Chinese instruction?",
        "answer": "I would not guess. I would ask the person to repeat more slowly, use English or writing if needed, and repeat back what I understood before I act.",
        "memory": "DO NOT GUESS → REPEAT BACK",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 321,
        "priority": "PREPARE",
        "question": "Can you work using English?",
        "answer": "Yes. I use English for research papers, coding documentation, presentations, and most technical learning. I can explain my project and technical reasoning in English.",
        "memory": "PAPERS → CODE → ENGLISH",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 322,
        "priority": "PREPARE",
        "question": "Can you introduce yourself in English?",
        "answer": "I am Manideep Reddy from India, studying for my Master's in CSIE at Asia University. My research uses hand photos to check identity. I write code, run experiments, and analyze the results. I am interested in PTE because I want to use my Python and debugging skills in semiconductor testing.",
        "memory": "NAME → STUDY → RESEARCH → PTE",
        "story": "introduction",
        "seconds": "25–30 sec"
      },
      {
        "number": 323,
        "priority": "PREPARE",
        "question": "Can you explain your research in English?",
        "answer": "Yes. My research checks whether two RGB images of the back of a hand belong to the same person. I work on extracting a stable hand region, testing a lightweight model, and studying why performance becomes worse across different capture sessions. I am now testing ways to improve that generalization.",
        "memory": "HAND MATCHING → CONDITIONS → IMPROVE",
        "story": "research",
        "seconds": "25–30 sec"
      },
      {
        "number": 324,
        "priority": "PREPARE",
        "question": "Can you introduce yourself in Chinese?",
        "answer": "您好，我叫 Manideep，來自印度。目前我在亞洲大學讀資訊工程碩士。我的研究是電腦視覺和手部影像辨識。我的中文還在學習，謝謝。",
        "note": "Say it slowly. Do not add difficult Chinese you cannot understand.",
        "memory": "姓名 → 印度 → 亞洲大學 → 研究",
        "story": "availability",
        "seconds": "15–30 sec (practice aloud)"
      },
      {
        "number": 325,
        "priority": "PREPARE",
        "question": "Can you explain your research area in simple Chinese?",
        "answer": "我的研究是電腦視覺和手部影像辨識。我使用影像和人工智慧來比較是不是同一個人。",
        "note": "Meaning: My research is computer vision and hand-image recognition. I use images and AI to compare whether it is the same person.",
        "memory": "電腦視覺 → 手部影像 → 比較",
        "story": "availability",
        "seconds": "15–30 sec (practice aloud)"
      },
      {
        "number": 326,
        "priority": "PREPARE",
        "question": "How are you improving your Mandarin?",
        "answer": "I am working on practical Mandarin for daily life and common workplace instructions. I still need support for detailed technical discussions.",
        "needsFact": "Add your actual study method or frequency only if true.",
        "memory": "PRACTICAL MANDARIN → KEEP LEARNING",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 327,
        "priority": "PREPARE",
        "question": "What would you say if you need the interviewer to repeat the question?",
        "answer": "I can say: “不好意思，可以說慢一點，再說一次嗎？” Or in English: “Sorry, could you please repeat that a little more slowly?”",
        "memory": "REPEAT → MORE SLOWLY",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 328,
        "priority": "PREPARE",
        "question": "What would you do if a coworker speaks only Chinese?",
        "answer": "I would use simple Chinese, ask for written instructions, and repeat back what I understood. For technical or safety details, I would get help from an approved bilingual colleague before acting.",
        "memory": "SIMPLE WORDS → APPROVED HELP → CONFIRM",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 329,
        "priority": "PREPARE",
        "question": "Are you willing to take company language training?",
        "answer": "Yes. I would be happy to take company language training because better workplace Mandarin would help me communicate more independently with the team.",
        "memory": "LANGUAGE TRAINING → MORE INDEPENDENT",
        "story": "availability",
        "seconds": "10–15 sec"
      }
    ]
  },
  {
    "id": "truth-traps",
    "title": "K. Questions Designed to Catch Overclaiming",
    "subtitle": "These protect you from resume/research contradictions. Truthfulness is the priority.",
    "range": "Q330–Q345",
    "items": [
      {
        "number": 330,
        "priority": "CORE",
        "question": "Did you invent LAWNet?",
        "answer": "No. LAWNet is a published model by other researchers. I reproduce and test it as a baseline for my own research.",
        "memory": "EXISTING MODEL → MY BASELINE",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 331,
        "priority": "PREPARE",
        "question": "Did you design MediaPipe?",
        "answer": "No. MediaPipe is an existing Google framework. I use its hand landmarks inside my own ROI extraction and alignment pipeline.",
        "memory": "GOOGLE TOOL → MY ROI CODE",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 332,
        "priority": "PREPARE",
        "question": "Did you collect the entire dataset yourself?",
        "answer": "No. Data collection was a team effort. I took part in the collection, but I would not claim that I collected the whole dataset alone.",
        "memory": "TEAM COLLECTION → MY PARTICIPATION",
        "story": "teamwork",
        "seconds": "10–15 sec"
      },
      {
        "number": 333,
        "priority": "PREPARE",
        "question": "Did you implement the entire project yourself?",
        "answer": "I personally handled the coding, experiments, evaluation, and analysis for my assigned research work. But the broader project is supervised by my advisor, data collection was shared by the team, and I use existing tools and models such as MediaPipe and LAWNet.",
        "memory": "MY TECHNICAL WORK → SHARED PROJECT",
        "story": "contribution",
        "seconds": "20–25 sec"
      },
      {
        "number": 334,
        "priority": "CORE",
        "question": "Has your new model already been completed?",
        "answer": "No. I have run model experiments, but my final lightweight model is still being developed.",
        "memory": "EXPERIMENTS → MODEL NOT FINAL",
        "story": "research",
        "seconds": "5–10 sec"
      },
      {
        "number": 335,
        "priority": "PREPARE",
        "question": "Has it improved EER?",
        "answer": "I cannot claim that yet. I will only claim an improvement after a completed and controlled experiment shows it clearly.",
        "memory": "NO FINAL IMPROVEMENT CLAIM",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 336,
        "priority": "PREPARE",
        "question": "Can you prove that lighting caused your cross-session drop?",
        "answer": "No. Lighting is a possible factor, but the results do not prove it is the cause. Alignment, hand position, and other capture changes may also affect the model.",
        "memory": "POSSIBLE LIGHTING → NO PROOF",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 337,
        "priority": "PREPARE",
        "question": "Is your conference paper already published?",
        "answer": "The status I can confirm is accepted for conference presentation. I need to check the proceedings before calling it published.",
        "needsFact": "Confirm acceptance/presentation/publication status and venue before the interview.",
        "memory": "ACCEPTED → CHECK PUBLICATION",
        "seconds": "10–15 sec"
      },
      {
        "number": 338,
        "priority": "PREPARE",
        "question": "Does accepted mean presented?",
        "answer": "No. Accepted means the work has been accepted. Presented means the presentation has already happened. They are not the same.",
        "memory": "ACCEPTED ≠ PRESENTED",
        "seconds": "10–15 sec"
      },
      {
        "number": 339,
        "priority": "BACKUP",
        "question": "Is ONNX your current thesis model?",
        "answer": "No. ONNX is a format for exchanging models, not a neural-network architecture. I used it in an earlier local inference prototype.",
        "memory": "ONNX FORMAT → NOT ARCHITECTURE",
        "seconds": "10–15 sec"
      },
      {
        "number": 340,
        "priority": "BACKUP",
        "question": "Is MobileNetV3 still your current model?",
        "answer": "No. MobileNetV3 was earlier work. LAWNet is my current main lightweight baseline, and my own sub-0.6M model direction is still under development.",
        "memory": "OLD MOBILENET → LAWNET BASELINE",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 341,
        "priority": "PREPARE",
        "question": "Does “314 identities” mean 314 people?",
        "answer": "Not automatically. I say 314 biometric identities. The exact relation between identity, person, and hand side depends on the dataset definition, so I do not change “identity” into “person” without checking.",
        "memory": "IDENTITIES ≠ AUTOMATICALLY PEOPLE",
        "seconds": "15–20 sec"
      },
      {
        "number": 342,
        "priority": "PREPARE",
        "question": "Are all your reported numbers from the same experiment?",
        "answer": "No. I have results from different datasets and experiments. I always say which protocol the number comes from so I do not mix results from different tests.",
        "memory": "DIFFERENT RUNS → LABEL NUMBERS",
        "seconds": "10–15 sec"
      },
      {
        "number": 343,
        "priority": "BACKUP",
        "question": "Why are some old results different from the results you use now?",
        "answer": "Because they came from different models, datasets, versions, splits, or test methods. The project changed over time, so I always explain which experiment a number belongs to.",
        "memory": "VERSION/SPLIT/MODEL → DIFFERENT RESULTS",
        "seconds": "10–15 sec"
      },
      {
        "number": 344,
        "priority": "BACKUP",
        "question": "Which results should I trust?",
        "answer": "For my current research, I use the verified results from the current main protocol and clearly name the test condition. Older results are useful history, but I do not mix them with the current headline results.",
        "memory": "CURRENT VERIFIED RUN → CONDITIONS",
        "seconds": "15–20 sec"
      },
      {
        "number": 345,
        "priority": "CORE",
        "question": "What did YOU implement versus reuse from existing code/papers?",
        "answer": "I used the published LAWNet architecture and MediaPipe landmarks. I wrote the project-specific image-processing and evaluation code, ran experiments, and analyzed the results. Data collection was shared by the team, under my advisor's supervision.",
        "memory": "REUSED MODEL → MY PIPELINE → TEAM DATA",
        "story": "contribution",
        "seconds": "15–20 sec"
      }
    ]
  },
  {
    "id": "simple-questions",
    "title": "L. Very Simple Questions People Forget",
    "subtitle": "Short personal facts and everyday questions. Keep them direct.",
    "range": "Q346–Q370",
    "items": [
      {
        "number": 346,
        "priority": "PREPARE",
        "question": "What is your full name?",
        "answer": "My full name is Yanala Manideep Reddy.",
        "memory": "YANALA MANIDEEP REDDY",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 347,
        "priority": "PREPARE",
        "question": "Where are you from?",
        "answer": "I am from Telangana, India.",
        "memory": "TELANGANA → INDIA",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 348,
        "priority": "PREPARE",
        "question": "How long have you been in Taiwan?",
        "answer": "I came to Taiwan in September 2025, so by the interview I have been here for a little over one year.",
        "memory": "SEPTEMBER 2025 → OVER ONE YEAR",
        "story": "introduction",
        "seconds": "10–15 sec"
      },
      {
        "number": 349,
        "priority": "PREPARE",
        "question": "Where do you currently live?",
        "answer": "I currently live in Taichung while studying at Asia University.",
        "memory": "TAICHUNG → ASIA UNIVERSITY",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 350,
        "priority": "PREPARE",
        "question": "Are you comfortable moving away from Taichung?",
        "answer": "Yes. Taichung is convenient while I study, but I am open to moving within Taiwan for the right technical role.",
        "memory": "OPEN TO MOVE → TECHNICAL FIT",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 351,
        "priority": "PREPARE",
        "question": "What degree are you doing?",
        "answer": "I am doing an M.S. in Computer Science and Information Engineering.",
        "memory": "MS → CSIE",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 352,
        "priority": "PREPARE",
        "question": "Which year are you in?",
        "answer": "I started my Master’s in September 2025, so I am currently in my second academic year.",
        "memory": "STARTED 2025 → SECOND YEAR",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 353,
        "priority": "PREPARE",
        "question": "When exactly do you graduate?",
        "answer": "My current expected graduation is July 2027.",
        "memory": "EXPECTED JULY 2027",
        "story": "availability",
        "seconds": "5–10 sec"
      },
      {
        "number": 354,
        "priority": "PREPARE",
        "question": "Why did you choose Computer Science?",
        "answer": "I chose Computer Science because I wanted to understand how software and data can solve practical problems.",
        "memory": "SOFTWARE → DATA → REAL PROBLEMS",
        "seconds": "10–15 sec"
      },
      {
        "number": 355,
        "priority": "PREPARE",
        "question": "Why did you choose AI/ML?",
        "answer": "I became interested in how models can learn useful patterns from data instead of using only fixed rules. That interest later led me to computer vision research.",
        "memory": "LEARN PATTERNS → COMPUTER VISION",
        "seconds": "10–15 sec"
      },
      {
        "number": 356,
        "priority": "PREPARE",
        "question": "Why did you choose your research topic?",
        "answer": "It gave me a practical computer-vision problem with both image-processing and machine-learning challenges. I also liked that I could measure the results clearly with verification metrics.",
        "memory": "IMAGE PROCESSING → MEASURABLE RESULTS",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 357,
        "priority": "PREPARE",
        "question": "Which course did you like most?",
        "answer": "My favorite course was [actual course]. I liked it because [one real reason or example].",
        "needsFact": "Choose your real favorite course.",
        "memory": "REAL COURSE → REAL REASON",
        "seconds": "Time after filling facts"
      },
      {
        "number": 358,
        "priority": "PREPARE",
        "question": "Which course was hardest?",
        "answer": "I found [actual course] hardest because [reason]. I improved by [real action].",
        "needsFact": "Choose a real difficult course and improvement step.",
        "memory": "REAL CHALLENGE → ACTION",
        "seconds": "Time after filling facts"
      },
      {
        "number": 359,
        "priority": "PREPARE",
        "question": "Which project taught you the most?",
        "answer": "My current dorsal-hand research taught me the most because it needs coding, experiment design, debugging, repeatable evaluation, and clear explanation of results.",
        "memory": "DORSAL RESEARCH → FULL WORKFLOW",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 360,
        "priority": "PREPARE",
        "question": "What are you learning right now?",
        "answer": "Right now I am learning the PTE and semiconductor-test basics most relevant to ASE, while continuing my lightweight biometric-verification research.",
        "memory": "PTE BASICS → LIGHTWEIGHT RESEARCH",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 361,
        "priority": "PREPARE",
        "question": "What position do you prefer: PTE, PE, or EE?",
        "answer": "PTE is my first choice because it fits my data-analysis and debugging skills. I would also consider a suitable Process Engineer role with training.",
        "memory": "PTE FIRST → SUITABLE PE",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 362,
        "priority": "PREPARE",
        "question": "If PTE is unavailable, would you consider PE?",
        "answer": "Yes. I would consider a PE role if it includes process improvement, data analysis, and suitable training. PTE is still my first choice.",
        "memory": "PE POSSIBLE → DATA/TRAINING FIT",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 363,
        "priority": "PREPARE",
        "question": "What kind of team would you like to join?",
        "answer": "I would like a team where new engineers get clear training, can ask questions, and slowly take ownership of real problems. I also value teams that use data and documentation to make decisions.",
        "memory": "TRAINING → OWNERSHIP → DATA",
        "seconds": "15–20 sec"
      },
      {
        "number": 364,
        "priority": "PREPARE",
        "question": "Are you comfortable asking for help?",
        "answer": "Yes. I first try to understand the problem and collect useful information. Then I ask a focused question instead of staying blocked or guessing.",
        "memory": "COLLECT FACTS → FOCUSED QUESTION",
        "story": "teamwork",
        "seconds": "10–15 sec"
      },
      {
        "number": 365,
        "priority": "PREPARE",
        "question": "Do you prefer working alone or in a team?",
        "answer": "I can work independently on coding or analysis, but engineering problems usually need teamwork. I prefer clear personal responsibility with regular communication with the team.",
        "memory": "INDEPENDENT TASKS → TEAM COMMUNICATION",
        "story": "teamwork",
        "seconds": "10–15 sec"
      },
      {
        "number": 366,
        "priority": "PREPARE",
        "question": "How quickly can you learn new tools?",
        "answer": "I learn best by first understanding what the tool is for, then reading the documentation and trying a small real task. I used the same approach when learning new tools for my biometric research.",
        "memory": "PURPOSE → DOCS → SMALL TASK",
        "story": "strength",
        "seconds": "15–20 sec"
      },
      {
        "number": 367,
        "priority": "BACKUP",
        "question": "What motivates you?",
        "answer": "I am motivated by clear progress: understanding why something failed, improving it, and seeing the change in the data or system result.",
        "memory": "UNDERSTAND FAILURE → SEE PROGRESS",
        "story": "strength",
        "seconds": "10–15 sec"
      },
      {
        "number": 368,
        "priority": "BACKUP",
        "question": "What frustrates you?",
        "answer": "Repeated unclear problems can be frustrating, but I try to turn them into a clear process: define the problem, collect evidence, and focus on what I can control.",
        "memory": "UNCLEAR PROBLEM → CLEAR STEPS",
        "seconds": "15–20 sec"
      },
      {
        "number": 369,
        "priority": "BACKUP",
        "question": "Describe your personality.",
        "answer": "I am analytical and persistent. I like to understand problems properly, but I am also learning not to spend too much time on small details when a practical decision is needed.",
        "memory": "ANALYTICAL → PERSISTENT → PRACTICAL",
        "story": "strength",
        "seconds": "15–20 sec"
      },
      {
        "number": 370,
        "priority": "BACKUP",
        "question": "How would your professor describe you?",
        "answer": "I hope my professor would describe me as willing to learn and careful with experiments. I cannot speak for them, but I can explain the work I have done.",
        "memory": "MY EVIDENCE → NOT PROFESSOR'S QUOTE",
        "seconds": "15–20 sec"
      }
    ]
  },
  {
    "id": "closing",
    "title": "M. Final Questions They May Ask at the End",
    "subtitle": "Close professionally and stay consistent with what you said earlier.",
    "range": "Q371–Q379",
    "items": [
      {
        "number": 371,
        "priority": "CORE",
        "question": "Do you have any questions for us?",
        "answer": "Yes. What would a new PTE in this team work on during the first few months?",
        "memory": "ASK ABOUT FIRST MONTHS",
        "seconds": "5–10 sec"
      },
      {
        "number": 372,
        "priority": "PREPARE",
        "question": "Is there anything else you would like us to know?",
        "answer": "My background is different from a traditional EE candidate, but I am serious about learning semiconductor testing. I believe my Python, data-analysis, experiment, and debugging skills can be useful to the team.",
        "memory": "DATA SKILLS → READY TO LEARN",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 373,
        "priority": "PREPARE",
        "question": "Do you understand the job?",
        "answer": "My understanding is that PTE works with product test results, yield, data analysis, validation, abnormal-result investigation, and problem tracking with other teams. I also know the exact daily work depends on the product and team.",
        "memory": "YIELD → VALIDATION → TEAM WORK",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 374,
        "priority": "PREPARE",
        "question": "Are you still interested after hearing the job description?",
        "answer": "Yes. The test-data, troubleshooting, and validation parts are exactly what interest me. I am also willing to learn the hardware and semiconductor-test side.",
        "memory": "TEST DATA → LEARN HARDWARE",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 375,
        "priority": "PREPARE",
        "question": "Are you okay with the location?",
        "answer": "Yes. I am open to moving for the right PTE opportunity. I would plan the move around the confirmed joining date and my student or graduation schedule.",
        "memory": "MOVE → JOINING DATE",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 376,
        "priority": "PREPARE",
        "question": "Are you okay with the work schedule?",
        "answer": "I am open to discussing the actual team schedule, including shift or overtime needs. Before graduation, I also need to follow the legal work limits for international students.",
        "memory": "ACTUAL SCHEDULE → STUDENT LIMITS",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 377,
        "priority": "PREPARE",
        "question": "When can you give us a final decision if selected?",
        "answer": "I would reply quickly after I receive the written role details, location, work arrangement, and joining date. I would make sure the arrangement fits my graduation and student status.",
        "memory": "WRITTEN DETAILS → QUICK REPLY",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 378,
        "priority": "BACKUP",
        "question": "Is there anything on your resume we did not discuss?",
        "answer": "One point is that our research has been accepted for a conference presentation. It gave me practice explaining technical work and checking that my claims match the results.",
        "memory": "ACCEPTED WORK → CLEAR EXPLANATION",
        "seconds": "15–20 sec"
      },
      {
        "number": 379,
        "priority": "BACKUP",
        "question": "Do you have any concerns about this position?",
        "answer": "My main learning area is semiconductor-test hardware because my background is CS. I see it as a learning challenge, not a reason not to apply. I would like to understand the training available for new PTEs.",
        "memory": "HARDWARE GAP → ASK TRAINING",
        "story": "learning-gap",
        "seconds": "15–20 sec"
      }
    ]
  },
  {
    "id": "your-questions",
    "title": "N. Questions YOU Should Be Ready to Ask",
    "subtitle": "Choose only 1–3. These are not questions to fire at the interviewer all at once.",
    "range": "Q380–Q388",
    "items": [
      {
        "number": 380,
        "priority": "CORE",
        "question": "What would a new Product Test Engineer in this team usually work on during the first three months?",
        "answer": "What would a new Product Test Engineer in this team usually work on during the first three months?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "FIRST THREE MONTHS?",
        "seconds": "10–15 sec"
      },
      {
        "number": 381,
        "priority": "PREPARE",
        "question": "What technical training is provided to new graduates entering the test team?",
        "answer": "What technical training is provided to new graduates entering the test team?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "NEW-GRADUATE TRAINING?",
        "seconds": "5–10 sec"
      },
      {
        "number": 382,
        "priority": "PREPARE",
        "question": "For someone coming from a CS background, which technical area would you recommend I strengthen first?",
        "answer": "For someone coming from a CS background, which technical area would you recommend I strengthen first?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "CS BACKGROUND → FIRST SKILL?",
        "seconds": "5–10 sec"
      },
      {
        "number": 383,
        "priority": "PREPARE",
        "question": "How much of this role focuses on test-data analysis versus equipment/test-program work?",
        "answer": "How much of this role focuses on test-data analysis versus equipment/test-program work?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "DATA VS HARDWARE/PROGRAM?",
        "seconds": "5–10 sec"
      },
      {
        "number": 384,
        "priority": "PREPARE",
        "question": "What does success look like for a new PTE during the first six months?",
        "answer": "What does success look like for a new PTE during the first six months?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "SUCCESS AFTER SIX MONTHS?",
        "seconds": "5–10 sec"
      },
      {
        "number": 385,
        "priority": "PREPARE",
        "question": "Which skills distinguish the strongest PTEs in your team?",
        "answer": "Which skills distinguish the strongest PTEs in your team?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "STRONG PTE SKILLS?",
        "seconds": "5–10 sec"
      },
      {
        "number": 386,
        "priority": "CORE",
        "question": "What language is mainly used within this team for technical communication?",
        "answer": "What language is mainly used within this team for technical communication?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "TECHNICAL TEAM LANGUAGE?",
        "story": "availability",
        "seconds": "5–10 sec"
      },
      {
        "number": 387,
        "priority": "CORE",
        "question": "For a July 2027 graduate, what joining arrangement would apply if selected?",
        "answer": "For a July 2027 graduate, what joining arrangement would apply if selected?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "JULY 2027 → JOINING PLAN?",
        "story": "availability",
        "seconds": "5–10 sec"
      },
      {
        "number": 388,
        "priority": "PREPARE",
        "question": "Does this recruitment event lead mainly to full-time roles after graduation, or are student/internship arrangements also considered?",
        "answer": "Does this recruitment event lead mainly to full-time roles after graduation, or are student/internship arrangements also considered?",
        "note": "Ask only if this has not already been answered. Choose one or two questions for the available time.",
        "memory": "FULL-TIME OR STUDENT ARRANGEMENT?",
        "story": "availability",
        "seconds": "10–15 sec"
      }
    ]
  }
];
