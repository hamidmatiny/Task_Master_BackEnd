from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.analytics import router as analytics_router
from app.api.v1.etl import router as etl_router
from app.api.v1.health import router as health_router
from app.api.v1.tasks import router as tasks_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title=settings.project_name, version="1.0.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(tasks_router)
    app.include_router(analytics_router)
    app.include_router(etl_router)

    frontend_dist = Path(__file__).resolve().parents[1] / 'frontend' / 'dist'
    if frontend_dist.exists():
        app.mount('/', StaticFiles(directory=str(frontend_dist), html=True), name='frontend')

    return app


app = create_app()
