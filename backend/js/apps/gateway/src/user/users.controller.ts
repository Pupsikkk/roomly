import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AUTH_COOKIE_NAMES,
  USER_HTTP_PATHS,
  type AccessTokenClaims,
  type UserResponse,
} from '@roomly/contracts';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UserHttpClient } from './user-http.client';

@ApiTags('users')
@Controller(USER_HTTP_PATHS.root)
export class UsersController {
  constructor(private readonly users: UserHttpClient) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(AUTH_COOKIE_NAMES.access)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse()
  getMe(@CurrentUser() user: AccessTokenClaims): Promise<UserResponse> {
    return this.users.getUserById(user.sub);
  }
}
