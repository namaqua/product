import { applyDecorators, Type } from '@nestjs/common';

/**
 * API decorators that work with or without Swagger
 * These are simplified versions that don't require @nestjs/swagger
 */

/**
 * Decorator for paginated endpoints (simplified without Swagger)
 */
export function ApiPaginatedResponse<TModel extends Type<any>>(
  model: TModel,
  description = 'Successful response',
) {
  // This is a placeholder that can be enhanced when Swagger is installed
  return applyDecorators();
}

/**
 * Standard API responses decorator bundle (simplified)
 */
export function ApiStandardResponses(operation?: string) {
  // This is a placeholder that can be enhanced when Swagger is installed
  return applyDecorators();
}

/**
 * Decorator for public endpoints (simplified)
 */
export function ApiPublicEndpoint(summary: string) {
  // This is a placeholder that can be enhanced when Swagger is installed
  return applyDecorators();
}

/**
 * Decorator for authenticated endpoints (simplified)
 */
export function ApiAuthEndpoint(summary: string) {
  // This is a placeholder that can be enhanced when Swagger is installed
  return applyDecorators();
}

/**
 * Decorator for admin-only endpoints (simplified)
 */
export function ApiAdminEndpoint(summary: string) {
  // This is a placeholder that can be enhanced when Swagger is installed
  return applyDecorators();
}

/**
 * Decorator for endpoints with pagination query params (simplified)
 */
export function ApiPaginationQuery() {
  // This is a placeholder that can be enhanced when Swagger is installed
  return applyDecorators();
}

/**
 * Decorator for endpoints with search query params (simplified)
 */
export function ApiSearchQuery() {
  // This is a placeholder that can be enhanced when Swagger is installed
  return applyDecorators();
}

/**
 * Note: These decorators are simplified versions that work without @nestjs/swagger.
 * When Swagger is installed, these can be enhanced with full documentation features.
 * 
 * To install Swagger for NestJS v10:
 * npm install @nestjs/swagger@^7.4.0 swagger-ui-express
 * 
 * Then update this file to import from '@nestjs/swagger' and add the full decorators.
 */
