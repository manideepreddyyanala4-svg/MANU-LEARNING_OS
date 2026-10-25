import type { InterviewCategory } from './types';

export const interviewCategoriesPart3: InterviewCategory[] = [
  {
    "id": "electrical-safety",
    "title": "G. Basic Electrical / Written-Test Safety Net",
    "subtitle": "Only the simple fundamentals that may protect you in a basic engineering screen.",
    "range": "Q225–Q250",
    "items": [
      {
        "number": 225,
        "priority": "PREPARE",
        "question": "What is voltage?",
        "answer": "Voltage is the difference in electrical potential between two points. You can think of it as the push that can drive current. It is measured in volts.",
        "memory": "POTENTIAL DIFFERENCE → VOLTS",
        "seconds": "10–15 sec"
      },
      {
        "number": 226,
        "priority": "PREPARE",
        "question": "What is current?",
        "answer": "Current is the flow of electric charge through a circuit. It is measured in amperes.",
        "memory": "CHARGE FLOW → AMPERES",
        "seconds": "5–10 sec"
      },
      {
        "number": 227,
        "priority": "PREPARE",
        "question": "What is resistance?",
        "answer": "Resistance is how much a component opposes the flow of current. It is measured in ohms.",
        "memory": "OPPOSE CURRENT → OHMS",
        "seconds": "5–10 sec"
      },
      {
        "number": 228,
        "priority": "PREPARE",
        "question": "What is Ohm’s law?",
        "answer": "For a resistor under fixed conditions, Ohm's law is V equals I times R. Voltage equals current multiplied by resistance.",
        "memory": "V = I × R",
        "seconds": "10–15 sec"
      },
      {
        "number": 229,
        "priority": "PREPARE",
        "question": "If V=5 V and R=1 kΩ, what current flows?",
        "answer": "I = V divided by R. So 5 divided by 1000 is 0.005 A, which is 5 mA.",
        "memory": "5 ÷ 1,000 → 5 mA",
        "seconds": "10–15 sec"
      },
      {
        "number": 230,
        "priority": "PREPARE",
        "question": "What is electrical power?",
        "answer": "Electrical power is how fast electrical energy is used or delivered. A basic formula is P = V × I, and power is measured in watts.",
        "memory": "ENERGY RATE → V × I",
        "seconds": "10–15 sec"
      },
      {
        "number": 231,
        "priority": "BACKUP",
        "question": "What happens to resistances in series?",
        "answer": "Resistances in series add together. The same current flows through each resistor in the series path.",
        "memory": "SERIES → ADD RESISTANCE",
        "seconds": "5–10 sec"
      },
      {
        "number": 232,
        "priority": "BACKUP",
        "question": "What happens to voltage in parallel branches?",
        "answer": "In an ideal parallel circuit, each branch has the same voltage across it.",
        "memory": "PARALLEL → SAME VOLTAGE",
        "seconds": "5–10 sec"
      },
      {
        "number": 233,
        "priority": "CORE",
        "question": "What is an open circuit?",
        "answer": "An open circuit means the electrical path is broken, so current cannot flow normally through that path.",
        "memory": "OPEN → BROKEN PATH",
        "seconds": "10–15 sec"
      },
      {
        "number": 234,
        "priority": "CORE",
        "question": "What is a short circuit?",
        "answer": "A short circuit is an unwanted very-low-resistance path that can allow too much current to flow.",
        "memory": "SHORT → LOW-RESISTANCE PATH",
        "seconds": "5–10 sec"
      },
      {
        "number": 235,
        "priority": "PREPARE",
        "question": "Open vs short?",
        "answer": "Open means the path is broken, so current cannot flow normally. Short means there is an unwanted low-resistance path, so current can bypass the normal path.",
        "memory": "BROKEN PATH → UNWANTED PATH",
        "seconds": "10–15 sec"
      },
      {
        "number": 236,
        "priority": "PREPARE",
        "question": "What does continuity mean?",
        "answer": "Continuity means there is a complete electrical path between two points. A continuity test checks whether that path is connected.",
        "memory": "CONNECTED PATH → CONTINUITY",
        "seconds": "10–15 sec"
      },
      {
        "number": 237,
        "priority": "BACKUP",
        "question": "What does a resistor do?",
        "answer": "A resistor limits current and can create a voltage drop in a circuit.",
        "memory": "LIMIT CURRENT → VOLTAGE DROP",
        "seconds": "5–10 sec"
      },
      {
        "number": 238,
        "priority": "BACKUP",
        "question": "What does a capacitor do?",
        "answer": "A capacitor stores energy in an electric field by separating charge. It is often used to smooth voltage changes or filter signals.",
        "memory": "ELECTRIC FIELD → STORE ENERGY",
        "seconds": "10–15 sec"
      },
      {
        "number": 239,
        "priority": "BACKUP",
        "question": "What does a diode do?",
        "answer": "A diode mainly allows current to flow more easily in one direction than the other.",
        "memory": "DIODE → MAINLY ONE DIRECTION",
        "seconds": "5–10 sec"
      },
      {
        "number": 240,
        "priority": "BACKUP",
        "question": "Analog vs digital?",
        "answer": "Analog signals can change continuously over a range. Digital signals use separate states, usually 0 and 1.",
        "memory": "CONTINUOUS → DISCRETE STATES",
        "seconds": "10–15 sec"
      },
      {
        "number": 241,
        "priority": "BACKUP",
        "question": "What is binary?",
        "answer": "Binary is a number system that uses only 0 and 1. Digital systems use these two states to represent data.",
        "memory": "BINARY → ZERO AND ONE",
        "seconds": "10–15 sec"
      },
      {
        "number": 242,
        "priority": "BACKUP",
        "question": "What does AND do?",
        "answer": "AND gives output 1 only when all required inputs are 1.",
        "memory": "AND → ALL ONES",
        "seconds": "5–10 sec"
      },
      {
        "number": 243,
        "priority": "BACKUP",
        "question": "What does OR do?",
        "answer": "OR gives output 1 when at least one input is 1.",
        "memory": "OR → ANY ONE",
        "seconds": "5–10 sec"
      },
      {
        "number": 244,
        "priority": "BACKUP",
        "question": "What does NOT do?",
        "answer": "NOT reverses the input. If the input is 1, the output is 0, and vice versa.",
        "memory": "NOT → REVERSE",
        "seconds": "5–10 sec"
      },
      {
        "number": 245,
        "priority": "BACKUP",
        "question": "What does XOR do?",
        "answer": "For two inputs, XOR gives output 1 when the inputs are different and 0 when they are the same.",
        "memory": "TWO-INPUT XOR → DIFFERENT",
        "seconds": "10–15 sec"
      },
      {
        "number": 246,
        "priority": "PREPARE",
        "question": "What is mean?",
        "answer": "The mean is the average. Add all the values and divide by how many values there are.",
        "memory": "SUM ÷ COUNT",
        "seconds": "10–15 sec"
      },
      {
        "number": 247,
        "priority": "PREPARE",
        "question": "What is standard deviation at an intuitive level?",
        "answer": "Standard deviation tells us how spread out the values are around the average. A small value means the data is more tightly grouped.",
        "memory": "SPREAD AROUND MEAN",
        "seconds": "10–15 sec"
      },
      {
        "number": 248,
        "priority": "PREPARE",
        "question": "What is an outlier?",
        "answer": "An outlier is a value that is very different from most of the other data. I would investigate it instead of deleting it automatically.",
        "memory": "UNUSUAL VALUE → INVESTIGATE",
        "seconds": "10–15 sec"
      },
      {
        "number": 249,
        "priority": "PREPARE",
        "question": "Why does sample size matter?",
        "answer": "A result from very few samples can change a lot by chance. A larger and representative sample usually gives a more reliable picture.",
        "memory": "SMALL SAMPLE → CHANCE VARIATION",
        "seconds": "10–15 sec"
      },
      {
        "number": 250,
        "priority": "PREPARE",
        "question": "How would you compare two groups of test data?",
        "answer": "First, I would make sure the two groups are comparable. Then I would compare sample size, yield, average, spread, failure types, and the test conditions. I would not make a conclusion from only one number.",
        "memory": "COMPARABLE GROUPS → COUNT/SPREAD/YIELD",
        "seconds": "15–20 sec"
      }
    ]
  },
  {
    "id": "hr-fit",
    "title": "H. HR / Work-Fit Questions",
    "subtitle": "Likely high-value questions in a short recruitment-event interview.",
    "range": "Q251–Q285",
    "items": [
      {
        "number": 251,
        "priority": "PREPARE",
        "question": "Why do you want this job?",
        "answer": "I want this job because PTE combines data analysis, testing, debugging, and real engineering problems. It lets me use my software and analysis strengths while learning semiconductor testing.",
        "memory": "TEST → DATA → REAL PROBLEMS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 252,
        "priority": "PREPARE",
        "question": "Why do you want to work for ASE?",
        "answer": "ASE is a major company in semiconductor packaging and testing. The PTE role matches my interest in test data and problem solving, and I think it is a strong place to learn from experienced engineers.",
        "memory": "ASE → TESTING → LEARNING",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 253,
        "priority": "PREPARE",
        "question": "Why should ASE choose you?",
        "answer": "I can bring Python, data analysis, and careful debugging. In research, I compared results across conditions and kept the baseline when a change did not pass the full evaluation. I can bring that care to PTE while learning the test equipment.",
        "memory": "PYTHON → BASELINE EXAMPLE → PTE",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 254,
        "priority": "CORE",
        "question": "What are your strengths?",
        "answer": "My main strength is checking problems step by step. In research, I compare results under the same rules and test possible causes. When a preprocessing change helped only some conditions, I kept the baseline instead of calling it a success.",
        "note": "One main strength + one short example.",
        "memory": "STEP BY STEP → REAL EXAMPLE",
        "story": "strength",
        "seconds": "20–25 sec"
      },
      {
        "number": 255,
        "priority": "CORE",
        "question": "What is your biggest weakness?",
        "answer": "Sometimes I explain too many technical details before checking what the other person needs. That can make my main point harder to follow. I am practicing a clearer approach: answer first, give one example, then add detail only if asked.",
        "memory": "TOO MUCH DETAIL → ANSWER FIRST",
        "story": "weakness",
        "seconds": "20–25 sec"
      },
      {
        "number": 256,
        "priority": "PREPARE",
        "question": "What are you doing to improve that weakness?",
        "answer": "I am practicing short explanations: the main answer, one example, then a pause. This helps me check whether the other person wants more detail.",
        "needsFact": "Only claim timed practice if you have actually done it.",
        "memory": "ANSWER → EXAMPLE → PAUSE",
        "story": "weakness",
        "seconds": "10–15 sec"
      },
      {
        "number": 257,
        "priority": "PREPARE",
        "question": "What are your career goals?",
        "answer": "My short-term goal is to become strong in product testing and semiconductor problem solving. Over time, I want to become an engineer who understands both the test domain and the software or data side.",
        "memory": "TEST KNOWLEDGE → DATA SKILLS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 258,
        "priority": "PREPARE",
        "question": "Where do you see yourself in three years?",
        "answer": "I want to be a reliable PTE who understands the product and test flow, can investigate abnormal yield, and can use data and programming to support the team.",
        "memory": "RELIABLE PTE → YIELD DEBUGGING",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 259,
        "priority": "PREPARE",
        "question": "Where do you see yourself in five years?",
        "answer": "I would like to have deeper product-test knowledge, handle more difficult yield or NPI problems, and become someone who can connect test engineering with software and data tools.",
        "memory": "DEEPER TEST SKILLS → RESPONSIBILITY",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 260,
        "priority": "PREPARE",
        "question": "Do you plan to stay in Taiwan?",
        "answer": "Yes. I would like to build my technical career in Taiwan if I find a good long-term engineering opportunity and the work and visa arrangements fit.",
        "memory": "TAIWAN CAREER → GOOD FIT",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 261,
        "priority": "PREPARE",
        "question": "How long do you plan to work in Taiwan?",
        "answer": "I want to build my technical career in Taiwan. I cannot promise an exact number of years, but I would take the role and its training seriously.",
        "memory": "CAREER INTENT → NO FALSE PROMISE",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 262,
        "priority": "PREPARE",
        "question": "When do you graduate?",
        "answer": "I currently expect to graduate in July 2027.",
        "memory": "JULY 2027",
        "story": "availability",
        "seconds": "5–10 sec"
      },
      {
        "number": 263,
        "priority": "CORE",
        "question": "When can you start?",
        "answer": "I expect to graduate in July 2027. Before then, I can discuss work that fits my studies and student-work rules. For full-time joining, I would confirm the date and work eligibility with HR.",
        "note": "Do not promise full-time work before graduation if it is not legally possible.",
        "memory": "GRADUATION → STUDENT LIMITS → HR",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 264,
        "priority": "CORE",
        "question": "Are you looking for an internship or full-time position?",
        "answer": "Before graduation, I am open to a student-compatible technical opportunity. My longer-term goal is a full-time PTE position after I finish my Master’s in 2027.",
        "memory": "STUDENT WORK NOW → FULL-TIME LATER",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 265,
        "priority": "PREPARE",
        "question": "What is your current semester/work availability?",
        "answer": "During the regular semester, the general limit is 20 hours a week with a valid student work permit. My actual available hours also depend on classes and research.",
        "needsFact": "Confirm your current permit validity and actual weekly free hours.",
        "memory": "20 HOURS → PERMIT → CLASSES",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 266,
        "priority": "CORE",
        "question": "Can you relocate to Kaohsiung?",
        "answer": "Yes. I am open to moving to Kaohsiung for the right PTE opportunity. I would plan the move around the confirmed joining date and my graduation status.",
        "memory": "KAOHSIUNG → JOINING DATE",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 267,
        "priority": "PREPARE",
        "question": "Can you relocate elsewhere in Taiwan?",
        "answer": "Yes. Taichung is convenient for me now, but I am open to other locations in Taiwan if the role is a good fit.",
        "memory": "LOCATION FLEXIBLE → ROLE FIT",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 268,
        "priority": "CORE",
        "question": "Can you work night shifts?",
        "answer": "I would like to understand the night-shift hours and frequency before committing. Before graduation, any schedule must also fit my studies and student-work rules.",
        "needsFact": "Decide your real night-shift limits before the interview.",
        "memory": "SHIFT HOURS → REAL LIMITS",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 269,
        "priority": "CORE",
        "question": "Can you work rotating shifts?",
        "answer": "Could you explain the rotation pattern? I would check it against my study schedule and work limits before confirming.",
        "needsFact": "Decide which rotation schedules you can accept.",
        "memory": "ROTATION PATTERN → CONFIRM FIT",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 270,
        "priority": "CORE",
        "question": "Can you work overtime?",
        "answer": "I understand the team may sometimes need overtime. I would discuss the expected hours before committing. While I am a student, the total must stay within my work limits.",
        "needsFact": "Confirm your willingness and limits; this answer does not promise overtime.",
        "memory": "EXPECTED HOURS → LEGAL LIMITS",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 271,
        "priority": "PREPARE",
        "question": "Can you work holidays/weekends if required?",
        "answer": "I can discuss the weekend or holiday schedule once I know the hours. I also need to check my study schedule and student-work limits before confirming.",
        "needsFact": "Confirm which weekends or holidays you can work.",
        "memory": "SCHEDULE → STUDIES → CONFIRM",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 272,
        "priority": "PREPARE",
        "question": "Can you be on-call?",
        "answer": "If the team has an on-call system, I would first understand the schedule and expectations. I am open to it if it is part of the role and fits my current legal status.",
        "memory": "ON-CALL DETAILS → CHECK FIT",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 273,
        "priority": "PREPARE",
        "question": "Are you comfortable in a manufacturing environment?",
        "answer": "Yes. I understand it is different from a university lab and requires clear procedures, documentation, teamwork, and reliability. I am willing to adapt to that environment.",
        "memory": "PROCEDURES → TEAMWORK → RELIABILITY",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 274,
        "priority": "CORE",
        "question": "Are you comfortable in a cleanroom if required?",
        "answer": "Yes. I do not have cleanroom experience yet, but I am willing to follow the gowning, safety, and operating rules after training.",
        "needsFact": "Confirm your actual willingness and any practical constraints.",
        "memory": "NO EXPERIENCE → TRAINING → RULES",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 275,
        "priority": "PREPARE",
        "question": "Are you comfortable with repetitive production problems?",
        "answer": "Yes. Repeated work does not bother me when it has a clear purpose. Repeated problems can also show patterns, and I would try to make the analysis more organized or efficient.",
        "memory": "REPEAT WORK → FIND PATTERNS",
        "seconds": "15–20 sec"
      },
      {
        "number": 276,
        "priority": "PREPARE",
        "question": "Would you be bored if the job does not involve AI every day?",
        "answer": "No. I am applying because I like engineering problem solving, not because every task must use AI. I want to learn the core PTE work first, and I can use Python or automation when it is useful.",
        "memory": "ENGINEERING FIRST → AI WHEN USEFUL",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 277,
        "priority": "PREPARE",
        "question": "If another AI company gives you an offer, would you leave?",
        "answer": "I choose a role based on long-term fit, learning, and responsibility, not only the word “AI.” If I join a PTE role, I would take that commitment seriously and build real domain knowledge.",
        "memory": "LONG-TERM FIT → REAL COMMITMENT",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 278,
        "priority": "PREPARE",
        "question": "Are you interviewing with other companies?",
        "answer": "I am looking at suitable technical opportunities in Taiwan, but I am preparing seriously for ASE because PTE matches my strengths in data, testing, and problem solving.",
        "memory": "TECHNICAL SEARCH → ASE INTEREST",
        "seconds": "10–15 sec"
      },
      {
        "number": 279,
        "priority": "PREPARE",
        "question": "Which other roles are you applying for?",
        "answer": "I mainly look for technical roles where Python, data analysis, computer vision, testing, or engineering problem solving are useful. At ASE, PTE is my first choice.",
        "memory": "DATA/VISION/TESTING → PTE FIRST",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 280,
        "priority": "PREPARE",
        "question": "What salary are you expecting?",
        "answer": "Could you share the salary range and full package for this position? I am open to discussing an offer based on the duties, location, and work schedule.",
        "memory": "RANGE → FULL PACKAGE → DUTIES",
        "seconds": "10–15 sec"
      },
      {
        "number": 281,
        "priority": "BACKUP",
        "question": "What benefits are important to you?",
        "answer": "I would like to understand the training, leave, shift allowances, and full benefits package. Clear responsibilities and good support for new engineers also matter to me.",
        "memory": "TRAINING → LEAVE → ALLOWANCES",
        "seconds": "10–15 sec"
      },
      {
        "number": 282,
        "priority": "BACKUP",
        "question": "Why did you leave your part-time job?",
        "answer": "I stopped restaurant part-time work so I could spend more time on my Master’s research and prepare for a technical career that matches my degree.",
        "memory": "LEFT RESTAURANT → TECHNICAL FOCUS",
        "story": "pressure",
        "seconds": "10–15 sec"
      },
      {
        "number": 283,
        "priority": "BACKUP",
        "question": "Tell me about your family/background.",
        "answer": "My family is in India. I came to Taiwan for my Master's and want to build a technical career here.",
        "memory": "FAMILY INDIA → MASTER'S TAIWAN",
        "seconds": "10–15 sec"
      },
      {
        "number": 284,
        "priority": "BACKUP",
        "question": "Do your parents support you working in Taiwan?",
        "answer": "My family's view is [your family's actual view]. My own goal is to build a technical career in Taiwan.",
        "needsFact": "Replace the bracket with your family’s actual view.",
        "memory": "ACTUAL FAMILY VIEW",
        "seconds": "Time after filling facts"
      },
      {
        "number": 285,
        "priority": "BACKUP",
        "question": "Are you married/single?",
        "answer": "I am [your current marital status].",
        "needsFact": "Fill only if you choose to answer this personal question.",
        "memory": "ACTUAL STATUS → BRIEF",
        "seconds": "Time after filling facts"
      }
    ]
  },
  {
    "id": "behavioral",
    "title": "I. Behavioral / Weakness-Repair Questions",
    "subtitle": "Use real stories. Never invent a dramatic success just to sound impressive.",
    "range": "Q286–Q315",
    "items": [
      {
        "number": 286,
        "priority": "CORE",
        "question": "Tell me about a difficult problem you faced.",
        "answer": "In my research, the model made much more error when hand images came from different sessions. I needed to understand the pattern before changing the model. I compared same-identity and different-identity scores, reviewed the pipeline, and tested preprocessing options under the same rules. The results showed that stable matching across sessions was a main weakness. This gave me a clearer direction for model experiments. I have measured and studied the problem, but I have not fully solved it.",
        "memory": "SESSION GAP → COMPARE → NEXT TESTS",
        "story": "session-gap",
        "seconds": "35–45 sec"
      },
      {
        "number": 287,
        "priority": "PREPARE",
        "question": "How did you solve it?",
        "answer": "I have not fully solved it. I compared the scores and tested changes under fixed rules. That showed which ideas did not improve results consistently and helped me choose the next experiments.",
        "memory": "NOT SOLVED → NARROWED DIRECTION",
        "story": "session-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 288,
        "priority": "CORE",
        "question": "Tell me about a failure.",
        "answer": "I tested preprocessing changes because I hoped they would improve verification. Some results improved, but other conditions became worse. I compared the full results with the baseline using the rule set before the experiments. The changes did not pass that rule, so I kept the baseline. I learned that a good-looking result in one condition is not enough to claim progress.",
        "memory": "MIXED RESULTS → RULE → BASELINE",
        "story": "failed-experiment",
        "seconds": "30–35 sec"
      },
      {
        "number": 289,
        "priority": "PREPARE",
        "question": "What did you learn from that failure?",
        "answer": "I learned that one good number is not enough. An improvement should be consistent across the full test setup. If it only helps one condition, I need to understand why before saying it is better.",
        "memory": "ONE NUMBER ≠ FULL IMPROVEMENT",
        "story": "failed-experiment",
        "seconds": "15–20 sec"
      },
      {
        "number": 290,
        "priority": "PREPARE",
        "question": "Tell me about an experiment that did not work.",
        "answer": "One preprocessing experiment helped some test conditions but hurt others. I compared the full results against the baseline using the same rules. Since it did not meet the acceptance rule, I did not make it the new default. The useful result was knowing which change was not reliable enough.",
        "memory": "PREPROCESSING → FULL CHECK → REJECT",
        "story": "failed-experiment",
        "seconds": "25–30 sec"
      },
      {
        "number": 291,
        "priority": "PREPARE",
        "question": "What did you do when your hypothesis was wrong?",
        "answer": "First, I checked that the code and data were correct. Then I accepted the result instead of forcing my idea. I returned to the stronger baseline, recorded what happened, and used the failure to plan the next test.",
        "memory": "CHECK → ACCEPT EVIDENCE → RECORD",
        "story": "failed-experiment",
        "seconds": "20–25 sec"
      },
      {
        "number": 292,
        "priority": "CORE",
        "question": "Tell me about a time you worked under pressure.",
        "answer": "I was balancing Master's research, classes, and restaurant work. I decided I needed more time for research and technical preparation. I left the restaurant job so I could focus on those priorities. That was a choice to reduce competing commitments, not a claim that every deadline became easy. I learned to look at my available time and decide what I can realistically take on.",
        "memory": "COMPETING WORK → PRIORITIZE → STOP",
        "story": "pressure",
        "seconds": "30–35 sec"
      },
      {
        "number": 293,
        "priority": "PREPARE",
        "question": "How do you handle stress?",
        "answer": "I first decide what is most important and urgent. Then I break the main task into smaller steps and remove low-priority work. If a problem affects other people, I communicate early instead of hiding it.",
        "memory": "PRIORITY → SMALL STEPS → COMMUNICATE",
        "story": "pressure",
        "seconds": "15–20 sec"
      },
      {
        "number": 294,
        "priority": "CORE",
        "question": "What do you do when you do not know something?",
        "answer": "I say clearly that I do not know it yet. Then I check reliable documentation or ask an experienced person, try a small example, and confirm my understanding before doing anything high-risk.",
        "memory": "HONEST → DOCUMENTATION → CONFIRM",
        "story": "learning-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 295,
        "priority": "PREPARE",
        "question": "How do you learn a completely new technical topic?",
        "answer": "I first learn what the system is for and the basic workflow. Then I learn the important terms, try a small example, and go deeper only where the job or problem needs it.",
        "memory": "PURPOSE → BASICS → SMALL EXAMPLE",
        "story": "strength",
        "seconds": "15–20 sec"
      },
      {
        "number": 296,
        "priority": "PREPARE",
        "question": "Tell me about a time you made a mistake.",
        "answer": "In [real task], I made [specific mistake]. I noticed it through [check]. I corrected [affected work] and added [prevention step]. The result was [what actually happened].",
        "needsFact": "Add one real mistake. The brackets are a preparation template, not a script to memorize.",
        "memory": "REAL MISTAKE → FIX → PREVENT",
        "seconds": "Time after filling facts"
      },
      {
        "number": 297,
        "priority": "PREPARE",
        "question": "How did you realize you were wrong?",
        "answer": "I noticed [specific unexpected result]. I checked [logs, data, or settings] and found [the actual mistake].",
        "needsFact": "Use the same verified mistake as Q296.",
        "memory": "UNEXPECTED RESULT → CHECK → CAUSE",
        "seconds": "Time after filling facts"
      },
      {
        "number": 298,
        "priority": "PREPARE",
        "question": "What did you do afterward?",
        "answer": "I corrected [the mistake] and rechecked [affected work]. I also added [real prevention step] so I would catch it earlier next time.",
        "needsFact": "Use the same verified mistake as Q296; do not claim a prevention step you did not take.",
        "memory": "CORRECT → RECHECK → PREVENT",
        "seconds": "Time after filling facts"
      },
      {
        "number": 299,
        "priority": "CORE",
        "question": "Tell me about teamwork.",
        "answer": "We collected hand images as a team for the research project. My part was to take part in collection, while the coding and experiments for my assigned research were mainly my own work. The team collection gave us the images needed for the study. This is a useful example of shared work and individual responsibility: I can explain my technical part clearly while giving the team credit for the data.",
        "memory": "TEAM DATA → MY WORK → CREDIT",
        "story": "teamwork",
        "seconds": "30–40 sec"
      },
      {
        "number": 300,
        "priority": "CORE",
        "question": "Tell me about a disagreement with a teammate.",
        "answer": "In [real situation], my teammate and I disagreed about [specific point]. I listened to their reason, explained mine, and we [actual action]. The result was [actual outcome].",
        "needsFact": "Add one real disagreement. If none comes to mind, say so and explain your approach to a hypothetical disagreement.",
        "memory": "REAL DIFFERENCE → ACTION → OUTCOME",
        "story": "teamwork",
        "seconds": "Time after filling facts"
      },
      {
        "number": 301,
        "priority": "PREPARE",
        "question": "What if your teammate disagrees with your solution?",
        "answer": "I would first ask why they disagree. Then we can compare the assumptions and evidence, and if possible test both ideas on a small case. If we still disagree and it affects the team, I would ask the responsible lead.",
        "memory": "LISTEN → EVIDENCE → SMALL TEST",
        "story": "teamwork",
        "seconds": "20–25 sec"
      },
      {
        "number": 302,
        "priority": "PREPARE",
        "question": "What if your manager disagrees with you?",
        "answer": "I would first understand the manager’s reason and constraints. If I still see a problem, I would explain my concern with data and respect. After a decision is made, I would follow it unless there is a serious safety, quality, legal, or ethical issue.",
        "memory": "UNDERSTAND → EXPLAIN → FOLLOW SAFELY",
        "seconds": "20–25 sec"
      },
      {
        "number": 303,
        "priority": "PREPARE",
        "question": "What if you think your manager is wrong?",
        "answer": "I would check my information first. Then I would explain the concern with data, ask questions, and suggest a way to test it. If there is a serious quality or safety risk, I would use the proper escalation process.",
        "memory": "CHECK → DATA → ESCALATE RISK",
        "seconds": "20–25 sec"
      },
      {
        "number": 304,
        "priority": "PREPARE",
        "question": "How do you communicate bad news?",
        "answer": "I communicate it early and clearly. I explain what happened, what is affected, what I know, what I still do not know, and what I am doing next.",
        "memory": "EARLY → IMPACT → NEXT STEP",
        "story": "pressure",
        "seconds": "15–20 sec"
      },
      {
        "number": 305,
        "priority": "PREPARE",
        "question": "What if you discover a serious problem late?",
        "answer": "I would not hide it. I would quickly confirm the issue, tell the responsible people, help limit the impact, and continue the investigation with the clearest facts I have.",
        "memory": "CONFIRM → INFORM → LIMIT IMPACT",
        "story": "pressure",
        "seconds": "15–20 sec"
      },
      {
        "number": 306,
        "priority": "PREPARE",
        "question": "What if you cannot meet a deadline?",
        "answer": "I would identify the blocker early and tell the team before the deadline. I would explain what is finished, what is at risk, and suggest a realistic recovery plan instead of surprising them at the end.",
        "memory": "EARLY NOTICE → REALISTIC PLAN",
        "story": "pressure",
        "seconds": "15–20 sec"
      },
      {
        "number": 307,
        "priority": "PREPARE",
        "question": "How do you prioritize multiple urgent tasks?",
        "answer": "I check safety and quality risks first, then deadlines and which tasks are blocking others. If two tasks conflict, I confirm the order with the person responsible and explain the trade-off.",
        "memory": "SAFETY → IMPACT → DEADLINE",
        "story": "pressure",
        "seconds": "15–20 sec"
      },
      {
        "number": 308,
        "priority": "PREPARE",
        "question": "How do you deal with unclear instructions?",
        "answer": "I repeat what I think the requirement means, ask about the unclear part, and confirm the expected result and deadline. I would rather ask one clear question than make a wrong guess.",
        "memory": "REPEAT → CLARIFY → CONFIRM",
        "story": "pressure",
        "seconds": "15–20 sec"
      },
      {
        "number": 309,
        "priority": "PREPARE",
        "question": "What if a customer asks for something impossible?",
        "answer": "First, I would understand what the customer really needs. Then I would explain the technical limit with evidence, suggest another possible solution, and discuss it with the responsible manager or team before making a promise.",
        "memory": "NEED → LIMIT → ALTERNATIVE",
        "seconds": "15–20 sec"
      },
      {
        "number": 310,
        "priority": "PREPARE",
        "question": "If you already explained that something cannot be done and the customer insists, what do you do?",
        "answer": "I would stay professional and not make a false promise. I would document the request and the technical limits, then involve the responsible manager or team to find an approved alternative.",
        "memory": "NO FALSE PROMISE → INVOLVE LEAD",
        "seconds": "15–20 sec"
      },
      {
        "number": 311,
        "priority": "PREPARE",
        "question": "Would you promise a customer something you are not sure the team can deliver?",
        "answer": "No. I would say I need to confirm with the responsible team before promising it. A careful answer is better than making a promise the team cannot meet.",
        "memory": "CONFIRM BEFORE PROMISING",
        "seconds": "15–20 sec"
      },
      {
        "number": 312,
        "priority": "PREPARE",
        "question": "How do you use data to support a difficult decision?",
        "answer": "I first decide what result matters. Then I check the data quality, compare the relevant groups or before-and-after conditions, and look for a consistent pattern. If the evidence is not complete, I say that clearly.",
        "memory": "QUESTION → DATA → COMPARISON",
        "story": "failed-experiment",
        "seconds": "15–20 sec"
      },
      {
        "number": 313,
        "priority": "PREPARE",
        "question": "Give an example of systematic debugging.",
        "answer": "In my research, I found much worse results across sessions. I compared score patterns and ran controlled preprocessing experiments instead of changing many things together. Some changes helped only some conditions, so I kept the baseline under the planned evaluation rule.",
        "memory": "SCORES → CONTROLLED TESTS → BASELINE",
        "story": "failed-experiment",
        "seconds": "20–25 sec"
      },
      {
        "number": 314,
        "priority": "PREPARE",
        "question": "What is one weakness you are actively fixing before joining industry?",
        "answer": "I am improving my semiconductor-test and electronics knowledge because my academic background is CS and AI. I am focusing on PTE basics such as test flow, ATE, yield, abnormal-result analysis, and basic electrical concepts.",
        "memory": "ELECTRONICS GAP → BASIC TEST STUDY",
        "story": "learning-gap",
        "seconds": "15–20 sec"
      },
      {
        "number": 315,
        "priority": "PREPARE",
        "question": "What is your biggest knowledge gap for PTE?",
        "answer": "My biggest gap is direct hands-on experience with semiconductor products, ATE systems, and manufacturing test procedures. I understand the basic ideas, but I would need company training and real practice to become strong in the exact environment.",
        "memory": "HANDS-ON GAP → TRAINING",
        "story": "learning-gap",
        "seconds": "15–20 sec"
      }
    ]
  }
];
