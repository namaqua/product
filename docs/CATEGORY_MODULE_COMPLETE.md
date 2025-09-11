# Category Module Documentation

## Overview
The Category Module provides hierarchical category management using the Nested Set Model for efficient tree operations.

**Status:** ✅ COMPLETE  
**Completed:** January 2025  
**Task:** TASK-017  

---

## 🏗️ Architecture

### Nested Set Model
The category system uses the Nested Set Model instead of traditional parent-child relationships:
- Each node has `left` and `right` values
- All descendants have values between parent's left/right
- Enables single-query tree operations (no recursion)
- Mathematical operations for tree management

### Key Benefits:
- **Get all ancestors:** Single query
- **Get all descendants:** Single query  
- **Move subtrees:** Mathematical updates
- **Count descendants:** `(right - left - 1) / 2`
- **Efficient breadcrumbs:** Direct path queries

---

## 📁 Module Structure

```
modules/categories/
├── entities/
│   └── category.entity.ts       # Nested set model entity
├── dto/
│   ├── create-category.dto.ts   # Creation validation
│   ├── update-category.dto.ts   # Update validation
│   ├── category-query.dto.ts    # Query parameters
│   ├── category-response.dto.ts # API response
│   ├── category-tree.dto.ts     # Tree structure
│   ├── move-category.dto.ts     # Move operation
│   └── index.ts                 # DTO exports
├── categories.controller.ts      # REST API endpoints
├── categories.service.ts         # Business logic
├── categories.module.ts          # Module definition
└── index.ts                      # Public API exports
```

---

## 🔌 API Endpoints

### Basic CRUD
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/categories` | Create new category | ADMIN, MANAGER |
| GET | `/categories` | List all categories | Any authenticated |
| GET | `/categories/:id` | Get single category | Any authenticated |
| PATCH | `/categories/:id` | Update category | ADMIN, MANAGER |
| DELETE | `/categories/:id` | Soft delete category | ADMIN |

### Tree Navigation
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/categories/tree` | Complete tree structure | Any authenticated |
| GET | `/categories/roots` | Root level categories | Any authenticated |
| GET | `/categories/:id/ancestors` | Path from root | Any authenticated |
| GET | `/categories/:id/descendants` | All descendants | Any authenticated |
| GET | `/categories/:id/children` | Direct children only | Any authenticated |
| GET | `/categories/:id/breadcrumb` | Breadcrumb navigation | Any authenticated |

### Special Endpoints
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/categories/slug/:slug` | Get by URL slug | Any authenticated |
| GET | `/categories/featured` | Featured categories | Any authenticated |
| GET | `/categories/menu` | Navigation menu items | Any authenticated |
| POST | `/categories/:id/move` | Move to new parent | ADMIN |
| POST | `/categories/:id/restore` | Restore deleted | ADMIN |

---

## 📊 Entity Schema

### Category Entity Fields

#### Core Fields
- `id` (UUID) - Primary key
- `name` (string) - Category name
- `slug` (string) - URL-friendly identifier (unique)
- `description` (text) - Category description

#### Nested Set Fields
- `left` (integer) - Nested set left value
- `right` (integer) - Nested set right value  
- `level` (integer) - Depth in tree (0 = root)
- `parentId` (UUID) - Parent category reference

#### Display Settings
- `sortOrder` (integer) - Display order
- `isVisible` (boolean) - Catalog visibility
- `showInMenu` (boolean) - Menu visibility
- `isFeatured` (boolean) - Featured status

#### SEO Fields
- `metaTitle` (string) - SEO title
- `metaDescription` (text) - SEO description
- `metaKeywords` (text) - SEO keywords

#### Media
- `imageUrl` (string) - Category image
- `bannerUrl` (string) - Category banner

#### Attributes
- `defaultAttributes` (JSONB) - Default product attributes
- `requiredAttributes` (array) - Required product attributes

#### Statistics
- `productCount` (integer) - Direct product count
- `totalProductCount` (integer) - Including subcategories

#### Audit Fields
- `isActive` (boolean) - Active status
- `isDeleted` (boolean) - Soft delete flag
- `createdAt` (timestamp) - Creation date
- `updatedAt` (timestamp) - Last update
- `createdBy` (UUID) - Creator user
- `updatedBy` (UUID) - Last updater
- `version` (integer) - Optimistic locking

---

## 🔗 Relationships

### Product-Category (Many-to-Many)
```typescript
// Category side
@ManyToMany(() => Product, product => product.categories)
products: Product[];

// Product side  
@ManyToMany(() => Category, category => category.products)
@JoinTable({
  name: 'product_categories',
  joinColumn: { name: 'productId' },
  inverseJoinColumn: { name: 'categoryId' }
})
categories: Category[];
```

### Parent-Child (Self-referencing)
```typescript
@ManyToOne(() => Category, category => category.children)
parent: Category;

@OneToMany(() => Category, category => category.parent)
children: Category[];
```

---

## 🎯 Key Operations

### Creating Categories
```typescript
// Root category
POST /categories
{
  "name": "Electronics",
  "description": "Electronic devices",
  "isVisible": true,
  "showInMenu": true
}

// Subcategory
POST /categories
{
  "name": "Laptops",
  "parentId": "uuid-of-electronics",
  "description": "Portable computers"
}
```

### Tree Operations
```typescript
// Get complete tree
GET /categories/tree

// Get breadcrumb
GET /categories/{id}/breadcrumb
// Returns: [
//   { id: "...", name: "Electronics", slug: "electronics" },
//   { id: "...", name: "Computers", slug: "computers" },
//   { id: "...", name: "Laptops", slug: "laptops" }
// ]

// Move category
POST /categories/{id}/move
{
  "newParentId": "uuid-of-new-parent",
  "position": "first" // or "last"
}
```

### Query Examples
```typescript
// Featured categories
GET /categories?isFeatured=true&limit=5

// Menu categories as tree
GET /categories/menu

// Search categories
GET /categories?search=electronics&level=0

// Get with ancestors
GET /categories/{id}?includeAncestors=true
```

---

## 🔧 Service Methods

### Core Methods
- `create()` - Create with auto nested set values
- `findAll()` - List with filtering/pagination
- `findOne()` - Get by ID
- `findBySlug()` - Get by URL slug
- `update()` - Update properties
- `remove()` - Soft delete with validation
- `move()` - Reorganize tree structure

### Tree Methods
- `getTree()` - Build complete tree
- `getAncestors()` - Path from root
- `getDescendants()` - All children
- `getChildren()` - Direct children
- `getBreadcrumb()` - Navigation path

### Helper Methods
- `buildTree()` - Convert flat to tree
- `performNestedSetMove()` - Complex tree moves
- `toResponseDto()` - Entity transformation

---

## 🧪 Testing

### Test Script
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x test-category-api.sh
./test-category-api.sh
```

### Test Coverage
- ✅ CRUD operations
- ✅ Tree structure creation
- ✅ Breadcrumb generation
- ✅ Parent-child relationships
- ✅ Featured/menu categories
- ✅ Search and filtering
- ✅ Move operations
- ✅ Nested set integrity

---

## 💡 Implementation Notes

### Nested Set Updates
When inserting/moving nodes:
1. Create space by updating left/right values
2. Insert/move the node
3. Update affected nodes
4. Recalculate levels if needed

### Performance Optimizations
- Denormalized product counts
- Indexed left/right values
- Cached tree structures
- Efficient bulk operations

### Validation Rules
- Can't delete categories with products
- Can't delete categories with children
- Can't move category to its descendant
- Unique slug enforcement

### Transaction Safety
- Create/move operations use transactions
- Nested set integrity maintained
- Rollback on failures

---

## 🐛 Common Issues & Solutions

### Issue: Nested Set Corruption
**Symptom:** Tree queries return incorrect results  
**Solution:** Run integrity check and rebuild tree
```sql
-- Check for gaps
SELECT * FROM categories 
WHERE "right" - "left" = 2 
  AND id NOT IN (SELECT "parentId" FROM categories WHERE "parentId" IS NOT NULL);
```

### Issue: Slug Conflicts
**Symptom:** 409 Conflict on create/update  
**Solution:** Auto-generate unique slugs or add parent slug prefix

### Issue: Move Operation Fails
**Symptom:** Cannot move category  
**Solution:** Check for circular references, ensure not moving to descendant

---

## 📈 Future Enhancements

1. **Path Materialization** - Store full path for faster queries
2. **Category Templates** - Predefined attribute sets
3. **Import/Export** - Bulk category management
4. **Category Rules** - Auto-assignment based on product attributes
5. **Multi-language** - i18n support for names/descriptions
6. **Category Permissions** - User-specific category access
7. **Analytics** - Category performance metrics

---

## 📚 References

- [Nested Set Model](https://en.wikipedia.org/wiki/Nested_set_model)
- [Managing Hierarchical Data in MySQL](https://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/)
- [TypeORM Tree Entities](https://typeorm.io/tree-entities)

---

*Last Updated: January 2025*
