import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
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
import { AuthHttpClient } from './auth/auth-http.client';
import { AuthModule } from './auth/auth.module';
import { UserServiceHttp } from './http/user-service.http';
import { UserHttpClient } from './user/user-http.client';
import { UsersController } from './user/users.controller';

@Module({
  imports: [
    createRoomlyLoggerModule('gateway'),
    RoomlyConfigModule.forRoot({
      load: ['services', 'gateway', 'redis', 'auth'],
    }),
    HealthModule,
    AuthModule,
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
  controllers: [UsersController, AuthController],
  providers: [
    UserServiceHttp,
    UserHttpClient,
    AuthHttpClient,
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
