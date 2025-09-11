import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interceptor for logging requests and responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    // Log request
    this.logger.log(
      `→ ${method} ${url} - ${request.ip} - ${request.get('user-agent')}`,
    );

    return next
      .handle()
      .pipe(
        tap({
          next: (data) => {
            const responseTime = Date.now() - now;
            this.logger.log(
              `← ${method} ${url} - ${response.statusCode} - ${responseTime}ms`,
            );
          },
          error: (error) => {
            const responseTime = Date.now() - now;
            this.logger.error(
              `← ${method} ${url} - ${error.status || 500} - ${responseTime}ms - ${error.message}`,
            );
          },
        }),
      );
  }
}

/**
 * Interceptor for performance monitoring
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');
  private readonly slowRequestThreshold: number;

  constructor(slowRequestThreshold = 3000) {
    this.slowRequestThreshold = slowRequestThreshold;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => {
          const responseTime = Date.now() - now;
          
          if (responseTime > this.slowRequestThreshold) {
            this.logger.warn(
              `Slow request detected: ${method} ${url} took ${responseTime}ms`,
            );
          }
        }),
      );
  }
}

/**
 * Interceptor to track API usage
 */
@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('APIUsage');
  private readonly usageStats = new Map<string, number>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = `${request.method}:${request.route?.path || request.url}`;
    
    // Increment usage counter
    const currentCount = this.usageStats.get(key) || 0;
    this.usageStats.set(key, currentCount + 1);

    // Log usage stats periodically (every 100 requests for this endpoint)
    if ((currentCount + 1) % 100 === 0) {
      this.logger.log(`Endpoint ${key} has been called ${currentCount + 1} times`);
    }

    return next.handle();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Record<string, number> {
    return Object.fromEntries(this.usageStats);
  }

  /**
   * Reset usage statistics
   */
  resetStats(): void {
    this.usageStats.clear();
  }
}
