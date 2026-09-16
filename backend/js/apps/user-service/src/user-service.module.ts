import { Module } from '@nestjs/common';
import { HealthModule, RoomlyConfigModule } from '@roomly/common';
import { HttpModule } from './adapters/inbound/http/http.module';

@Module({
  imports: [
    RoomlyConfigModule.forRoot({
      load: ['services', 'auth', 'postgres', 'redis', 'rabbitmq'],
    }),
    HealthModule,
    HttpModule,
  ],
})
export class UserServiceModule {}
