import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { userV1 } from '@roomly/contracts';
import type { SessionTokens } from '../../../application/dto/session-tokens';
import {
  LogoutUseCase,
  RefreshSessionUseCase,
  SignInUseCase,
  SignUpUseCase,
} from '../../../application/index';
import { rethrowAsRpc } from './rethrow-as-rpc';

@Controller()
export class AuthGrpcController implements userV1.AuthServiceController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly refreshSession: RefreshSessionUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @GrpcMethod('AuthService', 'SignUp')
  async signUp(
    data: userV1.SignUpRequest,
  ): Promise<userV1.SessionTokensResponse> {
    try {
      const tokens = await this.signUpUseCase.execute({
        email: data.email ?? '',
        password: data.password ?? '',
      });
      return toProtoTokens(tokens);
    } catch (err) {
      rethrowAsRpc(err);
    }
  }

  @GrpcMethod('AuthService', 'SignIn')
  async signIn(
    data: userV1.SignInRequest,
  ): Promise<userV1.SessionTokensResponse> {
    try {
      const tokens = await this.signInUseCase.execute({
        email: data.email ?? '',
        password: data.password ?? '',
      });
      return toProtoTokens(tokens);
    } catch (err) {
      rethrowAsRpc(err);
    }
  }

  @GrpcMethod('AuthService', 'Refresh')
  async refresh(
    data: userV1.RefreshRequest,
  ): Promise<userV1.SessionTokensResponse> {
    try {
      const tokens = await this.refreshSession.execute({
        refreshToken: data.refreshToken ?? '',
      });
      return toProtoTokens(tokens);
    } catch (err) {
      rethrowAsRpc(err);
    }
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(
    data: userV1.LogoutRequest,
  ): Promise<userV1.LogoutResponse> {
    try {
      await this.logoutUseCase.execute({
        jti: data.jti || undefined,
        exp: data.hasExp ? Number(data.exp) : undefined,
        refreshToken: data.refreshToken || undefined,
      });
      return {};
    } catch (err) {
      rethrowAsRpc(err);
    }
  }
}

function toProtoTokens(tokens: SessionTokens): userV1.SessionTokensResponse {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessExpiresIn: tokens.accessExpiresIn,
    refreshExpiresIn: tokens.refreshExpiresIn,
    accessExp: tokens.accessExp,
  };
}
