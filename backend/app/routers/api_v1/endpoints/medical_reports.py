from typing import Any, List
from uuid import UUID
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.dependencies import get_current_active_user
from backend.app.models.user import User
from backend.app.schemas.medical_report import (
    MedicalReportCreate,
    MedicalReportResponse,
    MedicalReportUpdate,
)
from backend.app.repositories.medical_report_repository import medical_report_repository
from backend.app.services.ocr_service import ocr_service

logger = logging.getLogger("backend.medical_reports_router")
router = APIRouter()


@router.get("/", response_model=List[MedicalReportResponse])
def read_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all medical reports belonging to the current user.
    """
    reports = medical_report_repository.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return reports


@router.post("/", response_model=MedicalReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    *,
    db: Session = Depends(get_db),
    report_in: MedicalReportCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Save medical report metadata after successful storage upload.
    Automatically triggers Vision OCR / Gemini parsing to extract structured JSON.
    """
    # Create the report object
    report = medical_report_repository.create_with_user(
        db, obj_in=report_in, user_id=current_user.id
    )

    # If file_url is provided, trigger the Google Vision / Gemini OCR extraction
    if report.file_url:
        logger.info(f"Triggering document OCR analysis for report: {report.id} ({report.title})")
        try:
            ocr_data = await ocr_service.extract_structured_data(
                file_url=report.file_url,
                title=report.title,
                report_type=report.report_type
            )
            
            # Save extracted verbatim text and structured JSON
            report.extracted_text = ocr_data.get("extracted_text")
            report.structured_json = ocr_data
            
            # Smart auto-fill: enrich doctor, facility, and date if user left them blank
            if not report.doctor_name and ocr_data.get("doctor_name"):
                report.doctor_name = ocr_data.get("doctor_name")
                
            if not report.facility and ocr_data.get("facility"):
                report.facility = ocr_data.get("facility")
                
            if not report.report_date and ocr_data.get("date"):
                try:
                    from datetime import datetime
                    report.report_date = datetime.strptime(ocr_data.get("date"), "%Y-%m-%d").date()
                except Exception:
                    pass
            
            db.add(report)
            db.commit()
            db.refresh(report)
            logger.info(f"Successfully ran OCR and enriched medical report: {report.id}")
        except Exception as ocr_err:
            logger.error(f"Failed to auto-process OCR for report {report.id}: {ocr_err}", exc_info=True)
            # We don't crash the request if OCR fails - user can still see and edit report metadata

    return report


@router.get("/{id}", response_model=MedicalReportResponse)
def read_report(
    *,
    db: Session = Depends(get_db),
    id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve details of a specific medical report.
    """
    report = medical_report_repository.get(db, id=id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found.",
        )
    if report.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this report.",
        )
    return report


@router.get("/{id}/structured-data")
def read_report_structured_data(
    *,
    db: Session = Depends(get_db),
    id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Exposes direct access to the extracted OCR structured JSON for a specific report.
    """
    report = medical_report_repository.get(db, id=id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found.",
        )
    if report.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this report.",
        )
    
    if not report.structured_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No structured OCR data available for this document.",
        )
        
    return report.structured_json


@router.delete("/{id}", response_model=MedicalReportResponse)
def delete_report(
    *,
    db: Session = Depends(get_db),
    id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Delete a specific medical report.
    """
    report = medical_report_repository.get(db, id=id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found.",
        )
    if report.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to modify this report.",
        )
    
    # Perform soft-delete by setting deleted_at (or hard delete if preferred, but since we have SoftDeleteMixin let's set deleted_at)
    from datetime import datetime, timezone
    report.deleted_at = datetime.now(timezone.utc)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
