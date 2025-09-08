# Product Module Documentation

## Overview

The Product Module is the core of the PIM system, providing comprehensive product management capabilities including:

- **Product Types**: Simple, Configurable, Bundle, and Virtual products
- **SKU Management**: Unique product identifiers with validation
- **Inventory Tracking**: Real-time stock management with min/max quantities
- **Multi-language Support**: Product localization for global markets
- **Flexible Attributes**: Dynamic product attributes system
- **Media Management**: Product images, videos, and documents
- **Product Relationships**: Cross-sell, up-sell, and related products
- **Product Variants**: Configurable products with variations
- **Bundle Products**: Product bundles with components
- **Bulk Operations**: Mass updates for efficiency
- **Soft Delete**: Safe product deletion with recovery

## Architecture

### Entities

1. **Product** - Main product entity
2. **ProductLocale** - Multi-language content
3. **ProductVariant** - Product variations for configurable products
4. **ProductBundle** - Bundle composition
5. **ProductRelationship** - Product associations
6. **ProductAttribute** - Flexible attribute values
7. **ProductMedia** - Media attachments
8. **ProductCategory** - Category associations

### Product Types

#### Simple Product
- Standard product with fixed attributes
- Single SKU
- Direct inventory tracking

#### Configurable Product
- Parent product with multiple variants
- Each variant is a simple product
- Attributes like size, color define variants

#### Bundle Product
- Collection of other products
- Can include required and optional components
- Pricing can be dynamic or fixed

#### Virtual Product
- Non-physical products (services, downloads)
- No shipping required
- No weight/dimensions

## API Endpoints

### Product CRUD Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/products` | Create a new product | Admin/Manager |
| GET | `/api/v1/products` | List products with filters | Yes |
| GET | `/api/v1/products/:id` | Get product by ID | Yes |
| GET | `/api/v1/products/sku/:sku` | Get product by SKU | Yes |
| PATCH | `/api/v1/products/:id` | Update product | Admin/Manager |
| DELETE | `/api/v1/products/:id` | Soft delete product | Admin |

### Special Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/products/:id/restore` | Restore deleted product | Admin |
| POST | `/api/v1/products/:id/duplicate` | Duplicate product | Admin/Manager |
| PATCH | `/api/v1/products/:id/inventory` | Update inventory | Admin/Manager |
| GET | `/api/v1/products/statistics` | Get product statistics | Yes |

### Bulk Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/products/bulk/status` | Bulk update status | Admin/Manager |
| POST | `/api/v1/products/bulk/visibility` | Bulk update visibility | Admin/Manager |

## Usage Examples

### Creating a Simple Product

```bash
curl -X POST http://localhost:3010/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sku": "PROD-001",
    "type": "simple",
    "status": "draft",
    "quantity": 100,
    "price": 29.99,
    "weight": 1.5,
    "weightUnit": "kg",
    "locales": [
      {
        "localeCode": "en",
        "name": "Sample Product",
        "description": "This is a sample product",
        "shortDescription": "Sample product"
      }
    ],
    "attributes": [
      {
        "attributeCode": "color",
        "valueText": "Blue"
      }
    ],
    "media": [
      {
        "url": "https://example.com/image.jpg",
        "mediaType": "image",
        "isPrimary": true
      }
    ]
  }'
```

### Creating a Configurable Product

```bash
# 1. Create the parent configurable product
curl -X POST http://localhost:3010/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sku": "SHIRT-PARENT",
    "type": "configurable",
    "name": "Classic T-Shirt",
    "price": 49.99
  }'

# 2. Create variant products
curl -X POST http://localhost:3010/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sku": "SHIRT-RED-M",
    "type": "simple",
    "parentId": "PARENT_PRODUCT_ID",
    "quantity": 50,
    "attributes": [
      {"attributeCode": "color", "valueText": "Red"},
      {"attributeCode": "size", "valueText": "M"}
    ]
  }'
```

### Creating a Bundle Product

```bash
curl -X POST http://localhost:3010/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sku": "BUNDLE-001",
    "type": "bundle",
    "name": "Complete Kit",
    "bundleItems": [
      {
        "componentProductId": "PRODUCT_ID_1",
        "quantity": 1,
        "isRequired": true
      },
      {
        "componentProductId": "PRODUCT_ID_2",
        "quantity": 2,
        "isRequired": false
      }
    ]
  }'
```

### Filtering Products

```bash
# Get all published products with media
GET /api/v1/products?status=published&includeMedia=true

# Search products
GET /api/v1/products?search=shirt&page=1&limit=20

# Filter by price range
GET /api/v1/products?minPrice=10&maxPrice=100

# Get products in specific categories
GET /api/v1/products?categoryIds[]=cat1&categoryIds[]=cat2

# Complex filtering
GET /api/v1/products?type=simple&inStock=true&isFeatured=true&sortBy=price&sortOrder=ASC
```

### Inventory Management

```bash
# Set inventory to specific value
PATCH /api/v1/products/:id/inventory
{
  "quantity": 100,
  "operation": "set"
}

# Increment inventory
{
  "quantity": 10,
  "operation": "increment"
}

# Decrement inventory (e.g., after sale)
{
  "quantity": 1,
  "operation": "decrement"
}
```

## Database Schema

### Products Table
- `id` (UUID) - Primary key
- `sku` (VARCHAR) - Unique product identifier
- `type` (ENUM) - Product type
- `status` (ENUM) - Product status
- `quantity` (INTEGER) - Stock quantity
- `price` (DECIMAL) - Product price
- `weight` (DECIMAL) - Product weight
- ... and more

### Relationships
- One-to-Many: Product → ProductLocale
- One-to-Many: Product → ProductAttribute
- One-to-Many: Product → ProductMedia
- Many-to-Many: Product ↔ Category
- Self-referencing: Product → Product (parent-child)

## Features Implemented

### ✅ Core Features
- [x] Full CRUD operations
- [x] SKU management with uniqueness validation
- [x] Inventory tracking with min/max quantities
- [x] Multi-language support (locales)
- [x] Flexible attribute system
- [x] Media management
- [x] Product relationships
- [x] Soft delete with recovery
- [x] Bulk operations
- [x] Product duplication
- [x] Advanced filtering and search
- [x] Pagination support
- [x] Product statistics

### ✅ Product Types
- [x] Simple products
- [x] Configurable products with variants
- [x] Bundle products
- [x] Virtual products

### ✅ Business Logic
- [x] Automatic inventory status updates
- [x] Version tracking
- [x] Audit fields (created/updated by)
- [x] Primary image selection
- [x] Default locale handling

## Testing

Run the test script to verify the module is working:

```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x test-products.sh
./test-products.sh
```

This will test:
1. Product creation
2. Product retrieval (list, by ID, by SKU)
3. Product updates
4. Inventory management
5. Bulk operations
6. Product duplication
7. Soft delete and restore
8. Statistics

## Configuration

### Environment Variables
Ensure these are set in your `.env` file:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pim_dev
DATABASE_USER=pim_user
DATABASE_PASSWORD=secure_password_change_me
JWT_SECRET=your-secret-key-change-me
```

### Running Migrations

```bash
# Generate migration from entities
npm run typeorm migration:generate -- -n CreateProductTables

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

## Next Steps

### Immediate Enhancements
1. **Category Module** - Create category management
2. **Attribute Module** - Build attribute dictionary
3. **Media Upload** - Implement file upload service
4. **Import/Export** - CSV/JSON import functionality

### Future Features
1. **Product Workflows** - Approval processes
2. **Price Rules** - Dynamic pricing
3. **Product Reviews** - Customer feedback
4. **Product Comparison** - Side-by-side comparison
5. **Search Engine** - Elasticsearch integration
6. **AI Features** - Auto-description generation

## Troubleshooting

### Common Issues

1. **"Product with SKU already exists"**
   - SKUs must be unique across all products
   - Check for existing products with the same SKU

2. **"Insufficient inventory"**
   - When decrementing, ensure sufficient stock exists
   - Check current quantity before operations

3. **Foreign key constraint errors**
   - Ensure referenced products exist
   - Check parent product exists for variants

4. **Migration errors**
   - Ensure database user has CREATE/ALTER permissions
   - Check if tables already exist

## Performance Considerations

1. **Indexes**: All foreign keys and search fields are indexed
2. **Eager Loading**: Use include flags to reduce queries
3. **Pagination**: Always paginate large result sets
4. **Soft Deletes**: Deleted products are excluded by default
5. **JSONB Fields**: Used for flexible metadata storage

## Security

1. **Role-based Access**: Admin and Manager roles required for modifications
2. **Input Validation**: All DTOs use class-validator
3. **SQL Injection Protection**: TypeORM parameterized queries
4. **Audit Trail**: All changes tracked with user ID

## Support

For issues or questions:
1. Check the `/Users/colinroets/dev/projects/product/pimdocs/` directory
2. Review test output from `test-products.sh`
3. Check application logs for detailed errors

---

**Module Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready
