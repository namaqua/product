import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';

/**
 * Global HTTP exception filter
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(exceptionResponse),
      errors: this.getErrorDetails(exceptionResponse),
    };

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${error.message}`,
      exception.stack,
    );

    response.status(status).json(error);
  }

  private getErrorMessage(response: string | object): string {
    if (typeof response === 'string') {
      return response;
    }
    
    if (typeof response === 'object' && response !== null) {
      if ('message' in response) {
        const message = response['message'];
        return Array.isArray(message) ? message[0] : String(message);
      }
      
      if ('error' in response) {
        return response['error'] as string;
      }
    }
    
    return 'An error occurred';
  }

  private getErrorDetails(response: string | object): any {
    if (typeof response === 'object' && response !== null && 'errors' in response) {
      return response['errors'];
    }
    return undefined;
  }
}

/**
 * Database exception filter for TypeORM errors
 */
@Catch(TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';
    let details: any = undefined;

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
    } else if (exception instanceof QueryFailedError) {
      const error = exception as any;
      
      // Handle specific database errors
      switch (error.code) {
        case '23505': // Unique violation
          status = HttpStatus.CONFLICT;
          message = 'Duplicate entry detected';
          details = { field: this.extractFieldFromError(error.detail) };
          break;
        case '23503': // Foreign key violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Referenced entity does not exist';
          break;
        case '23502': // Not null violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Required field is missing';
          details = { field: error.column };
          break;
        case '22P02': // Invalid text representation
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid data format';
          break;
        default:
          message = 'Database operation failed';
      }
    }

    // Log the error
    this.logger.error(
      `Database error: ${exception.message}`,
      exception.stack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      details,
    });
  }

  private extractFieldFromError(detail: string): string {
    const match = detail?.match(/Key \((.*?)\)=/);
    return match ? match[1] : 'unknown';
  }
}

/**
 * Catch-all exception filter
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
    }

    // Log the error
    this.logger.error(
      `Unhandled exception: ${exception}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: process.env.NODE_ENV === 'development' ? exception : undefined,
    });
  }
}
