import { Module } from '@nestjs/common';
import {
  GetUserByIdUseCase,
  LogoutUseCase,
  RefreshSessionUseCase,
  SignInUseCase,
  SignUpUseCase,
} from '../application/index';
import { AuthModule } from './outbound/auth/auth.module';
import { EventsModule } from './outbound/events/events.module';
import { PersistenceModule } from './outbound/persistence/persistence.module';
import { RedisAdapterModule } from './outbound/redis/redis.module';

/**
 * Shared use cases + outbound adapters for HTTP and gRPC inbound modules.
 */
@Module({
  imports: [
    PersistenceModule,
    RedisAdapterModule,
    EventsModule,
    AuthModule,
  ],
  providers: [
    GetUserByIdUseCase,
    SignUpUseCase,
    SignInUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
  ],
  exports: [
    PersistenceModule,
    RedisAdapterModule,
    EventsModule,
    AuthModule,
    GetUserByIdUseCase,
    SignUpUseCase,
    SignInUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
  ],
})
export class ApplicationModule {}
