# ⚠️ Database Schema Issue - SOLVED

## The Problem
The error `null value in column "name" of relation "products" violates not-null constraint` indicates that your `products` table has a `name` column that shouldn't exist.

**Why this is wrong:**
- Our Product entity doesn't have a `name` field
- Product names are stored in `product_locales` table for multi-language support
- The database has an old/incorrect schema

## The Solution

### Option 1: Quick Fix (Recommended)
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x quick-fix.sh
./quick-fix.sh
```

This will:
1. Drop and recreate the database
2. Let TypeORM create correct tables
3. Seed with sample data

### Option 2: Manual Fix
```bash
# 1. Drop the database
psql -U postgres
DROP DATABASE pim_dev;
CREATE DATABASE pim_dev;
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
\q

# 2. Go to backend directory
cd /Users/colinroets/dev/projects/product/pim

# 3. Start server (creates tables)
npm run start:dev
# Wait for "Nest application successfully started" then press Ctrl+C

# 4. Seed the database
npm run seed
```

### Option 3: Keep Existing Data (Advanced)
If you have data you want to keep:

```sql
-- Connect to database
psql -U pim_user -d pim_dev

-- Remove the name column from products
ALTER TABLE products DROP COLUMN IF EXISTS name;

-- Exit
\q
```

Then run seed:
```bash
cd /Users/colinroets/dev/projects/product/pim
npm run seed
```

## Understanding the Architecture

### Correct Schema Design
```
products table:
  - id, sku, type, status, price, quantity, etc.
  - NO name field!

product_locales table:
  - id, product_id, locale_code
  - name, description, etc. (localized content)
```

### Why This Design?
- **Multi-language support**: Each product can have names in multiple languages
- **Scalability**: Easy to add new languages without changing schema
- **Best practice**: Separation of concerns

## Verification

After fixing, verify the schema:

```bash
# Check schema script
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x check-schema.sh
./check-schema.sh
```

You should see:
- `products` table WITHOUT a `name` column
- `product_locales` table WITH a `name` column

## Complete Setup Commands

```bash
# 1. Fix database
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x quick-fix.sh
./quick-fix.sh

# 2. Start server
cd /Users/colinroets/dev/projects/product/pim
npm run start:dev

# 3. In another terminal, test
cd /Users/colinroets/dev/projects/product/shell-scripts
./test-products.sh
```

## Expected Result

After fixing:
- ✅ Database has correct schema
- ✅ 9 tables created automatically
- ✅ 6 sample products seeded
- ✅ API endpoints working
- ✅ Multi-language support ready

## Prevention

To avoid this in the future:
1. Always let TypeORM manage schema in development (synchronize: true)
2. Don't manually modify database tables
3. Use migrations for production
4. Keep entity definitions as source of truth

---

**Run `./quick-fix.sh` now to resolve the issue!** 🚀
