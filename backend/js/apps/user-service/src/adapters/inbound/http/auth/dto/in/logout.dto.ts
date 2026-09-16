import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

/** Internal logout payload from gateway */
export class LogoutDto {
  @IsOptional()
  @IsUUID()
  jti?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  exp?: number;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
