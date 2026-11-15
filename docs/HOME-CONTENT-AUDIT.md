# Home and utility content audit

12 October 2026. Fresh review began after the explicit image-parity gate.
This covers Home (`/`), Panel (`/panel`), shared navigation/footer/process copy,
Build, Privacy, 404, metadata, optional game narrative, achievements and timeline.
It is a source/content audit, not final rendered or production sign-off.

## Full source reread

All eight files below were read in full, 2,292 lines total, from
`/Users/shannonhecker/Downloads/`. Fingerprints identify the reviewed local
versions without publishing the private preparation material.

| Source | Lines | SHA-256 |
|---|---:|---|
| `lseg-round-2-paul-moreira-prep.md` | 168 | `7a515bce87ac5eef5043a6998818057e63774f908bd01d8b5122e90344fdbfc6` |
| `lseg-round-2-spoken-script.md` | 233 | `587bf48099eba965bbf8741df9346dfd525b5ff9a3c488fedb0b88198eae4bcd` |
| `lseg-round-3-jamie-coulson-prep.md` | 319 | `911571030096f58bcc2236e9ce4acfb8df4a98241ca55bdf87e05e2038e92975` |
| `lseg-round-3-speaker-notes.md` | 184 | `b2c7ddd5336e9c70e1a1c6b9d71d95a55ff5282278663ac87a44b5bf62b24f18` |
| `lseg-round-4-frank-higgs-prep.md` | 228 | `89df5eb5bac2d435567208d17e1bdfdfd3abe1a779f765ed7db3c8906cbc0b18` |
| `lseg-round-4-speaker-notes.md` | 473 | `6cdb4fabe28fd134e680d8a42ef7141a655d8dc55a3f900940141611fe2eb9eb` |
| `lseg-round-5-sai-potukuchi-prep.md` | 195 | `6c4cbab4c6e2cfcb5c7ed1dbfd047eb4ee2c74af0c0e0338529531a1f012941f` |
| `lseg-round-5-sai-speaker-notes.md` | 492 | `d4d044a93af02185b526448e413a113277b33fe92240adc0b6b91e14c9c198af` |

Later explicit user corrections take precedence over older rehearsal drafts.
Original project evidence establishes implementation; interview preparation can
support the account of working methods but cannot supply a missing experiment
record. No interviewer details, interview strategy or private transcript was
copied into the site.

## Coverage and disposition

| Surface / files | Findings and action |
|---|---|
| `Hero`, `Page`, `Work`, `cases`, Home/Panel routes | Five cases and current roles/statuses agree with confirmed chronology. Kept the introduction and first-person voice. Did not import older draft claims of fifteen years in regulated finance or several years at Barclays. |
| `HowIWork` research | Named CAM for the twelve-month ops-desk work, Deal Model for four teams, and Data Manager for paper tests. This prevents adjacent experience being read as Fusion Analytics evidence. FX remains trader observation; Winking remains Shannon's own children. |
| `HowIWork` accessibility | Narrowed Winking to labelled VoiceOver tabs, text scaling and quieter feedback, supported by the implementation review. Removed unsupported “every FX series” absolute; chart combines colour, line styles, fill markers and labelled states. Fusion zero violations remains the authored historical claim, with audit provenance gap in Revolut matrix. |
| `Base` metadata | Matched description to Hero's existing first-person current/past-role wording. No new claim or date. |
| `Footer`, `Nav`, `CaseRowLink`, `HomeProjectArtwork` | Public rebuilds explicitly labelled; uoaui.ai private alpha. Home artwork is decorative within clearly named case links; individual source compositions are covered by the completed media-parity audit. Kept live-link heading and qualifier together. |
| `LandingCompanion`, `GameBox`, `GameTimeline`, journey/achievements/timeline data | Career facts match confirmed education/employment and family dates. Game obstacles, stage clothing and scenery remain stylized artwork, not documentary product evidence. World events have separate source links and are not presented as career achievements. |
| `/privacy`, `AnalyticsConsent`, analytics script and every `track()` caller | Copy agrees with explicit consent, 180-day preference, URL/query sanitization and numeric game/reading events. No nickname/form payload in event callers. This verifies implementation wording, not a legal certification. |
| Scoreboard server/API and `/privacy` | Up to 100 stored per stage, top ten response, two-hour one-time receipt, one-hour keyed address digest agree with code. No raw address stored by the scoreboard code. Hosting operational data remains qualified. |
| `/404` | Plain missing-page text and return-to-work link; no unsupported claims. |
| `/build`, full `BUILD.md` | Read the full chronological log. Preserved historical revisions, including later-corrected 2012/2010 and replaced theme/game directions. Added an opening archive note: later corrections prevail; previous test counts/scores belong to their version. No historical score is asserted as current release evidence. |

## Career source boundary

Text from the older `ShannonH-JPM-CV.pdf` in iCloud confirms Ling Tung
2008–2010, London Metropolitan 2015–2016, and the 2016–2019, 2019–2023,
2023-onward JPM project groupings used by game achievements. Its JPM
“Present” predates the user's confirmed 2025 move and does not override it.
Current site dates remain JPM 2016–2025, Fusion/VP 2023–2025 and Barclays
2025 onward. The first B2C employer is 2010; UK arrival is 2013; family
milestones are 2018 and 2021, from later explicit corrections.

The old-site `assets/CV_ShannonH.pdf` has no extractable text in this read;
it is not claimed as a newly verified current CV. No CV was altered or newly
published. A current submission CV is still a separate factual deliverable if
required. Contact details were excluded from audit output.

## Excluded transfers and limits

- CAM's 40%/60% outcomes and twelve-month observation do not become Fusion
  Analytics results. Data Manager's two-analyst paper study also stays separate.
- Rehearsal phrases about cutting AI handoff time in half, an assumed six-month
  estimate, or a hypothetical future platform do not establish measured results.
- A persona quote/emotion curve is authored exploration, not participant data.
- Build history is not an award certification or current performance report.
- The all-case Revolut matrix now incorporates the root FX/Fusion/Deal audit
  and the voice reviewer's AI/Winking audit. Website content reconciliation
  is complete locally; Figma copy synchronization is complete in `figma-final-content-sync.json`.
- Final browser inspection, performance, exact-head CI and live verification
  remain release gates. This audit did not run builds/tests or publish changes.
