import { Module } from '@nestjs/common';
import { HealthModule, RoomlyConfigModule } from '@roomly/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    RoomlyConfigModule.forRoot({
      load: ['postgres'],
    }),
    HealthModule,
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
