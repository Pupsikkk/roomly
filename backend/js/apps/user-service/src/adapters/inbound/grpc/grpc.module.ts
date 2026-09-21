import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GrpcAccessLogInterceptor } from '@roomly/common';
import { ApplicationModule } from '../../application.module';
import { AuthGrpcController } from './auth.grpc.controller';
import { GrpcDomainErrorInterceptor } from './grpc-domain-error.interceptor';
import { UsersGrpcController } from './users.grpc.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [AuthGrpcController, UsersGrpcController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcAccessLogInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GrpcDomainErrorInterceptor,
    },
  ],
})
export class GrpcModule {}
