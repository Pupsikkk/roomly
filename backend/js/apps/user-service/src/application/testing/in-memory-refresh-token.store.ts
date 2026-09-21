import type {
  RefreshTokenRecord,
  RefreshTokenStorePort,
} from '../ports/refresh-token.store';

/** In-memory refresh token store (one-time take + revoke). */
export class InMemoryRefreshTokenStore implements RefreshTokenStorePort {
  private readonly byToken = new Map<string, RefreshTokenRecord>();

  async save(
    rawToken: string,
    record: RefreshTokenRecord,
    _ttlSeconds: number,
  ): Promise<void> {
    this.byToken.set(rawToken, record);
  }

  async take(rawToken: string): Promise<RefreshTokenRecord | null> {
    const record = this.byToken.get(rawToken) ?? null;
    if (record) this.byToken.delete(rawToken);
    return record;
  }

  async revoke(rawToken: string): Promise<void> {
    this.byToken.delete(rawToken);
  }

  has(rawToken: string): boolean {
    return this.byToken.has(rawToken);
  }
}
