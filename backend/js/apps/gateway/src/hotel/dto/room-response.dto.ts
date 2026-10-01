import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  hotelId!: number;

  @ApiProperty({ example: '101' })
  number!: string;

  @ApiProperty({ example: 'double' })
  roomType!: string;

  @ApiProperty({ example: 1500, description: 'May be number or decimal string' })
  pricePerNight!: number | string;

  @ApiProperty({ example: true })
  isAvailable!: boolean;
}
