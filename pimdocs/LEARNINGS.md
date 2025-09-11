# PIM Project Learnings

## Overview
This document captures important learnings, gotchas, and solutions discovered during the PIM project development. Reference this to avoid repeating past issues.

**Last Updated:** September 11, 2025 - 14:50 CEST

---

## 🔴 Critical Learnings

### 1. TypeORM Column Naming (PostgreSQL)
**Issue:** SQL queries fail with "column does not exist" errors.

**Problem:** TypeORM uses camelCase for column names by default, but PostgreSQL requires quotes for camelCase identifiers.

**Examples:**
```sql
-- ❌ WRONG (will fail)
SELECT * FROM products WHERE is_deleted = false;
SELECT * FROM products WHERE isDeleted = false;

-- ✅ CORRECT (use quotes for camelCase)
SELECT * FROM products WHERE "isDeleted" = false;
SELECT * FROM products WHERE "isFeatured" = true;
```

**Key Learning:** Always use double quotes around camelCase column names in PostgreSQL queries.

---

### 2. Docker PostgreSQL Port Configuration
**Issue:** Database connection failures despite PostgreSQL running.

**Problem:** Multiple projects using PostgreSQL on the same machine cause port conflicts.

**Solution:** 
- PIM uses PostgreSQL on port **5433** (not default 5432)
- Marketplace uses port 5432
- Always check docker-compose.yml for port mappings

**Configuration:**
```yaml
# docker-compose.yml
services:
  postgres-pim:
    ports:
      - "5433:5432"  # External:Internal
```

```env
# .env file
DATABASE_PORT=5433  # Must match external port
```

---

### 3. NestJS Controller Path Duplication
**Issue:** API endpoints return 404 despite controller being registered.

**Problem:** Global prefix in main.ts + controller path creates duplicate paths.

**Example:**
```typescript
// main.ts
app.setGlobalPrefix('api/v1');

// ❌ WRONG - Results in /api/v1/api/v1/products
@Controller('api/v1/products')

// ✅ CORRECT - Results in /api/v1/products
@Controller('products')
```

**Key Learning:** Don't include the API prefix in controller decorators when using global prefix.

---

### 4. Role-Based Authorization vs Authentication
**Issue:** 403 Forbidden errors despite successful login.

**Problem:** Default user role is 'user' but many endpoints require 'admin' or 'manager'.

**Solution:**
```sql
-- Update user role in database
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

**Role Requirements:**
- `USER`: Can read products
- `MANAGER`: Can create/update products
- `ADMIN`: Can delete products, manage users

---

### 5. Backend Module Registration
**Issue:** New modules/endpoints not accessible after creation.

**Problem:** Backend needs restart to register new modules.

**Solution:** Always restart the backend after:
- Adding new modules to AppModule
- Creating new controllers
- Modifying routing

```bash
# Kill and restart backend
lsof -ti:3010 | xargs kill -9
npm run start:dev
```

---

### 6. Nested Set Model for Categories
**Issue:** Managing hierarchical data efficiently in PostgreSQL.

**Solution:** Implemented Nested Set Model instead of traditional parent-child.

**Benefits:**
- Get all ancestors/descendants with single query
- No recursive CTEs needed
- Mathematical operations for tree management
- Count descendants: `(right - left - 1) / 2`

**Key Operations:**
```typescript
// Get all descendants
WHERE left >= parent.left AND right <= parent.right

// Get all ancestors  
WHERE left <= node.left AND right >= node.right

// Check if leaf node
isLeaf = (right === left + 1)
```

**Important:** Always use transactions when modifying tree structure!

---

### 7. TypeORM Synchronization with Existing Data
**Issue:** TypeORM sync fails when adding NOT NULL columns to tables with existing data.

**Error:** `column "version" of relation "categories" contains null values`

**Problem:** TypeORM's auto-synchronization tries to add NOT NULL columns without default values to tables that already have rows. This happens with:
- Version columns (`@VersionColumn()`)
- Required fields in Nested Set Model (`left`, `right`, `level`)
- Any new required columns added after data exists

**Solutions:**

1. **Quick Fix (Development):**
```bash
# Add columns with defaults using Docker
docker exec postgres-pim psql -U pim_user -d pim_dev -c \
  "ALTER TABLE categories ADD COLUMN version integer DEFAULT 1 NOT NULL;"

# For Nested Set columns
docker exec postgres-pim psql -U pim_user -d pim_dev -c \
  "ALTER TABLE categories ADD COLUMN \"left\" integer DEFAULT 1 NOT NULL;"
docker exec postgres-pim psql -U pim_user -d pim_dev -c \
  "ALTER TABLE categories ADD COLUMN \"right\" integer DEFAULT 2 NOT NULL;"
```

2. **Nuclear Option (Development only):**
```bash
# Drop table and let TypeORM recreate it
docker exec postgres-pim psql -U pim_user -d pim_dev -c \
  "DROP TABLE IF EXISTS categories CASCADE;"
```

3. **Production Approach:**
- Never use `synchronize: true` in production
- Use migrations instead of auto-sync
- Add columns with defaults, then remove defaults if needed

**Key Learning:** 
- TypeORM synchronization is convenient but dangerous with existing data
- Always add NOT NULL columns with default values first
- Consider disabling sync and using migrations for any production-like data
- Version columns (`@VersionColumn()`) are automatically added to all entities extending BaseEntity

**Prevention:**
- Design entities completely before first data insertion
- Use migrations for schema changes after initial development
- Always provide defaults for new NOT NULL columns

---

### 8. Many-to-Many Relationships in TypeORM
**Issue:** Setting up bidirectional many-to-many between Products and Categories.

**Solution:**
```typescript
// Product entity (owner side with @JoinTable)
@ManyToMany(() => Category, category => category.products)
@JoinTable({
  name: 'product_categories',
  joinColumn: { name: 'productId' },
  inverseJoinColumn: { name: 'categoryId' }
})
categories: Category[];

// Category entity (inverse side, no @JoinTable)
@ManyToMany(() => Product, product => product.categories)
products: Product[];
```

**Key Learning:** Only ONE side should have @JoinTable decorator!

---

### 9. Backend Response Structure Mismatch with Frontend
**Issue:** Frontend shows "No access token received" error despite backend returning 200 status and tokens.

**Problem:** NestJS TransformInterceptor wraps all responses in a standardized structure, but frontend expects data at root level.

**Backend Response Structure (with TransformInterceptor):**
```json
{
    "success": true,
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "user": {...}
    },
    "timestamp": "2025-09-09T12:35:12.806Z"
}
```

**Frontend Expected Structure:**
```json
{
    "accessToken": "...",
    "refreshToken": "...",
    "user": {...}
}
```

**Solution:** Update all frontend services to handle wrapped responses:
```typescript
// In all service methods
const response = await api.post('/auth/login', credentials);

// Handle wrapped response structure from backend
const data = response.data.data || response.data;
const { accessToken, refreshToken, user } = data;
```

**Debugging Approach:**
1. Test with curl first - it bypasses browser CORS and shows raw response
2. Add "Test Backend" button to login form that uses fetch() to show exact response
3. Check browser console Network tab for actual response structure
4. Use shell scripts to debug response format independently

**Key Learning:** 
- Always verify the exact response structure when connecting frontend to backend
- TransformInterceptor in NestJS wraps ALL responses - frontend must unwrap them
- Debug API integration issues with curl/shell scripts first, then browser
- When backend returns 200 but frontend fails, it's often a response structure mismatch

**Prevention:**
- Document the exact API response format in API specifications
- Consider if TransformInterceptor is needed for all endpoints
- Create TypeScript interfaces that match actual response structure
- Test with tools like Postman/curl before frontend integration

---

### 10. NestJS Validation Pipe with forbidNonWhitelisted
**Issue:** Products creation returns "Validation failed" error despite correct data.

**Problem:** The validation pipe configuration has `forbidNonWhitelisted: true` which rejects any properties not explicitly defined in the DTO.

**Example:**
```typescript
// validation.pipe.ts configuration
new NestValidationPipe({
  forbidNonWhitelisted: true, // Rejects unknown properties!
  whitelist: true,
  transform: true
});

// CreateProductDto defines allowed fields
// inStock is NOT in the DTO (calculated from quantity)

// ❌ WRONG - Will fail validation
{"sku":"TEST-001","name":"Test","inStock":true}

// ✅ CORRECT - Only DTO fields
{"sku":"TEST-001","name":"Test","quantity":10}
```

**Solution:**
1. Only send fields that exist in the DTO
2. Let the backend calculate derived fields (inStock from quantity)
3. Use enum values in lowercase ("simple" not "SIMPLE")

**Key Learning:** 
- Always check the DTO to see what fields are allowed
- `forbidNonWhitelisted: true` means ONLY DTO fields are accepted
- Derived fields like `inStock` are set by the backend logic, not the API

---

### 11. Authentication Token Field Names
**Issue:** Script fails with "Failed to login" despite backend returning 200 and tokens.

**Problem:** Token extraction scripts were looking for `access_token` but backend returns `accessToken` (camelCase).

**Solution:** Handle both formats in scripts:
```python
# In shell scripts, handle both formats
token = data.get('accessToken', '') or data.get('access_token', '')
```

**Key Learning:** 
- Backend returns `accessToken` (camelCase)
- Always check actual response format before parsing
- Handle both snake_case and camelCase for compatibility

---

### 12. Product DTO Field Mapping
**Issue:** "property compareAtPrice should not exist" validation error when creating products.

**Problem:** Frontend and scripts were using e-commerce standard field names that don't match backend DTOs.

**Field Mappings:**
```typescript
// ❌ WRONG - Frontend/common names
compareAtPrice, featured, inStock

// ✅ CORRECT - Backend DTO fields
specialPrice, isFeatured, (inStock is calculated)
```

**Complete Field Map:**
- `compareAtPrice` → `specialPrice` 
- `featured` → `isFeatured`
- `inStock` → Don't send (calculated from quantity)
- `trackInventory` → `manageStock`

**Key Learning:** 
- Always check actual DTO definitions when validation fails
- Backend DTOs may use different naming than industry standards
- `forbidNonWhitelisted: true` means ONLY exact DTO fields accepted

---

### 13. Working User Credentials
**Issue:** Confusion about which admin user to use and what password works.

**Solution:** Use existing users in database:
```bash
# Working credentials (verified Sept 11, 2025)
Email: admin@test.com
Password: Admin123!
Role: admin

# Also exists
admin@example.com (admin role)
product-test@example.com (manager role)
```

**Key Learning:** 
- Check database for existing users before creating new ones
- Document working credentials in CONTINUITY_PROMPT.md
- Frontend login form should be pre-filled with working credentials

---

### 14. Category DTO Field Names (IMPORTANT)
**Issue:** "property isActive should not exist" and "metaKeywords must be a string" errors when creating categories.

**Problem:** Category DTO uses different field names than expected:
- Frontend assumed `isActive` but backend uses `isVisible`
- Frontend sent `metaKeywords` as array but backend expects string
- Backend has `forbidNonWhitelisted: true` - rejects unknown fields

**Correct Category Fields:**
```typescript
// ❌ WRONG - Common assumptions
isActive: true,              // Field doesn't exist
metaKeywords: ["tech", "gadgets"]  // Must be string

// ✅ CORRECT - Actual DTO fields
isVisible: true,              // Visibility control
showInMenu: true,            // Menu display
isFeatured: false,           // Featured flag
metaKeywords: "tech, gadgets"  // Comma-separated string
```

**Complete Category DTO Fields:**
- `name` (required)
- `slug` (optional, auto-generated)
- `description`
- `parentId` (UUID or undefined for root)
- `sortOrder` (number)
- `isVisible` (NOT isActive)
- `showInMenu`
- `isFeatured`
- `metaTitle`
- `metaDescription`
- `metaKeywords` (string, not array)
- `imageUrl`
- `bannerUrl`
- `defaultAttributes` (object)
- `requiredAttributes` (string array)

**Key Learning:**
- Always check actual DTOs in backend code
- Frontend can show keywords as tags but must send as string
- Map `isActive` (frontend) to `isVisible` (backend)
- Test with curl/scripts first to verify field names

---

### 15. Category Duplicate Slug Error (409 Conflict)
**Issue:** "Duplicate entry detected" error when creating categories with test script.

**Problem:** Backend enforces unique slugs for categories. If you don't provide a slug, it auto-generates one from the name. Running test scripts multiple times creates conflicts.

**Error Example:**
```json
{
  "statusCode": 409,
  "message": "Duplicate entry detected",
  "details": {"field": "slug"}
}
```

**Solutions:**

1. **Check Before Creating:**
```bash
# Check if category exists first
EXISTS=$(curl -s GET /categories | jq '.items[] | select(.slug=="electronics")')
if [ -z "$EXISTS" ]; then
  # Create only if doesn't exist
fi
```

2. **Use Unique Slugs:**
```json
{
  "name": "Electronics",
  "slug": "electronics-$(date +%s)"
}
```

3. **Let Backend Generate:**
```json
{
  "name": "Electronics Test 1234"
  // Don't include slug, backend will generate from name
}
```

4. **Clean Up Duplicates:**
```bash
./cleanup-categories.sh  # Interactive cleanup tool
./view-categories.sh     # View current state
```

**Key Learning:**
- Categories must have unique slugs
- Test scripts should check for existing data
- Use timestamps for unique test data
- Provide cleanup scripts for test data

**Prevention:**
- Always check if data exists before creating
- Use `setup-categories.sh` which handles duplicates
- Clean up test data after testing
- Use unique names/slugs for test categories

---

### 16. JSON Formatting in Bash Scripts (Critical)
**Issue:** "Bad control character in string literal in JSON" error when sending requests via curl.

**Problem:** Two issues cause this error:
1. Multi-line JSON strings include literal newline characters
2. Special characters (apostrophes, quotes) aren't escaped by bash

**❌ WRONG - Bash string substitution doesn't escape special chars:**
```bash
# Problem 1: Multi-line JSON includes newlines
JSON_DATA="{
    \"name\": \"$name\"
}"

# Problem 2: Apostrophes break JSON
NAME="Men's Clothing"
JSON="{\"name\":\"$NAME\"}"  # Results in: {"name":"Men's Clothing"}
# The apostrophe in Men's is NOT escaped!
```

**✅ CORRECT - Use jq to build JSON (handles ALL escaping):**
```bash
# BEST SOLUTION: jq properly escapes everything
NAME="Men's Clothing"
DESC="100% "Pure" Cotton"  # Even quotes!

JSON=$(jq -n \
  --arg name "$NAME" \
  --arg desc "$DESC" \
  --arg parent "$PARENT_ID" \
  '{name: $name, description: $desc, parentId: $parent}')

curl -d "$JSON"  # Works perfectly!
```

**Error Examples:**
- "Bad control character in string literal at position 65"
- Names with apostrophes: "Men's", "Children's"
- Descriptions with quotes: '12" monitor'
- Any special characters: &, <, >, \n, \t

**Key Learning:**
- Bash doesn't escape JSON special characters
- Apostrophes/quotes in data break simple string substitution  
- **ALWAYS use jq to build JSON** when variables might contain special chars
- jq automatically escapes: quotes, apostrophes, newlines, backslashes

**Prevention:**
- Never use bash string substitution for JSON with user data
- Always test with: `echo "$JSON" | jq .`
- Use jq for ALL JSON construction in scripts

---

### 17. Category API Response Format Variations
**Issue:** Scripts fail with "Cannot index array with string 'items'" when parsing category responses.

**Problem:** The category API endpoints return different response structures:
- `/categories` with pagination returns: `{data: {items: [...], meta: {...}}}`
- `/categories/tree` returns: `{data: [...]}` or just `[...]`
- Error responses vary in structure

**Solution:** Handle multiple response formats in scripts:
```bash
# Extract items from different structures
ITEMS=$(echo "$RESPONSE" | jq '.data.items // .data // .items // .' 2>/dev/null)

# Handle tree responses
TREE=$(echo "$RESPONSE" | jq '.data[] // .[] // .' 2>/dev/null)

# Get total count from various locations
TOTAL=$(echo "$RESPONSE" | jq -r '.data.meta.totalItems // .meta.totalItems // (.data | length) // 0')
```

**Key Learning:**
- Always test API response format before parsing
- Handle both wrapped (.data) and unwrapped responses
- Tree endpoints may return arrays directly
- Use jq's `//` operator for fallback parsing

**Prevention:**
- Create debug scripts to check response formats first
- Use flexible jq queries with multiple fallbacks
- Test with curl to see raw response structure

---

### 18. Category Parent ID Validation
**Issue:** "Validation failed" when creating subcategories with parentId.

**Problem:** Parent ID must be:
- A valid UUID that exists in the database
- Not an empty string (use null or omit for root categories)
- Passed as a string in JSON, not a number

**Solution:**
```bash
# Check if parent ID is valid before using
if [ ! -z "$PARENT_ID" ] && [ "$PARENT_ID" != "null" ]; then
    JSON=$(jq -n --arg p "$PARENT_ID" '{parentId: $p, ...}')
else
    # Omit parentId for root categories
    JSON=$(jq -n '{name: "...", ...}')
fi
```

**Key Learning:**
- Empty string parentId causes validation failure
- Always validate parent exists before creating children
- Use null or omit field for root categories

---

### 19. Product Field Mapping (Frontend vs Backend)
**Issue:** Product Edit form fails with "Validation failed" error despite sending correct-looking data.

**Problem:** Frontend and backend use different field names for the same properties, and backend has `forbidNonWhitelisted: true` which rejects unknown fields.

**Critical Field Mappings:**
```typescript
// Frontend Form Fields → Backend DTO Fields
featured → isFeatured          // Boolean flag
compareAtPrice → specialPrice   // Sale price
inventoryQuantity → quantity    // Stock amount
slug → urlKey                   // URL path segment

// Enum values must be lowercase
status: 'DRAFT' → 'draft'
type: 'SIMPLE' → 'simple'
```

**Complete Mapping Table:**
| Frontend/UI | Backend API | Notes |
|------------|-------------|-------|
| `featured` | `isFeatured` | Boolean |
| `compareAtPrice` | `specialPrice` | Number/null |
| `inventoryQuantity` | `quantity` | Integer |
| `slug` | `urlKey` | String |
| `status` | `status` | Must be lowercase |
| `type` | `type` | Must be lowercase |

**Solution in Product Edit:**
```typescript
// Map form data to backend format
const updateData = {
  sku: formData.sku,
  name: formData.name,
  status: formData.status.toLowerCase(),  // Ensure lowercase
  type: formData.type.toLowerCase(),      // Ensure lowercase
  isFeatured: formData.featured,          // Map field name
  quantity: parseInt(formData.quantity),
  // Only send non-empty optional fields
  ...(formData.description?.trim() && { description: formData.description.trim() }),
  ...(formData.compareAtPrice && { specialPrice: parseFloat(formData.compareAtPrice) })
};
```

**Key Learning:**
- Always check backend DTOs for exact field names
- Map UI-friendly names to backend names before sending
- Empty strings should not be sent for optional fields
- Enums must be lowercase for backend validation

---

### 20. Implementing Features Without Backend Changes
**Issue:** Backend doesn't have `/products/{id}/duplicate` endpoint but we need duplicate functionality.

**Problem:** Backend API is sacrosanct (cannot be modified), but frontend needs features.

**Solution:** Implement complex features in frontend using existing endpoints:
```typescript
// Duplicate product using GET + POST
async duplicateProduct(id: string) {
  // Step 1: Get existing product
  const existing = await this.getProduct(id);
  
  // Step 2: Modify for duplicate
  const duplicate = {
    ...existing,
    sku: `${existing.sku}-COPY-${Date.now()}`,
    name: `${existing.name} (Copy)`,
    status: 'draft'
  };
  
  // Step 3: Create new product
  return await this.createProduct(duplicate);
}
```

**Key Learning:**
- Frontend can orchestrate multiple API calls for complex features
- Don't always need backend endpoints for every action
- Keep backend simple, add complexity in frontend when appropriate

---

### 21. User-Friendly Error Messages
**Issue:** Technical error messages like "PATCH /api/v1/products/123 - 400 Bad Request" confuse users.

**Problem:** Exposing technical details (HTTP methods, endpoints, status codes) in UI.

**Solution:** Transform technical errors into user-friendly messages:
```typescript
// ❌ WRONG - Technical jargon
alert('Failed to PATCH product via /api/v1/products');

// ✅ CORRECT - User-friendly
setSuccessMessage('Product archived successfully.');
setError('Unable to archive product. Please try again.');
```

**Message Guidelines:**
- Success: "[Action] successfully" (e.g., "Product duplicated successfully")
- Error: "Unable to [action]. Please try again."
- Never mention: HTTP methods, endpoints, status codes, "payload", "request"
- Use notifications instead of browser alerts

**Key Learning:**
- Keep technical details in console.log for developers
- UI messages should be in user's language, not developer's
- Auto-dismiss messages after 3-5 seconds
- Use icons and colors for better visual feedback

---

### 22. Media Image Display Issues (Black Squares) - FIXED Sept 11, 2025
**Issue:** Images upload successfully but display as black squares in ProductEdit and ProductDetails views.

**Problem:** Test scripts were creating corrupted/malformed 1x1 pixel JPEG files (285-332 bytes) that displayed as black:
```bash
# These test images were essentially blank
066373aa-e5d4-48da-a043-1f9dffc41572.jpg (285 bytes) - Black square
0795ecb8-7722-42c8-b5f5-dd4155058eec.jpg (285 bytes) - Black square
```

**Root Cause:**
1. Test scripts used malformed JPEG hex data to create tiny test images
2. Backend served these correctly, but they were genuinely black/blank images
3. The media functionality was working perfectly - just displaying bad test data

**Solution:**
1. **Replace test images with real ones:**
```bash
# Download real images from Lorem Picsum
curl -L "https://picsum.photos/800/800" -o product-image.jpg

# Or use placeholder services
curl -L "https://via.placeholder.com/800x800" -o placeholder.jpg
```

2. **Check file sizes - real images should be > 10KB:**
```bash
# Find real vs test images
ls -la uploads/*.jpg | awk '$5 > 10000 {print $9, $5}'
```

3. **Upload real images through the UI or API:**
- Use MediaUpload component in ProductEdit
- Drag & drop real product images
- Images now display correctly

**Key Learning:**
- Always use real images for testing (not tiny hex-generated files)
- Check file sizes - images < 1KB are likely corrupted
- Backend static file serving was working correctly all along
- The MediaUpload component and gallery were functioning properly

**Prevention:**
- Use placeholder image services for test data
- Download sample images from free stock photo sites
- Never create test images with raw hex data
- Verify uploaded images are viewable before debugging display issues

**Debugging Steps:**
1. Check image URL accessibility: `curl -I http://localhost:3010/uploads/image.jpg`
2. Verify file size: `ls -la uploads/` (should be > 10KB for real images)
3. Test direct browser access to image URL
4. Clear browser cache if images were previously cached as black

---

## 🟡 Important Patterns

### Shell Script Organization
**Location:** All shell scripts MUST go in `/Users/colinroets/dev/projects/product/shell-scripts/`
- Never in project root
- Not tracked in Git
- Organized by purpose (e.g., `/frontend-debug/`)

### API Endpoint Testing Order
1. **Setup admin user first** (role authorization)
2. **Login to get JWT token**
3. **Test endpoints with proper headers**
4. **Use unique identifiers** (timestamps for SKUs)

### Database Cleanup Pattern
```bash
# Safe cleanup - only test data
DELETE FROM products WHERE sku LIKE 'TEST-%';

# Full cleanup - careful!
TRUNCATE TABLE products CASCADE;
```

---

## 🟢 Best Practices Discovered

### 1. Unique Test Data
Always use timestamps or UUIDs in test data to avoid conflicts:
```javascript
const UNIQUE_SKU = `TEST-${Date.now()}`;
```

### 2. Comprehensive Error Checking
Check both authentication AND authorization:
- 401 = Not authenticated (no/invalid token)
- 403 = Not authorized (wrong role)
- 409 = Conflict (duplicate data)

### 3. Module Structure
Successful module pattern:
```
modules/products/
├── entities/
├── dto/
├── products.controller.ts
├── products.service.ts
├── products.module.ts
└── index.ts  // Public API exports
```

### 4. DTO Organization
Keep DTOs organized by purpose:
```
dto/
├── create-*.dto.ts      // Creation
├── update-*.dto.ts      // Updates
├── *-query.dto.ts       // Query params
├── *-response.dto.ts    // API responses
├── *-tree.dto.ts        // Special structures
└── index.ts             // Barrel export
```

### 5. Testing Scripts Evolution
1. Start simple (basic CRUD)
2. Add authentication
3. Handle existing data
4. Add comprehensive validation
5. Include cleanup and reset

---

## 💡 Debugging Tips

### Check What's Running
```bash
# Docker containers
docker ps | grep pim

# Backend process
lsof -i :3010

# Database connection
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT 1;"
```

### View Logs
```bash
# Backend logs
tail -f /Users/colinroets/dev/projects/product/pim/backend.log

# Docker logs
docker-compose logs -f postgres-pim
```

### Quick Database Queries
```bash
# Count products
docker exec postgres-pim psql -U pim_user -d pim_dev -t -c \
  'SELECT COUNT(*) FROM products WHERE "isDeleted" = false;'

# View users and roles
docker exec postgres-pim psql -U pim_user -d pim_dev -c \
  'SELECT email, role, status FROM users;'

# Check category tree
docker exec postgres-pim psql -U pim_user -d pim_dev -c \
  'SELECT name, "left", "right", level FROM categories WHERE "isDeleted" = false ORDER BY "left";'
```

### Check Nested Set Integrity
```sql
-- Find broken nested set values
SELECT name, "left", "right", level 
FROM categories 
WHERE "isDeleted" = false 
ORDER BY "left";

-- Check for gaps in nested set
SELECT c1.name, c1."right" + 1 as gap_start, 
       MIN(c2."left") - 1 as gap_end
FROM categories c1
JOIN categories c2 ON c2."left" > c1."right"
WHERE c1."isDeleted" = false AND c2."isDeleted" = false
GROUP BY c1.id, c1.name, c1."right"
HAVING c1."right" + 1 < MIN(c2."left");
```

---

## 🔧 Common Fixes

### "Cannot find module" Error
```bash
cd /Users/colinroets/dev/projects/product/pim
rm -rf node_modules dist
npm install
npm run build
```

### Permission Denied for Scripts
```bash
chmod +x script-name.sh
```

### Port Already in Use
```bash
lsof -ti:3010 | xargs kill -9  # Kill process on port
```

### Docker Not Running
```bash
docker-compose up -d  # Start containers
docker-compose restart  # Restart if issues
```

### Vite React Dependencies Error
```bash
# Clear Vite cache and reinstall
cd /Users/colinroets/dev/projects/product/pim-admin
rm -rf node_modules/.vite .vite node_modules package-lock.json
npm install
npm run dev -- --force
```

---

## 📝 Configuration References

### Ports Used
- **Backend API:** 3010
- **Frontend:** 5173
- **PostgreSQL:** 5433 (Docker mapped)
- **Redis:** 6380 (Docker mapped)

### Database Naming Convention
- Tables: plural, lowercase (products, users)
- Columns: camelCase ("isDeleted", "createdAt")
- Indexes: table_column_idx
- Foreign Keys: table_fk_column

### API Conventions
- Base path: `/api/v1`
- Auth header: `Authorization: Bearer <token>`
- Response format: JSON (wrapped in success/data structure)
- Pagination: `?page=1&limit=20`

---

## 🚀 Productivity Shortcuts

### Quick Test Cycle
```bash
# One command to clean and test
./verify-product-module.sh
```

### Database Reset
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d     # Fresh start
```

### Full Project Test
```bash
cd /Users/colinroets/dev/projects/product
npm run dev  # Starts both frontend and backend
```

---

## 📚 Module Completion Checklist

When completing a module, ensure:
- [ ] Entity with all fields
- [ ] Service with business logic
- [ ] Controller with endpoints
- [ ] DTOs for validation
- [ ] Module properly registered in AppModule
- [ ] Relationships configured (if any)
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Role-based access configured
- [ ] Error handling complete
- [ ] Database migrations if needed
- [ ] Swagger tags added to main.ts

---

## 🔄 Session Continuity Tips

When starting a new session:
1. Check Docker is running
2. Verify backend is up
3. Review this learnings file
4. Check last completed task
5. Run health check endpoint

---

*Last Updated: September 11, 2025 - 14:50 CEST*
*Keep this document updated with new learnings!*