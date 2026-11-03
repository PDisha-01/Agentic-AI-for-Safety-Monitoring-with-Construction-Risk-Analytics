# Infosys Springboard Virtual Internship — Milestone 2 Report

**Project Name:** Agentic AI for Safety Monitoring with Construction Risk Analytics  
**Intern Name:** Disha Mallick  
**Milestone:** Milestone 2 — Advanced Computer Vision and Automated Hazard Detection  
**Status:** Completed & Fully Validated  

---

## 1. Executive Summary

In Milestone 1, an initial prototype foundation was established: a React frontend dashboard, a preliminary risk scoring engine, a LangGraph agent workflow, and a SQLite persistence layer. However, Milestone 1 suffered from four critical limitations:
1. Object detection was not validated on construction-specific PPE.
2. PPE compliance was not automatically inferred from images (requiring manual user input sliders).
3. Visual bounding box annotation and video stream analysis were absent.
4. Computer vision detections were not dynamically coupled to the risk scoring engine.

**Milestone 2 addresses and resolves every single one of these limitations:**
- **Validated Custom YOLO11n PPE Model:** Validated across 5 classes (`boots`, `gloves`, `helmet`, `human`, `vest`) achieving **97.51% mAP@50**, **96.30% precision**, and **96.26% recall** at ~49 ms latency on CPU.
- **Automated Hazard & Compliance Logic:** Implemented geometric body-zone spatial association connecting detected workers with their protective equipment.
- **OpenCV Visualizer Pipeline:** Built an automated annotation engine rendering color-coded bounding boxes (Green = Compliant, Red = Violation), HUD dashboard headers, and full video processing capabilities.
- **Complete End-to-End Integration:** Upgraded FastAPI endpoints and the React dashboard with an **Automated AI Inspection** mode, worker breakdown tables, and historical audit tracking.

---

## 2. Computer Vision Architecture & Model Evaluation

### 2.1 Model Specifications
- **Base Architecture:** Ultralytics YOLO11n (Nano)
- **Parameters:** 2,598,023 parameters (101 layers, 6.4 GFLOPs)
- **Dataset:** Construction PPE Dataset (4,380 train, 420 validation, 211 test images)
- **Classes:** 5 classes (`boots`, `gloves`, `helmet`, `human`, `vest`)

### 2.2 Validated Performance Metrics

| Class | Precision (P) | Recall (R) | mAP@50 | mAP@50-95 | Instances Tested |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Overall (All Classes)** | **96.30%** | **96.26%** | **97.51%** | **81.61%** | **877** |
| `helmet` | 95.65% | 99.39% | 98.46% | 76.80% | 165 |
| `vest` | 97.79% | 93.53% | 97.81% | 86.58% | 232 |
| `boots` | 96.84% | 96.41% | 99.16% | 77.88% | 286 |
| `human` | 97.47% | 98.31% | 99.02% | 93.17% | 178 |
| `gloves` | 93.74% | 93.64% | 93.10% | 73.63% | 16 |

### 2.3 Inference Latency Profile (CPU Benchmark)
- **Preprocess:** 0.7 ms
- **Inference:** 47.9 ms
- **Postprocess:** 0.5 ms
- **Total Frame Latency:** **49.04 ms** (~20.4 FPS on 12th Gen Intel Core i5)

---

## 3. Automated Hazard Detection & Spatial Association

Traditional object detectors merely output bounding boxes for `human` and `helmet`. To establish true OSHA compliance, the system must verify whether the helmet is being worn by the worker.

### 3.1 Geometric Body-Zone Partitioning Algorithm
The worker bounding box $[x_1, y_1, x_2, y_2]$ is divided into anatomical safety zones:
1. **Head Zone (Hard Hat):** $y_1 - 0.15 \cdot H \le y_{center} \le y_1 + 0.45 \cdot H$
2. **Torso Zone (High-Visibility Safety Vest):** $y_1 + 0.15 \cdot H \le y_{center} \le y_1 + 0.75 \cdot H$
3. **Feet Zone (Safety Boots):** $y_1 + 0.55 \cdot H \le y_{center} \le y_2 + 0.15 \cdot H$

### 3.2 Dynamic Parameter Derivation
The algorithm automatically derives the 4 risk parameters (1–5 scale) from visual inspection:
- **Worker Exposure:** Proportional to worker density on site (1 to 5).
- **Safety Compliance:** Mapped directly from compliance rate ($\ge 95\% \to 5$, $\ge 80\% \to 4$, $\ge 60\% \to 3$, $\ge 40\% \to 2$, $< 40\% \to 1$).
- **Hazard Severity:** Determined by the worst violation detected (Missing Helmet $= 4/5$, Missing Vest $= 3$, Missing Boots $= 2$, None $= 1$).
- **Likelihood:** Proportional to violation ratio across workers.

---

## 4. OpenCV Visual Annotation & Video Stream Processing

### 4.1 Visual Annotation Features (`detection/cv_visualizer.py`)
- **Color Coding:**
  - Green (`#3CC83C`) for Compliant Workers wearing required PPE.
  - Red (`#3232E6`) for Workers with missing PPE.
  - Cyan (`#F0F032`) for Helmets, Yellow (`#00D7FF`) for Vests, Magenta (`#DC64C8`) for Boots.
- **Top HUD Dashboard Bar:** Alpha-blended semi-transparent banner displaying real-time metrics:
  `HAZARDHAWK AI | Workers: X | Compliant: Y | Compliance: Z% | Violations: V | Risk: LEVEL (Score/100)`.
- **Base64 Data URI Generation:** Encodes annotated images directly into base64 JPEG buffers for instant browser rendering.

### 4.2 Video Stream Pipeline (`process_video`)
- Reads video frame-by-frame with OpenCV `VideoCapture`.
- Processes temporal safety compliance across video duration.
- Generates annotated video outputs with `VideoWriter`.

---

## 5. System Integration & React Dashboard Enhancements

### 5.1 Backend REST API
- `POST /analyze`: Accepts image uploads, executes automated YOLO detection, associates worker PPE, computes risk scores, renders OpenCV overlays, and saves to SQLite.
- `POST /analyze-video`: Processes uploaded construction videos and outputs temporal metrics.
- `GET /model-metrics`: Returns verified YOLO11n benchmarks.

### 5.2 React Dashboard (`frontend/src/App.jsx`)
- Added **Automated AI Mode** toggle button.
- Added live display of the **OpenCV Annotated Image**.
- Added 5 real-time KPI cards: Total Workers, Compliant Workers, PPE Compliance %, Violations Detected, Calculated Risk Score.
- Added **Worker-Level Inspection Table** displaying individual worker PPE status.
- Added **OSHA Violations Alert** banner.

---

## 6. Verification and Test Results

All 5 core components were verified using `demo_milestone2.py`:
1. **Model Evaluation:** Verified with 97.51% mAP50.
2. **Automated PPE Analysis:** Verified with test image `construction_site_test.png` (3 workers detected, 100% core PPE compliance, 1 boot advisory, Risk Score: 35/100 Low).
3. **OpenCV Annotations:** Verified with generated file `reports/figures/annotated_site_test.jpg`.
4. **Video Processing:** Verified with output `reports/figures/annotated_site_video.mp4`.
5. **Database Storage:** Verified with SQLite record saved and retrievable.

---

## 7. Conclusion

Milestone 2 successfully elevates the **HazardHawk AI Construction Risk Analytics** platform from an experimental prototype to an operational, automated computer vision system. The project is now fully prepared for **Milestone 3 (Enhanced Agentic Risk Analysis)**.
