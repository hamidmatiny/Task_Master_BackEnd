from datetime import datetime, timedelta, timezone
from typing import Iterable

from sqlalchemy.orm import Session

from app.crud import create_task, get_analytics
from app.schemas import TaskCreate


SAMPLE_TASKS: list[dict] = [
    {
        "title": "Plan product roadmap",
        "description": "Define milestones and assign owners for Q3 initiatives.",
        "priority": "high",
        "completed": False,
        "due_date": datetime.now(timezone.utc) + timedelta(days=7),
        "estimated_hours": 5,
    },
    {
        "title": "Write API documentation",
        "description": "Publish endpoint docs and example requests.",
        "priority": "medium",
        "completed": False,
        "due_date": datetime.now(timezone.utc) + timedelta(days=3),
        "estimated_hours": 2,
    },
    {
        "title": "Review bug backlog",
        "description": "Tag issues and prioritize fixes for next sprint.",
        "priority": "low",
        "completed": True,
        "due_date": datetime.now(timezone.utc) - timedelta(days=1),
        "estimated_hours": 1,
    },
]


def extract_sample_tasks() -> list[TaskCreate]:
    return [TaskCreate(**task) for task in SAMPLE_TASKS]


def transform_tasks(raw_tasks: Iterable[TaskCreate]) -> list[TaskCreate]:
    transformed = []
    for task in raw_tasks:
        priority = task.priority.lower() if task.priority else "medium"
        if priority not in {"low", "medium", "high"}:
            priority = "medium"
        task_dict = task.model_dump()
        task_dict["priority"] = priority
        transformed.append(TaskCreate(**task_dict))
    return transformed


def load_tasks(db: Session, raw_tasks: Iterable[TaskCreate]) -> int:
    transformed = transform_tasks(raw_tasks)
    for task in transformed:
        create_task(db, task)
    return len(transformed)


def run_etl(db: Session) -> dict[str, int | str]:
    imported = load_tasks(db, extract_sample_tasks())
    summary = get_analytics(db)
    return {
        "imported_tasks": imported,
        "summary": summary,
        "message": "ETL load completed successfully.",
    }
