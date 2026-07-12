from typing import Optional
from sqlalchemy.orm import Session
from backend.app.core.security import verify_password
from backend.app.models.user import User
from backend.app.repositories.user_repository import user_repository
from backend.app.services.base import BaseService


class AuthService(BaseService):
    def authenticate(
        self, db: Session, *, email: str, password: str
    ) -> Optional[User]:
        """
        Verify credentials. Returns User if valid, else None.
        Business logic is ready to be expanded here as needed.
        """
        self.logger.info("Attempting authentication for email: %s", email)
        user = user_repository.get_by_email(db, email=email)
        if not user:
            self.logger.warning("Authentication failed: User with email %s not found", email)
            return None
        if not verify_password(password, user.hashed_password):
            self.logger.warning("Authentication failed: Incorrect password for user %s", email)
            return None
        self.logger.info("Authentication succeeded for email: %s", email)
        return user


auth_service = AuthService()
