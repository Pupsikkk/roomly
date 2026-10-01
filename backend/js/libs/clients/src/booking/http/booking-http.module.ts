import { Module } from '@nestjs/common';
import { BookingHttpClient } from './booking.http.client';
import { BookingServiceHttp } from './booking-service.http';

@Module({
  providers: [BookingServiceHttp, BookingHttpClient],
  exports: [BookingServiceHttp, BookingHttpClient],
})
export class BookingHttpModule {}
