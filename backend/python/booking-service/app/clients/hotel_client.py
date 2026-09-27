import httpx
from app.core.config import settings

class HotelServiceError(Exception):
    pass

async def reserve_room(room_id: int) -> dict:
    async with httpx.AsyncClient(base_url=settings.hotel_service_url) as client:
        response = await client.post(f"/rooms/{room_id}/reserve")

    if response.status_code == 404:
        raise HotelServiceError("Room not Found")
    if response.status_code == 409:
        raise HotelServiceError("Room already reserved")
    response.raise_for_status()

    return response.json()

async def release_room(room_id: int) -> dict:
    async with httpx.AsyncClient(base_url=settings.hotel_service_url) as client:
        response = await client.post(f"/rooms/{room_id}/release")

    if response.status_code == 404:
        raise HotelServiceError("Room not found")

    response.raise_for_status()
    return response.json()