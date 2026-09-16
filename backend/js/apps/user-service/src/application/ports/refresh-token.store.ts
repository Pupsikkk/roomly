import { createHash, randomBytes } from 'node:crypto';

export const REFRESH_TOKEN_STORE = Symbol('REFRESH_TOKEN_STORE');

export type RefreshTokenRecord = {
  userId: string;
  familyId: string;
};

export interface RefreshTokenStorePort {
  save(
    rawToken: string,
    record: RefreshTokenRecord,
    ttlSeconds: number,
  ): Promise<void>;
  /** Get + delete (one-time use / rotation). */
  take(rawToken: string): Promise<RefreshTokenRecord | null>;
  revoke(rawToken: string): Promise<void>;
}

export function createRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
