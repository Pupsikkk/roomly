from app.otel import instrument_app, setup_otel

setup_otel("booking-service")

from fastapi import FastAPI

from app.core.config import settings
from app.core.database import engine
from app.routers import bookings

app = FastAPI(title="Booking Service")

app.include_router(bookings.router)


@app.get("/health")
def health():
    return {"status": "ok", "db": settings.booking_db_name}


instrument_app(app, engine=engine, httpx=True)
