import { ApiProperty } from '@nestjs/swagger';
import type { AuthSessionResponse } from '@roomly/contracts';

export class AuthSessionResponseDto implements AuthSessionResponse {
  @ApiProperty({ description: 'Access-token lifetime in seconds' })
  expiresIn!: number;
}
