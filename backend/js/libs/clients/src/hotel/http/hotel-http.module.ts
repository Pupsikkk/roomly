import { Module } from '@nestjs/common';
import { HotelHttpClient } from './hotel.http.client';
import { HotelServiceHttp } from './hotel-service.http';

@Module({
  providers: [HotelServiceHttp, HotelHttpClient],
  exports: [HotelServiceHttp, HotelHttpClient],
})
export class HotelHttpModule {}
