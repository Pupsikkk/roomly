import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import Redis from 'ioredis';

/**
 * Shared JWT denylist (keyPrefix `auth:`).
 * Used by user-service (revoke on logout) and gateway (reject revoked tokens).
 */
@Injectable()
export class JwtDenylistService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor(config: RoomlyConfigService) {
    const { host, port } = config.redis;
    this.client = new Redis({
      host,
      port,
      keyPrefix: 'auth:',
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }

  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return;
    await this.client.set(`deny:${jti}`, '1', 'EX', ttlSeconds);
  }

  async isRevoked(jti: string): Promise<boolean> {
    return (await this.client.exists(`deny:${jti}`)) === 1;
  }
}
