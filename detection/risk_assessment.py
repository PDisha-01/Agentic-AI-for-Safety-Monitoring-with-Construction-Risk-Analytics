from pathlib import Path
from typing import Any

from detection.cv_visualizer import annotate_image
from detection.hazard_detector import assess_worker_compliance, detect_objects
from src.risk_engine import calculate_risk_score


def analyze_site_image(
    image_path: str,
    hazard_severity: int | None = None,
    likelihood: int | None = None,
    worker_exposure: int | None = None,
    safety_compliance: int | None = None,
    conf_threshold: float = 0.25,
    save_annotated_copy: bool = False,
) -> dict[str, Any]:
    """
    Milestone 2 End-to-End Image Safety Analysis:
    Combines YOLO11n object detection, automated worker-PPE compliance association,
    OpenCV visual bounding-box annotation, and dynamic risk scoring.
    """
    path_obj = Path(image_path)
    if not path_obj.is_file():
        raise FileNotFoundError(f"Site image not found at: {image_path}")

    # 1. Detect objects using trained construction PPE YOLO model
    detections = detect_objects(str(path_obj), conf_threshold=conf_threshold)

    # 2. Automated worker compliance assessment (correlates workers with PPE)
    worker_compliance = assess_worker_compliance(detections)
    auto_inputs = worker_compliance["automated_inputs"]

    # 3. Determine whether to use automated inputs or manual overrides
    use_manual = all(
        v is not None and isinstance(v, int) and 1 <= v <= 5
        for v in [hazard_severity, likelihood, worker_exposure, safety_compliance]
    )

    if use_manual:
        mode = "manual"
        active_inputs = {
            "hazard_severity": hazard_severity,
            "likelihood": likelihood,
            "worker_exposure": worker_exposure,
            "safety_compliance": safety_compliance,
        }
    else:
        mode = "automated"
        active_inputs = auto_inputs

    # 4. Calculate Risk Score using the risk engine
    risk = calculate_risk_score(
        hazard_severity=active_inputs["hazard_severity"],
        likelihood=active_inputs["likelihood"],
        worker_exposure=active_inputs["worker_exposure"],
        safety_compliance=active_inputs["safety_compliance"],
    )

    # Contextualize recommendation if specific violations were detected
    if mode == "automated" and worker_compliance["detected_hazards"]:
        violations_summary = "; ".join(worker_compliance["detected_hazards"][:3])
        if len(worker_compliance["detected_hazards"]) > 3:
            violations_summary += f" (+{len(worker_compliance['detected_hazards']) - 3} more)"
        risk["recommendation"] = (
            f"{risk['recommendation']} Identified hazards: {violations_summary}."
        )

    # 5. Render OpenCV annotated image with color-coded boxes and HUD banner
    output_annotated_path = None
    if save_annotated_copy:
        output_annotated_path = str(
            path_obj.parent / f"annotated_{path_obj.stem}.jpg"
        )

    _, annotated_data_uri = annotate_image(
        image_path=str(path_obj),
        worker_assessment=worker_compliance,
        raw_detections=detections,
        risk_assessment=risk,
        output_path=output_annotated_path,
    )

    return {
        "image": str(path_obj),
        "annotated_image": annotated_data_uri,
        "mode": mode,
        "total_workers": worker_compliance["total_workers"],
        "compliant_workers": worker_compliance["compliant_workers"],
        "ppe_compliance_rate": worker_compliance["ppe_compliance_rate"],
        "violations_count": worker_compliance["violations_count"],
        "detected_hazards": worker_compliance["detected_hazards"],
        "workers": worker_compliance["workers"],
        "detected_objects": detections,
        "object_count": len(detections),
        "assessment_inputs": active_inputs,
        "risk_assessment": risk,
    }
