# Variants vs Attributes - Relationship Guide

## Overview
Understanding how Product Variants relate to Attributes is crucial for properly structuring your product catalog in the PIM system.

## Key Concepts

### 1. Product Variants
**What they are:** Different versions of the same base product with their own inventory, SKUs, and pricing.

**Examples:**
- T-shirt in sizes S, M, L, XL
- iPhone in colors Space Gray, Silver, Gold
- Laptop with 8GB, 16GB, 32GB RAM options

**Key Characteristics:**
- Each variant is a separate product entity
- Has its own SKU, inventory count, and price
- Linked to parent product via `parentId`
- Can inherit or override parent attributes

### 2. Product Attributes
**What they are:** Metadata fields that describe product characteristics using the EAV (Entity-Attribute-Value) pattern.

**Examples:**
- Material: Cotton, Polyester, Wool
- Weight: 1.5kg
- Warranty: 2 years
- Care Instructions: Machine washable
- Technical Specs: Processor speed, Battery life

**Key Characteristics:**
- Flexible, dynamic properties
- Can be different types (text, number, select, etc.)
- Can be required, searchable, filterable
- Applied to ANY product (parent or variant)

## How They Work Together

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        PARENT PRODUCT                        │
│  SKU: TSHIRT-001                                            │
│  Name: Classic Cotton T-Shirt                               │
│  Type: simple                                                │
│                                                              │
│  ATTRIBUTES (via EAV):                                      │
│  - Material: "100% Cotton"           [Attribute]            │
│  - Brand: "ComfortWear"              [Attribute]            │
│  - Care: "Machine Washable"          [Attribute]            │
│  - Season: "All Season"              [Attribute]            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├── Variant 1: Small
                  │   ├── SKU: TSHIRT-001-S
                  │   ├── variantAxes: {size: "S"}
                  │   ├── quantity: 50
                  │   ├── price: $19.99
                  │   └── INHERITS parent attributes OR has own:
                  │       - Weight: "150g"     [Attribute Override]
                  │
                  ├── Variant 2: Medium
                  │   ├── SKU: TSHIRT-001-M
                  │   ├── variantAxes: {size: "M"}
                  │   ├── quantity: 75
                  │   ├── price: $19.99
                  │   └── INHERITS parent attributes OR has own:
                  │       - Weight: "170g"     [Attribute Override]
                  │
                  └── Variant 3: Large
                      ├── SKU: TSHIRT-001-L
                      ├── variantAxes: {size: "L"}
                      ├── quantity: 60
                      ├── price: $21.99  (different price!)
                      └── INHERITS parent attributes OR has own:
                          - Weight: "190g"     [Attribute Override]
                          - Special: "Premium"  [Variant-specific]
```

## Three Storage Mechanisms

### 1. **variantAxes** (What makes this variant unique)
```javascript
{
  variantAxes: {
    size: "L",
    color: "Blue"
  }
}
```
- Stored in product table as JSONB
- Quick identification of variant differences
- Used for variant matrix generation

### 2. **attributes** (Quick custom fields)
```javascript
{
  attributes: {
    variantLabel: "Large Blue",
    specialNote: "Limited Edition",
    internalCode: "TB-L-2024"
  }
}
```
- Stored in product table as JSONB
- Simple key-value pairs
- No validation or type enforcement
- Good for quick, product-specific data

### 3. **EAV Attributes** (Structured, validated metadata)
```javascript
// Attribute Definition
{
  code: "material",
  name: "Material",
  type: "multiselect",
  options: ["Cotton", "Polyester", "Wool", "Silk"],
  isRequired: true,
  isFilterable: true
}

// Attribute Value (links to product)
{
  productId: "variant-123",
  attributeId: "attr-456",
  value: ["Cotton", "Polyester"]  // 60/40 blend
}
```
- Fully structured with validation
- Searchable and filterable
- Can be used for faceted search
- Consistent across products

## Use Cases & Best Practices

### When to Use Variants
✅ **Perfect for:**
- Size variations (S, M, L, XL)
- Color options (Red, Blue, Green)
- Storage capacities (128GB, 256GB, 512GB)
- Pack sizes (Single, 3-pack, 6-pack)

❌ **Don't use for:**
- Completely different products
- Products that need separate marketing
- Items with different primary functions

### When to Use Attributes
✅ **Perfect for:**
- Technical specifications
- Material composition
- Care instructions
- Certifications
- Features that aid in filtering/search
- SEO-relevant properties

❌ **Don't use for:**
- Inventory-tracked variations
- Price-affecting options
- SKU-requiring differences

## Practical Examples

### Example 1: Clothing
```javascript
// Parent Product
{
  sku: "JACKET-001",
  name: "Waterproof Hiking Jacket",
  type: "simple",
  
  // EAV Attributes (structured)
  attributes_eav: [
    { code: "brand", value: "TrailBlazer" },
    { code: "material", value: "Gore-Tex" },
    { code: "waterproof_rating", value: "20000mm" },
    { code: "season", value: ["Spring", "Fall", "Winter"] },
    { code: "gender", value: "Unisex" }
  ]
}

// Variant
{
  parentId: "parent-id",
  sku: "JACKET-001-M-BLUE",
  name: "Waterproof Hiking Jacket - Medium Blue",
  variantAxes: { size: "M", color: "Blue" },
  quantity: 25,
  
  // Can have variant-specific attributes
  attributes_eav: [
    { code: "weight", value: "450g" },  // Size-specific weight
    { code: "chest_size", value: "38-40 inches" }
  ]
}
```

### Example 2: Electronics
```javascript
// Parent Product (Laptop)
{
  sku: "LAPTOP-PRO",
  name: "ProBook 15",
  type: "configurable",  // Can be built-to-order
  
  // Common specs via EAV
  attributes_eav: [
    { code: "screen_size", value: "15.6 inch" },
    { code: "processor", value: "Intel Core i7" },
    { code: "graphics", value: "Intel Iris Xe" },
    { code: "ports", value: ["USB-C", "HDMI", "Audio Jack"] }
  ]
}

// Variant (Specific Configuration)
{
  parentId: "parent-id",
  sku: "LAPTOP-PRO-16GB-512GB",
  variantAxes: { ram: "16GB", storage: "512GB" },
  price: 1299.99,
  
  // Configuration-specific attributes
  attributes_eav: [
    { code: "weight", value: "1.8kg" },
    { code: "battery_life", value: "10 hours" }
  ]
}
```

## Database Relationships

### Simplified ERD
```sql
products
├── id (PK)
├── parentId (FK to products.id)  -- Links variants to parent
├── variantAxes (JSONB)           -- Quick variant identification
├── attributes (JSONB)             -- Simple custom fields
└── [other fields]

attributes
├── id (PK)
├── code (unique)                  -- "material", "brand", etc.
├── type                          -- text, select, number, etc.
├── options (for select types)
└── validation_rules

attribute_values
├── id (PK)
├── productId (FK)                -- Links to ANY product
├── attributeId (FK)              -- Links to attribute definition
└── value                         -- The actual value
```

## Search & Filtering Implications

### Variant-based Filtering
```javascript
// Find all Large size products
query: { variantAxes: { size: "L" } }

// Find blue products
query: { variantAxes: { color: "Blue" } }
```

### Attribute-based Filtering
```javascript
// Find cotton products
query: { 
  attributes: [
    { code: "material", value: "Cotton" }
  ]
}

// Find products with specific features
query: {
  attributes: [
    { code: "waterproof", value: true },
    { code: "weight", operator: "<", value: 500 }
  ]
}
```

## Best Practices

### 1. Variant Axes Selection
Choose variant axes that:
- Affect inventory tracking
- Influence pricing
- Require different SKUs
- Matter for fulfillment

### 2. Attribute Design
Create attributes that:
- Aid in product discovery
- Provide comparison points
- Support faceted search
- Enhance SEO

### 3. Inheritance Strategy
- **Inherit by default**: Material, brand, features
- **Override when needed**: Weight, dimensions
- **Variant-specific**: Size charts, specific measurements

### 4. Performance Considerations
- Use `variantAxes` for quick variant queries
- Index frequently-searched attributes
- Denormalize critical attributes for speed
- Cache attribute values for listing pages

## Common Patterns

### Pattern 1: Simple Variants
```
Product: T-Shirt
├── Variants: Size only
└── Attributes: Shared (material, care, brand)
```

### Pattern 2: Matrix Variants
```
Product: Shoe
├── Variants: Size × Color combinations
└── Attributes: Mix of shared and specific
```

### Pattern 3: Configurable Products
```
Product: Computer
├── Variants: Component combinations
└── Attributes: Detailed specs per configuration
```

## Migration Considerations

### From Flat Structure to EAV
1. Identify common attributes across products
2. Create attribute definitions
3. Migrate data to attribute_values table
4. Remove redundant columns

### Adding Variants to Existing Products
1. Identify variation points (size, color, etc.)
2. Create parent product if needed
3. Generate variants with proper variantAxes
4. Redistribute inventory across variants

## API Usage Examples

### Creating Product with Variants and Attributes
```javascript
// 1. Create parent with attributes
POST /api/products
{
  "sku": "WATCH-001",
  "name": "Smart Watch Pro",
  "type": "simple",
  "attributes": {
    "brand": "TechTime"
  }
}

// 2. Assign EAV attributes
POST /api/products/{id}/attributes
{
  "attributes": [
    { "code": "battery_life", "value": "7 days" },
    { "code": "water_resistance", "value": "IP68" }
  ]
}

// 3. Create variants
POST /api/products
{
  "parentId": "parent-id",
  "sku": "WATCH-001-BLACK-42",
  "variantAxes": { "color": "Black", "size": "42mm" },
  "quantity": 50
}
```

### Searching Products
```javascript
// Get products with variants
GET /api/products?includeVariants=true

// Filter by variant axes
GET /api/products?variantAxes.size=L

// Filter by attributes
GET /api/products?attributes.material=Cotton

// Combined filtering
GET /api/products?type=simple&attributes.brand=Nike&variantAxes.color=Red
```

## Summary

- **Variants** = Different SKUs of the same product (inventory)
- **Attributes** = Descriptive metadata (information)
- **variantAxes** = What makes each variant unique
- **EAV Attributes** = Structured, validated product information

Use variants for inventory-tracked variations, use attributes for searchable/filterable product information. They work together to create a complete product information system.

---
*Last Updated: September 12, 2025*
*Version: 1.0*