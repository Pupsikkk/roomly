from unittest.mock import AsyncMock
from app.clients.hotel_client import HotelServiceError

async def test_create_booking(client, mock_hotel_client):
    response = await client.post(
        "/bookings",
        json={
            "room_id": 1,
            "user_id": 1,
            "check_in": "2026-10-01",
            "check_out": "2026-10-05",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["room_id"] == 1
    assert data["status"] == "pending"

async def test_create_booking_room_unavailable(client, monkeypatch):
    mock_reserve = AsyncMock(side_effect=HotelServiceError("Room already reserved"))
    monkeypatch.setattr("app.routers.bookings.reserve_room", mock_reserve)

    response = await client.post(
        "/bookings",
        json={
            "room_id": 1,
            "user_id": 1,
            "check_in": "2026-10-01",
            "check_out": "2026-10-05",
        },
    )

    assert response.status_code == 409

async def test_cancel_booking(client, mock_hotel_client):
    create_response = await client.post(
        "/bookings",
        json={
            "room_id": 1,
            "user_id": 1,
            "check_in": "2026-10-01",
            "check_out": "2026-10-05",
        },
    )
    booking_id = create_response.json()["id"]

    response = await client.post(f"/bookings/{booking_id}/cancel")

    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"

async def test_get_booking_not_found(client):
    response = await client.get("/bookings/999")

    assert response.status_code == 404