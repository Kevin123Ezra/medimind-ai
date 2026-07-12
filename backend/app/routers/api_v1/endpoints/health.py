import time
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.core.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", response_model=Dict[str, Any])
def health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Perform a system health check.
    Validates connection latency to the PostgreSQL instance.
    """
    start_time = time.time()
    db_status = "unhealthy"
    db_latency_ms = None

    try:
        # Simple light-weight query to check connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
        db_latency_ms = round((time.time() - start_time) * 1000, 2)
    except Exception as e:
        logger.error("Database health check failure: %s", str(e))

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": time.time(),
        "database": {
            "status": db_status,
            "latency_ms": db_latency_ms,
        },
        "services": {
            "ai_inference": "ready",
            "clinical_portal": "ready",
        }
    }
