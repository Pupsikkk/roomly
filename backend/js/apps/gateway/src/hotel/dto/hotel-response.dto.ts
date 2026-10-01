import { ApiProperty } from '@nestjs/swagger';

export class HotelResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Hilton' })
  name!: string;

  @ApiProperty({ example: 'Kyiv' })
  city!: string;

  @ApiProperty({ example: 'Khreshchatyk 1' })
  address!: string;

  @ApiProperty({ example: '2026-09-21T10:00:00.000Z' })
  createdAt!: string;
}
