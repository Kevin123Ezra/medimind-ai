import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.logging_config import setup_logging
from backend.app.routers.api_v1.api import api_router

# Configure application-wide logging system
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade clean-architecture FastAPI backend for MediMind AI",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Relaxed defaults for quick development environment sync with frontends
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Custom request-response logger middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    method = request.method
    
    # Log incoming request basic telemetry
    logger.info("Incoming Request: %s %s", method, path)
    
    try:
        response = await call_next(request)
        process_time = round((time.time() - start_time) * 1000, 2)
        
        # Log response status and completion latency
        logger.info(
            "Completed Request: %s %s - Status: %d - Latency: %s ms",
            method,
            path,
            response.status_code,
            process_time
        )
        return response
    except Exception as exc:
        process_time = round((time.time() - start_time) * 1000, 2)
        logger.error(
            "Request Failed: %s %s - Latency: %s ms - Error: %s",
            method,
            path,
            process_time,
            str(exc)
        )
        raise exc


# Register main v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def ensure_columns_exist():
    from sqlalchemy import text
    from backend.app.core.database import SessionLocal
    db = SessionLocal()
    try:
        # Check if columns exist
        result = db.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='medical_reports' AND column_name IN ('extracted_text', 'structured_json');"
        )).fetchall()
        
        found_columns = {row[0] for row in result}
        
        if 'extracted_text' not in found_columns:
            db.execute(text("ALTER TABLE medical_reports ADD COLUMN extracted_text TEXT NULL;"))
            db.commit()
            logger.info("Added column 'extracted_text' to 'medical_reports' table.")
            
        if 'structured_json' not in found_columns:
            db.execute(text("ALTER TABLE medical_reports ADD COLUMN structured_json JSON NULL;"))
            db.commit()
            logger.info("Added column 'structured_json' to 'medical_reports' table.")
            
    except Exception as e:
        logger.error(f"Error checking/adding database columns: {e}", exc_info=True)
    finally:
        db.close()


@app.get("/")
def read_root():
    """Main landing root returning basic service metadata."""
    return {
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "health_check_url": f"{settings.API_V1_STR}/health"
    }
