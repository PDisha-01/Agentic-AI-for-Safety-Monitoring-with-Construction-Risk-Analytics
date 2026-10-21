from ultralytics import YOLO

# Load a small pretrained YOLO model
model = YOLO("yolo11n.pt")

# Detect objects in a sample image
results = model.predict(
    source="https://ultralytics.com/images/bus.jpg",
    device="cpu",
    save=True,
    conf=0.25
)

for result in results:
    for box in result.boxes:
        class_id = int(box.cls[0].item())
        label = result.names[class_id]
        confidence = float(box.conf[0].item())

        print(f"{label}: {confidence:.2%}")

print("\nYOLO detection test completed!")
