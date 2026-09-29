import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @MinLength(1)
  number!: string;

  @ApiProperty({ example: 'double' })
  @IsString()
  @MinLength(1)
  roomType!: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerNight!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
