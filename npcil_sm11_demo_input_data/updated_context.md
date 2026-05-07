# Context for Codex: NPCIL SM-11 welding assignment demo application

## Purpose

Build a polished demo application that shows how an AI-assisted supervisor workflow can reduce manual cross-referencing when assigning qualified welders to regulated welding jobs.

The app should use the synthetic data in this folder and the uploaded WPS PDF `WPS-15-17.pdf`. The WPS PDF contains pages extracted from a nuclear-sector welding procedure document. The primary demo WPS is **NPCIL-STD-SM-11**, a qualified standard WPS for SMAW manual welding, without PWHT and without impact test requirement.

The app must feel like a real operational decision-support system, not a generic chatbot.

The main decision question is:

> Can this welder perform this weld, using this WPS, today, with a defensible reason?

The system should recommend, warn, reject, or escalate, while preserving human-in-the-loop approval.

---

## Source WPS basis

Use `WPS-15-17.pdf` as the visual WPS source in the app.

The extracted WPS is represented as `WPS-001` in the synthetic data.

### Source WPS facts

From the three WPS pages:

- WPS No.: `NPCIL-STD-SM-11`
- Status: Qualified
- Supporting PQR: `A`
- Process: `SMAW`
- Type: `Manual`
- Joint design: `Groove`
- Backing: `With or Without`
- Backing material: `As per design document`
- Base metals: `P-No. 1 Group 1/2` to `P-No. 1 Group 1/2`
- Material examples: `IS 2062 or IS1239 or equivalent or P1`
- Groove thickness range: `1.5 mm to 2T, max 19 mm`
- Fillet thickness: `All Thickness`
- Positions of groove: `All`
- Positions of fillet: `All`
- Weld progression: `Vertical Uphill`
- PWHT: `NA`
- Minimum preheat: `10 C`
- Interpass max: `NA`
- Shielding gas: `NA`
- Backing gas: `NA`
- Filler specification: `SFA 5.1`
- AWS classification: `E-7018 or E7018-1`
- F-number: `2 or 4`
- A-number: `1`
- Filler sizes: `2.5 mm, 3.15 mm, 4.0 mm`
- Current: `DC`
- Polarity: `Electrode Positive / DC-EP`
- Travel speed: `40-80 mm/min`
- Root technique: `Stringer`
- Subsequent passes: `Weave`
- Cleaning: `Brushing or Grinding, joint dry before welding`
- Back gouging: `Grinding`
- Peening: `Not allowed`
- Pressure-retaining welds: minimum two passes
- Note: User must check specifications/drawings for suitability and obtain WPS acceptance approval.

### Important nuance

The WPS has broad procedure coverage, but actual assignment requires checking:

1. The job is suitable for the WPS.
2. The welder has a valid qualification ticket that covers the job variables.
3. The welder’s continuity and expiry status are acceptable.
4. The welder is available for the shift.
5. Exceptions are routed to engineering, training, or QC rather than guessed.

---

## Synthetic data files

The app should load from this folder:

- `wps_extracted_parameters.csv`
- `jobs.csv`
- `qualification_mapping.csv`
- `qualification_matrix.csv`
- `welders.csv`
- `consumables_reference.csv`
- `pqr_reference.csv`
- `inspection_requirements.csv`
- `demo_scenarios.csv`
- `source_pages_manifest.csv`

There is also a consolidated workbook: `welding_demo_input_data.xlsx`.

All data is synthetic.

---

## Core data model

### WPS extracted parameters

Use `wps_extracted_parameters.csv`.

This represents document AI or LLM extraction output from WPS documents.

Important fields:

- `wps_id`
- `source_wps_no`
- `supporting_pqr_no`
- `qualification_status`
- `welding_process_root`
- `welding_process_fill`
- `base_material_from`
- `base_material_to`
- `groove_thickness_min_mm`
- `groove_thickness_max_mm`
- `positions_groove`
- `weld_progression`
- `pwht_required`
- `preheat_min_c`
- `filler_specification`
- `aws_classification`
- `polarity`
- `travel_speed_range_mm_min`
- `extraction_confidence`
- `extraction_review_required`

### Jobs

Use `jobs.csv`.

Important fields:

- `job_id`
- `work_order`
- `wps_id`
- `job_description`
- `base_material_from`
- `base_material_to`
- `thickness_mm`
- `required_position`
- `required_progression`
- `application_type`
- `shift`
- `priority`
- `location`
- `inspection_required`
- `qc_hold_point`
- `requires_notch_toughness`
- `status`

### Qualification mapping

Use `qualification_mapping.csv`.

This maps WPS to required or preferred qualification tickets.

Important fields:

- `wps_id`
- `required_process`
- `required_material_from`
- `required_material_to`
- `required_thickness_min_mm`
- `required_thickness_max_mm`
- `required_position_policy`
- `required_progression`
- `required_pwht`
- `required_filler`
- `preferred_ticket_id`
- `alternate_ticket_id`
- `alternate_allowed`
- `alternate_condition`
- `engineering_review_required_if`
- `mapping_status`
- `special_note`

### Qualification matrix

Use `qualification_matrix.csv`.

This defines what each qualification ticket covers.

Important fields:

- `ticket_id`
- `process`
- `base_material_from`
- `base_material_to`
- `position_coverage`
- `min_thickness_mm`
- `max_thickness_mm`
- `backing_coverage`
- `weld_progression_coverage`
- `allowed_filler_class`
- `pwht_capable`
- `application_type_coverage`
- `full_or_limited_range`
- `requires_special_endorsement`
- `active_status`

### Welders

Use `welders.csv`.

Important fields:

- `welder_id`
- `welder_name`
- `shift`
- `availability_status`
- `active_ticket_ids`
- `continuity_status`
- `qualification_expiry_date`
- `days_until_expiry`
- `recent_quality_flag`
- `recent_ncr_count`
- `employment_status`

`active_ticket_ids` is pipe-delimited.

### Consumables

Use `consumables_reference.csv`.

Use this for the final Weld Execution Ticket and WPS parameter panel.

### PQR

Use `pqr_reference.csv`.

Use this to show whether the WPS has supporting PQR or needs user organization qualification.

For `WPS-001`, PQR `A` is acceptable.

### Inspection

Use `inspection_requirements.csv`.

Use this to show downstream QC hold points and documentation.

### Demo scenarios

Use `demo_scenarios.csv`.

Use this to drive a guided demo mode or presenter notes.

---

## Main demo story

### Scenario: JOB-001, primary assignment

The supervisor starts shift planning and selects `JOB-001`.

`JOB-001` should be the primary walkthrough:

- WPS: `WPS-001`
- Source WPS: `NPCIL-STD-SM-11`
- Job thickness: `12.0 mm`
- Required position: `3G`
- Process: `SMAW`
- Base materials: `P-No. 1 Group 1/2` to `P-No. 1 Group 1/2`
- Shift: `A`
- Priority: `High`

Expected result:

- Recommended: `W-104 Maria Chen`
- Backup / warning: `W-153 Omar Ruiz`
- Rejected: `W-117 David Patel` because limited to 8 mm
- Rejected on process: `W-145 Aisha Khan` because GTAW, not SMAW
- Rejected on expiry: `W-171 Nora Singh`
- Rejected on availability: `W-166 Ethan Brooks` for Shift A
- Multi-process but lower ranked: `W-190 Jon Miller` due to recent quality flag

### Presenter story

"Today a supervisor has to inspect a WPS, map it to acceptable qualification tickets, open welder qualification records, check continuity and expiry, then make an assignment. The app automates the cross-reference but keeps approval with the supervisor."

---

## Required screens and interactions

### 1. Shift Planner screen

Purpose: Show the day’s work and let the supervisor select a job.

UI elements:

- Left navigation with sections:
  - Shift Planner
  - WPS Extraction
  - Qualification Matching
  - Exceptions
  - Execution Tickets
- Main job table with:
  - Job ID
  - Work order
  - WPS
  - Description
  - Thickness
  - Position
  - Shift
  - Priority
  - Status
- Filters:
  - Shift
  - Priority
  - Status
  - WPS
- Search box
- Status badges:
  - Needs assignment
  - Needs review
  - Ready
  - Exception
  - Assigned

Interactions:

- Clicking a job opens a right-side drawer with job details.
- Hovering over `WPS` shows the source WPS title.
- Hovering over `Priority` explains due-date pressure.
- Click `Analyze WPS` to move to the WPS extraction screen.
- A guided demo pill should highlight `JOB-001` as "Recommended demo starting point."

### 2. WPS Extraction screen

Purpose: Show document AI extraction from the WPS.

Layout:

- Left side: embedded PDF viewer or static page preview for `WPS-15-17.pdf`.
  - Show page thumbnails for pages 1, 2, and 3.
  - Let user click page thumbnails.
- Right side: extracted WPS fields grouped into tabs.

Tabs:

1. Qualification Drivers
2. Execution Parameters
3. Consumables
4. Notes and Review Flags

Qualification Drivers tab should show:

- WPS No.
- Supporting PQR
- Process
- Type
- Base material from/to
- Thickness min/max
- Positions
- Weld progression
- PWHT
- Preheat
- Filler class

Interactions:

- Hover any extracted field to show:
  - source page number
  - field confidence
  - whether used for matching
- Click a field to visually highlight the corresponding region conceptually in the PDF pane. If actual PDF region coordinates are not available, show a soft outline or callout next to the PDF saying "Source: page 1, Base Metals QW-403."
- Confidence badges:
  - High confidence
  - Needs review
- `WPS-001` should mostly be high confidence.
- Show `extraction_review_required` clearly for non-anchor WPS records.

Call-to-action:

- `Validate job against WPS`

### 3. Job-to-WPS Validation screen

Purpose: Ensure the selected job is compatible with the selected WPS before welder matching.

Checks:

- WPS exists
- WPS qualification status is active/qualified
- PQR support exists if required
- Job material group matches WPS material group
- Job thickness within WPS allowed range
- Required position is allowed
- Required process is consistent
- PWHT requirement alignment
- Notch toughness flag, if present, adds a caution

For `JOB-001`, all should pass.

For `JOB-004`, thickness should fail because 22.0 mm is outside WPS-001 max 19.0 mm.

For `JOB-005`, material should fail because the job is P8-to-P8 but WPS-001 is P1-to-P1.

Interactions:

- Each check has a row with `Pass`, `Warning`, or `Fail`.
- Hover a check to show source data used.
- Click `Thickness` check to show:
  - Job thickness
  - WPS min/max
  - Rule text
- If any hard fail exists, disable `Match Welders` and show `Route to Engineering`.
- If pass/warnings only, enable `Find required qualification`.

### 4. Qualification Mapping screen

Purpose: Turn WPS requirements into required qualification tickets.

Display:

- Required process
- Required material group
- Required thickness range
- Required position policy
- Required progression
- Preferred ticket
- Alternate ticket
- Alternate conditions
- Engineering review rules

For WPS-001:

- Preferred: `Q-SM11-SMAW-P1P1-ALL-FR`
- Alternate: `Q-SM11-SMAW-P1P1-LR-8MM`
- Alternate condition: `job_thickness_mm <= 8.0 and position is covered`
- Special note: use PQR A, verify drawing/spec suitability, obtain WPS acceptance approval.

Interactions:

- Click preferred ticket to open qualification matrix details.
- Click alternate ticket to show why it can or cannot be used for the selected job.
- Hover special note to show "This is a human review note and should appear in the execution ticket."

Call-to-action:

- `Match Welders`

### 5. Welder Matching Dashboard

Purpose: Show ranked welder assignment recommendations.

Table columns:

- Rank
- Welder
- Shift
- Tickets
- Status
- Result
- Main reason
- Warnings

Status categories:

- Recommended
- Backup
- Conditional
- Rejected
- Unavailable
- Expired
- Engineering Review

For `JOB-001`, show:

1. Maria Chen, Recommended
2. Jon Miller, Eligible but lower-ranked due to recent quality flag
3. Omar Ruiz, Backup with continuity/near-expiry warning
4. David Patel, Rejected due to thickness over limited range
5. Lee Morgan, conditional or rejected depending on selected position; for JOB-001 3G he may be technically valid but not preferred; for JOB-003 6G he is rejected
6. Aisha Khan, Rejected due to wrong process
7. Ethan Brooks, Unavailable for Shift A
8. Nora Singh, Rejected due to expired qualification

Ranking logic should be deterministic and explainable.

Hard rejections:

- Employment status not Active
- Qualification expired
- Ticket inactive
- Process mismatch
- Material mismatch
- Thickness outside ticket range
- Position not covered
- PWHT required but ticket not PWHT capable
- Missing mapping

Warnings:

- Continuity at risk
- Expiry within 30 days
- Recent NCR count > 0
- Extraction confidence needs review
- Alternate/limited ticket used
- Notch toughness caution
- Engineering review note present

Interactions:

- Click a welder row to open reasoning drawer.
- Hover result badge to see a one-line explanation.
- Toggle `Show rejected welders`.
- Toggle `Use only available Shift A welders`.
- Sort by rank, expiry, continuity, and NCR count.
- A comparison mode should allow selecting two welders and comparing checks side by side.

### 6. Reasoning Drawer

Purpose: Show audit-ready reasoning.

For each selected welder, show:

- Summary sentence
- Qualification ticket(s) considered
- Constraint breakdown table
- Source references

Constraint table:

| Constraint | Required | Candidate coverage | Result | Source |
|---|---|---|---|---|

Must include:

- Process
- Material group
- Thickness
- Position
- Progression
- Filler class
- PWHT
- Ticket status
- Continuity
- Expiry
- Shift availability
- Employment status
- Quality flags

Examples:

Maria:

- Process SMAW vs SMAW: pass
- Material P1-to-P1 vs P1-to-P1: pass
- Thickness 12.0 mm vs 1.5-19.0 mm: pass
- Position 3G vs all: pass
- Continuity active: pass
- Available Shift A: pass
- Final: recommended

David:

- Process pass
- Material pass
- Position pass
- Thickness 12.0 mm vs max 8.0 mm: fail
- Final: rejected

Aisha:

- Material pass
- Thickness pass
- Position pass
- Process GTAW vs required SMAW: fail
- Final: rejected

Omar:

- Technical checks pass
- Continuity at risk: warning
- Expiry near: warning
- Final: backup

Nora:

- Technical checks pass
- Expired qualification: fail
- Final: rejected

Interactions:

- Click `Why not selected?` for rejected welders.
- Click `What would make this valid?` to show a remediation:
  - David: needs qualification covering 12 mm or assignment to thinner job
  - Aisha: needs SMAW qualification
  - Nora: requalification or renewal
  - Ethan: assign only if Shift B or availability changes
- Click `Copy explanation` to copy a concise audit explanation.

### 7. Exceptions screen

Purpose: Show controlled escalation rather than hallucinated recommendations.

Exception examples:

- `JOB-004`: WPS thickness exceeded
- `JOB-005`: material mismatch
- `JOB-008`: missing mapping

For each exception:

- Show reason
- Source field
- Suggested owner:
  - Welding Engineering
  - Qualification / Training
  - QC
  - Planning Supervisor
- Suggested next action

Interactions:

- Click `Create engineering review note`.
- Click `Find nearest valid WPS` if enough data exists.
- Click `Export exception summary`.

### 8. Weld Execution Ticket screen

Purpose: Show the final operational artifact after supervisor approval.

When supervisor approves Maria for JOB-001, create a printable ticket with:

- Job details
- WPS details
- Assigned welder
- Qualification ticket
- PQR reference
- Required process
- Material group
- Thickness and position
- Preheat
- Filler metals
- Pass parameters
- Cleaning technique
- QC hold points
- Supervisor approval placeholder

Interactions:

- Click `Approve assignment`.
- Button changes to `Generate Weld Execution Ticket`.
- Ticket preview opens.
- Click `Download ticket` or `Copy ticket`.

---

## Matching logic requirements

The application should implement the matching logic in code, not hard-code final recommendations.

Use the data to compute results.

### Step 1: job-to-WPS validation

Given a selected job:

1. Find WPS row by `wps_id`.
2. Find PQR row if `supporting_pqr_no` exists.
3. Check material compatibility:
   - job `base_material_from/to` equals WPS `base_material_from/to`
4. Check thickness:
   - `groove_thickness_min_mm <= job.thickness_mm <= groove_thickness_max_mm`
5. Check position:
   - WPS `positions_groove` is `All` or contains job required position.
6. Check WPS status:
   - `qualification_status` should be `Qualified` for automatic use.
7. If hard fail, stop before welder matching.

### Step 2: qualification mapping

Find mapping rows for WPS.

If mapping status is missing or deprecated/draft, show exception.

### Step 3: candidate ticket evaluation

For each welder:

1. Split `active_ticket_ids`.
2. Join to qualification matrix.
3. Evaluate each ticket against job and mapping.
4. Best ticket wins.

Ticket-level checks:

- Active ticket
- Process covers required process
- Material from/to matches
- Thickness within min/max
- Position covered
- Progression covered
- Filler class compatible
- PWHT capable if required
- Application type covered

### Step 4: welder-level checks

- Employment status Active
- Availability for selected shift
- Continuity status
- Qualification expiry
- Recent NCR count and quality flag

### Ranking

Prioritize:

1. No hard failures
2. Preferred full-range ticket over alternate/limited ticket
3. Available on selected shift
4. Active continuity
5. Expiry not near
6. Lower recent NCR count
7. Fewer warnings
8. Stable sort by welder ID

Do not rank a hard-rejected welder above an eligible one.

---

## Visual design

Style should be professional, industrial, and calm.

Suggested layout:

- Left sidebar navigation
- Top bar with selected job and shift
- Main content cards
- Right-side detail drawer
- Tables with expandable rows
- Status badges

Status colors:

- Pass / Recommended: green
- Warning / Backup: amber
- Rejected / Fail: red
- Review / Engineering: purple or blue
- Neutral: gray

Avoid cartoon styling. Use a clean enterprise operations feel.

---

## Hovers and microinteractions

Include thoughtful interactions:

- Hover over a WPS field: show source page and whether it is used for matching.
- Hover over a rejection: show exact failed constraint.
- Hover over a rank score: show score components.
- Hover over a warning: show why it does not block assignment.
- Click a table row: open details drawer.
- Click a source reference: switch PDF preview to the relevant page.
- Click a mapping ticket: open qualification matrix row.
- Click `What would make this valid?`: show remediation.
- Toggle `Show only eligible`: hide rejected welders.
- Toggle `Include warnings`: show/hide backup candidates.
- Toggle `Guided Demo`: highlights the next recommended click.

---

## Guided demo path

The app should support a guided path:

1. Start at Shift Planner.
2. Highlight JOB-001.
3. User clicks JOB-001.
4. User clicks Analyze WPS.
5. Show WPS extraction.
6. User clicks Validate job against WPS.
7. Show all validation checks passing.
8. User clicks Find required qualification.
9. Show preferred and alternate tickets.
10. User clicks Match Welders.
11. Show ranked list.
12. User clicks Maria.
13. Show full pass reasoning.
14. User clicks David.
15. Show limited-thickness fail.
16. User clicks Aisha.
17. Show process mismatch.
18. User clicks Omar.
19. Show continuity warning.
20. User approves Maria.
21. Generate Weld Execution Ticket.
22. Optional: jump to JOB-004 to show thickness exception.

---

## What not to build

Do not build a generic chat app.

Do not claim autonomous approval.

Do not overfocus on ROI.

Do not require backend services unless necessary.

Do not require real OCR if the extracted fields already exist in CSV. The PDF can be used visually while the app reads extracted fields from CSV.

Do not overfit to NPCIL names. Treat this as a public-style synthetic nuclear welding example that resembles regulated supplier workflows.

---

## Final output expectation

The app should be ready to run locally, load the provided files, and demonstrate the workflow end-to-end.

It should include clear code comments and a README explaining setup and demo sequence.
