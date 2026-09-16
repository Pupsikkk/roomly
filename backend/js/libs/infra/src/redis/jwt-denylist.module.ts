import { DynamicModule, Module } from '@nestjs/common';
import { JwtDenylistService } from './jwt-denylist.service';

@Module({})
export class JwtDenylistModule {
  static forRoot(options: { isGlobal?: boolean } = {}): DynamicModule {
    return {
      module: JwtDenylistModule,
      global: options.isGlobal ?? false,
      providers: [JwtDenylistService],
      exports: [JwtDenylistService],
    };
  }
}
