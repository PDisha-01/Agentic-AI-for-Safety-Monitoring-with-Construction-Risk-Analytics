from sqlalchemy import select

from backend.database import Base, SessionLocal, engine
from backend.models import RiskAssessment
from src.site_risk_agent import run_site_risk_agent


def initialize_database() -> None:
    """Create database tables if they do not already exist."""
    Base.metadata.create_all(bind=engine)


def assess_and_save(
    hazard_severity: int,
    likelihood: int,
    worker_exposure: int,
    safety_compliance: int,
) -> dict:
    """Run the agent and persist its assessment."""
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
    )

    with SessionLocal() as session:
        session.add(record)
        session.commit()
        session.refresh(record)

        return {
            "id": record.id,
            "agent": report["agent"],
            "status": report["status"],
            "risk_score": record.risk_score,
            "risk_level": record.risk_level,
            "recommendation": record.recommendation,
            "assessment_method": report["assessment_method"],
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
                "created_at": record.created_at.isoformat(),
            }
            for record in records
        ]
