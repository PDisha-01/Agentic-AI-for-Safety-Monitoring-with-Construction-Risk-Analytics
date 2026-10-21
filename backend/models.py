from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
