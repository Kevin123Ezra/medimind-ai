from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class HealthMetric(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a user health reading or vital stat.
    """
    __tablename__ = "health_metrics"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric_type = Column(String(100), nullable=False, index=True) # e.g., BloodPressure, BloodGlucose, HeartRate, Weight
    value_numeric = Column(Float, nullable=True)                  # e.g., 125.5
    value_string = Column(String(255), nullable=True)             # e.g., "120/80" (for blood pressure)
    unit = Column(String(50), nullable=True)                      # e.g., "mmHg", "mg/dL", "bpm", "kg"
    recorded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    source = Column(String(100), default="manual", nullable=False) # e.g., manual, fitbit, apple_health, medical_device

    # Relationships
    user = relationship("User", back_populates="health_metrics")
