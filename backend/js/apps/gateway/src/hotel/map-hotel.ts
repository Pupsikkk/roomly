import type { HotelResponse, RoomResponse } from '@roomly/contracts';
import type { HotelResponseDto } from './dto/hotel-response.dto';
import type { RoomResponseDto } from './dto/room-response.dto';

export function toHotelResponse(hotel: HotelResponse): HotelResponseDto {
  return {
    id: hotel.id,
    name: hotel.name,
    city: hotel.city,
    address: hotel.address,
    createdAt: hotel.created_at,
  };
}

export function toRoomResponse(room: RoomResponse): RoomResponseDto {
  return {
    id: room.id,
    hotelId: room.hotel_id,
    number: room.number,
    roomType: room.room_type,
    pricePerNight: room.price_per_night,
    isAvailable: room.is_available,
  };
}
