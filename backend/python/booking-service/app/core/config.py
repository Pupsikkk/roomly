from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "roomly"
    postgres_password: str = "roomly"
    booking_db_name: str = "booking_db"

    booking_service_port: int = 8001
    hotel_service_url: str = "http://localhost:8000"

settings = Settings()