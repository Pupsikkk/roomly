import { Global, Module } from '@nestjs/common';
import { JwtDenylistModule } from '@roomly/infra';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtVerifierService } from './jwt-verifier.service';

@Global()
@Module({
  imports: [JwtDenylistModule.forRoot()],
  providers: [JwtVerifierService, JwtAuthGuard],
  exports: [JwtVerifierService, JwtAuthGuard],
})
export class AuthModule {}
