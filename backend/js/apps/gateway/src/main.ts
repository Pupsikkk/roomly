import './otel';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RoomlyConfigService, TRACE_ID_HEADER } from '@roomly/common';
import { AUTH_COOKIE_NAMES } from '@roomly/contracts';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const config = app.get(RoomlyConfigService);
  const logger = app.get(Logger);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors(buildCorsOptions(config.gateway.corsOrigins));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('Roomly API')
    .setDescription(
      'API Gateway — public HTTP entrypoint. Auth uses httpOnly cookies.',
    )
    .setVersion('0.1')
    .addCookieAuth(AUTH_COOKIE_NAMES.access)
    .addCookieAuth(AUTH_COOKIE_NAMES.refresh)
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('docs', app, document);

  const port = config.port.gateway;
  await app.listen(port);
  logger.log(`gateway listening on ${port}`);
  logger.log(`swagger UI: http://localhost:${port}/docs`);
}
void bootstrap();

function buildCorsOptions(origins: string[]) {
  const exposedHeaders = [TRACE_ID_HEADER];
  if (origins.includes('*')) {
    return { origin: true, credentials: true, exposedHeaders };
  }
  return { origin: origins, credentials: true, exposedHeaders };
}
