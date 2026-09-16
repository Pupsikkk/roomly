import type { RefreshRequest } from '@roomly/contracts';
import { IsString, MinLength } from 'class-validator';

export class RefreshDto implements RefreshRequest {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
