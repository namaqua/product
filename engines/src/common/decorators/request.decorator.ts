import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorator to get the current user from the request
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'];
    
    if (!user) {
      return null;
    }
    
    return data ? user[data] : user;
  },
);

/**
 * Decorator to get user ID directly
 * Usage: @UserId() userId: string
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request['user'] as any;
    return user?.id || user?.sub || null;
  },
);

/**
 * Decorator to get the request IP address
 * Usage: @IpAddress() ip: string
 */
export const IpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ip = request.ip || 
                request.headers['x-forwarded-for'] as string || 
                request.socket.remoteAddress || 
                'unknown';
    
    // Handle IPv6 localhost
    return ip === '::1' ? '127.0.0.1' : ip;
  },
);

/**
 * Decorator to get request headers
 * Usage: @Headers('authorization') auth: string
 */
export const Headers = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return data ? request.headers[data.toLowerCase()] : request.headers;
  },
);

/**
 * Decorator to get pagination parameters with defaults
 * Usage: @Pagination() pagination: { page: number, limit: number }
 */
export const Pagination = createParamDecorator(
  (data: { defaultLimit?: number; maxLimit?: number } = {}, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const { page = 1, limit = data.defaultLimit || 10 } = request.query;
    
    const parsedPage = Math.max(1, parseInt(page as string, 10) || 1);
    const parsedLimit = Math.min(
      data.maxLimit || 100,
      Math.max(1, parseInt(limit as string, 10) || data.defaultLimit || 10),
    );
    
    return {
      page: parsedPage,
      limit: parsedLimit,
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
    };
  },
);
