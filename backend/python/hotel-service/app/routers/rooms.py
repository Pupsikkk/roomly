from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.hotel import Hotel
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomRead

router = APIRouter(prefix="/hotels", tags=["rooms"])
room_actions_router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.get("/{hotel_id}/rooms/{room_id}", response_model=RoomRead, status_code=200)
async def get_room(hotel_id: int, room_id: int, db: AsyncSession = Depends(get_db)):
    room = await db.get(Room, room_id)
    if room is None or room.hotel_id != hotel_id:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.get("/{hotel_id}/rooms", response_model=list[RoomRead], status_code=200)
async def list_rooms(hotel_id: int, db: AsyncSession = Depends(get_db)):
    hotel = await db.get(Hotel, hotel_id)
    if hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    result = await db.execute(select(Room).where(Room.hotel_id == hotel_id))
    return result.scalars().all()

@router.post("/{hotel_id}/rooms", response_model=RoomRead, status_code=201)
async def create_room(hotel_id: int, payload: RoomCreate, db: AsyncSession = Depends(get_db)):
    hotel = await db.get(Hotel, hotel_id)
    if hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")

    room = Room(hotel_id=hotel_id, **payload.model_dump())
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

@room_actions_router.post("/{room_id}/reserve", response_model=RoomRead)
async def reserve_room(room_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Room).where(Room.id == room_id).with_for_update()
    )
    room = result.scalar_one_or_none()

    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    if not room.is_available:
        raise HTTPException(status_code=409, detail="Room already reserved")

    room.is_available = False
    await db.commit()
    await db.refresh(room)
    return room

@room_actions_router.post("/{room_id}/release", response_model=RoomRead)
async def release_room(room_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Room).where(Room.id == room_id).with_for_update()
    )
    room = result.scalar_one_or_none()

    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    room.is_available = True
    await db.commit()
    await db.refresh(room)
    return room