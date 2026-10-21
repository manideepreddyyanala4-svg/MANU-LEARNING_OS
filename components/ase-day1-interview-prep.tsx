'use client';

type StudyQa = {
  number: number;
  question: string;
  understand: string;
  example?: string;
  connection?: string;
  interview: string;
  stop?: string;
};

const projectQuestions: StudyQa[] = [
  { number:1, question:'What is biometrics?', understand:'Biometrics means using a body or behavior characteristic to recognize or verify a person.', example:'Fingerprint, face, iris, voice, palm, or dorsal hand.', interview:'Biometrics is the use of physical or behavioral characteristics to recognize or verify a person’s identity.', stop:'You do not need biometric history or detailed modality comparisons.' },
  { number:2, question:'What is biometric identification?', understand:'Identification asks: “Who is this person?” One unknown sample is compared with many enrolled people.', example:'One hand image is searched against a database of 1,000 enrolled users.', interview:'Biometric identification tries to determine who a person is by comparing a query against multiple enrolled identities.', stop:'Remember the idea 1:N. No deeper search algorithms today.' },
  { number:3, question:'What is biometric verification?', understand:'Verification asks: “Is this the same person?” A new sample is compared with a claimed or enrolled identity.', example:'Your stored hand template is compared with your new hand image.', connection:'This is the main task in your project.', interview:'Biometric verification checks whether two biometric samples belong to the same identity. My research focuses on verification.', stop:'Remember 1:1 and same/different. That is enough for Day 1.' },
  { number:4, question:'What is the difference between identification and verification?', understand:'Identification finds who the person is. Verification checks whether a claimed identity is correct.', example:'Identification: “Which person is this?” Verification: “Is this Manideep?”', interview:'Identification asks who the person is and usually compares against many identities. Verification asks whether two samples belong to the same person.', stop:'Know “Who is this?” versus “Is this the same person?”' },
  { number:5, question:'What is classification?', understand:'Classification chooses one label from a fixed set of labels.', example:'An image is predicted as Person 1, Person 2, Person 3, etc.', interview:'Classification assigns an input to one class from a predefined set of classes.', stop:'No need to study softmax or cross-entropy yet.' },
  { number:6, question:'What is the difference between classification and verification?', understand:'Classification predicts a fixed class. Verification compares two feature representations and decides same or different.', example:'Classification: image → Person 12. Verification: image A + image B → similar or not similar.', connection:'Your final task is verification, not just closed-set identity classification.', interview:'Classification predicts one class from a fixed set. Verification extracts features from two samples and compares their similarity to decide whether they belong to the same person.', stop:'Do not study open-set theory deeply today. Just understand fixed classes versus comparison.' },
  { number:7, question:'What is an enrolled/reference sample?', understand:'It is the trusted biometric sample or template stored for a known user.', example:'During enrollment, your hand image or its feature vector is saved.', interview:'An enrollment or reference sample is biometric information stored for a known person and later used as the reference for verification.', stop:'No need to study template security yet.' },
  { number:8, question:'What is a query/probe sample?', understand:'It is the new sample presented to the system for checking.', example:'The hand image you show today is compared with the enrolled reference.', interview:'The query or probe sample is the new biometric sample presented to the system and compared with the enrolled reference.', stop:'Just remember reference = stored, query = new.' },
  { number:9, question:'What does “same identity” mean in verification?', understand:'It means both samples come from the same person, even if capture conditions are different.', example:'Your indoor hand image and your outdoor hand image are still the same identity.', interview:'Same identity means the two samples belong to the same individual, even if they were captured at different times or conditions.', stop:'The formal term “genuine pair” comes later; you only need the idea now.' },
  { number:10, question:'What does “different identity” mean?', understand:'It means the two samples come from different people.', example:'Your hand image compared with your friend’s hand image.', interview:'Different identity means the two biometric samples come from different individuals.', stop:'The formal term “impostor pair” comes later.' },
  { number:11, question:'Why can verification support identities that were not fixed classes during deployment?', understand:'Because the system can compare a new person’s feature representation with that person’s enrolled template instead of requiring a fixed classifier class for every future user.', example:'A new user can enroll a template today and later be verified against it.', interview:'An embedding-based verification system can compare a new user’s enrolled feature representation with future samples, so it is not limited only to the fixed identity classes used during training.', stop:'Do not go into open-set recognition mathematics today.' },
  { number:12, question:'What exactly is dorsal-hand biometrics?', understand:'Dorsal means the back side of the hand. Dorsal-hand biometrics uses visual information from that area for identity recognition or verification.', example:'Your project uses normal RGB photos of the back of the hand.', interview:'Dorsal-hand biometrics uses visual characteristics from the back side of the hand to recognize or verify identity. My research uses RGB images.', stop:'Do not compare every hand biometric modality.' },
  { number:13, question:'Why use the back of the hand?', understand:'The back of the hand contains useful identity-related visual patterns and can be captured without touching a sensor.', example:'Hand shape, knuckle structure, skin texture, and visible surface patterns.', interview:'The dorsal hand contains useful identity-related information such as geometry, knuckle structure, and skin texture, and it can be captured contactlessly with an RGB camera.', stop:'Do not claim dorsal hand is universally better than face, fingerprint, or palm.' },
  { number:14, question:'What information can a dorsal-hand image contain?', understand:'It contains both shape information and fine visual texture.', example:'Large scale: hand/knuckle geometry. Fine scale: skin texture and visible patterns.', interview:'A dorsal-hand image can contain hand and knuckle geometry, skin texture, lines, and other visible surface patterns that may help distinguish identities.', stop:'No need to list every biological feature.' },
  { number:15, question:'What makes dorsal-hand recognition difficult?', understand:'The same person’s hand can look different because capture conditions change.', example:'Different light, hand rotation, distance, camera position, ROI alignment, and session.', connection:'This is directly related to your cross-session/generalization problem.', interview:'The main difficulty is that the same person’s hand appearance can change because of illumination, pose, alignment, camera conditions, and capture session. The model must keep identity information stable despite those changes.', stop:'Do not discuss all domain-adaptation methods today.' },
  { number:16, question:'Why can lighting affect hand appearance?', understand:'An RGB camera records reflected light. If the lighting changes, pixel brightness, contrast, and color can change even though the person is the same.', example:'The same skin region may look darker indoors and brighter outdoors.', interview:'Changing illumination changes the RGB pixel values and contrast even though identity is unchanged, so the extracted features can also change.', stop:'No need for illumination physics beyond this.' },
  { number:17, question:'Why can hand pose affect recognition?', understand:'Rotation and position changes move the same anatomical structures to different image locations.', example:'A rotated hand moves knuckles and texture patterns relative to the crop.', interview:'Pose changes the position and orientation of hand structures. Without consistent alignment, the network may compare different spatial regions instead of the same dorsal region.', stop:'No need for full pose-estimation theory.' },
  { number:18, question:'Why can ROI misalignment affect verification?', understand:'If two crops are not aligned, the network may see different content even when both images are from the same person.', example:'One crop centers the knuckles; another is shifted toward the wrist.', connection:'This is one reason ROI consistency matters in your project.', interview:'ROI misalignment can place corresponding anatomical regions in different positions, causing the network to extract different features and reducing same-person similarity.', stop:'Do not memorize shift-sensitivity numbers today unless the interviewer asks about your experiment later.' },
  { number:19, question:'What is an ROI?', understand:'ROI means Region of Interest: the useful part of a larger image that you want the system to analyze.', example:'Instead of using the entire hand photo and background, use the dorsal-hand region.', interview:'ROI means Region of Interest. It is the specific part of an image that contains the information needed for the task.', stop:'That definition is enough.' },
  { number:20, question:'Why does your project need an ROI?', understand:'The ROI removes irrelevant parts and gives the model a more consistent hand region.', example:'Reduce background, position, scale, and unnecessary wrist/finger variation.', interview:'The ROI reduces irrelevant variation and gives the model a more consistent anatomical region, helping it focus on identity-related hand features.', stop:'Do not claim ROI completely removes pose or lighting variation.' },
  { number:21, question:'What happens from the moment an RGB image enters your system until it produces a verification decision?', understand:'Think of the project as one chain: capture → locate/align the hand region → prepare the ROI → extract features → compare features → make a decision.', example:'RGB image → landmarks/ROI → preprocessing → 224×224 input → network → embedding → cosine similarity → threshold → same/different.', connection:'This is the most important Day 1 mental picture.', interview:'First, I capture an RGB dorsal-hand image. I detect hand landmarks and use them to extract and align a consistent dorsal ROI. After preprocessing and resizing, a lightweight network produces an embedding. I compare the query and reference embeddings using cosine similarity, and a threshold gives the same-person or different-person decision.', stop:'Do not explain LAWNet layers today.' },
  { number:22, question:'Why detect the hand first?', understand:'Before cropping the correct dorsal region, the system needs reliable reference points that show where the hand is and how it is oriented.', example:'Hand landmarks give geometric anchors for the ROI.', interview:'I detect the hand and its landmarks first because those points provide a geometric reference for locating and aligning the dorsal ROI.', stop:'Exact landmark numbers come later.' },
  { number:23, question:'Why align the ROI?', understand:'Alignment tries to put the same anatomical region into a similar position and orientation across images.', example:'A hand rotated left and a hand rotated right are normalized before comparison.', interview:'Alignment reduces pose variation by placing important hand structures in a more consistent position and orientation before feature extraction.', stop:'Do not study the exact PCA/perspective equations today.' },
  { number:24, question:'Why preprocess the ROI?', understand:'Preprocessing tries to make the input more consistent or emphasize useful information before the model sees it.', example:'Contrast or illumination normalization can reduce some nuisance variation.', connection:'In your research, preprocessing is something you test experimentally; not every method helps.', interview:'Preprocessing prepares images more consistently before the model. It can reduce some nuisance variation, but I evaluate each method experimentally because preprocessing can also remove useful information.', stop:'Do not memorize every preprocessing variant today.' },
  { number:25, question:'Why resize it to a fixed input size?', understand:'Neural networks expect inputs with consistent tensor dimensions.', example:'Every final ROI becomes 224×224 before model input.', interview:'The network expects a fixed input size, so every ROI is converted to the same spatial dimensions. My current final ROI size is 224 by 224.', stop:'No interpolation details today.' },
  { number:26, question:'What does the neural network do?', understand:'It learns to convert the image into features that are useful for telling identities apart.', example:'It should keep identity-related patterns and become less sensitive to irrelevant changes.', interview:'The neural network acts as a feature extractor. It transforms the hand ROI into a compact representation containing information useful for distinguishing identities.', stop:'Architecture details come later.' },
  { number:27, question:'What is the output of the feature extractor?', understand:'The main output used for verification is a numerical feature vector called an embedding.', example:'Instead of keeping all image pixels, the model outputs a compact vector of learned features.', interview:'The feature extractor produces an embedding, which is a numerical vector representing useful characteristics of the hand image.', stop:'Embedding dimensionality comes later with the exact model.' },
  { number:28, question:'What is an embedding?', understand:'An embedding is the model’s compact numerical representation of the image.', example:'Same-person images should ideally have similar embeddings; different-person images should be less similar.', interview:'An embedding is a compact numerical feature vector produced by the neural network. Ideally, samples from the same person produce similar embeddings.', stop:'No metric-learning theory today.' },
  { number:29, question:'Why compare two embeddings?', understand:'Verification needs to decide whether two samples belong to the same person. Comparing embeddings is more useful than comparing raw pixels directly.', example:'Lighting may change pixels strongly, but a good learned embedding should preserve identity information better.', interview:'I compare the reference and query embeddings because they are compact learned representations of the two samples and are more suitable for verification than raw pixel-by-pixel comparison.', stop:'No need to compare every distance metric today.' },
  { number:30, question:'What converts the similarity value into an accept/reject decision?', understand:'A threshold turns the similarity score into a yes/no decision.', example:'If similarity is above the chosen threshold → accept as same person; otherwise → reject.', interview:'The similarity score is compared with a chosen threshold. That threshold converts the score into a same-person or different-person decision.', stop:'FAR/FRR threshold trade-offs are Day 3.' },
];

const aseQuestions: StudyQa[] = [
  { number:31, question:'What is ASE?', understand:'ASE is a semiconductor manufacturing-services company strongly focused on assembly, packaging, and testing.', example:'Its work includes wafer probing, IC packaging, and final test.', interview:'ASE is a major semiconductor assembly, packaging, and testing company that provides services such as wafer probing, IC packaging, and final testing.', stop:'Do not memorize company history or executive names.' },
  { number:32, question:'What does ASE actually manufacture/provide?', understand:'ASE helps customers turn fabricated semiconductor dies into packaged and tested devices that can be used in products.', example:'A fabricated die may be probed, packaged, and final-tested through ASE services.', interview:'ASE mainly provides semiconductor manufacturing services around assembly, packaging, and testing, helping turn fabricated dies into packaged and tested semiconductor devices.', stop:'Do not say ASE mainly designs CPUs or GPUs.' },
  { number:33, question:'What does OSAT mean?', understand:'OSAT is the industry term for companies that provide outsourced semiconductor assembly and testing services.', example:'A chip company can outsource packaging and test work to an OSAT company.', interview:'OSAT means Outsourced Semiconductor Assembly and Test.', stop:'Memorize the expansion and one-line meaning. Nothing more.' },
  { number:34, question:'What is semiconductor assembly?', understand:'A bare silicon die is not yet a convenient finished device. Assembly connects and integrates it into a package.', example:'The die is placed and electrically connected inside a package.', interview:'Semiconductor assembly is the process of integrating a fabricated die into a physical package with the required electrical connections and mechanical protection.', stop:'No need for wire-bonding or flip-chip details today.' },
  { number:35, question:'What is semiconductor testing?', understand:'Testing checks whether a chip behaves correctly and meets required specifications.', example:'Apply controlled electrical signals, measure the response, then decide pass/fail.', interview:'Semiconductor testing applies controlled electrical conditions and test patterns to a device, measures its response, and checks whether it meets specifications.', stop:'Test-program details come on later days.' },
  { number:36, question:'Where does ASE sit in the semiconductor supply chain?', understand:'In a simplified flow, chips are designed and fabricated first. ASE is heavily involved in back-end stages such as wafer test, packaging, assembly, and final test.', example:'Design → wafer fabrication → wafer probe → packaging → final test → customer.', interview:'ASE mainly operates in semiconductor manufacturing stages around wafer testing, packaging, assembly, and final testing, after chip design and wafer fabrication.', stop:'Do not try to learn the whole semiconductor ecosystem tonight.' },
  { number:37, question:'What is the difference between ASE and TSMC?', understand:'TSMC is primarily a foundry that fabricates customers’ semiconductor designs on wafers. ASE is strongly focused on assembly, packaging, and testing.', example:'TSMC makes the circuits on the wafer; ASE may later help probe, package, and final-test devices.', interview:'The simplest difference is that TSMC is primarily a semiconductor foundry that fabricates circuits on wafers, while ASE specializes strongly in semiconductor assembly, packaging, and testing.', stop:'Do not say there is absolutely zero overlap in modern advanced packaging services.' },
  { number:38, question:'What happens before a chip reaches ASE?', understand:'First the IC is designed. Then a foundry fabricates that design on a silicon wafer. After fabrication, the device can enter probe, packaging, and test stages.', example:'Design house → foundry → back-end packaging/test.', interview:'Before ASE’s packaging and test stages, the IC is designed and fabricated on a silicon wafer by a semiconductor foundry.', stop:'No need to learn photolithography or transistor fabrication now.' },
  { number:39, question:'What happens after ASE finishes testing/packaging?', understand:'Qualified packaged devices go to customers and are integrated into larger electronic systems.', example:'The chip may later be mounted on a board used in a phone, server, computer, or vehicle system.', interview:'After packaging and testing, qualified semiconductor devices are shipped to customers for integration into boards, systems, and end products.', stop:'Do not say ASE manufactures the whole end product.' },
  { number:40, question:'Why are packaging and testing necessary?', understand:'Packaging makes the fragile die physically usable and connected. Testing helps ensure defective or out-of-spec devices do not reach the customer.', example:'Package = protect/connect. Test = verify performance/specifications.', interview:'Packaging protects the die and provides the electrical and mechanical connections needed to use it in a system. Testing verifies that the device functions correctly and meets specifications before shipment.', stop:'That is enough for Day 1.' },
];

const sections = [
  { title:'A. Project fundamentals', range:'Q1–Q20', questions:projectQuestions.slice(0,20) },
  { title:'B. Complete project pipeline', range:'Q21–Q30', questions:projectQuestions.slice(20) },
  { title:'C. ASE / company from zero', range:'Q31–Q40', questions:aseQuestions },
];

export function AseDay1InterviewPrep() {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]/50 p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">ASE Interview · Day 1</div>
        <h3 className="mt-2 text-xl font-extrabold text-[var(--fg)]">Project Foundations + ASE Basics</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Study only what you need for the interview. For each question: understand the idea, look at one simple example, learn the short interview answer, then stop at the boundary shown.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Two mental pictures to know today</p>
        <p className="mt-3 text-sm font-semibold leading-7 text-[var(--fg)]">Project: RGB image → landmarks / ROI → preprocessing → 224×224 → network → embedding → cosine similarity → threshold → same / different</p>
        <p className="mt-2 text-sm font-semibold leading-7 text-[var(--fg)]">ASE flow: Design → wafer fabrication → wafer probe → packaging → final test → customer</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
            <h4 className="font-extrabold text-[var(--fg)]">{section.title}</h4>
            <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold text-[var(--muted)] dark:bg-white/5">{section.range}</span>
          </div>

          <div className="divide-y divide-[var(--line-subtle)]">
            {section.questions.map((item) => (
              <details key={item.number} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start gap-3">
                  <span className="mt-0.5 grid h-7 min-w-7 place-items-center rounded-lg bg-[var(--accent-subtle)] text-[11px] font-extrabold text-[var(--accent)]">{item.number}</span>
                  <span className="flex-1 text-sm font-bold leading-6 text-[var(--fg)]">{item.question}</span>
                  <span className="mt-1 text-xs text-[var(--muted)] transition group-open:rotate-180">⌄</span>
                </summary>

                <div className="ml-10 mt-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Understand</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--fg)]">{item.understand}</p>
                  </div>

                  {item.example && (
                    <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Simple example / mental picture</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.example}</p>
                    </div>
                  )}

                  {item.connection && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">Why it matters for you</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.connection}</p>
                    </div>
                  )}

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Say this in the interview</p>
                    <p className="mt-1 text-sm font-medium leading-6 text-[var(--fg)]">{item.interview}</p>
                  </div>

                  {item.stop && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">Stop here</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.stop}</p>
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
    </section>
  );
}
