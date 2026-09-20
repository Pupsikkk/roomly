import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { Traced } from '@roomly/common';
import { USER_HTTP_PATHS, type UserResponse } from '@roomly/contracts';
import { GetUserByIdUseCase } from '../../../../application/index';
import { UserResponseDto } from './dto/out/user-response.dto';

@Controller(USER_HTTP_PATHS.root)
export class UsersController {
  constructor(private readonly getUserById: GetUserByIdUseCase) {}

  @Get(':id')
  @Traced()
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponse> {
    const user = await this.getUserById.execute(id);
    return UserResponseDto.fromDomain(user);
  }
}
