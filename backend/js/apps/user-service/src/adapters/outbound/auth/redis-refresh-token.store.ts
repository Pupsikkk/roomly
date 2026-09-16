import { Injectable } from '@nestjs/common';
import { RedisClientService } from '@roomly/infra';
import {
  hashRefreshToken,
  type RefreshTokenRecord,
  type RefreshTokenStorePort,
} from '../../../application/ports/refresh-token.store';

@Injectable()
export class RedisRefreshTokenStore implements RefreshTokenStorePort {
  constructor(private readonly redis: RedisClientService) {}

  async save(
    rawToken: string,
    record: RefreshTokenRecord,
    ttlSeconds: number,
  ): Promise<void> {
    if (ttlSeconds <= 0) return;
    await this.redis.client.set(
      this.key(rawToken),
      JSON.stringify(record),
      'EX',
      ttlSeconds,
    );
  }

  async take(rawToken: string): Promise<RefreshTokenRecord | null> {
    const key = this.key(rawToken);
    const raw = await this.redis.client.get(key);
    if (!raw) return null;
    await this.redis.client.del(key);
    return JSON.parse(raw) as RefreshTokenRecord;
  }

  async revoke(rawToken: string): Promise<void> {
    await this.redis.client.del(this.key(rawToken));
  }

  private key(rawToken: string): string {
    return `refresh:${hashRefreshToken(rawToken)}`;
  }
}
