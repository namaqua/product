# 🚨 Database Schema Error - Quick Solution

## The Problem
Your `products` table has a `name` column that shouldn't exist. This is causing the seed to fail.

## The Fastest Fix (30 seconds)

### Step 1: Run the Simple Fix Script
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x simple-fix.sh
./simple-fix.sh
```

### Step 2: If that doesn't work, try Manual Fix
```bash
chmod +x manual-fix.sh
./manual-fix.sh
```

### Step 3: Nuclear Option - Complete Reset
```bash
chmod +x complete-reset.sh
./complete-reset.sh
```

## Manual Fix (if scripts don't work)

### 1. Delete the database completely
```bash
psql -U postgres
DROP DATABASE IF EXISTS pim_dev;
CREATE DATABASE pim_dev;
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
\q
```

### 2. Clear TypeORM cache
```bash
cd /Users/colinroets/dev/projects/product/pim
rm -rf dist/
rm -rf node_modules/.cache
```

### 3. Rebuild
```bash
npm run build
```

### 4. Start server (creates tables)
```bash
npm run start:dev
```
Wait for "Nest application successfully started", then press Ctrl+C

### 5. Seed
```bash
npm run seed
```

## Why This Happens

The database schema doesn't match the entity definitions. This can occur when:
- TypeORM's synchronize feature fails
- Old tables exist from previous attempts
- Manual table modifications were made

## The Correct Schema

**Products table should have:**
- id, sku, type, status, quantity, price, etc.
- ❌ NO "name" column

**Product_locales table should have:**
- id, productId, localeCode
- ✅ name, description (localized content)

## Verification

After fixing, check the schema:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x diagnose.sh
./diagnose.sh
```

## If Nothing Works

The nuclear option - delete everything and start fresh:

```bash
# 1. Stop everything
pkill -f node

# 2. Delete database
psql -U postgres -c "DROP DATABASE IF EXISTS pim_dev;"
psql -U postgres -c "CREATE DATABASE pim_dev;"

# 3. Delete all build files
cd /Users/colinroets/dev/projects/product/pim
rm -rf dist/ node_modules/

# 4. Reinstall
npm install

# 5. Build
npm run build

# 6. Start (creates tables)
npm run start:dev
# Press Ctrl+C after "successfully started"

# 7. Seed
npm run seed
```

## Expected Result

After successful fix:
```
✓ 9 tables created
✓ No "name" column in products table
✓ 6 products seeded
✓ 1 admin user created
✓ API endpoints working
```

---

**Run `./simple-fix.sh` now - it will handle everything automatically!** 🚀
