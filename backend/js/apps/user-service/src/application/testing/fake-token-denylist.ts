import type { TokenDenylistPort } from '../ports/token-denylist.port';

/** Records access-token denylist revocations for assertions. */
export class FakeTokenDenylist implements TokenDenylistPort {
  readonly revocations: { jti: string; ttlSeconds: number }[] = [];
  private readonly revoked = new Set<string>();

  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    this.revocations.push({ jti, ttlSeconds });
    if (ttlSeconds > 0) this.revoked.add(jti);
  }

  async isRevoked(jti: string): Promise<boolean> {
    return this.revoked.has(jti);
  }
}
