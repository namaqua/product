// Base response wrapper (added by TransformInterceptor)
export interface BaseResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// Collection Response (Lists/Paginated)
export interface CollectionResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

// Action Response (Create/Update/Delete)
export interface ActionResponse<T> {
  item: T;
  message: string;
}

// Auth Response (Custom - login/register/refresh only)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: UserResponseDto;
}

// Single Item Response is just the DTO itself
export type SingleItemResponse<T> = T;

// Error Response
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  details?: any;
}

// User Response DTO (matching backend)
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer';
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// Re-export for convenience
export type { BaseResponse as ApiResponse };
