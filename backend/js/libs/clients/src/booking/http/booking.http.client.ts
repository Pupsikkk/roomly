import { Injectable } from '@nestjs/common';
import { Traced } from '@roomly/common';
import {
  BOOKING_HTTP_PATHS,
  type BookingCreateRequest,
  type BookingResponse,
} from '@roomly/contracts';
import { BookingServiceHttp } from './booking-service.http';

@Traced({ work: 'network' })
@Injectable()
export class BookingHttpClient {
  constructor(private readonly http: BookingServiceHttp) {}

  listBookings(userId?: number): Promise<BookingResponse[]> {
    const query =
      userId === undefined ? '' : `?user_id=${encodeURIComponent(String(userId))}`;
    return this.http.get<BookingResponse[]>(
      `/${BOOKING_HTTP_PATHS.bookings}${query}`,
    );
  }

  getBooking(bookingId: number): Promise<BookingResponse> {
    return this.http.get<BookingResponse>(
      `/${BOOKING_HTTP_PATHS.bookings}/${bookingId}`,
    );
  }

  createBooking(body: BookingCreateRequest): Promise<BookingResponse> {
    return this.http.post<BookingResponse>(
      `/${BOOKING_HTTP_PATHS.bookings}`,
      body,
    );
  }

  cancelBooking(bookingId: number): Promise<BookingResponse> {
    return this.http.post<BookingResponse>(
      `/${BOOKING_HTTP_PATHS.bookings}/${bookingId}/cancel`,
    );
  }
}
