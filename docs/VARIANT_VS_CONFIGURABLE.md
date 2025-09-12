# Product Variants vs Configurable Products - Architecture Guide

## Overview
The PIM system supports two distinct product relationship patterns that serve different business needs:

1. **Simple Product Variants** (Parent-Child Inventory)
2. **Configurable Products** (Product Builders/Customizers)

## 1. Simple Product Variants

### Definition
Simple variants are inventory variations of the same base product. Each variant is a separate SKU with its own inventory tracking but represents the same fundamental product.

### Examples
- **T-shirt**: Base product with size variants (S, M, L, XL)
- **iPhone**: Base product with color variants (Black, White, Blue)
- **Book**: Base product with format variants (Hardcover, Paperback, Kindle)
- **Shoe**: Base product with size and color combinations

### Technical Implementation
```javascript
// Parent Product
{
  id: "prod-123",
  sku: "TSHIRT-001",
  name: "Classic Cotton T-Shirt",
  type: "simple",  // Can be any type EXCEPT configurable
  parentId: null,
  // ... other fields
}

// Variant Products (Children)
{
  id: "var-456",
  sku: "TSHIRT-001-S",
  name: "Classic Cotton T-Shirt - Small",
  type: "simple",
  parentId: "prod-123",  // Links to parent
  attributes: {
    variantLabel: "Small",
    size: "S"
  },
  quantity: 50,  // Own inventory
  price: 19.99,  // Can have different price
}
```

### Characteristics
- Parent can be any product type (simple, bundle, virtual) EXCEPT configurable
- Each variant has its own:
  - SKU
  - Inventory/quantity
  - Price (can differ from parent)
  - Weight/dimensions
  - Barcode
- Variants inherit some properties from parent:
  - Description
  - Brand
  - Categories
  - Base attributes
- Customer sees variants as options of the same product

### Frontend Display
```
Product: Classic Cotton T-Shirt
Select Size: [S] [M] [L] [XL]
Price: $19.99
Stock: 50 units available
```

## 2. Configurable Products

### Definition
Configurable products are product builders where customers can customize their purchase by selecting from various component products. Each component is a full product that gets assembled or bundled together.

### Examples
- **Computer**: Select processor, RAM, storage, graphics card
- **Furniture**: Choose wood type, fabric, legs style, dimensions
- **Jewelry**: Pick metal type, stone, engraving options
- **Pizza**: Select size, crust, toppings
- **Car**: Choose engine, trim, packages, accessories

### Technical Implementation
```javascript
// Configurable Parent Product
{
  id: "config-789",
  sku: "PC-BUILDER",
  name: "Custom Gaming PC",
  type: "configurable",
  isConfigurable: true,
  variantGroupId: "config-789",
  variantAttributes: ["processor", "ram", "storage", "graphics"],
  parentId: null,
  // ... other fields
}

// Component Products (Options)
{
  id: "comp-001",
  sku: "PROC-I7-12700K",
  name: "Intel Core i7-12700K",
  type: "simple",
  parentId: "config-789",
  variantAxes: {
    component: "processor",
    tier: "performance"
  },
  price: 399.99,  // Component price
  quantity: 25,
}
```

### Characteristics
- Parent MUST be type: "configurable"
- Components are separate products that can:
  - Be sold individually
  - Have complex pricing rules
  - Come from different manufacturers
  - Have their own detailed specifications
- Configuration rules:
  - Required vs optional components
  - Compatibility rules between components
  - Quantity limits per component type
  - Pricing adjustments based on combinations
- Final price calculated from selected components

### Frontend Display
```
Build Your Gaming PC:

Processor: (Required)
○ Intel Core i5-12400 (+$199)
● Intel Core i7-12700K (+$399)
○ AMD Ryzen 7 5800X (+$349)

RAM: (Required)
○ 16GB DDR4 3200MHz (+$89)
● 32GB DDR4 3600MHz (+$179)
○ 64GB DDR4 3600MHz (+$359)

Storage: (Select up to 3)
☑ 1TB NVMe SSD (+$99)
☐ 2TB NVMe SSD (+$189)
☑ 4TB HDD (+$89)

Total Price: $1,265.00
```

## Key Differences

| Aspect | Simple Variants | Configurable Products |
|--------|----------------|----------------------|
| **Purpose** | Inventory variations | Product customization |
| **Parent Type** | Any except configurable | Must be configurable |
| **Child Products** | Simple variations | Independent products |
| **Pricing** | Fixed per variant | Dynamic based on selection |
| **Inventory** | Per variant | Per component |
| **Customer View** | Single product with options | Product builder |
| **Use Cases** | Sizes, colors, formats | Build-to-order, customization |
| **Complexity** | Low | High |

## Database Schema Requirements

### For Simple Variants
- `parentId`: Links variant to parent product
- `attributes.variantLabel`: Human-readable variant identifier
- No special parent type required

### For Configurable Products
- `type`: Must be "configurable"
- `isConfigurable`: Must be true
- `variantGroupId`: Groups all related products
- `variantAxes`: Defines component categories
- `variantAttributes`: Lists variable attributes

## API Usage

### Creating Simple Variants
```http
POST /api/v1/products
{
  "sku": "TSHIRT-001-M",
  "name": "Classic Cotton T-Shirt - Medium",
  "type": "simple",
  "parentId": "prod-123",  // Parent can be any type
  "attributes": {
    "variantLabel": "Medium",
    "size": "M"
  }
}
```

### Creating Configurable Product Structure
```http
# 1. Create configurable parent
POST /api/v1/products
{
  "sku": "PC-BUILDER",
  "name": "Custom Gaming PC",
  "type": "configurable"
}

# 2. Set up variant group
POST /api/v1/products/{id}/variants/group
{
  "variantAxes": ["processor", "ram", "storage"],
  "variantAttributes": ["price", "specifications"]
}

# 3. Add component products
POST /api/v1/products
{
  "sku": "PROC-I7",
  "name": "Intel Core i7-12700K",
  "parentId": "config-789",
  "variantAxes": {
    "component": "processor"
  }
}
```

## Migration Notes

### Current Issue (Fixed)
The system was incorrectly requiring parent products to be type "configurable" for ALL variants, including simple variants. This has been fixed to:
- Allow simple variants on any product type
- Reserve "configurable" type specifically for product builders

### Breaking Changes
None - the fix is backward compatible.

### Future Enhancements
1. Add `variantType` field to explicitly distinguish:
   - `simple`: Size/color variants
   - `configurable`: Component selection
2. Add configuration rules engine for configurable products
3. Add variant pricing rules (percentage/fixed adjustments)
4. Add compatibility validation for configurable products

## Best Practices

### For Simple Variants
1. Use consistent naming: "{Parent Name} - {Variant Label}"
2. Use predictable SKU patterns: "{Parent SKU}-{Variant Code}"
3. Keep variant attributes minimal and consistent
4. Use bulk creation for common patterns (sizes, colors)

### For Configurable Products
1. Create detailed component products with full specifications
2. Define clear configuration rules upfront
3. Implement compatibility validation
4. Provide clear pricing breakdowns
5. Consider performance impact of complex configurations

## Testing Checklist

### Simple Variants
- [ ] Create parent product (any type)
- [ ] Add variants with parentId
- [ ] Verify inventory tracking per variant
- [ ] Test price inheritance/override
- [ ] Verify variant display in frontend

### Configurable Products
- [ ] Create configurable parent
- [ ] Set up variant group
- [ ] Add component products
- [ ] Test configuration rules
- [ ] Verify dynamic pricing
- [ ] Test component compatibility

---
*Last Updated: September 12, 2025*
*Version: 1.0*