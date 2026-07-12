import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Uuid
from sqlalchemy.orm import declarative_base

class UUIDPrimaryKeyMixin:
    """Mixin to add a UUID primary key to models."""
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )

class TimestampMixin:
    """A mixin to add standard creation and update tracking timestamps to models."""
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

class SoftDeleteMixin:
    """Mixin to add soft delete capability to models."""
    deleted_at = Column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

class AuditMixin:
    """Mixin to add auditing metadata (who created and updated the record)."""
    created_by = Column(
        Uuid(as_uuid=True),
        nullable=True,
    )
    updated_by = Column(
        Uuid(as_uuid=True),
        nullable=True,
    )
