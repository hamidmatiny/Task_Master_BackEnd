from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import etl, schemas
from app.db.session import get_db

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post("/load-sample", response_model=schemas.ETLImportResponse)
def load_sample_tasks(db: Session = Depends(get_db)):
    result = etl.run_etl(db)
    return schemas.ETLImportResponse(
        imported_tasks=result["imported_tasks"],
        message=result["message"],
    )


@router.post("/import", response_model=schemas.ETLImportResponse)
def import_tasks(payload: schemas.ETLImportRequest, db: Session = Depends(get_db)):
    imported = etl.load_tasks(db, payload.tasks)
    return schemas.ETLImportResponse(
        imported_tasks=imported,
        message=f"Imported {imported} tasks from payload.",
    )
