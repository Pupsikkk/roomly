import { Injectable } from '@nestjs/common';
import { JwtDenylistService } from '@roomly/infra';
import type { TokenDenylistPort } from '../../../application/ports/token-denylist.port';

@Injectable()
export class RedisTokenDenylist implements TokenDenylistPort {
  constructor(private readonly denylist: JwtDenylistService) {}

  revoke(jti: string, ttlSeconds: number): Promise<void> {
    return this.denylist.revoke(jti, ttlSeconds);
  }

  isRevoked(jti: string): Promise<boolean> {
    return this.denylist.isRevoked(jti);
  }
}
