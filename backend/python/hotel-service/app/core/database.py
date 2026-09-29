from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = (
    f"postgresql+asyncpg://{settings.postgres_user}:{settings.postgres_password}"
    f"@{settings.postgres_host}:{settings.postgres_port}/{settings.hotel_db_name}"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.postgres_host == "localhost",
)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session

class Base(DeclarativeBase):
    pass