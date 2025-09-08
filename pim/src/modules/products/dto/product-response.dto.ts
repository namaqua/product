import { ProductType, ProductStatus } from '../entities/product.entity';
import { RelationshipType } from '../entities/product-relationship.entity';
import { MediaType } from '../entities/product-media.entity';

// Locale Response
export class ProductLocaleResponse {
  id: string;
  localeCode: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  urlKey: string | null;
  features: Record<string, any> | null;
  specifications: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Attribute Response
export class ProductAttributeResponse {
  id: string;
  attributeCode: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueDate: Date | null;
  valueDatetime: Date | null;
  valueJson: Record<string, any> | null;
  valueOptions: string[] | null;
  localeCode: string | null;
  channelCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Media Response
export class ProductMediaResponse {
  id: string;
  url: string;
  mediaType: MediaType;
  isPrimary: boolean;
  localeCode: string | null;
  altText: string | null;
  title: string | null;
  sortOrder: number;
  filename: string | null;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

// Variant Response
export class ProductVariantResponse {
  id: string;
  variantProductId: string;
  variantProduct?: ProductResponse;
  variantAttributes: Record<string, any>;
  priceModifier: number;
  weightModifier: number;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
}

// Bundle Item Response
export class BundleItemResponse {
  id: string;
  componentProductId: string;
  componentProduct?: ProductResponse;
  quantity: number;
  isRequired: boolean;
  sortOrder: number;
  createdAt: Date;
}

// Relationship Response
export class ProductRelationshipResponse {
  id: string;
  targetProductId: string;
  targetProduct?: ProductResponse;
  relationshipType: RelationshipType;
  sortOrder: number;
  createdAt: Date;
}

// Category Response (simplified until Category module is created)
export class ProductCategoryResponse {
  id: string;
  categoryId: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
}

// Main Product Response
export class ProductResponse {
  id: string;
  sku: string;
  type: ProductType;
  status: ProductStatus;
  parentId: string | null;

  // Inventory
  quantity: number;
  trackInventory: boolean;
  inStock: boolean;
  minQuantity: number | null;
  maxQuantity: number | null;

  // Pricing
  price: number | null;
  comparePrice: number | null;
  costPrice: number | null;

  // Physical properties
  weight: number | null;
  weightUnit: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: string | null;

  // Visibility
  isVisible: boolean;
  isFeatured: boolean;
  sortOrder: number;

  // Metadata
  metadata: Record<string, any> | null;
  customFields: Record<string, any> | null;
  version: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Relations (optional, based on includes)
  locales?: ProductLocaleResponse[];
  attributes?: ProductAttributeResponse[];
  media?: ProductMediaResponse[];
  categories?: ProductCategoryResponse[];
  variants?: ProductVariantResponse[];
  bundleItems?: BundleItemResponse[];
  relationships?: ProductRelationshipResponse[];

  // Computed fields
  primaryImage?: string;
  defaultName?: string;
  defaultDescription?: string;
}

// Paginated Response
export class PaginatedProductResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Bulk Operation Response
export class BulkOperationResponse {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: Array<{
    productId: string;
    error: string;
  }>;
}

// Import/Export Response
export class ImportExportResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  fileUrl?: string;
  startedAt?: Date;
  completedAt?: Date;
}
