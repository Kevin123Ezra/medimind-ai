import uuid
import jwt
from datetime import timedelta, datetime, timezone
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
)
from backend.app.dependencies import get_current_user, get_current_active_user
from backend.app.models.user import User
from backend.app.repositories.user_repository import user_repository
from backend.app.schemas.user import UserResponse, UserCreate
from backend.app.schemas.token import Token
from backend.app.services.auth_service import auth_service
from backend.app.services.token_blacklist_service import token_blacklist_service
from backend.app.services.firebase_service import firebase_service

router = APIRouter()


# Request Schemas
class LoginJSONRequest(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class FirebaseLoginRequest(BaseModel):
    id_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class EmailVerificationConfirm(BaseModel):
    token: str


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(db: Session = Depends(get_db), *, user_in: UserCreate) -> Any:
    """
    Register a new user in the MediMind system.
    Returns the newly created user profile.
    """
    user = user_repository.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists in the system.",
        )
    
    # Create the user with patient role by default
    new_user = user_repository.create(db, obj_in=user_in)
    return new_user


@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible form-based login.
    Returns access and refresh tokens.
    """
    user = auth_service.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/login/json", response_model=Token)
def login_json(
    db: Session = Depends(get_db), *, login_in: LoginJSONRequest
) -> Any:
    """
    JSON payload compatible login (email & password in JSON body).
    Returns access and refresh tokens.
    """
    user = auth_service.authenticate(
        db, email=login_in.email, password=login_in.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
    db: Session = Depends(get_db), *, refresh_in: TokenRefreshRequest
) -> Any:
    """
    Validate refresh token and issue a new set of Access and Refresh tokens.
    Provides complete token rotation for optimal session security.
    """
    try:
        payload = decode_token(refresh_in.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid token type. Refresh token required.",
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token payload missing subject identifier.",
            )
        user_uuid = uuid.UUID(user_id)
    except (jwt.PyJWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate refresh token.",
        )
        
    user = user_repository.get(db, id=user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user."
        )
        
    # Optional/Recommended: Blacklist used refresh token to prevent reuse (Token Rotation)
    token_blacklist_service.blacklist_token(refresh_in.refresh_token)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/logout")
def logout(
    token: str = Header(None, alias="Authorization"),
    refresh_token: Optional[str] = None
) -> Any:
    """
    Revoke current active tokens by blacklisting them.
    Protects stateless sessions from hijacking after logouts.
    """
    if token and token.startswith("Bearer "):
        access_token = token.split(" ")[1]
        token_blacklist_service.blacklist_token(access_token)
        
    if refresh_token:
        token_blacklist_service.blacklist_token(refresh_token)
        
    return {"message": "Successfully logged out. Tokens have been revoked."}


@router.post("/firebase-login", response_model=Token)
def firebase_login(
    db: Session = Depends(get_db), *, firebase_in: FirebaseLoginRequest
) -> Any:
    """
    Authenticate via Firebase ID Token.
    1. Verifies the ID Token with Google certificates.
    2. Synchronizes/creates the local user account seamlessly.
    3. Issues backend JWT Access and Refresh tokens for the session.
    """
    payload = firebase_service.verify_id_token(firebase_in.id_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID Token.",
        )
        
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firebase token is missing an email address claim.",
        )
        
    # Check if user already exists
    user = user_repository.get_by_email(db, email=email)
    if not user:
        # Generate a random secure password since they log in via social/federated provider
        random_password = str(uuid.uuid4()) + "S0cial!"
        name_parts = payload.get("name", "").split(" ", 1)
        first_name = name_parts[0] if len(name_parts) > 0 else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        user_in = UserCreate(
            email=email,
            password=random_password,
            first_name=first_name,
            last_name=last_name,
            is_verified=payload.get("email_verified", True),
            role="patient",
        )
        user = user_repository.create(db, obj_in=user_in)
    else:
        # If logging in for the first time via social provider, make sure we mark verified
        if not user.is_verified and payload.get("email_verified", False):
            user.is_verified = True
            db.add(user)
            db.commit()
            db.refresh(user)
            
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
        "token_type": "bearer",
    }


# Password Reset Placeholders (Fully Functional local simulation)
@router.post("/password-reset-request")
def password_reset_request(
    db: Session = Depends(get_db), *, reset_in: PasswordResetRequest
) -> Any:
    """
    Simulated Password Reset Request.
    Generates a secure short-lived reset token and prints the reset URL in logs.
    """
    user = user_repository.get_by_email(db, email=reset_in.email)
    if not user:
        # Return success even if email not found to avoid account enumeration attacks
        return {"message": "If the email is registered, a password reset link has been sent."}
        
    # Create reset token (valid for 15 minutes)
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(user.id), "type": "password_reset"}
    reset_token = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    
    # Print the simulated link in logs for debugging
    simulated_link = f"https://medimind.ai/reset-password?token={reset_token}"
    print(f"\n[SIMULATED EMAIL] Password Reset Link for {user.email}: {simulated_link}\n")
    
    return {
        "message": "If the email is registered, a password reset link has been sent.",
        "simulated_link_for_dev": simulated_link,  # Convenient for testing the flow
    }


@router.post("/password-reset")
def password_reset_confirm(
    db: Session = Depends(get_db), *, confirm_in: PasswordResetConfirm
) -> Any:
    """
    Confirm password reset.
    Validates the password reset token and changes the password.
    """
    try:
        payload = jwt.decode(
            confirm_in.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type.",
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is missing subject.",
            )
        user_uuid = uuid.UUID(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link has expired.",
        )
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset token is invalid.",
        )
        
    user = user_repository.get(db, id=user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
        
    # Reset password
    user.hashed_password = get_password_hash(confirm_in.new_password)
    db.add(user)
    db.commit()
    
    return {"message": "Password has been successfully updated. You may now log in."}


# Email Verification Placeholders (Fully Functional local simulation)
@router.post("/verify-email-request")
def email_verification_request(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Request Email Verification.
    Generates a secure email-verification token and prints the verification URL in logs.
    """
    if current_user.is_verified:
        return {"message": "Email is already verified."}
        
    # Create verification token (valid for 24 hours)
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode = {"exp": expire, "sub": str(current_user.id), "type": "email_verification"}
    verification_token = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    
    # Print the simulated link in logs for debugging
    simulated_link = f"https://medimind.ai/verify-email?token={verification_token}"
    print(f"\n[SIMULATED EMAIL] Email Verification Link for {current_user.email}: {simulated_link}\n")
    
    return {
        "message": "Verification link has been simulated. Check backend terminal logs.",
        "simulated_link_for_dev": simulated_link,  # Convenient for testing the flow
    }


@router.post("/verify-email")
def verify_email_confirm(
    db: Session = Depends(get_db), *, confirm_in: EmailVerificationConfirm
) -> Any:
    """
    Confirm email verification.
    Validates token and updates user verification status.
    """
    try:
        payload = jwt.decode(
            confirm_in.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "email_verification":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type.",
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is missing subject.",
            )
        user_uuid = uuid.UUID(user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The verification link has expired.",
        )
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The verification token is invalid.",
        )
        
    user = user_repository.get(db, id=user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
        
    # Mark verified
    user.is_verified = True
    db.add(user)
    db.commit()
    
    return {"message": "Email has been successfully verified."}


@router.post("/test-token", response_model=UserResponse)
def test_token(current_user: User = Depends(get_current_active_user)) -> Any:
    """
    Test access token validity by returning current authenticated user details.
    """
    return current_user
