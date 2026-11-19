"""
HazardHawk AI / BuildSure - Milestone 3 Insurance Agent & Claim Exposure Engine
==============================================================================
Autonomous Insurance Agent for Construction Risk Underwriting & Claims Processing:
- Calculates actuarial loss severity score and multi-factor exposure models
- Integrates Workers' Comp, Commercial General Liability (CGL), and OSHA penalty reserves
- Applies commercial insurance policy layering, deductibles, and retention structures
- Models Experience Modification Rate (EMR) financial impact on future premiums
- Synthesizes First Notice of Loss (FNOL) dossiers and claim-ready summaries
"""

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid

# =========================================================================
# STANDARD COMMERCIAL CONSTRUCTION POLICY PARAMETERS & ASSUMPTIONS
# =========================================================================

DEFAULT_POLICY_ASSUMPTIONS = {
    "policy_holder": "Apex Structural Constructors LLC",
    "project_name": "Metro Tower Phase III - High-Rise Commercial Construction",
    "carrier_name": "Travelers / Zurich Commercial Construction Syndicate",
    "policy_number": "POL-CGL-2026-984210",
    "cgl_occurrence_limit": 5000000.0,       # $5.0M Commercial General Liability limit
    "cgl_aggregate_limit": 10000000.0,      # $10.0M CGL general aggregate limit
    "workers_comp_limit": 1000000.0,        # $1.0M Statutory Workers' Compensation
    "excess_umbrella_limit": 10000000.0,    # $10.0M Excess Umbrella Liability
    "per_occurrence_deductible": 50000.0,   # $50k contractor deductible / self-insured retention (SIR)
    "baseline_emr": 1.00,                   # Baseline Experience Modification Rate (1.00 = industry average)
    "annual_workers_comp_premium": 285000.0,# Base annual Workers' Comp premium ($)
}


class InsuranceAgent:
    """
    Evaluates safety incidents, compliance violations, and zone hazard multipliers
    to compute insurance exposure and generate claim-ready documentation.
    """

    def __init__(self, policy_assumptions: Optional[Dict[str, Any]] = None):
        self.policy = policy_assumptions or DEFAULT_POLICY_ASSUMPTIONS

    def calculate_exposure(
        self,
        incident_id: str,
        zone_name: str,
        violations: List[Dict[str, Any]],
        worker_headcount: int = 1,
        is_fall_hazard: bool = False,
        is_repeat_violation: bool = False,
        exposure_duration_hours: float = 2.5,
    ) -> Dict[str, Any]:
        """
        Actuarial Exposure Formula:
        LSS = min(100, (w_base * BaseSeverity + w_zone * ZoneMultiplier + w_dur * DurationFactor) * (1 + RepeatPenalty))
        """
        # 1. Determine zone hazard multiplier
        zone_multipliers = {
            "Zone A - Tower Crane Sector": 1.5,
            "Zone B - Perimeter Scaffolding": 1.8,
            "Zone C - Ground Trench & Excavation": 1.6,
            "Zone D - Concrete Slab Cast Floor 6": 1.3,
        }
        zone_multiplier = zone_multipliers.get(zone_name, 1.4)

        # 2. Base severity from violation criticalities
        critical_count = sum(1 for v in violations if v.get("severity") == "CRITICAL")
        high_count = sum(1 for v in violations if v.get("severity") == "HIGH")
        medium_count = sum(1 for v in violations if v.get("severity") == "MEDIUM")

        base_severity_raw = (critical_count * 35.0) + (high_count * 20.0) + (medium_count * 10.0)
        base_severity = min(75.0, max(15.0, base_severity_raw))

        # 3. Repeat & Duration Modifiers
        repeat_penalty = 0.35 if is_repeat_violation else 0.0
        duration_factor = min(20.0, exposure_duration_hours * 4.0)

        # 4. Loss Severity Score (0 - 100)
        lss_raw = (0.50 * base_severity + 0.30 * (zone_multiplier * 20.0) + 0.20 * duration_factor)
        loss_severity_score = min(100.0, round(lss_raw * (1.0 + repeat_penalty), 1))

        if loss_severity_score >= 80:
            severity_tier = "CRITICAL / SEVERE LOSS"
        elif loss_severity_score >= 60:
            severity_tier = "HIGH EXPOSURE"
        elif loss_severity_score >= 40:
            severity_tier = "MODERATE RISK"
        else:
            severity_tier = "LOW INCIDENT"

        # 5. Financial Exposure Reserves Estimation ($)
        # Workers' Comp: Medical Treatment + Lost Wages / Indemnity
        base_medical = 65000.0 if is_fall_hazard else 25000.0
        medical_indemnity_reserve = round(base_medical * zone_multiplier * (1.0 + 0.2 * worker_headcount), 2)

        # Commercial General Liability (CGL): Third-party, sub-contractor, or property impact
        cgl_reserve = round(45000.0 * (zone_multiplier - 0.5) * (loss_severity_score / 50.0), 2)

        # Statutory OSHA regulatory penalties
        statutory_penalty_sum = sum(v.get("statutory_penalty_estimate", 16131.0) for v in violations)
        if is_repeat_violation:
            statutory_penalty_sum *= 2.0  # Willful / Repeat citation escalations

        # Legal defense & investigative claims expenses
        legal_defense_reserve = round(35000.0 + (loss_severity_score * 450.0), 2)

        # Property / Delay / Stoppage Losses
        stoppage_losses = round(25000.0 * zone_multiplier, 2)

        # Total Estimated Financial Exposure (EFE)
        total_financial_exposure = round(
            medical_indemnity_reserve
            + cgl_reserve
            + statutory_penalty_sum
            + legal_defense_reserve
            + stoppage_losses,
            2,
        )

        # 6. Policy Deductible & Layering Breakdown
        deductible = self.policy["per_occurrence_deductible"]
        contractor_retained_loss = min(deductible, total_financial_exposure)
        net_primary_insurer_exposure = max(0.0, total_financial_exposure - contractor_retained_loss)

        # 7. Experience Modification Rate (EMR) Impact Analysis
        # NCCI EMR formula projection: claims impact expected losses vs actual losses
        emr_shift = round(min(0.35, (total_financial_exposure / 350000.0) * 0.28), 2)
        projected_emr = round(self.policy["baseline_emr"] + emr_shift, 2)
        projected_annual_premium_increase = round(
            self.policy["annual_workers_comp_premium"] * (projected_emr - self.policy["baseline_emr"]),
            2,
        )

        return {
            "incident_id": incident_id,
            "zone_name": zone_name,
            "loss_severity_score": loss_severity_score,
            "severity_tier": severity_tier,
            "zone_multiplier": zone_multiplier,
            "exposure_factors": {
                "worker_headcount": worker_headcount,
                "is_fall_hazard": is_fall_hazard,
                "is_repeat_violation": is_repeat_violation,
                "duration_hours": exposure_duration_hours,
            },
            "financial_breakdown": {
                "workers_comp_reserve": medical_indemnity_reserve,
                "cgl_third_party_reserve": cgl_reserve,
                "statutory_osha_penalties": statutory_penalty_sum,
                "legal_defense_reserve": legal_defense_reserve,
                "stoppage_and_delay_losses": stoppage_losses,
                "total_estimated_financial_exposure": total_financial_exposure,
            },
            "policy_layering": {
                "policy_number": self.policy["policy_number"],
                "carrier": self.policy["carrier_name"],
                "occurrence_limit": self.policy["cgl_occurrence_limit"],
                "deductible_sir": deductible,
                "contractor_retained_loss": contractor_retained_loss,
                "net_insurer_exposure": net_primary_insurer_exposure,
            },
            "emr_impact_projection": {
                "baseline_emr": self.policy["baseline_emr"],
                "projected_emr": projected_emr,
                "emr_delta": f"+{emr_shift:.2f}",
                "projected_annual_premium_increase": projected_annual_premium_increase,
                "three_year_cumulative_premium_hike": round(projected_annual_premium_increase * 3.0, 2),
            },
        }

    def generate_claim_ready_summary(
        self,
        incident_id: str,
        compliance_eval: Dict[str, Any],
        exposure_report: Dict[str, Any],
        incident_notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Synthesizes a formal First Notice of Loss (FNOL) and claim-ready dossier
        coupling statutory violations, cryptographic evidence, and underwriting reserves.
        """
        claim_id = f"CLM-2026-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        zone_name = compliance_eval.get("zone_name", "Zone B - Perimeter Scaffolding")
        violations = compliance_eval.get("violations", [])
        total_exposure = exposure_report["financial_breakdown"]["total_estimated_financial_exposure"]
        net_insurer = exposure_report["policy_layering"]["net_insurer_exposure"]
        deductible = exposure_report["policy_layering"]["deductible_sir"]

        # Build formal FNOL markdown summary
        dossier_text = f"""# FIRST NOTICE OF LOSS (FNOL) & CLAIM-READY INCIDENT DOSSIER
**HazardHawk AI — Autonomous Construction Claims Documentation System**
**Claim Reference ID:** `{claim_id}` | **Date of Occurrence:** `{timestamp}`

---

### 1. INSURED & POLICY PARTICULARS
- **Named Insured:** {self.policy['policy_holder']}
- **Project Site:** {self.policy['project_name']}
- **Insurance Carrier:** {self.policy['carrier_name']}
- **Policy Number:** {self.policy['policy_number']}
- **Policy Coverage:** Commercial General Liability ($5,000,000) & Statutory Workers' Comp ($1,000,000)
- **Contractor Retained Deductible (SIR):** ${deductible:,.2f}

### 2. INCIDENT OVERVIEW & OCCURRENCE LOCATION
- **Incident ID:** `{incident_id}`
- **Construction Sector:** {zone_name}
- **Worker Involved:** {compliance_eval.get('worker_id', 'Worker #3')}
- **Initial Observation:** {incident_notes or 'Automated CCTV AI detection observed unhooked fall protection / missing mandatory PPE while operating on scaffolding.'}
- **Loss Severity Score:** **{exposure_report['loss_severity_score']}/100** ({exposure_report['severity_tier']})

### 3. STATUTORY COMPLIANCE CHECKLIST VIOLATIONS
"""
        for i, vio in enumerate(violations, 1):
            dossier_text += f"""
**Violation #{i}: {vio['title']}**
- **Statutory Standard:** `{vio['standard']}` | **ISO Clause:** `{vio['iso_clause']}`
- **Infraction Details:** {vio['infraction_details']}
- **Statutory Fine Base:** ${vio['statutory_penalty_estimate']:,.2f}
- **Cryptographic Evidence SHA-256:** `{vio['evidence_hash']}`
"""

        dossier_text += f"""
### 4. ACTUARIAL FINANCIAL EXPOSURE & LOSS RESERVES
- **Workers' Compensation Reserve (Medical/Lost Wages):** ${exposure_report['financial_breakdown']['workers_comp_reserve']:,.2f}
- **Commercial General Liability Reserve (Third-Party):** ${exposure_report['financial_breakdown']['cgl_third_party_reserve']:,.2f}
- **Statutory OSHA Regulatory Penalties:** ${exposure_report['financial_breakdown']['statutory_osha_penalties']:,.2f}
- **Legal Defense & Claims Investigation Reserve:** ${exposure_report['financial_breakdown']['legal_defense_reserve']:,.2f}
- **Jobsite Stoppage / Delay Cost Estimate:** ${exposure_report['financial_breakdown']['stoppage_and_delay_losses']:,.2f}
- **TOTAL ESTIMATED FINANCIAL EXPOSURE:** **${total_exposure:,.2f}**

### 5. POLICY ALLOCATION & ADJUSTER INDEMNITY
- **Contractor Retained Loss (Under SIR Deductible):** ${exposure_report['policy_layering']['contractor_retained_loss']:,.2f}
- **Net Insurer Indemnity Exposure:** **${net_insurer:,.2f}**
- **Projected EMR Rating Impact:** {exposure_report['emr_impact_projection']['baseline_emr']:.2f} ➔ **{exposure_report['emr_impact_projection']['projected_emr']:.2f} ({exposure_report['emr_impact_projection']['emr_delta']})**
- **Estimated 3-Year Cumulative Premium Hike:** ${exposure_report['emr_impact_projection']['three_year_cumulative_premium_hike']:,.2f}

### 6. SUBROGATION & RECOMMENDED UNDERWRITING ACTIONS
1. **Subcontractor Risk Transfer:** Review subcontract scaffolding agreement with Master Rigger for contractual indemnity clause and additional insured status.
2. **Immediate Loss Control Intervention:** Enforce mandatory 100% tie-off scaffolding protocol and verify ANSI Z89.1 Type II hard hat compliance.
3. **Statutory Audit Defense:** Dispatch verified SHA-256 evidence package to legal defense counsel to mitigate willful violation exposure.
"""

        return {
            "claim_id": claim_id,
            "incident_id": incident_id,
            "timestamp": timestamp,
            "claim_status": "CLAIM_READY",
            "loss_severity_score": exposure_report["loss_severity_score"],
            "total_estimated_financial_exposure": total_exposure,
            "net_insurer_exposure": net_insurer,
            "contractor_deductible": deductible,
            "projected_emr": exposure_report["emr_impact_projection"]["projected_emr"],
            "violations_count": len(violations),
            "evidence_count": len(compliance_eval.get("audit_trail", [])),
            "claim_dossier_markdown": dossier_text,
        }
