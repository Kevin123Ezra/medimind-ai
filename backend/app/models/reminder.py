from sqlalchemy import Column, String, Time, Boolean, ForeignKey, Uuid, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class Reminder(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a notification alarm reminder for pills, vitals, or appointments.
    """
    __tablename__ = "reminders"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    medication_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("medications.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title = Column(String(255), nullable=False)
    reminder_type = Column(String(100), nullable=False)           # e.g., Medication, Blood Pressure, Appointment
    reminder_time = Column(Time, nullable=False)                  # e.g., 08:30:00 (Daily medicine time)
    recurrence = Column(String(100), default="DAILY", nullable=False) # e.g., DAILY, WEEKDAYS, WEEKLY, custom
    is_enabled = Column(Boolean(), default=True, nullable=False)
    last_triggered_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="reminders")
    medication = relationship("Medication", back_populates="reminders")
