import type { SignUpRequest } from '@roomly/contracts';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto implements SignUpRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
