import './tracing';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RoomlyConfigService } from '@roomly/common';
import { AUTH_COOKIE_NAMES } from '@roomly/contracts';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  const config = app.get(RoomlyConfigService);

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
  console.log(`gateway listening on ${port}`);
  console.log(`swagger UI: http://localhost:${port}/docs`);
}
void bootstrap();

function buildCorsOptions(origins: string[]) {
  if (origins.includes('*')) {
    return { origin: true, credentials: true };
  }
  return { origin: origins, credentials: true };
}
