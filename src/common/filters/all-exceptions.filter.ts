import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } else if (exception instanceof Error) {
      const err = exception as any;

      if (err.code === 11000) {
        status = HttpStatus.BAD_REQUEST;
        message = this.isProduction
          ? 'A record with this value already exists'
          : `${Object.keys(err.keyValue || {})[0]} already exists`;
      } else if (err.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        const messages = Object.values(err.errors || {}).map(
          (val: any) => val.message,
        );
        message = messages.join(', ');
      } else if (err.name === 'CastError') {
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
      } else if (err.name === 'JsonWebTokenError') {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Invalid token';
      } else if (err.name === 'TokenExpiredError') {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Token expired';
      } else {
        message = this.isProduction
          ? 'Internal Server Error'
          : err.message || 'Internal Server Error';
      }
    }

    // Log all server errors for monitoring
    if (status >= 500) {
      this.logger.error(
        `${status} - ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      message,
    });
  }
}
