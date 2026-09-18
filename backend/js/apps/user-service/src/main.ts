import './tracing';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RoomlyConfigService } from '@roomly/common';
import { Logger } from 'nestjs-pino';
import { UserServiceModule } from './user-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UserServiceModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = app.get(RoomlyConfigService);
  const logger = app.get(Logger);
  const port = config.port.user;
  await app.listen(port);
  logger.log(`user-service listening on ${port}`);
}
void bootstrap();
