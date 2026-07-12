from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class Appointment(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a patient's scheduled clinical check-up or telehealth session.
    """
    __tablename__ = "appointments"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    doctor_name = Column(String(255), nullable=False)
    specialty = Column(String(100), nullable=True)                  # e.g., Cardiologist, General Practitioner
    facility_name = Column(String(255), nullable=True)              # e.g., St. Mary's Health Center
    facility_address = Column(Text, nullable=True)
    appointment_date = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(50), default="scheduled", nullable=False) # e.g., scheduled, completed, cancelled, no_show
    notes = Column(Text, nullable=True)                             # e.g., "Bring historic insulin logs"

    # Relationships
    user = relationship("User", back_populates="appointments")
