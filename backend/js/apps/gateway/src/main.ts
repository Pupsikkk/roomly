import { NestFactory } from '@nestjs/core';
import { resolvePort } from '@roomly/common';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const port = resolvePort('gateway', 'GATEWAY_PORT');
  await app.listen(port);
  console.log(`gateway listening on ${port}`);
}
void bootstrap();
