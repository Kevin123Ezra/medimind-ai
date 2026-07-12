import jwt
from typing import Optional, Dict, Any
from backend.app.core.config import settings
from backend.app.services.base import BaseService


class FirebaseService(BaseService):
    """
    Service to verify Firebase Authentication ID tokens.
    Uses Google's public JWK certificates to verify RS256 cryptographic signatures.
    """
    def verify_id_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verifies a Firebase ID token.
        
        To simplify testing and prevent developer blockages, we support:
        1. Mock development bypass: tokens starting with "mock_firebase_token_" are accepted as verified.
        2. Real validation: RS256 signature, audience, and issuer verification using Google public keys.
        """
        # 1. Developer-friendly mock bypass
        if id_token.startswith("mock_firebase_token_"):
            email = id_token.replace("mock_firebase_token_", "").strip()
            if not email or "@" not in email:
                email = "firebase_user@example.com"
            
            self.logger.info("Verifying mock Firebase ID token for: %s", email)
            return {
                "uid": f"mock-firebase-uid-{email}",
                "email": email,
                "email_verified": True,
                "name": email.split("@")[0].capitalize(),
            }

        # 2. Real validation using Google public keys
        project_id = settings.FIREBASE_PROJECT_ID
        if not project_id:
            self.logger.warning(
                "FIREBASE_PROJECT_ID is not configured. Falling back to signature-skipped decoding for debugging."
            )
            try:
                # Fallback unverified decode for development if real tokens are sent without server config
                unverified = jwt.decode(id_token, options={"verify_signature": False})
                return {
                    "uid": unverified.get("sub"),
                    "email": unverified.get("email"),
                    "email_verified": unverified.get("email_verified", True),
                    "name": unverified.get("name", ""),
                }
            except Exception as e:
                self.logger.error("Failed fallback unverified decode: %s", str(e))
                return None

        try:
            jwk_client = jwt.PyJWKClient(
                "https://www.googleapis.com/robot/v1/metadata/jwk/securetoken-system@system.gserviceaccount.com"
            )
            signing_key = jwk_client.get_signing_key_from_jwt(id_token)
            payload = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=["RS256"],
                audience=project_id,
                issuer=f"https://securetoken.google.com/{project_id}"
            )
            return {
                "uid": payload.get("sub"),
                "email": payload.get("email"),
                "email_verified": payload.get("email_verified", False),
                "name": payload.get("name", ""),
            }
        except Exception as e:
            self.logger.error("Real Firebase token verification failed: %s", str(e))
            return None


firebase_service = FirebaseService()
