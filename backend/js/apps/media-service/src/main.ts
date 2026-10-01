import './otel';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RoomlyConfigService } from '@roomly/common';
import { Logger } from 'nestjs-pino';
import { MediaServiceModule } from './media-service.module';

async function bootstrap() {
  const app = await NestFactory.create(MediaServiceModule, { bufferLogs: true });
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
  const port = config.port.media;
  await app.listen(port);
  logger.log(`media-service listening on ${port}`);
}
void bootstrap();
