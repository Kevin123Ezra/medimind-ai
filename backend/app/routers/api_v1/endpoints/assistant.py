import logging
from typing import Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.routers.api_v1.dependencies import get_current_active_user
from backend.app.repositories.medical_report_repository import medical_report_repository
from backend.app.services.sarvam_service import sarvam_service
from backend.app.schemas.assistant import ChatRequest, ChatResponse, ReportSummaryResponse

logger = logging.getLogger("backend.assistant_router")
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    *,
    req: ChatRequest,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Interact with MediMind Clinical AI Companion powered by Sarvam AI.
    Answers health-related, medication, or cardiovascular metric questions educationally.
    """
    logger.info(f"User {current_user.id} asked health assistant: {req.message[:50]}...")
    
    # Structure conversation history for service
    history_list = []
    if req.history:
        for msg in req.history:
            history_list.append({
                "sender": msg.sender,
                "message": msg.message
            })
            
    answer = await sarvam_service.answer_health_question(
        question=req.message,
        history=history_list
    )
    
    return ChatResponse(message=answer)


@router.post("/reports/{id}/summarize", response_model=ReportSummaryResponse)
async def summarize_report(
    *,
    db: Session = Depends(get_db),
    id: UUID,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Takes an existing medical report, extracts its OCR content, and generates
    a patient-friendly layman summary with educational follow-up recommendations.
    """
    report = medical_report_repository.get(db, id=id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical report not found.",
        )
        
    # Check permissions
    if report.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this medical report.",
        )
        
    # Check if we have extracted OCR text to process
    extracted_text = report.extracted_text
    if not extracted_text and report.structured_json:
        extracted_text = report.structured_json.get("extracted_text")
        
    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This medical report does not have any processed OCR text yet. Please ensure the document upload and OCR step succeeded first.",
        )
        
    logger.info(f"Summarizing report {report.id} ({report.title}) for user {current_user.id}...")
    
    summary_data = await sarvam_service.summarize_ocr_report(
        title=report.title,
        report_type=report.report_type,
        extracted_text=extracted_text
    )
    
    return ReportSummaryResponse(
        summary=summary_data.get("summary", ""),
        key_findings=summary_data.get("key_findings", []),
        recommendations=summary_data.get("recommendations", []),
        disclaimer=summary_data.get("disclaimer", "")
    )
