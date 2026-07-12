from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class ChatMessage(BaseModel):
    sender: str
    message: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    message: str

class ReportSummaryResponse(BaseModel):
    summary: str
    key_findings: List[str]
    recommendations: List[str]
    disclaimer: str
