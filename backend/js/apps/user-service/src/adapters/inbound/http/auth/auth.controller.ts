import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  AUTH_HTTP_PATHS,
  type SessionTokensResponse,
} from '@roomly/contracts';
import {
  LogoutUseCase,
  RefreshSessionUseCase,
  SignInUseCase,
  SignUpUseCase,
} from '../../../../application/index';
import { LogoutDto } from './dto/in/logout.dto';
import { RefreshDto } from './dto/in/refresh.dto';
import { SignInDto } from './dto/in/sign-in.dto';
import { SignUpDto } from './dto/in/sign-up.dto';
import { SessionTokensResponseDto } from './dto/out/session-tokens-response.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly signUp: SignUpUseCase,
    private readonly signIn: SignInUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logout: LogoutUseCase,
  ) {}

  @Post(AUTH_HTTP_PATHS.signUp)
  @HttpCode(HttpStatus.CREATED)
  async signUpUser(@Body() body: SignUpDto): Promise<SessionTokensResponse> {
    const tokens = await this.signUp.execute(body);
    return SessionTokensResponseDto.create(tokens);
  }

  @Post(AUTH_HTTP_PATHS.signIn)
  @HttpCode(HttpStatus.OK)
  async signInUser(@Body() body: SignInDto): Promise<SessionTokensResponse> {
    const tokens = await this.signIn.execute(body);
    return SessionTokensResponseDto.create(tokens);
  }

  @Post(AUTH_HTTP_PATHS.refresh)
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: RefreshDto): Promise<SessionTokensResponse> {
    const tokens = await this.refreshSession.execute(body);
    return SessionTokensResponseDto.create(tokens);
  }

  @Post(AUTH_HTTP_PATHS.logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutUser(@Body() body: LogoutDto): Promise<void> {
    await this.logout.execute(body);
  }
}
