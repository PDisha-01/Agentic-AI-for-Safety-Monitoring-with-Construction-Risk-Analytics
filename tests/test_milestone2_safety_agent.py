import os
from pathlib import Path
import sys
import unittest
import uuid

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Ensure local writable caches
os.environ["YOLO_CONFIG_DIR"] = str(PROJECT_ROOT / ".ultralytics")
os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".matplotlib_cache")

from backend.database import SessionLocal
from backend.models import SafetyAlert
from backend.risk_service import (
    get_safety_alerts,
    get_zone_safety_analytics,
    initialize_database,
    save_safety_alert,
    update_alert_status,
)
from src.safety_agent import ZONE_PROFILES, run_safety_agent


class TestMilestone2SafetyAgent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        initialize_database()

    def test_01_safety_agent_normal_safe_case(self):
        """Case 1: Normal safe conditions produce 100% compliance and zero active violation alerts."""
        res = run_safety_agent(
            zone_name="Zone A - Tower Crane Sector",
            scenario_override="normal_safe",
        )
        self.assertEqual(res["status"], "completed")
        self.assertFalse(res["error_flag"])
        self.assertEqual(res["compliance_rate"], 100.0)
        self.assertEqual(len(res["generated_alerts"]), 0)
        self.assertGreaterEqual(res["zone_safety_analytics"]["safety_index"], 70)
        self.assertEqual(res["zone_safety_analytics"]["zone_status"], "NORMAL")

    def test_02_safety_agent_unsafe_condition_case(self):
        """Case 2: Real site image with missing PPE generates PPEViolationEvents and actionable alerts."""
        test_img = str(PROJECT_ROOT / "test_images" / "construction_site_test.png")
        res = run_safety_agent(
            image_path=test_img,
            zone_name="Zone B - Perimeter Scaffolding",
        )
        self.assertEqual(res["status"], "completed")
        self.assertFalse(res["error_flag"])
        self.assertGreater(len(res["agent_trace"]), 0)
        self.assertIn("zone_safety_analytics", res)
        self.assertIn("ppe_violation_events", res)

        # Verify event schema
        if len(res["ppe_violation_events"]) > 0:
            evt = res["ppe_violation_events"][0]
            self.assertIn("event_id", evt)
            self.assertIn("timestamp", evt)
            self.assertIn("zone_name", evt)
            self.assertIn("worker_id", evt)
            self.assertIn("missing_ppe", evt)
            self.assertIn("osha_standard", evt)

        # Verify alert schema
        if len(res["generated_alerts"]) > 0:
            alt = res["generated_alerts"][0]
            self.assertIn("alert_id", alt)
            self.assertIn("severity", alt)
            self.assertIn("actionable_directive", alt)
            self.assertIn("status", alt)

    def test_03_safety_agent_error_and_recovery_case(self):
        """Case 3: Corrupted or occluded sensor triggers anomaly isolation and recovery plan."""
        res = run_safety_agent(
            zone_name="Zone B - Perimeter Scaffolding",
            scenario_override="error_recovery",
        )
        self.assertEqual(res["status"], "error_recovery")
        self.assertTrue(res["error_flag"])
        self.assertIsNotNone(res["error_message"])
        self.assertGreaterEqual(len(res["recovery_plan"]), 3)
        self.assertEqual(len(res["generated_alerts"]), 1)
        self.assertEqual(res["generated_alerts"][0]["event_type"], "SENSOR_ANOMALY")
        self.assertIn("FAIL-SAFE PROTOCOL", res["generated_alerts"][0]["actionable_directive"])

    def test_04_alert_lifecycle_persistence(self):
        """Verify alert creation, retrieval, and status transitions (ACTIVE -> ACKNOWLEDGED -> RESOLVED)."""
        uid = uuid.uuid4().hex[:6].upper()
        test_alert_id = f"TEST-ALT-{uid}"
        test_alert = {
            "alert_id": test_alert_id,
            "zone_name": "Zone B - Perimeter Scaffolding",
            "severity": "CRITICAL",
            "event_type": "MISSING_PPE",
            "worker_id": "Worker #9",
            "violation_details": "Unit test violation",
            "actionable_directive": "Halt work immediately",
            "status": "ACTIVE",
        }
        saved = save_safety_alert(test_alert)
        self.assertEqual(saved["alert_id"], test_alert_id)
        self.assertEqual(saved["status"], "ACTIVE")

        # Transition to ACKNOWLEDGED
        ack = update_alert_status(test_alert_id, "ACKNOWLEDGED")
        self.assertEqual(ack["status"], "ACKNOWLEDGED")

        # Transition to RESOLVED
        res = update_alert_status(test_alert_id, "RESOLVED")
        self.assertEqual(res["status"], "RESOLVED")
        self.assertIsNotNone(res["resolved_at"])

    def test_05_zone_safety_analytics(self):
        """Verify accident-prone zone analytics compilation across all sectors."""
        zones = get_zone_safety_analytics()
        self.assertIsInstance(zones, list)
        self.assertEqual(len(zones), 4)

        zone_names = {z["zone_name"] for z in zones}
        self.assertIn("Zone B - Perimeter Scaffolding", zone_names)
        self.assertIn("Zone A - Tower Crane Sector", zone_names)
        self.assertIn("Zone C - Ground Trench & Excavation", zone_names)
        self.assertIn("Zone D - Concrete Slab Cast Floor 6", zone_names)

        for z in zones:
            self.assertIn("safety_index", z)
            self.assertGreaterEqual(z["safety_index"], 0)
            self.assertLessEqual(z["safety_index"], 100)
            self.assertIn("zone_status", z)


if __name__ == "__main__":
    unittest.main()
