# TypeORM Migrations - Learnings & Troubleshooting Guide

## 📚 Document Overview
This document captures key learnings from debugging TypeORM migration issues in the PIM project. It serves as a reference for future migration development and troubleshooting.

**Created:** January 2025  
**Last Updated:** January 2025  
**Status:** ACTIVE

---

## 🔴 Critical Issues Encountered & Solutions

### 1. Index vs TableIndex in Migrations

#### ❌ Problem
```typescript
// INCORRECT - Index is a decorator, not a class
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

await queryRunner.createIndex('table_name', new Index({
  name: 'IDX_name',
  columnNames: ['column'],
}));
```

**Error:** `Only a void function can be called with the 'new' keyword`

#### ✅ Solution
```typescript
// CORRECT - Use TableIndex class for migrations
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

await queryRunner.createIndex('table_name', new TableIndex({
  name: 'IDX_name',
  columnNames: ['column'],
}));
```

**Key Learning:** 
- `@Index()` is a **decorator** for entities
- `TableIndex` is a **class** for migrations
- Never use `new Index()` in migration files

---

### 2. Multiple Primary Keys Error

#### ❌ Problem
```typescript
// Table created with columns but no primary key specified
await queryRunner.createTable(new Table({
  name: 'junction_table',
  columns: [
    { name: 'id1', type: 'uuid' },
    { name: 'id2', type: 'uuid' },
  ],
}));

// Later trying to add primary key - fails if table already has one
await queryRunner.createPrimaryKey('junction_table', ['id1', 'id2']);
```

**Error:** `multiple primary keys for table "junction_table" are not allowed`

#### ✅ Solution 1: Define Primary Keys in Columns
```typescript
// BEST PRACTICE - Define primary keys directly in column definitions
await queryRunner.createTable(new Table({
  name: 'junction_table',
  columns: [
    { 
      name: 'id1', 
      type: 'uuid',
      isPrimary: true,  // Define as primary here
    },
    { 
      name: 'id2', 
      type: 'uuid',
      isPrimary: true,  // Composite primary key
    },
  ],
}));
// No separate createPrimaryKey needed!
```

#### ✅ Solution 2: Check Before Creating
```typescript
// If you must use createPrimaryKey, check first
const table = await queryRunner.getTable('junction_table');
const hasPrimaryKey = table?.primaryColumns && table.primaryColumns.length > 0;

if (!hasPrimaryKey) {
  await queryRunner.createPrimaryKey('junction_table', ['id1', 'id2']);
}
```

---

### 3. Table Already Exists Issues

#### ❌ Problem
Running migrations multiple times or after partial failures can cause "table already exists" errors.

#### ✅ Solution
```typescript
// Always check if table exists before creating
const tableExists = await queryRunner.hasTable('table_name');

if (!tableExists) {
  await queryRunner.createTable(new Table({
    name: 'table_name',
    columns: [...],
  }));
}
```

---

## 🎯 Best Practices for TypeORM Migrations

### 1. Import the Right Classes
```typescript
// Standard imports for migrations
import { 
  MigrationInterface, 
  QueryRunner, 
  Table, 
  TableIndex,           // For indexes
  TableForeignKey,      // For foreign keys
  TableColumn,          // For adding columns
  TableUnique,          // For unique constraints
} from 'typeorm';
```

### 2. Migration File Naming
```
[timestamp]-[PascalCaseDescription].ts

Examples:
1737400000000-CreateSubscriptionTables.ts
1737000000000-CreateAccountsTable.ts
```

### 3. Migration Class Structure
```typescript
export class MigrationName[Timestamp] implements MigrationInterface {
  name = 'MigrationName[Timestamp]';  // Include name property

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration logic
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic - reverse of up()
  }
}
```

### 4. Creating Tables with All Constraints
```typescript
// Complete table creation pattern
await queryRunner.createTable(
  new Table({
    name: 'products',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,  // Primary key in column definition
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'sku',
        type: 'varchar',
        length: '100',
        isUnique: true,  // Unique constraint in column
        comment: 'Stock Keeping Unit',
      },
      {
        name: 'price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Product price',
      },
      {
        name: 'status',
        type: 'enum',
        enum: ['draft', 'published', 'archived'],
        default: `'draft'`,  // Note the quotes for enum defaults
      },
    ],
  }),
  true,  // ifNotExists parameter
);
```

### 5. Creating Indexes
```typescript
// Single column index
await queryRunner.createIndex('table_name', new TableIndex({
  name: 'IDX_table_column',
  columnNames: ['column_name'],
}));

// Composite index
await queryRunner.createIndex('table_name', new TableIndex({
  name: 'IDX_table_col1_col2',
  columnNames: ['col1', 'col2'],
}));

// Unique index
await queryRunner.createIndex('table_name', new TableIndex({
  name: 'UQ_table_column',
  columnNames: ['column_name'],
  isUnique: true,
}));

// GIN index for JSONB (PostgreSQL)
await queryRunner.query(`
  CREATE INDEX "IDX_table_jsonb_column" 
  ON "table_name" 
  USING GIN ("jsonb_column")
`);
```

### 6. Creating Foreign Keys
```typescript
await queryRunner.createForeignKey(
  'child_table',
  new TableForeignKey({
    columnNames: ['parent_id'],
    referencedColumnNames: ['id'],
    referencedTableName: 'parent_table',
    onDelete: 'CASCADE',  // CASCADE, SET NULL, RESTRICT, NO ACTION
    onUpdate: 'CASCADE',
  }),
);
```

### 7. Creating ENUMs (PostgreSQL)
```typescript
// Create ENUM type
await queryRunner.query(`
  CREATE TYPE "status_enum" AS ENUM (
    'pending', 'active', 'inactive'
  )
`);

// Use in column
{
  name: 'status',
  type: 'status_enum',
  default: `'pending'`,
}

// Drop ENUM in down()
await queryRunner.query(`DROP TYPE "status_enum"`);
```

---

## 🛠️ Troubleshooting Patterns

### Pattern 1: Safe Table Creation
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Check existence
  const exists = await queryRunner.hasTable('my_table');
  
  if (!exists) {
    await queryRunner.createTable(new Table({
      name: 'my_table',
      columns: [...],
    }));
    
    // Create indexes after table
    await queryRunner.createIndex(...);
    
    // Create foreign keys last
    await queryRunner.createForeignKey(...);
  }
}
```

### Pattern 2: Safe Rollback
```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  // Drop in reverse order: FK -> Indexes -> Table
  const table = await queryRunner.getTable('my_table');
  
  // Drop foreign keys
  const foreignKeys = table?.foreignKeys || [];
  for (const fk of foreignKeys) {
    await queryRunner.dropForeignKey('my_table', fk);
  }
  
  // Drop indexes
  const indexes = table?.indices || [];
  for (const index of indexes) {
    await queryRunner.dropIndex('my_table', index);
  }
  
  // Drop table
  await queryRunner.dropTable('my_table', true, true, true);
}
```

### Pattern 3: Handling Partial Migration Failures
```typescript
// Use transactions when possible
await queryRunner.startTransaction();
try {
  // Migration logic here
  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
}
```

---

## 🚨 Common Pitfalls to Avoid

1. **Don't use `new Index()`** - Use `new TableIndex()` in migrations
2. **Don't create tables without checking existence** - Use `hasTable()` first
3. **Don't add primary keys separately** - Define them in column definitions
4. **Don't forget quotes in enum defaults** - Use `default: "'value'"` not `default: "value"`
5. **Don't skip the down() method** - Always implement rollback logic
6. **Don't modify existing migrations** - Create new ones for changes
7. **Don't use synchronize:true in production** - Use migrations only

---

## 📝 Quick Debug Checklist

When a migration fails:

- [ ] Check if using `Index` instead of `TableIndex`
- [ ] Check if table/column already exists
- [ ] Check if primary key is already defined
- [ ] Check enum default values have proper quotes
- [ ] Check foreign key references exist
- [ ] Check column types match TypeORM standards
- [ ] Run `npm run typeorm migration:show` to see status
- [ ] Check `migrations` table in database for applied migrations

---

## 🔧 Useful Commands

```bash
# Generate migration from entities
npm run typeorm migration:generate -- -n MigrationName

# Create empty migration
npm run typeorm migration:create -- -n MigrationName

# Run pending migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert

# Show migrations status
npm run typeorm migration:show

# Drop all tables (DANGER - Dev only!)
npm run typeorm schema:drop
```

---

## 📚 References

- [TypeORM Migration Documentation](https://typeorm.io/migrations)
- [TypeORM Query Runner API](https://typeorm.io/query-runner-api)
- Project Standards: `/docs/TYPEORM_STANDARDIZATION_PLAN.md`
- Base Entities: `/engines/src/common/entities/`
- Migration Files: `/engines/src/migrations/`

---

## 🔄 Version History

| Version | Date | Changes | Context |
|---------|------|---------|---------|
| 1.0.0 | Jan 2025 | Initial creation | Debugging subscription engine migrations |

---

**Note:** This document captures real issues encountered during development. Always test migrations in a development environment before applying to production.