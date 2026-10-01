import { Module } from '@nestjs/common';
import { MediaHttpClient } from './media.http.client';

@Module({
  providers: [MediaHttpClient],
  exports: [MediaHttpClient],
})
export class MediaHttpModule {}
