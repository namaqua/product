# Variant Templates - Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: TypeORM Connection Error
**Error**: `Column createdBy of Entity VariantTemplate does not support length property`

**Cause**: UUID columns incorrectly defined with varchar type and length.

**Solution**:
```typescript
// ❌ WRONG
@Column({ type: 'varchar', length: 36 })
createdBy: string;

// ✅ CORRECT
@Column({ type: 'uuid', nullable: true })
createdBy: string;
```

**Fix Steps**:
1. Update entity file to use `uuid` type
2. Drop existing table if created with wrong type
3. Recreate table with correct schema

### Issue 2: psql Command Not Found
**Error**: `psql: command not found`

**Cause**: PostgreSQL client not installed locally (database runs in Docker).

**Solution**: Use Docker to run PostgreSQL commands:
```bash
# Instead of: psql -h localhost -p 5433 -U pim_user -d pim_dev
# Use: 
docker exec -it postgres-pim psql -U pim_user -d pim_dev
```

### Issue 3: Migration Fails to Run
**Error**: TypeORM migration fails with various errors

**Solution**: Create table directly using Docker:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
./create-variant-table-docker.sh
```

### Issue 4: Table Already Exists
**Error**: Table creation fails because it already exists

**Solution**: Drop and recreate:
```bash
# Drop table
docker exec postgres-pim psql -U pim_user -d pim_dev -c "DROP TABLE IF EXISTS variant_templates CASCADE;"

# Recreate
./create-variant-table-docker.sh
```

### Issue 5: Foreign Key Constraint Error
**Error**: Cannot create foreign key to users table

**Possible Causes**:
1. Users table doesn't exist yet
2. Data type mismatch (both must be UUID)

**Solution**: Ensure users table exists and both columns are UUID type.

### Issue 6: Backend Won't Start
**Error**: NestJS fails to start after adding VariantTemplate module

**Checklist**:
1. ✅ Entity uses correct column types (uuid, not varchar for IDs)
2. ✅ Module is imported in app.module.ts
3. ✅ Database table exists
4. ✅ No TypeScript compilation errors

**Debug Steps**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check if table exists
docker exec postgres-pim psql -U pim_user -d pim_dev -c "\dt variant_templates"

# Check table structure
docker exec postgres-pim psql -U pim_user -d pim_dev -c "\d variant_templates"
```

## Complete Reset Procedure

If all else fails, here's how to completely reset variant templates:

```bash
# 1. Stop backend
# Ctrl+C in the terminal running npm run start:dev

# 2. Drop the table
docker exec postgres-pim psql -U pim_user -d pim_dev -c "DROP TABLE IF EXISTS variant_templates CASCADE;"

# 3. Remove from migrations table
docker exec postgres-pim psql -U pim_user -d pim_dev -c "DELETE FROM migrations WHERE name LIKE '%VariantTemplate%';"

# 4. Recreate table with correct schema
cd /Users/colinroets/dev/projects/product/shell-scripts
./create-variant-table-docker.sh

# 5. Restart backend
cd /Users/colinroets/dev/projects/product/engines
npm run start:dev

# 6. Verify API works
curl http://localhost:3010/api/v1/variant-templates
```

## Validation Checklist

After implementation, verify everything works:

```bash
# 1. Table exists
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT COUNT(*) FROM variant_templates;"

# 2. API responds
curl http://localhost:3010/api/v1/variant-templates

# 3. Can create template (need auth token)
TOKEN="your-jwt-token"
curl -X POST http://localhost:3010/api/v1/variant-templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","axisName":"Test","values":["A","B"]}'

# 4. Seed defaults work
curl -X POST http://localhost:3010/api/v1/variant-templates/seed-defaults \
  -H "Authorization: Bearer $TOKEN"
```

## Key Learnings

1. **Always use UUID type for User ID references** - not varchar
2. **PostgreSQL runs in Docker** - use `docker exec` for commands
3. **TypeORM is strict about types** - column types must match exactly
4. **Migrations can fail** - have backup SQL scripts ready
5. **Check logs carefully** - TypeORM errors tell you exactly what's wrong

---
*Created: January 2025*
*Purpose: Quick reference for variant templates issues*
