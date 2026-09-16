import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import {
  HealthModule,
  RoomlyConfigModule,
  RoomlyConfigService,
} from '@roomly/common';
import { RedisClientService, RedisModule } from '@roomly/infra';
import { UserHttpClient } from './user/user-http.client';
import { UsersController } from './user/users.controller';

@Module({
  imports: [
    RoomlyConfigModule.forRoot({
      load: ['services', 'gateway', 'redis'],
    }),
    HealthModule,
    RedisModule.forRoot({
      isGlobal: true,
      keyPrefix: 'roomly:gateway:',
    }),
    ThrottlerModule.forRootAsync({
      inject: [RoomlyConfigService, RedisClientService],
      useFactory: (
        config: RoomlyConfigService,
        redis: RedisClientService,
      ) => ({
        throttlers: [
          {
            name: 'gateway',
            ttl: config.gateway.throttleTtlMs,
            limit: config.gateway.throttleLimit,
            generateKey: (_ctx, tracker, throttlerName) =>
              `throttle:${throttlerName}:${tracker}`,
          },
        ],
        storage: new ThrottlerStorageRedisService(redis.client),
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    UserHttpClient,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class GatewayModule {}
