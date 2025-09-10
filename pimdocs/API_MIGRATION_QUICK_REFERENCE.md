# API Migration Quick Reference Card

## 🎯 Response Format Cheat Sheet

### 1️⃣ Collection Response (Lists)
**Endpoints:** `GET /products`, `GET /categories`, `GET /attributes`
```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "totalItems": 100,
      "itemCount": 20,
      "itemsPerPage": 20,
      "totalPages": 5,
      "currentPage": 1
    }
  },
  "timestamp": "2025-09-10T..."
}
```
**Parse:** `ApiResponseParser.parseCollection<T>(response)`

### 2️⃣ Action Response (CUD Operations)
**Endpoints:** `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
```json
{
  "success": true,
  "data": {
    "item": {...},
    "message": "Created successfully"
  },
  "timestamp": "2025-09-10T..."
}
```
**Parse:** `ApiResponseParser.parseAction<T>(response)`

### 3️⃣ Single Item Response
**Endpoints:** `GET /products/:id`, `GET /categories/:id`
```json
{
  "success": true,
  "data": {...},  // DTO directly
  "timestamp": "2025-09-10T..."
}
```
**Parse:** `ApiResponseParser.parseSingle<T>(response)`

### 4️⃣ Auth Response (Special)
**Endpoints:** `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {...}  // Only for login/register
}
```
**Parse:** `ApiResponseParser.parseAuth(response)`

---

## 🔄 Service Method Patterns

```typescript
// Collection
async getAll(query: QueryDto): Promise<CollectionResponse<ResponseDto>> {
  const response = await api.get('/endpoint', { params: query });
  return ApiResponseParser.parseCollection<ResponseDto>(response);
}

// Single Item
async getOne(id: string): Promise<ResponseDto> {
  const response = await api.get(`/endpoint/${id}`);
  return ApiResponseParser.parseSingle<ResponseDto>(response);
}

// Create
async create(dto: CreateDto): Promise<ActionResponse<ResponseDto>> {
  const response = await api.post('/endpoint', dto);
  return ApiResponseParser.parseAction<ResponseDto>(response);
}

// Update
async update(id: string, dto: UpdateDto): Promise<ActionResponse<ResponseDto>> {
  const response = await api.put(`/endpoint/${id}`, dto);
  return ApiResponseParser.parseAction<ResponseDto>(response);
}

// Delete
async remove(id: string): Promise<ActionResponse<ResponseDto>> {
  const response = await api.delete(`/endpoint/${id}`);
  return ApiResponseParser.parseAction<ResponseDto>(response);
}
```

---

## 🚨 Common Gotchas

### ❌ OLD Way (Don't Use)
```typescript
// Direct data access
const products = response.data;
const token = response.data.accessToken;

// Manual unwrapping
const data = response.data.data || response.data;

// Assuming structure
const items = response.data.items;
```

### ✅ NEW Way (Use This)
```typescript
// Use parser for collections
const products = ApiResponseParser.parseCollection(response);

// Use parser for actions
const result = ApiResponseParser.parseAction(response);
console.log(result.message); // Show user feedback

// Use parser for single items
const product = ApiResponseParser.parseSingle(response);

// Auth is special
const auth = ApiResponseParser.parseAuth(response);
```

---

## 🎭 Component Patterns

### Handling Collections
```typescript
const [data, setData] = useState<CollectionResponse<ProductResponseDto>>();

// Fetch
const response = await productService.getProducts(query);
setData(response);

// Display
<div>
  {data?.items.map(item => <Card key={item.id} {...item} />)}
  <Pagination 
    currentPage={data?.meta.currentPage}
    totalPages={data?.meta.totalPages}
  />
</div>
```

### Handling Actions
```typescript
const handleCreate = async (formData: CreateProductDto) => {
  try {
    const response = await productService.createProduct(formData);
    
    // Use the message from response
    showNotification({ 
      type: 'success', 
      message: response.message 
    });
    
    // Navigate using the created item
    navigate(`/products/${response.item.id}`);
  } catch (error) {
    handleError(error);
  }
};
```

### Handling Errors
```typescript
try {
  // API call
} catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'An error occurred';
    showNotification({ type: 'error', message });
  }
}
```

---

## 📝 DTO Field Mappings

### Product Fields
| Frontend (Old) | Backend DTO (New) |
|---------------|------------------|
| `slug` | `urlKey` |
| `featured` | `isFeatured` |
| `trackInventory` | `manageStock` |
| `compareAtPrice` | `specialPrice` |
| `visibility` (enum) | `isVisible` (boolean) |
| `inStock` | Don't send (calculated) |

### Category Fields
| Frontend (Old) | Backend DTO (New) |
|---------------|------------------|
| `isActive` | `isVisible` |
| `metaKeywords[]` | `metaKeywords` (string) |

### Status Values
| Frontend | Backend |
|----------|---------|
| `ACTIVE` | `published` |
| `DRAFT` | `draft` |
| `ARCHIVED` | `archived` |

### Product Types
| Frontend | Backend |
|----------|---------|
| `VARIABLE` | `configurable` |
| `SIMPLE` | `simple` |
| `BUNDLE` | `bundle` |
| `VIRTUAL` | `virtual` |

---

## 🧪 Testing Commands

```bash
# Test backend responses
cd /Users/colinroets/dev/projects/product/shell-scripts
./test-frontend-api-migration.sh

# Quick API test
curl -s http://localhost:3010/api/v1/products | jq 'keys'

# Check response structure
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3010/api/v1/products | jq '.data | keys'
```

---

## 📦 Import Statements

```typescript
// Types
import { 
  CollectionResponse, 
  ActionResponse,
  AuthResponse 
} from '@/types/api-responses.types';

// Parser
import { ApiResponseParser } from '@/utils/api-response-parser';

// DTOs
import {
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto
} from '@/types/dto/products/product-response.dto';

// Service
import productService from '@/services/product.service';
```

---

## 🔥 Quick Debug

If something's not working:

1. **Check raw response:**
   ```typescript
   console.log('Raw response:', response.data);
   ```

2. **Check wrapped structure:**
   ```typescript
   console.log('Is wrapped?', response.data.success !== undefined);
   ```

3. **Check data location:**
   ```typescript
   console.log('Data at:', {
     root: response.data,
     wrapped: response.data.data,
     items: response.data.data?.items
   });
   ```

4. **Use test script:**
   ```bash
   ./test-frontend-api-migration.sh
   ```

---

## 📍 File Locations

```
/pim-admin/src/
├── types/
│   ├── api-responses.types.ts     # Response interfaces
│   └── dto/                       # Backend DTOs
│       ├── products/
│       ├── categories/
│       └── attributes/
├── utils/
│   ├── api-response-parser.ts     # Parser utility
│   └── dto-mappers/               # DTO mappers
├── services/
│   ├── product.service.ts         # Updated service
│   ├── category.service.ts
│   └── attribute.service.ts
└── features/
    └── products/
        └── ProductList.tsx         # Updated component
```

---

## ⚡ Copy-Paste Templates

### Service Method
```typescript
async methodName(params): Promise<ReturnType> {
  const response = await api.method('/endpoint', data);
  return ApiResponseParser.parseType<DtoType>(response);
}
```

### Component Fetch
```typescript
const [data, setData] = useState<CollectionResponse<DtoType>>();
const [loading, setLoading] = useState(true);

useEffect(() => {
  service.getAll(query)
    .then(setData)
    .catch(console.error)
    .finally(() => setLoading(false));
}, [query]);
```

### Error Handler
```typescript
const handleApiError = (error: any) => {
  const message = error.response?.data?.message || 
                  error.message || 
                  'Operation failed';
  showNotification({ type: 'error', message });
};
```

---

**Keep this card handy during migration!** 🚀
