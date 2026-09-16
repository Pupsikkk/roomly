import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_COOKIE_NAMES, type AccessTokenClaims } from '@roomly/contracts';
import type { Request } from 'express';
import { JwtVerifierService } from './jwt-verifier.service';

export type AuthenticatedRequest = Request & {
  user?: AccessTokenClaims;
  accessToken?: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly verifier: JwtVerifierService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractAccessToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token cookie');
    }

    const claims = await this.verifier.verifyAccessToken(token);
    request.user = claims;
    request.accessToken = token;
    return true;
  }
}

function extractAccessToken(request: Request): string | null {
  const fromCookie = request.cookies?.[AUTH_COOKIE_NAMES.access];
  if (typeof fromCookie === 'string' && fromCookie.length > 0) {
    return fromCookie;
  }
  return null;
}
