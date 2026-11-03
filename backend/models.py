from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="Safety Officer", nullable=False)

    # Worker Personal Profile Fields
    dob: Mapped[str | None] = mapped_column(String(20), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True)
    mobile_no: Mapped[str | None] = mapped_column(String(25), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    shift: Mapped[str | None] = mapped_column(String(50), nullable=True)
    timetable: Mapped[str | None] = mapped_column(Text, nullable=True)
    assigned_sector: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hazard_severity: Mapped[int] = mapped_column(Integer, nullable=False)
    likelihood: Mapped[int] = mapped_column(Integer, nullable=False)
    worker_exposure: Mapped[int] = mapped_column(Integer, nullable=False)
    safety_compliance: Mapped[int] = mapped_column(Integer, nullable=False)

    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    recommendation: Mapped[str] = mapped_column(String(255), nullable=False)

    # Automated computer vision metrics
    mode: Mapped[str] = mapped_column(String(20), default="manual", nullable=True)
    total_workers: Mapped[int] = mapped_column(Integer, default=0, nullable=True)
    compliant_workers: Mapped[int] = mapped_column(Integer, default=0, nullable=True)
    violations_count: Mapped[int] = mapped_column(Integer, default=0, nullable=True)
    compliance_rate: Mapped[float] = mapped_column(Float, default=100.0, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class SafetyAlert(Base):
    __tablename__ = "safety_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    alert_id: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    zone_name: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="HIGH", nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), default="MISSING_PPE", nullable=False)
    worker_id: Mapped[str] = mapped_column(String(50), default="Worker #1", nullable=False)
    violation_details: Mapped[str] = mapped_column(String(255), nullable=False)
    actionable_directive: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class WorkerReport(Base):
    __tablename__ = "worker_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    worker_name: Mapped[str] = mapped_column(String(100), nullable=False)
    worker_email: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    designation: Mapped[str] = mapped_column(String(100), default="Field Worker", nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    shift: Mapped[str] = mapped_column(String(50), default="Morning Shift", nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), default="Daily Safety Status", nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="LOW", nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="SUBMITTED", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
