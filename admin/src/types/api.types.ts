// Common types
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// Product types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  type: ProductType;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  barcode?: string;
  trackInventory: boolean;
  weight?: number;
  weightUnit?: WeightUnit;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  categories?: Category[];
  attributes?: ProductAttribute[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  brand?: Brand;
  brandId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum ProductVisibility {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  CATALOG = 'catalog',
  SEARCH = 'search',
}

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  GROUPED = 'grouped',
  BUNDLE = 'bundle',
  VIRTUAL = 'virtual',
  DOWNLOADABLE = 'downloadable',
}

export enum WeightUnit {
  KG = 'kg',
  LB = 'lb',
  OZ = 'oz',
  G = 'g',
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  barcode?: string;
  weight?: number;
  inventoryQuantity: number;
  position: number;
  productId: string;
  attributeValues: AttributeValue[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
  isDefault: boolean;
  productId: string;
  variantId?: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  path: string;
  level: number;
  position: number;
  sortOrder?: number;
  isActive: boolean; // Frontend display field
  isVisible?: boolean; // Backend actual field
  showInMenu?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string | string[]; // Backend expects string, frontend can handle array
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

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  level: number;
  children: CategoryTree[];
  productCount?: number;
}

// Attribute types
export interface Attribute {
  id: string;
  code: string;
  name: string;
  type: AttributeType;
  description?: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isSortable: boolean;
  isVariant: boolean;
  position: number;
  validation?: Record<string, any>;
  defaultValue?: any;
  options?: AttributeOption[];
  group?: AttributeGroup;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  COLOR = 'color',
  IMAGE = 'image',
  FILE = 'file',
  PRICE = 'price',
  WEIGHT = 'weight',
  DIMENSION = 'dimension',
}

export interface AttributeOption {
  id: string;
  value: string;
  label: string;
  position: number;
  isDefault: boolean;
  attributeId: string;
}

export interface AttributeGroup {
  id: string;
  code: string;
  name: string;
  description?: string;
  position: number;
  attributes?: Attribute[];
  createdAt: string;
  updatedAt: string;
}

export interface AttributeValue {
  id: string;
  value: any;
  attributeId: string;
  attribute?: Attribute;
  productId?: string;
  variantId?: string;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attributeId: string;
  attribute: Attribute;
  value: any;
  createdAt: string;
  updatedAt: string;
}

// Brand types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  position: number;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  type?: ProductType;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  barcode?: string;
  trackInventory?: boolean;
  weight?: number;
  weightUnit?: WeightUnit;
  featured?: boolean;
  categoryIds?: string[];
  attributes?: { attributeId: string; value: any }[];
  brandId?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isVisible?: boolean;
  showInMenu?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string; // Must be string, not array
  imageUrl?: string;
  bannerUrl?: string;
  defaultAttributes?: Record<string, any>;
  requiredAttributes?: string[];
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateAttributeDto {
  code: string;
  name: string;
  type: AttributeType;
  description?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
  isSearchable?: boolean;
  isSortable?: boolean;
  isVariant?: boolean;
  validation?: Record<string, any>;
  defaultValue?: any;
  options?: Omit<AttributeOption, 'id' | 'attributeId'>[];
  groupId?: string;
}

export interface UpdateAttributeDto extends Partial<CreateAttributeDto> {}
