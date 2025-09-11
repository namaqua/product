# Frontend API Migration Plan - PIM Admin Portal

## Executive Summary
This plan outlines the systematic migration of the pim-admin frontend to work with the standardized backend API responses as defined in `PIM_API_STANDARDS_AI_REFERENCE.md`.

## 🎯 Migration Goals
1. Standardize all API response handling to match the 4 response types
2. Update TypeScript types to match backend DTOs exactly
3. Create reusable utilities for response parsing
4. Ensure consistent error handling across all services
5. Maintain backward compatibility during migration

---

## Phase 1: Foundation Setup (Priority: Critical)

### 1.1 Create Response Type Definitions
**Location:** `/src/types/api-responses.types.ts`

```typescript
// Base response wrapper (added by TransformInterceptor)
interface BaseResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// Collection Response (Lists/Paginated)
interface CollectionResponse<T> {
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
interface ActionResponse<T> {
  item: T;
  message: string;
}

// Auth Response (Custom - login/register/refresh only)
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: UserResponseDto;
}

// Single Item Response is just the DTO itself
type SingleItemResponse<T> = T;
```

### 1.2 Create Response Parser Utilities
**Location:** `/src/utils/api-response-parser.ts`

```typescript
export class ApiResponseParser {
  // Parse collection responses
  static parseCollection<T>(response: AxiosResponse): CollectionResponse<T> {
    const data = response.data.data || response.data;
    return {
      items: data.items || [],
      meta: data.meta || {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 20,
        totalPages: 0,
        currentPage: 1
      }
    };
  }

  // Parse action responses
  static parseAction<T>(response: AxiosResponse): ActionResponse<T> {
    const data = response.data.data || response.data;
    return {
      item: data.item,
      message: data.message
    };
  }

  // Parse single item responses
  static parseSingle<T>(response: AxiosResponse): T {
    return response.data.data || response.data;
  }

  // Parse auth responses (special case)
  static parseAuth(response: AxiosResponse): AuthResponse {
    // Auth responses are NOT wrapped by TransformInterceptor
    return response.data;
  }
}
```

### 1.3 Update Base API Service
**Location:** `/src/services/api.ts`

Add response type validation and standardized error handling:

```typescript
// Add response validation
api.interceptors.response.use(
  (response) => {
    // Log response structure in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  // ... error handling
);
```

---

## Phase 2: Update Response DTOs (Priority: High)

### 2.1 Create Backend-Aligned DTOs
**Location:** `/src/types/dto/`

Create separate files for each entity's DTOs:

```
/src/types/dto/
├── common/
│   ├── base-query.dto.ts
│   ├── collection-response.dto.ts
│   └── action-response.dto.ts
├── products/
│   ├── product-response.dto.ts
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── product-query.dto.ts
├── categories/
│   ├── category-response.dto.ts
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   └── category-query.dto.ts
└── attributes/
    ├── attribute-response.dto.ts
    ├── create-attribute.dto.ts
    ├── update-attribute.dto.ts
    └── attribute-query.dto.ts
```

### 2.2 Map Frontend Types to Backend DTOs

Create mapping utilities for each entity:

**Location:** `/src/utils/dto-mappers/`

```typescript
// product.mapper.ts
export class ProductMapper {
  // Backend ProductResponseDto to Frontend Product type
  static toFrontend(dto: ProductResponseDto): Product {
    return {
      // Map fields appropriately
      // Handle any naming differences
    };
  }

  // Frontend form data to CreateProductDto
  static toCreateDto(data: ProductFormData): CreateProductDto {
    return {
      // Map and validate fields
    };
  }

  // Frontend form data to UpdateProductDto
  static toUpdateDto(data: ProductFormData): UpdateProductDto {
    return {
      // Map only changed fields
    };
  }
}
```

---

## Phase 3: Service Layer Migration (Priority: High)

### 3.1 Product Service Migration

**Step-by-step for each service method:**

1. **findAll (Collection Response)**
```typescript
async getProducts(query: ProductQueryDto): Promise<CollectionResponse<ProductResponseDto>> {
  const response = await api.get('/products', { params: query });
  return ApiResponseParser.parseCollection<ProductResponseDto>(response);
}
```

2. **findOne (Single Item Response)**
```typescript
async getProduct(id: string): Promise<ProductResponseDto> {
  const response = await api.get(`/products/${id}`);
  return ApiResponseParser.parseSingle<ProductResponseDto>(response);
}
```

3. **create (Action Response)**
```typescript
async createProduct(dto: CreateProductDto): Promise<ActionResponse<ProductResponseDto>> {
  const response = await api.post('/products', dto);
  return ApiResponseParser.parseAction<ProductResponseDto>(response);
}
```

4. **update (Action Response)**
```typescript
async updateProduct(id: string, dto: UpdateProductDto): Promise<ActionResponse<ProductResponseDto>> {
  const response = await api.put(`/products/${id}`, dto);
  return ApiResponseParser.parseAction<ProductResponseDto>(response);
}
```

5. **delete (Action Response)**
```typescript
async deleteProduct(id: string): Promise<ActionResponse<ProductResponseDto>> {
  const response = await api.delete(`/products/${id}`);
  return ApiResponseParser.parseAction<ProductResponseDto>(response);
}
```

### 3.2 Repeat for Category Service
- Apply same patterns
- Use CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto
- Handle tree endpoint specially (returns array directly)

### 3.3 Repeat for Attribute Service
- Apply same patterns
- Use AttributeResponseDto, CreateAttributeDto, UpdateAttributeDto

### 3.4 Auth Service (Special Case)
```typescript
async login(credentials: LoginDto): Promise<AuthResponse> {
  const response = await api.post('/auth/login', credentials);
  return ApiResponseParser.parseAuth(response);
}
```

---

## Phase 4: Component Updates (Priority: Medium)

### 4.1 Update Data Fetching Hooks

Create custom hooks for each entity:

```typescript
// useProducts.ts
export function useProducts(query?: ProductQueryDto) {
  const [data, setData] = useState<CollectionResponse<ProductResponseDto>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    productService.getProducts(query)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [query]);

  return { data, loading, error };
}
```

### 4.2 Update Component Props

Components should expect standardized response types:

```typescript
interface ProductListProps {
  data: CollectionResponse<ProductResponseDto>;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => Promise<ActionResponse<ProductResponseDto>>;
}
```

### 4.3 Update Form Submissions

```typescript
const handleSubmit = async (formData: ProductFormData) => {
  try {
    const dto = ProductMapper.toCreateDto(formData);
    const response = await productService.createProduct(dto);
    
    // Handle ActionResponse
    showNotification({
      type: 'success',
      message: response.message,
    });
    
    // Navigate to edit page with new item
    navigate(`/products/${response.item.id}/edit`);
  } catch (error) {
    handleApiError(error);
  }
};
```

---

## Phase 5: Error Handling Standardization (Priority: Medium)

### 5.1 Create Centralized Error Handler

**Location:** `/src/utils/error-handler.ts`

```typescript
export class ApiErrorHandler {
  static handle(error: any): ErrorInfo {
    if (axios.isAxiosError(error)) {
      const response = error.response;
      
      if (response?.data) {
        return {
          message: response.data.message || 'An error occurred',
          statusCode: response.status,
          details: response.data.details,
        };
      }
    }
    
    return {
      message: 'Network error',
      statusCode: 0,
    };
  }
}
```

### 5.2 Update All Try-Catch Blocks

```typescript
try {
  // API call
} catch (error) {
  const errorInfo = ApiErrorHandler.handle(error);
  showNotification({
    type: 'error',
    message: errorInfo.message,
  });
}
```

---

## Phase 6: Testing & Validation (Priority: Critical)

### 6.1 Create Response Format Tests

**Location:** `/src/services/__tests__/`

```typescript
describe('Product Service Response Formats', () => {
  it('should parse collection response correctly', async () => {
    const response = await productService.getProducts({});
    expect(response).toMatchObject({
      items: expect.any(Array),
      meta: {
        totalItems: expect.any(Number),
        currentPage: expect.any(Number),
      }
    });
  });

  it('should parse action response correctly', async () => {
    const response = await productService.createProduct(mockDto);
    expect(response).toMatchObject({
      item: expect.any(Object),
      message: expect.any(String),
    });
  });
});
```

### 6.2 Create Integration Tests

Test complete flows:
1. Login → Get token
2. Fetch products → Parse collection
3. Create product → Parse action response
4. Update product → Parse action response
5. Delete product → Parse action response

### 6.3 Manual Testing Checklist

- [ ] Product list loads with pagination
- [ ] Product creation shows success message
- [ ] Product update shows success message
- [ ] Product deletion shows success message
- [ ] Category tree loads correctly
- [ ] Category CRUD operations work
- [ ] Attribute list loads
- [ ] Auth flow works (login/logout)
- [ ] Error messages display correctly
- [ ] Loading states work

---

## Phase 7: Cleanup & Documentation (Priority: Low)

### 7.1 Remove Old Code
- Remove old response handling logic
- Delete unused type definitions
- Clean up mapping functions

### 7.2 Update Documentation
- Document new response formats
- Update component prop types
- Add JSDoc comments

### 7.3 Create Migration Guide
- Document breaking changes
- Provide migration examples
- List deprecated patterns

---

## Implementation Order

### Week 1: Foundation (Critical)
1. **Day 1-2:** Create response types and parser utilities
2. **Day 3:** Update Product Service
3. **Day 4:** Update Category Service
4. **Day 5:** Update Attribute Service

### Week 2: Components (High Priority)
1. **Day 1-2:** Update Product components
2. **Day 3:** Update Category components
3. **Day 4:** Update Attribute components
4. **Day 5:** Testing and bug fixes

### Week 3: Polish (Medium Priority)
1. **Day 1-2:** Error handling standardization
2. **Day 3:** Create integration tests
3. **Day 4:** Documentation
4. **Day 5:** Final testing and deployment prep

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current working code
- [ ] Document current API response formats
- [ ] Create test data for validation
- [ ] Set up development branch

### During Migration
- [ ] Response types created
- [ ] Parser utilities implemented
- [ ] Product Service migrated
- [ ] Category Service migrated
- [ ] Attribute Service migrated
- [ ] Auth Service verified
- [ ] Components updated
- [ ] Error handling standardized
- [ ] Tests written and passing

### Post-Migration
- [ ] All endpoints tested manually
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Old code removed
- [ ] Performance verified
- [ ] Deploy to staging

---

## Risk Mitigation

### Potential Issues & Solutions

1. **Breaking Changes in Components**
   - Solution: Create adapter layer during transition
   - Use feature flags to toggle between old/new

2. **Inconsistent Backend Responses**
   - Solution: Add response validation
   - Log unexpected formats for debugging

3. **Performance Impact**
   - Solution: Implement response caching
   - Use React Query or SWR for data fetching

4. **Type Mismatches**
   - Solution: Strict TypeScript checking
   - Generate types from OpenAPI spec

---

## Success Criteria

1. **All API calls use standardized response handling**
2. **Zero TypeScript errors**
3. **All tests passing (unit & integration)**
4. **No regression in functionality**
5. **Improved error messages for users**
6. **Consistent loading states**
7. **Documentation complete**

---

## Quick Start Commands

```bash
# Start migration
cd /Users/colinroets/dev/projects/product/pim-admin

# Create new branch
git checkout -b feature/api-migration

# Install any new dependencies
npm install axios react-query @tanstack/react-query

# Run tests during development
npm run test:watch

# Type check
npm run type-check

# Build for production
npm run build
```

---

## Notes

- Keep backend and frontend DTOs in sync
- Use strict TypeScript to catch issues early
- Test with real backend responses, not mocks
- Consider using code generation for types
- Monitor bundle size impact
- Profile performance before/after

---

*Created: September 10, 2025*
*Estimated Duration: 3 weeks*
*Priority: High - Required for production*
