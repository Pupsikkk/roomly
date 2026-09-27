from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from app.models.booking import BookingStatus

class BookingCreate(BaseModel):
    room_id: int
    user_id: int
    check_in: date
    check_out: date

class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    room_id: int
    user_id: int
    check_in: date
    check_out: date
    status: BookingStatus
    created_at: datetime