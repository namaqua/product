# Project Learning Log

## Purpose
This document captures important lessons learned during development to prevent recurring issues and maintain consistency.

---

## January 2025: Variant Templates Implementation

### Lesson 1: TypeORM Column Type Restrictions
**Issue**: TypeORM error "Column createdBy does not support length property"

**Root Cause**: UUID columns cannot have a `length` property in TypeORM entities.

**WRONG**:
```typescript
@Column({ type: 'varchar', length: 36 })  // Trying to store UUID as varchar
createdBy: string;
```

**CORRECT**:
```typescript
@Column({ type: 'uuid', nullable: true })  // Proper UUID column
createdBy: string;
```

**Rule**: When referencing User IDs or any UUID foreign keys, always use `type: 'uuid'`, never varchar with length.

### Lesson 2: PostgreSQL Runs in Docker Container
**Issue**: "psql: command not found" errors when running scripts

**Root Cause**: PostgreSQL is running INSIDE Docker container `postgres-pim`, not installed locally on Mac.

**Key Facts**:
- Container name: `postgres-pim`
- Port: 5433 (mapped from container's 5432)
- Database: `pim_dev`
- User: `pim_user`

**ALWAYS use Docker to access database**:
```bash
# ✅ CORRECT - Use Docker
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SQL_COMMAND"

# ❌ WRONG - Requires local psql installation
psql -h localhost -p 5433 -U pim_user -d pim_dev
```

### Lesson 3: TypeORM Migration vs Direct SQL
**Issue**: TypeORM migrations failing but need to create tables

**Solution**: When migrations fail, use Docker to run SQL directly:
```bash
docker exec postgres-pim psql -U pim_user -d pim_dev < create-table.sql
```

**Best Practice**: Keep both approaches available:
1. TypeORM migrations for version control
2. Direct SQL scripts for quick fixes

### Lesson 4: JSON Columns in PostgreSQL
**Learning**: PostgreSQL's native JSON type works perfectly with TypeORM

```typescript
@Column({ type: 'json' })
values: string[];  // TypeORM handles serialization

@Column({ type: 'json', nullable: true })
metadata: Record<string, any>;
```

No need for JSON.stringify/parse - TypeORM handles it automatically.

---

## December 2024: Media Library Implementation

### Lesson 1: File Upload Security
**Rule**: Always validate file types and sizes on both frontend AND backend
- Frontend validation for UX
- Backend validation for security
- Never trust client-side validation alone

### Lesson 2: UUID Primary Keys
**Decision**: Use UUID for all primary keys
- Better for distributed systems
- No sequence conflicts
- More secure (can't guess next ID)

```typescript
@PrimaryGeneratedColumn('uuid')
id: string;
```

---

## November 2024: Authentication System

### Lesson 1: JWT Token Storage
**Best Practice**: Store JWT in httpOnly cookies when possible
- Prevents XSS attacks
- For SPA, use memory + refresh token pattern
- Never store sensitive tokens in localStorage

### Lesson 2: Password Hashing
**Rule**: Always use bcrypt with salt rounds >= 10
```typescript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

---

## Project-Wide Standards

### Database Conventions
1. **Table names**: Plural, snake_case (e.g., `variant_templates`, `product_variants`)
2. **Column names**: camelCase for TypeORM entities, snake_case in database
3. **Foreign keys**: Always UUID type when referencing User or other UUID PKs
4. **Timestamps**: Always include createdAt, updatedAt
5. **Soft deletes**: Use isActive flag instead of hard deletes for important data

### API Conventions
1. **Endpoints**: Plural nouns (e.g., `/variant-templates`, not `/variant-template`)
2. **HTTP Methods**: 
   - GET for reading
   - POST for creating
   - PUT for full updates
   - PATCH for partial updates
   - DELETE for removal
3. **Response format**: Consistent structure with `success`, `data`, `message`
4. **Error handling**: Always return meaningful error messages

### TypeORM Best Practices
1. **Relations**: Use lazy loading sparingly, prefer explicit joins
2. **Migrations**: Generate, don't write manually when possible
3. **Entities**: One entity per file, organize in `entities` folder
4. **DTOs**: Separate DTOs for create, update, and response

### Docker Best Practices
1. **Container access**: Always use `docker exec` for database commands
2. **Logs**: Use `docker logs container-name` for debugging
3. **Persistence**: Use volumes for database data
4. **Networking**: Use docker-compose for multi-container apps

### Shell Scripts
1. **Location**: ALWAYS in `/Users/colinroets/dev/projects/product/shell-scripts/`
2. **Permissions**: Always `chmod +x script.sh` after creation
3. **Docker commands**: Prefer Docker exec over local tool installation
4. **Error handling**: Always check command success with `$?`

---

## Common Pitfalls to Avoid

1. ❌ **Don't** assume PostgreSQL tools are installed locally
2. ❌ **Don't** use varchar for UUID columns in TypeORM
3. ❌ **Don't** store sensitive data in localStorage
4. ❌ **Don't** trust client-side validation alone
5. ❌ **Don't** hardcode environment-specific values
6. ❌ **Don't** skip error handling in async operations
7. ❌ **Don't** use synchronize:true in production
8. ❌ **Don't** forget to add new modules to app.module.ts

---

## Quick Reference Commands

### Database Access (via Docker)
```bash
# Interactive PostgreSQL
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Single command
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SQL_HERE"

# Run SQL file
docker exec -i postgres-pim psql -U pim_user -d pim_dev < file.sql
```

### TypeORM Commands
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker logs postgres-pim --tail=50

# Stop services
docker-compose down

# Restart a service
docker-compose restart postgres-pim
```

---

*Last Updated: January 2025*
*Purpose: Prevent repeated mistakes and maintain consistency*
