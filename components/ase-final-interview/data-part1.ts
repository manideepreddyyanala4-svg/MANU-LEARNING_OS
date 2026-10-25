import type { InterviewCategory } from './types';

export const interviewCategoriesPart1: InterviewCategory[] = [
  {
    "id": "story",
    "title": "A. Story / Opening / Simple Questions",
    "subtitle": "The fast first-impression questions for a short interview.",
    "range": "Q1–Q25",
    "items": [
      {
        "number": 1,
        "priority": "CORE",
        "question": "Tell me about yourself.",
        "answer": "Good morning. I am Manideep Reddy from India. I am currently pursuing my Master's in Computer Science and Information Engineering at Asia University, and I expect to graduate in July 2027.\n\nI am also working as a Research Assistant on an NSTC-funded RGB dorsal-hand biometric project. The data collection was done as a team, and for my assigned research I mainly handle the coding, experiments, evaluation, and result analysis.\n\nWe also wrote a paper based on this research. The paper has been accepted, and I will present it at a conference in Japan this December.\n\nThrough this work, I have developed strong skills in Python, data analysis, controlled experiments, and problem solving. I am interested in Product Test Engineering at ASE because I want to apply these skills to test data, debugging, and semiconductor product problems while learning the test and hardware domain.",
        "memory": "MS → NSTC → MY WORK → PAPER/JAPAN → PTE",
        "story": "introduction",
        "seconds": "50–60 sec"
      },
      {
        "number": 2,
        "priority": "PREPARE",
        "question": "Please introduce yourself in 30–45 seconds.",
        "answer": "I am Manideep Reddy from India. I am doing my Master's in CSIE at Asia University and expect to graduate in July 2027.\n\nI work as a Research Assistant on an NSTC-funded RGB dorsal-hand biometric project, where I mainly handle the coding, experiments, evaluation, and analysis for my assigned work.\n\nOur paper from this research has been accepted, and I will present it at a conference in Japan this December.\n\nI am interested in ASE PTE because I want to apply my Python, data-analysis, and problem-solving skills to semiconductor testing.",
        "memory": "MS → NSTC → PAPER/JAPAN → PTE",
        "story": "introduction",
        "seconds": "35–45 sec"
      },
      {
        "number": 3,
        "priority": "PREPARE",
        "question": "Can you introduce yourself in one minute?",
        "answer": "I am Manideep Reddy from India. I completed my B.Tech in Computer Science with AI and Machine Learning, and I am now pursuing my Master's in CSIE at Asia University.\n\nI also work as a Research Assistant on an NSTC-funded RGB dorsal-hand biometric project. The data collection was a team effort, while for my assigned research I mainly handle the coding, experiments, evaluation, and analysis.\n\nOne main problem I study is why verification performance becomes worse when capture conditions change. We also wrote a paper from this research, and it has been accepted. I will present it at a conference in Japan this December.\n\nThis work has strengthened my Python, data-analysis, and debugging skills. I want to apply them in Product Test Engineering at ASE while learning the semiconductor test domain.",
        "memory": "PAST → NSTC → PROBLEM → PAPER/JAPAN → PTE",
        "story": "introduction",
        "seconds": "55–65 sec"
      },
      {
        "number": 4,
        "priority": "PREPARE",
        "question": "What are you studying now?",
        "answer": "I am doing an M.S. in Computer Science and Information Engineering at Asia University in Taiwan.",
        "memory": "MS → CSIE → ASIA",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 5,
        "priority": "PREPARE",
        "question": "Which university are you studying at?",
        "answer": "I am studying at Asia University in Taichung, Taiwan.",
        "memory": "ASIA → TAICHUNG",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 6,
        "priority": "PREPARE",
        "question": "What is your Master’s specialization?",
        "answer": "My program is Computer Science and Information Engineering. My current research is mainly in computer vision and biometric verification.",
        "memory": "CSIE → VISION → BIOMETRICS",
        "story": "introduction",
        "seconds": "10–15 sec"
      },
      {
        "number": 7,
        "priority": "CORE",
        "question": "When will you graduate?",
        "answer": "I currently expect to graduate in July 2027.",
        "note": "Keep this consistent with your university record.",
        "memory": "JULY 2027",
        "story": "availability",
        "seconds": "5–10 sec"
      },
      {
        "number": 8,
        "priority": "CORE",
        "question": "What position are you applying for?",
        "answer": "My first choice is Product Test Engineer, or PTE. I am also open to a suitable Process Engineer role if it fits my background and the training is suitable.",
        "memory": "PTE FIRST → PE POSSIBLE",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 9,
        "priority": "CORE",
        "question": "Why are you interested in PTE?",
        "answer": "I like PTE because it involves test data, debugging, and finding why results change. In my research, I compare experiments and study failures step by step. I still need to learn the test hardware, but this way of solving problems fits my strengths.",
        "memory": "DATA → DEBUG → LEARN HARDWARE",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 10,
        "priority": "CORE",
        "question": "Why do you want to join ASE?",
        "answer": "ASE works in chip packaging and testing, including wafer test and final test. That makes it relevant to the test career I want. My research has given me practice in Python, data analysis, and checking failures. I want to use these skills while learning real semiconductor testing.",
        "memory": "ASE TESTING → SKILLS → LEARN",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 11,
        "priority": "PREPARE",
        "question": "Why semiconductor after studying CS/AI?",
        "answer": "I do not see it as leaving CS. I want to use programming and data analysis on real engineering problems. Semiconductor testing has a lot of measurable data and debugging, so it fits the way I like to work.",
        "memory": "CS SKILLS → ENGINEERING DATA",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 12,
        "priority": "PREPARE",
        "question": "Why did you come to Taiwan?",
        "answer": "I came to Taiwan for my Master’s because Taiwan has a strong technology and semiconductor industry. I also wanted international study and research experience. If I find the right opportunity, I would like to build my technical career here.",
        "memory": "MASTER'S → TECHNOLOGY → CAREER",
        "story": "introduction",
        "seconds": "20–25 sec"
      },
      {
        "number": 13,
        "priority": "PREPARE",
        "question": "Why did you choose Asia University?",
        "answer": "Asia University offered the CSIE Master’s program and gave me the chance to work on applied computer-vision research with an advisor in Taiwan.",
        "memory": "CSIE → ADVISOR → RESEARCH",
        "story": "introduction",
        "seconds": "10–15 sec"
      },
      {
        "number": 14,
        "priority": "PREPARE",
        "question": "What are your strongest skills?",
        "answer": "My strongest skills are Python, computer vision, image processing, data analysis, and experiments. I am especially comfortable breaking a technical problem into smaller tests and comparing the results.",
        "memory": "PYTHON → VISION → EXPERIMENTS",
        "story": "strength",
        "seconds": "15–20 sec"
      },
      {
        "number": 15,
        "priority": "PREPARE",
        "question": "What have you been focusing on during your Master’s?",
        "answer": "I have mainly focused on RGB dorsal-hand biometric verification. I work on extracting a stable hand region, testing lightweight models, and studying why performance becomes worse across sessions and capture conditions.",
        "memory": "HAND ROI → SMALL MODEL → SESSIONS",
        "story": "introduction",
        "seconds": "15–20 sec"
      },
      {
        "number": 16,
        "priority": "PREPARE",
        "question": "What is the most important thing you learned during graduate school?",
        "answer": "I learned that one good result is not enough. I need to keep the test fair, check the data, compare methods under the same conditions, and make claims only when the results support them.",
        "memory": "FAIR TEST → FULL RESULTS",
        "story": "failed-experiment",
        "seconds": "15–20 sec"
      },
      {
        "number": 17,
        "priority": "PREPARE",
        "question": "What achievement are you most proud of?",
        "answer": "I am most proud of my Master’s research. Our work was accepted for a conference presentation. I am proud because I learned how to solve technical problems, run experiments, and keep improving when the results were not good.",
        "memory": "RESEARCH → CONFERENCE → LEARNING",
        "story": "strength",
        "seconds": "20–25 sec"
      },
      {
        "number": 18,
        "priority": "PREPARE",
        "question": "How would you describe yourself in three words?",
        "answer": "Careful, persistent, and curious. I like checking the evidence and understanding why a result changed.",
        "memory": "CAREFUL → PERSISTENT → CURIOUS",
        "story": "strength",
        "seconds": "5–10 sec"
      },
      {
        "number": 19,
        "priority": "PREPARE",
        "question": "What makes you different from other candidates?",
        "answer": "My background is different from a traditional EE candidate. My strengths are Python, data analysis, computer vision, and experiments. I know I have more to learn about semiconductor hardware, and I am ready to learn it.",
        "memory": "SOFTWARE STRENGTH → HARDWARE GAP",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 20,
        "priority": "CORE",
        "question": "Why should we hire you?",
        "answer": "My main strength is solving problems with data. In my research, when performance became worse, I checked the pipeline, compared the conditions, and tested one idea at a time instead of guessing. I can bring the same Python, analysis, and debugging skills to PTE while learning the semiconductor-test side.",
        "memory": "DATA → REAL EXAMPLE → PTE",
        "story": "role-fit",
        "seconds": "25–30 sec"
      },
      {
        "number": 21,
        "priority": "PREPARE",
        "question": "Why should we hire a CS student instead of an EE student?",
        "answer": "An EE student may start with stronger electronics knowledge. My strength is different: Python, data analysis, experiments, automation, and software debugging. I can bring those skills to the team while learning the hardware and test knowledge needed for PTE.",
        "memory": "EE HARDWARE → MY DATA SKILLS",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 22,
        "priority": "PREPARE",
        "question": "Recommend yourself to me.",
        "answer": "I am analytical, willing to learn, and careful with data. I can write Python, run experiments, and explain why a result changed instead of guessing. PTE is a new domain for me, but I am serious about learning it.",
        "memory": "CAREFUL → PYTHON → READY TO LEARN",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 23,
        "priority": "PREPARE",
        "question": "What value can you bring to our team?",
        "answer": "I can help with Python scripts, data analysis, and checking unusual results. My research has taught me to compare tests carefully and record what I find. I would first learn the team's tools and procedures.",
        "memory": "SCRIPTS → DATA → TEAM PROCEDURES",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 24,
        "priority": "BACKUP",
        "question": "What do you usually do outside your studies?",
        "answer": "I like watching movies. They help me relax after study and research.",
        "memory": "MOVIES → RELAX",
        "seconds": "5–10 sec"
      },
      {
        "number": 25,
        "priority": "BACKUP",
        "question": "What are your hobbies?",
        "answer": "I enjoy watching movies and learning about technology.",
        "memory": "MOVIES → TECHNOLOGY",
        "seconds": "5–10 sec"
      }
    ]
  },
  {
    "id": "resume",
    "title": "B. Resume Defense",
    "subtitle": "Every important resume line must survive follow-up questions.",
    "range": "Q26–Q64",
    "items": [
      {
        "number": 26,
        "priority": "CORE",
        "question": "Walk me through your resume.",
        "answer": "I completed my B.Tech in Computer Science with AI and Machine Learning in 2024. I am now doing my Master's at Asia University. My main work is hand-image verification research, where I handle coding, experiments, and analysis. I use Python, PyTorch, and OpenCV, and our work has been accepted for a conference presentation. I want to bring my data and debugging skills into PTE.",
        "memory": "DEGREE → RESEARCH → SKILLS → FIT",
        "story": "introduction",
        "seconds": "30–35 sec"
      },
      {
        "number": 27,
        "priority": "PREPARE",
        "question": "Which part of your resume best represents you?",
        "answer": "My current research best represents me. It combines coding, experiments, data analysis, debugging, and explaining results clearly. It is also my most recent and strongest technical work.",
        "memory": "RESEARCH → CODE → ANALYSIS",
        "story": "introduction",
        "seconds": "10–15 sec"
      },
      {
        "number": 28,
        "priority": "PREPARE",
        "question": "What is your current research?",
        "answer": "I use photos of the back of a hand to check identity. My focus is a small model that works more reliably when capture conditions change.",
        "memory": "HAND PHOTOS → IDENTITY → CONDITIONS",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 29,
        "priority": "CORE",
        "question": "What exactly did YOU personally do?",
        "answer": "We collected the images as a team. I personally wrote the ROI and image-processing code, tested the published LAWNet baseline, built the evaluation workflow, and ran and analyzed experiments. My advisor guides the research. I did not invent LAWNet.",
        "memory": "TEAM DATA → MY CODE → ADVISOR",
        "story": "contribution",
        "seconds": "20–25 sec"
      },
      {
        "number": 30,
        "priority": "PREPARE",
        "question": "What did your professor/advisor do versus what did you do?",
        "answer": "My advisor gives the overall research direction, technical guidance, and reviews the work. Data collection was shared by the team. For my assigned work, I personally do the coding, implementation, experiments, evaluation, and result analysis.",
        "memory": "ADVISOR GUIDES → I IMPLEMENT",
        "story": "contribution",
        "seconds": "15–20 sec"
      },
      {
        "number": 31,
        "priority": "PREPARE",
        "question": "Are you a Research Assistant?",
        "answer": "I work on a dorsal-hand biometrics research project under my advisor at Asia University.",
        "needsFact": "Confirm the official appointment title before using Research Assistant on a resume.",
        "memory": "RESEARCH PROJECT → CONFIRM TITLE",
        "story": "introduction",
        "seconds": "5–10 sec"
      },
      {
        "number": 32,
        "priority": "PREPARE",
        "question": "What are your responsibilities as a Research Assistant?",
        "answer": "I help with team data collection and work on the technical pipeline. My tasks include ROI and image processing, baseline-model testing, evaluation, experiments, result analysis, and preparing research outputs under my advisor.",
        "memory": "COLLECT → CODE → TEST → ANALYZE",
        "story": "contribution",
        "seconds": "15–20 sec"
      },
      {
        "number": 33,
        "priority": "PREPARE",
        "question": "What is the NSTC project?",
        "answer": "It is an NSTC-funded research project on RGB dorsal-hand biometrics. My part is image processing, model experiments, and result analysis under my advisor.",
        "memory": "NSTC → BIOMETRICS → MY TASKS",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 34,
        "priority": "PREPARE",
        "question": "Did you obtain the NSTC funding yourself?",
        "answer": "No. I work on an NSTC-funded project under my advisor and lab. I did not personally obtain the grant.",
        "memory": "LAB GRANT → NOT MY GRANT",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 35,
        "priority": "CORE",
        "question": "What programming language are you strongest in?",
        "answer": "Python is my strongest programming language. I use it regularly for image processing, PyTorch experiments, data analysis, evaluation scripts, and automation.",
        "memory": "PYTHON → DAILY RESEARCH",
        "story": "strength",
        "seconds": "10–15 sec"
      },
      {
        "number": 36,
        "priority": "PREPARE",
        "question": "How do you actually use Python?",
        "answer": "I use Python to read and process images, run model experiments, calculate verification metrics, analyze similarity scores, compare results, and automate repeated evaluation steps.",
        "memory": "IMAGES → METRICS → ANALYSIS",
        "story": "strength",
        "seconds": "10–15 sec"
      },
      {
        "number": 37,
        "priority": "PREPARE",
        "question": "Give me an example of a Python script you wrote.",
        "answer": "I wrote a Python script to compare model scores for matching and non-matching hand images. It calculates verification errors and summarizes results for different capture conditions.",
        "memory": "MATCH SCORES → ERRORS → SUMMARY",
        "story": "strength",
        "seconds": "10–15 sec"
      },
      {
        "number": 38,
        "priority": "PREPARE",
        "question": "How have you used Pandas or NumPy?",
        "answer": "I use NumPy for arrays, embeddings, similarity calculations, and numerical operations. I use Pandas for CSV or table data when I need filtering, grouping, comparison, or summary statistics.",
        "memory": "NUMPY ARRAYS → PANDAS TABLES",
        "story": "strength",
        "seconds": "15–20 sec"
      },
      {
        "number": 39,
        "priority": "PREPARE",
        "question": "Where have you used SQL?",
        "answer": "I know basic SQL, including SELECT, WHERE, GROUP BY, and joins. My main research work uses Python.",
        "needsFact": "Prepare a real SQL example you can explain. Do not claim professional database experience.",
        "memory": "SQL BASICS → REAL EXAMPLE",
        "seconds": "10–15 sec"
      },
      {
        "number": 40,
        "priority": "PREPARE",
        "question": "What have you done with PyTorch?",
        "answer": "I use PyTorch to work with neural-network models, prepare data pipelines, run training or evaluation experiments, extract embeddings, load checkpoints, and compare model results.",
        "memory": "PYTORCH → MODEL → EXPERIMENTS",
        "story": "strength",
        "seconds": "10–15 sec"
      },
      {
        "number": 41,
        "priority": "PREPARE",
        "question": "What have you done with OpenCV?",
        "answer": "I use OpenCV for reading images, resizing, cropping, geometric transformations, ROI processing, preprocessing, and checking image results.",
        "memory": "OPENCV → CROP → TRANSFORM",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 42,
        "priority": "PREPARE",
        "question": "What have you done with MediaPipe?",
        "answer": "I use MediaPipe to get hand landmarks. My own code then uses selected landmarks to locate and align the dorsal-hand ROI. I did not train MediaPipe itself.",
        "memory": "LANDMARKS → MY ROI CODE",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 43,
        "priority": "PREPARE",
        "question": "How comfortable are you with Linux?",
        "answer": "I use Linux to run Python experiments, manage environments, check files and processes, and work on the lab GPU server.",
        "memory": "FILES → ENVIRONMENTS → GPU",
        "seconds": "10–15 sec"
      },
      {
        "number": 44,
        "priority": "PREPARE",
        "question": "How do you use Git?",
        "answer": "I use Git to track code changes, make commits, compare versions, and keep a history so I can recover or understand changes later.",
        "memory": "TRACK → COMMIT → COMPARE",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 45,
        "priority": "PREPARE",
        "question": "Which technical skill on your resume are you strongest at?",
        "answer": "Python is my strongest single skill, especially when I use it with image processing and experiment or data analysis.",
        "memory": "PYTHON → PROCESS → ANALYZE",
        "story": "strength",
        "seconds": "10–15 sec"
      },
      {
        "number": 46,
        "priority": "PREPARE",
        "question": "Which skill are you least confident about?",
        "answer": "Compared with my software and data skills, semiconductor electronics and production-test equipment are newer for me. I am learning the PTE basics because I know they are important for the role.",
        "memory": "HARDWARE GAP → LEARNING",
        "story": "learning-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 47,
        "priority": "PREPARE",
        "question": "Your old resume says MobileNetV3. Are you still using it?",
        "answer": "MobileNetV3 was earlier work. LAWNet is now my main lightweight baseline. My own model is still under development.",
        "memory": "OLD MOBILENET → CURRENT LAWNET",
        "seconds": "10–15 sec"
      },
      {
        "number": 48,
        "priority": "CORE",
        "question": "What model are you actually using now?",
        "answer": "LAWNet is my main baseline. It is a published lightweight model for RGB wrist-vein verification. I test it on dorsal-hand images as a reference for my own model work.",
        "memory": "PUBLISHED WRIST MODEL → BASELINE",
        "seconds": "15–20 sec"
      },
      {
        "number": 49,
        "priority": "PREPARE",
        "question": "Did you create LAWNet?",
        "answer": "No. LAWNet was created by other researchers. My work is to reproduce and test it under my protocol, study where it works and fails on my data, and use those results as a baseline for my own model work.",
        "memory": "REPRODUCE → TEST → NOT INVENT",
        "story": "contribution",
        "seconds": "20–25 sec"
      },
      {
        "number": 50,
        "priority": "PREPARE",
        "question": "What is the difference between LAWNet and your proposed model?",
        "answer": "LAWNet is an existing published model. My own model is still being developed. I want to keep it below about 0.6 million parameters and improve performance when capture conditions change.",
        "memory": "EXISTING BASELINE → ONGOING MODEL",
        "seconds": "15–20 sec"
      },
      {
        "number": 51,
        "priority": "PREPARE",
        "question": "Is your proposed model completed?",
        "answer": "No. My own lightweight model is still under development. I have run experiments, but I do not have a final validated model yet.",
        "memory": "EXPERIMENTS DONE → FINAL MODEL ONGOING",
        "seconds": "10–15 sec"
      },
      {
        "number": 52,
        "priority": "PREPARE",
        "question": "Has your proposed model improved the results?",
        "answer": "I cannot claim that yet. I will only claim an improvement after I have a completed and verified experiment that shows it clearly.",
        "memory": "NO CLAIM → VERIFY FIRST",
        "seconds": "10–15 sec"
      },
      {
        "number": 53,
        "priority": "BACKUP",
        "question": "Why does your old resume mention ONNX?",
        "answer": "ONNX was part of an earlier local inference experiment. It is a model format, not my current thesis architecture.",
        "memory": "ONNX FORMAT → EARLIER WORK",
        "seconds": "10–15 sec"
      },
      {
        "number": 54,
        "priority": "BACKUP",
        "question": "Is your model deployed?",
        "answer": "No, not in production. I previously tested local ONNX inference as a prototype, but I would not say my current research system is deployed.",
        "memory": "LOCAL PROTOTYPE → NO PRODUCTION",
        "seconds": "10–15 sec"
      },
      {
        "number": 55,
        "priority": "BACKUP",
        "question": "What was the ONNX work for?",
        "answer": "It was to check whether a trained model could be exported and run correctly in ONNX Runtime for local inference. It was an earlier engineering experiment.",
        "memory": "EXPORT → LOCAL INFERENCE",
        "seconds": "10–15 sec"
      },
      {
        "number": 56,
        "priority": "CORE",
        "question": "Tell me about your accepted conference work.",
        "answer": "Our work has been accepted for a conference presentation. It is about extracting a consistent region from RGB photos of the back of a hand. My work included the image-processing code, experiments, and analysis.",
        "needsFact": "Confirm the exact paper title, conference name/date, and current publication status.",
        "memory": "ROI WORK → ACCEPTED PRESENTATION",
        "seconds": "15–20 sec"
      },
      {
        "number": 57,
        "priority": "PREPARE",
        "question": "Is it accepted, presented, or published?",
        "answer": "It has been accepted for a conference presentation.",
        "memory": "ACCEPTED FOR PRESENTATION",
        "seconds": "5–10 sec"
      },
      {
        "number": 58,
        "priority": "PREPARE",
        "question": "What was your personal contribution to that conference work?",
        "answer": "I worked on the ROI extraction and alignment code, experiments, evaluation, and analysis. Data collection was a team effort, and my advisor supervised the research.",
        "needsFact": "Check this against the actual paper contribution statement.",
        "memory": "MY CODE → TEAM DATA",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 59,
        "priority": "BACKUP",
        "question": "Tell me about your 2023 GAN paper.",
        "answer": "It was an earlier undergraduate project involving GANs and 3D work. My current Master's research is the work I can explain in the most detail.",
        "needsFact": "Confirm the undergraduate paper title, date, venue, and topic before describing details.",
        "memory": "OLD GAN WORK → CHECK DETAILS",
        "seconds": "10–15 sec"
      },
      {
        "number": 60,
        "priority": "BACKUP",
        "question": "What was your contribution to that paper?",
        "answer": "My specific contribution was [your actual task]. I used [method or tool] and checked [actual result].",
        "needsFact": "Add your actual undergraduate paper contribution and one defensible result.",
        "memory": "MY TASK → TOOL → RESULT",
        "seconds": "Time after filling facts"
      },
      {
        "number": 61,
        "priority": "PREPARE",
        "question": "Why is your current Master’s research more relevant than your undergraduate projects?",
        "answer": "My Master’s research is more complete and more recent. I work on the full technical process: coding, baseline testing, controlled experiments, evaluation, failure analysis, and ongoing model development under my advisor.",
        "memory": "RECENT → COMPLETE → CONTROLLED",
        "story": "strength",
        "seconds": "15–20 sec"
      },
      {
        "number": 62,
        "priority": "PREPARE",
        "question": "Which undergraduate project would you choose to explain if I asked for one?",
        "answer": "One undergraduate project was credit-card fraud detection. It involved imbalanced data and SMOTE. I can explain my part, the evaluation, and what I learned.",
        "needsFact": "Confirm your personal tasks, dataset, evaluation, and how SMOTE was limited to training data.",
        "memory": "FRAUD → IMBALANCE → SMOTE",
        "seconds": "10–15 sec"
      },
      {
        "number": 63,
        "priority": "PREPARE",
        "question": "Your CGPA is 8.34/10. What subjects were you strongest in?",
        "answer": "My CGPA was 8.34 out of 10. Two subjects I did well in were [subject one] and [subject two]. They helped me with [real example].",
        "needsFact": "Add two real subjects from your transcript.",
        "memory": "8.34 → TWO REAL SUBJECTS",
        "seconds": "Time after filling facts"
      },
      {
        "number": 64,
        "priority": "BACKUP",
        "question": "Were there any subjects you struggled with?",
        "answer": "I found [course] difficult because [specific reason]. I improved by [what you actually did], and learned [result].",
        "needsFact": "Add one real difficult course and what you did.",
        "memory": "REAL COURSE → ACTION → LESSON",
        "seconds": "Time after filling facts"
      }
    ]
  },
  {
    "id": "project-manager",
    "title": "C. Project Defense — Simple Manager Level",
    "subtitle": "Explain your research clearly to HR or a non-CV engineering manager.",
    "range": "Q65–Q109",
    "items": [
      {
        "number": 65,
        "priority": "CORE",
        "question": "Tell me about your research.",
        "answer": "My research uses normal color photos of the back of a hand to check a person's identity. I wrote code to extract and align the useful hand area, then tested a small published model. It worked much worse when the capture sessions changed. I am studying that problem and testing improvements while keeping the model small. My final model is still under development.",
        "memory": "HAND PHOTOS → TEST → SESSION GAP",
        "story": "research",
        "seconds": "30–35 sec"
      },
      {
        "number": 66,
        "priority": "PREPARE",
        "question": "Explain your research to someone who does not know computer vision.",
        "answer": "Imagine checking whether a new hand photo matches a saved one. My system crops the useful hand area and compares the two images using a small model. The challenge is making this reliable when lighting or hand position changes. I am still working on that problem.",
        "memory": "NEW PHOTO → REFERENCE → CONDITIONS",
        "story": "research",
        "seconds": "20–25 sec"
      },
      {
        "number": 67,
        "priority": "PREPARE",
        "question": "What problem are you trying to solve?",
        "answer": "I am trying to make verification more reliable when the same person is captured in different sessions or conditions. The current baseline works much better when the conditions are similar.",
        "memory": "RELIABLE MATCH → CHANGING CONDITIONS",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 68,
        "priority": "PREPARE",
        "question": "Why is this problem useful/important?",
        "answer": "A biometric system must still work when real capture conditions change. If accuracy drops badly because of lighting, pose, or alignment, the system is not reliable enough for practical use.",
        "memory": "REAL CONDITIONS → RELIABLE SYSTEM",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 69,
        "priority": "PREPARE",
        "question": "What is dorsal-hand biometrics?",
        "answer": "Dorsal-hand biometrics uses visual information from the back of the hand to recognize or verify a person.",
        "memory": "BACK OF HAND → BIOMETRIC",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 70,
        "priority": "PREPARE",
        "question": "Why use the back of the hand?",
        "answer": "It has useful skin and knuckle patterns, and we can capture it without contact using a normal color camera. Whether it works better than another biometric depends on the data and conditions.",
        "memory": "PATTERNS → CONTACTLESS RGB",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 71,
        "priority": "PREPARE",
        "question": "What is biometric verification?",
        "answer": "Verification checks whether a sample matches a claimed identity. In my project, I compare a hand image with a reference and accept or reject the match.",
        "memory": "CLAIMED IDENTITY → MATCH CHECK",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 72,
        "priority": "PREPARE",
        "question": "Identification vs verification?",
        "answer": "Identification asks, “Who is this?” and usually compares one sample with many identities. Verification asks, “Is this the same person?” and compares with a claimed or reference identity.",
        "memory": "WHO? → SAME IDENTITY?",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 73,
        "priority": "PREPARE",
        "question": "Verification vs classification?",
        "answer": "Classification chooses one class from a fixed set. Verification compares two feature representations and decides whether they belong to the same identity.",
        "memory": "FIXED CLASS → PAIR MATCH",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 74,
        "priority": "CORE",
        "question": "Walk me through your project from input to final decision.",
        "answer": "I start with a color hand photo. I find landmarks, crop and align the hand region, and prepare the image. The model turns it into a feature vector. I compare that vector with a reference using cosine similarity, then use a threshold to accept or reject the match.",
        "memory": "IMAGE → ROI → FEATURES → SCORE",
        "story": "research",
        "seconds": "20–25 sec"
      },
      {
        "number": 75,
        "priority": "PREPARE",
        "question": "What happens after you capture the hand image?",
        "answer": "First I find the hand and useful landmarks. Then I extract and align a consistent dorsal-hand region, prepare it for the model, and pass it through the network to get features for comparison.",
        "memory": "LANDMARKS → ALIGN → MODEL",
        "story": "contribution",
        "seconds": "15–20 sec"
      },
      {
        "number": 76,
        "priority": "CORE",
        "question": "What is ROI?",
        "answer": "ROI means Region of Interest. It is the useful part of the full image that I want the model to analyze. In my project, it is the dorsal-hand area.",
        "memory": "ROI → USEFUL HAND AREA",
        "story": "contribution",
        "seconds": "15–20 sec"
      },
      {
        "number": 77,
        "priority": "PREPARE",
        "question": "Why do you need ROI extraction?",
        "answer": "The full image has background and different hand positions. ROI extraction removes much of that unwanted variation and gives the model a more consistent hand area.",
        "memory": "LESS BACKGROUND → CONSISTENT CROP",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 78,
        "priority": "PREPARE",
        "question": "Why do you need alignment?",
        "answer": "Alignment makes the hand region more consistent in position and angle. Without it, the same person can look shifted or rotated, which can change the model features.",
        "memory": "POSITION → ANGLE → CONSISTENCY",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 79,
        "priority": "PREPARE",
        "question": "What does MediaPipe do?",
        "answer": "MediaPipe detects hand landmarks. I use those landmark coordinates as reference points in my own ROI extraction and alignment code.",
        "memory": "MEDIAPIPE → LANDMARK COORDINATES",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 80,
        "priority": "PREPARE",
        "question": "What does OpenCV do in your pipeline?",
        "answer": "OpenCV handles image operations such as reading, cropping, resizing, geometric changes, preprocessing, and checking the extracted ROI.",
        "memory": "OPENCV → IMAGE OPERATIONS",
        "story": "contribution",
        "seconds": "10–15 sec"
      },
      {
        "number": 81,
        "priority": "PREPARE",
        "question": "What does the neural network do?",
        "answer": "The network acts as a feature extractor. It turns the aligned hand image into a compact numerical representation that should keep useful identity information.",
        "memory": "IMAGE → IDENTITY FEATURES",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 82,
        "priority": "PREPARE",
        "question": "What does the network output?",
        "answer": "It outputs an embedding, which is a numerical feature vector used to compare hand images.",
        "memory": "OUTPUT → FEATURE VECTOR",
        "story": "research",
        "seconds": "5–10 sec"
      },
      {
        "number": 83,
        "priority": "CORE",
        "question": "What is an embedding in simple language?",
        "answer": "An embedding is a compact list of numbers that represents important features of an image. Images from the same person should have more similar embeddings.",
        "memory": "IMAGE → COMPACT NUMBERS",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 84,
        "priority": "PREPARE",
        "question": "How do you compare two hand images?",
        "answer": "I pass both images through the same model to get two embeddings, then I calculate cosine similarity between them.",
        "memory": "SAME MODEL → TWO VECTORS → COSINE",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 85,
        "priority": "CORE",
        "question": "What is cosine similarity in simple language?",
        "answer": "Cosine similarity compares the direction of two feature vectors. A higher score means their directions are more alike. In my system, that supports a same-identity match, but it is not a probability.",
        "memory": "VECTOR DIRECTION → SIMILARITY",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 86,
        "priority": "PREPARE",
        "question": "How do you decide same person or different person?",
        "answer": "I accept a match if its similarity score meets the chosen threshold. Otherwise, I reject it. The threshold controls the balance between false accepts and false rejects.",
        "memory": "SCORE → THRESHOLD → DECISION",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 87,
        "priority": "PREPARE",
        "question": "What does the threshold do?",
        "answer": "The threshold turns the similarity score into a yes or no decision. Changing the threshold changes the balance between false accepts and false rejects.",
        "memory": "THRESHOLD → ERROR TRADE-OFF",
        "seconds": "10–15 sec"
      },
      {
        "number": 88,
        "priority": "CORE",
        "question": "What is the biggest problem in your current system?",
        "answer": "The biggest problem is cross-session generalization. The error becomes much higher when the same identity is compared across different capture sessions than within similar conditions.",
        "memory": "CROSS-SESSION → HIGHER ERROR",
        "story": "session-gap",
        "seconds": "10–15 sec"
      },
      {
        "number": 89,
        "priority": "PREPARE",
        "question": "What do you mean by cross-session?",
        "answer": "Cross-session means the two samples were captured in different sessions. This can bring changes in lighting, pose, hand position, camera conditions, or the environment.",
        "memory": "DIFFERENT CAPTURE SESSIONS",
        "story": "session-gap",
        "seconds": "10–15 sec"
      },
      {
        "number": 90,
        "priority": "PREPARE",
        "question": "Why does performance become worse across sessions?",
        "answer": "Capture conditions can change the image even for the same hand. Lighting, hand position, alignment, and camera differences are possible factors. My results show lower same-identity similarity across sessions, but they do not prove one cause.",
        "memory": "CAPTURE CHANGES → POSSIBLE FACTORS",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 91,
        "priority": "PREPARE",
        "question": "Is lighting the proven reason?",
        "answer": "No. Lighting is one possible factor. Alignment, hand position, camera changes, and model sensitivity may also matter. I have not proved that lighting alone caused the drop.",
        "memory": "LIGHTING POSSIBLE → NOT PROVEN",
        "story": "session-gap",
        "seconds": "10–15 sec"
      },
      {
        "number": 92,
        "priority": "PREPARE",
        "question": "What factors could affect performance?",
        "answer": "Lighting, hand pose, alignment, ROI location, camera or environment conditions, session differences, preprocessing, and model sensitivity can all affect performance.",
        "memory": "LIGHT → POSE → ALIGNMENT → MODEL",
        "story": "session-gap",
        "seconds": "10–15 sec"
      },
      {
        "number": 93,
        "priority": "PREPARE",
        "question": "What have you tried so far?",
        "answer": "I built the ROI and alignment pipeline, reproduced and tested LAWNet, built controlled evaluation workflows, tested preprocessing methods, ran architecture experiments, and analyzed same-session and cross-session results. These results guide my own lightweight model work.",
        "memory": "ROI → BASELINE → TESTS → ANALYSIS",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 94,
        "priority": "PREPARE",
        "question": "What is your current baseline?",
        "answer": "LAWNet is my main baseline. It is a published lightweight RGB wrist-vein model that I reproduce and test on my dorsal-hand task.",
        "memory": "LAWNET → PUBLISHED BASELINE",
        "story": "research",
        "seconds": "10–15 sec"
      },
      {
        "number": 95,
        "priority": "CORE",
        "question": "Why are you using LAWNet?",
        "answer": "LAWNet is a small published model for RGB wrist-vein verification, which makes it a useful starting point. Its lightweight design fits my goal. I test it carefully on dorsal-hand images before claiming any improvement from my own work.",
        "memory": "SMALL RGB MODEL → FAIR REFERENCE",
        "story": "research",
        "seconds": "20–25 sec"
      },
      {
        "number": 96,
        "priority": "PREPARE",
        "question": "What have you learned from reproducing LAWNet?",
        "answer": "It gave me a strong lightweight reference before proposing anything new. It also showed me that the biggest problem on my target data is keeping same-person features stable when capture conditions change.",
        "memory": "REFERENCE → UNSTABLE MATCHING",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 97,
        "priority": "PREPARE",
        "question": "What are you trying to improve now?",
        "answer": "I am trying to improve performance across changing capture conditions while keeping the model lightweight.",
        "memory": "CONDITION CHANGES → SMALL MODEL",
        "story": "research",
        "seconds": "5–10 sec"
      },
      {
        "number": 98,
        "priority": "PREPARE",
        "question": "What is your proposed research direction?",
        "answer": "I am developing a small model for RGB dorsal-hand verification. My aim is better results across capture conditions with fewer than about 0.6 million parameters. It is ongoing research.",
        "memory": "UNDER 0.6M → ONGOING",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 99,
        "priority": "PREPARE",
        "question": "What is completed versus still ongoing?",
        "answer": "I have built the ROI and evaluation pipelines and run LAWNet, preprocessing, and architecture experiments. We collected the images as a team. The final model and proof of improvement are still ongoing.",
        "memory": "PIPELINES DONE → MODEL ONGOING",
        "story": "research",
        "seconds": "15–20 sec"
      },
      {
        "number": 100,
        "priority": "CORE",
        "question": "What exactly is YOUR contribution?",
        "answer": "Data collection was shared by the team. For my assigned research, I personally handled the coding, ROI and preprocessing work, LAWNet reproduction, evaluation pipeline, experiments, and result analysis. LAWNet is an existing model, and my advisor guides the research direction.",
        "memory": "TEAM DATA → MY TECHNICAL WORK",
        "story": "contribution",
        "seconds": "20–25 sec"
      },
      {
        "number": 101,
        "priority": "PREPARE",
        "question": "What was the hardest part of the project?",
        "answer": "The hardest part is understanding the large drop across capture sessions. I compared scores and tested possible causes under fixed rules. That gave me a clearer problem to work on, but I have not fully solved it.",
        "memory": "SESSION GAP → CHECK → TEST",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 102,
        "priority": "CORE",
        "question": "Tell me about one experiment that failed.",
        "answer": "I tested preprocessing changes to improve verification. Some helped in certain conditions but hurt others. I compared all the results using the rule set before the tests, rather than choosing the best single number. The changes did not meet that rule, so I kept the original baseline. I learned to judge an idea by the full evaluation.",
        "memory": "MIXED RESULTS → RULE → KEEP BASELINE",
        "story": "failed-experiment",
        "seconds": "25–35 sec"
      },
      {
        "number": 103,
        "priority": "PREPARE",
        "question": "What did you learn from that failure?",
        "answer": "I learned that one good result is not enough. An improvement should work consistently under the full evaluation, and a failed experiment is still useful because it shows which idea may be wrong.",
        "memory": "FULL EVALUATION → LEARN",
        "story": "failed-experiment",
        "seconds": "15–20 sec"
      },
      {
        "number": 104,
        "priority": "PREPARE",
        "question": "What result surprised you?",
        "answer": "The size of the cross-session error surprised me. Same-identity scores dropped, showing that keeping a match stable across conditions is a major weakness in this evaluation.",
        "memory": "SESSION GAP → SAME-IDENTITY SCORES",
        "story": "session-gap",
        "seconds": "10–15 sec"
      },
      {
        "number": 105,
        "priority": "PREPARE",
        "question": "What would you do next if you had more time?",
        "answer": "I would keep testing the main causes of variation one at a time, try lightweight model changes, and check any improvement across multiple runs and cross-session conditions before making a claim.",
        "memory": "ONE FACTOR → REPEAT → VERIFY",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 106,
        "priority": "PREPARE",
        "question": "How do you know your experimental result is trustworthy?",
        "answer": "I check the data and test setup, keep the comparison fair, use the same evaluation rules, and look at more than one run or fold when needed. I make sure the conclusion matches the full result, not one good number.",
        "memory": "DATA → RULES → FULL RESULTS",
        "story": "failed-experiment",
        "seconds": "20–25 sec"
      },
      {
        "number": 107,
        "priority": "PREPARE",
        "question": "How do you compare different experiments fairly?",
        "answer": "I keep the data split, evaluation method, preprocessing, training rules, and metrics the same, and change only the factor I want to test whenever possible.",
        "memory": "SAME SETUP → ONE CHANGE",
        "story": "failed-experiment",
        "seconds": "10–15 sec"
      },
      {
        "number": 108,
        "priority": "PREPARE",
        "question": "How does your research show problem-solving ability relevant to PTE?",
        "answer": "The process is similar. First I check the measurement, find where the problem appears, split the data by condition, test one idea at a time, compare the result, and record what really improved. That way of debugging can also help with test and yield problems.",
        "memory": "CHECK → COMPARE → TEST → RECORD",
        "story": "failed-experiment",
        "seconds": "20–25 sec"
      },
      {
        "number": 109,
        "priority": "PREPARE",
        "question": "Why should a semiconductor test manager care about this research?",
        "answer": "The application is different, but the skills are useful for PTE: Python, data analysis, controlled tests, finding root causes, comparing conditions, and making decisions from evidence instead of guessing.",
        "memory": "DIFFERENT TASK → TRANSFERABLE SKILLS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      }
    ]
  }
];
