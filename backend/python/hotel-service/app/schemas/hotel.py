from datetime import datetime
from pydantic import BaseModel, ConfigDict

class HotelCreate(BaseModel):
    name: str
    city: str
    address: str

class HotelRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    city: str
    address: str
    created_at: datetime

    