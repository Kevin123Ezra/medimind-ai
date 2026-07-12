from sqlalchemy import Column, String, Text, Integer, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin


class ChatHistory(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, AuditMixin):
    """
    SQLAlchemy Database Model representing a single chat message sent/received in a consult session.
    """
    __tablename__ = "chat_history"

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ai_conversation_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("ai_conversations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    sender = Column(String(50), nullable=False)                    # e.g., "user", "assistant", "system"
    message = Column(Text, nullable=False)
    message_type = Column(String(50), default="text", nullable=False) # e.g., "text", "voice", "rich_card"
    tokens_used = Column(Integer, nullable=True)                  # Used for monitoring model utilization

    # Relationships
    user = relationship("User", back_populates="chats")
    conversation = relationship("AIConversation", back_populates="messages")
