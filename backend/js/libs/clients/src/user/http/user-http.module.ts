import { Module } from '@nestjs/common';
import { AuthHttpClient } from './auth.http.client';
import { UserHttpClient } from './user.http.client';
import { UserServiceHttp } from './user-service.http';

@Module({
  providers: [UserServiceHttp, AuthHttpClient, UserHttpClient],
  exports: [UserServiceHttp, AuthHttpClient, UserHttpClient],
})
export class UserHttpModule {}
