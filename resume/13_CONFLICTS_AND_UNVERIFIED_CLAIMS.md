# Decisions, contradictions and updates
Dated 2026-11-19. Decisions are revisable and conditional. Source IDs and claim IDs link through [08](12_RESEARCH_SOURCE_REGISTER.csv) and [11](11_CLAIM_TO_SOURCE_LEDGER.csv).

| Decision / claim | Competing evidence and context | Current decision | Evidence that would change it |
|---|---|---|---|
| D01 photo C016 | 104 expat guide S03 promotes profile photo; Philips S18 discourages headshots; Greenhouse S16 lists parsing risk. | Portable English technical resume without photo by default; profile/form separately. | Specific employer requirement or a different submission channel. |
| D02 length C013–C014 | Micron S37 favors one early-career page; Philips S18 permits two for seasoned candidates. | One readable application page first, two only for valuable verified research content. | Confirmed substantial relevant experience/publications or explicit length instruction. |
| D03 summary C037 | PERSOL S15 recommends 2–3 lines; Philips S18 considers objectives old-fashioned. | Optional factual summary; omit generic objective/repetition. | A role needing explanation of the CV→software/RAG connection. |
| D04 language C015 | PERSOL notes international/local language differences; ITRI S20 normally uses English; NTHU notice S36 accepts English or Chinese. | English primary; reviewed Chinese only where useful/requested. | Current JD language request or confirmed working-language needs. |
| D05 personal data C106 | Some forms collect more identity details; Philips/Harvard discourage unnecessary personal details. | Minimal public contact; sensitive identifiers only in appropriate required private form. | Actual trusted application requirement. |
| D06 columns C017 | Yourator native editor S06 has multi-column skills; Greenhouse S16 warns about column parsing. | Native profile layout can differ from one-column portable file. | Actual extraction/form tests and channel instruction. |
| D07 pronouns C038 | Philips tip 12 favors first person; Harvard S29 avoids pronouns. | Action phrases without pronouns for concise technical bullets; no universal rule asserted. | Requested narrative bio or employer template. |
| D08 GPA C118 | Philips gives a 3.2 suggestion; no Taiwan-wide cutoff found. | Verify scale and requirement; optional if it adds signal. | Current employer threshold/request or advantageous transcript evidence. |
| D09 cover letter C001 | PERSOL recommends one; NTHU/ITRI S36 says unnecessary for that notice. | Follow actual posting and form; don't infer requirement from general advice. | Specific current application instruction. |
| D10 metrics C028/C038 | Prior reports contain impressive historical dorsal numbers; later audit warns of version/protocol and cleaning changes. | No current dorsal number cleared. Old architecture must not become current personal claim. | Approved manifest/config/protocol, completed log and supervisor signoff. |
| D11 tests C032/C033 | Saved log says 84 tests with nine skips; earlier casual wording can imply all passed/live behavior. | 75 non-skipped cases, nine skipped, historical offline log only. Personal contribution unverified. | Current reproducible run with full scope and contribution evidence. |
| D12 Appier C022 | Older plan ranked J48 actionable with duration unknown; current form asks 12 months and onsite/hybrid. | Duration/graduation/commute clarification required before calling realistic. | Employer acceptance of actual availability and contract arrangement. |
| D13 sample counts C025–C027 | Old n21 sample includes J47 later withdrawn; final appended sensitivity n20 excludes it. | Keep old counts historical and distinguish M/P/ALT; use n20 M+P only with label. | Fresh controlled source recheck with a new dated sample. |
| D14 AIAT C034/C039 | User acceptance report; public search finds multiple AIAT conference names. | Venue/title/authors/status unresolved; no citation approved. | Acceptance notice, final manuscript and publisher record. |
| D15 mastery C033/C035 | Code and AI reports exist; no observed independent assessment. | Attribute project facts to artifacts; every personal implementation/skill line VERIFY FIRST. | Identified personal changes, credible contribution confirmation and explanation. |

## Corrections to earlier workspace audit certainty
The two root-level November 19 reports are retained unchanged. Their wording sometimes describes prior code inspection as “verified” and their counts do not demonstrate that every saved page was read. This package uses the stricter later evidence taxonomy: L04 is an AI-generated historical audit, not original dorsal evidence; P01–P03 directly inspected code supports only implementation facts; P04 supports a saved log result, not present performance. Unproven absence is phrased as “not found in inspected scope” (C028–C036).

## Required evidence before drafting
- Full professional name, phone/email and reviewed profile links (C101–C103).
- Enrollment/degree wording, expected graduation, bachelor's details, GPA scale if used (C111/C116–C120).
- RA appointment/title/dates and a personal contribution account with supervisor or artifact support (C121–C125).
- Approved current dorsal protocol/dataset/config/result lineage; no old metric until resolved (C028/C123–C126).
- Paper acceptance/final manuscript, author order, full conference identity and actual publication status (C034/C141–C143).
- EvidenceOps contribution/version and which components can be independently explained; no deployment inference (C128–C140).
- Actual permit end date, other work/RA hours, availability and commute feasibility (C104/C145).
- Language self-assessment and real credentials for awards/certificates, if any (C144/C147).

## Update protocol
C073 records this maintenance procedure as a strategy inference.
Assign a new source ID to each newly inspected original. Add access date and exact section/function; never replace old snapshot dates. For each affected claim record old/new wording, evidence status and reason here, then update the ledger and dependent blueprint rows. A new source does not resolve authorship unless it actually identifies contribution. Use SUPERSEDED for an obsolete result, not deletion. Recheck shortlist forms when tailoring, especially enrollment/duration/hours. No recurring monitoring was configured.


## Repository-reconciliation additions
C201: June versus July 2027 graduation is CONFLICTED; verify enrollment/graduation record. C202: older ONNX mention is USER-REPORTED through R02, not confirmed personal skill. C203: older application statements differ from missing current tracker; preserve reported history without inventing current response/outcome. C204: private sources remain externally unverified behind stable source IDs. C205–C206 record repository and push checks, separate from resume eligibility.
