from fastapi import FastAPI
from .routers import hotels, rooms

app = FastAPI(title="Hotel Service")

app.include_router(hotels.router)
app.include_router(rooms.router)