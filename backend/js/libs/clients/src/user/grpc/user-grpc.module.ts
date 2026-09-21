import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RoomlyConfigService } from '@roomly/common';
import { userV1 } from '@roomly/contracts';
import { AuthGrpcClient } from './auth.grpc.client';
import { USER_SERVICE_GRPC_CLIENT } from './tokens';
import { UserGrpcClient } from './user.grpc.client';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USER_SERVICE_GRPC_CLIENT,
        inject: [RoomlyConfigService],
        useFactory: (config: RoomlyConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: userV1.PACKAGE,
            protoPath: userV1.protoPath(),
            url: config.services.userServiceGrpcUrl,
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [AuthGrpcClient, UserGrpcClient],
  exports: [AuthGrpcClient, UserGrpcClient],
})
export class UserGrpcModule {}
