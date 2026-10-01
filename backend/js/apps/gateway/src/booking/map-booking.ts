import type { BookingResponse } from '@roomly/contracts';
import type { BookingResponseDto } from './dto/booking-response.dto';

export function toBookingResponse(booking: BookingResponse): BookingResponseDto {
  return {
    id: booking.id,
    roomId: booking.room_id,
    userId: booking.user_id,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    status: booking.status,
    createdAt: booking.created_at,
  };
}
