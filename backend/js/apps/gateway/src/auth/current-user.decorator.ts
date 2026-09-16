import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AccessTokenClaims } from '@roomly/contracts';
import type { AuthenticatedRequest } from './jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenClaims => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new Error('CurrentUser used without JwtAuthGuard');
    }
    return request.user;
  },
);
