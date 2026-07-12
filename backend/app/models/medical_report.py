from sqlalchemy import Column, String, Text, Date, ForeignKey, Uuid, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class MedicalReport(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a Patient's Medical Report or clinical document.
    """
    __tablename__ = "medical_reports"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    report_type = Column(String(100), nullable=False, index=True)  # e.g., Lab Result, MRI Scan, Prescription
    file_url = Column(String(1024), nullable=True)                  # URL path in Cloud Storage bucket
    doctor_name = Column(String(255), nullable=True)
    facility = Column(String(255), nullable=True)
    report_date = Column(Date, nullable=True)
    extracted_text = Column(Text, nullable=True)
    structured_json = Column(JSON, nullable=True)

    # Relationships
    user = relationship("User", back_populates="medical_reports")
