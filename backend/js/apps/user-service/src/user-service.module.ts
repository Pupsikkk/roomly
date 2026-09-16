import { Module } from '@nestjs/common';
import { HealthModule, RoomlyConfigModule } from '@roomly/common';
import { UserServiceController } from './user-service.controller';
import { UserServiceService } from './user-service.service';

@Module({
  imports: [
    RoomlyConfigModule.forRoot({
      load: ['services', 'auth', 'postgres', 'redis'],
    }),
    HealthModule,
  ],
  controllers: [UserServiceController],
  providers: [UserServiceService],
})
export class UserServiceModule {}
