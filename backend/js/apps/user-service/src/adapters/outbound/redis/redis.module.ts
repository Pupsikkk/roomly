import { Module } from '@nestjs/common';
import { RedisModule } from '@roomly/infra';

@Module({
  imports: [RedisModule.forRoot({ keyPrefix: 'user:' })],
  exports: [RedisModule],
})
export class RedisAdapterModule {}
