from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.analytics import router as analytics_router
from app.api.v1.etl import router as etl_router
from app.api.v1.health import router as health_router
from app.api.v1.tasks import router as tasks_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine

settings = get_settings()


@asynccontextmanager
def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title=settings.project_name, version="1.0.0", lifespan=lifespan)
    app.include_router(health_router)
    app.include_router(tasks_router)
    app.include_router(analytics_router)
    app.include_router(etl_router)
    return app


app = create_app()
