from pydantic_settings import BaseSettings
from typing import List, Union
import json

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./supermarket.db"
    # JWT
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ]

    def get_allowed_origins(self) -> List[str]:
        if isinstance(self.ALLOWED_ORIGINS, str):
            try:
                return json.loads(self.ALLOWED_ORIGINS)
            except Exception:
                return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]
        return self.ALLOWED_ORIGINS

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()