/** HTTP paths for booking-service (relative to base URL). */
export const BOOKING_HTTP_PATHS = {
  bookings: 'bookings',
} as const;

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

/** Create booking body (POST /bookings). */
export type BookingCreateRequest = {
  room_id: number;
  user_id: number;
  check_in: string;
  check_out: string;
};

/**
 * Booking as returned by booking-service (snake_case JSON from FastAPI/Pydantic).
 */
export type BookingResponse = {
  id: number;
  room_id: number;
  user_id: number;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  created_at: string;
};
