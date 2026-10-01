import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HotelHttpClient } from '@roomly/clients/hotel';
import { HOTEL_HTTP_PATHS } from '@roomly/contracts';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { HotelResponseDto } from './dto/hotel-response.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { toHotelResponse, toRoomResponse } from './map-hotel';

@ApiTags('hotels')
@Controller(HOTEL_HTTP_PATHS.hotels)
export class HotelsController {
  constructor(private readonly hotels: HotelHttpClient) {}

  @Get()
  @ApiOperation({ summary: 'List hotels' })
  @ApiOkResponse({ type: HotelResponseDto, isArray: true })
  async listHotels(): Promise<HotelResponseDto[]> {
    const hotels = await this.hotels.listHotels();
    return hotels.map(toHotelResponse);
  }

  @Get(':hotelId')
  @ApiOperation({ summary: 'Get hotel by id' })
  @ApiOkResponse({ type: HotelResponseDto })
  @ApiNotFoundResponse()
  async getHotel(
    @Param('hotelId', ParseIntPipe) hotelId: number,
  ): Promise<HotelResponseDto> {
    return toHotelResponse(await this.hotels.getHotel(hotelId));
  }

  @Post()
  @ApiOperation({ summary: 'Create hotel' })
  @ApiCreatedResponse({ type: HotelResponseDto })
  async createHotel(@Body() body: CreateHotelDto): Promise<HotelResponseDto> {
    return toHotelResponse(await this.hotels.createHotel(body));
  }

  @Get(':hotelId/rooms')
  @ApiOperation({ summary: 'List rooms for a hotel' })
  @ApiOkResponse({ type: RoomResponseDto, isArray: true })
  @ApiNotFoundResponse()
  async listRooms(
    @Param('hotelId', ParseIntPipe) hotelId: number,
  ): Promise<RoomResponseDto[]> {
    const rooms = await this.hotels.listRooms(hotelId);
    return rooms.map(toRoomResponse);
  }

  @Get(':hotelId/rooms/:roomId')
  @ApiOperation({ summary: 'Get room by id' })
  @ApiOkResponse({ type: RoomResponseDto })
  @ApiNotFoundResponse()
  async getRoom(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Param('roomId', ParseIntPipe) roomId: number,
  ): Promise<RoomResponseDto> {
    return toRoomResponse(await this.hotels.getRoom(hotelId, roomId));
  }

  @Post(':hotelId/rooms')
  @ApiOperation({ summary: 'Create room in a hotel' })
  @ApiCreatedResponse({ type: RoomResponseDto })
  @ApiNotFoundResponse()
  async createRoom(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Body() body: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    return toRoomResponse(
      await this.hotels.createRoom(hotelId, {
        number: body.number,
        room_type: body.roomType,
        price_per_night: body.pricePerNight,
        is_available: body.isAvailable,
      }),
    );
  }
}
