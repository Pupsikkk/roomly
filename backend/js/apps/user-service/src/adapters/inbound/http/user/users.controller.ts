import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { USER_HTTP_PATHS, type UserResponse } from '@roomly/contracts';
import {
  CreateUserUseCase,
  GetUserByIdUseCase,
} from '../../../../application/index';
import { CreateUserDto } from './dto/in/create-user.dto';
import { UserResponseDto } from './dto/out/user-response.dto';

@Controller(USER_HTTP_PATHS.root)
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUserById: GetUserByIdUseCase,
  ) {}

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponse> {
    const user = await this.getUserById.execute(id);
    return UserResponseDto.fromDomain(user);
  }

  @Post()
  async create(@Body() body: CreateUserDto): Promise<UserResponse> {
    const user = await this.createUser.execute(body);
    return UserResponseDto.fromDomain(user);
  }
}
