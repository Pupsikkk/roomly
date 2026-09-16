import { Injectable } from '@nestjs/common';
import {
  AUTH_HTTP_PATHS,
  type LogoutRequest,
  type RefreshRequest,
  type SessionTokensResponse,
  type SignInRequest,
  type SignUpRequest,
} from '@roomly/contracts';
import { UserServiceHttp } from '../http/user-service.http';

@Injectable()
export class AuthHttpClient {
  constructor(private readonly http: UserServiceHttp) {}

  signUp(body: SignUpRequest): Promise<SessionTokensResponse> {
    return this.http.post<SessionTokensResponse>(
      `/${AUTH_HTTP_PATHS.signUp}`,
      body,
    );
  }

  signIn(body: SignInRequest): Promise<SessionTokensResponse> {
    return this.http.post<SessionTokensResponse>(
      `/${AUTH_HTTP_PATHS.signIn}`,
      body,
    );
  }

  refresh(body: RefreshRequest): Promise<SessionTokensResponse> {
    return this.http.post<SessionTokensResponse>(
      `/${AUTH_HTTP_PATHS.refresh}`,
      body,
    );
  }

  logout(body: LogoutRequest): Promise<void> {
    return this.http.post(`/${AUTH_HTTP_PATHS.logout}`, body);
  }
}
