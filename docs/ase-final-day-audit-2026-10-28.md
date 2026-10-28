# ASE Final-Day interview: source, resume and relevance audit (October 28, 2026)

## Scope and result

- Original Q1–Q100 examined individually against the attached October 28 candidate resume, source content, and published ASE testing and PTE role information.
- **43 original answers revised**, **57 original answers retained**, **13 new scenario questions** (Q101–Q113), **0 original questions deleted or renumbered**, and **0 exact-duplicate question titles**.
- Post-edit priority distribution: **25 must know, 38 high, 37 medium, 13 backup**.
- Original question numbers remain stable so localStorage preparation marks for Q1–Q100 are retained; UI now also accepts Q101–Q113.
- Relevant topic coverage reviewed: HR, research ownership and metrics, CP/FT, ATE hardware, packaging, yield, NPI, failure scenarios, resume skills, and Pinyin-only Chinese.
- An answer is not certified as an experimentally verified personal fact merely because it was reviewed. User resume and brief are the candidate-fact basis.

## Evidence used

1. ASE Kaohsiung official test services: https://asekh.aseglobal.com/products-services/test.html — wafer probing, final test, testers/probers/handlers, test data and bin management.
2. ASE Kaohsiung official role descriptions: https://asekh.aseglobal.com/about-us/join-us.html — test engineer yield analysis and process improvement.
3. ASE Kaohsiung Product Test Engineer listing (104): https://www.104.com.tw/company/yxcvx7k — yield monitoring, NPI validation, abnormal yield improvement, test-data follow-up.
4. ASE global test services: https://ase.aseglobal.com/ch/test-services/ — wafer probing, final test, test tooling and programs.
5. Published LAWNet: DOI 10.1109/TIM.2023.3328702 (RGB wrist vein verification), an external baseline rather than original architecture.
6. Attached October 28 resume: expected July 2027 graduation, 0.857 ROI localization mean IoU on held-out subjects, 3,134 usable images/314 hand identities, published baseline testing, ONNX Runtime, SQLite, paper accepted for December presentation. These are candidate-provided facts, not independently verified experiment logs.

## Critical corrections

- **Q22–Q23:** Removed 3,140 raw-image count, 157 volunteer count, and 1,600/80 paper data figures because independent original records were not available. Do not conflate ROI paper evaluation with broader verification research.
- **Q31:** Removed historical EER values 3.53%, 5.33%, 14.57%, which were not verifiable from supplied primary logs.
- **Q17, Q29–Q30:** Avoid claiming that normal RGB images are equivalent to NIR vein measurements or that the published LAWNet architecture was invented by the candidate.
- **Q26:** 0.857 mean IoU measures ROI localization, not biometric recognition success.
- **Q37–Q38:** Mobile data collection ≠ completed smartphone recognition; the AIAT 2026 presentation has not yet happened.
- **Q39, Q41, Q44–Q49:** Correct customer-specific assembly/test flow; distinguish CP, FT and different wire-bond versus flip-chip packaging paths.
- **Q54, Q57–Q59:** A failure bin or correlation is a clue, not proof. No production limit changes or uncontrolled repeat tests without authorization.
- **Q79:** No made-up SQLite schema.

## Personal facts requiring original evidence before giving more specific numbers

- Original AIAT paper/manuscript for its exact sample/volunteer counts, date, author list, contribution and 0.857 evaluation definition.
- Baseline experiment notebooks/logs for historical EER percentages and dataset split protocol.
- Exact embedding table schema and storage encoding if technical questioning goes beyond the local-test summary.
- Job contract/eligibility, start date, shift expectations and language requirements are site and offer-specific, not guaranteed.

## Original question-by-question audit

| ID | Question | Tier | Outcome | Note |
|---|---|---|---|---|
| Q1 | Tell me about yourself. | MUST | Revised | No specific correction required from available evidence |
| Q2 | Walk me through your resume. | HIGH | Revised | No specific correction required from available evidence |
| Q3 | Why do you want to join ASE? | MUST | Revised | No specific correction required from available evidence |
| Q4 | Why do you want to become a Product Test Engineer? | MUST | Revised | No specific correction required from available evidence |
| Q5 | You studied CS and AI. Why are you applying for a semiconductor testing role? | MUST | Retained after review | No specific correction required from available evidence |
| Q6 | Why should we hire you instead of an EE graduate? | MUST | Revised | No specific correction required from available evidence |
| Q7 | What do you know about ASE? | MUST | Revised | No specific correction required from available evidence |
| Q8 | What are your main strengths? | HIGH | Revised | No specific correction required from available evidence |
| Q9 | What is your biggest weakness? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q10 | What achievement are you most proud of? | HIGH | Revised | No specific correction required from available evidence |
| Q11 | Tell me about a difficult problem you faced and how you handled it. | HIGH | Revised | No specific correction required from available evidence |
| Q12 | What do you do when you do not know how to solve a problem? | HIGH | Retained after review | No specific correction required from available evidence |
| Q13 | When will you graduate, and when can you start working? | MUST | Retained after review | No specific correction required from available evidence |
| Q14 | Are you willing to relocate to Kaohsiung? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q15 | Are you willing to work overtime or rotating shifts? | HIGH | Retained after review | No specific correction required from available evidence |
| Q16 | Explain your research project in simple English. | MUST | Revised | No specific correction required from available evidence |
| Q17 | Why did your professor start this research? What problem are you trying to solve? | MEDIUM | Revised | Distinguish ordinary RGB features from NIR vein sensing |
| Q18 | What is the difference between biometric verification and identification? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q19 | Why use normal RGB smartphone images instead of special infrared cameras? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q20 | What exactly did YOU do in this research? | MUST | Revised | No specific correction required from available evidence |
| Q21 | How did you collect the images? Did you collect all the data yourself? | HIGH | Revised | No specific correction required from available evidence |
| Q22 | What do 3,134 usable images and 314 identities mean? | HIGH | Revised | Removed unsupported raw-image/participant totals; kept supported 3,134 and 314 |
| Q23 | Why does your accepted paper use 1,600 images from 80 volunteers instead? | MEDIUM | Revised | Removed paper sample-count claims not corroborated by attached resume |
| Q24 | What is ROI, and why do you need ROI extraction? | HIGH | Retained after review | No specific correction required from available evidence |
| Q25 | How does your ROI extraction work using MediaPipe and OpenCV? | HIGH | Retained after review | No specific correction required from available evidence |
| Q26 | What is IoU, and what does 0.857 mean? | MUST | Revised | IoU is ROI overlap, not biometric accuracy; 0.857 from attached resume |
| Q27 | What were the main ROI failure cases? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q28 | Tell me about one abnormal result you found and how you investigated it. | HIGH | Revised | No specific correction required from available evidence |
| Q29 | Which lightweight baseline model did you use, and why? | MUST | Revised | LAWNet is a published RGB wrist-vein baseline, not original work |
| Q30 | Did you develop LAWNet yourself? | MEDIUM | Revised | No specific correction required from available evidence |
| Q31 | What happened to performance when the capture session changed? | MUST | Revised | Removed three unverified historical EER percentages |
| Q32 | How did you measure the performance drop? What are EER and similarity scores? | HIGH | Revised | No specific correction required from available evidence |
| Q33 | What changes did you compare, and how did you decide if they helped? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q34 | Why are you still developing the final model? What is left to finish? | MEDIUM | Revised | No specific correction required from available evidence |
| Q35 | Why did you use ONNX before finalizing the model? | HIGH | Revised | No specific correction required from available evidence |
| Q36 | What did you use SQLite for in the biometric system? | HIGH | Retained after review | No specific correction required from available evidence |
| Q37 | Did you deploy the final model on a smartphone? | MUST | Revised | Mobile capture and ONNX experiments are not finished mobile recognition deployment |
| Q38 | Tell me about your AIAT 2026 paper and your contribution. | MUST | Revised | Accepted for December presentation, not yet presented |
| Q39 | What does ASE do? | MUST | Revised | Avoid presenting customer's variable assembly/test scope as a universal flow |
| Q40 | What does OSAT stand for? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q41 | Explain the complete semiconductor flow from design to shipment. | MUST | Revised | Add common-flow qualification and product-specific exceptions |
| Q42 | What is the difference between a wafer, die and packaged chip? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q43 | What is the difference between a chip-design company, foundry and ASE? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q44 | When a processed wafer arrives at ASE, what happens next? | MEDIUM | Revised | No specific correction required from available evidence |
| Q45 | What is CP or wafer probing? | MUST | Revised | Avoid unverified expansion of CP acronym; use wafer sort/probing |
| Q46 | What is FT or final test? | MUST | Revised | No specific correction required from available evidence |
| Q47 | What is the difference between CP and FT? | MUST | Revised | No specific correction required from available evidence |
| Q48 | What is wafer dicing? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q49 | Explain the main packaging steps. | MUST | Revised | Package-specific assembly sequence; wire bond differs from flip chip |
| Q50 | What is the difference between wire bonding and flip chip? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q51 | Why does a chip need packaging? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q52 | What are ATE, a prober and a probe card? | HIGH | Revised | No specific correction required from available evidence |
| Q53 | What are a handler, socket and load board? | HIGH | Revised | No specific correction required from available evidence |
| Q54 | What do DUT and binning mean? | HIGH | Revised | Failure bins are diagnostic clues, not confirmed root causes |
| Q55 | What is a test program, and what can ATE test? | HIGH | Revised | No specific correction required from available evidence |
| Q56 | What is semiconductor yield? Calculate 950 passes out of 1,000. | MUST | Retained after review | No specific correction required from available evidence |
| Q57 | If yield drops from 95% to 80%, what would you do? | MUST | Revised | Escalate yield excursions; no unauthorized changing of test limits |
| Q58 | Why compare lots, wafers, testers, sites and failure bins? | HIGH | Revised | No specific correction required from available evidence |
| Q59 | How can you tell whether a failure is caused by the device or test setup? | HIGH | Revised | No specific correction required from available evidence |
| Q60 | What is NPI? | HIGH | Revised | No specific correction required from available evidence |
| Q61 | What does a Product Test Engineer do at ASE? | MUST | Revised | Match verified ASE PTE role: yield, NPI validation, abnormal analysis, data |
| Q62 | Qǐng zìwǒ jièshào. — Please introduce yourself. | HIGH | Retained after review | No specific correction required from available evidence |
| Q63 | Nǐ jiào shénme míngzi? — What is your name? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q64 | Nǐ shì nǎ guó rén? — Where are you from? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q65 | Nǐ zài nǎlǐ dúshū? — Where do you study? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q66 | Nǐ shénme shíhou bìyè? — When do you graduate? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q67 | Nǐ xué shénme? — What do you study? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q68 | Nǐ xiǎng yìngzhēng shénme zhíwèi? — Which position? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q69 | Nǐ huì shuō Zhōngwén ma? — Can you speak Chinese? | MUST | Retained after review | No specific correction required from available evidence |
| Q70 | Nǐ kěyǐ qù Gāoxióng gōngzuò ma? — Can you work in Kaohsiung? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q71 | Nǐ kěyǐ jiābān ma? — Can you work overtime? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q72 | Nǐ tīng bù dǒng zěnme bàn? — What if you cannot understand? | HIGH | Retained after review | No specific correction required from available evidence |
| Q73 | What is the difference between Python and C? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q74 | You wrote C (basic). What did you learn in C during B.Tech? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q75 | What is the difference between an array and a pointer in C? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q76 | What are NumPy and pandas? Where did you use them? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q77 | What is the difference between SQL and SQLite? | HIGH | Retained after review | No specific correction required from available evidence |
| Q78 | What is an embedding, and what does it represent? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q79 | How do you store and retrieve an embedding using SQLite? | HIGH | Revised | Removed scripted instruction to cite an unknown SQLite table schema |
| Q80 | What is the difference between PyTorch and ONNX Runtime? | HIGH | Retained after review | No specific correction required from available evidence |
| Q81 | What does checking PyTorch-to-ONNX consistency mean? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q82 | What is cosine similarity? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q83 | What is a CNN, and why use a lightweight model? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q84 | What is overfitting? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q85 | What is the difference between training, validation and testing? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q86 | What are a verification threshold, FAR, FRR and EER? | HIGH | Revised | EER is an error metric rather than accuracy |
| Q87 | What are Git and Linux, and how did you use them? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q88 | Why start in PTE instead of AI/ML engineering? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q89 | What can your CS background not yet provide for PTE? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q90 | What if your supervisor gives you a task you have never done? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q91 | What if the same test keeps failing after you try to fix it? | HIGH | Retained after review | No specific correction required from available evidence |
| Q92 | What if you notice suspicious test results but another engineer says they are fine? | HIGH | Retained after review | No specific correction required from available evidence |
| Q93 | Tell me about working with your professor or research teammates. | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q94 | How do you manage several tasks with deadlines? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q95 | What if you made a mistake in an experiment or report? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q96 | Why do you want to work in Taiwan? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q97 | Where do you see yourself in three years? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q98 | Are you seeking an internship before graduation or full-time afterward? | BACKUP | Retained after review | No specific correction required from available evidence |
| Q99 | What are voltage, current, resistance, open and short circuits? | MEDIUM | Retained after review | No specific correction required from available evidence |
| Q100 | Do you have any questions for us? | MUST | Retained after review | No specific correction required from available evidence |

## Additional questions from gap review

The following are practice hypotheses grounded in job responsibilities; they are not verified questions asked by ASE interviewers.

| ID | New question | Tier |
|---|---|---|
| Q101 | A PTE finds a higher failure rate at one test site. What would you check? | HIGH |
| Q102 | The same chip passes on one tester but fails on another. What would you do? | HIGH |
| Q103 | Many chips suddenly fail the same test. What does that tell you? | HIGH |
| Q104 | A test program or test limit changed before the yield dropped. How would you react? | HIGH |
| Q105 | What is the difference between a PTE, equipment engineer, and process engineer? | HIGH |
| Q106 | What is the difference between electrical testing and functional testing? | MEDIUM |
| Q107 | What does test correlation or repeatability mean? | MEDIUM |
| Q108 | What does NPI test validation involve? | HIGH |
| Q109 | What can a failure bin tell you, and what can it not tell you? | MEDIUM |
| Q110 | How could you use Python to analyze a semiconductor yield report? | HIGH |
| Q111 | What is the difference between a symptom and a confirmed root cause? | MEDIUM |
| Q112 | Why might a die pass wafer probe but fail final test? | HIGH |
| Q113 | How would you report a yield problem to another team or shift? | HIGH |

## Test and deployment evidence

- Structural checks in repository editing session: all 113 numbers contiguous, original 100 IDs preserved, no exact question-title duplicates, no missing answer strings, disjoint priority categories.
- Full `pnpm lint`, `pnpm typecheck`, `pnpm build` and browser interaction testing have **not** been executed in a local checkout here. Do not treat code inspection as a successful build.
- GitHub integration commits changes to main; Vercel deployment must be checked independently. Live logged-in page interaction could not be accessed in the browsing environment.
