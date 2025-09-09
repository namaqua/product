/**
 * Common types and interfaces used throughout the application
 */

import { Request } from 'express';
import { UserRole } from '../constants';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions?: string[];
}

/**
 * JWT payload
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload extends JwtPayload {
  tokenFamily?: string;
}

/**
 * Generic query parameters
 */
export interface QueryParams {
  [key: string]: any;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

/**
 * Filter options
 */
export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: any;
}

/**
 * Repository find options
 */
export interface FindOptions<T = any> {
  where?: Partial<T> | Array<Partial<T>>;
  relations?: string[];
  order?: Record<string, 'ASC' | 'DESC'>;
  skip?: number;
  take?: number;
  withDeleted?: boolean;
}

/**
 * Repository find and count result
 */
export interface FindAndCountResult<T> {
  items: T[];
  total: number;
}

/**
 * Audit fields
 */
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Soft delete fields
 */
export interface SoftDeleteFields {
  deletedAt?: Date;
  deletedBy?: string;
}

/**
 * Base entity interface
 */
export interface BaseEntityInterface extends AuditFields {
  id: string;
}

/**
 * Soft delete entity interface
 */
export interface SoftDeleteEntityInterface extends BaseEntityInterface, SoftDeleteFields {}

/**
 * File upload interface
 */
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
  filename?: string;
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Activity log interface
 */
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Configuration interface
 */
export interface AppConfig {
  environment: string;
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  rateLimit?: RateLimitConfig;
  upload?: UploadConfig;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
  ssl?: boolean;
}

/**
 * JWT configuration
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret?: string;
  refreshExpiresIn?: string;
}

/**
 * CORS configuration
 */
export interface CorsConfig {
  origin: string | string[] | boolean;
  credentials: boolean;
  methods?: string[];
  allowedHeaders?: string[];
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

/**
 * Upload configuration
 */
export interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadDir: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  errors?: any;
  timestamp: string;
  path: string;
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: any;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    database: boolean;
    redis?: boolean;
    storage?: boolean;
  };
}

/**
 * Constructor type
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type (nullable and optional)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Omit methods from type
 */
export type OmitMethods<T> = Pick<T, KeysOfType<T, Function>>;

/**
 * Required keys
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Optional keys
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
