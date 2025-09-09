import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto';

/**
 * Interceptor to transform responses into a standard format
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // If data is already an ApiResponse, return it as is
        if (data instanceof ApiResponse) {
          return data;
        }

        // If data has a specific structure for pagination, handle it
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return ApiResponse.success(data.data, undefined, data.meta);
        }

        // Default transformation
        return ApiResponse.success(data);
      }),
    );
  }
}

/**
 * Interceptor to exclude null values from responses
 */
@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.removeNulls(data)),
    );
  }

  private removeNulls(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeNulls(item));
    }

    if (typeof obj === 'object') {
      const cleaned = {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = this.removeNulls(obj[key]);
          if (value !== null && value !== undefined) {
            cleaned[key] = value;
          }
        }
      }
      
      return cleaned;
    }

    return obj;
  }
}

/**
 * Interceptor to add cache headers to responses
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly options: {
      ttl?: number; // Time to live in seconds
      isPrivate?: boolean;
      mustRevalidate?: boolean;
    } = {},
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method === 'GET') {
      const ttl = this.options.ttl || 60;
      const cacheControl = [
        this.options.isPrivate ? 'private' : 'public',
        `max-age=${ttl}`,
        this.options.mustRevalidate && 'must-revalidate',
      ]
        .filter(Boolean)
        .join(', ');

      response.setHeader('Cache-Control', cacheControl);
    } else {
      // No cache for non-GET requests
      response.setHeader('Cache-Control', 'no-store');
    }

    return next.handle();
  }
}

/**
 * Interceptor to handle timeout
 */
import { timeout, catchError } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';
import { RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs = 30000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Request timeout'));
        }
        return throwError(() => err);
      }),
    );
  }
}
