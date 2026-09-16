import type { JwksResponse } from '@roomly/contracts';

export const TOKEN_SIGNER = Symbol('TOKEN_SIGNER');

export type SignAccessTokenInput = {
  userId: string;
};

export type SignedAccessToken = {
  accessToken: string;
  jti: string;
  /** Seconds until expiry (for AuthTokenResponse.expiresIn) */
  expiresIn: number;
  /** Unix expiry (seconds) */
  exp: number;
};

export interface TokenSignerPort {
  signAccessToken(input: SignAccessTokenInput): Promise<SignedAccessToken>;
  getJwks(): Promise<JwksResponse>;
}
