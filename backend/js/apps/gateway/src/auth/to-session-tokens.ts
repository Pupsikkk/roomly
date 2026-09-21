import type { userV1, SessionTokensResponse } from '@roomly/contracts';

/** Proto session tokens → HTTP contract used by cookies / BFF. */
export function toSessionTokens(
  tokens: userV1.SessionTokensResponse,
): SessionTokensResponse {
  return {
    accessToken: tokens.accessToken ?? '',
    refreshToken: tokens.refreshToken ?? '',
    accessExpiresIn: Number(tokens.accessExpiresIn ?? 0),
    refreshExpiresIn: Number(tokens.refreshExpiresIn ?? 0),
    accessExp: Number(tokens.accessExp ?? 0),
  };
}
