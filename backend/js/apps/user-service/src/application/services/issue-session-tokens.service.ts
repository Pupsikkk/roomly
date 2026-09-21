import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  durationToSeconds,
  RoomlyConfigService,
  Traced,
} from '@roomly/common';
import type { SessionTokens } from '../dto/session-tokens';
import {
  createRefreshToken,
  REFRESH_TOKEN_STORE,
  type RefreshTokenStorePort,
} from '../ports/refresh-token.store';
import {
  TOKEN_SIGNER,
  type TokenSignerPort,
} from '../ports/token-signer.port';

/**
 * Issue access JWT + opaque refresh token (stored hashed in Redis).
 * Used by sign-in and refresh use cases.
 */
@Traced()
@Injectable()
export class IssueSessionTokensService {
  constructor(
    private readonly config: RoomlyConfigService,
    @Inject(TOKEN_SIGNER)
    private readonly tokens: TokenSignerPort,
    @Inject(REFRESH_TOKEN_STORE)
    private readonly refreshTokens: RefreshTokenStorePort,
  ) {}

  async issue(
    userId: string,
    familyId: string = randomUUID(),
  ): Promise<SessionTokens> {
    const access = await this.tokens.signAccessToken({ userId });
    const refreshToken = createRefreshToken();
    const refreshExpiresIn = durationToSeconds(
      this.config.authSigning.jwtRefreshExpiresIn,
    );

    await this.refreshTokens.save(
      refreshToken,
      { userId, familyId },
      refreshExpiresIn,
    );

    return {
      accessToken: access.accessToken,
      refreshToken,
      accessExpiresIn: access.expiresIn,
      refreshExpiresIn,
      accessExp: access.exp,
    };
  }
}
