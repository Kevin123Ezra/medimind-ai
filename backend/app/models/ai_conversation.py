from sqlalchemy import Column, String, Text, Boolean, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class AIConversation(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a clinical chat session thread with the virtual doctor/AI.
    """
    __tablename__ = "ai_conversations"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=True)                      # e.g., "Flu symptom checker" or "Insulin dose query"
    summary = Column(Text, nullable=True)                          # Summarized context of the health consult thread
    is_archived = Column(Boolean(), default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="ai_conversations")
    messages = relationship("ChatHistory", back_populates="conversation", cascade="all, delete-orphan")
