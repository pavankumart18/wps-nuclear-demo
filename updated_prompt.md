# Prompt for Claude Code: Build the welding assignment demo app

Create a polished local web application for an AI-assisted welding supervisor workflow using the synthetic data in `input data`.

The app should demonstrate how a supervisor selects a welding job, reviews WPS extraction from a source PDF, validates the job against the WPS, maps required qualifications, matches and ranks welders, drills into reasoning, handles exceptions, and generates a Weld Execution Ticket.

Use the details in `updated_context.md` as the source of truth.

## Data

Load the following files from the local folder:

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

Use the uploaded or local PDF file:

- `WPS-15-17.pdf`

If rendering the PDF directly is inconvenient, show an embedded placeholder PDF viewer with page thumbnails and a note that the app is using extracted fields from the CSV. Still design the UI as though the PDF is the WPS source.

## Technology

Build a modern single-page application.

Preferred implementation:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui if available
- lucide-react icons if available

Use client-side CSV parsing. No backend is required unless you decide it is simpler.

If the environment does not support shadcn/ui, use plain React components with Tailwind-style classes.

## Core requirements

### 1. Load all datasets

Parse all CSV files into typed objects.

Handle pipe-delimited fields, especially:

- `active_ticket_ids`
- `position_coverage`
- `allowed_filler_class`
- `application_type_coverage`

### 2. Implement matching logic

Do not hard-code the final recommendations.

Given a selected job, compute:

1. Job-to-WPS validation
2. Required qualification mapping
3. Ticket-level eligibility
4. Welder-level eligibility
5. Ranking
6. Warnings
7. Rejection reasons
8. Exception routing

Use `JOB-001` as the default selected job.

### 3. Job-to-WPS validation

For a selected job:

- Find the WPS by `wps_id`
- Check WPS qualification status
- Check PQR support
- Check material group match
- Check thickness within WPS range
- Check position compatibility
- Check progression
- Check PWHT alignment
- Show pass/warning/fail rows

If a hard fail exists, disable matching and route to engineering.

### 4. Qualification mapping

For the selected WPS:

- Show preferred ticket
- Show alternate ticket
- Show alternate conditions
- Show special notes
- Show engineering review rules
- Allow clicking a ticket to open the qualification matrix row

### 5. Welder matching

For each welder:

- Split active ticket IDs
- Join to qualification matrix
- Evaluate each ticket
- Pick the best ticket for the selected job
- Compute final status:
  - Recommended
  - Eligible
  - Backup
  - Conditional
  - Rejected
  - Unavailable
  - Expired
  - Engineering Review

Hard rejection examples:

- Employment status not Active
- Qualification expired
- Ticket inactive
- Process mismatch
- Material mismatch
- Thickness outside ticket range
- Position not covered
- PWHT required but not capable
- Missing mapping

Warnings:

- Continuity at risk
- Expiry within 30 days
- Recent NCR count > 0
- Extraction review required
- Alternate/limited ticket used
- Engineering review note present

Ranking priority:

1. Eligible before rejected
2. Preferred full-range before limited or alternate
3. Available on selected shift
4. Active continuity
5. Expiry not near
6. Lower recent NCR count
7. Fewer warnings
8. Stable sort by welder ID

### 6. Screens

Build these screens or sections:

#### Shift Planner

- Job table with filters for Shift, Priority, Status, WPS
- Search box
- Right-side job detail drawer
- `Analyze WPS` button
- Guided demo highlight on `JOB-001`

#### WPS Extraction

- PDF preview or WPS source card for `WPS-15-17.pdf`
- Page thumbnails for page 1, 2, 3
- Extracted field panels:
  - Qualification Drivers
  - Execution Parameters
  - Consumables
  - Notes and Review Flags
- Hover tooltips showing source page, confidence, and whether used for matching

#### Job-to-WPS Validation

- Validation checklist table
- Pass, warning, fail badges
- Details on hover
- If hard fail, show `Route to Engineering`
- If pass, show `Find required qualification`

#### Qualification Mapping

- Required process/material/thickness/position
- Preferred ticket
- Alternate ticket
- Alternate condition
- Special notes
- Clickable ticket detail

#### Welder Matching Dashboard

- Ranked welder table
- Show eligible, backup, conditional, rejected, unavailable, expired
- Toggle `Show rejected welders`
- Toggle `Only current shift`
- Sort by rank, expiry, continuity, NCR count
- Click a welder to open reasoning drawer

#### Reasoning Drawer

For selected welder, show:

- Summary
- Ticket used
- Final recommendation
- Constraint breakdown table:
  - Constraint
  - Required
  - Candidate coverage
  - Result
  - Source
- Buttons:
  - `Why not selected?`
  - `What would make this valid?`
  - `Copy explanation`

#### Exceptions

Show exception cards for:

- `JOB-004`: thickness exceeds WPS range
- `JOB-005`: material mismatch
- `JOB-008`: missing mapping

Each card should show:

- Reason
- Source data
- Suggested owner
- Suggested next action

#### Weld Execution Ticket

After approving a candidate, generate a ticket with:

- Job details
- WPS details
- Assigned welder
- Qualification ticket used
- PQR reference
- Key controls
- Pass parameters
- QC hold point
- Supervisor approval placeholder

Allow copy or download as markdown.

### 7. Required demo behavior

Default guided path should work like this:

1. Start on Shift Planner with `JOB-001` highlighted.
2. Click `JOB-001`.
3. Click `Analyze WPS`.
4. Show extracted WPS fields from `WPS-001`.
5. Click `Validate job against WPS`.
6. Show passing checks.
7. Click `Find required qualification`.
8. Show preferred and alternate tickets.
9. Click `Match Welders`.
10. Show Maria Chen as recommended.
11. Show David Patel rejected for thickness.
12. Show Aisha Khan rejected for process.
13. Show Omar Ruiz as backup due to continuity/expiry warning.
14. Show Nora Singh rejected for expired qualification.
15. Approve Maria.
16. Generate a Weld Execution Ticket.
17. Optional jump to `JOB-004` to show thickness exception.

### 8. UI design

Make the app look like an enterprise operations tool.

Use:

- Left navigation
- Top selected-job header
- Cards and tables
- Right-side drawer
- Status badges
- Tooltips and hover cards
- Clean spacing
- Calm industrial color palette

Avoid a chatbot-first design.

### 9. Deliverables

Create:

- Source code for the app
- `README.md` with setup instructions
- Clear comments in the matching logic
- A local sample data path configuration

The app should run with:

```bash
npm install
npm run dev
```

If using another stack, document the commands clearly.

## Important correctness rules

- Do not fabricate matches. Use data and computed checks.
- Do not allow matching if job-to-WPS validation has a hard fail.
- Do not allow expired or inactive welders to be recommended.
- Do not treat limited tickets as full-range.
- Do not hide rejected candidates by default unless the user toggles them off.
- Keep human approval explicit.
- Use source references from the WPS extraction and tables in the reasoning drawer.

## Tone

The demo should communicate:

- practical workflow understanding
- controlled AI assistance
- explainable recommendations
- audit-friendly reasoning
- human-in-the-loop decision support
