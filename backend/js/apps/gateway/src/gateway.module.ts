import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { UserGrpcModule } from '@roomly/clients/user/grpc';
import {
  createRoomlyLoggerModule,
  HealthModule,
  RoomlyConfigModule,
  RoomlyConfigService,
  TraceIdInterceptor,
  UnhandledExceptionFilter,
} from '@roomly/common';
import { RedisClientService, RedisModule } from '@roomly/infra';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './user/users.controller';

@Module({
  imports: [
    createRoomlyLoggerModule('gateway'),
    RoomlyConfigModule.forRoot({
      load: ['services', 'gateway', 'redis', 'auth'],
    }),
    HealthModule,
    AuthModule,
    UserGrpcModule,
    RedisModule.forRoot({
      isGlobal: true,
      keyPrefix: 'gateway:',
    }),
    ThrottlerModule.forRootAsync({
      inject: [RoomlyConfigService, RedisClientService],
      useFactory: (
        config: RoomlyConfigService,
        redis: RedisClientService,
      ) => ({
        // THROTTLE_LIMIT=0 disables (useful for local k6 — all VUs share one IP).
        skipIf: () => config.gateway.throttleLimit <= 0,
        throttlers: [
          {
            name: 'gateway',
            ttl: config.gateway.throttleTtlMs,
            limit: Math.max(config.gateway.throttleLimit, 1),
            generateKey: (_ctx, tracker, throttlerName) =>
              `throttle:${throttlerName}:${tracker}`,
          },
        ],
        storage: new ThrottlerStorageRedisService(redis.client),
      }),
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TraceIdInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class GatewayModule {}
