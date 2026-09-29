import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HotelHttpClient } from '@roomly/clients/hotel';
import { HOTEL_HTTP_PATHS } from '@roomly/contracts';
import { RoomResponseDto } from './dto/room-response.dto';
import { toRoomResponse } from './map-hotel';

@ApiTags('rooms')
@Controller(HOTEL_HTTP_PATHS.rooms)
export class RoomsController {
  constructor(private readonly hotels: HotelHttpClient) {}

  @Post(':roomId/reserve')
  @ApiOperation({ summary: 'Reserve a room (atomic)' })
  @ApiOkResponse({ type: RoomResponseDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'Room already reserved' })
  async reserveRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<RoomResponseDto> {
    return toRoomResponse(await this.hotels.reserveRoom(roomId));
  }

  @Post(':roomId/release')
  @ApiOperation({ summary: 'Release a reserved room' })
  @ApiOkResponse({ type: RoomResponseDto })
  @ApiNotFoundResponse()
  async releaseRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<RoomResponseDto> {
    return toRoomResponse(await this.hotels.releaseRoom(roomId));
  }
}
