import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ example: 'Hilton' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'Kyiv' })
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiProperty({ example: 'Khreshchatyk 1' })
  @IsString()
  @MinLength(1)
  address!: string;
}
