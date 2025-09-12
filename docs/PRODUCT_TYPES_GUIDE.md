# Product Types Documentation

## Overview
The PIM system supports different product types for different business needs. It's important to understand the distinction between product variations and product configurations.

## Product Type Comparison

### 1. Simple Products
- Single SKU, single item
- No variations or customization
- Example: A specific book, a unique artwork

### 2. Products with Variants (Master-Variant Model)
- **Purpose**: Inventory management of the same product in different variations
- **Use Case**: Different SKUs for the same product
- **Examples**: 
  - T-Shirt available in Small, Medium, Large
  - iPhone available in Black, White, Blue
  - Shoes available in sizes 7, 8, 9, 10
- **How it works**:
  - Master product contains base information
  - Variants are separate products with `parentId` pointing to master
  - Each variant has its own SKU, price, and inventory
  - Variants are presented as options of the same product

### 3. Configurable Products (Product Builder)
- **Purpose**: Allow customers to build/customize their product
- **Use Case**: Build-to-order or customizable products
- **Examples**:
  - Dell computers (choose processor, RAM, storage)
  - Custom furniture (select wood type, finish, hardware)
  - Jewelry (pick metal, stones, engraving)
  - Cars (select engine, interior, packages)
- **How it works**:
  - Base product defines configuration options
  - Each option can affect price
  - Customer selects from available options
  - Final product is built based on selections
  - Single SKU generated from configuration

## Key Differences

| Aspect | Master-Variant | Configurable Product |
|--------|---------------|---------------------|
| **Purpose** | Inventory variations | Product customization |
| **Inventory** | Pre-existing stock | Often made-to-order |
| **SKUs** | Each variant has unique SKU | SKU generated from config |
| **Customer Experience** | Select from available options | Build their product |
| **Examples** | T-shirt sizes | Computer builder |
| **Price Model** | Each variant has fixed price | Base price + option modifiers |
| **Stock Management** | Per variant | Based on components |

## Implementation in PIM

### Master-Variant Structure
```javascript
// Master Product
{
  "id": "prod-001",
  "sku": "TSHIRT-001",
  "name": "Classic T-Shirt",
  "type": "simple", // Master can be simple
  "price": 29.99
}

// Variants (separate products)
{
  "id": "var-001",
  "parentId": "prod-001", // Links to master
  "sku": "TSHIRT-001-S",
  "name": "Classic T-Shirt - Small",
  "type": "simple",
  "price": 29.99,
  "quantity": 50,
  "attributes": {
    "variantLabel": "Small"
  }
}
```

### Configurable Product Structure
```javascript
// Configurable Product
{
  "id": "conf-001",
  "sku": "LAPTOP-CONFIG-001",
  "name": "Custom Laptop",
  "type": "configurable",
  "basePrice": 999.99,
  "configurations": [
    {
      "name": "Processor",
      "code": "processor",
      "required": true,
      "options": [
        { "value": "i5", "label": "Intel i5", "priceModifier": 0 },
        { "value": "i7", "label": "Intel i7", "priceModifier": 200 }
      ]
    },
    {
      "name": "Memory",
      "code": "memory",
      "required": true,
      "options": [
        { "value": "8gb", "label": "8GB", "priceModifier": 0 },
        { "value": "16gb", "label": "16GB", "priceModifier": 100 }
      ]
    }
  ]
}
```

## When to Use Which?

### Use Master-Variant When:
- You have physical inventory of each variation
- Variations are predefined and limited
- Each variation needs separate inventory tracking
- Examples: Clothing sizes, colors of phones, book formats

### Use Configurable Products When:
- Products are built/assembled to order
- Many possible combinations exist
- Customer needs to select components
- Price varies based on configuration
- Examples: Computers, custom furniture, configured machinery

### Use Simple Products When:
- Product has no variations
- Single SKU is sufficient
- No customization needed
- Examples: Specific books, unique items, digital downloads

## UI Components

### For Variants
- **Component**: `ProductVariants.tsx`
- **Features**:
  - Add/edit individual variants
  - Quick templates for common variations
  - Inventory management per variant
  - Duplicate variants

### For Configurable Products
- **Component**: `ConfigurableProduct.tsx`
- **Features**:
  - Define configuration options
  - Set price modifiers
  - Manage dependencies
  - Preview customer experience

## Best Practices

### Variants
1. Use consistent naming: "Product Name - Variant"
2. Keep variant labels simple and clear
3. Use templates for common patterns
4. Track inventory at variant level

### Configurable Products
1. Make core options required
2. Provide sensible defaults
3. Clear pricing for options
4. Validate configuration rules
5. Consider component availability

## Common Mistakes to Avoid

1. **Don't use Configurable for simple variations**
   - Wrong: Configurable product for T-shirt sizes
   - Right: Master-Variant for T-shirt sizes

2. **Don't use Variants for complex customization**
   - Wrong: Creating variants for every computer configuration
   - Right: Configurable product with options

3. **Don't mix the concepts**
   - Variants = inventory variations
   - Configurable = product customization

## Future Enhancements

- [ ] Bundle products (groups of products sold together)
- [ ] Virtual products (services, digital goods)
- [ ] Variant groups (multiple variant dimensions)
- [ ] Configuration dependencies and rules engine
- [ ] Dynamic pricing based on configuration
- [ ] Visual product configurator
