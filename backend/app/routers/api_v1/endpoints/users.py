from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.dependencies import (
    get_current_active_superuser,
    get_current_active_user,
    RoleChecker,
)
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserResponse, UserUpdate
from backend.app.repositories.user_repository import user_repository

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Get the profile details of the current logged-in user."""
    return current_user


@router.get("/clinical-access", response_model=UserResponse)
def test_clinical_role_access(
    current_user: User = Depends(RoleChecker(["doctor", "admin"]))
) -> Any:
    """
    Endpoint restricted to clinical staff (Doctors and Administrators).
    Returns the authenticated clinical user's details.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Update profile details of the current logged-in user."""
    user = user_repository.update(db, db_obj=current_user, obj_in=user_in)
    return user


@router.post("/register", response_model=UserResponse)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """Register a new patient/user account."""
    user = user_repository.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this username/email already exists in the system.",
        )
    user = user_repository.create(db, obj_in=user_in)
    return user


@router.get("", response_model=List[UserResponse])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve all system user profiles.
    Restricted to Admin/Superuser access.
    """
    users = user_repository.get_multi(db, skip=skip, limit=limit)
    return users
