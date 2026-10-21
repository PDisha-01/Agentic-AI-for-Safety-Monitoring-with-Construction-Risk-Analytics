from detection.hazard_detector import detect_objects

results = detect_objects("bus.jpg")

print("\nYOLO Detection Results")
print("-" * 40)

for item in results:
    print(
        f"Object: {item['label']} | "
        f"Confidence: {item['confidence']} | "
        f"Box: {item['bbox']}"
    )

print(f"\nTotal objects detected: {len(results)}")
