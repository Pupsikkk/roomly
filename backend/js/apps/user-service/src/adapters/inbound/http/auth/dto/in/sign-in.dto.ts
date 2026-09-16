import type { SignInRequest } from '@roomly/contracts';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto implements SignInRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
