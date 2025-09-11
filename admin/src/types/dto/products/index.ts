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
  attributes?: any[]; // Will be AttributeValueDto[]
  images?: any[]; // Will be ImageDto[]
  variants?: any[]; // Will be VariantDto[]
  brand?: any; // Will be BrandDto
  brandId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

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
}

// Export all types
export type {
  ProductResponseDto as ProductDto,
};
