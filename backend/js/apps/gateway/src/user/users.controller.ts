import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { USER_HTTP_PATHS, type UserResponse } from '@roomly/contracts';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserHttpClient } from './user-http.client';

@ApiTags('users')
@Controller(USER_HTTP_PATHS.root)
export class UsersController {
  constructor(private readonly users: UserHttpClient) {}

  @Post()
  @ApiOperation({ summary: 'Register a user (proxied to user-service)' })
  @ApiCreatedResponse({ type: UserResponseDto })
  create(@Body() body: CreateUserDto): Promise<UserResponse> {
    return this.users.createUser(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id (proxied to user-service)' })
  @ApiOkResponse({ type: UserResponseDto })
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
    return this.users.getUserById(id);
  }
}
