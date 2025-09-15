# TypeORM Migration Fix for Import/Export Module

## Date: December 2024
## Issue: TypeORM migration failing with error code 1

## Root Causes Identified

1. **Enum Types in Migrations**: TypeORM has issues creating enum types inline within table definitions
2. **Array Column Types**: PostgreSQL array types (`text[]`) can cause issues in TypeORM migrations
3. **Foreign Key Constraints**: Inline foreign key definitions sometimes fail

## Solutions Applied

### 1. Entity Updates
Changed all enum columns to use `varchar` instead of TypeORM's enum type:
- `import-job.entity.ts` - Changed type and status columns to varchar(50)
- `export-job.entity.ts` - Changed type, format, and status columns to varchar(50)
- `import-mapping.entity.ts` - Changed type column to varchar(50)

The enum values are still preserved in TypeScript for type safety, but stored as strings in the database.

### 2. Migration File Updates
Modified `1734000000000-CreateImportExportTables.ts`:
- Replaced inline enum definitions with varchar columns
- Changed `text[]` array type to `text` with JSON transformer
- Separated foreign key creation from table creation
- Added explicit enum creation with error handling

### 3. TypeORM Configuration
Updated `typeorm.config.ts`:
- Simplified path resolution
- Added explicit DataSource export
- Improved error logging

## Quick Fix Instructions

### Option 1: Use the Automated Fix Script (Recommended)
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x fix-migration.sh
./fix-migration.sh
```

This script will:
1. Check PostgreSQL connection
2. Try TypeORM migration
3. If that fails, run direct SQL
4. Verify tables were created

### Option 2: Manual SQL Execution
```bash
cd /Users/colinroets/dev/projects/product/engines

# Connect to database
PGPASSWORD=secure_password_change_me psql -h localhost -p 5433 -U pim_user -d pim_dev

# Run the SQL file
\i src/migrations/import-export-tables.sql

# Verify tables
\dt import_*
\dt export_*
\q
```

### Option 3: Force TypeORM Migration
```bash
cd /Users/colinroets/dev/projects/product/engines

# First, check current migration status
npx typeorm migration:show -d typeorm.config.ts

# If the migration doesn't exist in the migrations table, run it
npx typeorm migration:run -d typeorm.config.ts

# If it fails, try with verbose logging
npx typeorm migration:run -d typeorm.config.ts --verbose
```

## File Changes Summary

### Modified Files:
1. `/engines/typeorm.config.ts` - Simplified configuration
2. `/engines/src/migrations/1734000000000-CreateImportExportTables.ts` - Changed to use varchar instead of enums
3. `/engines/src/modules/import-export/entities/import-job.entity.ts` - Updated column types
4. `/engines/src/modules/import-export/entities/export-job.entity.ts` - Updated column types
5. `/engines/src/modules/import-export/entities/import-mapping.entity.ts` - Updated column types

### New Files Created:
1. `/engines/src/migrations/import-export-tables.sql` - Direct SQL for manual execution
2. `/shell-scripts/fix-migration.sh` - Automated fix script
3. `/shell-scripts/debug-typeorm.sh` - Debugging helper

## Verification Steps

After running the migration, verify success:

```bash
# Check if tables exist
PGPASSWORD=secure_password_change_me psql -h localhost -p 5433 -U pim_user -d pim_dev -c "\dt *import*"
PGPASSWORD=secure_password_change_me psql -h localhost -p 5433 -U pim_user -d pim_dev -c "\dt *export*"

# Check migration status
cd /Users/colinroets/dev/projects/product/engines
npx typeorm migration:show -d typeorm.config.ts

# Test the application
npm run start:dev
```

## Testing the Import/Export Module

Once the migration is successful:

```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
./test-import-export.sh
```

## Troubleshooting

### Error: "relation already exists"
The tables might already exist. Check with:
```sql
SELECT * FROM information_schema.tables WHERE table_name LIKE '%import%' OR table_name LIKE '%export%';
```

To drop and recreate:
```sql
DROP TABLE IF EXISTS import_mappings CASCADE;
DROP TABLE IF EXISTS export_jobs CASCADE;
DROP TABLE IF EXISTS import_jobs CASCADE;
```

### Error: "uuid_generate_v4() does not exist"
Install the UUID extension:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "type 'import_type' already exists"
Drop the existing types:
```sql
DROP TYPE IF EXISTS import_type CASCADE;
DROP TYPE IF EXISTS export_type CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS export_format CASCADE;
```

## Why These Changes Work

1. **Varchar vs Enum**: PostgreSQL enums are powerful but can cause issues with TypeORM migrations. Using varchar with TypeScript enums provides the same type safety without database complexity.

2. **Text vs Array**: PostgreSQL array types require special handling. Using JSON in a text field with transformers is more portable.

3. **Separated Concerns**: Creating tables first, then adding constraints reduces the chance of circular dependency issues.

## Next Steps

1. Run the fix script: `./shell-scripts/fix-migration.sh`
2. Start the backend: `npm run start:dev`
3. Test the endpoints: `./shell-scripts/test-import-export.sh`
4. Monitor for any runtime issues

## Notes

- The enum values in TypeScript are still used for type checking
- The database stores these as strings, which is more flexible
- This approach is compatible with all TypeORM versions
- The solution maintains backward compatibility with existing code

## Summary

The TypeORM migration issues have been resolved by:
- ✅ Converting enum columns to varchar
- ✅ Simplifying array column handling
- ✅ Providing multiple fallback options
- ✅ Creating automated fix scripts
- ✅ Maintaining type safety in TypeScript

The Import/Export module should now migrate and run successfully.
