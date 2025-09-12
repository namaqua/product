# Product Variants Documentation

## Overview
The PIM system supports configurable products with variants based on product attributes. This follows the standard e-commerce pattern where a master product (e.g., "T-Shirt") has multiple variants based on attributes like color and size.

## Architecture

### Attribute-Variant Relationship
```
Master Product (type: configurable)
  ├── Attributes (with options)
  │   ├── Color: [Blue, Red, White]
  │   └── Size: [Small, Medium, Large]
  └── Variants (type: simple)
      ├── Blue/Small
      ├── Blue/Medium
      ├── Blue/Large
      ├── Red/Small
      ├── Red/Medium
      ├── Red/Large
      ├── White/Small
      ├── White/Medium
      └── White/Large
```

### Database Structure
- **Master Product**: `type = 'configurable'`, contains attribute definitions
- **Variants**: `type = 'simple'`, `parentId` points to master product
- **Attributes**: Stored using EAV pattern in `attribute_values` table
- **Variant Attributes**: Stored in product's `attributes` JSONB field

## Features

### 1. Manual Variant Creation
Create individual variants with specific attribute combinations:
- Custom SKU generation
- Individual pricing and inventory
- Attribute value selection
- Status management

### 2. Automatic Variant Generation
Generate all possible combinations from selected attributes:
- Select which attributes to use for variants
- Automatically creates all combinations
- Auto-generates SKUs and names
- Bulk creation in one operation

### 3. Variant Management
- Edit variants inline
- Update pricing and inventory per variant
- Archive/publish individual variants
- Track stock levels per variant

## Usage

### Creating a Configurable Product

1. **Create Master Product**
   - Set type to "Configurable"
   - Add base product information
   - Don't set inventory (managed at variant level)

2. **Add Product Attributes**
   - Add SELECT type attributes (Color, Size, etc.)
   - Define all possible values
   - These become variant options

3. **Generate Variants**
   - Click "Generate from Attributes"
   - Select which attributes define variants
   - System creates all combinations

### Example: T-Shirt with Color and Size

```javascript
// Master Product
{
  "sku": "SHIRT-001",
  "name": "Classic T-Shirt",
  "type": "configurable",
  "attributeValues": [
    {
      "attribute": {
        "code": "color",
        "name": "Color",
        "type": "SELECT",
        "options": [
          { "value": "blue", "label": "Blue" },
          { "value": "red", "label": "Red" },
          { "value": "white", "label": "White" }
        ]
      }
    },
    {
      "attribute": {
        "code": "size",
        "name": "Size",
        "type": "SELECT",
        "options": [
          { "value": "s", "label": "Small" },
          { "value": "m", "label": "Medium" },
          { "value": "l", "label": "Large" }
        ]
      }
    }
  ]
}

// Generated Variants (9 total)
{
  "sku": "SHIRT-001-BLUE-S",
  "name": "Blue / Small",
  "parentId": "master-product-id",
  "type": "simple",
  "price": 29.99,
  "quantity": 50,
  "attributes": {
    "color": "blue",
    "size": "s"
  }
}
// ... 8 more variants
```

## UI Components

### ProductVariants Component
Location: `/admin/src/features/products/ProductVariants.tsx`

Features:
- Variant list with expandable details
- Inline editing
- Bulk generation from attributes
- Attribute-based filtering
- Stock summary

### Integration Points
1. **ProductEdit**: Includes variants section for configurable products
2. **ProductDetails**: Shows variant summary and management link
3. **ProductCreate**: Info message about adding variants post-creation

## API Endpoints

### Get Product with Variants
```
GET /api/v1/products/:id?includeVariants=true
```

### Get Variants for a Product
```
GET /api/v1/products?parentId=:productId
```

### Create Variant
```
POST /api/v1/products
{
  "parentId": "master-product-id",
  "type": "simple",
  "sku": "unique-variant-sku",
  "attributes": { "color": "blue", "size": "m" }
}
```

## Testing

Run the test script to create a sample configurable product with variants:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x test-product-variants.sh
./test-product-variants.sh
```

This creates:
- 1 Master product (T-Shirt)
- Color attribute with 3 options
- Size attribute with 3 options
- 3 sample variants

## Best Practices

1. **Attribute Selection**
   - Use SELECT type attributes for variants
   - Keep variant attributes simple (color, size, material)
   - Complex attributes should be on master product

2. **SKU Management**
   - Use consistent SKU patterns
   - Include attribute values in variant SKUs
   - Keep SKUs unique across all products

3. **Inventory**
   - Track inventory at variant level
   - Master product quantity = sum of variants
   - Use low stock alerts per variant

4. **Pricing**
   - Can have different prices per variant
   - Special pricing per variant
   - Cost tracking per variant

## Limitations

- Maximum 100 variants per product (configurable)
- Variant attributes must be SELECT or MULTISELECT type
- Variants are always "simple" product type
- Variants inherit categories from parent

## Future Enhancements

- [ ] Variant image assignment
- [ ] Bulk price/inventory updates
- [ ] Variant comparison table
- [ ] Quick variant switcher on frontend
- [ ] Variant import/export
- [ ] Variant templates
