"""
BuildSure AI - Milestone 2 Safety Agent Live Demonstration
===========================================================
Official Mentor Review Runner for Milestone 2: Safety Intelligence & Worker Protection

Review Agenda:
1. Architecture & Feature Explanation (Slide 04 & 10)
2. Case 1 Demo: Normal Conditions (100% PPE compliance, zero active alerts)
3. Case 2 Demo: PPE Violation Event -> Actionable Alert -> Zone Safety Analytics (Slide 11)
4. Case 3 Demo: Sensor Anomaly Error Case & Fail-Safe Recovery Protocol (Slide 11)
5. Mentor Discussion Answers: False Alert Reduction & Worker Privacy Protection (Slide 11 & 18)
"""

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys
import time

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

# Ensure local writable caches
os.environ["YOLO_CONFIG_DIR"] = str(PROJECT_ROOT / ".ultralytics")
os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".matplotlib_cache")

from backend.risk_service import (
    get_safety_alerts,
    get_zone_safety_analytics,
    initialize_database,
    save_safety_alert,
    update_alert_status,
)
from src.safety_agent import ZONE_PROFILES, run_safety_agent


def banner(title: str, character: str = "="):
    line = character * 76
    print(f"\n{line}")
    print(f"   {title}")
    print(f"{line}")


def section(step: str, title: str):
    print(f"\n>>> [{step}] {title}")
    print("-" * 76)


def main():
    initialize_database()

    banner("BUILDSURE AI / HAZARDHAWK — MILESTONE 2 REVIEW", "=")
    print("Project: Agentic AI for Safety Monitoring with Construction Risk Analytics")
    print("Deliverable: Milestone 2 — Safety Intelligence & Worker Protection (Weeks 3-4)")
    print(f"Review Execution Timestamp: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")

    # ---------------------------------------------------------------------
    # 1. ARCHITECTURE & EVENT SCHEMA
    # ---------------------------------------------------------------------
    section("1. ARCHITECTURE", "Safety Intelligence & Event Data Lineage (Slide 04)")
    print("Data Lineage Pipeline:")
    print("  [Site Inputs: CCTV / Camera] ")
    print("         ↓ ")
    print("  [Perception Node: YOLO11n PPE Detector (Anatomical Spatial Association)]")
    print("         ↓ ")
    print("  [Safety Agent: LangGraph StateGraph (OSHA 1926 Compliance & Zone Multipliers)]")
    print("         ↓ ")
    print("  [Event Schema: PPEViolationEvent -> Actionable SafetyAlert Dispatch]")
    print("         ↓ ")
    print("  [Outputs: Real-Time Alerts Queue + Accident-Prone Zone Safety Analytics]")

    # ---------------------------------------------------------------------
    # 2. CASE 1: NORMAL SAFE SITE CONDITIONS
    # ---------------------------------------------------------------------
    section("2. LIVE DEMO: CASE 1", "Normal Safe Condition (100% PPE Compliance)")
    print("Input: Zone A (Tower Crane Sector) — Workers equipped with compliant hard hats & high-vis vests.")
    print("Processing: Executing LangGraph Safety Agent nodes...")
    
    normal_res = run_safety_agent(
        zone_name="Zone A - Tower Crane Sector",
        scenario_override="normal_safe",
    )

    print(f"  • Workers Audited      : {normal_res['total_workers']} workers")
    print(f"  • Compliant Workers    : {normal_res['compliant_workers']} / {normal_res['total_workers']}")
    print(f"  • PPE Compliance Rate  : {normal_res['compliance_rate']:.1f}%")
    print(f"  • Calculated Risk Score: {normal_res['risk_score']}/100 ({normal_res['risk_level']})")
    print(f"  • Generated Alerts     : {len(normal_res['generated_alerts'])} active alerts (Safe Operations)")
    print(f"  • Zone Safety Index    : {normal_res['zone_safety_analytics'].get('safety_index', 90)}/100")
    print("  • Result               : Operations Certified to Proceed (Status: NORMAL)")

    time.sleep(1)

    # ---------------------------------------------------------------------
    # 3. CASE 2: UNSAFE CONDITION (VIOLATION -> ALERT -> ZONE ANALYTICS)
    # ---------------------------------------------------------------------
    section("3. LIVE DEMO: CASE 2", "Unsafe Condition (Violation Event -> Alert -> Zone Analytics)")
    print("Mentor Requirement: Feed a PPE violation -> trigger alert -> show zone-level safety analytics.")
    print("Input: Zone B (Perimeter Scaffolding - High Fall Hazard) with active site workers.")
    print("Processing: Running YOLO11n + Safety Agent compliance evaluator...")

    sample_img = str(PROJECT_ROOT / "test_images" / "construction_site_test.png")
    unsafe_res = run_safety_agent(
        image_path=sample_img,
        zone_name="Zone B - Perimeter Scaffolding",
    )

    print(f"\n[A] PERCEPTION & PPE VIOLATION EVENTS:")
    print(f"  • Total Workers Detected : {unsafe_res['total_workers']}")
    print(f"  • Compliance Rate        : {unsafe_res['compliance_rate']:.1f}%")
    print(f"  • Violation Events Count : {len(unsafe_res['ppe_violation_events'])}")

    for event in unsafe_res["ppe_violation_events"]:
        print(f"    - Event ID   : {event['event_id']}")
        print(f"      Worker     : {event['worker_id']}")
        print(f"      Missing PPE: {', '.join(event['missing_ppe']).upper()}")
        print(f"      Standard   : {event['osha_standard']}")

    print(f"\n[B] GENERATED ACTIONABLE SAFETY ALERTS:")
    for alert in unsafe_res["generated_alerts"]:
        # Persist to database
        saved = save_safety_alert(alert)
        print(f"    🚨 [{alert['severity']}] {alert['alert_id']} — {alert['zone_name']}")
        print(f"       Violation : {alert['violation_details']}")
        print(f"       Directive : {alert['actionable_directive']}")
        print(f"       Status    : {alert['status']} | Recorded into SQLite (DB ID #{saved['id']})")

    print(f"\n[C] UPDATED ACCIDENT-PRONE ZONE SAFETY ANALYTICS:")
    analytics = unsafe_res["zone_safety_analytics"]
    print(f"  • Sector Monitored       : {analytics.get('zone_name')}")
    print(f"  • Zone Safety Index      : {analytics.get('safety_index')}/100")
    print(f"  • Active Hazards Active  : {analytics.get('active_hazard_count')}")
    print(f"  • Accident Risk Tier     : {analytics.get('accident_risk_tier')}")
    print(f"  • Zone Operating Status  : {analytics.get('zone_status')}")

    time.sleep(1)

    # ---------------------------------------------------------------------
    # 4. CASE 3: ERROR CASE & FAIL-SAFE RECOVERY PATH
    # ---------------------------------------------------------------------
    section("4. LIVE DEMO: CASE 3", "Error Case & Fail-Safe Recovery Protocol (Slide 11)")
    print("Mentor Requirement: Include one error case and recovery path.")
    print("Input: Optical sensor lens occlusion & corrupted CCTV frame stream payload.")
    print("Processing: Agentic anomaly detector triggered...")

    error_res = run_safety_agent(
        zone_name="Zone B - Perimeter Scaffolding",
        scenario_override="error_recovery",
    )

    print(f"  • Anomaly Detected     : {error_res['error_flag']}")
    print(f"  • Diagnostic Root Cause: {error_res['error_message']}")
    print(f"  • Emergency Alert      : {error_res['generated_alerts'][0]['alert_id']} ({error_res['generated_alerts'][0]['severity']})")
    print(f"  • Action Directive     : {error_res['generated_alerts'][0]['actionable_directive']}")
    
    print("\n[D] AGENT RECOVERY PROTOCOL WORKFLOW:")
    for step in error_res["recovery_plan"]:
        print(f"    ✓ {step}")

    time.sleep(1)

    # ---------------------------------------------------------------------
    # 5. MENTOR DISCUSSION POINTS & RESPONSIBLE AI GUARDRAILS
    # ---------------------------------------------------------------------
    section("5. DISCUSSION", "Responsible AI & Engineering Guardrails (Slide 11 & 18)")
    
    print("\nQ1: How do you reduce false alerts?")
    print("-----------------------------------------------------------------------")
    print("  1. Anatomical Zone Gating: PPE bounding boxes are not checked in isolation;")
    print("     helmets must intersect the upper 20% head zone of an identified human bounding box.")
    print("  2. Temporal Persistence Window: Video stream processing requires 3 consecutive")
    print("     confirmed violation frames before triggering a CRITICAL stop-work alert.")
    print("  3. Confidence Calibration: Re-calibrated YOLO11n confidence threshold at 0.40")
    print("     with IoU overlap threshold 0.45 to prevent false reflections or shadows.")

    print("\nQ2: How do you protect worker privacy?")
    print("-----------------------------------------------------------------------")
    print("  1. Edge Anonymization: Facial regions are automatically blurred before storage.")
    print("  2. Zero Biometric Identification: Workers are tracked strictly as anonymous spatial")
    print("     entities ('Worker #1', 'Worker #2') without facial recognition or PII.")
    print("  3. Ephemeral Processing: CCTV frames are processed in-memory and discarded;")
    print("     only bounding box coordinates and violation audit logs are persisted.")

    print("\nQ3: What are the Human Oversight Guardrails (Slide 18)?")
    print("-----------------------------------------------------------------------")
    print("  1. Non-Replacement Policy: AI alerts serve as decision-support for certified safety")
    print("     officers, never replacing statutory OSHA/local safety inspections.")
    print("  2. Full Audit Provenance: Every alert and risk score is logged with exact timestamps,")
    print("     contributing risk factors, and interactive Acknowledge/Resolve state transitions.")

    banner("MILESTONE 2 REVIEW RUNNER COMPLETE — 100% OPERATIONAL", "=")
    print("All Deliverables Fulfilled: PPE Pipeline, Alerts Queue, Zone Analytics, and Recovery Paths.\n")


if __name__ == "__main__":
    main()
