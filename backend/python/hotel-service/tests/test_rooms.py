async def test_create_room(client):
    hotel_response = await client.post(
        "/hotels",
        json={"name": "Hilton", "city": "Kyiv", "address": "Khreshchatyk 1"}
    )
    hotel_id = hotel_response.json()["id"]

    response = await client.post(
        f"/hotels/{hotel_id}/rooms",
        json={"number": "101", "room_type": "double", "price_per_night": 1500}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["number"] == "101"
    assert data["hotel_id"] == hotel_id

async def test_create_room_hotel_not_found(client):
    response = await client.get("/hotels/999/rooms")

    assert response.status_code == 404

async def test_list_rooms(client):
    hotel = await client.post(
        "/hotels",
        json={"name": "Hilton", "city": "Kyiv", "address": "Khreshchatyk 1"}
    )
    hotel_id = hotel.json()["id"]

    await client.post(
        f"/hotels/{hotel_id}/rooms",
        json={"number": "101", "room_type": "double", "price_per_night": 1500}
    )
    await client.post(
        f"/hotels/{hotel_id}/rooms",
        json={"number": "102", "room_type": "single", "price_per_night": 1000}
    )

    response = await client.get(f"/hotels/{hotel_id}/rooms")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2