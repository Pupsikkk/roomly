from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class RoomCreate(BaseModel):
    number: str
    room_type: str
    price_per_night: Decimal
    is_available: bool = True

class RoomRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hotel_id: int
    number: str
    room_type: str
    price_per_night: Decimal
    is_available: bool