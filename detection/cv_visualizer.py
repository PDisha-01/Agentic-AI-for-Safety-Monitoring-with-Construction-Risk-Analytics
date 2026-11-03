import base64
from pathlib import Path
from typing import Any
import cv2
import numpy as np


# Color palette in BGR format
COLOR_PALETTE = {
    "compliant_worker": (60, 200, 60),      # Bright Green
    "violation_worker": (50, 50, 230),       # Bright Red
    "helmet": (240, 240, 50),                 # Cyan/Light Blue
    "vest": (0, 215, 255),                    # Yellow/Gold
    "boots": (220, 100, 200),                 # Purple/Magenta
    "gloves": (50, 150, 255),                 # Orange
    "banner_bg": (20, 25, 35),                # Dark Slate
    "text_white": (245, 245, 245),
    "text_green": (80, 230, 80),
    "text_red": (80, 80, 255),
    "text_amber": (50, 190, 255),
}


def draw_label(
    image: np.ndarray,
    text: str,
    x: int,
    y: int,
    bg_color: tuple[int, int, int],
    text_color: tuple[int, int, int] = (255, 255, 255),
    font_scale: float = 0.55,
    thickness: int = 1,
) -> None:
    """Draw a text label with a filled background rectangle."""
    font = cv2.FONT_HERSHEY_SIMPLEX
    (text_w, text_h), baseline = cv2.getTextSize(text, font, font_scale, thickness)

    # Ensure label coordinates stay inside image boundaries
    y1 = max(0, y - text_h - 8)
    y2 = max(text_h + 8, y)
    x1 = max(0, x)
    x2 = min(image.shape[1], x + text_w + 10)

    cv2.rectangle(image, (x1, y1), (x2, y2), bg_color, -1)
    cv2.putText(
        image,
        text,
        (x1 + 5, y2 - baseline - 2),
        font,
        font_scale,
        text_color,
        thickness,
        cv2.LINE_AA,
    )


def add_dashboard_overlay(
    image: np.ndarray,
    total_workers: int,
    compliant_workers: int,
    compliance_rate: float,
    violations_count: int,
    risk_level: str = "Low",
    risk_score: int = 0,
) -> np.ndarray:
    """Add a professional semi-transparent HUD banner at the top of the image."""
    h, w = image.shape[:2]
    banner_height = max(70, int(h * 0.08))

    overlay = image.copy()
    cv2.rectangle(
        overlay,
        (0, 0),
        (w, banner_height),
        COLOR_PALETTE["banner_bg"],
        -1,
    )
    # 85% opacity overlay
    cv2.addWeighted(overlay, 0.85, image, 0.15, 0, image)

    font = cv2.FONT_HERSHEY_SIMPLEX
    scale_title = max(0.6, w / 2200.0)
    scale_text = max(0.5, w / 2600.0)

    # Title text
    title = "HAZARDHAWK AI | SITE SAFETY MONITOR"
    cv2.putText(
        image,
        title,
        (20, int(banner_height * 0.42)),
        font,
        scale_title,
        COLOR_PALETTE["text_white"],
        2,
        cv2.LINE_AA,
    )

    # Metrics text
    status_color = (
        COLOR_PALETTE["text_green"]
        if risk_level in {"Low", "Medium"} and compliance_rate >= 80
        else COLOR_PALETTE["text_red"]
    )

    metrics_text = (
        f"Workers: {total_workers}  |  "
        f"Compliant: {compliant_workers}  |  "
        f"Compliance: {compliance_rate:.1f}%  |  "
        f"Violations: {violations_count}  |  "
        f"Risk: {risk_level.upper()} ({risk_score}/100)"
    )

    cv2.putText(
        image,
        metrics_text,
        (20, int(banner_height * 0.82)),
        font,
        scale_text,
        status_color,
        1,
        cv2.LINE_AA,
    )

    # Decorative bottom accent line on banner
    cv2.line(
        image,
        (0, banner_height),
        (w, banner_height),
        COLOR_PALETTE["vest"],
        2,
    )

    return image


def annotate_image(
    image_path: str,
    worker_assessment: dict[str, Any],
    raw_detections: list[dict[str, Any]] | None = None,
    risk_assessment: dict[str, Any] | None = None,
    output_path: str | None = None,
) -> tuple[np.ndarray, str]:
    """
    Milestone 2 OpenCV Visualizer:
    Renders color-coded bounding boxes for workers and PPE items, applies safety labels,
    overlays the safety dashboard header, and returns the image array and base64 data URI.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Failed to read image at: {image_path}")

    # 1. Draw individual PPE items first (thin bounding box)
    if raw_detections:
        for det in raw_detections:
            label = det["label"]
            if label == "human":
                continue
            color = COLOR_PALETTE.get(label, (200, 200, 200))
            x1, y1, x2, y2 = [int(v) for v in det["bbox"]]
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            draw_label(
                img,
                f"{label.capitalize()} {det['confidence']:.2f}",
                x1,
                y1,
                bg_color=color,
                text_color=(15, 15, 15),
                font_scale=0.45,
                thickness=1,
            )

    # 2. Draw Worker bounding boxes (thicker, color-coded by compliance)
    workers = worker_assessment.get("workers", [])
    for worker in workers:
        x1, y1, x2, y2 = [int(v) for v in worker["bbox"]]
        is_compliant = worker["is_compliant"]
        color = (
            COLOR_PALETTE["compliant_worker"]
            if is_compliant
            else COLOR_PALETTE["violation_worker"]
        )

        # Draw worker bounding box
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 3)

        # Build worker status label
        worker_id = worker["worker_id"]
        if is_compliant:
            label_text = f"Worker #{worker_id}: COMPLIANT"
        else:
            violation_brief = ", ".join(
                v.replace("Missing ", "") for v in worker["violations"]
            )
            label_text = f"Worker #{worker_id}: NO {violation_brief.upper()}"

        draw_label(
            img,
            label_text,
            x1,
            y1,
            bg_color=color,
            text_color=(255, 255, 255),
            font_scale=0.55,
            thickness=2,
        )

    # 3. Add top HUD banner overlay
    risk_level = (
        risk_assessment.get("risk_level", "Low")
        if risk_assessment
        else "Low"
    )
    risk_score = (
        risk_assessment.get("risk_score", 0)
        if risk_assessment
        else 0
    )

    img = add_dashboard_overlay(
        image=img,
        total_workers=worker_assessment.get("total_workers", 0),
        compliant_workers=worker_assessment.get("compliant_workers", 0),
        compliance_rate=worker_assessment.get("ppe_compliance_rate", 100.0),
        violations_count=worker_assessment.get("violations_count", 0),
        risk_level=risk_level,
        risk_score=risk_score,
    )

    # 4. Save to output path if specified
    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(output_path, img)

    # 5. Convert to Base64 JPEG data URL for frontend consumption
    success, buffer = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not success:
        raise RuntimeError("Failed to encode annotated image to JPEG buffer.")

    base64_str = base64.b64encode(buffer).decode("utf-8")
    data_uri = f"data:image/jpeg;base64,{base64_str}"

    return img, data_uri


def process_video(
    video_path: str,
    output_path: str | None = None,
    frame_stride: int = 2,
    max_frames: int | None = 150,
) -> dict[str, Any]:
    """
    Milestone 2 OpenCV Video Processing Pipeline:
    Processes video stream frame-by-frame, performs hazard detection, annotates frames,
    and calculates temporal safety analytics across the video duration.
    """
    from detection.hazard_detector import detect_objects, assess_worker_compliance
    from src.risk_engine import calculate_risk_score

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open video file: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    writer = None
    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(output_path, fourcc, fps / frame_stride, (width, height))

    frame_count = 0
    processed_count = 0
    total_workers_sum = 0
    total_violations_sum = 0
    compliance_rates = []
    peak_risk_score = 0
    peak_risk_level = "Low"

    temp_frame_path = Path("reports") / ".temp_frame.jpg"
    temp_frame_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % frame_stride != 0:
                continue

            processed_count += 1
            cv2.imwrite(str(temp_frame_path), frame)

            # Detect objects and assess compliance
            detections = detect_objects(str(temp_frame_path))
            worker_assessment = assess_worker_compliance(detections, width, height)

            auto_inputs = worker_assessment["automated_inputs"]
            risk = calculate_risk_score(
                hazard_severity=auto_inputs["hazard_severity"],
                likelihood=auto_inputs["likelihood"],
                worker_exposure=auto_inputs["worker_exposure"],
                safety_compliance=auto_inputs["safety_compliance"],
            )

            # Annotate frame
            annotated_frame, _ = annotate_image(
                image_path=str(temp_frame_path),
                worker_assessment=worker_assessment,
                raw_detections=detections,
                risk_assessment=risk,
            )

            if writer:
                writer.write(annotated_frame)

            # Aggregate statistics
            workers_n = worker_assessment["total_workers"]
            violations_n = worker_assessment["violations_count"]
            comp_rate = worker_assessment["ppe_compliance_rate"]

            total_workers_sum += workers_n
            total_violations_sum += violations_n
            compliance_rates.append(comp_rate)

            if risk["risk_score"] > peak_risk_score:
                peak_risk_score = risk["risk_score"]
                peak_risk_level = risk["risk_level"]

            if max_frames and processed_count >= max_frames:
                break

    finally:
        cap.release()
        if writer:
            writer.release()
        if temp_frame_path.is_file():
            temp_frame_path.unlink(missing_ok=True)

    avg_compliance = (
        round(sum(compliance_rates) / len(compliance_rates), 1)
        if compliance_rates
        else 100.0
    )
    avg_workers = (
        round(total_workers_sum / processed_count, 1)
        if processed_count > 0
        else 0
    )

    return {
        "video_path": video_path,
        "output_path": output_path,
        "total_frames_in_video": total_video_frames,
        "frames_analyzed": processed_count,
        "fps": fps,
        "average_workers_per_frame": avg_workers,
        "average_compliance_rate": avg_compliance,
        "total_violations_detected": total_violations_sum,
        "peak_risk_score": peak_risk_score,
        "peak_risk_level": peak_risk_level,
    }
