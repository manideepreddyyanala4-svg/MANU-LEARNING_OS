# Decisions, contradictions and updates
Dated 2026-11-19. Decisions are revisable and conditional. Source IDs and claim IDs link through [12](12_RESEARCH_SOURCE_REGISTER.csv) and [11](11_CLAIM_TO_SOURCE_LEDGER.csv). The current independent review is [16](16_RESUME_READINESS_GAP_AUDIT.md); original text is preserved in the export.

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
| D11 tests C032/C033/C308/C324 | Saved log 75 passed/9 skipped; pinned README 76/8 with UCI present; older 73/8 not sourced. | Same 84-test suite has a UCI-dependent skip; original 81-case run remains unresolved. Personal authorship/live quality unverified. | Original 73/8 revision/log and attributable test changes. |
| D12 Appier C022 | Older plan ranked J48 actionable with duration unknown; current form asks 12 months and onsite/hybrid. | Duration/graduation/commute clarification required before calling realistic. | Employer acceptance of actual availability and contract arrangement. |
| D13 sample counts C025–C027 | Old n21 sample includes J47 later withdrawn; final appended sensitivity n20 excludes it. | Keep old counts historical and distinguish M/P/ALT; use n20 M+P only with label. | Fresh controlled source recheck with a new dated sample. |
| D14 publications C034/C039/C302–C305 | Private original correspondence and submitted manuscript inspected. | Use publicly released citation or approved wording only. | Written disclosure permission and final publication/participation evidence. |
| D15 mastery C033/C035 | Code and AI reports exist; no observed independent assessment. | Attribute project facts to artifacts; every personal implementation/skill line VERIFY FIRST. | Identified personal changes, credible contribution confirmation and explanation. |

## Corrections to earlier workspace audit certainty
The two root-level November 19 reports are retained unchanged. Their wording sometimes describes prior code inspection as “verified” and their counts do not demonstrate that every saved page was read. This package uses the stricter later evidence taxonomy: L04 is an AI-generated historical audit, not original dorsal evidence; P01–P03 directly inspected code supports only implementation facts; P04 supports a saved log result, not present performance. Unproven absence is phrased as “not found in inspected scope” (C028–C036).

## Required evidence before drafting
- Current professional name/contact accuracy and reviewed profile ownership privately (C101–C103); historical resume blocks are now accessible through N02.
- Enrollment/degree wording, bachelor's details and official GPA scales (C111/C116–C120); June 2027 is the current owner correction, independently unverified.
- RA appointment/title/dates and a personal contribution account with supervisor or artifact support (C121–C125).
- Approved current dorsal protocol/dataset/config/result lineage; no old metric until resolved (C028/C123–C126).
- Obtain written clearance for the exact external description and verified details of any published citation.
- EvidenceOps contribution/version and which components can be independently explained; no deployment inference (C128–C140).
- Actual permit end date, other work/RA hours, availability and commute feasibility (C104/C145).
- Language self-assessment and real credentials for awards/certificates, if any (C144/C147).

## Update protocol
C073 records this maintenance procedure as a strategy inference.
Assign a new source ID to each newly inspected original. Add access date and exact section/function; never replace old snapshot dates. For each affected claim record old/new wording, evidence status and reason here, then update the ledger and dependent blueprint rows. A new source does not resolve authorship unless it actually identifies contribution. Use SUPERSEDED for an obsolete result, not deletion. Recheck shortlist forms when tailoring, especially enrollment/duration/hours. No recurring monitoring was configured.


## Repository-reconciliation additions
C201/C301: June 2027 is the current explicit owner correction; July is historical, while university confirmation remains pending. C202: N02 adds direct historical resume wording and N07 export implementation; personal ONNX skill/current parity remains unverified. C203/C312: Manu OS has application-management code, but actual database records/outcomes were not accessed. C204: private originals remain externally inaccessible behind safe IDs. C205–C207 preserve earlier repository/publication context; this task commits locally without push/deployment.
