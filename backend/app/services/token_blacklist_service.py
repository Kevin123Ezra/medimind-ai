import datetime
from typing import Set
from backend.app.services.base import BaseService


class TokenBlacklistService(BaseService):
    """
    Service to handle revoking of access/refresh tokens.
    Uses an in-memory set to store logged-out token signatures, preventing reuse.
    """
    def __init__(self) -> None:
        super().__init__()
        self._blacklist: Set[str] = set()

    def blacklist_token(self, token: str) -> None:
        """Add a token to the blacklist."""
        self._blacklist.add(token)
        self.logger.info("Successfully blacklisted token.")

    def is_token_blacklisted(self, token: str) -> bool:
        """Check if a token has been blacklisted/revoked."""
        return token in self._blacklist


token_blacklist_service = TokenBlacklistService()
