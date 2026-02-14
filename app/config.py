from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_path: str = "./travel_planner.duckdb"
    
    # JWT (optional since auth is disabled)
    secret_key: str = "temporary-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Amadeus API
    amadeus_client_id: Optional[str] = None
    amadeus_client_secret: Optional[str] = None
    amadeus_use_production: bool = False  # Set to True for production API
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env


settings = Settings()

