# TypeORM Standardization Plan - PIM Project

## 📋 Overview
This document establishes the TypeORM standards and conventions for the PIM (Product Information Management) system. All database-related code must follow these standards to ensure consistency, maintainability, and reliability.

**Version:** 1.0.0  
**Created:** December 2024  
**Last Updated:** December 2024  
**Status:** ACTIVE

---

## 🗄️ Database Configuration

### Primary Database Connection
```typescript
// PRODUCTION VALUES - DO NOT CHANGE
Database Type: PostgreSQL
Database Name: pim_dev (Development), pim_prod (Production)
Database Port: 5432 (Network), 5433 (Docker Host)
Database User: pim_user
Database Host: localhost (Dev), postgres-pim (Docker)
```

### Environment Variables
```env
# Standard environment variables - REQUIRED
DATABASE_HOST=localhost      # postgres-pim in Docker
DATABASE_PORT=5433           # 5432 inside Docker network
DATABASE_NAME=pim_dev        # pim_prod for production
DATABASE_USER=pim_user
DATABASE_PASSWORD=secure_password_change_me
```

### TypeORM Configuration
```typescript
// Location: /engines/typeorm.config.ts
export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'pim_user',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'pim_dev',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,  // NEVER true in production
  logging: true,       // Set to false in production
});
```

---

## 📊 Table Naming Conventions

### Standard Table Names
All table names are **lowercase, plural, snake_case**:

| Entity | Table Name | Purpose |
|--------|------------|---------|
| User | `users` | User authentication and authorization |
| Product | `products` | Core product information |
| Category | `categories` | Product categorization (nested set model) |
| Attribute | `attributes` | Dynamic product attributes (EAV pattern) |
| AttributeGroup | `attribute_groups` | Grouping of related attributes |
| AttributeOption | `attribute_options` | Options for select/multiselect attributes |
| AttributeValue | `attribute_values` | EAV pattern - actual attribute values |
| Media | `media` | Media files and assets |
| MediaProductRelation | `media_product_relations` | Many-to-many junction table |
| Account | `accounts` | Business accounts/customers |
| Address | `addresses` | Physical addresses |
| VariantTemplate | `variant_templates` | Product variant configuration templates |

### Junction Tables
Many-to-many relationships use **singular_plural** naming:
- `product_categories` - Products ↔ Categories
- `product_media` - Products ↔ Media (deprecated, use media_product_relations)
- `media_product_relations` - Media ↔ Products (current standard)

---

## 🏗️ Entity Structure Standards

### Base Entity Classes

#### 1. BaseEntity (Standard for all entities)
```typescript
// Location: src/common/entities/base.entity.ts
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null;

  @VersionColumn()
  version: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
```

#### 2. SoftDeleteEntity (For entities that should never be physically deleted)
```typescript
export abstract class SoftDeleteEntity extends BaseEntity {
  @Column({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  deletedBy: string | null;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;
}
```

### Entity File Structure
```typescript
// Standard entity file structure
@Entity('table_name')  // Always specify table name explicitly
@Index(['column1', 'column2'])  // Composite indexes
@Index(['uniqueColumn'], { unique: true })  // Unique indexes
export class EntityName extends BaseEntity {
  // 1. Basic columns
  // 2. Foreign key columns
  // 3. Relations
  // 4. JSON/JSONB columns
  // 5. Computed columns
  // 6. Entity methods
}
```

---

## 🔑 Column Standards

### Data Types Mapping
| TypeScript Type | PostgreSQL Type | Usage |
|----------------|-----------------|-------|
| `string` | `varchar(n)` | Short text (max 500 chars) |
| `string` | `text` | Long text (descriptions, etc.) |
| `number` | `integer` | Whole numbers |
| `number` | `decimal(p,s)` | Monetary values, measurements |
| `boolean` | `boolean` | True/false flags |
| `Date` | `timestamp with time zone` | All timestamps |
| `Record<string, any>` | `jsonb` | Flexible data structures |
| `string[]` | `simple-array` | Simple string arrays |
| `enum` | `enum` | Predefined options |

### Column Decorators
```typescript
// Required column with comment
@Column({
  type: 'varchar',
  length: 255,
  comment: 'Brief description of column purpose',
})
name: string;

// Optional column
@Column({
  type: 'text',
  nullable: true,
  comment: 'Detailed description',
})
description: string | null;  // Always use union with null

// Decimal column for money
@Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
  nullable: true,
  comment: 'Price in default currency',
})
price: number | null;

// JSONB column
@Column({
  type: 'jsonb',
  nullable: true,
  comment: 'Flexible attributes storage',
})
attributes: Record<string, any> | null;
```

### Index Standards
```typescript
// Single column index
@Index(['sku'])

// Unique index
@Index(['email'], { unique: true })

// Composite index
@Index(['type', 'status'])

// Partial index (PostgreSQL specific)
@Index(['deletedAt'], { where: 'deleted_at IS NULL' })
```

---

## 🔗 Relationship Standards

### One-to-Many / Many-to-One
```typescript
// Parent entity (One side)
@OneToMany(() => ChildEntity, (child) => child.parent)
children: ChildEntity[];

// Child entity (Many side)
@Column({ type: 'uuid', nullable: true })
parentId: string | null;

@ManyToOne(() => ParentEntity, (parent) => parent.children, {
  nullable: true,
  onDelete: 'CASCADE',  // or 'SET NULL', 'RESTRICT'
})
@JoinColumn({ name: 'parentId' })
parent: ParentEntity | null;
```

### Many-to-Many
```typescript
// First entity
@ManyToMany(() => SecondEntity, (second) => second.firsts)
@JoinTable({
  name: 'junction_table_name',
  joinColumn: { name: 'firstId', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'secondId', referencedColumnName: 'id' },
})
seconds: SecondEntity[];

// Second entity
@ManyToMany(() => FirstEntity, (first) => first.seconds)
firsts: FirstEntity[];
```

---

## 📝 Migration Standards

### Naming Convention
```
[timestamp]-[PascalCase-Description].ts
Example: 1705000000000-CreateProductTables.ts
```

### Migration Structure
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTables1705000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tables
    // Add indexes
    // Add foreign keys
    // Insert seed data (if needed)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse operations in opposite order
    // Drop foreign keys first
    // Drop indexes
    // Drop tables
  }
}
```

### Migration Commands
```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Create empty migration
npm run typeorm migration:create -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

---

## 🎯 Query Standards

### Repository Pattern
```typescript
// Service implementation
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Use query builder for complex queries
  async findWithFilters(filters: ProductFilterDto) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'category')
      .where('product.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      query.andWhere('product.status = :status', { status: filters.status });
    }

    return query.getMany();
  }
}
```

### Pagination Standard
```typescript
interface PaginationParams {
  page: number;      // 1-based page number
  limit: number;     // Items per page (max 100)
  sortBy?: string;   // Column to sort by
  sortOrder?: 'ASC' | 'DESC';
}

// Standard pagination implementation
async findPaginated(params: PaginationParams) {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = params;
  
  const [items, totalItems] = await this.repository.findAndCount({
    skip: (page - 1) * limit,
    take: limit,
    order: { [sortBy]: sortOrder },
  });

  return {
    items,
    meta: {
      totalItems,
      itemCount: items.length,
      page,
      totalPages: Math.ceil(totalItems / limit),
      itemsPerPage: limit,
      hasNext: page < Math.ceil(totalItems / limit),
      hasPrevious: page > 1,
    },
  };
}
```

---

## 🚨 Critical Rules - DO NOT VIOLATE

1. **NEVER use `synchronize: true` in production** - Use migrations only
2. **NEVER hardcode database credentials** - Always use environment variables
3. **NEVER change existing migration files** - Create new migrations for changes
4. **ALWAYS use UUID for primary keys** - No auto-increment integers
5. **ALWAYS use `timestamp with time zone`** - Never use plain timestamp
6. **ALWAYS specify table names explicitly** - Don't rely on automatic naming
7. **ALWAYS add comments to columns** - Document purpose and constraints
8. **ALWAYS handle null values explicitly** - Use TypeScript union types
9. **ALWAYS use transactions for multi-table operations** - Ensure data consistency
10. **ALWAYS use soft delete for critical entities** - Never physically delete

---

## 🔧 Common Patterns

### EAV Pattern (Entity-Attribute-Value)
Used for dynamic attributes system:
```typescript
// Attribute definition
@Entity('attributes')
export class Attribute {
  @Column({ type: 'varchar', unique: true })
  code: string;
  
  @Column({ type: 'enum', enum: AttributeType })
  type: AttributeType;
}

// Attribute value storage
@Entity('attribute_values')
export class AttributeValue {
  @ManyToOne(() => Product)
  product: Product;
  
  @ManyToOne(() => Attribute)
  attribute: Attribute;
  
  @Column({ type: 'text' })
  value: string;
}
```

### Nested Set Model (Categories)
For hierarchical tree structures:
```typescript
@Entity('categories')
export class Category {
  @Column({ type: 'integer' })
  left: number;
  
  @Column({ type: 'integer' })
  right: number;
  
  @Column({ type: 'integer' })
  level: number;
}
```

### Audit Trail
All entities extend BaseEntity which includes:
- `createdAt`, `updatedAt` - Automatic timestamps
- `createdBy`, `updatedBy` - User tracking
- `version` - Optimistic locking
- `isActive` - Enable/disable records

---

## 📋 Checklist for New Entities

- [ ] Extends appropriate base class (BaseEntity or SoftDeleteEntity)
- [ ] Table name specified explicitly in @Entity decorator
- [ ] All columns have descriptive comments
- [ ] Appropriate indexes defined
- [ ] Nullable columns use TypeScript union types with null
- [ ] Foreign key columns named as `entityId` pattern
- [ ] Relations properly configured with cascade options
- [ ] Entity methods for business logic included
- [ ] Migration created for table creation
- [ ] Entity exported in module's index.ts
- [ ] Repository injected in corresponding service
- [ ] DTOs created for create/update operations

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "relation does not exist" | Run migrations: `npm run typeorm migration:run` |
| "duplicate key value" | Check unique constraints and existing data |
| "column does not exist" | Generate and run new migration |
| Connection timeout | Check DATABASE_HOST and DATABASE_PORT settings |
| Migration failed | Check migration order and dependencies |

### Debug Commands
```bash
# Check current migration status
npm run typeorm migration:show

# View SQL without executing
npm run typeorm schema:log

# Drop all tables (DANGER - Dev only)
npm run typeorm schema:drop
```

---

## 📚 References

- **TypeORM Documentation:** https://typeorm.io
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Project Structure:** `/engines/src/modules/*/entities/*.entity.ts`
- **Migrations:** `/engines/src/migrations/`
- **Base Entities:** `/engines/src/common/entities/`

---

## 🔄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | Dec 2024 | Initial standardization document | System |

---

**Note:** This document is the authoritative source for TypeORM standards in the PIM project. Any deviations must be documented and approved. When in doubt, refer to existing entity implementations as examples.