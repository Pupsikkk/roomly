import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Traced } from '@roomly/common';
import { userV1 } from '@roomly/contracts';
import { firstValueFrom } from 'rxjs';
import { mapUserServiceGrpcError } from './map-grpc-error';
import { USER_SERVICE_GRPC_CLIENT } from './tokens';

/**
 * Outbound UserService (unary → Promise), same shape as UserHttpClient.
 */
@Traced({ work: 'network' })
@Injectable()
export class UserGrpcClient implements OnModuleInit {
  private users!: userV1.UserService;

  constructor(
    @Inject(USER_SERVICE_GRPC_CLIENT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.users = this.client.getService<userV1.UserService>('UserService');
  }

  async getUserById(
    data: userV1.GetUserByIdRequest,
  ): Promise<userV1.UserResponse> {
    try {
      return await firstValueFrom(this.users.getUserById(data));
    } catch (err) {
      mapUserServiceGrpcError(err);
    }
  }
}
