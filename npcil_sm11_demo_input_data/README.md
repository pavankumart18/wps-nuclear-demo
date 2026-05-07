# NPCIL SM-11 welding assignment demo input data

All data in this folder is synthetic. The primary WPS example is structured around the extracted WPS pages in `WPS-15-17.pdf`, covering **NPCIL-STD-SM-11 (Qualified)**.

The provided WPS pages contain:
- WPS No. `NPCIL-STD-SM-11`
- Supporting PQR `A`
- Process `SMAW`, type `Manual`
- Joint design `Groove`
- Backing `With or Without`
- Base metals `P-No. 1 Group 1/2` to `P-No. 1 Group 1/2`
- Groove thickness range `1.5 mm to 2T, max 19 mm`
- Position coverage `All`
- Weld progression `Vertical Uphill`
- No PWHT
- Minimum preheat `10 C`
- Filler `E-7018 or E7018-1`, SFA 5.1
- DC-EP polarity
- Travel speed `40-80 mm/min`
- Technique requirements such as stringer root, weave subsequent passes, brushing/grinding, and no peening

## Files

- `wps_extracted_parameters.csv`: WPS-level extracted fields, with WPS-001 anchored to NPCIL-STD-SM-11.
- `jobs.csv`: 80 planned jobs with job-to-WPS validation edge cases.
- `qualification_mapping.csv`: WPS-to-required-ticket logic.
- `qualification_matrix.csv`: Qualification tickets and their coverage.
- `welders.csv`: 50 synthetic welder profiles and qualification records.
- `consumables_reference.csv`: Pass-level filler, amps, volts, polarity, and travel speed.
- `pqr_reference.csv`: PQR support and pending PQR scenarios.
- `inspection_requirements.csv`: QC hold points and inspection dependencies.
- `demo_scenarios.csv`: Presenter-ready demo scenarios.
- `source_pages_manifest.csv`: What each WPS page is used for in the demo.
- `welding_demo_input_data.xlsx`: Consolidated workbook with all sheets.
- `weld_execution_ticket_sample_JOB001.md`: Sample ticket for the main demo case.
- `updated_context.md`: Application context for Codex.
- `updated_prompt.md`: Build prompt for Codex.

## Recommended demo sequence

1. Select `JOB-001`.
2. Show the WPS pages from `WPS-15-17.pdf`.
3. Extract WPS-001 fields from the document.
4. Validate job-to-WPS consistency.
5. Find required qualification tickets.
6. Match welders.
7. Drill into Maria, David, Lee, Aisha, Omar, Ethan, and Nora.
8. Generate the Weld Execution Ticket.

## Main demo logic

For `JOB-001`, Maria Chen should be recommended. David Patel should fail for limited thickness if the job is 12 mm. Lee Morgan should fail position coverage on 6G jobs. Aisha Khan should fail process match for SMAW jobs. Omar Ruiz should be technically eligible but lower-ranked due to continuity and expiry warnings. Ethan Brooks should fail Shift A availability. Nora Singh should fail because the qualification is expired.
