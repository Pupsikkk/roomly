export const TOKEN_DENYLIST = Symbol('TOKEN_DENYLIST');

export interface TokenDenylistPort {
  revoke(jti: string, ttlSeconds: number): Promise<void>;
  isRevoked(jti: string): Promise<boolean>;
}
