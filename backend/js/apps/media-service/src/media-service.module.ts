import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  createRoomlyLoggerModule,
  HealthModule,
  RoomlyConfigModule,
  UnhandledExceptionFilter,
} from '@roomly/common';
import { S3Module } from '@roomly/infra';
import { MediaHttpModule } from './adapters/inbound/http/media-http.module';

@Module({
  imports: [
    createRoomlyLoggerModule('media-service'),
    RoomlyConfigModule.forRoot({
      load: ['services', 'postgres', 's3'],
    }),
    HealthModule,
    S3Module.forRoot({ isGlobal: true }),
    MediaHttpModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
  ],
})
export class MediaServiceModule {}
