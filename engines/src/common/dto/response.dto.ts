/**
 * Standard API response wrapper
 */
export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
  timestamp?: string;

  constructor(partial?: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T> {
    return new ApiResponse({
      success: true,
      data,
      message,
      meta,
    });
  }

  static error(message: string, data?: any, meta?: Record<string, any>): ApiResponse {
    return new ApiResponse({
      success: false,
      message,
      data,
      meta,
    });
  }
}

/**
 * Response for single entity operations
 */
export class EntityResponse<T> extends ApiResponse<T> {
  constructor(entity: T, message?: string) {
    super(ApiResponse.success(entity, message));
  }
}

/**
 * Response for deletion operations
 */
export class DeleteResponse extends ApiResponse<{ id: string; deleted: boolean }> {
  constructor(id: string, message = 'Successfully deleted') {
    super(ApiResponse.success({ id, deleted: true }, message));
  }
}

/**
 * Response for bulk operations
 */
export class BulkOperationResponse extends ApiResponse<{
  successful: string[];
  failed: Array<{ id: string; error: string }>;
  totalProcessed: number;
}> {
  constructor(
    successful: string[],
    failed: Array<{ id: string; error: string }> = [],
    message?: string,
  ) {
    const data = {
      successful,
      failed,
      totalProcessed: successful.length + failed.length,
    };
    super(ApiResponse.success(data, message));
  }
}

/**
 * Response for count operations
 */
export class CountResponse extends ApiResponse<{ count: number }> {
  constructor(count: number, message?: string) {
    super(ApiResponse.success({ count }, message));
  }
}
