from typing import List, Optional, Any
from sqlalchemy.orm import Session
from backend.app.models.medical_report import MedicalReport
from backend.app.schemas.medical_report import MedicalReportCreate, MedicalReportUpdate
from backend.app.repositories.base import CRUDBase


class MedicalReportRepository(CRUDBase[MedicalReport, MedicalReportCreate, MedicalReportUpdate]):
    def get_by_user(self, db: Session, *, user_id: Any, skip: int = 0, limit: int = 100) -> List[MedicalReport]:
        """Fetch all medical reports belonging to a specific user that are not soft-deleted."""
        return (
            db.query(self.model)
            .filter(self.model.user_id == user_id, self.model.deleted_at == None)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_user(self, db: Session, *, obj_in: MedicalReportCreate, user_id: Any) -> MedicalReport:
        """Create a medical report record associated with a specific user."""
        obj_in_data = obj_in.model_dump()
        db_obj = self.model(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


medical_report_repository = MedicalReportRepository(MedicalReport)
