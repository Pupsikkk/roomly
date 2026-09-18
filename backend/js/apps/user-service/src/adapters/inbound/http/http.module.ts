import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UnhandledExceptionFilter } from '@roomly/common';
import {
  GetUserByIdUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  SignInUseCase,
  SignUpUseCase,
} from '../../../application/index';
import { AuthModule } from '../../outbound/auth/auth.module';
import { EventsModule } from '../../outbound/events/events.module';
import { PersistenceModule } from '../../outbound/persistence/persistence.module';
import { RedisAdapterModule } from '../../outbound/redis/redis.module';
import { AuthController } from './auth/auth.controller';
import { JwksController } from './auth/jwks.controller';
import { DomainExceptionFilter } from './domain-exception.filter';
import { UsersController } from './user/users.controller';

@Module({
  imports: [
    PersistenceModule,
    RedisAdapterModule,
    EventsModule,
    AuthModule,
  ],
  controllers: [UsersController, AuthController, JwksController],
  providers: [
    GetUserByIdUseCase,
    SignUpUseCase,
    SignInUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    // Unhandled first in registration → Domain checked first (Nest reverse order).
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class HttpModule {}
