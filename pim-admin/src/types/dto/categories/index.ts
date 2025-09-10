// Category Response DTO - matches backend exactly
export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: CategoryResponseDto;
  children?: CategoryResponseDto[];
  path: string;
  level: number;
  position: number;
  sortOrder?: number;
  isVisible: boolean; // NOT isActive!
  showInMenu: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string; // String, not array!
  imageUrl?: string;
  bannerUrl?: string;
  left: number;
  right: number;
  productCount?: number;
  defaultAttributes?: Record<string, any>;
  requiredAttributes?: string[];
  createdAt: string;
  updatedAt: string;
}

// Create Category DTO - for POST requests
export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isVisible?: boolean; // NOT isActive!
  showInMenu?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string; // Must be string, not array!
  imageUrl?: string;
  bannerUrl?: string;
  defaultAttributes?: Record<string, any>;
  requiredAttributes?: string[];
}

// Update Category DTO - for PUT/PATCH requests
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

// Category Query DTO - for GET requests with filters
export interface CategoryQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  parentId?: string;
  isVisible?: boolean;
  isFeatured?: boolean;
}

// Category Tree DTO
export interface CategoryTreeDto {
  id: string;
  name: string;
  slug: string;
  level: number;
  children: CategoryTreeDto[];
  productCount?: number;
  isVisible: boolean;
  isFeatured: boolean;
}

// Export all types
export type {
  CategoryResponseDto as CategoryDto,
};
