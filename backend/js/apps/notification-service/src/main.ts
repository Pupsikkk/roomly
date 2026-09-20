import './otel';
import { NestFactory } from '@nestjs/core';
import { RoomlyConfigService } from '@roomly/common';
import { Logger } from 'nestjs-pino';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  const config = app.get(RoomlyConfigService);
  const logger = app.get(Logger);
  const port = config.port.notification;
  await app.listen(port);
  logger.log(`notification-service listening on ${port}`);
}
void bootstrap();
