import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import type { AccessTokenClaims } from '@roomly/contracts';
import { JwtDenylistService } from '@roomly/infra';
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';

@Injectable()
export class JwtVerifierService implements OnModuleInit {
  private getKey!: JWTVerifyGetKey;

  constructor(
    private readonly config: RoomlyConfigService,
    private readonly denylist: JwtDenylistService,
  ) {}

  onModuleInit(): void {
    const { jwksUri } = this.config.auth;
    this.getKey = createRemoteJWKSet(new URL(jwksUri));
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const auth = this.config.auth;
    let claims: AccessTokenClaims;
    try {
      const { payload } = await jwtVerify(token, this.getKey, {
        issuer: auth.jwtIssuer,
        audience: auth.jwtAudience,
        algorithms: ['RS256'],
      });
      claims = toAccessTokenClaims(payload);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    if (await this.denylist.isRevoked(claims.jti)) {
      throw new UnauthorizedException('Access token has been revoked');
    }

    return claims;
  }
}

function toAccessTokenClaims(payload: JWTPayload): AccessTokenClaims {
  const sub = payload.sub;
  const jti = payload.jti;
  const iss = payload.iss;
  const aud = payload.aud;
  const iat = payload.iat;
  const exp = payload.exp;

  if (
    typeof sub !== 'string' ||
    typeof jti !== 'string' ||
    typeof iss !== 'string' ||
    typeof iat !== 'number' ||
    typeof exp !== 'number'
  ) {
    throw new UnauthorizedException('Malformed access token claims');
  }

  const audience =
    typeof aud === 'string' ? aud : Array.isArray(aud) ? aud[0] : undefined;
  if (!audience) {
    throw new UnauthorizedException('Malformed access token claims');
  }

  return { sub, jti, iss, aud: audience, iat, exp };
}
