# Product Types Distinction - Critical Understanding

## Overview
This document clarifies the fundamental difference between **Configurable Products** and **Master-Variant Products** - two completely different product models that should NEVER be conflated.

---

## 1. Master-Variant Products (Inventory Variations)
**Purpose:** Simple inventory management for products that come in different variations

### Characteristics:
- **Simple parent-child relationship**
- Each variant is a **stock-keeping unit (SKU)** of the same product
- Variants differ by simple attributes (size, color, material, etc.)
- Customer selects from pre-existing options
- All variants are essentially the same product in different forms
- Inventory is tracked at the variant level

### Examples:
- **T-Shirt:** Available in S, M, L, XL sizes and Red, Blue, Green colors
- **Smartphone:** Available in 128GB, 256GB, 512GB storage capacities
- **Coffee:** Available in 250g, 500g, 1kg packages
- **Shoes:** Available in sizes 7, 8, 9, 10, 11

### Technical Implementation:
```javascript
// Master Product
{
  id: "prod-123",
  name: "Classic T-Shirt",
  type: "simple", // NOT configurable
  isConfigurable: false,
  hasVariants: true
}

// Variants (children)
{
  id: "var-001",
  parentId: "prod-123",
  name: "Classic T-Shirt - Red Large",
  sku: "TSHIRT-RED-L",
  variantAxes: { color: "Red", size: "L" },
  quantity: 50,
  price: 29.99
}
```

### UI Approach:
- Dropdown selectors or button groups
- Size/Color matrix grid
- Quick variant generator for common patterns
- Bulk editing tools for price/inventory

---

## 2. Configurable Products (Product Builders)
**Purpose:** Complex products assembled from component choices

### Characteristics:
- **Product is built/configured from sub-products or components**
- Each component/option may be a separate product with its own SKU
- Customer builds a custom configuration
- Final product is assembled from selected components
- Price calculated based on selected components
- Often involves compatibility rules

### Examples:
- **Desktop PC:** 
  - CPU: Choose Intel i5 OR AMD Ryzen 5
  - RAM: Choose 8GB OR 16GB OR 32GB
  - Storage: Choose 256GB SSD OR 512GB SSD OR 1TB HDD
  - Graphics: Choose Integrated OR GTX 1660 OR RTX 3060
  
- **Custom Furniture:**
  - Frame: Oak OR Pine OR Metal
  - Cushion: Leather OR Fabric
  - Size: 2-seater OR 3-seater
  - Add-ons: Ottoman, Cup holders, USB charging

- **Sandwich Builder:**
  - Bread: White OR Wheat OR Rye
  - Protein: Turkey OR Ham OR Veggie Patty
  - Cheese: Cheddar OR Swiss OR None
  - Toppings: Multiple selections allowed

### Technical Implementation:
```javascript
// Configurable Product
{
  id: "pc-builder-001",
  name: "Custom Gaming PC",
  type: "configurable",
  isConfigurable: true,
  configurableOptions: [
    {
      label: "Processor",
      required: true,
      options: [
        { productId: "cpu-001", name: "Intel i5-12400", price: 200 },
        { productId: "cpu-002", name: "AMD Ryzen 5 5600X", price: 250 }
      ]
    },
    {
      label: "Memory",
      required: true,
      options: [
        { productId: "ram-001", name: "8GB DDR4", price: 50 },
        { productId: "ram-002", name: "16GB DDR4", price: 100 }
      ]
    }
  ],
  basePrice: 500, // Base price before components
  compatibilityRules: [...] // Rules for valid combinations
}
```

### UI Approach:
- Step-by-step configuration wizard
- Component selection with live price updates
- Compatibility validation
- Configuration summary before add to cart
- Save/load configurations

---

## Key Differences Summary

| Aspect | Master-Variant | Configurable Product |
|--------|---------------|---------------------|
| **Purpose** | Inventory variations | Custom product assembly |
| **Relationship** | Simple parent-child | Complex component selection |
| **Customer Choice** | Pick from existing options | Build custom configuration |
| **Inventory** | Tracked per variant | May involve multiple product inventories |
| **Pricing** | Fixed per variant | Calculated from components |
| **Examples** | T-shirt sizes/colors | PC builder, Custom furniture |
| **Database** | parentId relationship | Configuration rules & options |
| **UI Pattern** | Dropdowns/Matrix | Configuration wizard |

---

## Implementation Guidelines

### For Master-Variant Products:
1. Use simple parent-child relationships
2. Generate variants in bulk from templates
3. Focus on quick selection UI
4. Implement matrix views for bulk editing
5. Track inventory at variant level

### For Configurable Products:
1. Define configuration options and rules
2. Build step-by-step configurators
3. Implement compatibility checking
4. Calculate pricing dynamically
5. Allow saving configurations

---

## Common Mistakes to Avoid

❌ **DON'T** use configurable product type for simple variants
❌ **DON'T** create complex builders for size/color variations
❌ **DON'T** mix the two models in the same product
❌ **DON'T** call simple variants "configurable"

✅ **DO** use master-variant for inventory variations
✅ **DO** use configurable for build-to-order products
✅ **DO** keep the models separate and distinct
✅ **DO** choose the right model based on business needs

---

## Current PIM Implementation Status

### Master-Variant (ACTIVE DEVELOPMENT)
- ✅ Basic parent-child relationships working
- ✅ Quick templates for common variants
- 🔧 Multi-axis wizard in development
- 🔧 Matrix view for bulk editing
- ⏳ Backend variant group management

### Configurable Products (FUTURE FEATURE)
- ⏳ Not yet implemented
- ⏳ Planned for Phase 2
- ⏳ Will require separate configuration module
- ⏳ Component compatibility engine needed

---

## AI Assistant Instructions

When working with product variations in this PIM system:

1. **ALWAYS clarify** which model is being discussed:
   - "Are we talking about simple variants (like t-shirt sizes) or configurable products (like PC builders)?"

2. **Use correct terminology:**
   - Master-Variant: "variants", "variations", "options", "SKUs"
   - Configurable: "components", "configuration", "builder", "assembly"

3. **Never suggest** configurable product features for simple variant needs

4. **Remember:** The current development focus is on Master-Variant products. Configurable products are a future feature.

5. **Database fields:**
   - `parentId`: Links variant to master product
   - `variantAxes`: Stores variant attributes (size, color, etc.)
   - `isConfigurable`: Reserved for future configurable products feature
   - `type`: 'simple' for both master and variants currently

---

*Last Updated: September 2025*
*Priority: CRITICAL - This distinction must be understood for proper implementation*
