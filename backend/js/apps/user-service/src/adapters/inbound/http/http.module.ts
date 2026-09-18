import { Module } from '@nestjs/common';
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
  ],
})
export class HttpModule {}
