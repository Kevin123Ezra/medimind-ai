from sqlalchemy import Column, String, Text, Date, Boolean, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class Medication(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a Medication prescribed to a patient.
    """
    __tablename__ = "medications"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False, index=True)
    dosage = Column(String(100), nullable=False)                  # e.g., 500mg, 2 puffs
    frequency = Column(String(100), nullable=False)               # e.g., Once daily, Every 8 hours
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    instructions = Column(Text, nullable=True)                     # e.g., "Take after meals"
    is_active = Column(Boolean(), default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="medications")
    reminders = relationship("Reminder", back_populates="medication", cascade="all, delete-orphan")
