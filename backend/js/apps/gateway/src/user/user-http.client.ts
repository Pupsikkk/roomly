import { Injectable } from '@nestjs/common';
import { Traced } from '@roomly/common';
import {
  USER_HTTP_PATHS,
  type UserResponse,
} from '@roomly/contracts';
import { UserServiceHttp } from '../http/user-service.http';

@Traced({ work: 'network' })
@Injectable()
export class UserHttpClient {
  constructor(private readonly http: UserServiceHttp) {}

  getUserById(id: string): Promise<UserResponse> {
    return this.http.get<UserResponse>(`/${USER_HTTP_PATHS.root}/${id}`);
  }
}
