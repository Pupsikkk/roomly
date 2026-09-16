import { Module } from '@nestjs/common';
import {
  CreateUserUseCase,
  GetUserByIdUseCase,
} from '../../../application/index';
import { EventsModule } from '../../outbound/events/events.module';
import { PersistenceModule } from '../../outbound/persistence/persistence.module';
import { RedisAdapterModule } from '../../outbound/redis/redis.module';
import { UsersController } from './user/users.controller';

@Module({
  imports: [PersistenceModule, RedisAdapterModule, EventsModule],
  controllers: [UsersController],
  providers: [CreateUserUseCase, GetUserByIdUseCase],
})
export class HttpModule {}
