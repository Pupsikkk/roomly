import { ApiProperty } from '@nestjs/swagger';
import type { UserResponse } from '@roomly/contracts';

export class UserResponseDto implements UserResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'guest@roomly.local' })
  email!: string;

  @ApiProperty({ example: '2026-09-16T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-16T10:00:00.000Z' })
  updatedAt!: string;
}
