import './otel';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RoomlyConfigService } from '@roomly/common';
import { userV1 } from '@roomly/contracts';
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
  const httpPort = config.port.user;
  const grpcListen = `0.0.0.0:${config.services.userServiceGrpcPort}`;

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: userV1.PACKAGE,
        protoPath: userV1.protoPath(),
        url: grpcListen,
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      },
    },
    // Hybrid apps do not inherit APP_* enhancers on the microservice unless set.
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(httpPort);
  logger.log(`user-service HTTP on ${httpPort}`);
  logger.log(`user-service gRPC on ${grpcListen}`);
}
void bootstrap();
