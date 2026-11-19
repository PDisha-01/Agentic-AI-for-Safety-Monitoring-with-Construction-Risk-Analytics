"""
HazardHawk AI / BuildSure - Milestone 3 Orchestrator & State Workflow
====================================================================
End-to-end orchestration for Milestone 3 review:
Flagged Incident -> Policy Checklist Violation -> Actuarial Exposure -> Claim-Ready Summary
Includes cryptographic check-to-evidence audit trail and fail-safe recovery protocol.
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid

from src.compliance_agent import ComplianceAgent, calculate_evidence_hash
from src.insurance_agent import InsuranceAgent, DEFAULT_POLICY_ASSUMPTIONS


def run_milestone3_pipeline(
    scenario: str = "standard_flagged",
    incident_id: Optional[str] = None,
    zone_name: str = "Zone B - Perimeter Scaffolding",
    missing_ppe: Optional[List[str]] = None,
    worker_id: str = "Worker #3 (Rajeev Sharma)",
    incident_notes: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Executes the Milestone 3 agentic workflow:
    - scenario="standard_flagged": Normal flagged incident -> violations -> claim summary
    - scenario="error_recovery": Evidence tampering / hash mismatch error -> recovery protocol -> claim summary
    - scenario="sample_case": Complete insurance case study with detailed policy assumptions
    """
    incident_id = incident_id or f"INC-2026-{uuid.uuid4().hex[:6].upper()}"
    missing_ppe = missing_ppe or ["helmet", "boots"]

    compliance_agent = ComplianceAgent()
    insurance_agent = InsuranceAgent()

    # Determine execution parameters based on scenario
    is_error_scenario = scenario in ("error_recovery", "error", "tamper")
    is_sample_case = scenario in ("sample_case", "sample", "underwriting")

    if is_sample_case:
        zone_name = "Zone B - Perimeter Scaffolding"
        missing_ppe = ["helmet", "boots", "harness"]
        worker_id = "Worker #3 (Rajeev Sharma - Steel Rigger)"
        incident_notes = (
            "During perimeter scaffolding erection at Level 7 (+21m elevation), worker was observed "
            "traversing unplanked bearer beams without anchored fall arrest harness and without Type II safety helmet."
        )

    # -------------------------------------------------------------------------
    # STAGE 1: INPUT
    # -------------------------------------------------------------------------
    input_payload = {
        "incident_id": incident_id,
        "zone_name": zone_name,
        "worker_id": worker_id,
        "scenario": scenario,
        "reported_missing_ppe": missing_ppe,
        "elevation_level": "Level 7 (+21.4m)" if "Scaffolding" in zone_name else "Ground Grade (0.0m)",
        "environmental_conditions": "Clear, 18°C, Wind gusts 14 kts",
        "detection_source": "HazardHawk CCTV AI Stream (Cam 04A - Scaffolding North)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "policy_reference": DEFAULT_POLICY_ASSUMPTIONS["policy_number"],
    }

    # -------------------------------------------------------------------------
    # STAGE 2: PROCESSING - COMPLIANCE EVALUATION
    # -------------------------------------------------------------------------
    compliance_eval = compliance_agent.evaluate_incident(
        incident_id=incident_id,
        zone_name=zone_name,
        missing_ppe=missing_ppe,
        worker_id=worker_id,
        tamper_simulation=is_error_scenario,
    )

    # -------------------------------------------------------------------------
    # STAGE 2B: ERROR CASE DETECTION & FAIL-SAFE RECOVERY PATH
    # -------------------------------------------------------------------------
    recovery_report = None
    if compliance_eval.get("tamper_detected"):
        recovery_report = compliance_agent.recover_corrupted_audit(
            incident_id=incident_id,
            zone_name=zone_name,
            audit_trail=compliance_eval["audit_trail"],
            secondary_signoff="Chief Safety Inspector - Cert #OSHA-500-8812",
        )
        # Update compliance audit trail with recovered items
        compliance_eval["audit_trail"] = recovery_report["restored_audit_trail"]
        compliance_eval["overall_status"] = "AUDIT_RECOVERY_COMPLETE"
        compliance_eval["tamper_detected"] = False

    # -------------------------------------------------------------------------
    # STAGE 2C: PROCESSING - INSURANCE EXPOSURE & ACTUARIAL MODELING
    # -------------------------------------------------------------------------
    exposure_report = insurance_agent.calculate_exposure(
        incident_id=incident_id,
        zone_name=zone_name,
        violations=compliance_eval["violations"],
        worker_headcount=1,
        is_fall_hazard="Scaffolding" in zone_name or "harness" in missing_ppe,
        is_repeat_violation=is_sample_case,  # Sample case models a repeat violation penalty
        exposure_duration_hours=3.5 if is_sample_case else 1.5,
    )

    # -------------------------------------------------------------------------
    # STAGE 3: OUTPUT - CLAIM-READY FIRST NOTICE OF LOSS (FNOL) SUMMARY
    # -------------------------------------------------------------------------
    claim_summary = insurance_agent.generate_claim_ready_summary(
        incident_id=incident_id,
        compliance_eval=compliance_eval,
        exposure_report=exposure_report,
        incident_notes=incident_notes,
    )

    return {
        "scenario": scenario,
        "input": input_payload,
        "processing": {
            "compliance_evaluation": compliance_eval,
            "error_case_and_recovery": recovery_report,
            "insurance_exposure": exposure_report,
        },
        "output": {
            "claim_summary": claim_summary,
            "loss_severity_score": exposure_report["loss_severity_score"],
            "severity_tier": exposure_report["severity_tier"],
            "total_estimated_financial_exposure": exposure_report["financial_breakdown"]["total_estimated_financial_exposure"],
            "net_insurer_exposure": exposure_report["policy_layering"]["net_insurer_exposure"],
            "contractor_retained_deductible": exposure_report["policy_layering"]["contractor_retained_loss"],
            "projected_emr": exposure_report["emr_impact_projection"]["projected_emr"],
            "violations_count": len(compliance_eval["violations"]),
            "checks_audited": compliance_eval["checks_evaluated"],
        },
    }
