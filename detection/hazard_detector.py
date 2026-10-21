from pathlib import Path
from ultralytics import YOLO

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = PROJECT_ROOT / "yolo11n.pt"

model = YOLO(str(MODEL_PATH))


def detect_objects(image_path: str) -> list[dict]:
    """Detect general objects in an image."""

    image = Path(image_path)
    if not image.is_file():
        raise FileNotFoundError(f"Image not found: {image}")

    results = model.predict(
        source=str(image),
        device="cpu",
        conf=0.25,
        verbose=False
    )

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0].item())

            detections.append({
                "label": result.names[class_id],
                "confidence": round(float(box.conf[0].item()), 3),
                "bbox": [
                    round(float(value), 2)
                    for value in box.xyxy[0].tolist()
                ]
            })

    return detections
