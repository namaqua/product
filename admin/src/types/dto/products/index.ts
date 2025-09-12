// Attribute Value structure from backend
export interface AttributeValue {
  id: string;
  attributeId: string;
  productId: string;
  attribute: {
    id: string;
    code: string;
    name: string;
    type: string;
    options?: Array<{
      value: string;
      label: string;
      sortOrder: number;
    }>;
  };
  textValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
  booleanValue?: boolean | null;
  jsonValue?: any | null;
  locale?: string;
}

// Product Response DTO - matches backend exactly
export interface ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  urlKey: string;
  status: 'draft' | 'published' | 'archived' | 'pending_review' | 'approved';
  isVisible: boolean;
  type: 'simple' | 'configurable' | 'bundle' | 'virtual' | 'grouped' | 'downloadable';
  price?: string;
  specialPrice?: string;
  cost?: string;
  barcode?: string;
  manageStock: boolean;
  quantity?: number;
  weight?: number;
  weightUnit?: string;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categories?: any[]; // Will be CategoryResponseDto[]
  attributes?: Record<string, any>; // Simple key-value for product custom attributes
  attributeValues?: AttributeValue[]; // EAV pattern attribute values
  images?: any[]; // Will be ImageDto[]
  variants?: ProductResponseDto[]; // Variants are also products
  parentId?: string | null; // For variant products
  parent?: ProductResponseDto | null; // Parent product for variants
  brand?: any; // Will be BrandDto
  brandId?: string;
  inStock?: boolean;
  lowStockThreshold?: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Alias for backward compatibility
export type Product = ProductResponseDto;

// Create Product DTO - for POST requests
export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  status?: 'draft' | 'published' | 'archived' | 'pending_review' | 'approved';
  isVisible?: boolean;
  type?: 'simple' | 'configurable' | 'bundle' | 'virtual' | 'grouped' | 'downloadable';
  price?: number;
  specialPrice?: number;
  cost?: number;
  barcode?: string;
  manageStock?: boolean;
  quantity?: number;
  weight?: number;
  weightUnit?: string;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  categoryIds?: string[];
  brandId?: string;
  parentId?: string | null; // For creating variants
  attributes?: Record<string, any>; // For variant attributes
}

// Update Product DTO - for PUT/PATCH requests
export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Product Query DTO - for GET requests with filters
export interface ProductQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: string;
  type?: string;
  categoryId?: string;
  brandId?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  parentId?: string | null; // For filtering variants
  includeVariants?: boolean; // Include variants in response
}

// Export all types
export type {
  ProductResponseDto as ProductDto,
};
