
from pathlib import Path
import argparse
import sys

from detection.hazard_detector import detect_objects


def main():
    parser = argparse.ArgumentParser(
        description="Test HazardHawk AI PPE detection"
    )

    parser.add_argument(
        "image",
        nargs="?",
        default="test_images/construction_site_test.png",
        help="Path to the construction site image"
    )

    args = parser.parse_args()
    image_path = Path(args.image)

    if not image_path.is_file():
        print(f"ERROR: Image not found: {image_path.resolve()}")
        sys.exit(1)

    try:
        detections = detect_objects(str(image_path))

        print("\nHAZARDHAWK AI - PPE DETECTION RESULTS")
        print("=" * 50)
        print("Image:", image_path)

        if not detections:
            print("\nNo objects detected.")

        for i, item in enumerate(detections, start=1):
            print(f"\nDetection {i}")
            print("Class:", item["label"])
            print("Confidence:", item["confidence"])
            print("Bounding Box:", item["bbox"])

        print("\nTotal detections:", len(detections))

    except Exception as error:
        print("Detection failed:", error)
        sys.exit(1)


if __name__ == "__main__":
    main()
