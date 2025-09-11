# Frontend API Migration - Implementation Guide

## Quick Start: First Steps to Implement

This guide provides the exact code to implement for starting the API migration. Follow these steps in order.

---

## Step 1: Create Response Type Definitions

### 1.1 Create the types file

**File:** `/Users/colinroets/dev/projects/product/admin/src/types/api-responses.types.ts`

```typescript
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
```

---

## Step 2: Create Response Parser Utility

### 2.1 Create the parser utility

**File:** `/Users/colinroets/dev/projects/product/admin/src/utils/api-response-parser.ts`

```typescript
import { AxiosResponse } from 'axios';
import {
  CollectionResponse,
  ActionResponse,
  AuthResponse,
  SingleItemResponse,
} from '../types/api-responses.types';

export class ApiResponseParser {
  /**
   * Parse collection responses (GET /entities with pagination)
   */
  static parseCollection<T>(response: AxiosResponse): CollectionResponse<T> {
    // Backend wraps in { success, data, timestamp }
    // The actual collection is in data
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    const data = wrapped.data;
    
    // Handle both formats the backend might return
    if (data.items && data.meta) {
      return {
        items: data.items || [],
        meta: {
          totalItems: data.meta.totalItems || 0,
          itemCount: data.meta.itemCount || data.items.length,
          itemsPerPage: data.meta.itemsPerPage || data.meta.limit || 20,
          totalPages: data.meta.totalPages || 1,
          currentPage: data.meta.currentPage || data.meta.page || 1,
        }
      };
    }
    
    // Fallback for non-paginated collections
    if (Array.isArray(data)) {
      return {
        items: data,
        meta: {
          totalItems: data.length,
          itemCount: data.length,
          itemsPerPage: data.length,
          totalPages: 1,
          currentPage: 1,
        }
      };
    }
    
    // If data itself has the structure
    return data as CollectionResponse<T>;
  }

  /**
   * Parse action responses (POST, PUT, DELETE)
   */
  static parseAction<T>(response: AxiosResponse): ActionResponse<T> {
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    const data = wrapped.data;
    
    // ActionResponseDto structure
    return {
      item: data.item,
      message: data.message || 'Operation completed successfully',
    };
  }

  /**
   * Parse single item responses (GET /entities/:id)
   */
  static parseSingle<T>(response: AxiosResponse): T {
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    // For single items, the DTO is directly in data
    return wrapped.data as T;
  }

  /**
   * Parse auth responses (special case - not wrapped)
   */
  static parseAuth(response: AxiosResponse): AuthResponse {
    // Auth endpoints return tokens directly (not wrapped)
    const data = response.data;
    
    // Check if it's wrapped (shouldn't be, but handle both)
    if (data.success && data.data) {
      return data.data;
    }
    
    return data as AuthResponse;
  }

  /**
   * Parse tree responses (special case for hierarchical data)
   */
  static parseTree<T>(response: AxiosResponse): T[] {
    const wrapped = response.data;
    
    if (!wrapped.success) {
      throw new Error('API request was not successful');
    }
    
    // Tree endpoints return arrays
    return Array.isArray(wrapped.data) ? wrapped.data : [];
  }
}
```

---

## Step 3: Create DTO Types Matching Backend

### 3.1 Product DTOs

**File:** `/Users/colinroets/dev/projects/product/admin/src/types/dto/products/product-response.dto.ts`

```typescript
export interface ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  urlKey: string;
  status: 'draft' | 'published' | 'archived';
  isVisible: boolean;
  type: 'simple' | 'configurable' | 'bundle' | 'virtual';
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
  categories?: CategoryResponseDto[];
  attributes?: AttributeValueDto[];
  images?: ImageDto[];
  variants?: VariantDto[];
  brand?: BrandDto;
  brandId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  status?: 'draft' | 'published' | 'archived';
  isVisible?: boolean;
  type?: 'simple' | 'configurable' | 'bundle' | 'virtual';
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

export interface UpdateProductDto extends Partial<CreateProductDto> {}

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
```

### 3.2 Category DTOs

**File:** `/Users/colinroets/dev/projects/product/admin/src/types/dto/categories/category-response.dto.ts`

```typescript
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
  isVisible: boolean;
  showInMenu: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
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
  metaKeywords?: string; // String, not array!
  imageUrl?: string;
  bannerUrl?: string;
  defaultAttributes?: Record<string, any>;
  requiredAttributes?: string[];
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

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
```

---

## Step 4: Update Product Service

### 4.1 Migrate Product Service to New Format

**File:** `/Users/colinroets/dev/projects/product/admin/src/services/product.service.ts`

```typescript
import api from './api';
import { ApiResponseParser } from '../utils/api-response-parser';
import {
  CollectionResponse,
  ActionResponse,
} from '../types/api-responses.types';
import {
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '../types/dto/products/product-response.dto';

class ProductService {
  /**
   * Get paginated list of products
   */
  async getProducts(query: ProductQueryDto = {}): Promise<CollectionResponse<ProductResponseDto>> {
    const response = await api.get('/products', { params: query });
    return ApiResponseParser.parseCollection<ProductResponseDto>(response);
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: string): Promise<ProductResponseDto> {
    const response = await api.get(`/products/${id}`);
    return ApiResponseParser.parseSingle<ProductResponseDto>(response);
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<ProductResponseDto> {
    const response = await api.get(`/products/sku/${sku}`);
    return ApiResponseParser.parseSingle<ProductResponseDto>(response);
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<ProductResponseDto> {
    const response = await api.get(`/products/slug/${slug}`);
    return ApiResponseParser.parseSingle<ProductResponseDto>(response);
  }

  /**
   * Create new product
   */
  async createProduct(dto: CreateProductDto): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.post('/products', dto);
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Update existing product
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.put(`/products/${id}`, dto);
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.delete(`/products/${id}`);
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(ids: string[]): Promise<ActionResponse<any>> {
    const response = await api.post('/products/bulk-delete', { ids });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Duplicate product
   */
  async duplicateProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.post(`/products/${id}/duplicate`);
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Update product inventory
   */
  async updateInventory(id: string, quantity: number): Promise<ActionResponse<ProductResponseDto>> {
    const response = await api.patch(`/products/${id}/inventory`, { quantity });
    return ApiResponseParser.parseAction<ProductResponseDto>(response);
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(ids: string[], status: string): Promise<ActionResponse<any>> {
    const response = await api.post('/products/bulk-update-status', { ids, status });
    return ApiResponseParser.parseAction<any>(response);
  }

  /**
   * Export products
   */
  async exportProducts(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await api.get(`/products/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Import products
   */
  async importProducts(file: File): Promise<ActionResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return ApiResponseParser.parseAction<any>(response);
  }
}

export default new ProductService();
```

---

## Step 5: Update Product List Component

### 5.1 Update ProductList to use new response format

**File:** `/Users/colinroets/dev/projects/product/admin/src/features/products/ProductList.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/product.service';
import { CollectionResponse } from '../../types/api-responses.types';
import { ProductResponseDto, ProductQueryDto } from '../../types/dto/products/product-response.dto';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CollectionResponse<ProductResponseDto>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Query state
  const [query, setQuery] = useState<ProductQueryDto>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  useEffect(() => {
    fetchProducts();
  }, [query]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts(query);
      setProducts(response);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }));
  };

  const handleSearch = (search: string) => {
    setQuery(prev => ({ ...prev, search, page: 1 }));
  };

  const handleSort = (sortBy: string, sortOrder: 'ASC' | 'DESC') => {
    setQuery(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await productService.deleteProduct(id);
      // Show success message from action response
      alert(response.message);
      fetchProducts(); // Refresh list
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!products) return <div>No data</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => navigate('/products/new')}>
          Add Product
        </Button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="px-4 py-2 border rounded"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <DataTable
        data={products.items}
        columns={[
          { key: 'sku', label: 'SKU' },
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
          { key: 'price', label: 'Price' },
          { key: 'quantity', label: 'Stock' },
          {
            key: 'actions',
            label: 'Actions',
            render: (product: ProductResponseDto) => (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {products.meta.itemCount} of {products.meta.totalItems} products
        </div>
        <div className="flex gap-2">
          <button
            disabled={products.meta.currentPage === 1}
            onClick={() => handlePageChange(products.meta.currentPage - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {products.meta.currentPage} of {products.meta.totalPages}
          </span>
          <button
            disabled={products.meta.currentPage === products.meta.totalPages}
            onClick={() => handlePageChange(products.meta.currentPage + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Test the Migration

### 6.1 Create a test script

**File:** `/Users/colinroets/dev/projects/product/shell-scripts/test-frontend-api-migration.sh`

```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3010/api/v1"

echo -e "${YELLOW}Testing Frontend API Migration${NC}"
echo "================================"

# 1. Test login (Auth Response)
echo -e "\n${YELLOW}1. Testing Auth Response (login)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}')

echo "Raw response:"
echo "$LOGIN_RESPONSE" | jq '.'

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // .data.accessToken // ""')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Failed to get access token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Auth response parsed successfully${NC}"

# 2. Test Collection Response (GET /products)
echo -e "\n${YELLOW}2. Testing Collection Response (products list)${NC}"
PRODUCTS_RESPONSE=$(curl -s -X GET "$API_URL/products?page=1&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Raw response structure:"
echo "$PRODUCTS_RESPONSE" | jq 'keys'

# Check for wrapped structure
if echo "$PRODUCTS_RESPONSE" | jq -e '.success and .data.items' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Collection response has correct structure${NC}"
  echo "  - Items count: $(echo "$PRODUCTS_RESPONSE" | jq '.data.items | length')"
  echo "  - Total items: $(echo "$PRODUCTS_RESPONSE" | jq '.data.meta.totalItems')"
  echo "  - Current page: $(echo "$PRODUCTS_RESPONSE" | jq '.data.meta.page // .data.meta.currentPage')"
else
  echo -e "${RED}❌ Collection response structure incorrect${NC}"
fi

# 3. Test Single Item Response (GET /products/:id)
echo -e "\n${YELLOW}3. Testing Single Item Response${NC}"
FIRST_PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | jq -r '.data.items[0].id // ""')

if [ ! -z "$FIRST_PRODUCT_ID" ]; then
  SINGLE_RESPONSE=$(curl -s -X GET "$API_URL/products/$FIRST_PRODUCT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  echo "Raw response structure:"
  echo "$SINGLE_RESPONSE" | jq 'keys'
  
  if echo "$SINGLE_RESPONSE" | jq -e '.success and .data.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Single item response has correct structure${NC}"
    echo "  - Product ID: $(echo "$SINGLE_RESPONSE" | jq -r '.data.id')"
    echo "  - Product SKU: $(echo "$SINGLE_RESPONSE" | jq -r '.data.sku')"
  else
    echo -e "${RED}❌ Single item response structure incorrect${NC}"
  fi
fi

# 4. Test Action Response (POST /products)
echo -e "\n${YELLOW}4. Testing Action Response (create product)${NC}"
TIMESTAMP=$(date +%s)
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sku\": \"TEST-API-$TIMESTAMP\",
    \"name\": \"Test Product for API Migration\",
    \"status\": \"draft\",
    \"type\": \"simple\",
    \"price\": 99.99
  }")

echo "Raw response structure:"
echo "$CREATE_RESPONSE" | jq 'keys'

if echo "$CREATE_RESPONSE" | jq -e '.success and .data.item and .data.message' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Action response has correct structure${NC}"
  echo "  - Message: $(echo "$CREATE_RESPONSE" | jq -r '.data.message')"
  echo "  - Created ID: $(echo "$CREATE_RESPONSE" | jq -r '.data.item.id')"
  
  # Clean up - delete the test product
  CREATED_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.item.id')
  curl -s -X DELETE "$API_URL/products/$CREATED_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" > /dev/null 2>&1
else
  echo -e "${RED}❌ Action response structure incorrect${NC}"
fi

# 5. Test Category Tree Response
echo -e "\n${YELLOW}5. Testing Tree Response (category tree)${NC}"
TREE_RESPONSE=$(curl -s -X GET "$API_URL/categories/tree" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Raw response structure:"
echo "$TREE_RESPONSE" | jq 'keys'

if echo "$TREE_RESPONSE" | jq -e '.success and .data' > /dev/null 2>&1; then
  if echo "$TREE_RESPONSE" | jq -e '.data | type == "array"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Tree response has correct structure${NC}"
    echo "  - Root categories: $(echo "$TREE_RESPONSE" | jq '.data | length')"
  else
    echo -e "${YELLOW}⚠ Tree response data is not an array${NC}"
  fi
else
  echo -e "${RED}❌ Tree response structure incorrect${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}API Migration Testing Complete${NC}"
echo -e "${GREEN}========================================${NC}"
```

Make it executable:
```bash
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/test-frontend-api-migration.sh
```

---

## Next Steps After Implementation

1. **Run the test script** to verify backend response formats
2. **Update remaining services** (Category, Attribute, Auth)
3. **Update all components** to use new types
4. **Add error handling** with the new format
5. **Update stores** if using Zustand/Redux
6. **Add loading states** based on response
7. **Test all CRUD operations** thoroughly

## Common Issues & Solutions

### Issue 1: TypeScript Errors
**Solution:** Ensure all imports are correct and types are exported

### Issue 2: Response parsing fails
**Solution:** Check actual backend response with curl first

### Issue 3: Pagination not working
**Solution:** Verify meta fields match between frontend and backend

### Issue 4: Auth not working
**Solution:** Auth responses may not be wrapped - check parseAuth method

---

## Verification Checklist

- [ ] Response types created and exported
- [ ] Parser utility handles all formats
- [ ] Product service migrated
- [ ] Product list component updated
- [ ] Test script runs successfully
- [ ] No TypeScript errors
- [ ] CRUD operations work
- [ ] Pagination works
- [ ] Error messages display

---

*This implementation guide provides the exact code needed to start the migration. Follow each step carefully and test after each change.*
