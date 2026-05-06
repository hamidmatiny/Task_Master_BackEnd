from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    completed: bool = False
    priority: str = Field("medium", max_length=20)
    due_date: Optional[datetime] = None
    estimated_hours: int = Field(1, ge=0)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, max_length=20)
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = Field(None, ge=0)


class TaskRead(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AnalyticsSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    completion_rate: float
    average_estimated_hours: float


class ETLImportResponse(BaseModel):
    imported_tasks: int
    message: str


class ETLImportRequest(BaseModel):
    tasks: list[TaskCreate]
