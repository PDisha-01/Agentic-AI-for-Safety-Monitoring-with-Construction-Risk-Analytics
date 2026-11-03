from datetime import datetime, timedelta, timezone
from sqlalchemy import select, text

from backend.auth import hash_password, verify_password
from backend.database import Base, SessionLocal, engine
from backend.models import RiskAssessment, SafetyAlert, User, WorkerReport
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
