import { Module } from '@nestjs/common';
import {
  createRoomlyLoggerModule,
  HealthModule,
  RoomlyConfigModule,
} from '@roomly/common';
import { GrpcModule } from './adapters/inbound/grpc/grpc.module';
import { HttpModule } from './adapters/inbound/http/http.module';

@Module({
  imports: [
    createRoomlyLoggerModule('user-service'),
    RoomlyConfigModule.forRoot({
      load: ['services', 'auth', 'authSigning', 'postgres', 'redis', 'rabbitmq'],
    }),
    HealthModule,
    HttpModule,
    GrpcModule,
  ],
})
export class UserServiceModule {}
