import { createPrivateKey, createPublicKey, randomUUID, type KeyObject } from 'node:crypto';
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  resolveJwtPrivateKeyPem,
  RoomlyConfigService,
  ExcludeTracer,
  Traced,
} from '@roomly/common';
import type { Jwk, JwksResponse } from '@roomly/contracts';
import { decodeJwt, exportJWK, SignJWT } from 'jose';
import type {
  SignAccessTokenInput,
  SignedAccessToken,
  TokenSignerPort,
} from '../../../application/ports/token-signer.port';

@Traced({ work: 'cpu' })
@Injectable()
export class RsaJwtTokenSigner implements TokenSignerPort, OnModuleInit {
  private privateKey!: KeyObject;
  private publicJwk!: Jwk;

  constructor(private readonly config: RoomlyConfigService) {}

  async onModuleInit(): Promise<void> {
    const { authSigning } = this.config;
    const pem = resolveJwtPrivateKeyPem(authSigning);
    this.privateKey = createPrivateKey(pem);

    const jwk = await exportJWK(createPublicKey(this.privateKey));
    if (!jwk.kty) {
      throw new Error('Failed to export public JWK: missing kty');
    }

    this.publicJwk = {
      ...jwk,
      kty: jwk.kty,
      kid: authSigning.jwtKeyId,
      use: 'sig',
      alg: 'RS256',
    };
  }

  async signAccessToken(input: SignAccessTokenInput): Promise<SignedAccessToken> {
    const { auth, authSigning } = this.config;
    const jti = randomUUID();
    const accessToken = await new SignJWT()
      .setProtectedHeader({
        alg: 'RS256',
        kid: authSigning.jwtKeyId,
        typ: 'JWT',
      })
      .setSubject(input.userId)
      .setJti(jti)
      .setIssuer(auth.jwtIssuer)
      .setAudience(auth.jwtAudience)
      .setIssuedAt()
      .setExpirationTime(authSigning.jwtExpiresIn)
      .sign(this.privateKey);

    const payload = decodeJwt(accessToken);
    const exp = payload.exp;
    const iat = payload.iat;
    if (typeof exp !== 'number' || typeof iat !== 'number') {
      throw new Error('Signed JWT missing exp/iat');
    }

    return {
      accessToken,
      jti,
      exp,
      expiresIn: Math.max(0, exp - iat),
    };
  }

  @ExcludeTracer()
  async getJwks(): Promise<JwksResponse> {
    return { keys: [this.publicJwk] };
  }
}
