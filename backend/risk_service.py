from datetime import datetime, timedelta, timezone
import json
from sqlalchemy import select, text

from backend.auth import hash_password, verify_password
from backend.database import Base, SessionLocal, engine
from backend.models import (
    AuditEvidenceRecord,
    ComplianceCheckRecord,
    ComplianceViolationRecord,
    InsuranceClaimRecord,
    RiskAssessment,
    SafetyAlert,
    User,
    WorkerReport,
)
from src.safety_agent import ZONE_PROFILES, run_safety_agent
from src.site_risk_agent import run_site_risk_agent


def initialize_database() -> None:
    """Create database tables, apply schema migrations, and seed default user."""
    Base.metadata.create_all(bind=engine)

    # Automatically ensure new Milestone 2 columns exist in existing SQLite databases
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(risk_assessments)"))
            existing_columns = {row[1] for row in result.fetchall()}

            new_columns = [
                ("mode", "VARCHAR(20) DEFAULT 'manual'"),
                ("total_workers", "INTEGER DEFAULT 0"),
                ("compliant_workers", "INTEGER DEFAULT 0"),
                ("violations_count", "INTEGER DEFAULT 0"),
                ("compliance_rate", "FLOAT DEFAULT 100.0"),
            ]

            for col_name, col_def in new_columns:
                if col_name not in existing_columns:
                    conn.execute(
                        text(f"ALTER TABLE risk_assessments ADD COLUMN {col_name} {col_def}")
                    )

            # Ensure worker profile columns exist in users table
            user_cols_res = conn.execute(text("PRAGMA table_info(users)"))
            user_existing = {row[1] for row in user_cols_res.fetchall()}
            user_new_columns = [
                ("dob", "VARCHAR(20) DEFAULT '1994-08-15'"),
                ("age", "INTEGER DEFAULT 30"),
                ("blood_group", "VARCHAR(10) DEFAULT 'O+'"),
                ("mobile_no", "VARCHAR(25) DEFAULT '+91 98765 43210'"),
                ("designation", "VARCHAR(100) DEFAULT 'Steel Rigger & Scaffolder'"),
                ("shift", "VARCHAR(50) DEFAULT 'Morning Shift (07:00 AM - 03:30 PM)'"),
                ("timetable", "TEXT DEFAULT '07:00 AM Toolbox briefing | 07:30 AM Scaffolding check | 12:30 PM Lunch | 15:00 PM Shift report'"),
                ("assigned_sector", "VARCHAR(100) DEFAULT 'Zone B — Perimeter Scaffolding (Level 7)'"),
            ]
            for col_name, col_def in user_new_columns:
                if col_name not in user_existing:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"))

            conn.commit()
        except Exception:
            pass

    # Seed default demonstration user if none exist
    with SessionLocal() as session:
        statement = select(User).where(User.email == "admin@hazardhawk.ai")
        default_user = session.scalars(statement).first()
        if not default_user:
            demo_user = User(
                email="admin@hazardhawk.ai",
                full_name="Disha Mallick",
                hashed_password=hash_password("Admin@123"),
                role="Safety Officer",
            )
            session.add(demo_user)
            session.commit()

        # Seed demonstration worker & employee accounts if they do not exist
        for worker_email, worker_name, worker_role in [
            ("worker.rajeev@hazardhawk.ai", "Rajeev Sharma", "Steel Rigger & Scaffolder"),
            ("worker.arun@hazardhawk.ai", "Arun Kumar", "Heavy Crane Banksman"),
        ]:
            existing_worker = session.scalars(select(User).where(User.email == worker_email)).first()
            if not existing_worker:
                session.add(
                    User(
                        email=worker_email,
                        full_name=worker_name,
                        hashed_password=hash_password("Worker@123"),
                        role=worker_role,
                    )
                )
        session.commit()

        # Seed initial realistic safety alerts for Milestone 2 demo if table is empty
        first_alert = session.scalars(select(SafetyAlert)).first()
        if not first_alert:
            now = datetime.now(timezone.utc)
            sample_alerts = [
                SafetyAlert(
                    alert_id="ALT-8910",
                    zone_name="Zone B - Perimeter Scaffolding",
                    severity="CRITICAL",
                    event_type="MISSING_PPE",
                    worker_id="Worker #3",
                    violation_details="Worker #3 detected without Hard Hat on scaffolding tier 3.",
                    actionable_directive="IMMEDIATE STOP-WORK DIRECTIVE: Halt elevated work on scaffolding tier 3. Issue certified ANSI Z89.1 hard hat before zone re-entry.",
                    status="ACTIVE",
                    created_at=now - timedelta(minutes=14),
                ),
                SafetyAlert(
                    alert_id="ALT-8904",
                    zone_name="Zone A - Tower Crane Sector",
                    severity="HIGH",
                    event_type="MISSING_PPE",
                    worker_id="Worker #1",
                    violation_details="Worker #1 missing Class 2 High-Visibility Vest within machinery swing radius.",
                    actionable_directive="SAFETY INTERVENTION: Equip worker with ANSI/ISEA 107 reflective vest before re-entering slewing zone.",
                    status="ACKNOWLEDGED",
                    created_at=now - timedelta(hours=1, minutes=20),
                ),
                SafetyAlert(
                    alert_id="ALT-8890",
                    zone_name="Zone C - Ground Trench & Excavation",
                    severity="MEDIUM",
                    event_type="MISSING_PPE",
                    worker_id="Worker #4",
                    violation_details="Worker #4 wearing non-reinforced athletic footwear near excavation trench edge.",
                    actionable_directive="EQUIPMENT REPLACEMENT: Replace with ASTM F2413 steel-toe puncture-resistant boots.",
                    status="RESOLVED",
                    created_at=now - timedelta(hours=3, minutes=45),
                    resolved_at=now - timedelta(hours=2, minutes=30),
                ),
            ]
            for sa in sample_alerts:
                session.add(sa)
            session.commit()

        # Seed initial realistic Milestone 3 claim and compliance record if empty
        first_claim = session.scalars(select(InsuranceClaimRecord)).first()
        if not first_claim:
            now = datetime.now(timezone.utc)
            sample_claim = InsuranceClaimRecord(
                claim_id="CLM-2026-B8910",
                incident_id="INC-2026-SCAF-01",
                zone_name="Zone B - Perimeter Scaffolding",
                loss_severity_score=78.5,
                severity_tier="HIGH EXPOSURE",
                total_estimated_financial_exposure=342500.0,
                workers_comp_reserve=140400.0,
                cgl_third_party_reserve=76440.0,
                statutory_osha_penalties=44102.0,
                legal_defense_reserve=70325.0,
                contractor_retained_loss=50000.0,
                net_insurer_exposure=292500.0,
                projected_emr=1.27,
                claim_status="CLAIM_READY",
                claim_dossier_markdown="""# FIRST NOTICE OF LOSS (FNOL) & CLAIM-READY INCIDENT DOSSIER
**HazardHawk AI — Autonomous Construction Claims Documentation System**
**Claim Reference ID:** `CLM-2026-B8910` | **Date of Occurrence:** 2026-11-19 14:30:00 UTC

### 1. INSURED & POLICY PARTICULARS
- **Named Insured:** Apex Structural Constructors LLC
- **Project Site:** Metro Tower Phase III - High-Rise Commercial Construction
- **Insurance Carrier:** Travelers / Zurich Commercial Construction Syndicate
- **Policy Number:** POL-CGL-2026-984210
- **Policy Coverage:** Commercial General Liability ($5,000,000) & Statutory Workers' Comp ($1,000,000)
- **Contractor Retained Deductible (SIR):** $50,000.00

### 2. INCIDENT OVERVIEW & OCCURRENCE LOCATION
- **Incident ID:** `INC-2026-SCAF-01`
- **Construction Sector:** Zone B - Perimeter Scaffolding (Level 7, +21.4m elevation)
- **Worker Involved:** Worker #3 (Rajeev Sharma - Steel Rigger)
- **Initial Observation:** Worker observed near unprotected perimeter edge without tied-off harness lanyard and missing ANSI Z89.1 hard hat.
- **Loss Severity Score:** **78.5/100** (HIGH EXPOSURE)

### 3. STATUTORY COMPLIANCE CHECKLIST VIOLATIONS
**Violation #1: Head Protection & Impact Hard Hats**
- **Statutory Standard:** `OSHA 29 CFR 1926.100(a)` | **ISO Clause:** `ISO 45001:2018 Cl. 8.1.2`
- **Infraction Details:** Missing mandatory HELMET while operating in Zone B - Perimeter Scaffolding.
- **Statutory Fine Base:** $16,131.00
- **Cryptographic Evidence SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

**Violation #2: Fall Protection on Elevated Scaffolding**
- **Statutory Standard:** `OSHA 29 CFR 1926.501(b)(1) & 1926.451(g)` | **ISO Clause:** `ISO 45001:2018 Cl. 6.1.2 & 8.1.2`
- **Infraction Details:** Missing mandatory HARNESS and BOOTS at elevation > 6ft.
- **Statutory Fine Base:** $16,131.00
- **Cryptographic Evidence SHA-256:** `4a53cee3fb02022449b294e7e40c009d3725fe702f3954e730e284f7d6da734e`

### 4. ACTUARIAL FINANCIAL EXPOSURE & LOSS RESERVES
- **Workers' Compensation Reserve (Medical/Lost Wages):** $140,400.00
- **Commercial General Liability Reserve (Third-Party):** $76,440.00
- **Statutory OSHA Regulatory Penalties:** $44,102.00
- **Legal Defense & Claims Investigation Reserve:** $70,325.00
- **Jobsite Stoppage / Delay Cost Estimate:** $45,000.00
- **TOTAL ESTIMATED FINANCIAL EXPOSURE:** **$342,500.00**

### 5. POLICY ALLOCATION & ADJUSTER INDEMNITY
- **Contractor Retained Loss (Under SIR Deductible):** $50,000.00
- **Net Insurer Indemnity Exposure:** **$292,500.00**
- **Projected EMR Rating Impact:** 1.00 ➔ **1.27 (+0.27)**
- **Estimated 3-Year Cumulative Premium Hike:** $230,850.00
""",
                created_at=now - timedelta(hours=2),
            )
            session.add(sample_claim)

            # Sample audit evidence
            session.add(
                AuditEvidenceRecord(
                    incident_id="INC-2026-SCAF-01",
                    check_id="CHK-OSHA-1926.100",
                    standard="OSHA 29 CFR 1926.100(a)",
                    zone_name="Zone B - Perimeter Scaffolding",
                    worker_id="Worker #3",
                    evidence_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    verification_status="VERIFIED",
                    confidence_score=0.96,
                    created_at=now - timedelta(hours=2),
                )
            )
            session.add(
                AuditEvidenceRecord(
                    incident_id="INC-2026-SCAF-01",
                    check_id="CHK-OSHA-1926.501",
                    standard="OSHA 29 CFR 1926.501(b)(1)",
                    zone_name="Zone B - Perimeter Scaffolding",
                    worker_id="Worker #3",
                    evidence_hash="4a53cee3fb02022449b294e7e40c009d3725fe702f3954e730e284f7d6da734e",
                    verification_status="VERIFIED",
                    confidence_score=0.94,
                    created_at=now - timedelta(hours=2),
                )
            )
            session.commit()

        # Seed initial realistic compliance violations with unique IDs if empty
        first_vio = session.scalars(select(ComplianceViolationRecord)).first()
        if not first_vio:
            now = datetime.now(timezone.utc)
            session.add(
                ComplianceViolationRecord(
                    violation_id="VIO-2026-SCAF-8910",
                    incident_id="INC-2026-SCAF-01",
                    zone_name="Zone B - Perimeter Scaffolding",
                    worker_id="Worker #3 (Rajeev Sharma)",
                    missing_ppe_json=json.dumps(["helmet"]),
                    mandatory_ppe_json=json.dumps(["helmet", "vest", "boots", "harness"]),
                    osha_standard="OSHA 29 CFR 1926.100(a)",
                    iso_clause="ISO 45001:2018 Cl. 8.1.2",
                    severity_tier="CRITICAL",
                    compliance_result="VIOLATION",
                    time_at_risk_minutes=45,
                    risk_escalation_factor=1.26,
                    statutory_fine_estimate=16131.0,
                    evidence_hash="ec6ce21799fb992122425e10ac6dfe4c34a21074e578a1bc4908ef9812903ab1",
                    remedial_directive="STOP ELEVATED WORK: Issue certified ANSI Z89.1 hard hat before re-entry.",
                    created_at=now - timedelta(hours=2),
                )
            )
            session.add(
                ComplianceViolationRecord(
                    violation_id="VIO-2026-SCAF-8911",
                    incident_id="INC-2026-SCAF-01",
                    zone_name="Zone B - Perimeter Scaffolding",
                    worker_id="Worker #3 (Rajeev Sharma)",
                    missing_ppe_json=json.dumps(["boots"]),
                    mandatory_ppe_json=json.dumps(["helmet", "vest", "boots", "harness"]),
                    osha_standard="OSHA 29 CFR 1926.96",
                    iso_clause="ISO 45001:2018 Cl. 8.1.2",
                    severity_tier="MEDIUM",
                    compliance_result="VIOLATION",
                    time_at_risk_minutes=45,
                    risk_escalation_factor=1.26,
                    statutory_fine_estimate=5800.0,
                    evidence_hash="6d073d2f992268d5e183964cd5f251bc89445100a7395018bdfec3349182348a",
                    remedial_directive="EQUIPMENT REMEDIATION: Replace footwear with ASTM F2413 protective boots.",
                    created_at=now - timedelta(hours=2),
                )
            )
            session.commit()


def register_user(
    email: str,
    password: str,
    full_name: str,
    role: str = "Worker",
    dob: str = "1994-08-15",
    age: int = 30,
    blood_group: str = "O+",
    mobile_no: str = "+91 98765 43210",
    designation: str = "Steel Rigger & Scaffolder",
    shift: str = "Morning Shift (07:00 AM - 03:30 PM)",
    timetable: str = "07:00 AM Toolbox briefing | 07:30 AM Scaffolding check | 12:30 PM Lunch | 15:00 PM Shift report",
    assigned_sector: str = "Zone B — Perimeter Scaffolding (Level 7)",
) -> dict:
    """Register a new worker or officer account with profile attributes."""
    clean_email = email.strip().lower()
    with SessionLocal() as session:
        existing = session.scalars(select(User).where(User.email == clean_email)).first()
        if existing:
            raise ValueError("An account with this email address already exists.")

        user = User(
            email=clean_email,
            full_name=full_name.strip(),
            hashed_password=hash_password(password),
            role=role.strip() or "Worker",
            dob=dob,
            age=age,
            blood_group=blood_group,
            mobile_no=mobile_no,
            designation=designation or role,
            shift=shift,
            timetable=timetable,
            assigned_sector=assigned_sector,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "dob": user.dob or "1994-08-15",
            "age": user.age or 30,
            "blood_group": user.blood_group or "O+",
            "mobile_no": user.mobile_no or "+91 98765 43210",
            "designation": user.designation or user.role,
            "shift": user.shift or "Morning Shift (07:00 AM - 03:30 PM)",
            "timetable": user.timetable or "07:00 AM Toolbox briefing | 07:30 AM Scaffolding check | 12:30 PM Lunch | 15:00 PM Shift report",
            "assigned_sector": user.assigned_sector or "Zone B — Perimeter Scaffolding (Level 7)",
            "created_at": user.created_at.isoformat(),
        }


def authenticate_user(email: str, password: str) -> dict:
    """Verify user credentials and return complete worker/officer profile."""
    clean_email = email.strip().lower()
    with SessionLocal() as session:
        user = session.scalars(select(User).where(User.email == clean_email)).first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password.")

        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "dob": getattr(user, "dob", "") or "1994-08-15",
            "age": getattr(user, "age", 30) or 30,
            "blood_group": getattr(user, "blood_group", "") or "O+",
            "mobile_no": getattr(user, "mobile_no", "") or "+91 98765 43210",
            "designation": getattr(user, "designation", "") or user.role,
            "shift": getattr(user, "shift", "") or "Morning Shift (07:00 AM - 03:30 PM)",
            "timetable": getattr(user, "timetable", "") or "07:00 AM Toolbox briefing | 07:30 AM Scaffolding check | 12:30 PM Lunch | 15:00 PM Shift report",
            "assigned_sector": getattr(user, "assigned_sector", "") or "Zone B — Perimeter Scaffolding (Level 7)",
            "created_at": user.created_at.isoformat(),
        }


def update_user_profile(email: str, profile_data: dict) -> dict:
    """Update profile details for an existing user."""
    clean_email = email.strip().lower()
    with SessionLocal() as session:
        user = session.scalars(select(User).where(User.email == clean_email)).first()
        if not user:
            raise ValueError("User not found.")

        if "full_name" in profile_data:
            user.full_name = profile_data["full_name"]
        if "dob" in profile_data:
            user.dob = profile_data["dob"]
        if "age" in profile_data:
            user.age = int(profile_data["age"])
        if "blood_group" in profile_data:
            user.blood_group = profile_data["blood_group"]
        if "mobile_no" in profile_data:
            user.mobile_no = profile_data["mobile_no"]
        if "designation" in profile_data:
            user.designation = profile_data["designation"]
        if "shift" in profile_data:
            user.shift = profile_data["shift"]
        if "timetable" in profile_data:
            user.timetable = profile_data["timetable"]
        if "assigned_sector" in profile_data:
            user.assigned_sector = profile_data["assigned_sector"]

        session.commit()
        session.refresh(user)
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "dob": user.dob,
            "age": user.age,
            "blood_group": user.blood_group,
            "mobile_no": user.mobile_no,
            "designation": user.designation,
            "shift": user.shift,
            "timetable": user.timetable,
            "assigned_sector": user.assigned_sector,
            "created_at": user.created_at.isoformat(),
        }


def create_worker_report(
    worker_name: str,
    worker_email: str,
    sector: str,
    report_type: str,
    notes: str,
    designation: str = "Field Worker",
    shift: str = "Morning Shift",
    severity: str = "LOW",
) -> dict:
    """Persist a submitted safety report from a worker."""
    with SessionLocal() as session:
        report = WorkerReport(
            worker_name=worker_name,
            worker_email=worker_email.strip().lower(),
            designation=designation,
            sector=sector,
            shift=shift,
            report_type=report_type,
            severity=severity,
            notes=notes,
            status="SUBMITTED",
        )
        session.add(report)
        session.commit()
        session.refresh(report)

        return {
            "id": report.id,
            "worker_name": report.worker_name,
            "worker_email": report.worker_email,
            "designation": report.designation,
            "sector": report.sector,
            "shift": report.shift,
            "report_type": report.report_type,
            "severity": report.severity,
            "notes": report.notes,
            "status": report.status,
            "created_at": report.created_at.isoformat(),
        }


def get_worker_reports(limit: int = 50, worker_email: str | None = None) -> list[dict]:
    """Retrieve submitted worker safety and hazard reports."""
    with SessionLocal() as session:
        query = select(WorkerReport).order_by(WorkerReport.created_at.desc()).limit(limit)
        if worker_email:
            query = query.where(WorkerReport.worker_email == worker_email.strip().lower())
        reports = session.scalars(query).all()

        return [
            {
                "id": r.id,
                "worker_name": r.worker_name,
                "worker_email": r.worker_email,
                "designation": r.designation,
                "sector": r.sector,
                "shift": r.shift,
                "report_type": r.report_type,
                "severity": r.severity,
                "notes": r.notes,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
            }
            for r in reports
        ]


def assess_and_save(
    hazard_severity: int,
    likelihood: int,
    worker_exposure: int,
    safety_compliance: int,
    mode: str = "manual",
    total_workers: int = 0,
    compliant_workers: int = 0,
    violations_count: int = 0,
    compliance_rate: float = 100.0,
) -> dict:
    """Run the Site Risk Agent workflow and persist its assessment to database."""
    report = run_site_risk_agent(
        hazard_severity=hazard_severity,
        likelihood=likelihood,
        worker_exposure=worker_exposure,
        safety_compliance=safety_compliance,
    )

    record = RiskAssessment(
        hazard_severity=hazard_severity,
        likelihood=likelihood,
        worker_exposure=worker_exposure,
        safety_compliance=safety_compliance,
        risk_score=report["risk_score"],
        risk_level=report["risk_level"],
        recommendation=report["recommendation"],
        mode=mode,
        total_workers=total_workers,
        compliant_workers=compliant_workers,
        violations_count=violations_count,
        compliance_rate=compliance_rate,
    )

    with SessionLocal() as session:
        session.add(record)
        session.commit()
        session.refresh(record)

        return {
            "id": record.id,
            "agent": report["agent"],
            "status": report["status"],
            "mode": record.mode,
            "risk_score": record.risk_score,
            "risk_level": record.risk_level,
            "recommendation": record.recommendation,
            "assessment_method": report["assessment_method"],
            "total_workers": record.total_workers,
            "compliant_workers": record.compliant_workers,
            "violations_count": record.violations_count,
            "compliance_rate": record.compliance_rate,
            "created_at": record.created_at.isoformat(),
        }


def save_cv_assessment(
    analysis_result: dict,
) -> dict:
    """Persist an automated or manual computer vision analysis into database."""
    inputs = analysis_result["assessment_inputs"]
    risk = analysis_result["risk_assessment"]

    record = RiskAssessment(
        hazard_severity=inputs["hazard_severity"],
        likelihood=inputs["likelihood"],
        worker_exposure=inputs["worker_exposure"],
        safety_compliance=inputs["safety_compliance"],
        risk_score=risk["risk_score"],
        risk_level=risk["risk_level"],
        recommendation=risk["recommendation"],
        mode=analysis_result.get("mode", "automated"),
        total_workers=analysis_result.get("total_workers", 0),
        compliant_workers=analysis_result.get("compliant_workers", 0),
        violations_count=analysis_result.get("violations_count", 0),
        compliance_rate=analysis_result.get("ppe_compliance_rate", 100.0),
    )

    with SessionLocal() as session:
        session.add(record)
        session.commit()
        session.refresh(record)

        return {
            "id": record.id,
            "mode": record.mode,
            "risk_score": record.risk_score,
            "risk_level": record.risk_level,
            "recommendation": record.recommendation,
            "total_workers": record.total_workers,
            "compliant_workers": record.compliant_workers,
            "violations_count": record.violations_count,
            "compliance_rate": record.compliance_rate,
            "created_at": record.created_at.isoformat(),
        }


def get_assessments(limit: int = 20) -> list[dict]:
    """Retrieve the most recent saved assessments."""
    if not 1 <= limit <= 100:
        raise ValueError("limit must be between 1 and 100.")

    with SessionLocal() as session:
        statement = (
            select(RiskAssessment)
            .order_by(RiskAssessment.id.desc())
            .limit(limit)
        )
        records = session.scalars(statement).all()

        return [
            {
                "id": record.id,
                "hazard_severity": record.hazard_severity,
                "likelihood": record.likelihood,
                "worker_exposure": record.worker_exposure,
                "safety_compliance": record.safety_compliance,
                "risk_score": record.risk_score,
                "risk_level": record.risk_level,
                "recommendation": record.recommendation,
                "mode": getattr(record, "mode", "manual") or "manual",
                "total_workers": getattr(record, "total_workers", 0) or 0,
                "compliant_workers": getattr(record, "compliant_workers", 0) or 0,
                "violations_count": getattr(record, "violations_count", 0) or 0,
                "compliance_rate": getattr(record, "compliance_rate", 100.0) or 100.0,
                "created_at": record.created_at.isoformat(),
            }
            for record in records
        ]


# ==========================================
# Milestone 2 Safety Intelligence & Alert Services
# ==========================================

def save_safety_alert(alert_dict: dict) -> dict:
    """Persist a generated safety alert into database."""
    with SessionLocal() as session:
        alert = SafetyAlert(
            alert_id=alert_dict["alert_id"],
            zone_name=alert_dict["zone_name"],
            severity=alert_dict.get("severity", "HIGH"),
            event_type=alert_dict.get("event_type", "MISSING_PPE"),
            worker_id=alert_dict.get("worker_id", "Worker #1"),
            violation_details=alert_dict["violation_details"],
            actionable_directive=alert_dict["actionable_directive"],
            status=alert_dict.get("status", "ACTIVE"),
        )
        session.add(alert)
        session.commit()
        session.refresh(alert)
        return {
            "id": alert.id,
            "alert_id": alert.alert_id,
            "zone_name": alert.zone_name,
            "severity": alert.severity,
            "event_type": alert.event_type,
            "worker_id": alert.worker_id,
            "violation_details": alert.violation_details,
            "actionable_directive": alert.actionable_directive,
            "status": alert.status,
            "created_at": alert.created_at.isoformat(),
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
        }


def get_safety_alerts(status_filter: str | None = None, limit: int = 50) -> list[dict]:
    """Retrieve safety alert history with optional status filter."""
    with SessionLocal() as session:
        statement = select(SafetyAlert).order_by(SafetyAlert.id.desc()).limit(limit)
        if status_filter and status_filter.upper() != "ALL":
            statement = select(SafetyAlert).where(SafetyAlert.status == status_filter.upper()).order_by(SafetyAlert.id.desc()).limit(limit)

        records = session.scalars(statement).all()
        return [
            {
                "id": r.id,
                "alert_id": r.alert_id,
                "zone_name": r.zone_name,
                "severity": r.severity,
                "event_type": r.event_type,
                "worker_id": r.worker_id,
                "violation_details": r.violation_details,
                "actionable_directive": r.actionable_directive,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
                "resolved_at": r.resolved_at.isoformat() if r.resolved_at else None,
            }
            for r in records
        ]


def update_alert_status(alert_id: str, new_status: str) -> dict:
    """Transition alert status (ACTIVE -> ACKNOWLEDGED -> RESOLVED)."""
    clean_status = new_status.upper().strip()
    if clean_status not in {"ACTIVE", "ACKNOWLEDGED", "RESOLVED", "STOP_WORK", "IN_PROGRESS"}:
        raise ValueError(f"Invalid status: {new_status}. Expected ACTIVE, ACKNOWLEDGED, RESOLVED, STOP_WORK, or IN_PROGRESS.")

    with SessionLocal() as session:
        alert = session.scalars(select(SafetyAlert).where(SafetyAlert.alert_id == alert_id)).first()
        if not alert:
            raise ValueError(f"Alert with ID {alert_id} not found.")

        alert.status = clean_status
        if clean_status == "RESOLVED":
            alert.resolved_at = datetime.now(timezone.utc)
        elif clean_status == "ACTIVE":
            alert.resolved_at = None

        session.commit()
        session.refresh(alert)
        return {
            "id": alert.id,
            "alert_id": alert.alert_id,
            "zone_name": alert.zone_name,
            "severity": alert.severity,
            "status": alert.status,
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
        }


def get_zone_safety_analytics() -> list[dict]:
    """Compile real-time safety metrics and hazard indices across all accident-prone sectors."""
    with SessionLocal() as session:
        alerts = session.scalars(select(SafetyAlert)).all()

    # Pre-calculated zone baseline stats
    zone_baselines = [
        {
            "zone_id": "ZONE_B_SCAFFOLD",
            "zone_name": "Zone B - Perimeter Scaffolding",
            "hazard_type": "High-Elevation Fall & Falling Debris",
            "workers_on_site": 8,
            "base_compliance": 87.5,
            "safety_index": 68,
            "risk_tier": "High / Immediate Action",
            "safety_rule": "Rule: Fall Protection & Scaffolding Tie-off",
            "osha_ref": "Rule: Fall Protection & Scaffolding Tie-off",
        },
        {
            "zone_id": "ZONE_A_CRANE",
            "zone_name": "Zone A - Tower Crane Sector",
            "hazard_type": "Machinery Swing Radius & Struck-by",
            "workers_on_site": 5,
            "base_compliance": 92.0,
            "safety_index": 82,
            "risk_tier": "Moderate",
            "safety_rule": "Rule: Crane Swing Radius Clearance",
            "osha_ref": "Rule: Crane Swing Radius Clearance",
        },
        {
            "zone_id": "ZONE_C_TRENCH",
            "zone_name": "Zone C - Ground Trench & Excavation",
            "hazard_type": "Cave-in Collapse & Subterranean Puncture",
            "workers_on_site": 6,
            "base_compliance": 95.0,
            "safety_index": 88,
            "risk_tier": "Low",
            "safety_rule": "Rule: Trench Shoring & Protective Box",
            "osha_ref": "Rule: Trench Shoring & Protective Box",
        },
        {
            "zone_id": "ZONE_D_SLAB",
            "zone_name": "Zone D - Concrete Slab Cast Floor 6",
            "hazard_type": "Rebar Impalement & Chemical Slurry Burns",
            "workers_on_site": 11,
            "base_compliance": 96.5,
            "safety_index": 91,
            "risk_tier": "Low",
            "safety_rule": "Rule: Rebar Mushroom Cap Protection",
            "osha_ref": "Rule: Rebar Mushroom Cap Protection",
        },
    ]

    # Map dynamic alert counts to each zone
    results = []
    for zb in zone_baselines:
        zone_alerts = [a for a in alerts if a.zone_name == zb["zone_name"]]
        active_alerts = [a for a in zone_alerts if a.status == "ACTIVE"]
        critical_alerts = [a for a in active_alerts if a.severity == "CRITICAL"]

        status = "NORMAL"
        if len(critical_alerts) > 0:
            status = "CRITICAL_STOP_WORK"
        elif len(active_alerts) > 0:
            status = "WARNING"

        results.append({
            **zb,
            "active_alert_count": len(active_alerts),
            "total_alert_history": len(zone_alerts),
            "zone_status": status,
        })

    return results


# =========================================================================
# Milestone 3 Compliance & Insurance Persistence Services
# =========================================================================

def save_compliance_record(record_data: dict) -> dict:
    """Persist compliance evaluation record and return dictionary."""
    with SessionLocal() as session:
        rec = ComplianceCheckRecord(
            incident_id=record_data["incident_id"],
            zone_name=record_data["zone_name"],
            worker_id=record_data.get("worker_id", "Worker #3"),
            overall_status=record_data.get("overall_status", "NON_COMPLIANT"),
            compliance_rate=float(record_data.get("compliance_rate", 0.0)),
            checks_evaluated=int(record_data.get("checks_evaluated", 0)),
            violations_count=int(record_data.get("violations_count", 0)),
            total_statutory_penalty=float(record_data.get("total_statutory_penalty_estimate", 0.0)),
            violations_json=json.dumps(record_data.get("violations", [])),
        )
        session.add(rec)
        session.commit()
        session.refresh(rec)
        return {
            "id": rec.id,
            "incident_id": rec.incident_id,
            "zone_name": rec.zone_name,
            "overall_status": rec.overall_status,
            "compliance_rate": rec.compliance_rate,
            "violations_count": rec.violations_count,
            "total_statutory_penalty": rec.total_statutory_penalty,
            "created_at": rec.created_at.isoformat(),
        }


def get_compliance_records(limit: int = 20) -> list[dict]:
    """Retrieve compliance evaluation records."""
    with SessionLocal() as session:
        records = session.scalars(
            select(ComplianceCheckRecord)
            .order_by(ComplianceCheckRecord.created_at.desc())
            .limit(limit)
        ).all()
        return [
            {
                "id": r.id,
                "incident_id": r.incident_id,
                "zone_name": r.zone_name,
                "worker_id": r.worker_id,
                "overall_status": r.overall_status,
                "compliance_rate": r.compliance_rate,
                "checks_evaluated": r.checks_evaluated,
                "violations_count": r.violations_count,
                "total_statutory_penalty": r.total_statutory_penalty,
                "violations": json.loads(r.violations_json or "[]"),
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ]


def save_audit_evidence_trail(trail_list: list[dict], incident_id: str) -> list[dict]:
    """Persist check-to-evidence audit items with cryptographic hashes."""
    saved_items = []
    with SessionLocal() as session:
        for item in trail_list:
            rec = AuditEvidenceRecord(
                incident_id=incident_id,
                check_id=item["check_id"],
                standard=item.get("standard", "OSHA 1926"),
                zone_name=item.get("zone_name", "Zone B - Perimeter Scaffolding"),
                worker_id=item.get("worker_id", "Worker #3"),
                evidence_hash=item.get("evidence_hash", "0" * 64),
                verification_status=item.get("verification_status", "VERIFIED"),
                confidence_score=float(item.get("confidence_score", 0.95)),
            )
            session.add(rec)
            session.commit()
            session.refresh(rec)
            saved_items.append({
                "id": rec.id,
                "incident_id": rec.incident_id,
                "check_id": rec.check_id,
                "standard": rec.standard,
                "evidence_hash": rec.evidence_hash,
                "verification_status": rec.verification_status,
                "created_at": rec.created_at.isoformat(),
            })
    return saved_items


def get_audit_evidence_trail(incident_id: str | None = None, limit: int = 50) -> list[dict]:
    """Retrieve audit evidence records with cryptographic hashes."""
    with SessionLocal() as session:
        query = select(AuditEvidenceRecord).order_by(AuditEvidenceRecord.created_at.desc()).limit(limit)
        if incident_id:
            query = query.where(AuditEvidenceRecord.incident_id == incident_id)
        records = session.scalars(query).all()
        return [
            {
                "id": r.id,
                "incident_id": r.incident_id,
                "check_id": r.check_id,
                "standard": r.standard,
                "zone_name": r.zone_name,
                "worker_id": r.worker_id,
                "evidence_hash": r.evidence_hash,
                "verification_status": r.verification_status,
                "confidence_score": r.confidence_score,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ]


def save_insurance_claim(claim_data: dict, incident_id: str, zone_name: str) -> dict:
    """Persist synthesized insurance claim and FNOL dossier."""
    with SessionLocal() as session:
        rec = InsuranceClaimRecord(
            claim_id=claim_data["claim_id"],
            incident_id=incident_id,
            zone_name=zone_name,
            loss_severity_score=float(claim_data.get("loss_severity_score", 75.0)),
            severity_tier=claim_data.get("severity_tier", "HIGH EXPOSURE"),
            total_estimated_financial_exposure=float(claim_data.get("total_estimated_financial_exposure", 0.0)),
            workers_comp_reserve=float(claim_data.get("workers_comp_reserve", 0.0)),
            cgl_third_party_reserve=float(claim_data.get("cgl_third_party_reserve", 0.0)),
            statutory_osha_penalties=float(claim_data.get("statutory_osha_penalties", 0.0)),
            legal_defense_reserve=float(claim_data.get("legal_defense_reserve", 0.0)),
            contractor_retained_loss=float(claim_data.get("contractor_deductible", 50000.0)),
            net_insurer_exposure=float(claim_data.get("net_insurer_exposure", 0.0)),
            projected_emr=float(claim_data.get("projected_emr", 1.25)),
            claim_status=claim_data.get("claim_status", "CLAIM_READY"),
            claim_dossier_markdown=claim_data.get("claim_dossier_markdown", ""),
        )
        session.add(rec)
        session.commit()
        session.refresh(rec)
        return {
            "id": rec.id,
            "claim_id": rec.claim_id,
            "incident_id": rec.incident_id,
            "zone_name": rec.zone_name,
            "loss_severity_score": rec.loss_severity_score,
            "total_estimated_financial_exposure": rec.total_estimated_financial_exposure,
            "net_insurer_exposure": rec.net_insurer_exposure,
            "projected_emr": rec.projected_emr,
            "claim_status": rec.claim_status,
            "created_at": rec.created_at.isoformat(),
        }


def get_insurance_claims(limit: int = 20) -> list[dict]:
    """Retrieve historical insurance claims and FNOL dossiers."""
    with SessionLocal() as session:
        claims = session.scalars(
            select(InsuranceClaimRecord)
            .order_by(InsuranceClaimRecord.created_at.desc())
            .limit(limit)
        ).all()
        return [
            {
                "id": c.id,
                "claim_id": c.claim_id,
                "incident_id": c.incident_id,
                "zone_name": c.zone_name,
                "loss_severity_score": c.loss_severity_score,
                "severity_tier": c.severity_tier,
                "total_estimated_financial_exposure": c.total_estimated_financial_exposure,
                "workers_comp_reserve": c.workers_comp_reserve,
                "cgl_third_party_reserve": c.cgl_third_party_reserve,
                "statutory_osha_penalties": c.statutory_osha_penalties,
                "legal_defense_reserve": c.legal_defense_reserve,
                "contractor_retained_loss": c.contractor_retained_loss,
                "net_insurer_exposure": c.net_insurer_exposure,
                "projected_emr": c.projected_emr,
                "claim_status": c.claim_status,
                "claim_dossier_markdown": c.claim_dossier_markdown,
                "created_at": c.created_at.isoformat(),
            }
            for c in claims
        ]


def get_insurance_claim_by_id(claim_id: str) -> dict | None:
    """Retrieve single claim dossier by claim ID."""
    with SessionLocal() as session:
        c = session.scalars(
            select(InsuranceClaimRecord).where(InsuranceClaimRecord.claim_id == claim_id)
        ).first()
        if not c:
            return None
        return {
            "id": c.id,
            "claim_id": c.claim_id,
            "incident_id": c.incident_id,
            "zone_name": c.zone_name,
            "loss_severity_score": c.loss_severity_score,
            "severity_tier": c.severity_tier,
            "total_estimated_financial_exposure": c.total_estimated_financial_exposure,
            "workers_comp_reserve": c.workers_comp_reserve,
            "cgl_third_party_reserve": c.cgl_third_party_reserve,
            "statutory_osha_penalties": c.statutory_osha_penalties,
            "legal_defense_reserve": c.legal_defense_reserve,
            "contractor_retained_loss": c.contractor_retained_loss,
            "net_insurer_exposure": c.net_insurer_exposure,
            "projected_emr": c.projected_emr,
            "claim_status": c.claim_status,
            "claim_dossier_markdown": c.claim_dossier_markdown,
            "created_at": c.created_at.isoformat(),
        }


# =========================================================================
# Unique Violation Storage & Retrieval Services (Mentor Question 1-4)
# =========================================================================

def save_compliance_violations(
    violations_list: list[dict],
    incident_id: str,
    zone_name: str,
    worker_id: str = "Worker #1",
    time_at_risk_minutes: int = 45,
    risk_escalation_factor: float = 1.25,
) -> list[dict]:
    """Persist individual PPE violation records with unique IDs and time-at-risk."""
    saved_records = []
    with SessionLocal() as session:
        for v in violations_list:
            vio_id = v.get("violation_id") or f"VIO-{datetime.now(timezone.utc).strftime('%y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
            rec = ComplianceViolationRecord(
                violation_id=vio_id,
                incident_id=incident_id,
                zone_name=zone_name,
                worker_id=worker_id,
                missing_ppe_json=json.dumps(v.get("missing_ppe", [])),
                mandatory_ppe_json=json.dumps(v.get("mandatory_ppe", [])),
                osha_standard=v.get("standard", "OSHA 29 CFR 1926.100(a)"),
                iso_clause=v.get("iso_clause", "ISO 45001:2018 Cl. 8.1.2"),
                severity_tier=v.get("severity", "HIGH"),
                compliance_result=v.get("compliance_result", "VIOLATION"),
                time_at_risk_minutes=int(v.get("time_at_risk_minutes", time_at_risk_minutes)),
                risk_escalation_factor=float(v.get("risk_escalation_factor", risk_escalation_factor)),
                statutory_fine_estimate=float(v.get("statutory_penalty_estimate", 16131.0)),
                evidence_hash=v.get("evidence_hash", "0" * 64),
                remedial_directive=v.get("remedial_statute_action", "Immediate equipment remediation required."),
            )
            session.add(rec)
            session.commit()
            session.refresh(rec)
            saved_records.append({
                "id": rec.id,
                "violation_id": rec.violation_id,
                "incident_id": rec.incident_id,
                "zone_name": rec.zone_name,
                "worker_id": rec.worker_id,
                "missing_ppe": json.loads(rec.missing_ppe_json or "[]"),
                "mandatory_ppe": json.loads(rec.mandatory_ppe_json or "[]"),
                "osha_standard": rec.osha_standard,
                "iso_clause": rec.iso_clause,
                "severity_tier": rec.severity_tier,
                "compliance_result": rec.compliance_result,
                "time_at_risk_minutes": rec.time_at_risk_minutes,
                "risk_escalation_factor": rec.risk_escalation_factor,
                "statutory_fine_estimate": rec.statutory_fine_estimate,
                "evidence_hash": rec.evidence_hash,
                "remedial_directive": rec.remedial_directive,
                "created_at": rec.created_at.isoformat(),
            })
    return saved_records


def get_compliance_violations(limit: int = 50, zone_name: str | None = None) -> list[dict]:
    """Retrieve all stored PPE violations."""
    with SessionLocal() as session:
        query = select(ComplianceViolationRecord).order_by(ComplianceViolationRecord.created_at.desc()).limit(limit)
        if zone_name:
            query = query.where(ComplianceViolationRecord.zone_name.ilike(f"%{zone_name}%"))
        records = session.scalars(query).all()
        return [
            {
                "id": r.id,
                "violation_id": r.violation_id,
                "incident_id": r.incident_id,
                "zone_name": r.zone_name,
                "worker_id": r.worker_id,
                "missing_ppe": json.loads(r.missing_ppe_json or "[]"),
                "mandatory_ppe": json.loads(r.mandatory_ppe_json or "[]"),
                "osha_standard": r.osha_standard,
                "iso_clause": r.iso_clause,
                "severity_tier": r.severity_tier,
                "compliance_result": r.compliance_result,
                "time_at_risk_minutes": r.time_at_risk_minutes,
                "risk_escalation_factor": r.risk_escalation_factor,
                "statutory_fine_estimate": r.statutory_fine_estimate,
                "evidence_hash": r.evidence_hash,
                "remedial_directive": r.remedial_directive,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ]


def get_compliance_violation_by_id(violation_id: str) -> dict | None:
    """Retrieve a single violation by its Unique ID (e.g. VIO-2026-SCAF-8910)."""
    with SessionLocal() as session:
        r = session.scalars(
            select(ComplianceViolationRecord).where(
                ComplianceViolationRecord.violation_id.ilike(violation_id.strip())
            )
        ).first()
        if not r:
            return None
        return {
            "id": r.id,
            "violation_id": r.violation_id,
            "incident_id": r.incident_id,
            "zone_name": r.zone_name,
            "worker_id": r.worker_id,
            "missing_ppe": json.loads(r.missing_ppe_json or "[]"),
            "mandatory_ppe": json.loads(r.mandatory_ppe_json or "[]"),
            "osha_standard": r.osha_standard,
            "iso_clause": r.iso_clause,
            "severity_tier": r.severity_tier,
            "compliance_result": r.compliance_result,
            "time_at_risk_minutes": r.time_at_risk_minutes,
            "risk_escalation_factor": r.risk_escalation_factor,
            "statutory_fine_estimate": r.statutory_fine_estimate,
            "evidence_hash": r.evidence_hash,
            "remedial_directive": r.remedial_directive,
            "created_at": r.created_at.isoformat(),
        }


def get_incident_violations(incident_id: str) -> list[dict]:
    """Retrieve all violations associated with a specific incident ID."""
    with SessionLocal() as session:
        records = session.scalars(
            select(ComplianceViolationRecord)
            .where(ComplianceViolationRecord.incident_id.ilike(incident_id.strip()))
            .order_by(ComplianceViolationRecord.created_at.asc())
        ).all()
        return [
            {
                "id": r.id,
                "violation_id": r.violation_id,
                "incident_id": r.incident_id,
                "zone_name": r.zone_name,
                "worker_id": r.worker_id,
                "missing_ppe": json.loads(r.missing_ppe_json or "[]"),
                "mandatory_ppe": json.loads(r.mandatory_ppe_json or "[]"),
                "osha_standard": r.osha_standard,
                "iso_clause": r.iso_clause,
                "severity_tier": r.severity_tier,
                "compliance_result": r.compliance_result,
                "time_at_risk_minutes": r.time_at_risk_minutes,
                "risk_escalation_factor": r.risk_escalation_factor,
                "statutory_fine_estimate": r.statutory_fine_estimate,
                "evidence_hash": r.evidence_hash,
                "remedial_directive": r.remedial_directive,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ]


