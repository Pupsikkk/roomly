import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter, RoomlyConfigService } from '@roomly/common';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  const config = app.get(RoomlyConfigService);
  const port = config.port.notification;
  await app.listen(port);
  console.log(`notification-service listening on ${port}`);
}
void bootstrap();
