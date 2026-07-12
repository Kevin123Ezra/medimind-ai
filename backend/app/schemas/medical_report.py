from datetime import date, datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict


# Shared properties
class MedicalReportBase(BaseModel):
    title: str
    description: Optional[str] = None
    report_type: str
    file_url: Optional[str] = None
    doctor_name: Optional[str] = None
    facility: Optional[str] = None
    report_date: Optional[date] = None
    extracted_text: Optional[str] = None
    structured_json: Optional[Dict[str, Any]] = None


# Properties to receive via API on creation
class MedicalReportCreate(MedicalReportBase):
    pass


# Properties to receive via API on update
class MedicalReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    report_type: Optional[str] = None
    file_url: Optional[str] = None
    doctor_name: Optional[str] = None
    facility: Optional[str] = None
    report_date: Optional[date] = None
    extracted_text: Optional[str] = None
    structured_json: Optional[Dict[str, Any]] = None


class MedicalReportInDBBase(MedicalReportBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Additional properties to return via API
class MedicalReportResponse(MedicalReportInDBBase):
    pass
