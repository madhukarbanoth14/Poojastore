import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  providerErrorMessage,
  providerHttpStatus,
} from '../errors/provider-error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (providerHttpStatus(exception) ?? HttpStatus.INTERNAL_SERVER_ERROR);

    const message = (() => {
      if (exception instanceof HttpException) {
        const body = exception.getResponse();
        if (typeof body === 'string') return body;
        const nested = (body as { message?: string | string[] }).message;
        if (Array.isArray(nested)) return nested.join(', ');
        if (typeof nested === 'string') return nested;
      }
      return providerErrorMessage(exception, 'Internal server error');
    })();

    const error =
      typeof exceptionResponse === 'object' && exceptionResponse
        ? ((exceptionResponse as { error?: string }).error ??
          HttpStatus[status])
        : HttpStatus[status];

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}: ${message}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url}: ${message}`);
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
