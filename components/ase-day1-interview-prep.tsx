'use client';

type Day1Qa = {
  number: number;
  question: string;
  answer: string;
  keyIdea: string;
  followUp?: string;
};

const projectQuestions: Day1Qa[] = [
  {
    number: 1,
    question: 'What is biometrics?',
    answer: 'Biometrics is the use of physical or behavioral characteristics to recognize or verify a person\'s identity. Examples include fingerprints, face, iris, voice, palm, and hand biometrics.',
    keyIdea: 'A biometric system uses something connected to the person—not a password—to help establish identity.',
    followUp: 'Why is dorsal hand a biometric? Because people differ in hand geometry, knuckle structure, skin texture, and other visible patterns.',
  },
  {
    number: 2,
    question: 'What is biometric identification?',
    answer: 'Biometric identification tries to determine who a person is by comparing one query sample against multiple enrolled identities.',
    keyIdea: 'Identification asks: “Who is this?” It is commonly described as a 1:N comparison.',
  },
  {
    number: 3,
    question: 'What is biometric verification?',
    answer: 'Biometric verification checks whether two biometric samples belong to the same identity. My research focuses on verification rather than simply predicting a person\'s class.',
    keyIdea: 'Verification asks: “Is this the same person?” It is commonly a 1:1 comparison.',
  },
  {
    number: 4,
    question: 'What is the difference between identification and verification?',
    answer: 'Identification asks who the person is and normally compares a query against many enrolled identities. Verification asks whether two samples belong to the same person, so it is usually a one-to-one comparison.',
    keyIdea: 'Identification = Who is this? Verification = Is this the same person?',
  },
  {
    number: 5,
    question: 'What is classification?',
    answer: 'Classification assigns an input to one class from a predefined set of classes.',
    keyIdea: 'For identity classification, the output classes could be Person 1, Person 2, Person 3, and so on.',
  },
  {
    number: 6,
    question: 'What is the difference between classification and verification?',
    answer: 'Classification predicts one class from a fixed set of identities. Verification instead extracts features from two samples and measures their similarity to decide whether they belong to the same person.',
    keyIdea: 'Classification: image → fixed class. Verification: image → embedding → similarity → same/different.',
  },
  {
    number: 7,
    question: 'What is an enrolled/reference sample?',
    answer: 'An enrollment or reference sample is biometric information stored for a known person and later used as the reference for verification.',
    keyIdea: 'It is the trusted template that future query samples are compared against.',
  },
  {
    number: 8,
    question: 'What is a query/probe sample?',
    answer: 'The query or probe sample is the new biometric sample presented to the system and compared with the enrolled reference.',
    keyIdea: 'Reference = stored sample. Query/probe = sample presented now.',
  },
  {
    number: 9,
    question: 'What does “same identity” mean in verification?',
    answer: 'Same identity means the two samples belong to the same individual, even if they were captured at different times or under different conditions.',
    keyIdea: 'Two samples of the same person form a genuine comparison.',
  },
  {
    number: 10,
    question: 'What does “different identity” mean?',
    answer: 'Different identity means the two biometric samples come from different individuals.',
    keyIdea: 'Two samples from different people form an impostor comparison.',
  },
  {
    number: 11,
    question: 'Why can verification support identities that were not fixed classes during deployment?',
    answer: 'An embedding-based verification system does not need to predict only one fixed identity class. It learns a feature representation that can be compared with an enrolled template, so a new user can potentially be enrolled without adding a new classifier output and retraining the entire classifier.',
    keyIdea: 'The system compares feature representations instead of depending only on a closed list of identity classes.',
  },
  {
    number: 12,
    question: 'What exactly is dorsal-hand biometrics?',
    answer: 'Dorsal-hand biometrics uses visual characteristics from the back side of the hand to recognize or verify identity. My research uses ordinary RGB camera images for this purpose.',
    keyIdea: 'Dorsal means the back side of the hand—not the palm.',
  },
  {
    number: 13,
    question: 'Why use the back of the hand?',
    answer: 'The dorsal hand contains useful identity-related information such as geometry, knuckle structure, skin texture, and other visible patterns, and it can be captured contactlessly using a normal RGB camera.',
    keyIdea: 'Treat it as a useful contactless biometric modality; do not claim it is universally better than face or fingerprint.',
  },
  {
    number: 14,
    question: 'What information can a dorsal-hand image contain?',
    answer: 'A dorsal-hand image contains several types of information, including hand and knuckle geometry, skin texture, lines, and other visible surface patterns that may help distinguish identities.',
    keyIdea: 'Identity information can exist at large scale (geometry) and fine scale (texture/patterns).',
  },
  {
    number: 15,
    question: 'What makes dorsal-hand recognition difficult?',
    answer: 'The same person\'s hand appearance can change because of illumination, pose, alignment, camera conditions, and capture session. The model should preserve identity information while being robust to these nuisance changes.',
    keyIdea: 'The main challenge is not only separating people; it is keeping the same person similar across changing capture conditions.',
  },
  {
    number: 16,
    question: 'Why can lighting affect hand appearance?',
    answer: 'An RGB camera measures reflected light, so changing illumination changes pixel intensity, contrast, and sometimes color even though the person\'s identity is unchanged. That can affect the features extracted by the model.',
    keyIdea: 'Identity stays the same, but the pixel distribution can change strongly.',
  },
  {
    number: 17,
    question: 'Why can hand pose affect recognition?',
    answer: 'Pose changes the position and orientation of anatomical structures in the image. If we do not align the hand consistently, the network may compare different spatial regions instead of the same dorsal region.',
    keyIdea: 'Rotation and position changes can move the useful structures to different places in the image.',
  },
  {
    number: 18,
    question: 'Why can ROI misalignment affect verification?',
    answer: 'ROI misalignment means corresponding anatomical regions do not appear in the same location. The network may then extract different features from two images of the same person, which can reduce genuine similarity and hurt verification.',
    keyIdea: 'Same person + inconsistent crop can look like two different inputs to the feature extractor.',
  },
  {
    number: 19,
    question: 'What is an ROI?',
    answer: 'ROI means Region of Interest. It is the specific part of an image that contains the information needed for the task.',
    keyIdea: 'Instead of using the entire raw image, focus on the useful dorsal-hand region.',
  },
  {
    number: 20,
    question: 'Why does your project need an ROI?',
    answer: 'The ROI reduces irrelevant variation and gives the model a more consistent anatomical region. That helps the network focus on identity-related hand features rather than background or large pose differences.',
    keyIdea: 'A consistent ROI reduces background, scale, position, and other unwanted variation.',
  },
  {
    number: 21,
    question: 'What happens from the moment an RGB image enters your system until it produces a verification decision?',
    answer: 'First, I capture an RGB dorsal-hand image. I detect hand landmarks and use them to extract and align a consistent dorsal ROI. After preprocessing and resizing to the model input, a lightweight neural network extracts an embedding. I compare the query embedding with the enrolled reference using cosine similarity, and a threshold produces the final same-person or different-person decision.',
    keyIdea: 'RGB image → landmarks/ROI → preprocessing → 224×224 input → network → embedding → cosine similarity → threshold → same/different.',
  },
  {
    number: 22,
    question: 'Why detect the hand first?',
    answer: 'I first detect the hand and its landmarks because those points provide a consistent geometric reference for locating and aligning the dorsal ROI.',
    keyIdea: 'Before cropping the correct region, the system must know where the hand and its anatomical reference points are.',
  },
  {
    number: 23,
    question: 'Why align the ROI?',
    answer: 'Alignment reduces pose variation by placing the important hand structures in a more consistent position and orientation before feature extraction.',
    keyIdea: 'Try to make differently rotated hand images geometrically comparable.',
  },
  {
    number: 24,
    question: 'Why preprocess the ROI?',
    answer: 'Preprocessing prepares images more consistently before they enter the model. For example, it can adjust contrast or reduce some illumination variation, but I evaluate each preprocessing method experimentally because it can also remove or distort useful information.',
    keyIdea: 'Preprocessing is a hypothesis to reduce nuisance variation—not a guarantee that performance will improve.',
  },
  {
    number: 25,
    question: 'Why resize the ROI to a fixed input size?',
    answer: 'The network expects a fixed input size, so every ROI must be converted to the same spatial dimensions. In my current dorsal pipeline, the final ROI is 224 by 224.',
    keyIdea: 'Fixed tensor dimensions make model input consistent across samples.',
  },
  {
    number: 26,
    question: 'What does the neural network do?',
    answer: 'The neural network acts as a feature extractor. It transforms the hand ROI into a compact representation containing information useful for distinguishing identities.',
    keyIdea: 'The network does not need to output the final name; it learns useful identity features.',
  },
  {
    number: 27,
    question: 'What is the output of the feature extractor?',
    answer: 'The feature extractor produces an embedding, which is a numerical vector representing useful characteristics of the hand image.',
    keyIdea: 'Image in → feature vector out.',
  },
  {
    number: 28,
    question: 'What is an embedding?',
    answer: 'An embedding is a compact numerical feature vector produced by the neural network. Ideally, images of the same person should produce similar embeddings, while different people should produce less similar embeddings.',
    keyIdea: 'An embedding is the learned numerical identity representation used for comparison.',
  },
  {
    number: 29,
    question: 'Why compare two embeddings?',
    answer: 'Verification requires comparing two samples. Embeddings provide a compact learned feature representation, so I compare the reference and query embeddings rather than directly comparing every raw pixel.',
    keyIdea: 'Raw pixels change heavily with lighting and pose; learned features should preserve more identity-relevant information.',
  },
  {
    number: 30,
    question: 'What converts the similarity value into an accept/reject decision?',
    answer: 'After calculating similarity between the two embeddings, I compare it with a chosen threshold. The threshold determines whether the pair is accepted as the same identity or rejected as different identities.',
    keyIdea: 'Similarity score + threshold → same/different decision.',
  },
];

const aseQuestions: Day1Qa[] = [
  {
    number: 31,
    question: 'What is ASE?',
    answer: 'ASE is a major semiconductor assembly, packaging, and testing company. It provides services such as wafer probing, IC packaging, and final testing for semiconductor customers.',
    keyIdea: 'ASE is strongly associated with semiconductor back-end assembly/packaging and test services.',
  },
  {
    number: 32,
    question: 'What does ASE actually manufacture/provide?',
    answer: 'ASE mainly provides semiconductor manufacturing services around assembly, packaging, and testing. It helps turn fabricated dies into packaged and tested semiconductor devices that can be used by customers.',
    keyIdea: 'Do not say ASE primarily designs CPUs. Its core role is manufacturing services, especially packaging and testing.',
  },
  {
    number: 33,
    question: 'What does OSAT mean?',
    answer: 'OSAT means Outsourced Semiconductor Assembly and Test. It refers to companies that provide semiconductor packaging, assembly, and testing services for other semiconductor companies.',
    keyIdea: 'O = Outsourced, S = Semiconductor, A = Assembly, T = Test.',
  },
  {
    number: 34,
    question: 'What is semiconductor assembly?',
    answer: 'Semiconductor assembly is the process of taking a fabricated die and integrating it into a physical package with the required electrical connections and mechanical protection.',
    keyIdea: 'A bare die must be connected, protected, and made usable as a physical device.',
  },
  {
    number: 35,
    question: 'What is semiconductor testing?',
    answer: 'Semiconductor testing applies controlled electrical conditions and test patterns to a device, measures its response, and determines whether it meets the required specifications.',
    keyIdea: 'Stimulate the chip → measure the response → decide whether it passes the required specifications.',
  },
  {
    number: 36,
    question: 'Where does ASE sit in the semiconductor supply chain?',
    answer: 'ASE mainly operates in semiconductor manufacturing stages around wafer testing, packaging, assembly, and final testing, after chip design and wafer fabrication.',
    keyIdea: 'Simple chain: design → wafer fabrication → wafer test/probe → packaging → final test → customer/system.',
  },
  {
    number: 37,
    question: 'What is the difference between ASE and TSMC?',
    answer: 'The simplest difference is that TSMC is primarily a semiconductor foundry that fabricates circuits on wafers, while ASE specializes strongly in semiconductor assembly, packaging, and testing. After fabrication, companies such as ASE can help probe, package, and final-test the devices.',
    keyIdea: 'TSMC ≈ wafer fabrication foundry. ASE ≈ packaging/assembly/test specialist. Modern services can overlap, so avoid claiming there is zero overlap.',
  },
  {
    number: 38,
    question: 'What happens before a chip reaches ASE?',
    answer: 'Before ASE\'s packaging and test stages, the IC is designed and then fabricated on a silicon wafer by a semiconductor foundry. The fabricated wafer can then enter probing, assembly, packaging, and final-test operations.',
    keyIdea: 'Design comes first, then fabrication, then the back-end test/package flow.',
  },
  {
    number: 39,
    question: 'What happens after ASE finishes testing and packaging?',
    answer: 'After packaging and testing, qualified semiconductor devices are shipped to customers for integration into boards, systems, and eventually end products.',
    keyIdea: 'ASE delivers qualified semiconductor devices—not the final phone, server, or car itself.',
  },
  {
    number: 40,
    question: 'Why are packaging and testing necessary?',
    answer: 'Packaging protects the die and provides the electrical and mechanical connections needed to use it in a system. Testing verifies that the device functions correctly and meets specifications before it is shipped to the customer.',
    keyIdea: 'Packaging makes the die usable and protected. Testing helps prevent defective devices from reaching customers.',
  },
];

const sections = [
  { title: 'A. Project fundamentals', range: 'Q1–Q20', questions: projectQuestions.slice(0, 20) },
  { title: 'B. Complete project pipeline', range: 'Q21–Q30', questions: projectQuestions.slice(20) },
  { title: 'C. ASE / company from zero', range: 'Q31–Q40', questions: aseQuestions },
];

export function AseDay1InterviewPrep() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]/50 p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
          ASE Interview · Day 1
        </div>
        <h3 className="mt-2 text-xl font-extrabold text-[var(--fg)]">
          Project Foundations + ASE Basics
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Goal: understand what your project actually is and where ASE fits. Do not move to LAWNet,
          advanced CNN architecture, or Day 2 until these foundations are clear.
        </p>
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="font-bold text-[var(--fg)]">0</div>
            <div className="text-[var(--muted)]">I do not know it.</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="font-bold text-[var(--fg)]">1</div>
            <div className="text-[var(--muted)]">I recognize it but cannot explain it.</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
            <div className="font-bold text-[var(--fg)]">2–3</div>
            <div className="text-[var(--muted)]">I can explain it without notes and handle follow-up.</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
          Draw from memory
        </p>
        <p className="mt-2 text-sm font-semibold leading-7 text-[var(--fg)]">
          RGB image → landmarks / ROI → preprocessing → 224×224 input → network → embedding →
          cosine similarity → threshold → same / different
        </p>
        <p className="mt-3 text-sm font-semibold leading-7 text-[var(--fg)]">
          Design → wafer fabrication → CP / wafer probe → packaging → final test → customer
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-extrabold text-[var(--fg)]">{section.title}</h4>
              <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold text-[var(--muted)] dark:bg-white/5">
                {section.range}
              </span>
            </div>
          </div>

          <div className="divide-y divide-[var(--line-subtle)]">
            {section.questions.map((item) => (
              <details key={item.number} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span className="mt-0.5 grid h-7 min-w-7 place-items-center rounded-lg bg-[var(--accent-subtle)] text-[11px] font-extrabold text-[var(--accent)]">
                    {item.number}
                  </span>
                  <span className="flex-1 text-sm font-bold leading-6 text-[var(--fg)]">
                    {item.question}
                  </span>
                  <span className="mt-1 text-xs text-[var(--muted)] transition group-open:rotate-180">⌄</span>
                </summary>
                <div className="ml-10 mt-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                      Interview answer
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--fg)]">{item.answer}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Key idea
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.keyIdea}</p>
                  </div>
                  {item.followUp && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
                        Follow-up
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.followUp}</p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <h4 className="font-extrabold text-[var(--fg)]">Day 1 pass gate</h4>
        <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted)]">
          <p>□ Draw the complete project pipeline without notes.</p>
          <p>□ Explain verification vs classification.</p>
          <p>□ Explain your research in 30 seconds without saying LAWNet.</p>
          <p>□ Explain ASE in 30 seconds.</p>
          <p>□ Explain OSAT.</p>
          <p>□ Score at least 30 of 40 questions at 2 or above.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-xs leading-5 text-[var(--muted)]">
        <p className="font-bold text-[var(--fg)]">Company-fact references</p>
        <p className="mt-2">
          ASE: <a className="text-[var(--accent)] hover:underline" href="https://ase.aseglobal.com/about-ase/" target="_blank" rel="noreferrer">ASE official company overview</a>
          {' · '}
          TSMC: <a className="text-[var(--accent)] hover:underline" href="https://www.tsmc.com/english/aboutTSMC" target="_blank" rel="noreferrer">TSMC official company overview</a>
        </p>
      </div>
    </section>
  );
}
