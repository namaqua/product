# Product Variants Implementation Guide

## Executive Summary
This guide implements a streamlined variant management system following Akeneo's proven patterns while avoiding over-engineering. The solution leverages existing database structures and follows PIM API standards.

## Architecture Overview

### Core Concepts
1. **Single-level variants** - Simple parent-child relationship (no complex multi-level hierarchy)
2. **Attribute inheritance** - Variants inherit non-specific attributes from parent
3. **Variant axes** - Differentiating attributes (color, size, etc.)
4. **Variant attributes** - Fields that can vary (SKU, price, quantity)

### Database Schema
```sql
-- New columns added to products table
variantAxes: JSONB          -- {color: "blue", size: "L"}
variantAttributes: JSONB     -- ["sku", "price", "quantity"]
inheritedAttributes: boolean -- true = inherit from parent
variantGroupId: string      -- Groups variants together
```

## Implementation Files

### Backend (NestJS)
1. **DTOs** (`engines/src/modules/products/dto/`)
   - `create-variant-group.dto.ts` - Group creation request
   - `update-variant.dto.ts` - Single variant updates
   - `bulk-variant-update.dto.ts` - Bulk operations
   - `variant-group-response.dto.ts` - Response format
   - `variant-query.dto.ts` - Search/filter parameters

2. **Service Methods** (`engines/src/modules/products/products.service.ts`)
   - `createVariantGroup()` - Groups products as variants
   - `getVariantGroup()` - Retrieves complete group
   - `updateVariant()` - Updates single variant
   - `bulkUpdateVariants()` - Bulk operations
   - `generateVariants()` - Auto-generate from combinations

3. **Controller Endpoints** (`engines/src/modules/products/products.controller.ts`)
   ```typescript
   POST   /products/variants/group        // Create group
   GET    /products/:id/variants          // Get group
   POST   /products/:id/variants/generate // Generate variants
   PUT    /products/variants/:id          // Update variant
   PUT    /products/:id/variants/bulk     // Bulk update
   DELETE /products/variants/:id/ungroup  // Remove from group
   GET    /products/variants              // Search variants
   ```

4. **Database Migration** (`engines/src/migrations/add-variant-fields.migration.ts`)
   - Adds variant columns
   - Creates indexes for performance
   - Implements validation triggers
   - Sets up inheritance functions

### Frontend (React)
1. **Components** (`admin/src/components/products/variants/`)
   - `VariantGroupManager.tsx` - Multi-step wizard for group creation
   - `VariantGrid.tsx` - Card-based variant display
   - `VariantTable.tsx` - Inline editing table view
   - `VariantAxisSelector.tsx` - Attribute selection UI

2. **Service** (`admin/src/services/variants.service.ts`)
   - API client methods for all variant operations

3. **Integration** (`admin/src/pages/products/ProductDetail.tsx`)
   - New "Variants" tab for configurable products
   - Toggle between grid/table views
   - Quick actions toolbar

## Quick Start

### 1. Run Database Migration
```bash
cd engines
npm run migration:run
```

### 2. Update Backend
```bash
# Copy DTOs to engines/src/modules/products/dto/
# Add service methods to products.service.ts
# Add controller endpoints to products.controller.ts
npm run build
npm run start:dev
```

### 3. Update Frontend
```bash
cd admin
# Copy components to src/components/products/variants/
# Add variant service to src/services/
# Update ProductDetail page
npm run dev
```

## API Usage Examples

### Create Variant Group
```javascript
POST /products/variants/group
{
  "productIds": ["uuid1", "uuid2", "uuid3"],
  "variantAxes": ["color", "size"],
  "variantAttributes": ["sku", "price", "quantity"],
  "parentProductId": "parent-uuid",
  "modelName": "T-Shirt Collection",
  "autoGenerateSkus": true,
  "skuPattern": "{parent_sku}-{color}-{size}"
}
```

### Generate Variants Automatically
```javascript
POST /products/{id}/variants/generate
{
  "attributeCombinations": {
    "color": ["Red", "Blue", "Green"],
    "size": ["S", "M", "L", "XL"]
  },
  "basePrice": 29.99,
  "baseQuantity": 100
}
// Creates 12 variants (3 colors × 4 sizes)
```

### Bulk Price Update
```javascript
PUT /products/{id}/variants/bulk
{
  "variantIds": ["v1", "v2", "v3"],
  "operation": "adjust_price_percentage",
  "value": 10  // 10% increase
}
```

## Features Implemented

### Phase 1 ✅ Core Functionality
- [x] Database schema with variant fields
- [x] Parent-child variant relationships
- [x] Attribute inheritance system
- [x] Variant group creation
- [x] Individual variant updates
- [x] Bulk operations
- [x] API endpoints following standards

### Phase 2 ✅ UI Components
- [x] Multi-step variant creation wizard
- [x] Grid view with variant cards
- [x] Table view with inline editing
- [x] Variant axis selection
- [x] Quick actions (clone, delete, edit)

### Phase 3 🔄 Advanced Features
- [x] Auto-generate variants from combinations
- [x] SKU pattern generation
- [ ] Variant comparison view
- [ ] Import/Export functionality
- [ ] Advanced filtering

## Performance Optimizations

1. **Indexes** - JSONB GIN indexes for variant axes queries
2. **Materialized Views** - Pre-computed variant combinations
3. **Triggers** - Automatic inheritance and validation
4. **Statistics Table** - Cached group metrics

## Validation Rules

1. **Unique Variant Axes** - No duplicate color/size combinations
2. **Parent Type** - Parent must be `configurable` type
3. **Variant Type** - Children must be `simple` type
4. **Required Axes Values** - All axes must have values

## Best Practices

### DO ✅
- Use single-level variants for simplicity
- Leverage JSONB for flexible attributes
- Follow existing API response standards
- Implement proper validation
- Cache frequently accessed data

### DON'T ❌
- Create complex multi-level hierarchies
- Store redundant data
- Skip validation checks
- Ignore performance indexes
- Break existing APIs

## Testing Checklist

### Backend
- [ ] Create variant group with 3+ products
- [ ] Update single variant price
- [ ] Bulk update quantities
- [ ] Remove variant from group
- [ ] Generate 10+ variants automatically
- [ ] Validate unique axes constraint

### Frontend
- [ ] Complete wizard flow
- [ ] Switch between grid/table views
- [ ] Inline edit in table
- [ ] Select multiple for bulk operations
- [ ] Responsive on mobile

## Troubleshooting

### Common Issues

1. **"Variant axes already exist"**
   - Ensure unique color/size combinations
   - Check for existing variants with same axes

2. **"Parent not found"**
   - Verify parent product exists
   - Ensure it's type `configurable`

3. **Inheritance not working**
   - Check `inheritedAttributes` flag is true
   - Verify parent has values to inherit

## Next Steps

1. **Import/Export** - CSV/Excel variant uploads
2. **Advanced Search** - Filter by axes values
3. **Pricing Rules** - Automated price adjustments
4. **Inventory Sync** - External system integration
5. **Variant Templates** - Reusable configurations

## References
- [Akeneo Variant Documentation](https://help.akeneo.com/supplier-data-manager-admin-overview/variants)
- [PIM API Standards](./PIM_API_STANDARDS_AI_REFERENCE.md)
- [Product Module Guide](./PRODUCT_MODULE.md)

---
*Implementation follows Quick Win approach: Simple, effective, maintainable*