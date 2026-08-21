import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isObservable, lastValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: string };
    }>();
    const hasBearer =
      typeof request.headers?.authorization === 'string' &&
      request.headers.authorization.length > 0;

    if (isPublic && !hasBearer) {
      return true;
    }

    try {
      const result = super.canActivate(context);
      const allowed = isObservable(result)
        ? await lastValueFrom(result)
        : await result;
      return Boolean(allowed);
    } catch {
      if (isPublic) return true;
      throw new UnauthorizedException();
    }
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return (user ?? undefined) as TUser;
    }
    if (err) throw err;
    return super.handleRequest(err, user, info, context);
  }
}
