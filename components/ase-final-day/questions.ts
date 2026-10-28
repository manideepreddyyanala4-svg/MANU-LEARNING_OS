// Temporary ASE interview study data. Remove sidebar flag after 2026-10-29.
// Answers are honest student-level speaking aids, not scripts to recite mechanically.
export type FinalDayQuestion = { number: number; question: string; answer: string; note?: string };
export type FinalDaySection = { id: string; title: string; subtitle: string; items: FinalDayQuestion[] };
const raw = [
  {
    "id": "hr",
    "title": "HR & self-introduction",
    "subtitle": "Highest priority — speak naturally; usually 20–40 seconds.",
    "start": 1,
    "rows": [
      [
        "Tell me about yourself.",
        "Good morning. My name is Manideep Reddy, and I am from India. I am doing my Master's in Computer Science and Information Engineering at Asia University in Taiwan, and I expect to graduate in July 2027. I work as a research assistant on a project using RGB images of the back of the hand for biometric verification. My work includes Python, image processing, controlled model tests, and checking unexpected results. Our ROI research paper has been accepted for presentation at AIAT 2026. I am interested in ASE's Product Test Engineer role because I enjoy testing, analyzing results, and finding practical solutions."
      ],
      [
        "Walk me through your resume.",
        "I studied Computer Science with AI and Machine Learning in India. Now I am studying for my Master's at Asia University and working as a research assistant. In my research I develop image-processing code, test published models, compare results, and investigate failures. I have also tested ONNX inference and used SQLite to store biometric embeddings locally. These experiences taught me a careful way of working with data, which I hope to apply in semiconductor product testing."
      ],
      [
        "Why do you want to join ASE?",
        "ASE is an important semiconductor packaging and testing company. I learned that its work includes wafer probing, package assembly, and final testing. I am especially interested in product testing because I enjoy comparing test results, finding unusual results, and solving problems step by step. I want to learn semiconductor test equipment while using my Python and data-analysis skills."
      ],
      [
        "Why do you want to become a Product Test Engineer?",
        "I like finding out why a test result is different from what we expected. In my research, I compare experiments, check the data, and look for possible causes when a model performs badly. I learned that PTE work includes monitoring yield, checking test results, helping with test validation, and investigating failures. That is the kind of practical engineering work I want to learn."
      ],
      [
        "You studied CS and AI. Why are you applying for a semiconductor testing role?",
        "My degree is in CS and AI, but my research involves a lot of testing and problem-solving. I use Python, compare data, check errors, and test changes step by step. Those skills are useful in product testing too. I know I still have to learn semiconductor hardware and ATE, and I am ready to do that."
      ],
      [
        "Why should we hire you instead of an EE graduate?",
        "An electrical engineering graduate may know more electronics at the start. I can add Python, data analysis, and experience with careful testing. For example, I investigated why our biometric model performed worse across capture sessions by comparing conditions and results. I can use that same problem-solving approach while learning ASE's test tools and procedures.\n\nTo work on that problem, I compared different image preprocessing methods to reduce lighting differences. Our illumination-normalization method worked better than the other methods we tested. We also tested using several reference images taken in different conditions, which improved matching. The problem is not completely solved, but we learned which approaches helped."
      ],
      [
        "What do you know about ASE?",
        "ASE stands for Advanced Semiconductor Engineering. It is an outsourced semiconductor assembly and test company. Depending on the customer's needs, it can provide wafer probing, packaging, final test, and other test services. A foundry manufactures the circuits on wafers; ASE mainly supports the assembly and testing stages."
      ],
      [
        "What are your main strengths?",
        "I am patient when I work on a difficult problem, and I try to use evidence instead of guessing. In my research, verification performance dropped when we tested images from another capture session. I compared the results and tested possible changes step by step. I learned to keep clear records and not jump to a conclusion."
      ],
      [
        "What is your biggest weakness?",
        "Sometimes I spend too much time checking small details, especially when an experiment gives an unexpected result. I am learning to manage my time better by deciding which checks are most important first and keeping a clear deadline for each task."
      ],
      [
        "What achievement are you most proud of?",
        "I am proud of helping with our dorsal-hand ROI research paper. I worked on the image-processing and evaluation work, and the paper was accepted for presentation at AIAT 2026. It means a lot to me because we needed repeated testing and improvements to get the work ready."
      ],
      [
        "Tell me about a difficult problem you faced and how you handled it.",
        "Our biometric model gave much worse results when images came from a different capture session. I compared the test conditions and similarity results, checked image processing, and tried changes under the same evaluation setup. We have not solved the problem completely yet, but the work taught me to investigate unexpected results carefully instead of guessing."
      ],
      [
        "What do you do when you do not know how to solve a problem?",
        "First, I try to understand what the problem really is. Then I check the data or error message, read the documentation, and try a small test. If I am still stuck, I ask my professor or teammates and explain what I already tried. That helps me learn and avoid repeating the same mistakes."
      ],
      [
        "When will you graduate, and when can you start working?",
        "I expect to finish my Master's in July 2027. For a full-time job, I would normally be available after graduation. If ASE has a suitable internship or student opportunity before that, I would be happy to discuss it."
      ],
      [
        "Are you willing to relocate to Kaohsiung?",
        "Yes, I am willing to relocate to Kaohsiung if I get a suitable opportunity at ASE."
      ],
      [
        "Are you willing to work overtime or rotating shifts?",
        "I understand that semiconductor testing may sometimes need shifts or overtime. I am open to the job requirements. I would also like to understand the actual working schedule so I can prepare properly."
      ]
    ]
  },
  {
    "id": "research",
    "title": "Research & resume defense",
    "subtitle": "Most important technical section — know what YOU did and what remains unfinished.",
    "start": 16,
    "rows": [
      [
        "Explain your research project in simple English.",
        "Our research checks whether normal RGB photos of the back of a hand can be used for biometric verification. We collect hand photos, find and align the useful hand region, and use a model to make feature vectors called embeddings. Then we compare the embeddings to decide whether two samples match. One big challenge is keeping the results reliable across different capture sessions."
      ],
      [
        "Why did your professor start this research? What problem are you trying to solve?",
        "We want to study contactless hand verification using an ordinary RGB camera, including a smartphone camera. Special near-infrared equipment is not part of our normal image capture. We are researching whether the visible hand patterns contain useful information and how robust the method is when capture conditions change. A lightweight mobile recognition system is a future goal."
      ],
      [
        "What is the difference between biometric verification and identification?",
        "Verification means checking a claimed identity: 'Is this the same person?' Identification means searching for the identity: 'Who is this?' Verification usually compares one person with a reference, while identification searches across many enrolled identities. Our current experiments mainly evaluate verification."
      ],
      [
        "Why use normal RGB smartphone images instead of special infrared cameras?",
        "The main advantage is that normal RGB cameras are already available on phones, so we do not need a separate infrared camera. The challenge is that normal pictures change a lot with lighting, background, and hand position, so we need good preprocessing and careful testing."
      ],
      [
        "What exactly did YOU do in this research?",
        "I worked on hand-region extraction and alignment using Python, OpenCV, and MediaPipe. I also reproduced a published model, ran controlled tests, compared results, and checked difficult cases. I tested ONNX Runtime inference and local embedding storage with SQLite. Image collection was team work, while these processing and evaluation tasks were part of my own research work."
      ],
      [
        "How did you collect the images? Did you collect all the data yourself?",
        "Our team used smartphones to collect RGB photos of the back of people's left and right hands during indoor and outdoor sessions. We used a mobile image-collection application. I took part in team collection and worked on my own data-processing and evaluation tasks. I did not collect every photo myself."
      ],
      [
        "What do 3,134 usable images and 314 identities mean?",
        "The broader recognition research dataset has 3,134 usable RGB hand images and 314 biometric hand identities. We treat a person's left hand and right hand as different hand identities, so the identity count is not the same as the number of people. This broader dataset is separate from the dataset used for our ROI paper."
      ],
      [
        "Why is the ROI paper dataset different from the broader recognition dataset?",
        "The paper tests hand-region extraction, while the broader dataset supports our ongoing biometric verification experiments. They have different purposes and data scopes, so their image totals should not be mixed. I can check the paper's exact sample count if the interviewer asks for it."
      ],
      [
        "What is ROI, and why do you need ROI extraction?",
        "ROI means Region of Interest. In our project, it is the useful area on the back of the hand. We cut out that area and align it so the model sees a more similar region across images. Otherwise, different hand positions and backgrounds can make comparisons difficult."
      ],
      [
        "How does your ROI extraction work using MediaPipe and OpenCV?",
        "First, MediaPipe detects landmarks on the hand. We use selected landmarks to locate the area on the back of the hand and estimate its direction. Then OpenCV helps rotate or transform that region into a standard crop. This gives the model a more consistent input."
      ],
      [
        "What is IoU, and what does 0.857 mean?",
        "IoU means Intersection over Union. It measures how much the detected hand region overlaps the manually marked reference region. A score of 1 would mean perfect overlap. Our accepted ROI paper reports a mean IoU of 0.857 on held-out subjects. That measures ROI localization, not biometric verification accuracy."
      ],
      [
        "What were the main ROI failure cases?",
        "The harder images were ones with a partly hidden hand, a hand tilted strongly away from the camera, or motion blur. Sometimes MediaPipe placed the landmarks incorrectly. Then our selected hand area was not aligned properly, so we inspected those cases."
      ],
      [
        "Tell me about one abnormal result you found and how you investigated it.",
        "One important result was that our verification model performed much worse when images came from different capture sessions. I checked the evaluation conditions, compared similarity results, reviewed ROI alignment, and tested changes using the same evaluation setup. The exact cause and the best solution are still being studied."
      ],
      [
        "Which lightweight baseline model did you use, and why?",
        "LAWNet is a published lightweight model originally developed for RGB wrist-vein verification. I used it as a baseline in our dorsal-hand research so we could compare experiments against an existing method. I reproduced and evaluated the model; I did not design the original LAWNet."
      ],
      [
        "Did you develop LAWNet yourself?",
        "No. LAWNet is an existing published model. My contribution was reproducing and testing it on our dorsal-hand data and comparing results. I am also working on other lightweight model ideas, but the final architecture is still being studied."
      ],
      [
        "What happened to performance when the capture session changed?",
        "The verification error became much higher when the capture session changed. That tells us a model that works on familiar capture conditions may be less reliable on new conditions. I compare the same-session and cross-session results to measure that gap. The final model and final performance numbers are still under study."
      ],
      [
        "How did you measure the performance drop? What are EER and similarity scores?",
        "The model gives each image a feature vector, called an embedding. We compare two embeddings using similarity scores, including pairs from the same hand and different hands. We calculate error rates at different thresholds. EER is the error rate where false acceptance and false rejection are roughly equal. Lower EER means better verification performance under that test setup."
      ],
      [
        "What changes did you compare, and how did you decide if they helped?",
        "I compared image-preprocessing methods and lightweight model changes. To make the comparison fair, I used the same dataset splits and evaluation rules. I checked several results, not just one good number. Some changes did not help, so the final model is still being selected."
      ],
      [
        "Why are you still developing the final model? What is left to finish?",
        "The ROI extraction and testing workflow are working, and we have tested published baseline models. However, verification becomes less reliable when capture sessions change. We are comparing ways to improve that while keeping the model lightweight. Choosing the final model and completing the mobile recognition application are still future work."
      ],
      [
        "Why did you use ONNX before finalizing the model?",
        "I used an existing trained model to check the export and inference process early. I exported it from PyTorch to ONNX, ran it with ONNX Runtime, and compared the outputs with PyTorch. This helped us test one part of a future deployment workflow before selecting the final recognition model."
      ],
      [
        "What did you use SQLite for in the biometric system?",
        "SQLite is a small database that works locally. In our local biometric test, it was used to store the feature vectors, called embeddings or templates, so we could load them again and compare them during matching. It was a test setup, not a finished production system."
      ],
      [
        "Did you deploy the final model on a smartphone?",
        "We have used a mobile application to collect RGB hand images, and I tested an ONNX Runtime inference workflow. The completed biometric recognition model has not yet been integrated into a finished smartphone application. Mobile deployment is one of our research goals."
      ],
      [
        "Tell me about your AIAT 2026 paper and your contribution.",
        "Our paper is called 'Landmark-Based Dorsal Hand Vein ROI Extraction from Unconstrained RGB Images.' It explains how we detect and align a useful hand region in normal RGB photos. I worked on image processing and evaluation and am a co-author and scheduled presenter. The paper has been accepted for presentation at AIAT 2026 in Tokyo in December; the presentation has not happened yet."
      ]
    ]
  },
  {
    "id": "pte",
    "title": "ASE, semiconductor flow & PTE",
    "subtitle": "Simple definitions and job-fit answers. Understand CP, FT, yield and abnormal results.",
    "start": 39,
    "rows": [
      [
        "What does ASE do?",
        "ASE mainly provides semiconductor assembly and testing services. After a foundry makes the wafer, ASE may perform wafer probing, package the selected dies, and test the packaged chips. The exact steps depend on the services the customer orders. The goal is to check that products meet the required test specifications."
      ],
      [
        "What does OSAT stand for?",
        "OSAT means Outsourced Semiconductor Assembly and Test. It means a company like ASE provides packaging and testing services for semiconductor customers."
      ],
      [
        "Explain the complete semiconductor flow from design to shipment.",
        "First, engineers design the chip. A foundry makes the circuits on a silicon wafer. In a common flow, wafer probing checks the dies before dicing, then the wafer is separated into dies. The selected dies are packaged, and packaged devices go through final test. Passing devices are then prepared for shipment. Some products have extra steps, and the exact flow depends on the package."
      ],
      [
        "What is the difference between a wafer, die and packaged chip?",
        "A wafer is a large round silicon disk with many chips on it. A die is one small chip on that wafer. After the die is put into a protective package with electrical connections, we call it a packaged chip."
      ],
      [
        "What is the difference between a chip-design company, foundry and ASE?",
        "The design company decides what the chip should do and designs the circuits. The foundry manufactures those circuits on a silicon wafer. ASE mainly takes care of packaging and testing, depending on what the customer needs."
      ],
      [
        "When a processed wafer arrives at ASE, what happens next?",
        "It depends on the customer's order. For wafer sort, a prober and probe card connect dies on the wafer to test equipment. After testing, the wafer can be diced and selected dies move to packaging. Packaged devices are then tested at final test if that service is included."
      ],
      [
        "What is CP or wafer probing?",
        "CP is also called wafer probing or wafer sort. It tests individual dies while they are still on the wafer, before packaging. A prober positions the wafer, a probe card makes electrical contact with the die pads or bumps, and ATE runs the required tests."
      ],
      [
        "What is FT or final test?",
        "FT means Final Test. It usually happens after packaging. A handler brings the packaged device to the test socket or contact area, and ATE checks its electrical or functional behavior against the test limits."
      ],
      [
        "What is the difference between CP and FT?",
        "CP, or wafer probe, tests dies while they are still on the wafer. FT tests packaged devices after assembly. Both help find defects, but the contact equipment and test conditions are different."
      ],
      [
        "What is wafer dicing?",
        "Dicing means cutting the large silicon wafer into separate small dies. After that, good dies can move to the packaging stage."
      ],
      [
        "Explain the main packaging steps.",
        "The flow depends on the package. For a common wire-bond package, the die is prepared and attached to a support, tiny wires make electrical connections, and the assembly is protected by molding. Marking, plating, trim-and-form, and other finishing steps may follow where needed. Flip-chip packages connect the die through bumps and use a different assembly flow. Final test checks the packaged device."
      ],
      [
        "What is the difference between wire bonding and flip chip?",
        "With wire bonding, tiny metal wires connect the die to the package. With flip chip, the die is turned face-down and connected through small bumps. Both methods make electrical connections, but they do it in different ways."
      ],
      [
        "Why does a chip need packaging?",
        "A bare silicon die is small and easy to damage. Packaging protects it and gives it electrical connections so it can be used in a phone, computer, or another product. Packaging can also help move heat away from the chip."
      ],
      [
        "What are ATE, a prober and a probe card?",
        "ATE means Automatic Test Equipment. It applies electrical signals and measures the device's response. At wafer sort, a prober positions the wafer and a probe card contacts the die. The prober and probe card connect the die to the tester; they are not the tester themselves."
      ],
      [
        "What are a handler, socket and load board?",
        "A handler moves packaged devices into position for testing. A socket makes electrical contact with the packaged chip. A load board is the interface board connecting the socket or other contacts to the ATE. Together they support the final-test setup."
      ],
      [
        "What do DUT and binning mean?",
        "DUT means Device Under Test: the device currently being measured. Binning means putting tested units into categories based on results. Some bins indicate passing performance grades and others indicate failures. A failure bin tells us which test failed, but not always the physical root cause."
      ],
      [
        "What is a test program, and what can ATE test?",
        "A test program controls which measurements the ATE runs, the order of those tests, and the pass/fail limits. Depending on the chip, tests may check voltage, current, leakage, timing, and function. Engineers validate and maintain the program so the measurements are reliable."
      ],
      [
        "What is semiconductor yield? Calculate 950 passes out of 1,000.",
        "Yield means the percentage of tested chips that pass. The formula is good units divided by total tested units, times 100. If 950 out of 1,000 chips pass, the yield is 95%."
      ],
      [
        "If yield drops from 95% to 80%, what would you do?",
        "I would first confirm the yield calculation and find out when the drop started. Then I would compare lots, wafers, testers, test sites, and failure bins to see the pattern. I would report the issue quickly, check approved logs and recent changes, and work with the responsible engineer on controlled checks. I would not change production limits without authorization."
      ],
      [
        "Why compare lots, wafers, testers, sites and failure bins?",
        "These comparisons help us narrow down where the failure is happening. A problem concentrated on one tester or site can point toward the test setup, while a problem limited to certain lots or wafers may have a different cause. The pattern tells us what to check first; it does not prove the root cause."
      ],
      [
        "How can you tell whether a failure is caused by the device or test setup?",
        "I would compare failures across testers, sites, and lots and review recent changes to the setup. A bad contact or test setting can make a good device appear to fail. With approval, engineers may repeat a test or compare with a known good setup. The test pattern is a clue, not final proof that the chip or tester is defective."
      ],
      [
        "What is NPI?",
        "NPI means New Product Introduction. When a new device is prepared for production, the team checks that its test program, test hardware, limits, and data collection are ready. The test process must be validated before moving into regular production."
      ],
      [
        "What does a Product Test Engineer do at ASE?",
        "An ASE Product Test Engineer helps monitor test yield, analyze test data, investigate abnormal results, validate new-product test processes, and work with other teams on improvements. Depending on the assignment, the engineer may also support test programs and test equipment. The focus is reliable, repeatable product testing in production."
      ]
    ]
  },
  {
    "id": "chinese",
    "title": "Basic Chinese — speak aloud",
    "subtitle": "Pinyin and English only. Keep your claims at basic conversational level.",
    "start": 62,
    "rows": [
      [
        "Qǐng zìwǒ jièshào. — Please introduce yourself.",
        "Nín hǎo, wǒ jiào Manideep. Wǒ láizì Yìndù. Wǒ xiànzài zài Yàzhōu Dàxué dú shuòshì. Wǒ èr líng èr qī nián qī yuè bìyè. Wǒ xiǎng yìngzhēng chǎnpǐn cèshì gōngchéngshī. Wǒ hái zài xué Zhōngwén. Xièxie nín.",
        "Hello. My name is Manideep. I am from India. I am studying for a Master's degree at Asia University. I graduate in July 2027. I want to apply for Product Test Engineer. I am still learning Chinese. Thank you."
      ],
      [
        "Nǐ jiào shénme míngzi? — What is your name?",
        "Wǒ jiào Manideep.",
        "My name is Manideep."
      ],
      [
        "Nǐ shì nǎ guó rén? — Where are you from?",
        "Wǒ shì Yìndù rén.",
        "I am Indian."
      ],
      [
        "Nǐ zài nǎlǐ dúshū? — Where do you study?",
        "Wǒ zài Yàzhōu Dàxué dú shuòshì.",
        "I study for a Master's at Asia University."
      ],
      [
        "Nǐ shénme shíhou bìyè? — When do you graduate?",
        "Wǒ èr líng èr qī nián qī yuè bìyè.",
        "I graduate in July 2027."
      ],
      [
        "Nǐ xué shénme? — What do you study?",
        "Wǒ xué zīxùn gōngchéng.",
        "My major is information engineering."
      ],
      [
        "Nǐ xiǎng yìngzhēng shénme zhíwèi? — Which position?",
        "Wǒ xiǎng yìngzhēng chǎnpǐn cèshì gōngchéngshī.",
        "I want to apply for Product Test Engineer."
      ],
      [
        "Nǐ huì shuō Zhōngwén ma? — Can you speak Chinese?",
        "Wǒ huì shuō yìdiǎn Zhōngwén. Wǒ hái zài xué.",
        "I can speak a little Chinese. I am still learning."
      ],
      [
        "Nǐ kěyǐ qù Gāoxióng gōngzuò ma? — Can you work in Kaohsiung?",
        "Kěyǐ, wǒ yuànyì qù Gāoxióng gōngzuò.",
        "Yes, I am willing to work in Kaohsiung."
      ],
      [
        "Nǐ kěyǐ jiābān ma? — Can you work overtime?",
        "Rúguǒ gōngzuò xūyào, wǒ kěyǐ pèihé.",
        "If the job needs it, I can cooperate with the working schedule. Only say this if it is true for you."
      ],
      [
        "Nǐ tīng bù dǒng zěnme bàn? — What if you cannot understand?",
        "Bù hǎoyìsi, qǐng shuō màn yìdiǎn. Qǐng zài shuō yí cì. Kěyǐ yòng Yīngwén shuō ma?",
        "Sorry, please speak more slowly. / Please repeat. / Can you say it in English?"
      ]
    ]
  },
  {
    "id": "technical",
    "title": "Programming & technical skills",
    "subtitle": "Backup — only the skills on your resume or the basic testing concepts.",
    "start": 73,
    "rows": [
      [
        "What is the difference between Python and C?",
        "Python is easier to write and is useful for scripts and data analysis. C gives more direct control over memory and is often used closer to hardware. I use Python regularly in my research. I learned basic C at university but have not used it much recently."
      ],
      [
        "You wrote C (basic). What did you learn in C during B.Tech?",
        "In my B.Tech, I learned basic C programming, like variables, conditions, loops, functions, and arrays. I know the basic ideas, but I have not used C recently, so I would need to practice again before using it for work."
      ],
      [
        "What is the difference between an array and a pointer in C?",
        "An array stores several values of the same type, like five numbers. A pointer stores a memory address. In C, pointers can be used to access array elements, but an array and a pointer are not exactly the same thing."
      ],
      [
        "What are NumPy and pandas? Where did you use them?",
        "NumPy is a Python library for working with numbers and arrays. pandas is useful for tables, like CSV results. I used them in my research to process data and compare results from experiments."
      ],
      [
        "What is the difference between SQL and SQLite?",
        "SQL is the language used to ask questions of a database, like selecting or filtering rows. SQLite is a small database system that uses SQL and usually keeps the data in one local file. I used SQLite for local biometric embedding storage."
      ],
      [
        "What is an embedding, and what does it represent?",
        "An embedding is a list of numbers made by a model to describe important features of an image. In our project, we compare two hand-image embeddings. If they are similar enough, the images may belong to the same hand identity."
      ],
      [
        "How do you store and retrieve an embedding using SQLite?",
        "In our local test, the model created an embedding for a hand image, and SQLite stored it as a reference biometric template. When another image was checked, the program loaded the stored template and compared the embeddings. It was a local research test, not a completed production database system."
      ],
      [
        "What is the difference between PyTorch and ONNX Runtime?",
        "I use PyTorch to build and train models. ONNX is a format for exporting a model. ONNX Runtime is software that runs the exported model to get predictions or embeddings. I used it to test inference outside the PyTorch training setup."
      ],
      [
        "What does checking PyTorch-to-ONNX consistency mean?",
        "It means giving the same image to the PyTorch model and the exported ONNX model, then comparing their output embeddings. I want to check that the export has not changed the results in an important way. Small numerical differences can happen, so I check consistency rather than saying every value is exactly the same."
      ],
      [
        "What is cosine similarity?",
        "Cosine similarity tells us how similar two vectors are by comparing their direction. In our project, two embeddings with a higher cosine similarity are treated as more similar. We compare that score with a threshold to decide if there is a match."
      ],
      [
        "What is a CNN, and why use a lightweight model?",
        "CNN means Convolutional Neural Network. It learns useful image patterns, such as shapes and textures. We want a lightweight model because the final goal includes running on devices with limited memory and processing power, like phones."
      ],
      [
        "What is overfitting?",
        "Overfitting is when a model learns the training images too closely and does not work well on new images. For example, it may perform well on the images it saw during training but badly on a new person's hand."
      ],
      [
        "What is the difference between training, validation and testing?",
        "Training data is used to teach the model. Validation data is used to compare models and choose settings. Test data is kept separate so we can check performance fairly at the end. We should not keep changing the model based on the final test results."
      ],
      [
        "What are a verification threshold, FAR, FRR and EER?",
        "A threshold is the similarity score used to accept or reject a claimed match. FAR is the rate at which samples from the wrong identity are accepted. FRR is the rate at which genuine samples are rejected. EER is the approximate error rate at a threshold where FAR and FRR are equal. Lower EER is better; it is not the same as accuracy."
      ],
      [
        "What are Git and Linux, and how did you use them?",
        "Git helps track changes in code, so I can see different versions of my scripts. Linux is the operating system I use for much of my Python research work, including running experiments and checking files."
      ]
    ]
  },
  {
    "id": "extra",
    "title": "Additional HR & judgment questions",
    "subtitle": "Backup follow-ups — learn after the main 72 questions.",
    "start": 88,
    "rows": [
      [
        "Why start in PTE instead of AI/ML engineering?",
        "I still like AI and machine learning, but I am also interested in engineering work where results must be tested carefully. PTE involves data, testing, and solving problems in real production. I want to learn this field and use the skills I already have in Python and analysis."
      ],
      [
        "What can your CS background not yet provide for PTE?",
        "I do not yet have hands-on semiconductor ATE or electronics testing experience. I would need to learn the test equipment, electrical basics, and company procedures. What I can bring now is Python, data analysis, and experience checking results carefully."
      ],
      [
        "What if your supervisor gives you a task you have never done?",
        "I would first ask what the expected result is and what procedure I should follow. Then I would read the instructions and try to understand the steps. If something is unclear or could affect production, I would ask my supervisor before making changes."
      ],
      [
        "What if the same test keeps failing after you try to fix it?",
        "I would first check the error and the test data again, instead of trying random changes. Then I would compare it with a working case and look at recent changes. If the failure continues, I would ask a more experienced engineer and share what I already checked."
      ],
      [
        "What if you notice suspicious test results but another engineer says they are fine?",
        "I would politely show the result and explain why it worries me. I might be missing some information, so I would ask the other engineer to help check it. If there is still a possible quality problem, I would follow the team procedure and report it to the responsible person."
      ],
      [
        "Tell me about working with your professor or research teammates.",
        "In our research, we collected data as a team and discussed experiment results with our professor. I worked mainly on my assigned code and evaluations. When I found a problem, I tried to show the result clearly so we could decide what to check next."
      ],
      [
        "How do you manage several tasks with deadlines?",
        "I first list my tasks and their deadlines. Then I start with the work that is most important or has to be completed first. I break bigger tasks into smaller steps. If I see that I may be late, I tell the team early."
      ],
      [
        "What if you made a mistake in an experiment or report?",
        "I would tell my supervisor or team, check how much work was affected, and correct the mistake. In research, one wrong setting can change the result of an experiment, so it is important to be clear about errors and repeat the work when needed."
      ],
      [
        "Why do you want to work in Taiwan?",
        "I came to Taiwan for my Master's degree, and I would like to start my engineering career here. Taiwan has a strong semiconductor industry, so I see it as a good place to learn and develop my skills."
      ],
      [
        "Where do you see yourself in three years?",
        "In three years, I hope to be a Product Test Engineer who understands the test process well and can handle more problems independently. I want to become good at test-data analysis, debugging, and working with other engineers."
      ],
      [
        "Are you seeking an internship before graduation or full-time afterward?",
        "I am still studying, and I expect to graduate in July 2027. If ASE has a suitable internship before graduation, I am interested in discussing it. For a full-time position, I would mainly be available after I finish my Master's."
      ],
      [
        "What are voltage, current, resistance, open and short circuits?",
        "Voltage is the electrical push, current is the flow of electric charge, and resistance makes the flow harder. Ohm's law is V equals I times R. An open circuit has a broken connection. A short circuit has an unwanted low-resistance connection."
      ],
      [
        "Do you have any questions for us?",
        "Yes, thank you. I would like to know what the training is like for a new graduate joining the Product Test Engineer team. Also, what would be the main work in this position: test programs, test-data analysis, or production problem-solving?"
      ]
    ]
  },
  {
    "id": "pte-scenarios",
    "title": "PTE troubleshooting — high-value follow-ups",
    "subtitle": "New questions from current ASE PTE requirements; practical steps, no invented ATE experience.",
    "start": 101,
    "rows": [
      [
        "A PTE finds a higher failure rate at one test site. What would you check?",
        "I would compare that site with the other sites on the same tester and look at the failing test items. Then I would check contact-related problems, socket or load-board condition, and any recent setup changes. I would show the pattern to the responsible engineer and follow the approved troubleshooting procedure."
      ],
      [
        "The same chip passes on one tester but fails on another. What would you do?",
        "I would check whether the test programs, limits, versions, and conditions match. Then I would look at the failing measurements and compare the hardware interfaces and contact quality. If allowed, the team could perform a controlled correlation check. One different result alone does not prove which tester is wrong."
      ],
      [
        "Many chips suddenly fail the same test. What does that tell you?",
        "It tells me to look for a common cause, but it does not prove the cause. I would check the failing item, affected lots and sites, time of the change, and recent test or equipment changes. I would report the problem and help the team separate real device failures from test-setup problems."
      ],
      [
        "A test program or test limit changed before the yield dropped. How would you react?",
        "I would compare the old and new program versions, approved limits, and the timing of the yield change. I would not change a limit just to raise the yield. I would report the finding and ask the responsible engineer to check the change and decide whether a controlled rollback or validation is needed."
      ],
      [
        "What is the difference between a PTE, equipment engineer, and process engineer?",
        "A Product Test Engineer focuses on product test results, test readiness, yield, and failures. An equipment engineer mainly keeps machines working correctly. A process engineer focuses on manufacturing process conditions and improvements. They work together because one production problem can involve all three areas."
      ],
      [
        "What is the difference between electrical testing and functional testing?",
        "Electrical testing checks measurements like voltage, current, leakage, and electrical connections. Functional testing checks whether a chip performs the operation it is designed to do. A product's ATE program can include both kinds of checks."
      ],
      [
        "What does test correlation or repeatability mean?",
        "Repeatability means the same device gives consistent results when tested again under the same conditions. Correlation means comparing results from different testers, test sites, or setups to check whether they agree closely enough. Both matter because a test must be reliable before we trust its yield data."
      ],
      [
        "What does NPI test validation involve?",
        "For a new product, engineers check the test program, hardware contacts, test limits, data logs, and repeatability. They review abnormal results and confirm that the test process works as required before production release. I would support the data checking and learn the approved validation steps from the team."
      ],
      [
        "What can a failure bin tell you, and what can it not tell you?",
        "A failure bin groups devices that failed a certain test or category of tests. It helps engineers see patterns and decide where to investigate. The bin alone does not prove which physical component or process caused the failure."
      ],
      [
        "How could you use Python to analyze a semiconductor yield report?",
        "I could read test-data files, count passed and failed devices, calculate yield, and group results by lot, wafer, tester, site, or bin. Then I could plot the change over time and highlight unusual patterns. I have used Python to compare experimental results, and I would learn ASE's file formats and checks first."
      ],
      [
        "What is the difference between a symptom and a confirmed root cause?",
        "A yield drop or repeated test failure is a symptom. A possible poor contact or changed setting is a hypothesis. A root cause needs evidence from controlled checks and the team's investigation. I would present what we know separately from what we still need to test."
      ],
      [
        "Why might a die pass wafer probe but fail final test?",
        "Wafer probe and final test use different contact setups, and packaging can introduce new problems. A packaged chip might also be tested under different conditions or limits. I would compare the exact tests and conditions before deciding why the results changed."
      ],
      [
        "How would you report a yield problem to another team or shift?",
        "I would clearly share when the issue started, affected lots and testers, current yield, main failure bins, and what checks are already completed. I would separate facts from guesses and explain any open actions. That helps the next engineer continue without repeating work."
      ]
    ]
  }
] as const;
export const finalDaySections: FinalDaySection[] = raw.map(section => ({
  id: section.id, title: section.title, subtitle: section.subtitle,
  items: section.rows.map((row, index) => ({
    number: section.start + index, question: row[0], answer: row[1], note: row.at(2)
  }))
}));
export const finalDayTotal = finalDaySections.reduce((count, section) => count + section.items.length, 0);
export const finalDayMustKnowNumbers = new Set<number>([1,3,4,5,6,7,13,16,20,26,29,31,37,38,39,41,45,46,47,49,56,57,61,69,100]);
export const finalDayHighPriorityNumbers = new Set<number>([2,8,10,11,12,15,21,22,24,25,28,32,35,36,52,53,54,55,58,59,60,62,72,77,79,80,86,91,92,101,102,103,104,105,108,110,112,113]);
export const finalDayBackupNumbers = new Set<number>([75,78,82,84,85,87,88,89,94,95,96,97,98]);
export const finalDayPriorityNumbers = new Set<number>([...finalDayMustKnowNumbers, ...finalDayHighPriorityNumbers]);
