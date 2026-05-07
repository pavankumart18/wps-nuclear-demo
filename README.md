# WeldAssign AI — NPCIL SM-11 Welding Assignment Demo

A polished local web application demonstrating AI-assisted welding supervisor workflow.  
Built with plain HTML, CSS, and JavaScript. No build step required.

---

## Quick Start

```bash
python server.py
```

Open your browser at **http://localhost:8080**

---

## What the Demo Shows

The app demonstrates how a supervisor can:
1. Select a welding job from the Shift Planner
2. Review extracted WPS fields from the source PDF
3. Validate the job against the WPS
4. Map required qualification tickets
5. Match and rank welders by computed eligibility
6. Drill into explainable reasoning for each candidate
7. Handle exceptions (thickness, material, missing mapping)
8. Generate and download a Weld Execution Ticket

### Guided Demo Path (JOB-001)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select **JOB-001** | Carbon steel 3G groove, 12 mm, Shift A |
| 2 | Click **Analyze WPS** | WPS-001 / NPCIL-STD-SM-11 extracted fields |
| 3 | Click **Validate Job Against WPS** | All checks pass (green) |
| 4 | Click **Find Required Qualification** | Q-SM11-SMAW-P1P1-ALL-FR preferred |
| 5 | Click **Match Welders** | Maria Chen recommended, David Patel rejected |
| 6 | Click **Maria Chen** | Full constraint table — all pass |
| 7 | Click **David Patel** | Rejected: 12 mm > 8 mm ticket max |
| 8 | Click **Aisha Khan** | Rejected: GTAW ≠ SMAW |
| 9 | Click **Omar Ruiz** | Backup: continuity at risk + 7 days to expiry |
| 10 | Click **Approve** on Maria | Generate Weld Execution Ticket |

### Exception Scenarios

Click **Exceptions** in the left nav to see:
- **JOB-004** — Thickness 22 mm exceeds WPS-001 max 19 mm
- **JOB-005** — Material P8-P8 does not match WPS-001 P1-P1
- **JOB-008** — Qualification mapping missing for WPS-012

---

## File Structure

```
WPS Nuclear/
├── server.py                          # Python HTTP server (port 8080)
├── index.html                         # App shell
├── css/app.css                        # Enterprise industrial styling
├── js/
│   ├── data.js                        # CSV loading and parsing
│   ├── matching.js                    # Matching engine (pure functions)
│   └── app.js                         # State, rendering, events
└── npcil_sm11_demo_input_data/        # All CSV datasets
    ├── jobs.csv
    ├── wps_extracted_parameters.csv
    ├── qualification_mapping.csv
    ├── qualification_matrix.csv
    ├── welders.csv
    ├── consumables_reference.csv
    ├── pqr_reference.csv
    └── inspection_requirements.csv
```

---

## Matching Logic (no hardcoded results)

All recommendations are computed from the CSV data:

1. **Job → WPS Validation** — checks material, thickness, position, progression, PWHT
2. **Qualification Mapping** — finds preferred and alternate tickets for the WPS
3. **Ticket Evaluation** — for each welder's tickets: process, material, thickness, position, filler, PWHT
4. **Welder Evaluation** — employment, availability, shift, continuity, expiry, NCR flags
5. **Ranking** — Recommended → Eligible → Backup → Conditional → Unavailable → Expired → Rejected

Expected results for JOB-001:

| Welder | Status | Reason |
|--------|--------|--------|
| W-104 Maria Chen | Recommended | Full-range preferred ticket, clean record |
| W-190 Jon Miller | Eligible | Full-range ticket, 1 NCR flag |
| W-132 Lee Morgan | Eligible | 3G-only alternate ticket (covers 3G job) |
| W-153 Omar Ruiz | Backup | Continuity at risk + expiry in 7 days |
| W-117 David Patel | Rejected | Ticket max 8 mm < job 12 mm |
| W-145 Aisha Khan | Rejected | GTAW ticket ≠ SMAW required |
| W-166 Ethan Brooks | Unavailable | Shift B, job requires Shift A |
| W-171 Nora Singh | Expired | Qualification expired -47 days ago |
| W-184 Priya Nair | Rejected | P8-P8 ticket ≠ P1-P1 required |

---

## Requirements

- Python 3.7+ (standard library only)
- Modern browser (Chrome, Firefox, Edge)
- Internet connection (Google Fonts CDN — gracefully degrades if offline)
