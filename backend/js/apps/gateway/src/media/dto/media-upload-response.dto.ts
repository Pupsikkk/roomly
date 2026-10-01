import { ApiProperty } from '@nestjs/swagger';
import type { MediaUploadResponse } from '@roomly/contracts';

export class MediaUploadResponseDto implements MediaUploadResponse {
  @ApiProperty({
    format: 'uuid',
    example: 'b1d49902-066b-4d6f-a878-b11938b933e4',
  })
  id!: string;
}
