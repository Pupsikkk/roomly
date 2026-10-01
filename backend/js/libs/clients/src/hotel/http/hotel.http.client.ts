import { Injectable } from '@nestjs/common';
import { Traced } from '@roomly/common';
import {
  HOTEL_HTTP_PATHS,
  type HotelCreateRequest,
  type HotelResponse,
  type RoomCreateRequest,
  type RoomResponse,
} from '@roomly/contracts';
import { HotelServiceHttp } from './hotel-service.http';

/**
 * Outbound hotel-service API (catalog + reserve/release).
 * Paths match FastAPI routers under /hotels and /rooms.
 */
@Traced({ work: 'network' })
@Injectable()
export class HotelHttpClient {
  constructor(private readonly http: HotelServiceHttp) {}

  listHotels(): Promise<HotelResponse[]> {
    return this.http.get<HotelResponse[]>(`/${HOTEL_HTTP_PATHS.hotels}/`);
  }

  getHotel(hotelId: number): Promise<HotelResponse> {
    return this.http.get<HotelResponse>(
      `/${HOTEL_HTTP_PATHS.hotels}/${hotelId}`,
    );
  }

  createHotel(body: HotelCreateRequest): Promise<HotelResponse> {
    return this.http.post<HotelResponse>(`/${HOTEL_HTTP_PATHS.hotels}/`, body);
  }

  listRooms(hotelId: number): Promise<RoomResponse[]> {
    return this.http.get<RoomResponse[]>(
      `/${HOTEL_HTTP_PATHS.hotels}/${hotelId}/rooms`,
    );
  }

  getRoom(hotelId: number, roomId: number): Promise<RoomResponse> {
    return this.http.get<RoomResponse>(
      `/${HOTEL_HTTP_PATHS.hotels}/${hotelId}/rooms/${roomId}`,
    );
  }

  createRoom(
    hotelId: number,
    body: RoomCreateRequest,
  ): Promise<RoomResponse> {
    return this.http.post<RoomResponse>(
      `/${HOTEL_HTTP_PATHS.hotels}/${hotelId}/rooms`,
      body,
    );
  }

  reserveRoom(roomId: number): Promise<RoomResponse> {
    return this.http.post<RoomResponse>(
      `/${HOTEL_HTTP_PATHS.rooms}/${roomId}/reserve`,
    );
  }

  releaseRoom(roomId: number): Promise<RoomResponse> {
    return this.http.post<RoomResponse>(
      `/${HOTEL_HTTP_PATHS.rooms}/${roomId}/release`,
    );
  }
}
