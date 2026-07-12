from fastapi import APIRouter
from backend.app.routers.api_v1.endpoints import auth, users, health, medical_reports, assistant

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(medical_reports.router, prefix="/medical-reports", tags=["medical-reports"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
