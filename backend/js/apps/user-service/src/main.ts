import { NestFactory } from '@nestjs/core';
import { resolvePort } from '@roomly/common';
import { UserServiceModule } from './user-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  const port = resolvePort('user', 'USER_SERVICE_PORT');
  await app.listen(port);
  console.log(`user-service listening on ${port}`);
}
void bootstrap();
