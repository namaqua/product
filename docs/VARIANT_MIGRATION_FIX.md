# Variant Migration Fix - Issue Resolution

## Problem
The migration command was failing with: `Missing required argument: dataSource`

## Root Cause
1. The migration file had incorrect naming convention
2. The migration command needed the data source configuration

## Solution Applied

### 1. Fixed Migration File
- **Old name**: `1694520000000-add-variant-fields.migration.ts`
- **New name**: `1736700000000-AddVariantFields.ts`
- **Location**: `/engines/src/migrations/`
- Updated class name to match convention: `AddVariantFields1736700000000`
- Used a more recent timestamp (1736700000000) to ensure it runs after existing migrations

### 2. Updated Migration Commands
The package.json already has the correct commands configured:
```json
"migration:run": "npm run typeorm -- migration:run -d typeorm.config.ts"
```

### 3. Created Helper Scripts
Created several scripts in `/shell-scripts/`:
- `quick-fix-migration.sh` - One-command solution (RECOMMENDED)
- `check-and-migrate.sh` - Checks DB connection before migrating
- `run-variant-migration.sh` - Direct migration runner
- `test-variant-endpoints.sh` - Tests the new endpoints

## How to Run the Migration

### Option 1: Quick Fix (Recommended)
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x quick-fix-migration.sh
./quick-fix-migration.sh
```

### Option 2: Manual Steps
```bash
# 1. Ensure Docker is running
cd /Users/colinroets/dev/projects/product
docker-compose up -d

# 2. Run the migration
cd engines
npm run migration:run

# 3. Restart the backend
npm run start:dev
```

### Option 3: Using npm directly
```bash
cd /Users/colinroets/dev/projects/product/engines
npm run migration:run
```

## Verify Migration Success

### Check if migration ran:
```bash
npm run migration:show
```

### Check database directly:
```bash
docker exec -it postgres-pim psql -U pim_user -d pim_dev -c "\d products"
```

You should see these new columns:
- `variantAxes` (jsonb)
- `variantAttributes` (jsonb)
- `inheritedAttributes` (boolean)
- `variantGroupId` (varchar)
- `isConfigurable` (boolean)

## Troubleshooting

### If migration already exists:
```bash
# Check what migrations have run
npm run migration:show

# If needed, revert and re-run
npm run migration:revert
npm run migration:run
```

### If database connection fails:
1. Check Docker: `docker ps`
2. Check .env file has correct settings:
   - DATABASE_PORT=5433 (not 5432)
   - DATABASE_HOST=localhost
3. Restart Docker: `docker-compose restart`

### If TypeORM can't find the migration:
- Ensure the file is in `/engines/src/migrations/`
- File must end with `.ts` (not `.migration.ts`)
- Class name must match: `AddVariantFields1736700000000`

## Next Steps After Migration

1. **Restart backend** (if running):
   ```bash
   cd /Users/colinroets/dev/projects/product/engines
   npm run start:dev
   ```

2. **Test variant endpoints**:
   ```bash
   cd /Users/colinroets/dev/projects/product/shell-scripts
   ./test-variant-endpoints.sh
   ```

3. **Use the new variant features**:
   - Create variant groups
   - Generate variants from combinations
   - Bulk update variants
   - Use the matrix view

## Summary
The migration system is now properly configured and the variant fields will be added to your database. The issue was primarily a naming convention mismatch which has been resolved.

---
*Issue resolved: September 12, 2025*
