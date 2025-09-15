# API Standardization - Quick Reference Guide

## 🚀 For Developers

### Response Format (Always Use This!)

```typescript
// ✅ CORRECT - Standardized Format
return ApiResponse.success(data, 'Operation successful');

// ❌ WRONG - Manual construction
return { success: true, data: data };
```

---

## Standard Response Patterns

### 1. Single Entity Response
```typescript
async getProduct(id: string): Promise<ApiResponse<Product>> {
  const product = await this.productRepository.findOne({ where: { id } });
  if (!product) {
    throw new NotFoundException('Product not found');
  }
  return ApiResponse.success(product, 'Product retrieved successfully');
}
```

### 2. Collection Response
```typescript
async getProducts(query: QueryDto): Promise<CollectionResponse<Product>> {
  const [items, total] = await this.productRepository.findAndCount({
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
  return ResponseHelpers.wrapPaginated([items, total], query.page, query.limit);
}
```

### 3. Create/Update Response
```typescript
async createProduct(dto: CreateProductDto): Promise<ActionResponseDto<Product>> {
  const product = this.productRepository.create(dto);
  const saved = await this.productRepository.save(product);
  return ActionResponseDto.create(saved, 'Product created successfully');
}
```

### 4. Delete Response
```typescript
async deleteProduct(id: string): Promise<ActionResponseDto<Product>> {
  const product = await this.findOne(id);
  await this.productRepository.remove(product);
  return ActionResponseDto.delete(product, 'Product deleted successfully');
}
```

---

## Response Types

### ApiResponse<T>
```typescript
{
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
```

### CollectionResponse<T>
```typescript
{
  success: boolean;
  data: {
    items: T[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    }
  };
  timestamp: string;
}
```

### ActionResponseDto<T>
```typescript
{
  success: boolean;
  data: {
    item: T;
    message: string;
  };
  timestamp: string;
}
```

---

## Controller Examples

### ✅ CORRECT Implementation
```typescript
@Controller('products')
export class ProductsController {
  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<ApiResponse<Product>> {
    return this.productsService.getProduct(id);
  }

  @Get()
  async getProducts(@Query() query: QueryDto): Promise<CollectionResponse<Product>> {
    return this.productsService.getProducts(query);
  }

  @Post()
  async createProduct(@Body() dto: CreateProductDto): Promise<ActionResponseDto<Product>> {
    return this.productsService.createProduct(dto);
  }
}
```

### ❌ WRONG Implementation
```typescript
// DON'T DO THIS!
@Get(':id')
async getProduct(@Param('id') id: string): Promise<any> {  // ❌ No 'any' type
  const product = await this.service.getProduct(id);
  return { product };  // ❌ Not standardized
}
```

---

## Service Examples

### ✅ CORRECT Service
```typescript
import { ApiResponse } from '../../common/dto';

@Injectable()
export class ProductsService {
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return ApiResponse.success(product, 'Product retrieved successfully');
  }
}
```

---

## Frontend Consumption

### Accessing Response Data
```javascript
// Auth response
const response = await authService.login(credentials);
const token = response.data.accessToken;  // Note: nested in data

// Product response
const response = await api.get('/products/123');
const product = response.data.data;  // Note: data.data for ApiResponse

// Collection response
const response = await api.get('/products');
const products = response.data.data.items;  // Note: data.data.items
const totalPages = response.data.data.meta.totalPages;
```

---

## Import Statements

### Backend (NestJS)
```typescript
import { ApiResponse } from '../../common/dto';
import { ActionResponseDto } from '../../common/dto/action-response.dto';
import { CollectionResponse, ResponseHelpers } from '../../common/dto/collection-response.dto';
```

### Frontend (React)
```javascript
import { ApiResponseParser } from '../utils/api-response-parser';
```

---

## Error Handling

### Backend Error Response
```typescript
// NestJS automatically handles this
throw new BadRequestException('Invalid input');

// Produces:
{
  statusCode: 400,
  message: 'Invalid input',
  error: 'Bad Request',
  timestamp: '2025-09-14T...',
  path: '/api/products'
}
```

### Frontend Error Handling
```javascript
try {
  const response = await api.post('/products', data);
  // Handle success
} catch (error) {
  const message = error.response?.data?.message || 'An error occurred';
  // Show error to user
}
```

---

## Testing Your Endpoints

### Quick Test Script
```bash
# Test any endpoint
curl -X GET http://localhost:3010/api/your-endpoint \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Check for standardized format
# Should see: success, data, message, timestamp
```

### Validation Checklist
- [ ] Returns `ApiResponse`, `ActionResponseDto`, or `CollectionResponse`
- [ ] Has proper TypeScript typing (no `any`)
- [ ] Includes descriptive message
- [ ] Success field is boolean
- [ ] Data is nested in `data` field
- [ ] Timestamp is auto-generated

---

## Common Mistakes to Avoid

### ❌ DON'T
```typescript
// Manual response construction
return { success: true, data: product };

// Using 'any' type
async getProduct(id: string): Promise<any>

// Returning raw entity
return product;

// Inconsistent structure
return { product, message: 'Success' };
```

### ✅ DO
```typescript
// Use helper methods
return ApiResponse.success(product, 'Product retrieved');

// Proper typing
async getProduct(id: string): Promise<ApiResponse<Product>>

// Consistent structure
return ActionResponseDto.create(product);

// Use ResponseHelpers for collections
return ResponseHelpers.wrapPaginated([items, total], page, limit);
```

---

## Migration Guide

### Converting Old Endpoints
```typescript
// OLD
async getUser(id: string): Promise<User> {
  return this.userRepository.findOne(id);
}

// NEW
async getUser(id: string): Promise<ApiResponse<User>> {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return ApiResponse.success(user, 'User retrieved successfully');
}
```

---

## Need Help?

1. Check [API_STANDARDIZATION_FINAL_REPORT.md](./API_STANDARDIZATION_FINAL_REPORT.md)
2. Look at existing standardized modules for examples
3. Run test scripts to verify your implementation
4. Ensure TypeScript compilation has no errors

**Remember: Consistency is key! Always use the standardized format.**
