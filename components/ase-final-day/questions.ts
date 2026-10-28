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
        "IoU means Intersection over Union. It measures how much our predicted hand region overlaps the correct region marked by a person. A value closer to 1 is better. Our paper reported a mean IoU of 0.857 on held-out subjects. This is ROI localization quality, not biometric recognition accuracy."
      ],
      [
        "What were the main ROI failure cases?",
        "The harder images were ones with a partly hidden hand, a hand tilted strongly away from the camera, or motion blur. Sometimes MediaPipe placed the landmarks incorrectly. Then our selected hand area was not aligned properly, so we inspected those cases."
      ],
      [
        "Tell me about one abnormal result you found and how you investigated it.",
        "One problem we found was that verification results became much worse when images were taken in a different session. I first checked the scores and evaluation conditions. Then I looked at things such as ROI alignment and preprocessing and compared possible changes. We are still working on improving that result."
      ],
      [
        "Which lightweight baseline model did you use, and why?",
        "For my current verification experiments, the main baseline is LAWNet. It is an existing published lightweight biometric model, not a model I invented. We reproduced and tested it so we had a clear reference before trying our own changes."
      ],
      [
        "Did you develop LAWNet yourself?",
        "No. LAWNet is a published model from earlier research. My work was to reproduce and evaluate it on our data. I am also studying changes and lightweight model candidates, but I should not claim LAWNet is my own design."
      ],
      [
        "What happened to performance when the capture session changed?",
        "The error rate became much higher when the capture session changed. In one earlier baseline evaluation, EER was about 3.53% for indoor same-session testing, 5.33% for outdoor same-session testing, and 14.57% across sessions. So the same model struggled when the conditions changed."
      ],
      [
        "How did you measure the performance drop? What are EER and similarity scores?",
        "We use the model to make an embedding, or feature vector, for each image. Then we compare two embeddings using similarity scores. We test genuine pairs and different-person pairs. EER means Equal Error Rate. A lower EER is better, and it helps us compare how the model performs in different conditions."
      ],
      [
        "What changes did you compare, and how did you decide if they helped?",
        "I compared image-preprocessing methods and lightweight model changes. To make the comparison fair, I used the same dataset splits and evaluation rules. I checked several results, not just one good number. Some changes did not help, so the final model is still being selected."
      ],
      [
        "Why are you still developing the final model? What is left to finish?",
        "The ROI and evaluation parts are working, and we have already tested published baseline models. But performance still drops when the capture conditions change. We are testing lightweight model ideas to improve that. We also need to finish choosing the model and integrating the full recognition system on a mobile device."
      ],
      [
        "Why did you use ONNX before finalizing the model?",
        "We already had a trained model, even though the final model was not chosen. I used that model to test whether we could export it from PyTorch to ONNX and run it with ONNX Runtime. I also compared the outputs. This let me check the inference process early, without saying the final model was ready."
      ],
      [
        "What did you use SQLite for in the biometric system?",
        "SQLite is a small database that works locally. In our local biometric test, it was used to store the feature vectors, called embeddings or templates, so we could load them again and compare them during matching. It was a test setup, not a finished production system."
      ],
      [
        "Did you deploy the final model on a smartphone?",
        "Not yet. We already used a mobile application to collect hand pictures, and we have tested an inference pipeline using ONNX Runtime. But the complete recognition model has not been integrated and finished as a mobile application. Mobile deployment is our next goal."
      ],
      [
        "Tell me about your AIAT 2026 paper and your contribution.",
        "The paper is called 'Landmark-Based Dorsal Hand Vein ROI Extraction from Unconstrained RGB Images.' It explains how we find a consistent region on the back of the hand from ordinary RGB photos. I worked on the processing and evaluation side. I am a co-author, and the paper is accepted for presentation at AIAT 2026 in Tokyo this December."
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
        "OSAT means Outsourced Semiconductor Assembly and Test. It means a company like ASE provides packaging and testing services for semiconductor customers."
      ],
      [
        "Explain the complete semiconductor flow from design to shipment.",
        "First, a company designs the chip. Then a foundry makes many chips on a silicon wafer. The dies may be tested while still on the wafer; this is CP or wafer probe. Next the wafer is cut into dies. The selected dies are packaged, and the packaged chips go through FT, or final test. Passing devices are packed and shipped."
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
        "It depends on which services the customer orders. In a common flow, ASE can test the dies on the wafer using CP, then the wafer is cut, good dies are packaged, and the packaged chips go through final test. Passing products are then packed and shipped."
      ],
      [
        "What is CP or wafer probing?",
        "CP means Chip Probe, often called wafer probe or wafer sort. It means testing each die before cutting and packaging it. A prober positions the wafer, a probe card touches the die, and ATE runs the electrical tests."
      ],
      [
        "What is FT or final test?",
        "FT means Final Test. It happens after the chip is packaged. A handler moves the devices to the test position, and ATE runs electrical tests to see whether each chip meets the required limits."
      ],
      [
        "What is the difference between CP and FT?",
        "CP tests the die while it is still on the wafer, before packaging. FT tests the chip after it has been packaged. An easy way to remember it is: CP before packaging, FT after packaging."
      ],
      [
        "What is wafer dicing?",
        "Dicing means cutting the large silicon wafer into separate small dies. After that, good dies can move to the packaging stage."
      ],
      [
        "Explain the main packaging steps.",
        "A simple packaging flow is: prepare the die, attach it to a base, connect it using tiny wires or flip-chip bumps, protect it with molding, and do marking and any required finishing steps such as plating or trim and form. Then it can go for final testing. The exact steps depend on the package type."
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
        "ATE means Automatic Test Equipment. It sends test signals and measures how the chip responds. At wafer test, a prober moves the wafer to the correct position, and a probe card makes electrical contact with the die."
      ],
      [
        "What are a handler, socket and load board?",
        "A handler moves packaged chips into the test position. A socket holds the chip and makes electrical contact. A load board connects the socket and chip to the ATE. They work together during final testing."
      ],
      [
        "What do DUT and binning mean?",
        "DUT means Device Under Test. It is the chip being tested. Binning means sorting chips into groups based on their test results, such as pass, fail, or different performance categories."
      ],
      [
        "What is a test program, and what can ATE test?",
        "A test program tells the ATE which tests to run and what the passing limits are. Depending on the product, it can test things like voltage, current, timing, and whether the chip works correctly."
      ],
      [
        "What is semiconductor yield? Calculate 950 passes out of 1,000.",
        "Yield means the percentage of tested chips that pass. The formula is good units divided by total tested units, times 100. If 950 out of 1,000 chips pass, the yield is 95%."
      ],
      [
        "If yield drops from 95% to 80%, what would you do?",
        "First, I would confirm that the yield number and test data are correct. Then I would check when the drop started and which lots, wafers, testers, sites, or failure bins are affected. I would look for recent changes, inform the responsible engineer, and help test possible causes using the approved procedure. After that, I would check whether the yield improves."
      ],
      [
        "Why compare lots, wafers, testers, sites and failure bins?",
        "Because they help us find where the problem is happening. For example, if most failures come from one tester or one test site, we should check that setup. If they happen only on one wafer or lot, the cause may be somewhere else. We use the pattern to decide what to investigate next."
      ],
      [
        "How can you tell whether a failure is caused by the device or test setup?",
        "I would first check the failure data and whether the same problem happens repeatedly. Then I would compare results from other testers or sites and check the setup and recent changes. With approval, the team could repeat a test under controlled conditions. I would not decide that the chip is bad before checking the test setup."
      ],
      [
        "What is NPI?",
        "NPI means New Product Introduction. It is when a new chip or product is prepared for manufacturing. For testing, engineers need to check that the test program, equipment, limits, and process are ready before normal production."
      ],
      [
        "What does a Product Test Engineer do at ASE?",
        "A Product Test Engineer helps make sure semiconductor products are tested correctly. The work can include checking test programs and test equipment, analyzing yield and failure data, investigating abnormal results, and supporting new product testing. A PTE also works with other engineers to solve problems and improve the test process."
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
        "In our local test, the model generated an embedding and SQLite stored it as a biometric template. When we needed to compare a new image, the program could load the stored template and calculate similarity. I would use my actual code to explain the exact table columns and how the numbers are saved."
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
        "A threshold is the similarity score we use to decide if two samples match. FAR means False Acceptance Rate, when the wrong identity is accepted. FRR means False Rejection Rate, when the correct identity is rejected. EER is the point where FAR and FRR are equal. Lower EER is better."
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
