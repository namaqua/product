// Category DTOs for the admin frontend

export interface CategoryTreeDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  path?: string;
  level?: number;
  position?: number;
  isActive?: boolean;
  productCount?: number; // Number of products in this category
  children?: CategoryTreeDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  path?: string;
  level?: number;
  position?: number;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
