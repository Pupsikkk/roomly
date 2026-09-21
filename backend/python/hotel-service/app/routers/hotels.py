from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.hotel import Hotel
from app.schemas.hotel import HotelCreate, HotelRead

router = APIRouter(prefix="/hotels", tags=["hotels"])

@router.get("/", response_model=list[HotelRead])
async def list_hotels(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Hotel))
    return result.scalars().all()

@router.get("/{hotel_id}", response_model=HotelRead)
async def get_hotel(hotel_id: int, db: AsyncSession = Depends(get_db)):
    hotel = await db.get(Hotel, hotel_id)
    if hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

@router.post("/", response_model=HotelRead, status_code=201)
async def create_hotel(payload: HotelCreate, db: AsyncSession = Depends(get_db)):
    hotel = Hotel(**payload.model_dump())
    db.add(hotel)
    await db.commit()
    await db.refresh(hotel)
    return hotel