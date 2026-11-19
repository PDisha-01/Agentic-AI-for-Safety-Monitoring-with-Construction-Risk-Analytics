# Infosys Springboard Virtual Internship — Milestone 3 Report
**HazardHawk AI / BuildSure — Intelligent Construction Safety & Risk Analytics Platform**

**Project Name:** Agentic AI for Safety Monitoring with Construction Risk Analytics  
**Intern Name:** Disha Mallick  
**Deliverable:** Milestone 3 — Enhanced Agentic Risk Analysis, Compliance Agent & Insurance Exposure Engine  
**Status:** Completed, Validated & Presentation-Ready  
**Execution Date:** 19 November 2026  

---

## 1. Executive Summary

Milestone 1 established foundational risk assessment formulas and a preliminary dashboard. Milestone 2 introduced high-accuracy computer vision (YOLO11n-Construction-PPE at **97.51% mAP@50**), spatial worker-PPE association, and the LangGraph Safety Agent.

**Milestone 3 elevates HazardHawk AI into an autonomous, legally defensible, and claim-ready enterprise safety intelligence ecosystem:**
1. **Autonomous Compliance Agent & Statutory Matrix:** Direct regulatory alignment with **OSHA 29 CFR 1926 Construction Safety Standards** and **ISO 45001:2018**, converting raw vision infractions into statutory citations and financial penalty liabilities.
2. **Cryptographic Check-to-Evidence Audit Trail:** Implements tamper-evident **SHA-256 digital fingerprinting** binding camera frame evidence, bounding box coordinates, zone metadata, and timestamps into an immutable chain of custody.
3. **Actuarial Insurance Agent & Exposure Modeling:** Translates jobsite infractions into quantified **Loss Severity Scores ($LSS$)**, **Total Expected Financial Exposures ($EFE$)**, commercial policy layering allocations ($50k deductible retention), and **Experience Modification Rate (EMR)** premium hike projections.
4. **Claim-Ready First Notice of Loss (FNOL) Generation:** Automatically synthesizes formal, underwriter-facing claim dossiers linking violation citations, cryptographic evidence hashes, and actuarial reserve recommendations.
5. **Fail-Safe Integrity Recovery Protocol:** Implements automated detection of evidence tampering or sensor desynchronization with a 5-step fail-safe recovery path certified by dual safety inspector sign-offs.

---

## 2. Multi-Agent System Architecture

Milestone 3 operates as a hierarchical multi-agent state workflow:

```
[ Jobsite Optical Feeds / CCTV Stream ]
                 │
                 ▼
[ Perception Node: YOLO11n PPE Detector (Anatomical Zone Association) ]
                 │
                 ▼
[ Safety Agent: Event Triage & Immediate Stop-Work Directive ]
                 │
                 ▼
[ Compliance Agent: OSHA 1926 & ISO 45001 Policy Matrix Evaluator ]
         │ ➔ Cryptographic SHA-256 Tamper-Evident Hashing
         │ ➔ Check-to-Evidence Chain of Custody Validation
         │ ➔ Anomaly Watchdog (Quarantine & Recovery Protocol)
                 │
                 ▼
[ Insurance Agent: Actuarial Loss Severity & Exposure Engine ]
         │ ➔ Workers' Comp, CGL Reserves & Statutory Fine Allocations
         │ ➔ Commercial Policy Deductible Waterfall ($50,000 SIR)
         │ ➔ NCCI EMR Rating Shift & Multi-Year Premium Modeling
                 │
                 ▼
[ Claim Synthesis Engine: First Notice of Loss (FNOL) Dossier Dispatch ]
                 │
                 ▼
[ Enterprise Outputs: React Compliance Dashboard + SQLite Audit Ledger ]
```

---

## 3. Official Demonstration: Flagged Incident to Claim-Ready Summary

### 3.1 Flow Overview
The mentor review requires stating **INPUT $\to$ PROCESSING $\to$ OUTPUT** clearly, demonstrating:
`Review Flagged Incident` $\to$ `Show Checklist Violation` $\to$ `Produce Claim-Ready Summary`.

### 3.2 Step 1: Input (Flagged Incident Payload)
```json
{
  "incident_id": "INC-2026-495B3A",
  "zone_name": "Zone B - Perimeter Scaffolding",
  "worker_id": "Worker #3 (Rajeev Sharma - Steel Rigger)",
  "elevation_level": "Level 7 (+21.4m)",
  "detection_source": "HazardHawk CCTV AI Stream (Cam 04A - Scaffolding North)",
  "reported_missing_ppe": ["helmet", "boots"],
  "environmental_conditions": "Clear, 18°C, Wind gusts 14 kts",
  "policy_reference": "POL-CGL-2026-984210"
}
```

### 3.3 Step 2: Processing (Multi-Agent Evaluation)
1. **Compliance Agent Execution:**
   - Evaluates incident against 4 applicable OSHA 1926 and ISO 45001 rules.
   - Detects 3 statutory violations:
     - `OSHA 29 CFR 1926.100(a)`: Head Protection & Impact Hard Hats (CRITICAL, Base Fine: $16,131.00)
     - `OSHA 29 CFR 1926.501(b)(1)`: Fall Protection on Elevated Scaffolding (CRITICAL, Base Fine: $16,131.00)
     - `OSHA 29 CFR 1926.96`: Occupational Protective Footwear (MEDIUM, Base Fine: $5,800.00)
   - Computes Site Compliance Rate: **25.0%** (Status: `NON_COMPLIANT`).
   - Calculates cryptographic SHA-256 evidence digests for each check.
2. **Insurance Agent Actuarial Modeling:**
   - Calculates Loss Severity Score ($LSS$): **49.5 / 100** (Moderate Risk).
   - Applies high-elevation scaffolding hazard multiplier: **1.8x**.
   - Allocates financial reserves:
     - Workers' Comp (Medical + Lost Wages): **$140,400.00**
     - Commercial General Liability (CGL Third-Party): **$76,440.00**
     - Statutory OSHA Penalties: **$38,062.00**
     - Legal Defense & Claims Investigation Reserve: **$57,275.00**
     - Jobsite Stoppage / Delay Loss: **$45,000.00**
     - **Total Estimated Financial Exposure ($EFE$):** **$357,177.00**
   - Applies Commercial Policy Layering:
     - Contractor Retained Deductible (SIR): **$50,000.00**
     - Net Primary Insurer Indemnity: **$307,177.00**
   - Calculates Experience Modification Rate (EMR) Impact: **1.00 $\to$ 1.29 (+0.29)**, projecting an annual Workers' Comp premium surcharge of **+$82,650.00/year** ($247,950 over 3 years).

### 3.4 Step 3: Output (Claim-Ready Summary & Dossier)
The system outputs a certified First Notice of Loss (FNOL) Dossier (`CLM-2026-B8910`) ready for underwriter and claims adjuster submission, incorporating:
- Insured and policy particulars ($5.0M occurrence limit, $50k SIR)
- Occurrence location and incident context
- Statutory checklist violations with citation codes and SHA-256 proof
- Actuarial loss reserves breakdown
- Policy deductible allocation
- Underwriting action directives (subrogation review with master rigger, mandatory tie-off enforcement).

---

## 4. Error Case & Fail-Safe Recovery Path

### 4.1 Error Scenario: Cryptographic Evidence Tampering Anomaly
- **Anomaly Trigger:** Optical frame metadata SHA-256 checksum mismatch, corrupted inspection certificate, or sensor desynchronization (>12 hours drift).
- **System Detection:** The Compliance Agent watchdog detects hash discrepancy between stored evidence and live payload.
- **Immediate Safeguard:** System marks record as `TAMPER_DETECTED`, sets overall status to `AUDIT_INTEGRITY_COMPROMISED`, and **freezes the insurance claim generation pipeline** to prevent fraudulent or unverified filings.

### 4.2 Fail-Safe Recovery Protocol
```
[ Tamper Detected: Hash Mismatch / Frame Corruption ]
                       │
                       ▼
[ Step 1: Quarantine Suspect Log Entry & Flag Anomaly ]
                       │
                       ▼
[ Step 2: Retrieve Redundant Secondary Edge Buffer (RTSP Cam 04B) ]
                       │
                       ▼
[ Step 3: Cross-Validate via Worker RFID Gate Telemetry ]
                       │
                       ▼
[ Step 4: Recalculate Authentic SHA-256 Digest & Apply Dual Inspector Sign-Off ]
                       │
                       ▼
[ Step 5: Restore Integrity State (AUDIT_RECOVERY_COMPLETE) & Unfreeze Claim Pipeline ]
```

- **Certified Remediator:** Chief Safety Inspector — Cert #OSHA-500-8812
- **Recovery Outcome:** Audit trail restored to `AUDIT_RECOVERY_COMPLETE`; claim certified without data loss.

---

## 5. Technical Implementation Details

### 5.1 Compliance Agent & Policy Checklist Matrix (`src/compliance_agent.py`)

The statutory checklist contains formal definitions based on OSHA 29 CFR 1926 and ISO 45001:

| Check ID | Regulatory Standard | Safety Rule Title | Mandatory PPE | Severity Tier | Base Penalty | ISO 45001 Clause |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **CHK-OSHA-1926.100** | OSHA 29 CFR 1926.100(a) | Head Protection & Impact Hard Hats | Helmet | CRITICAL | $16,131.00 | Cl. 8.1.2 |
| **CHK-OSHA-1926.95** | OSHA 29 CFR 1926.95(a) | High-Visibility Conspicuity Apparel | Vest | HIGH | $11,840.00 | Cl. 8.1.2 |
| **CHK-OSHA-1926.501** | OSHA 29 CFR 1926.501(b)(1) | Fall Protection on Elevated Scaffolding | Harness, Boots | CRITICAL | $16,131.00 | Cl. 6.1.2 & 8.1.2 |
| **CHK-OSHA-1926.651** | OSHA 29 CFR 1926.651(c)(2) | Trench Excavation & Shoring Safety | Boots, Helmet | CRITICAL | $16,131.00 | Cl. 8.1.2 |
| **CHK-OSHA-1926.102** | OSHA 29 CFR 1926.102(a)(1) | Eye and Face Protection | Gloves, Glasses | MEDIUM | $7,250.00 | Cl. 8.1.2 |
| **CHK-OSHA-1926.96** | OSHA 29 CFR 1926.96 | Occupational Protective Footwear | Boots | MEDIUM | $5,800.00 | Cl. 8.1.2 |

### 5.2 Mathematical Formulations (`src/insurance_agent.py`)

#### 1. Loss Severity Score ($LSS \in [0, 100]$):
$$LSS = \min\left(100, \left(w_1 \cdot \text{BaseSeverity} + w_2 \cdot (\text{ZoneMultiplier} \times 20) + w_3 \cdot \text{DurationFactor}\right) \times (1 + \text{RepeatPenalty})\right)$$
Where:
- $w_1 = 0.50$, $w_2 = 0.30$, $w_3 = 0.20$
- $\text{ZoneMultiplier} \in \{1.3, 1.5, 1.6, 1.8\}$
- $\text{RepeatPenalty} = 0.35$ for repeat/willful infractions

#### 2. Total Expected Financial Exposure ($EFE$):
$$EFE = \text{Reserve}_{\text{WorkersComp}} + \text{Reserve}_{\text{CGL}} + \text{Penalties}_{\text{OSHA}} + \text{Reserve}_{\text{Legal}} + \text{Loss}_{\text{Stoppage}}$$

#### 3. Commercial Policy Layering & Deductibles:
$$\text{ContractorRetainedLoss} = \min(\text{Deductible}_{\text{SIR}}, EFE)$$
$$\text{NetInsurerExposure} = \max(0, EFE - \text{ContractorRetainedLoss})$$

#### 4. Experience Modification Rate (EMR) Impact:
$$\Delta\text{EMR} = \min\left(0.35, \frac{EFE}{\$350,000} \times 0.28\right)$$
$$\text{ProjectedAnnualPremiumHike} = \text{BasePremium} \times \Delta\text{EMR}$$

---

## 6. Submission Package

### 6.1 Compliance Status & Violations View
- **Status:** Integrated into React UI (`activeTab === 'compliance'`) and REST API (`GET /compliance/checklist`).
- **Functionality:** Real-time visibility into active statutory rules, pass/fail status, violation citations, and estimated penalty liabilities.

### 6.2 Check-to-Evidence Cryptographic Audit Trail
- **Status:** Integrated into React UI and REST API (`GET /compliance/audit-trail`).
- **Evidence Ledger:**

| Check ID | Standard Citation | Monitored Sector | Worker ID | Confidence | Cryptographic SHA-256 Digest | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `CHK-OSHA-1926.100` | 29 CFR 1926.100(a) | Zone B - Perimeter Scaffolding | Worker #3 | 96.0% | `ec6ce21799fb992122425e10ac6dfe4c...` | `VERIFIED` |
| `CHK-OSHA-1926.501` | 29 CFR 1926.501(b)(1) | Zone B - Perimeter Scaffolding | Worker #3 | 94.0% | `d793efe3435ea3264fb82fdd2f552741...` | `VERIFIED` |
| `CHK-OSHA-1926.96` | 29 CFR 1926.96 | Zone B - Perimeter Scaffolding | Worker #3 | 92.0% | `6d073d2f992268d5e183964cd5f251bc...` | `VERIFIED` |

### 6.3 Insurance Severity / Exposure Report
- **Status:** Integrated into React UI (`activeTab === 'insurance'`) and REST API (`GET /insurance/exposure`).
- **Summary:** Actuarial exposure meters, visual reserve allocation progress bars, commercial policy layering breakdowns, and 3-year cumulative premium hike projections.

### 6.4 Sample Insurance Case Study with Full Assumptions
- **Case Reference:** Metro Tower Phase III — High-Rise Commercial Construction
- **Underwriting Assumptions:**
  - **Named Insured:** Apex Structural Constructors LLC
  - **Carrier:** Travelers / Zurich Commercial Construction Syndicate
  - **Policy Number:** POL-CGL-2026-984210
  - **Occurrence Limit:** $5,000,000.00 CGL / $1,000,000.00 Workers' Comp
  - **Self-Insured Retention (SIR Deductible):** $50,000.00
  - **Baseline EMR:** 1.00 (Annual base premium: $285,000.00)
- **Incident Description:** Worker #3 observed traversing perimeter scaffolding bearer beams at Level 7 (+21m elevation) without hooked fall arrest lanyard and missing hard hat. Willful repeat modifier applied (+35%).
- **Financial Allocation:**
  - Loss Severity Score: **69.0 / 100 (HIGH EXPOSURE)**
  - Total Estimated Financial Exposure: **$408,304.00**
  - Contractor Retained Deductible: **$50,000.00**
  - Net Primary Insurer Indemnity: **$358,304.00**
  - Projected EMR Rating: **1.00 $\to$ 1.33 (+0.33)**
  - Projected Annual Workers' Comp Surcharge: **+$94,050.00 / year** ($282,150.00 over 3 years)

---

## 7. How to Run and Verify Milestone 3

### 7.1 Execute CLI Demonstration Runner
Run the official presentation runner in PowerShell:
```powershell
.\.venv\Scripts\python.exe demo_milestone3.py
```
*Outputs the complete 5-part demo: Architecture, Flagged Incident to Claim, Error Recovery, Submission Package, and Mentor Q&A.*

### 7.2 Run Backend REST API
```powershell
.\.venv\Scripts\uvicorn.exe backend.main:app --reload --port 8000
```
Interactive Swagger API documentation available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
Key endpoints:
- `GET /compliance/checklist`: Active regulatory checklist
- `GET /compliance/audit-trail`: Cryptographic evidence ledger
- `GET /claims`: Historical insurance claim dossiers
- `POST /demo/milestone3`: Scenario execution runner

### 7.3 Run Frontend Dashboard
```powershell
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in browser:
- Click **Compliance & Regulations** tab to interact with the checklist and audit trail.
- Click **Insurance & Claims** tab to view actuarial exposure metrics and the claim dossier viewer.
- Use 1-Click Demo buttons to execute scenarios directly in the UI.

---

## 8. Mentor Review Q&A & Defense Points

**Q1: How does the Compliance Agent ensure statutory legal defensibility in OSHA / regulatory audits?**  
> Every inspection finding is anchored to an unambiguous statutory citation (e.g. 29 CFR 1926.100) and stamped with an immutable SHA-256 cryptographic digest binding the raw frame, bounding box, worker ID, and ISO 8601 timestamp. This establishes an unbroken chain of custody admissible in administrative hearings.

**Q2: How does the Insurance Agent bridge computer vision detections with actuarial finance?**  
> Raw bounding box omissions are translated through multi-factor loss modeling that incorporates sector fall hazard multipliers (1.8x), statutory penalty schedules, commercial SIR deductible thresholds, and NCCI EMR rating formulas, delivering financial figures usable by underwriters.

**Q3: What safeguards prevent false claims from corrupted or tampered sensor logs?**  
> Automated cryptographic integrity validation immediately quarantines any frame with a hash mismatch, halts claim certification, and executes dual-signoff secondary sensor recovery before unfreezing the pipeline.
