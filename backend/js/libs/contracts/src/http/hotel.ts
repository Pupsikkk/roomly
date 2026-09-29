/** HTTP paths for hotel-service (relative to base URL). */
export const HOTEL_HTTP_PATHS = {
  hotels: 'hotels',
  rooms: 'rooms',
} as const;

/** Create hotel body (POST /hotels/). */
export type HotelCreateRequest = {
  name: string;
  city: string;
  address: string;
};

/**
 * Hotel as returned by hotel-service (snake_case JSON from FastAPI/Pydantic).
 */
export type HotelResponse = {
  id: number;
  name: string;
  city: string;
  address: string;
  created_at: string;
};

/** Create room body (POST /hotels/{id}/rooms). */
export type RoomCreateRequest = {
  number: string;
  room_type: string;
  /** Decimal on the wire — JSON number or string depending on encoder. */
  price_per_night: number | string;
  is_available?: boolean;
};

/**
 * Room as returned by hotel-service (snake_case JSON from FastAPI/Pydantic).
 */
export type RoomResponse = {
  id: number;
  hotel_id: number;
  number: string;
  room_type: string;
  price_per_night: number | string;
  is_available: boolean;
};
