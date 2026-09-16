import { ApiProperty } from '@nestjs/swagger';
import type { SignInRequest } from '@roomly/contracts';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto implements SignInRequest {
  @ApiProperty({ example: 'guest@roomly.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
