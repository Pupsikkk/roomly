import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserGrpcClient } from '@roomly/clients/user/grpc';
import {
  AUTH_COOKIE_NAMES,
  USER_HTTP_PATHS,
  type AccessTokenClaims,
  type UserResponse,
} from '@roomly/contracts';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller(USER_HTTP_PATHS.root)
export class UsersController {
  constructor(private readonly users: UserGrpcClient) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(AUTH_COOKIE_NAMES.access)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse()
  async getMe(@CurrentUser() user: AccessTokenClaims): Promise<UserResponse> {
    const profile = await this.users.getUserById({ id: user.sub });
    return {
      id: profile.id ?? '',
      email: profile.email ?? '',
      createdAt: profile.createdAt ?? '',
      updatedAt: profile.updatedAt ?? '',
    };
  }
}
