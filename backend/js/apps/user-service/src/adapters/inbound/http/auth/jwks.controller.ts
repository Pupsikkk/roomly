import { Controller, Get, Inject } from '@nestjs/common';
import { AUTH_HTTP_PATHS, type JwksResponse } from '@roomly/contracts';
import {
  TOKEN_SIGNER,
  type TokenSignerPort,
} from '../../../../application/ports/token-signer.port';

@Controller()
export class JwksController {
  constructor(
    @Inject(TOKEN_SIGNER) private readonly tokenSigner: TokenSignerPort,
  ) {}

  @Get(AUTH_HTTP_PATHS.jwks)
  getJwks(): Promise<JwksResponse> {
    return this.tokenSigner.getJwks();
  }
}
