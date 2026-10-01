import { ApiProperty } from '@nestjs/swagger';
import type { BookingStatus } from '@roomly/contracts';

export class BookingResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  roomId!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: '2026-10-10' })
  checkIn!: string;

  @ApiProperty({ example: '2026-10-12' })
  checkOut!: string;

  @ApiProperty({ enum: ['pending', 'confirmed', 'cancelled'] })
  status!: BookingStatus;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z' })
  createdAt!: string;
}
