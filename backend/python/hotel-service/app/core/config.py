from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "roomly"
    postgres_password: str = "roomly"
    hotel_db_name: str = "hotel_db"

    hotel_service_port: int = 8000

settings = Settings()