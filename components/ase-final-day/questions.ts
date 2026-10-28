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
        "Good morning. My name is Manideep Reddy, and I am from India. I am doing my Master's in Computer Science and Information Engineering at Asia University in Taiwan. I expect to graduate in July 2027. I also work on a dorsal-hand biometric research project. My work mainly involves Python, image processing, testing models, checking results, and finding problems. Our research paper has been accepted for presentation at AIAT 2026 in Japan. I want to join ASE as a Product Test Engineer because I enjoy testing, analyzing data, and solving problems, and I want to learn the semiconductor field."
      ],
      [
        "Walk me through your resume.",
        "I completed my B.Tech in Computer Science with AI and Machine Learning in India. Now I am doing my Master's at Asia University. My main experience is my dorsal-hand biometric research, where I work on image processing, Python experiments, model testing, and analysis. I have also worked with ONNX Runtime and SQLite for a local inference test. One paper from this work was accepted for presentation. That is why I am interested in applying my testing and analysis skills to ASE."
      ],
      [
        "Why do you want to join ASE?",
        "ASE is known for semiconductor packaging and testing. I am interested in the testing side because I already enjoy checking results and solving problems in my research. I also want to learn how real semiconductor products are tested in a factory. ASE would be a good place for me to learn from experienced engineers and grow in this field."
      ],
      [
        "Why do you want to become a Product Test Engineer?",
        "I like working with test results. In my research, I run experiments, compare the results, and check why something goes wrong. I understand that a Product Test Engineer works with test programs, test data, product yield, and abnormal results. The hardware will be new to me, but I am interested in learning it."
      ],
      [
        "You studied CS and AI. Why are you applying for a semiconductor testing role?",
        "My degree is in CS and AI, but my research involves a lot of testing and problem-solving. I use Python, compare data, check errors, and test changes step by step. Those skills are useful in product testing too. I know I still have to learn semiconductor hardware and ATE, and I am ready to do that."
      ],
      [
        "Why should we hire you instead of an EE graduate?",
        "My background is different from an Electrical Engineering graduate's. I can bring strong Python, data analysis, and testing skills. In my research, I have learned to investigate unexpected results carefully. I still need training in semiconductor equipment and electronics, but I can learn that while contributing on the software and data side."
      ],
      [
        "What do you know about ASE?",
        "ASE stands for Advanced Semiconductor Engineering. It is mainly known for semiconductor assembly, packaging, and testing. After a foundry manufactures the wafer, ASE can test the dies, package them, and test the finished devices before they are shipped. ASE also offers other advanced packaging and test services."
      ],
      [
        "What are your main strengths?",
        "One of my strengths is that I do not give up when a result looks wrong. In my research, we saw a big performance drop when images were taken in different sessions. I checked the results, compared conditions, and tested possible improvements. I like finding problems step by step instead of guessing."
      ],
      [
        "What is your biggest weakness?",
        "Sometimes I spend too much time checking small details, especially when an experiment gives an unexpected result. I am learning to manage my time better by deciding which checks are most important first and keeping a clear deadline for each task."
      ],
      [
        "What achievement are you most proud of?",
        "I am proud of contributing to our dorsal-hand ROI research paper, which has been accepted for presentation at AIAT 2026. I worked on the image-processing and evaluation side. Seeing our work reach a conference was a big achievement for me because it came from many rounds of testing and improvement."
      ],
      [
        "Tell me about a difficult problem you faced and how you handled it.",
        "In my research, a model worked better when images came from the same session, but its performance dropped with images from another session. I checked the evaluation results, compared the conditions, and tested different preprocessing and model changes. The problem is not fully solved yet, but it taught me how to investigate a difficult result carefully."
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
        "Our research is about recognizing people using pictures of the back of their hands. We use normal RGB cameras, like phone cameras, instead of special sensors. First, we find and align the hand area. Then a model extracts features, and we compare those features to check whether two samples match. The biggest challenge is getting reliable results when lighting or capture conditions change."
      ],
      [
        "Why did your professor start this research? What problem are you trying to solve?",
        "The main goal is to see whether we can use a normal RGB camera for contactless hand biometrics. Many vein-recognition systems use special infrared cameras. We want to study a more accessible method and eventually make it lightweight enough for a phone or similar device. I cannot say the final mobile system is finished yet."
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
        "My main work is on the software and experiments. I worked on extracting and aligning the hand region, running models, checking their results, and comparing performance under different capture conditions. I also tested a local inference workflow using ONNX Runtime and SQLite. The data collection was team work, not something I did alone."
      ],
      [
        "How did you collect the images? Did you collect all the data yourself?",
        "We collected pictures of the back of both hands using smartphones, with indoor and outdoor capture sessions. The team worked together on data collection, and the images were stored for research. I worked on my assigned processing and evaluation tasks too. I did not collect every image myself."
      ],
      [
        "What do 3,134 usable images and 314 identities mean?",
        "In the broader research dataset, we had 3,140 raw images and 3,134 usable images. There were 157 volunteers, and we treated each left hand and right hand as a separate identity. That gives 314 hand identities. So 314 does not mean 314 different people."
      ],
      [
        "Why does your accepted paper use 1,600 images from 80 volunteers instead?",
        "The 1,600 images from 80 volunteers belong to the ROI extraction paper's own evaluation dataset. The 3,134 usable images and 314 hand identities belong to our broader recognition research. We used different data scopes for different experiments, so I keep these numbers separate."
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
        "IoU means Intersection over Union. It measures how much a predicted ROI overlaps the manually marked ground-truth ROI. A mean IoU of 0.857 means good average overlap, not 85.7% recognition accuracy."
      ],
      [
        "What were the main ROI failure cases?",
        "Some difficult cases included severe hand occlusion, large out-of-plane rotation and motion blur. In these situations MediaPipe landmarks could be inaccurate, which affected the extracted ROI."
      ],
      [
        "Tell me about one abnormal result you found and how you investigated it.",
        "A major abnormal result was the drop in verification performance across capture sessions. I compared the score distributions, checked possible ROI and preprocessing issues and tested changes under controlled conditions. I have not proved one single cause."
      ],
      [
        "Which lightweight baseline model did you use, and why?",
        "The main baseline is LAWNet, a published lightweight model from earlier work in my professor's research group. We used it as a reference point because our goal is lightweight recognition and better robustness."
      ],
      [
        "Did you develop LAWNet yourself?",
        "No. LAWNet was already published. I reproduced and benchmarked it for my research. My own current architecture experiments are separate and still ongoing."
      ],
      [
        "What happened to performance when the capture session changed?",
        "Same-session verification was much better. In an earlier frozen target evaluation, EER was about 3.53% indoors and 5.33% outdoors, but about 14.57% across sessions. These are baseline evaluation numbers, not a result for my unfinished final model."
      ],
      [
        "How did you measure the performance drop? What are EER and similarity scores?",
        "The model produces feature vectors. We compare them using similarity scores for genuine and different-identity pairs. EER is the error rate at the point where false acceptance and false rejection rates are equal. Higher EER is worse."
      ],
      [
        "What changes did you compare, and how did you decide if they helped?",
        "I compared preprocessing and lightweight architecture changes under the same evaluation conditions. I checked more than one metric because an improvement in one number can come with a worse result elsewhere. I did not accept every good-looking result."
      ],
      [
        "Why are you still developing the final model? What is left to finish?",
        "We have completed important parts such as ROI processing, baseline evaluation and controlled experiments. We are still working on robustness and lightweight architecture selection. Final recognition performance and full mobile integration are not finished."
      ],
      [
        "Why did you use ONNX before finalizing the model?",
        "I already had a trained embedding model to test with. I exported that working model to ONNX and checked its output using ONNX Runtime. This helped validate the local inference path separately from the unfinished final architecture."
      ],
      [
        "What did you use SQLite for in the biometric system?",
        "I used SQLite-backed local storage for biometric embeddings or templates so they could be loaded again for matching. It was part of a local test workflow, not a finished production deployment. I would check my actual code before claiming an exact table schema."
      ],
      [
        "Did you deploy the final model on a smartphone?",
        "No. The team has used a phone app for collecting images, and I have worked with local inference and mobile-oriented validation. But the complete final recognition system has not been deployed as a finished smartphone app."
      ],
      [
        "Tell me about your AIAT 2026 paper and your contribution.",
        "The accepted paper is 'Landmark-Based Dorsal Hand Vein ROI Extraction from Unconstrained RGB Images.' I am a co-author and will present it in Tokyo in December 2026. My work included ROI implementation, evaluation and checking results. It is accepted, not yet presented."
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
        "ASE is mainly a semiconductor assembly and test company. After wafers or dies are manufactured, ASE can perform wafer testing, package the good dies, and then perform final testing on the packaged chips. ASE checks whether the devices meet the customer's specifications before shipment."
      ],
      [
        "What does OSAT stand for?",
        "OSAT means Outsourced Semiconductor Assembly and Test. Chip companies can use specialized companies such as ASE for packaging and testing services."
      ],
      [
        "Explain the complete semiconductor flow from design to shipment.",
        "First the chip is designed, then manufactured on a silicon wafer. The dies may go through wafer probing or CP. The wafer is cut, selected dies are packaged, and the packaged devices go through final test or FT. Good units are packed and shipped."
      ],
      [
        "What is the difference between a wafer, die and packaged chip?",
        "A wafer is the large round silicon disk. A die is one small chip area cut from the wafer. A packaged chip is the die protected and connected inside a package."
      ],
      [
        "What is the difference between a chip-design company, foundry and ASE?",
        "The design company creates the circuit design. The foundry manufactures it on silicon wafers. ASE mainly provides assembly and testing services. Exact services vary by customer and product."
      ],
      [
        "When a processed wafer arrives at ASE, what happens next?",
        "Depending on the customer flow, ASE may perform wafer probing, identify passing dies, separate the dies, package them, run final tests, then pack and ship the good devices."
      ],
      [
        "What is CP or wafer probing?",
        "CP, also called wafer probe or wafer sort, electrically tests dies while they are still on the wafer. A prober, probe card and ATE are commonly used."
      ],
      [
        "What is FT or final test?",
        "Final test is electrical testing after the semiconductor has been packaged. The handler positions the device in a socket or test interface, and ATE runs tests and collects results."
      ],
      [
        "What is the difference between CP and FT?",
        "CP is before packaging and tests dies on the wafer through a probe card. FT is after packaging and tests packaged devices through sockets and test hardware."
      ],
      [
        "What is wafer dicing?",
        "Dicing cuts the wafer into individual silicon dies so selected dies can continue to assembly."
      ],
      [
        "Explain the main packaging steps.",
        "A simple example is die preparation, die attach, wire bonding or flip chip, molding or protection, possible plating and marking, then trim/form where needed. The exact steps depend on the package."
      ],
      [
        "What is the difference between wire bonding and flip chip?",
        "Wire bonding uses tiny wires to connect a die to the package. Flip chip places the die face-down and uses small bumps to make the connections."
      ],
      [
        "Why does a chip need packaging?",
        "Packaging protects the die, gives it electrical connections and helps it be assembled into a larger electronic product. It can also help manage heat."
      ],
      [
        "What are ATE, a prober and a probe card?",
        "ATE is Automatic Test Equipment; it applies electrical tests and measures responses. A prober positions a wafer, and a probe card makes temporary contact with each die during wafer test."
      ],
      [
        "What are a handler, socket and load board?",
        "A handler moves packaged devices into test positions. A socket contacts the device pins. A load board connects that test interface to the ATE."
      ],
      [
        "What do DUT and binning mean?",
        "DUT is Device Under Test. Binning means sorting tested devices into categories based on their results, for example passing, failing or different performance bins."
      ],
      [
        "What is a test program, and what can ATE test?",
        "A test program tells ATE which measurements to run and what limits to apply. Depending on the chip, tests may include continuity, voltage, current, timing or functional behavior."
      ],
      [
        "What is semiconductor yield? Calculate 950 passes out of 1,000.",
        "Yield is the number of good units divided by total tested units, times 100. Here it is 950 divided by 1,000, so yield is 95%."
      ],
      [
        "If yield drops from 95% to 80%, what would you do?",
        "First I would verify the test data and calculation. Then I would locate when and where the drop happened and compare failure bins, lots, wafers, testers and sites. I would check recent changes, escalate if needed, run approved comparisons and verify the result."
      ],
      [
        "Why compare lots, wafers, testers, sites and failure bins?",
        "These comparisons help locate a pattern. For example, if failures occur mostly on one tester site, the team can investigate that site instead of assuming every chip is defective."
      ],
      [
        "How can you tell whether a failure is caused by the device or test setup?",
        "I would not guess from one result. I would check repeatability, failure patterns, tester/site information, setup changes and approved retests or comparisons, then involve experienced test engineers."
      ],
      [
        "What is NPI?",
        "NPI means New Product Introduction. It is the process of bringing a new product into manufacturing and validating that the required production and test processes are ready."
      ],
      [
        "What does a Product Test Engineer do at ASE?",
        "A PTE works with product test data, test flow, yield and abnormal test results. The engineer helps check problems, validate changes, coordinate with teams and make sure products meet required test specifications."
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
        "Nín hǎo, wǒ jiào Manideep. Wǒ láizì Yìndù. Wǒ xiànzài zài Yàzhōu Dàxué dú shuòshì. Wǒ èr líng èr qī nián qī yuè bìyè. Wǒ xiǎng yìngzhēng chǎnpǐn cèshì gōngchéngshī. Wǒ xiànzài hái zài xué Zhōngwén. Xièxie nín.",
        "Hello, I am Manideep. I am from India. I am studying for a Master's at Asia University. I graduate in July 2027. I want to apply for Product Test Engineer. I am still learning Chinese. Thank you."
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
        "Wǒ de zhuānyè shì zīxùn gōngchéng.",
        "My major is information engineering."
      ],
      [
        "Nǐ xiǎng yìngzhēng shénme zhíwèi? — Which position?",
        "Wǒ xiǎng yìngzhēng chǎnpǐn cèshì gōngchéngshī.",
        "I want to apply for Product Test Engineer."
      ],
      [
        "Nǐ huì shuō Zhōngwén ma? — Can you speak Chinese?",
        "Wǒ huì shuō yìdiǎn Zhōngwén, xiànzài hái zài xué.",
        "I speak a little Chinese and am still learning."
      ],
      [
        "Nǐ kěyǐ qù Gāoxióng gōngzuò ma? — Can you work in Kaohsiung?",
        "Kěyǐ, wǒ yuànyì qù Gāoxióng gōngzuò.",
        "Yes, I am willing to work in Kaohsiung."
      ],
      [
        "Nǐ kěyǐ jiābān ma? — Can you work overtime?",
        "Kěyǐ, rúguǒ gōngzuò xūyào.",
        "Yes, if work needs it. In English, ask for details of the actual schedule if necessary."
      ],
      [
        "Nǐ tīng bù dǒng zěnme bàn? — What if you cannot understand?",
        "Bù hǎoyìsi, qǐng shuō màn yìdiǎn. / Qǐng zài shuō yí cì. / Kěyǐ yòng Yīngwén shuō ma?",
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
        "Python is a higher-level language with simpler syntax and automatic memory management. C is compiled, closer to hardware and requires more manual memory handling. Python is my current strong language; I learned basic C in B.Tech."
      ],
      [
        "You wrote C (basic). What did you learn in C during B.Tech?",
        "I studied data types, conditions, loops, functions, arrays, pointers and structures. I have not used C recently, so I would need to refresh the syntax before working on a C codebase."
      ],
      [
        "What is the difference between an array and a pointer in C?",
        "An array stores a sequence of elements. A pointer stores a memory address. In many expressions the array name can be used like a pointer to its first element, but an array and a pointer are not exactly the same thing."
      ],
      [
        "What are NumPy and pandas? Where did you use them?",
        "NumPy works with numerical arrays and calculations. pandas helps manage table-like data. I used them in Python research scripts for processing data, collecting results and comparing experiment metrics."
      ],
      [
        "What is the difference between SQL and SQLite?",
        "SQL is a language used to query relational databases. SQLite is a small database engine that understands SQL and usually stores the database in one local file."
      ],
      [
        "What is an embedding, and what does it represent?",
        "An embedding is a vector of numbers produced by a model. It represents learned features of an image. We compare embeddings to estimate whether two hand images belong to the same identity."
      ],
      [
        "How do you store and retrieve an embedding using SQLite?",
        "A local program writes the feature vector with an identity or template reference to SQLite, then reads it back for matching. The exact column names and array encoding depend on my implemented schema; I would show the actual code rather than guess."
      ],
      [
        "What is the difference between PyTorch and ONNX Runtime?",
        "PyTorch is the framework used for building and training our model. ONNX is a model exchange format. ONNX Runtime runs the exported model for inference without needing the full PyTorch training workflow."
      ],
      [
        "What does checking PyTorch-to-ONNX consistency mean?",
        "Run the same input through the PyTorch and exported ONNX models, compare the output embedding tensors and check that any numerical differences are small enough for the intended use. It does not mean bit-for-bit identical numbers."
      ],
      [
        "What is cosine similarity?",
        "Cosine similarity compares the direction of two vectors. With normalized embeddings, a larger cosine similarity usually means the learned representations are more alike."
      ],
      [
        "What is a CNN, and why use a lightweight model?",
        "A Convolutional Neural Network learns visual features from images. A lightweight model uses fewer resources, which matters if a future system should run on phones or other limited hardware."
      ],
      [
        "What is overfitting?",
        "Overfitting happens when a model performs well on training data but does not generalize well to different or unseen data."
      ],
      [
        "What is the difference between training, validation and testing?",
        "Training data updates the model. Validation data helps select settings and compare models. Test data is kept separate for the final evaluation, so we do not select a model using the test results."
      ],
      [
        "What are a verification threshold, FAR, FRR and EER?",
        "The threshold decides when a similarity score is accepted. FAR is the false acceptance rate; FRR is the false rejection rate. EER is the operating point where the two error rates are equal."
      ],
      [
        "What are Git and Linux, and how did you use them?",
        "Git tracks code changes and versions. Linux is the operating environment used for much of my Python research workflow. I used them while organizing scripts, running experiments and working with project files."
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
        "I am interested in applying my strengths to real production testing, where measurements and abnormal results matter. I understand the domain is different, and I want to learn the semiconductor side rather than claim I am already an expert."
      ],
      [
        "What can your CS background not yet provide for PTE?",
        "I do not yet have practical ATE or semiconductor hardware experience. I need to learn those tools, electrical concepts and company procedures. I can bring software, data analysis and careful testing skills from the start."
      ],
      [
        "What if your supervisor gives you a task you have never done?",
        "I would clarify the expected result, read the relevant instructions, try a small safe step and ask questions before making risky changes. I would give progress updates and document what I learn."
      ],
      [
        "What if the same test keeps failing after you try to fix it?",
        "I would stop repeating random changes. I would check whether the failure is repeatable, review the logs and recent changes, compare with a working condition and ask the responsible engineers for help."
      ],
      [
        "What if you notice suspicious test results but another engineer says they are fine?",
        "I would explain the data and why I am concerned, then ask for a second check. If product quality or safety may be affected, I would follow the team's escalation procedure rather than ignore the concern."
      ],
      [
        "Tell me about working with your professor or research teammates.",
        "The data collection was team work, while I handled assigned coding and experiments. My professor guides the research direction and reviews results. I try to communicate clearly when an experiment fails or needs a decision."
      ],
      [
        "How do you manage several tasks with deadlines?",
        "I list what is important, choose what must be done first, break it into smaller tasks and track the results. If something may be late, I communicate early."
      ],
      [
        "What if you made a mistake in an experiment or report?",
        "I would report the mistake, check which results were affected, correct the analysis and document the change. Hiding it would make later conclusions unreliable."
      ],
      [
        "Why do you want to work in Taiwan?",
        "I am studying in Taiwan and want to develop my engineering career here. Taiwan has a strong semiconductor industry, and I want to learn in that environment."
      ],
      [
        "Where do you see yourself in three years?",
        "I want to become a reliable engineer who understands the test process, can analyze data independently and help investigate product-testing problems. First I need a strong foundation in semiconductor testing."
      ],
      [
        "Are you seeking an internship before graduation or full-time afterward?",
        "My Master's program ends in July 2027. I am open to an appropriate student or internship opportunity before then and mainly a full-time role after graduation, subject to the actual role and applicable rules."
      ],
      [
        "What are voltage, current, resistance, open and short circuits?",
        "Voltage is electrical potential, current is the flow of charge and resistance opposes current. Ohm's law is V = I × R. An open circuit is a broken path; a short is an unintended low-resistance connection."
      ],
      [
        "Do you have any questions for us?",
        "Yes, thank you. For a new graduate joining your PTE team, what training is provided during the first few months? Also, would this position focus more on test-data analysis, test-program support or production troubleshooting?"
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
export const finalDayPriorityNumbers = new Set([1,2,3,4,5,6,7,8,9,10,13,14,15,16,17,20,22,23,24,25,26,27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,44,45,46,47,49,52,54,56,57,61,62,63,64,65,66,68,69,70,71,72,77,80,81,86,88,89,97,98,100]);
