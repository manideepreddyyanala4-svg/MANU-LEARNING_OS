import { ArrowDown, CheckCircle2, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

const mainFlow = [
  'IC DESIGN',
  'WAFER FABRICATION',
  'WAFER PROBE / CP',
  'DICING',
  'PACKAGING',
  'FINAL TEST / FT',
  'PACKING / SHIPMENT',
];

const packagingFlow = [
  'DIE PREPARATION',
  'DIE ATTACH',
  'WIRE BOND / FLIP CHIP',
  'MOLDING',
  'PLATING',
  'LASER MARKING',
  'TRIM / FORM',
  'FINAL TEST',
  'PICK & PLACE / PACKING',
];

const semiconductorStages = [
  {
    number: '1',
    title: 'IC DESIGN',
    happens: [
      'Engineers design what the chip should do.',
      'Examples: processor, memory, sensor, communication chip.',
      'At this stage it is a design, not yet a physical chip.',
    ],
    ase: [
      "Usually ASE is not the company designing the customer's chip.",
      'The chip design normally comes from the semiconductor customer/design company.',
    ],
    remember: 'DESIGN = decide what the chip should do.',
  },
  {
    number: '2',
    title: 'WAFER FABRICATION',
    happens: [
      'The chip design is manufactured on a round silicon wafer.',
      'A wafer contains many copies of the chip. Each small chip area is called a DIE.',
      'Simple idea: deposit material → create patterns → etch → modify silicon → create metal connections → repeat many times.',
    ],
    ase: [
      'The main wafer fabrication is normally performed by a semiconductor foundry/fab.',
      'ASE mainly works after or around the later assembly and test stages.',
    ],
    remember: 'WAFER = large round silicon disk containing many dies.',
  },
  {
    number: '3',
    title: 'WAFER PROBE / CP',
    subtitle: 'Also called: CP · Chip Probe · Circuit Probe · Wafer Probe · Wafer Sort · Wafer Test',
    happens: [
      'The individual dies are electrically tested while they are still on the wafer.',
      'Results can be PASS, FAIL, or different failure bins.',
    ],
    ase: [
      'ASE can provide wafer probing / wafer test services.',
      'This is one important testing area before packaging.',
    ],
    remember: 'CP = TEST THE CHIP BEFORE IT IS PACKAGED.',
    extra: (
      <div className="mt-4">
        <MiniFlow steps={['WAFER', 'PROBER', 'PROBE CARD', 'ATE', 'TEST RESULTS']} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Definition term="PROBER" text="Positions the wafer." />
          <Definition term="PROBE CARD" text="Makes electrical contact with the die pads." />
          <Definition term="ATE" text="Automatic Test Equipment. Sends electrical signals and measures the response." />
          <Definition term="DIE" text="The individual chip area on the wafer." />
        </div>
      </div>
    ),
  },
  {
    number: '4',
    title: 'DICING',
    happens: [
      'The large wafer is cut into individual dies.',
      'Good dies can then continue into packaging.',
    ],
    ase: ['This can be part of semiconductor assembly/packaging operations.'],
    remember: 'DICING = cutting the wafer into individual chips.',
    extra: <MiniFlow steps={['WAFER', 'CUT', 'INDIVIDUAL DIES']} />,
  },
];

const packagingSteps = [
  {
    title: 'DIE PREPARATION',
    body: 'Prepare the selected good die for assembly.',
    memory: 'Get the die ready for packaging.',
  },
  {
    title: 'DIE ATTACH',
    body: 'The silicon die is attached to the package/substrate.',
    memory: 'PUT THE DIE ON ITS BASE.',
  },
  {
    title: 'WIRE BOND',
    body: 'Very small wires connect the die pads to the package.',
    memory: 'Tiny wires connect the chip to the package.',
  },
  {
    title: 'FLIP CHIP',
    body: 'Instead of long bonding wires, the chip is flipped and connected using small bumps.',
    memory: 'Flip the chip and connect it through bumps.',
    note: 'WIRE BOND OR FLIP CHIP — these are alternative/common connection approaches depending on the package.',
  },
  {
    title: 'MOLDING',
    body: 'The chip and its connections are protected with molding compound from physical damage, moisture, dust, and the environment.',
    memory: 'MOLDING = protective body around the chip.',
  },
  {
    title: 'PLATING',
    body: 'Metal surfaces/leads may be coated to improve solderability, protect against corrosion, and support electrical connection.',
    memory: 'PLATING = protective/conductive metal coating.',
  },
  {
    title: 'LASER MARKING',
    body: 'Information is marked on the package: company, part number, lot information, and device identification.',
    memory: 'MARKING = print identification on the chip package.',
  },
  {
    title: 'TRIM / FORM',
    body: 'TRIM cuts package leads as required. FORM shapes the leads into their final form.',
    memory: 'TRIM = CUT · FORM = SHAPE',
  },
  {
    title: 'PICK & PLACE / PACKING',
    body: 'Good devices are separated, organized, and packed for the next production/customer stage. Then they can be shipped.',
    memory: 'Good devices are organized, packed, and prepared for shipment.',
  },
];

const terms = [
  ['WAFER', 'Large silicon disk containing many dies.'],
  ['DIE', 'One individual chip on the wafer before packaging.'],
  ['CHIP', 'Common general term for the semiconductor device.'],
  ['PACKAGE', 'Protective/electrical structure around the die.'],
  ['DUT', 'Device Under Test.'],
  ['ATE', 'Automatic Test Equipment.'],
  ['PROBER', 'Moves/positions wafer for testing.'],
  ['PROBE CARD', 'Makes electrical contact with dies during wafer test.'],
  ['HANDLER', 'Moves packaged chips during final test.'],
  ['SOCKET', 'Makes electrical contact with packaged DUT.'],
  ['LOAD BOARD', 'Interface between test hardware/DUT and ATE.'],
  ['TEST PROGRAM', 'Instructions/tests executed by ATE.'],
  ['BIN', 'Category assigned based on test result.'],
  ['YIELD', 'Percentage of tested devices that pass.'],
  ['NPI', 'New Product Introduction.'],
  ['CP', 'Wafer-level testing before packaging.'],
  ['FT', 'Final testing after packaging.'],
  ['OSAT', 'Outsourced Semiconductor Assembly and Test.'],
];

const interviewQuestions = [
  {
    q: 'What does ASE do?',
    a: "ASE is mainly a semiconductor assembly and test company. After wafers or dies are manufactured, ASE can perform wafer testing, package the good dies, and then perform final testing on the packaged chips. ASE checks whether the devices meet the customer's specifications before shipment.",
  },
  {
    q: 'Explain the semiconductor flow.',
    a: 'First the chip is designed. Then many dies are fabricated on a silicon wafer. The dies can be tested at wafer probe or CP. The wafer is cut into individual dies, good dies are packaged, and after packaging the devices go through final test. Passing devices are then packed and shipped.',
  },
  {
    q: 'What is the difference between CP and FT?',
    a: 'CP tests the die while it is still on the wafer, before packaging. FT tests the packaged chip after assembly.',
  },
  {
    q: 'What is ATE?',
    a: 'ATE means Automatic Test Equipment. It sends electrical test signals to the device and measures the responses to determine whether the device meets the required specifications.',
  },
  {
    q: 'What is DUT?',
    a: 'DUT means Device Under Test. It is the chip or device currently being tested.',
  },
  {
    q: 'What is yield?',
    a: 'Yield is the percentage of tested devices that pass. It is calculated as good units divided by total tested units multiplied by 100.',
  },
  {
    q: 'What would you do if yield suddenly dropped?',
    a: 'First I would verify that the data and calculation are correct. Then I would check when and where the drop started and compare things such as lot, wafer, tester, site and failure bins. I would also check recent changes, test possible causes systematically, and verify whether the result recovers.',
  },
  {
    q: 'Where does a PTE fit?',
    a: 'A Product Test Engineer works with semiconductor test results and product performance. The engineer monitors test data and yield, investigates abnormal results, supports debugging and helps make sure the product meets the required test specifications.',
  },
];

function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center">
      {steps.map((step, index) => (
        <div key={`${step}-${index}`} className="contents">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-center text-[11px] font-extrabold tracking-wide text-[var(--fg)] shadow-2xs md:min-w-[132px] md:flex-1">
            {step}
          </div>
          {index < steps.length - 1 && (
            <ArrowDown size={16} className="mx-auto shrink-0 text-[var(--accent)] md:-rotate-90" />
          )}
        </div>
      ))}
    </div>
  );
}

function MiniFlow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
      {steps.map((step, index) => (
        <div key={`${step}-${index}`} className="flex items-center gap-2">
          <span className="rounded-lg bg-[var(--surface)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--fg)] shadow-2xs">
            {step}
          </span>
          {index < steps.length - 1 && <span className="text-xs font-bold text-[var(--accent)]">→</span>}
        </div>
      ))}
    </div>
  );
}

function Section({
  id,
  number,
  title,
  subtitle,
  children,
  important = false,
}: {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  important?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className={`mb-4 rounded-2xl border p-5 ${important ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)]/50' : 'border-[var(--line)] bg-[var(--surface)]'}`}>
        <div className="flex items-start gap-3">
          <span className="grid h-8 min-w-8 place-items-center rounded-xl bg-[var(--accent)] text-xs font-black text-white">
            {number}
          </span>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--fg)] md:text-2xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function Definition({ term, text }: { term: string; text: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">{term}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{text}</p>
    </div>
  );
}

function Memory({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-4 py-3 text-sm font-extrabold leading-6 text-[var(--fg)]">
      {children}
    </div>
  );
}

export function AseQuickPrep() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
            <Zap size={12} /> Interview Quick Revision
          </span>
          <span className="text-[11px] font-semibold text-[var(--muted)]">Temporary high-priority prep page</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--fg)] sm:text-4xl">ASE Semiconductor Quick Prep</h1>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">Semiconductor Flow • ASE&apos;s Role • Packaging • CP &amp; FT • PTE Basics</p>

        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 sm:p-5">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Big picture</p>
          <Flow steps={mainFlow} />
          <Memory>DESIGN → MAKE THE WAFER → TEST THE WAFER → CUT → PACKAGE → TEST AGAIN → SHIP</Memory>
          <div className="mt-3 rounded-xl bg-[var(--fg)] px-4 py-3 text-center text-sm font-black tracking-wide text-[var(--bg)]">
            ASE MAIN AREA: TEST → PACKAGE → FINAL TEST
          </div>
        </div>
      </header>

      <div className="mt-5 rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]/70 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={17} className="text-[var(--accent)]" />
          <h2 className="text-sm font-black text-[var(--fg)]">30-SECOND REVISION</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Definition term="FLOW" text="DESIGN → WAFER FAB → CP → DICING → PACKAGE → FT → SHIP" />
          <Definition term="ASE" text="TEST → PACKAGE → TEST AGAIN" />
          <Definition term="CP / FT" text="CP = before packaging · FT = after packaging" />
          <Definition term="ATE / DUT" text="ATE = Automatic Test Equipment · DUT = Device Under Test" />
          <Definition term="YIELD" text="Good / Total × 100" />
          <Definition term="OSAT" text="Outsourced Semiconductor Assembly and Test" />
          <Definition term="PTE" text="Test data + Yield + Abnormal-result investigation + Debugging" />
          <Definition term="MEMORY" text="Design → make → test → cut → package → test again → ship" />
        </div>
      </div>

      <nav className="sticky top-[54px] z-10 mt-5 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--bg)]/95 p-2 shadow-2xs backdrop-blur-md">
        <div className="flex min-w-max gap-1 text-[11px] font-bold">
          {[
            ['flow', 'Flow'],
            ['packaging', 'Packaging'],
            ['final-test', 'Final Test'],
            ['cp-vs-ft', 'CP vs FT'],
            ['ase-role', 'ASE Role'],
            ['pte', 'PTE'],
            ['yield', 'Yield'],
            ['terms', 'Terms'],
            ['interview-questions', 'Interview Q&A'],
          ].map(([href, label]) => (
            <a key={href} href={`#${href}`} className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--accent)]">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-8 space-y-10">
        <Section id="flow" number="1" title="THE WHOLE SEMICONDUCTOR FLOW" subtitle="Know what happens, where ASE fits, and one sentence to remember.">
          <div className="grid gap-4 lg:grid-cols-2">
            {semiconductorStages.map((stage) => (
              <article key={stage.number} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 min-w-8 place-items-center rounded-xl bg-[var(--accent-subtle)] text-xs font-black text-[var(--accent)]">{stage.number}</span>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--fg)]">{stage.title}</h3>
                    {stage.subtitle && <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{stage.subtitle}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">What happens</p>
                  <div className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--fg)]">
                    {stage.happens.map((line) => <p key={line}>{line}</p>)}
                  </div>
                </div>
                {stage.extra && <div className="mt-4">{stage.extra}</div>}
                <div className="mt-4 border-t border-[var(--line-subtle)] pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">ASE&apos;s role</p>
                  <div className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--muted)]">
                    {stage.ase.map((line) => <p key={line}>{line}</p>)}
                  </div>
                </div>
                <Memory>{stage.remember}</Memory>
              </article>
            ))}
          </div>
        </Section>

        <Section id="packaging" number="2" title="PACKAGING FLOW" subtitle="Think of packaging as turning a bare die into a protected, connected, usable device.">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
            <Flow steps={packagingFlow} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {packagingSteps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
                <h3 className="text-sm font-extrabold text-[var(--fg)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
                {step.note && <p className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] p-3 text-xs font-semibold leading-5 text-[var(--fg)]">{step.note}</p>}
                <Memory>{step.memory}</Memory>
              </article>
            ))}
          </div>
        </Section>

        <Section id="final-test" number="3" title="FINAL TEST — VERY IMPORTANT FOR PTE" subtitle="After packaging, the chip is electrically tested again." important>
          <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--surface)] p-5 shadow-2xs">
            <Flow steps={['HANDLER', 'DEVICE', 'SOCKET / LOAD BOARD', 'ATE', 'TEST PROGRAM', 'PASS / FAIL / BIN']} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Definition term="DUT" text="Device Under Test. The chip currently being tested." />
              <Definition term="HANDLER" text="Automatically moves packaged devices into and out of the test position." />
              <Definition term="SOCKET" text="Makes contact with the packaged device." />
              <Definition term="LOAD BOARD" text="Connects the DUT/test socket to the ATE environment." />
              <Definition term="ATE" text="Automatic Test Equipment. Applies tests and measures electrical responses." />
              <Definition term="TEST PROGRAM" text="Defines the tests that the ATE runs." />
              <Definition term="BINNING" text="Devices are categorized by test result: PASS, FAIL, or different failure/performance bins." />
            </div>
            <Memory>FT = TEST THE CHIP AFTER PACKAGING.</Memory>
          </div>
        </Section>

        <Section id="cp-vs-ft" number="4" title="CP VS FT" subtitle="This difference is easy to ask in an interview. Keep it simple.">
          <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--bg)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <th className="px-4 py-3 font-black">Point</th>
                  <th className="px-4 py-3 font-black">CP / Wafer Probe</th>
                  <th className="px-4 py-3 font-black">FT / Final Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line-subtle)] text-[var(--fg)]">
                {[
                  ['When', 'Before packaging', 'After packaging'],
                  ['Device', 'Die still on wafer', 'Packaged chip'],
                  ['Contact', 'Probe card', 'Socket / load board'],
                  ['Movement', 'Wafer prober', 'Handler'],
                  ['Main purpose', 'Check dies before packaging', 'Check final packaged device'],
                  ['Memory', 'CP = BEFORE PACKAGE', 'FT = AFTER PACKAGE'],
                ].map((row) => (
                  <tr key={row[0]}>
                    <th className="px-4 py-3 text-xs font-extrabold text-[var(--muted)]">{row[0]}</th>
                    <td className="px-4 py-3 font-semibold">{row[1]}</td>
                    <td className="px-4 py-3 font-semibold">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--fg)] p-4 text-center text-lg font-black text-[var(--bg)]">CP = BEFORE PACKAGING</div>
            <div className="rounded-2xl bg-[var(--accent)] p-4 text-center text-lg font-black text-white">FT = AFTER PACKAGING</div>
          </div>
        </Section>

        <Section id="ase-role" number="5" title="WHERE ASE FITS" subtitle="ASE is mainly an OSAT company: Outsourced Semiconductor Assembly and Test." important>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Chip company / customer</p>
                <p className="mt-2 text-base font-extrabold text-[var(--fg)]">CHIP DESIGN</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Foundry</p>
                <p className="mt-2 text-base font-extrabold text-[var(--fg)]">WAFER FABRICATION</p>
              </div>
              <div className="rounded-xl border-2 border-[var(--accent)] bg-[var(--accent-subtle)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">ASE</p>
                <p className="mt-2 text-sm font-extrabold leading-6 text-[var(--fg)]">WAFER TEST / CP → ASSEMBLY &amp; PACKAGING → FINAL TEST / FT → PACK / SHIP</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted)]">
              <p>A semiconductor customer may design the chip.</p>
              <p>A foundry manufactures the silicon wafer.</p>
              <p>Then ASE can receive the wafer/dies and provide testing, assembly/packaging and final testing services.</p>
              <p className="font-bold text-[var(--fg)]">ASE helps turn the manufactured silicon die into a tested packaged semiconductor product.</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent-subtle)] p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent)]">Interview answer · What does ASE do?</p>
            <p className="mt-3 text-base font-semibold leading-7 text-[var(--fg)]">“ASE is mainly a semiconductor assembly and test company. After wafers or dies are manufactured, ASE can perform wafer testing, package the good dies, and then perform final testing on the packaged chips. ASE checks whether the devices meet the customer&apos;s specifications before shipment.”</p>
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Shorter version</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--fg)]">“ASE mainly packages and tests semiconductor chips. It can test dies at wafer level, package the good dies, and test the packaged devices again before shipment.”</p>
            </div>
          </div>
        </Section>

        <Section id="wafer-arrives" number="6" title="WHAT HAPPENS WHEN A WAFER ARRIVES AT ASE?" subtitle="Use this as the simple interview mental model, not as a rule for every product.">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <Flow steps={['CUSTOMER SENDS PROCESSED WAFER', 'ASE RECEIVES WAFER', 'WAFER PROBE / CP', 'IDENTIFY GOOD / BAD DIES', 'DICING', 'PACKAGE GOOD DIES', 'FINAL TEST', 'BIN RESULTS', 'PACK / SHIP']} />
            <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-[var(--muted)]">Not every ASE customer or product follows exactly the same manufacturing route. But this is the simple flow to understand for the interview.</p>
          </div>
        </Section>

        <Section id="pte" number="7" title="MY TARGET ROLE — PRODUCT TEST ENGINEER" subtitle="A PTE works with test data, product behavior, abnormal results, and debugging — not only with the machine." important>
          <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--surface)] p-5">
            <Flow steps={['PRODUCT ENTERS TEST', 'ATE RUNS TEST PROGRAM', 'TEST DATA IS GENERATED', 'CALCULATE / MONITOR YIELD', 'CHECK PASS / FAIL / BINS', 'FIND ABNORMAL RESULTS', 'INVESTIGATE', 'COMPARE DATA / CONDITIONS', 'TEST POSSIBLE CAUSES', 'VERIFY RESULT', 'DOCUMENT / ESCALATE']} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['test results', 'yield', 'failure bins', 'test programs / test flow', 'product behavior', 'abnormal results', 'debugging', 'problem investigation', 'production/test data'].map((item) => (
                <div key={item} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-xs font-bold text-[var(--fg)]">{item}</div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="yield" number="8" title="YIELD" subtitle="Yield tells you what percentage of tested devices passed.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 text-center shadow-2xs">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Formula</p>
              <p className="mt-3 text-xl font-black text-[var(--fg)] sm:text-2xl">YIELD = GOOD UNITS / TOTAL TESTED UNITS × 100%</p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xs">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Example</p>
              <p className="mt-3 text-sm font-semibold leading-7 text-[var(--fg)]">100 chips tested · 95 pass</p>
              <p className="text-lg font-black text-[var(--accent)]">95 / 100 × 100 = 95%</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">High yield = more devices passing. Sudden yield drop = something may be wrong and needs investigation.</p>
            </div>
          </div>
        </Section>

        <Section id="yield-drop" number="9" title="IF YIELD SUDDENLY DROPS" subtitle="Follow a calm investigation flow instead of guessing.">
          <div className="grid gap-3 lg:grid-cols-2">
            {[
              ['1. CHECK THE DATA', 'Is the calculation correct? Is the sample size correct? Is the test data valid?'],
              ['2. FIND WHEN / WHERE IT STARTED', 'Which time? Which product? Which lot? Which wafer?'],
              ['3. CHECK PATTERNS', 'Failure bins · tester · site · wafer · lot · test conditions'],
              ['4. CHECK RECENT CHANGES', 'Test program · setup · maintenance · material · process · equipment'],
              ['5. CONTAIN / ESCALATE IF NEEDED', 'Do not allow a suspected problem to continue blindly.'],
              ['6. RUN APPROVED COMPARISONS', 'Compare conditions systematically.'],
              ['7. VERIFY', 'Did the result/yield recover?'],
              ['8. DOCUMENT', 'Record what was found and what was changed.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xs">
                <h3 className="text-sm font-extrabold text-[var(--fg)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
          <Memory>VERIFY → LOCATE → COMPARE → INVESTIGATE → TEST → VERIFY AGAIN</Memory>
        </Section>

        <Section id="terms" number="10" title="BASIC TERMS" subtitle="Fast flash cards. Know the one-line meaning first.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {terms.map(([term, text]) => <Definition key={term} term={term} text={text} />)}
          </div>
        </Section>

        <Section id="electrical" number="11" title="BASIC ELECTRICAL KNOWLEDGE" subtitle="Only the interview-level basics.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Definition term="VOLTAGE" text="Electrical potential / push." />
            <Definition term="CURRENT" text="Flow of electric charge." />
            <Definition term="RESISTANCE" text="Opposition to current." />
            <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--accent)]">OHM&apos;S LAW</p>
              <p className="mt-2 text-xl font-black text-[var(--fg)]">V = I × R</p>
            </div>
            <Definition term="OPEN CIRCUIT" text="The electrical path is broken. Current cannot flow normally." />
            <Definition term="SHORT CIRCUIT" text="Two points become connected through an unintended low-resistance path. This can produce abnormal current." />
          </div>
        </Section>

        <Section id="research" number="12" title="CONNECTION TO MY RESEARCH" subtitle="The domain is different, but the debugging mindset transfers.">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">My research</p>
              <MiniFlow steps={['run experiment', 'get results', 'see abnormal behavior', 'compare conditions', 'investigate', 'change one thing', 'test again', 'verify']} />
            </div>
            <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)]/40 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--accent)]">PTE</p>
              <MiniFlow steps={['run semiconductor test', 'get test data', 'see abnormal yield/result', 'compare lots/testers/sites/conditions', 'investigate', 'test possible causes', 'verify', 'document']} />
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-[var(--fg)] p-5 text-center text-base font-black tracking-wide text-[var(--bg)]">
            THE DOMAIN IS DIFFERENT. THE PROBLEM-SOLVING PROCESS IS SIMILAR.
          </div>
        </Section>

        <Section id="interview-questions" number="13" title="INTERVIEW QUESTIONS" subtitle="Open a card, read the answer, close it, and try to say it yourself.">
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs">
            <div className="divide-y divide-[var(--line-subtle)]">
              {interviewQuestions.map((item, index) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-start gap-3">
                    <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-[var(--accent-subtle)] text-[11px] font-black text-[var(--accent)]">{index + 1}</span>
                    <span className="flex-1 text-sm font-extrabold leading-6 text-[var(--fg)]">Q: {item.q}</span>
                    <span className="mt-1 text-xs text-[var(--muted)] transition group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="ml-10 mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Answer</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-[var(--fg)]">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Section>

        <Section id="final-revision" number="14" title="FINAL 30-SECOND REVISION" subtitle="Before the interview, this is the minimum picture to keep in your head." important>
          <div className="rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-5 sm:p-6">
            <p className="text-lg font-black leading-8 text-[var(--fg)]">DESIGN → WAFER FAB → CP → DICING → PACKAGE → FT → SHIP</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Definition term="ASE" text="TEST → PACKAGE → TEST AGAIN" />
              <Definition term="CP" text="Before packaging" />
              <Definition term="FT" text="After packaging" />
              <Definition term="ATE" text="Automatic Test Equipment" />
              <Definition term="DUT" text="Device Under Test" />
              <Definition term="YIELD" text="Good / Total × 100" />
              <Definition term="OSAT" text="Outsourced Semiconductor Assembly and Test" />
              <Definition term="PTE" text="Test data + Yield + Abnormal-result investigation + Debugging" />
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
