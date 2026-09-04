import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = (() => {
      if (exception instanceof HttpException) {
        const body = exception.getResponse();
        if (typeof body === 'string') return body;
        const nested = (body as { message?: string | string[] }).message;
        if (Array.isArray(nested)) return nested.join(', ');
        if (typeof nested === 'string') return nested;
      }
      if (exception instanceof Error && exception.message) return exception.message;
      return 'Internal server error';
    })();

    const error =
      typeof exceptionResponse === 'object' && exceptionResponse
        ? ((exceptionResponse as { error?: string }).error ??
          HttpStatus[status])
        : HttpStatus[status];

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
