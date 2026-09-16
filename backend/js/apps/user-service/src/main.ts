import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter, RoomlyConfigService } from '@roomly/common';
import { UserServiceModule } from './user-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  const config = app.get(RoomlyConfigService);
  const port = config.port.user;
  await app.listen(port);
  console.log(`user-service listening on ${port}`);
}
void bootstrap();
