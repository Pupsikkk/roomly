import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RoomlyConfigService } from '@roomly/common';
import { DomainExceptionFilter } from './adapters/inbound/http/domain-exception.filter';
import { UserServiceModule } from './user-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
  const config = app.get(RoomlyConfigService);
  const port = config.port.user;
  await app.listen(port);
  console.log(`user-service listening on ${port}`);
}
void bootstrap();
