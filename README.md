# Agentic AI for Safety Monitoring with Construction Risk Analytics
**HazardHawk AI — Intelligent Construction Safety & Risk Analytics Platform**

---

## 📌 Project Overview
HazardHawk AI is an AI-powered construction safety monitoring and risk analytics system designed to identify on-site safety hazards, monitor Personal Protective Equipment (PPE) compliance, dynamically calculate workplace risks, and deliver actionable decision support through an interactive React dashboard.

---

## 🏆 Milestone 2 — Completed: Safety Intelligence, Worker Protection & Computer Vision

Milestone 2 transitions the system from a manual prototype into an autonomous, vision-driven safety intelligence platform matching all **BuildSure AI / Mentorship deliverables**:

### ✨ Key Deliverables Completed

1. **Safety Agent & Formal Event Schemas (`src/safety_agent.py`, `backend/models.py`)**:
   - Built an autonomous **Safety Agent** orchestrated via **LangGraph StateGraph**.
   - Defined formal schemas: `PPEViolationEvent` (with OSHA 1926 citations, worker ID, missing PPE items, and zone hazard multipliers) and `SafetyAlert` (persisted in SQLite with `ACTIVE` -> `ACKNOWLEDGED` -> `RESOLVED` lifecycle).

2. **Accident-Prone Zone Tracking & Safety Analytics (`GET /safety/zone-analytics`)**:
   - Monitored sectors: **Perimeter Scaffolding** (1.8x fall hazard multiplier), **Tower Crane** (1.5x machinery swing radius), **Ground Trench & Excavation** (1.6x cave-in), and **Concrete Slab Floor 6** (1.3x rebar puncture).
   - Generates real-time **Zone Safety Indices (0–100)**, active hazard densities, and operating status (`NORMAL`, `WARNING`, `CRITICAL_STOP_WORK`).

3. **Actionable Alerts Queue & Stop-Work Directives (`GET /safety/alerts`, `PATCH /safety/alerts/{id}`)**:
   - Automatic triage into `CRITICAL`, `HIGH`, `MEDIUM` severity alerts with actionable remediation directives.
   - Interactive safety officer actions to acknowledge and resolve active hazards in real-time.

4. **Mentor Review 3-Case Live Demonstration (`demo_safety_agent_milestone2.py`)**:
   - **Case 1 (Normal Conditions)**: Compliant workers, 100% PPE compliance, zero active alerts.
   - **Case 2 (Unsafe Condition)**: Worker violation on scaffolding -> Triggers CRITICAL Alert -> Updates Zone Safety Analytics.
   - **Case 3 (Error Case & Recovery Path)**: Corrupted CCTV payload / sensor occlusion -> Diagnostic alert -> Step-by-step fail-safe recovery protocol.

5. **Construction PPE Model Validation & Benchmarks**:
   - Trained & validated **YOLO11n-Construction-PPE** detector on 5,011 construction images across 5 classes: `boots`, `gloves`, `helmet`, `human`, `vest`.
   - **97.51% mAP@50** overall detection accuracy.
   - **96.30% Precision** and **96.26% Recall**.
   - Average inference latency: **~49 ms** per frame on CPU (~20 FPS).

6. **OpenCV Image & Video Processing Pipeline (`detection/cv_visualizer.py`)**:
   - Color-coded bounding boxes: **Green** for Compliant Workers, **Red** for PPE Violations, **Cyan/Yellow/Magenta** for PPE items.
   - Semi-transparent top HUD dashboard banner with live stats. Base64 data URI output.

7. **Full-Stack UI with Dark/Light Mode & JWT Authentication (`frontend/src/App.jsx`)**:
   - **Executive Public Overview Dashboard**: Common, high-level project KPIs, milestone roadmap, weekly trend, and zone risk distribution.
   - **Gated Safety Workspace (`Site Agents`)**: Protected behind JWT authentication; features 1-Click Mentor Demo runner, Zone Analytics cards, and Live Alerts Queue.

---

## 📊 Model Performance Benchmarks (Milestone 2)

| Class | Precision | Recall | mAP@50 | mAP@50-95 |
| :--- | :---: | :---: | :---: | :---: |
| **ALL (Overall)** | **96.30%** | **96.26%** | **97.51%** | **81.61%** |
| `helmet` | 95.65% | 99.39% | 98.46% | 76.80% |
| `vest` | 97.79% | 93.53% | 97.81% | 86.58% |
| `boots` | 96.84% | 96.41% | 99.16% | 77.88% |
| `human` | 97.47% | 98.31% | 99.02% | 93.17% |
| `gloves` | 93.74% | 93.64% | 93.10% | 73.63% |

*Inference Speed: 0.7 ms preprocess, 47.9 ms inference, 0.5 ms postprocess (~49.0 ms total).*

---

## 📂 Project Directory Structure

```text
Infosys_Construction_Risk_Analytics/
│
├── backend/
│   ├── database.py                 # SQLite/PostgreSQL connection engine
│   ├── models.py                   # SQLAlchemy schema with Milestone 2 CV fields
│   ├── main.py                     # FastAPI REST API (/analyze, /analyze-video, /model-metrics)
│   └── risk_service.py             # LangGraph agent & DB persistence service
│
├── detection/
│   ├── cv_visualizer.py            # OpenCV visual annotation, HUD overlay, and video pipeline
│   ├── hazard_detector.py          # YOLO11n detector + worker PPE spatial association
│   └── risk_assessment.py          # End-to-end CV-to-risk scoring orchestrator
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # React safety dashboard with live CV display
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── models/
│   └── ppe_best.pt                 # Validated YOLO11n weights (97.5% mAP50)
│
├── reports/
│   ├── figures/                    # OpenCV outputs, PR curves, confusion matrix
│   ├── model_evaluation_metrics.json
│   ├── model_evaluation_metrics.csv
│   └── Milestone_2_Report.md        # Comprehensive Milestone 2 report
│
├── src/
│   ├── risk_engine.py              # Rule-based safety risk scoring formula
│   └── site_risk_agent.py          # LangGraph Site Risk Agent workflow
│
├── test_images/
│   └── construction_site_test.png  # Test construction image
├── test_videos/
│   └── sample_site.mp4             # Sample test video
│
├── demo_milestone2.py              # One-click Milestone 2 verification script
├── evaluate_model.py               # Dataset benchmark & evaluation runner
├── requirements.txt
└── README.md
```

---

## 🚀 How to Run and Verify

### 1. Run the Milestone 2 Demo Script
Execute the complete end-to-end verification script in PowerShell:
```powershell
.\.venv\Scripts\python.exe demo_milestone2.py
```

### 2. Start the Backend API
```powershell
.\.venv\Scripts\uvicorn.exe backend.main:app --reload --port 8000
```
- Interactive Swagger API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Start the Frontend Dashboard
```powershell
cd frontend
npm run dev
```
- Open browser: [http://localhost:5173](http://localhost:5173)
- Navigate to **Site Monitoring**, upload an image (e.g. `test_images/construction_site_test.png`), and click **Run Automated AI Safety Inspection**.
