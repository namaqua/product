/**
 * Utility functions to normalize data between frontend and backend
 * The backend uses uppercase enums (DRAFT, PUBLISHED, etc.)
 * The frontend uses lowercase enums (draft, published, etc.)
 */

export const normalizeStatus = {
  /**
   * Convert backend status to frontend format
   * Backend uses lowercase enum values: 'draft', 'published', etc.
   * Frontend also uses lowercase
   */
  fromBackend: (status: string): string => {
    if (!status) return 'draft';
    // Backend already uses lowercase, just ensure consistency
    return status.toLowerCase();
  },
  
  /**
   * Convert frontend status to backend format
   * Both use lowercase
   */
  toBackend: (status: string): string => {
    if (!status) return 'draft';
    // Backend expects lowercase
    return status.toLowerCase();
  }
};

export const normalizeType = {
  /**
   * Convert backend type to frontend format
   * Backend uses lowercase enum values: 'simple', 'configurable', etc.
   * Frontend also uses lowercase
   */
  fromBackend: (type: string): string => {
    if (!type) return 'simple';
    // Backend already uses lowercase, just ensure consistency
    return type.toLowerCase();
  },
  
  /**
   * Convert frontend type to backend format
   * Both use lowercase
   */
  toBackend: (type: string): string => {
    if (!type) return 'simple';
    // Backend expects lowercase
    return type.toLowerCase();
  }
};

/**
 * Normalize product data from backend to frontend format
 */
export const normalizeProductFromBackend = (product: any): any => {
  if (!product) return product;
  
  return {
    ...product,
    status: normalizeStatus.fromBackend(product.status),
    type: normalizeType.fromBackend(product.type),
    // Normalize variants recursively if present
    variants: product.variants?.map(normalizeProductFromBackend),
  };
};

/**
 * Prepare product data for backend API calls
 */
export const prepareProductForBackend = (product: any): any => {
  if (!product) return product;
  
  // Remove undefined values and normalize enums
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(product)) {
    if (value !== undefined) {
      if (key === 'status') {
        // Backend expects lowercase, not uppercase
        cleaned[key] = (value as string).toLowerCase();
      } else if (key === 'type') {
        // Backend expects lowercase, not uppercase
        cleaned[key] = (value as string).toLowerCase();
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
};
