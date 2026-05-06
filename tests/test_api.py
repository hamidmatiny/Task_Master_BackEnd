import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["ENVIRONMENT"] = "test"

from app.db.base import Base
from app.main import app
from app.db.session import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    Path("test.db").unlink(missing_ok=True)


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def override_get_db(db_session):
    def _get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_db
    yield
    app.dependency_overrides.clear()


client = TestClient(app)


def test_health_check():
    response = client.get("/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_task():
    payload = {
        "title": "Test task",
        "description": "A test task.",
        "priority": "high",
        "completed": False,
        "estimated_hours": 2,
    }
    response = client.post("/tasks/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["completed"] is False


def test_read_task():
    response = client.get("/tasks/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_update_task():
    response = client.patch("/tasks/1", json={"completed": True})
    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_analytics_summary():
    response = client.get("/analytics/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total_tasks"] >= 1
    assert payload["average_estimated_hours"] >= 0


def test_etl_load_sample():
    response = client.post("/etl/load-sample")
    assert response.status_code == 200
    result = response.json()
    assert result["imported_tasks"] == 3
    assert "message" in result
