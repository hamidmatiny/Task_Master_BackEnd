from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas import TaskCreate, TaskUpdate


def get_task(db: Session, task_id: int) -> Task | None:
    return db.query(Task).filter(Task.id == task_id).first()


def get_tasks(db: Session, skip: int = 0, limit: int = 100) -> list[Task]:
    return db.query(Task).order_by(Task.id).offset(skip).limit(limit).all()


def create_task(db: Session, task_in: TaskCreate) -> Task:
    task = Task(**task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: Task, task_in: TaskUpdate) -> Task:
    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()


def get_analytics(db: Session) -> dict[str, float | int]:
    total = db.query(func.count(Task.id)).scalar() or 0
    completed = db.query(func.count(Task.id)).filter(Task.completed.is_(True)).scalar() or 0
    pending = db.query(func.count(Task.id)).filter(Task.completed.is_(False)).scalar() or 0
    avg_hours = db.query(func.coalesce(func.avg(Task.estimated_hours), 0)).scalar() or 0.0
    completion_rate = float(completed / total * 100) if total else 0.0
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "completion_rate": round(completion_rate, 2),
        "average_estimated_hours": float(round(avg_hours, 2)),
    }
