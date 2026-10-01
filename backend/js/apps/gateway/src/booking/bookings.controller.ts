import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BookingHttpClient } from '@roomly/clients/booking';
import { BOOKING_HTTP_PATHS } from '@roomly/contracts';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { toBookingResponse } from './map-booking';

@ApiTags('bookings')
@Controller(BOOKING_HTTP_PATHS.bookings)
export class BookingsController {
  constructor(private readonly bookings: BookingHttpClient) {}

  @Get()
  @ApiOperation({ summary: 'List bookings' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiOkResponse({ type: BookingResponseDto, isArray: true })
  async listBookings(
    @Query('userId') userId?: string,
  ): Promise<BookingResponseDto[]> {
    const parsed =
      userId === undefined || userId === ''
        ? undefined
        : Number.parseInt(userId, 10);
    const list = await this.bookings.listBookings(
      Number.isFinite(parsed) ? parsed : undefined,
    );
    return list.map(toBookingResponse);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get booking by id' })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiNotFoundResponse()
  async getBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<BookingResponseDto> {
    return toBookingResponse(await this.bookings.getBooking(bookingId));
  }

  @Post()
  @ApiOperation({ summary: 'Create booking (reserves room via hotel-service)' })
  @ApiCreatedResponse({ type: BookingResponseDto })
  @ApiConflictResponse()
  async createBooking(
    @Body() body: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return toBookingResponse(
      await this.bookings.createBooking({
        room_id: body.roomId,
        user_id: body.userId,
        check_in: body.checkIn,
        check_out: body.checkOut,
      }),
    );
  }

  @Post(':bookingId/cancel')
  @ApiOperation({ summary: 'Cancel booking (releases room via hotel-service)' })
  @ApiOkResponse({ type: BookingResponseDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  async cancelBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<BookingResponseDto> {
    return toBookingResponse(await this.bookings.cancelBooking(bookingId));
  }
}
