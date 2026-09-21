import type { SessionTokens } from '../../../../../../application/dto/session-tokens';
import type { SessionTokensResponse } from '@roomly/contracts';

export class SessionTokensResponseDto {
  static create(tokens: SessionTokens): SessionTokensResponse {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresIn: tokens.accessExpiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      accessExp: tokens.accessExp,
    };
  }
}
