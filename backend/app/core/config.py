from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Any
import json


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./supermarket.db"

    # ── JWT ───────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 h

    # ── CORS ──────────────────────────────────────────────────────────────
    # Accepts both formats in .env:
    #   ALLOWED_ORIGINS=["http://localhost:4200","https://app.vercel.app"]
    #   ALLOWED_ORIGINS=http://localhost:4200,https://app.vercel.app
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(i).strip() for i in parsed]
                except json.JSONDecodeError:
                    pass
            return [o.strip() for o in v.split(",") if o.strip()]
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
