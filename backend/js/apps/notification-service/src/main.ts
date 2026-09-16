import { NestFactory } from '@nestjs/core';
import { resolvePort } from '@roomly/common';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  const port = resolvePort('notification', 'NOTIFICATION_SERVICE_PORT');
  await app.listen(port);
  console.log(`notification-service listening on ${port}`);
}
void bootstrap();
