import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoomlyConfigService, Traced } from '@roomly/common';
import {
  AUTH_COOKIE_NAMES,
  AUTH_HTTP_PATHS,
  type AuthSessionResponse,
} from '@roomly/contracts';
import type { Request, Response } from 'express';
import { AuthHttpClient } from './auth-http.client';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';
import { AuthSessionResponseDto } from './dto/auth-session-response.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtVerifierService } from './jwt-verifier.service';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthHttpClient,
    private readonly config: RoomlyConfigService,
    private readonly verifier: JwtVerifierService,
  ) {}

  @Post(AUTH_HTTP_PATHS.signUp)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Sign up — creates user and sets httpOnly session cookies',
  })
  @ApiCreatedResponse({ type: AuthSessionResponseDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  async signUp(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    const tokens = await this.auth.signUp(body);
    setAuthCookies(res, tokens, this.config.gateway);
    return { expiresIn: tokens.accessExpiresIn };
  }

  @Post(AUTH_HTTP_PATHS.signIn)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in — sets httpOnly access + refresh cookies',
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    const tokens = await this.auth.signIn(body);
    setAuthCookies(res, tokens, this.config.gateway);
    return { expiresIn: tokens.accessExpiresIn };
  }

  @Post(AUTH_HTTP_PATHS.refresh)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(AUTH_COOKIE_NAMES.refresh)
  @ApiOperation({
    summary: 'Rotate session using refresh_token cookie',
  })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthSessionResponse> {
    const refreshToken = req.cookies?.[AUTH_COOKIE_NAMES.refresh];
    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException('Missing refresh token cookie');
    }

    const tokens = await this.auth.refresh({ refreshToken });
    setAuthCookies(res, tokens, this.config.gateway);
    return { expiresIn: tokens.accessExpiresIn };
  }

  @Post(AUTH_HTTP_PATHS.logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth(AUTH_COOKIE_NAMES.access)
  @ApiOperation({
    summary: 'Logout — revoke tokens and clear auth cookies',
  })
  @ApiNoContentResponse()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const accessToken = req.cookies?.[AUTH_COOKIE_NAMES.access];
    const refreshToken = req.cookies?.[AUTH_COOKIE_NAMES.refresh];

    let jti: string | undefined;
    let exp: number | undefined;
    if (typeof accessToken === 'string' && accessToken) {
      try {
        const claims = await this.verifier.verifyAccessToken(accessToken);
        jti = claims.jti;
        exp = claims.exp;
      } catch {
        // Access may already be expired/revoked — still clear refresh.
      }
    }

    await this.auth.logout({
      jti,
      exp,
      refreshToken:
        typeof refreshToken === 'string' ? refreshToken : undefined,
    });

    clearAuthCookies(res, this.config.gateway);
  }
}
