from functools import lru_cache

from pydantic import Field
from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(env_file='.env', env_file_encoding='utf-8')

    project_name: str = "Task Master BackEnd"
    environment: str = "production"
    database_url: str = "postgresql://postgres:postgres@db:5432/taskmaster"
    app_host: str = "0.0.0.0"
    app_port: int = 8000


@lru_cache()
def get_settings() -> Settings:
    return Settings()
