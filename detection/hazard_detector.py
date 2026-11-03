import os
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Ensure Ultralytics and Matplotlib config dirs are local and writable before importing ultralytics
os.environ["YOLO_CONFIG_DIR"] = str(PROJECT_ROOT / ".ultralytics")
os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".matplotlib_cache")

from ultralytics import YOLO

MODEL_PATH = PROJECT_ROOT / "models" / "ppe_best.pt"

# Load the trained PPE detection model
if not MODEL_PATH.is_file():
    raise FileNotFoundError(f"PPE model not found: {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))

# PPE classes learned during training
PPE_CLASSES = [
    "boots",
    "gloves",
    "helmet",
    "human",
    "vest"
]


def detect_objects(image_path: str, conf_threshold: float = 0.25) -> list[dict[str, Any]]:
    """Detect PPE-related objects in a construction site image using YOLO11n."""
    image = Path(image_path)

    if not image.is_file():
        raise FileNotFoundError(f"Image not found: {image}")

    results = model.predict(
        source=str(image),
        device="cpu",
        conf=conf_threshold,
        verbose=False,
    )

    detections: list[dict[str, Any]] = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            label = result.names[class_id]

            detections.append({
                "label": label,
                "confidence": round(float(box.conf[0].item()), 3),
                "bbox": [
                    round(float(value), 2)
                    for value in box.xyxy[0].tolist()
                ],
            })

    return detections


def _is_item_associated_with_human(
    human_bbox: list[float],
    item_bbox: list[float],
    item_label: str,
) -> bool:
    """
    Check if a detected PPE item belongs to a detected human using spatial geometry.
    Body Zone partitioning:
      - Helmet: Upper 40% of the worker bounding box
      - Vest: Middle 60% (torso)
      - Boots: Lower 40% (feet)
      - Gloves: Middle-to-lower 60%
    """
    hx1, hy1, hx2, hy2 = human_bbox
    hw = hx2 - hx1
    hh = hy2 - hy1

    ix1, iy1, ix2, iy2 = item_bbox
    icx = (ix1 + ix2) / 2.0
    icy = (iy1 + iy2) / 2.0

    # Horizontal containment with 15% tolerance
    x_match = (hx1 - hw * 0.15) <= icx <= (hx2 + hw * 0.15)
    if not x_match:
        return False

    # Vertical body zone checks
    if item_label == "helmet":
        # Helmet should be around top of human box (-15% above to 45% down)
        return (hy1 - hh * 0.15) <= icy <= (hy1 + hh * 0.45)
    elif item_label == "vest":
        # Vest should be on torso (15% down to 75% down)
        return (hy1 + hh * 0.15) <= icy <= (hy1 + hh * 0.75)
    elif item_label == "boots":
        # Boots should be near bottom (55% down to +15% below)
        return (hy1 + hh * 0.55) <= icy <= (hy2 + hh * 0.15)
    elif item_label == "gloves":
        # Gloves near torso/waist
        return (hy1 + hh * 0.30) <= icy <= (hy1 + hh * 0.85)

    # General fallback: center of item inside expanded human box
    return (hy1 - hh * 0.10) <= icy <= (hy2 + hh * 0.10)


def assess_worker_compliance(
    detections: list[dict[str, Any]],
    image_width: int = 1920,
    image_height: int = 1080,
) -> dict[str, Any]:
    """
    Milestone 2 Automated Hazard Detection:
    Correlate detected workers with their protective equipment (helmet, vest, boots, gloves),
    identify specific OSHA PPE violations, and derive automated risk parameters.
    """
    humans = [d for d in detections if d["label"] == "human"]
    ppe_items = [d for d in detections if d["label"] != "human"]

    workers: list[dict[str, Any]] = []
    all_violations: list[str] = []

    # Map each detected human to overlapping PPE
    for idx, human in enumerate(humans, start=1):
        h_box = human["bbox"]
        assigned_items: list[dict[str, Any]] = []

        for ppe in ppe_items:
            if _is_item_associated_with_human(h_box, ppe["bbox"], ppe["label"]):
                assigned_items.append(ppe)

        detected_labels = [item["label"] for item in assigned_items]
        has_helmet = "helmet" in detected_labels
        has_vest = "vest" in detected_labels
        has_boots = "boots" in detected_labels
        has_gloves = "gloves" in detected_labels

        worker_violations: list[str] = []
        if not has_helmet:
            worker_violations.append("Missing Hard Hat / Helmet")
        if not has_vest:
            worker_violations.append("Missing High-Visibility Safety Vest")
        if not has_boots:
            worker_violations.append("Missing Safety Boots")

        # Core OSHA compliance requires Helmet and High-Visibility Vest
        is_compliant = (has_helmet and has_vest)

        for v in worker_violations:
            all_violations.append(f"Worker #{idx}: {v}")

        workers.append({
            "worker_id": idx,
            "confidence": human["confidence"],
            "bbox": h_box,
            "is_compliant": is_compliant,
            "has_helmet": has_helmet,
            "has_vest": has_vest,
            "has_boots": has_boots,
            "has_gloves": has_gloves,
            "assigned_ppe": detected_labels,
            "violations": worker_violations,
        })

    total_workers = len(workers)
    compliant_workers = sum(1 for w in workers if w["is_compliant"])
    compliance_rate = (
        round((compliant_workers / total_workers) * 100.0, 1)
        if total_workers > 0
        else 100.0
    )

    # Derive automated risk scoring parameters from CV detections (1-5 scale)
    if total_workers == 0:
        worker_exposure = 1
        safety_compliance = 5
        hazard_severity = 1
        likelihood = 1
    else:
        # Worker Exposure (1-5) based on worker crowd density
        if total_workers <= 2:
            worker_exposure = 2
        elif total_workers <= 5:
            worker_exposure = 3
        elif total_workers <= 10:
            worker_exposure = 4
        else:
            worker_exposure = 5

        # Safety Compliance (1-5) based on compliance percentage
        if compliance_rate >= 95.0:
            safety_compliance = 5  # Excellent
        elif compliance_rate >= 80.0:
            safety_compliance = 4  # Good
        elif compliance_rate >= 60.0:
            safety_compliance = 3  # Moderate
        elif compliance_rate >= 40.0:
            safety_compliance = 2  # Poor
        else:
            safety_compliance = 1  # Critical non-compliance

        # Hazard Severity (1-5) based on highest risk hazard
        missing_helmets = any(not w["has_helmet"] for w in workers)
        missing_vests = any(not w["has_vest"] for w in workers)
        missing_boots = any(not w["has_boots"] for w in workers)

        if missing_helmets:
            hazard_severity = 4 if total_workers <= 3 else 5
        elif missing_vests:
            hazard_severity = 3
        elif missing_boots:
            hazard_severity = 2
        else:
            hazard_severity = 1

        # Likelihood (1-5) of incident based on violation ratio
        violation_rate = 1.0 - (compliant_workers / total_workers)
        if violation_rate == 0.0:
            likelihood = 1
        elif violation_rate <= 0.25:
            likelihood = 2
        elif violation_rate <= 0.50:
            likelihood = 3
        elif violation_rate <= 0.75:
            likelihood = 4
        else:
            likelihood = 5

    return {
        "total_workers": total_workers,
        "compliant_workers": compliant_workers,
        "violations_count": len(all_violations),
        "ppe_compliance_rate": compliance_rate,
        "detected_hazards": all_violations,
        "workers": workers,
        "automated_inputs": {
            "hazard_severity": hazard_severity,
            "likelihood": likelihood,
            "worker_exposure": worker_exposure,
            "safety_compliance": safety_compliance,
        },
    }
