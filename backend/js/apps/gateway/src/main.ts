import { NestFactory } from '@nestjs/core';
import { RoomlyConfigService } from '@roomly/common';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const config = app.get(RoomlyConfigService);
  const port = config.port.gateway;
  await app.listen(port);
  console.log(`gateway listening on ${port}`);
}
void bootstrap();
