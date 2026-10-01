from app.otel import instrument_app, setup_otel

setup_otel("hotel-service")

from fastapi import FastAPI

from .core.database import engine
from .routers import hotels, rooms

app = FastAPI(title="Hotel Service")


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(hotels.router)
app.include_router(rooms.router)
app.include_router(rooms.room_actions_router)

instrument_app(app, engine=engine)
