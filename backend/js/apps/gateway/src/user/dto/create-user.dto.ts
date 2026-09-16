import { ApiProperty } from '@nestjs/swagger';
import type { CreateUserRequest } from '@roomly/contracts';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto implements CreateUserRequest {
  @ApiProperty({ example: 'guest@roomly.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
