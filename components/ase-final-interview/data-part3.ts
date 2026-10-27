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
        "priority": "CORE",
        "question": "Why do you want this job?",
        "answer": "I’m interested in PTE because I like working with data and finding why results change.\n\nIn my research, I run experiments, compare results and investigate problems step by step. PTE uses a similar way of thinking for test data, yield and abnormal results.\n\nI still need to learn the semiconductor test hardware, but I’m interested in learning that part.",
        "memory": "DATA → FIND WHY → PTE → LEARN HARDWARE",
        "story": "role-fit",
        "seconds": "20–30 sec"
      },
      {
        "number": 252,
        "priority": "CORE",
        "question": "Why do you want to work for ASE?",
        "answer": "ASE is one of the major companies in semiconductor packaging and testing.\n\nWhat interests me is that testing is a core part of the company, and the PTE role involves test data, yield analysis and problem investigation.\n\nI think it is a good place for me to learn semiconductor testing while using my data-analysis and problem-solving skills.",
        "memory": "ASE → TESTING → DATA → LEARN",
        "story": "role-fit",
        "seconds": "20–30 sec"
      },
      {
        "number": 253,
        "priority": "CORE",
        "question": "Why should ASE choose you?",
        "answer": "I don’t want to say that I already know semiconductor testing, because I am still learning it.\n\nBut I can bring Python, data analysis and a careful way of solving problems.\n\nIn my research, when results become worse, I check the data, compare conditions and test possible causes instead of guessing.\n\nI think that way of working can transfer well to PTE.",
        "memory": "HONEST → PYTHON → CHECK → COMPARE → TEST",
        "story": "role-fit",
        "seconds": "25–35 sec"
      },
      {
        "number": 254,
        "priority": "CORE",
        "question": "What are your strengths?",
        "answer": "My main strength is systematic problem solving.\n\nWhen I see a problem, I try not to change many things at once. I first check the data, compare the conditions and then test possible causes one by one.\n\nThat is how I work in my research, and I think it is also useful for PTE.",
        "note": "One main strength + one short example.",
        "memory": "STEP BY STEP → ONE CAUSE AT A TIME",
        "story": "strength",
        "seconds": "20–30 sec"
      },
      {
        "number": 255,
        "priority": "CORE",
        "question": "What is your biggest weakness?",
        "answer": "Sometimes I go too deep into technical details when a shorter explanation would be enough.\n\nI am improving this by giving the main answer first, then one example, and adding more details only if the other person needs them.",
        "memory": "TOO MUCH DETAIL → MAIN ANSWER FIRST",
        "story": "weakness",
        "seconds": "20 sec"
      },
      {
        "number": 256,
        "priority": "PREPARE",
        "question": "What are you doing to improve that weakness?",
        "answer": "Before I explain something, I now try to think about the main point first.\n\nI give the direct answer, one example, and then I stop. If they want more detail, I can explain further.",
        "memory": "ANSWER → EXAMPLE → STOP",
        "story": "weakness",
        "seconds": "15 sec"
      },
      {
        "number": 257,
        "priority": "PREPARE",
        "question": "What are your career goals?",
        "answer": "In the next few years, I want to build strong hands-on engineering experience.\n\nFor PTE, I want to learn test flow, yield analysis and how engineers investigate abnormal results.\n\nI also want to keep using Python and data analysis where they can help the work.",
        "memory": "TEST KNOWLEDGE + DATA SKILLS",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 258,
        "priority": "PREPARE",
        "question": "Where do you see yourself in three years?",
        "answer": "In three years, I want to be able to handle normal PTE work more independently.\n\nI want to understand the product, test flow and yield problems well enough to investigate issues and contribute without needing help for every step.",
        "memory": "INDEPENDENT PTE → PRODUCT → TEST → YIELD",
        "story": "role-fit",
        "seconds": "20 sec"
      },
      {
        "number": 259,
        "priority": "PREPARE",
        "question": "Where do you see yourself in five years?",
        "answer": "In five years, I want to have deeper technical responsibility.\n\nI would like to handle more difficult test or yield problems and also use software or data tools to make some work more efficient.",
        "memory": "DEEPER RESPONSIBILITY → HARDER PROBLEMS → DATA",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 260,
        "priority": "PREPARE",
        "question": "Do you plan to stay in Taiwan?",
        "answer": "Yes. For the next stage of my career, I am open to building my career in Taiwan.\n\nI came here for my Master’s, and if I get a good technical opportunity after graduation, I am willing to continue working here.",
        "memory": "MASTER'S TAIWAN → CAREER TAIWAN",
        "story": "role-fit",
        "seconds": "15 sec"
      },
      {
        "number": 261,
        "priority": "PREPARE",
        "question": "How long do you plan to work in Taiwan?",
        "answer": "I don’t have a fixed number of years in mind.\n\nMy immediate plan is to start my technical career here after graduation and take the role I join seriously.",
        "memory": "NO FAKE NUMBER → SERIOUS COMMITMENT",
        "story": "role-fit",
        "seconds": "10–15 sec"
      },
      {
        "number": 262,
        "priority": "PREPARE",
        "question": "When do you graduate?",
        "answer": "I expect to graduate in July 2027.",
        "memory": "JULY 2027",
        "story": "availability",
        "seconds": "5 sec"
      },
      {
        "number": 263,
        "priority": "CORE",
        "question": "When can you start?",
        "answer": "For full-time work, I can join after I complete my Master’s in July 2027.\n\nBefore graduation, if ASE has a suitable internship or student position, I am also open to discussing it within the student work rules.",
        "memory": "FULL-TIME → AFTER JULY 2027",
        "story": "availability",
        "seconds": "15 sec"
      },
      {
        "number": 264,
        "priority": "CORE",
        "question": "Are you looking for an internship or full-time position?",
        "answer": "My main goal from this event is a full-time technical position after I graduate in July 2027.\n\nBefore graduation, I am also open to a suitable technical internship or part-time opportunity if ASE has one.",
        "memory": "FULL-TIME 2027 → INTERNSHIP POSSIBLE NOW",
        "story": "availability",
        "seconds": "15 sec"
      },
      {
        "number": 265,
        "priority": "PREPARE",
        "question": "What is your current semester/work availability?",
        "answer": "During the semester, I can work within the student work limit and around my class and research schedule.\n\nThe legal limit for foreign students is up to 20 hours per week during the semester.",
        "memory": "20 HOURS → CLASSES → RESEARCH",
        "story": "availability",
        "seconds": "15 sec"
      },
      {
        "number": 266,
        "priority": "CORE",
        "question": "Can you relocate to Kaohsiung?",
        "answer": "Yes.\n\nIf I receive the right PTE opportunity, I am willing to relocate to Kaohsiung after graduation.",
        "memory": "YES → KAOHSIUNG",
        "story": "availability",
        "seconds": "5–10 sec"
      },
      {
        "number": 267,
        "priority": "PREPARE",
        "question": "Can you relocate elsewhere in Taiwan?",
        "answer": "Yes. I am studying in Taichung now, but I am open to other locations in Taiwan for the right technical role.",
        "memory": "TAICHUNG NOW → FLEXIBLE LATER",
        "story": "availability",
        "seconds": "10 sec"
      },
      {
        "number": 268,
        "priority": "BACKUP",
        "question": "Can you work night shifts?",
        "answer": "I am open to discussing it if the role requires night shifts.\n\nI would like to understand the exact schedule and frequency before confirming.",
        "needsFact": "Decide your real night-shift limits before the interview.",
        "memory": "OPEN → CHECK SCHEDULE",
        "story": "availability",
        "seconds": "10 sec"
      },
      {
        "number": 269,
        "priority": "BACKUP",
        "question": "Can you work rotating shifts?",
        "answer": "I am open to discussing rotating shifts if they are part of the position.\n\nI would first like to understand the rotation pattern and working hours.",
        "needsFact": "Decide which rotation schedules you can actually accept.",
        "memory": "OPEN → UNDERSTAND ROTATION",
        "story": "availability",
        "seconds": "10 sec"
      },
      {
        "number": 270,
        "priority": "PREPARE",
        "question": "Can you work overtime?",
        "answer": "I understand that engineering work sometimes needs overtime when there is an urgent production or technical problem.\n\nI can be flexible when it is needed. Before graduation, of course, I still need to follow the student work limits.",
        "memory": "URGENT PROBLEM → FLEXIBLE",
        "story": "availability",
        "seconds": "15–20 sec"
      },
      {
        "number": 271,
        "priority": "BACKUP",
        "question": "Can you work holidays/weekends if required?",
        "answer": "If occasional weekend or holiday support is part of the role, I can be flexible.\n\nI would just like to understand how often it is normally required.",
        "memory": "OCCASIONAL → FLEXIBLE → FREQUENCY",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 272,
        "priority": "BACKUP",
        "question": "Can you be on-call?",
        "answer": "If on-call support is part of the PTE role, I am open to it.\n\nI would first like to understand how often it happens and what the expected response time is.",
        "memory": "OPEN → FREQUENCY → EXPECTATION",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 273,
        "priority": "PREPARE",
        "question": "Are you comfortable in a manufacturing environment?",
        "answer": "Yes.\n\nI understand that a manufacturing environment requires following procedures, paying attention to quality and safety, documenting work clearly and responding to problems on time.\n\nI am comfortable learning that way of working.",
        "memory": "PROCEDURE → QUALITY → SAFETY → RESPONSE",
        "story": "availability",
        "seconds": "20 sec"
      },
      {
        "number": 274,
        "priority": "BACKUP",
        "question": "Are you comfortable in a cleanroom if required?",
        "answer": "Yes, if the role requires it.\n\nI do not have cleanroom experience yet, but I am comfortable learning the gowning, safety and operating procedures.",
        "memory": "NO EXPERIENCE → WILL LEARN RULES",
        "story": "availability",
        "seconds": "10–15 sec"
      },
      {
        "number": 275,
        "priority": "PREPARE",
        "question": "Are you comfortable with repetitive production problems?",
        "answer": "Yes.\n\nI don’t expect every engineering problem to be completely new. If the same problem happens repeatedly, that can actually help us find a pattern.\n\nI would focus on solving it accurately and, if possible, make the analysis more efficient.",
        "memory": "REPEAT → PATTERN → IMPROVE",
        "story": "availability",
        "seconds": "20 sec"
      },
      {
        "number": 276,
        "priority": "CORE",
        "question": "Would you be bored if the job does not involve AI every day?",
        "answer": "No.\n\nI am applying for PTE because I like solving engineering problems with data, not because every task must involve AI.\n\nI want to learn the core testing work properly first. If Python or automation can help later, I can use those skills when they are useful.",
        "memory": "ENGINEERING FIRST → AI ONLY WHEN USEFUL",
        "story": "role-fit",
        "seconds": "20–25 sec"
      },
      {
        "number": 277,
        "priority": "PREPARE",
        "question": "If another AI company gives you an offer, would you leave?",
        "answer": "I don’t make a career decision only based on the job title.\n\nI look at the work, what I can learn and the responsibility I can build.\n\nIf I accept a PTE role, I would join with the intention of learning the domain properly and doing the job seriously.",
        "memory": "NOT TITLE → WORK → LEARNING → COMMITMENT",
        "story": "role-fit",
        "seconds": "20 sec"
      },
      {
        "number": 278,
        "priority": "PREPARE",
        "question": "Are you interviewing with other companies?",
        "answer": "Yes, I am exploring suitable technical opportunities in Taiwan.\n\nI am mainly looking for roles where I can use data, programming and engineering problem solving. I am preparing seriously for ASE because PTE is one role that fits those strengths.",
        "memory": "YES → TECHNICAL ROLES → ASE SERIOUS",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 279,
        "priority": "PREPARE",
        "question": "Which other roles are you applying for?",
        "answer": "I am mainly looking at technical engineering roles involving data analysis, testing, computer vision or software-based problem solving.\n\nAt ASE, PTE is my first choice because it is the role that best connects with my data and debugging background.",
        "memory": "TECHNICAL ROLES → ASE PTE FIRST",
        "story": "role-fit",
        "seconds": "15 sec"
      },
      {
        "number": 280,
        "priority": "PREPARE",
        "question": "What salary are you expecting?",
        "answer": "I am flexible.\n\nI understand ASE has a salary range depending on the candidate and the position. As a new graduate, I would be comfortable discussing the standard package for the PTE role.\n\nI am also considering the responsibilities, training and overall package.",
        "note": "If they insist on a number: around NT$50,000/month is a reasonable discussion point, but stay flexible based on the full package and responsibilities.",
        "memory": "FLEXIBLE → STANDARD PTE PACKAGE",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 281,
        "priority": "BACKUP",
        "question": "What benefits are important to you?",
        "answer": "At the start of my career, training and learning support are very important to me.\n\nI would also like to understand the normal insurance, leave and any overtime or shift allowances that come with the position.",
        "memory": "TRAINING FIRST → STANDARD BENEFITS",
        "story": "role-fit",
        "seconds": "15 sec"
      },
      {
        "number": 282,
        "priority": "BACKUP",
        "question": "Why did you leave your part-time job?",
        "answer": "My Master’s research and technical career preparation needed more of my time.\n\nSo I decided to stop the restaurant part-time job and use that time for research, interview preparation and technical learning related to my degree.",
        "memory": "TIME → RESEARCH → TECHNICAL CAREER",
        "story": "pressure",
        "seconds": "15 sec"
      },
      {
        "number": 283,
        "priority": "BACKUP",
        "question": "Tell me about your family/background.",
        "answer": "My family is in India, and I came to Taiwan for my Master’s degree.\n\nLiving and studying here has helped me become more independent and adapt to a different environment.\n\nRight now, my main focus is building my technical career.",
        "memory": "INDIA → TAIWAN → INDEPENDENT",
        "story": "role-fit",
        "seconds": "15–20 sec"
      },
      {
        "number": 284,
        "priority": "BACKUP",
        "question": "Do your parents support you working in Taiwan?",
        "answer": "Yes. My family supports my education and career decisions.\n\nIf I get a good technical opportunity in Taiwan, they are comfortable with me working here.",
        "needsFact": "Use this only if it matches your family's real view.",
        "memory": "YES → FAMILY SUPPORT",
        "story": "role-fit",
        "seconds": "10 sec"
      },
      {
        "number": 285,
        "priority": "BACKUP",
        "question": "Are you married/single?",
        "answer": "I am single.",
        "needsFact": "Change only if your real marital status is different.",
        "memory": "ACTUAL STATUS → BRIEF",
        "story": "role-fit",
        "seconds": "5 sec"
      }
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
