# PIM Project Learnings

## Overview
This document captures important learnings, gotchas, and solutions discovered during the PIM project development. Reference this to avoid repeating past issues.

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
- Response format: JSON
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

*Last Updated: September 2025*
*Keep this document updated with new learnings!*
