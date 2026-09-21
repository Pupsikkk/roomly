async def test_create_hotel(client):
    response = await client.post(
        "/hotels",
        json={"name": "Hilton", "city": "Kyiv", "address": "Khreshchatyk 1"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Hilton"
    assert data["city"] == "Kyiv"
    assert "id" in data
    assert "created_at" in data

async def test_list_hotels(client):
    await client.post(
        "/hotels",
        json={"name": "Hilton", "city": "Kyiv", "address": "Khreshchatyk 1"},
    )
    await client.post(
        "/hotels",
        json={"name": "Ibis", "city": "Lviv", "address": "Rynok 5"},
    )

    response = await client.get("/hotels")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


async def test_get_hotel_success(client):
    create_response = await client.post(
        "/hotels",
        json={"name": "Hilton", "city": "Kyiv", "address": "Khreshchatyk 1"},
    )
    hotel_id = create_response.json()["id"]

    response = await client.get(f"/hotels/{hotel_id}")

    assert response.status_code == 200
    assert response.json()["id"] == hotel_id


async def test_get_hotel_not_found(client):
    response = await client.get("/hotels/999")

    assert response.status_code == 404