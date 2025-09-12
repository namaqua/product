# Product Models Comparison Guide

## Quick Reference

### 1. VARIANTS (Size/Color Model)
**What it is**: Different versions of the SAME product  
**Example**: T-Shirt → Red Small, Red Medium, Blue Small, Blue Medium  
**Database**: Uses existing `products` table with `variantAxes` field  
**Customer sees**: Size and Color selectors  

### 2. CONFIGURABLE PRODUCTS (Component Model)  
**What it is**: Products BUILT from other products  
**Example**: Computer → Intel CPU + 16GB RAM + 512GB SSD  
**Database**: New `product_bundles` tables  
**Customer sees**: Component selection for each part  

---

## Visual Examples

### Variant Product (T-Shirt)
```
Classic T-Shirt ($19.99)
├── Size: [S] [M] [L] [XL]    ← Attributes
├── Color: [Red] [Blue] [Green] ← Attributes
└── Result: Single SKU (TSHIRT-RED-M)
```

### Configurable Product (Computer)
```
Custom Desktop ($0 base)
├── Processor (Required)
│   ○ AMD Ryzen 5 (+$299)     ← Separate Product
│   ● Intel i5 (+$319)         ← Separate Product  
│   ○ Intel i7 (+$449)         ← Separate Product
├── RAM (Required)
│   ○ 8GB DDR4 (+$40)          ← Separate Product
│   ● 16GB DDR4 (+$80)         ← Separate Product
├── Storage (Choose up to 2)
│   ☑ 512GB SSD (+$70)         ← Separate Product
│   ☐ 1TB HDD (+$50)           ← Separate Product
└── Total: $469 (i5 + 16GB + 512GB)
```

---

## Decision Tree

```mermaid
Is it the SAME base product?
├─ YES → Use VARIANTS
│   └─ Examples: Shirt sizes, Book formats, Phone colors
└─ NO → Is it COMPOSED of other products?
    ├─ YES → Use CONFIGURABLE
    │   └─ Examples: PCs, Gift baskets, Furniture sets
    └─ NO → Use SIMPLE product
```

---

## Implementation Status

### ✅ VARIANTS (Completed)
- Database fields added to `products` table
- Parent-child relationships working
- API endpoints ready
- UI components built
- Size/color selection working

### 🚧 CONFIGURABLE PRODUCTS (In Progress)
- Database tables designed
- DTOs created
- Service methods planned
- UI components pending
- Component selection pending

---

## Database Structure Comparison

### Variants Structure
```typescript
// Parent Product
{
  type: "configurable",
  variantAxes: ["size", "color"],        // What varies
  variantAttributes: ["sku", "price"],   // Fields that can differ
  // No inventory (virtual product)
}

// Child Variants  
{
  parentId: "parent-uuid",
  variantAxes: { size: "M", color: "Red" }, // Specific values
  sku: "TSHIRT-RED-M",
  quantity: 100  // Each variant has inventory
}
```

### Configurable Structure
```typescript
// Bundle Configuration
{
  bundleType: "configurable",
  componentGroups: [
    {
      name: "Processor",
      required: true,
      components: [
        { productId: "cpu-001", price: 299 },
        { productId: "cpu-002", price: 399 }
      ]
    }
  ]
}

// Components are regular products
{
  type: "simple",
  sku: "CPU-INTEL-I5",
  price: 319,
  quantity: 50  // Component has its own inventory
}
```

---

## API Usage Comparison

### Variant APIs
```javascript
// Create variant group
POST /products/variants/group
{
  "productIds": ["uuid1", "uuid2"],
  "variantAxes": ["size", "color"],
  "parentProductId": "parent-uuid"
}

// Get variants
GET /products/{parentId}/variants
```

### Configurable APIs
```javascript
// Create bundle
POST /products/{productId}/bundle
{
  "bundleType": "configurable",
  "pricingType": "sum"
}

// Add component group
POST /products/{productId}/bundle/groups
{
  "name": "Processor",
  "required": true,
  "components": [...]
}

// Configure bundle
POST /products/{productId}/bundle/configure
{
  "selectedComponents": {
    "processor": ["cpu-001"],
    "memory": ["ram-002"]
  }
}
```

---

## UI/UX Differences

### Variant Selection UI
- Simple attribute buttons/dropdowns
- Single "Add to Cart" for selected variant
- Shows single price
- Stock for specific variant

### Configurable Selection UI
- Multiple component sections
- Radio/checkbox for each group
- Running price total
- "Configure & Add to Cart"
- Stock check for all components

---

## When to Use Each

### Use VARIANTS when:
✅ Same product with variations  
✅ Shared description/images  
✅ Simple attributes (size, color, material)  
✅ Single SKU per selection  
✅ Examples: Clothing, shoes, phone cases  

### Use CONFIGURABLE when:
✅ Building from separate products  
✅ Components sold individually  
✅ Complex dependencies  
✅ Multiple SKUs in cart  
✅ Examples: Computers, meal kits, furniture sets  

### Use BOTH when:
A configurable product has components with variants
```
Computer (Configurable)
└── RAM Component (has variants)
    ├── 8GB version
    ├── 16GB version
    └── 32GB version
```

---

## Common Mistakes to Avoid

### ❌ DON'T use Variants for:
- Computers with different components
- Gift baskets with selectable items
- Bundles of separate products

### ❌ DON'T use Configurable for:
- T-shirt sizes and colors
- Book formats (hardcover/paperback)
- Simple product variations

### ✅ DO Consider:
- Customer mental model
- Inventory management needs
- Pricing complexity
- Future scalability

---

## Migration Path

If you need to convert between models:

### Variants → Configurable
1. Create separate products for each variant
2. Set up bundle with component groups
3. Migrate inventory to components
4. Update customer-facing UI

### Configurable → Variants
1. Identify common base product
2. Define variant axes
3. Convert components to variants
4. Simplify pricing model

---

## Performance Considerations

### Variants
- Single query for all variants
- Cached variant combinations
- Fast attribute filtering
- Simple stock checks

### Configurable
- Multiple queries for components
- Complex dependency checks
- Dynamic price calculation
- Multi-product stock validation

---

## Summary

| Aspect | Variants | Configurable |
|--------|----------|--------------|
| **Purpose** | Product variations | Product composition |
| **Example** | Shirt sizes/colors | PC components |
| **Selection** | Attributes | Products |
| **Inventory** | Per variant | Per component |
| **Pricing** | Per variant | Sum of components |
| **Cart Items** | Single SKU | Multiple SKUs |
| **Complexity** | Simple | Complex |
| **Best For** | Fashion, Books | Electronics, Kits |

Choose **Variants** for simple product variations.  
Choose **Configurable** for complex product building.  
Both can coexist in the same PIM system!