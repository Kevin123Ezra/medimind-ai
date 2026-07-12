from sqlalchemy import Column, String, Boolean, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class EmergencyContact(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a Patient's next of kin or emergency representative contact.
    """
    __tablename__ = "emergency_contacts"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=False)             # e.g., Spouse, Parent, Child, Doctor
    phone_number = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    is_primary = Column(Boolean(), default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="emergency_contacts")
