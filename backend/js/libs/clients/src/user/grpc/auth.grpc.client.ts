import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Traced } from '@roomly/common';
import { userV1 } from '@roomly/contracts';
import { firstValueFrom } from 'rxjs';
import { mapUserServiceGrpcError } from './map-grpc-error';
import { USER_SERVICE_GRPC_CLIENT } from './tokens';

/**
 * Outbound AuthService (unary → Promise), same shape as AuthHttpClient.
 */
@Traced({ work: 'network' })
@Injectable()
export class AuthGrpcClient implements OnModuleInit {
  private auth!: userV1.AuthService;

  constructor(
    @Inject(USER_SERVICE_GRPC_CLIENT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.auth = this.client.getService<userV1.AuthService>('AuthService');
  }

  async signUp(
    data: userV1.SignUpRequest,
  ): Promise<userV1.SessionTokensResponse> {
    try {
      return await firstValueFrom(this.auth.signUp(data));
    } catch (err) {
      mapUserServiceGrpcError(err);
    }
  }

  async signIn(
    data: userV1.SignInRequest,
  ): Promise<userV1.SessionTokensResponse> {
    try {
      return await firstValueFrom(this.auth.signIn(data));
    } catch (err) {
      mapUserServiceGrpcError(err);
    }
  }

  async refresh(
    data: userV1.RefreshRequest,
  ): Promise<userV1.SessionTokensResponse> {
    try {
      return await firstValueFrom(this.auth.refresh(data));
    } catch (err) {
      mapUserServiceGrpcError(err);
    }
  }

  async logout(data: userV1.LogoutRequest): Promise<userV1.LogoutResponse> {
    try {
      return await firstValueFrom(this.auth.logout(data));
    } catch (err) {
      mapUserServiceGrpcError(err);
    }
  }
}
