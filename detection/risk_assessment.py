from detection.hazard_detector import detect_objects
from src.risk_engine import calculate_risk_score


def analyze_site_image(
    image_path: str,
    hazard_severity: int,
    likelihood: int,
    worker_exposure: int,
    safety_compliance: int,
) -> dict:
    """Run object detection and calculate a site risk assessment."""

    detections = detect_objects(image_path)

    risk_assessment = calculate_risk_score(
        hazard_severity=hazard_severity,
        likelihood=likelihood,
        worker_exposure=worker_exposure,
        safety_compliance=safety_compliance,
    )

    return {
        "image": image_path,
        "detected_objects": detections,
        "object_count": len(detections),
        "risk_assessment": risk_assessment,
    }
