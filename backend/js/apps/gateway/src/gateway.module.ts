import { Module } from '@nestjs/common';
import { CommonModule } from '@roomly/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [CommonModule],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
