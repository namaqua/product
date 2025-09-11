/**
 * Common constants used throughout the application
 */

// API versioning
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Authentication
export const JWT_COOKIE_NAME = 'access_token';
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
export const TOKEN_EXPIRY = '1d';
export const REFRESH_TOKEN_EXPIRY = '7d';

// File upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'];

// Database
export const SOFT_DELETE_FIELD = 'deletedAt';
export const DEFAULT_SORT_FIELD = 'createdAt';
export const DEFAULT_SORT_ORDER = 'DESC';

// Cache
export const CACHE_TTL = 60; // seconds
export const CACHE_MAX_ITEMS = 100;

// Rate limiting
export const RATE_LIMIT_TTL = 60; // seconds
export const RATE_LIMIT_MAX = 100; // requests per TTL

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  SKU: /^[A-Z0-9\-_]+$/i,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA: /^[a-zA-Z]+$/,
  NUMERIC: /^\d+$/,
};

// Error messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  TOKEN_EXPIRED: 'Your session has expired. Please login again',
  TOKEN_INVALID: 'Invalid authentication token',
  
  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PASSWORD: 'Password does not meet requirements',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  
  // CRUD operations
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CREATE_FAILED: 'Failed to create resource',
  UPDATE_FAILED: 'Failed to update resource',
  DELETE_FAILED: 'Failed to delete resource',
  
  // File upload
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_UPLOAD_FAILED: 'Failed to upload file',
  
  // Database
  DATABASE_ERROR: 'A database error occurred',
  DUPLICATE_ENTRY: 'This entry already exists',
  FOREIGN_KEY_VIOLATION: 'Cannot perform this operation due to related data',
  
  // General
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  BAD_REQUEST: 'Invalid request',
  FORBIDDEN: 'You do not have permission to perform this action',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
};

// Success messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  
  // CRUD operations
  CREATE_SUCCESS: 'Successfully created',
  UPDATE_SUCCESS: 'Successfully updated',
  DELETE_SUCCESS: 'Successfully deleted',
  FETCH_SUCCESS: 'Successfully fetched',
  
  // File operations
  FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
  FILE_DELETE_SUCCESS: 'File deleted successfully',
  
  // User operations
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
};

// Status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// User roles
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST',
}

// Product status
export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// Order status
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Workflow status
export enum WorkflowStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

// Environment
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}
