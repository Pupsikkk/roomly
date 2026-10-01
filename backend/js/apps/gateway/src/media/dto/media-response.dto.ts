import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MediaResponse, MediaStatus } from '@roomly/contracts';

export class MediaResponseDto implements MediaResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: '/media/b1d49902-066b-4d6f-a878-b11938b933e4/content' })
  url!: string;

  @ApiProperty({ example: 'image/jpeg' })
  contentType!: string;

  @ApiProperty({ example: 102400 })
  size!: number;

  @ApiPropertyOptional({ nullable: true })
  originalName!: string | null;

  @ApiProperty({ enum: ['ready', 'processing', 'failed'] })
  status!: MediaStatus;

  @ApiProperty()
  createdAt!: string;
}
