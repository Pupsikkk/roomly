from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingRead, BookingStatus
from app.clients.hotel_client import reserve_room, release_room, HotelServiceError

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.get("", response_model=list[BookingRead])
async def list_bookings(user_id: int | None = None, db: AsyncSession = Depends(get_db)):
    query = select(Booking)
    if user_id is not None:
        query = query.where(Booking.user_id == user_id)

    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=BookingRead, status_code=201)
async def create_booking(payload: BookingCreate, db: AsyncSession = Depends(get_db)):
    try:
        await reserve_room(payload.room_id)
    except HotelServiceError as e:
        raise HTTPException(status_code=409, detail=str(e))

    booking = Booking(**payload.model_dump())
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking

@router.get("/{booking_id}", response_model=BookingRead)
async def get_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    booking = await db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.post("/{booking_id}/cancel", response_model=BookingRead)
async def cancel_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    booking = await db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status == BookingStatus.cancelled:
        raise HTTPException(status_code=409, detail="Booking already cancelled")

    try:
        await release_room(booking.room_id)
    except HotelServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))

    booking.status = BookingStatus.cancelled
    await db.commit()
    await db.refresh(booking)
    return booking