import os
import sys
from pathlib import Path
import unittest

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Ensure local writable caches before importing ultralytics / matplotlib
os.environ["YOLO_CONFIG_DIR"] = str(PROJECT_ROOT / ".ultralytics")
os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".matplotlib_cache")

from backend.main import get_model_evaluation_metrics, health_check
from detection.cv_visualizer import annotate_image
from detection.hazard_detector import assess_worker_compliance, detect_objects
from detection.risk_assessment import analyze_site_image
from src.risk_engine import calculate_risk_score

SAMPLE_IMAGE = str(PROJECT_ROOT / "test_images" / "construction_site_test.png")


class TestMilestone2CV(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Run detection once for unit tests to maximize test execution speed
        cls.detections = detect_objects(SAMPLE_IMAGE)
        cls.assessment = assess_worker_compliance(cls.detections)

    def test_01_yolo_detection(self):
        """Verify that the trained YOLO PPE model detects objects."""
        self.assertIsInstance(self.detections, list)
        self.assertGreater(len(self.detections), 0)

        classes_found = {d["label"] for d in self.detections}
        self.assertTrue(
            "human" in classes_found or "helmet" in classes_found or "vest" in classes_found
        )
        for d in self.detections:
            self.assertIn("bbox", d)
            self.assertEqual(len(d["bbox"]), 4)
            self.assertGreaterEqual(d["confidence"], 0.0)
            self.assertLessEqual(d["confidence"], 1.0)

    def test_02_worker_compliance_association(self):
        """Verify worker-level PPE spatial association and violation logic."""
        assessment = self.assessment
        self.assertIn("total_workers", assessment)
        self.assertIn("compliant_workers", assessment)
        self.assertIn("ppe_compliance_rate", assessment)
        self.assertIn("automated_inputs", assessment)
        self.assertIn("workers", assessment)

        self.assertGreaterEqual(assessment["total_workers"], 1)
        self.assertGreaterEqual(assessment["ppe_compliance_rate"], 0.0)
        self.assertLessEqual(assessment["ppe_compliance_rate"], 100.0)

        auto_inputs = assessment["automated_inputs"]
        for key in ["hazard_severity", "likelihood", "worker_exposure", "safety_compliance"]:
            self.assertGreaterEqual(auto_inputs[key], 1)
            self.assertLessEqual(auto_inputs[key], 5)

    def test_03_opencv_annotation_rendering(self):
        """Verify that OpenCV annotates the image and generates a valid Base64 data URI."""
        auto_inputs = self.assessment["automated_inputs"]
        risk = calculate_risk_score(**auto_inputs)

        out_file = str(PROJECT_ROOT / "reports" / "figures" / "test_annotated_output.jpg")
        img, data_uri = annotate_image(
            image_path=SAMPLE_IMAGE,
            worker_assessment=self.assessment,
            raw_detections=self.detections,
            risk_assessment=risk,
            output_path=out_file,
        )

        self.assertIsNotNone(img)
        self.assertGreater(img.shape[0], 0)
        self.assertGreater(img.shape[1], 0)
        self.assertTrue(data_uri.startswith("data:image/jpeg;base64,"))
        self.assertGreater(len(data_uri), 1000)
        self.assertTrue(Path(out_file).is_file())

    def test_04_end_to_end_image_analysis(self):
        """Verify end-to-end automated image analysis function."""
        res = analyze_site_image(SAMPLE_IMAGE)
        self.assertEqual(res["mode"], "automated")
        self.assertGreaterEqual(res["total_workers"], 1)
        self.assertGreaterEqual(res["risk_assessment"]["risk_score"], 0)
        self.assertIn("annotated_image", res)

    def test_05_fastapi_model_metrics_endpoint(self):
        """Verify FastAPI /model-metrics endpoint."""
        metrics = get_model_evaluation_metrics()
        self.assertIn("overall_metrics", metrics)
        self.assertGreaterEqual(metrics["overall_metrics"]["mAP50"], 0.80)
        self.assertIn("per_class_metrics", metrics)

    def test_06_fastapi_health_check(self):
        """Verify FastAPI health check reports Milestone 2 status."""
        data = health_check()
        self.assertIn("Milestone 2", data["milestone"])


if __name__ == "__main__":
    unittest.main()
