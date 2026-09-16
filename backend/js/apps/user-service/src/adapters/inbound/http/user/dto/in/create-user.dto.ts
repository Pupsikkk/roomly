import type { CreateUserRequest } from '@roomly/contracts';
import { IsEmail, IsString, MinLength } from 'class-validator';

/** Inbound HTTP validation; shape matches CreateUserRequest contract */
export class CreateUserDto implements CreateUserRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
