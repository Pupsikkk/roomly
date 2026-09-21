import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { UnhandledExceptionFilter } from '@roomly/common';
import { ApplicationModule } from '../../application.module';
import { AuthController } from './auth/auth.controller';
import { JwksController } from './auth/jwks.controller';
import { DomainExceptionFilter } from './domain-exception.filter';
import { UsersController } from './user/users.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UsersController, AuthController, JwksController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class HttpModule {}
