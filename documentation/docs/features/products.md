---
sidebar_position: 1
title: Products
---

# Product Management

The Product Management module is the core of your PIM system, handling all product data, variants, and relationships.

## Product Types

PIM supports multiple product types to handle different business needs:

### Simple Products
Standard products with a single SKU and set of attributes.

### Configurable Products
Products with variations (size, color, etc.) that customers can select.

### Bundle Products
Groups of products sold together as a package.

### Virtual Products
Non-physical products like services or digital downloads.

## Key Features

### Product Information
- **SKU Management**: Unique identifiers for inventory tracking
- **Naming & Descriptions**: Multi-field descriptions (short, long, technical)
- **Status Management**: Draft, Active, Archived states
- **URL Slugs**: SEO-friendly URLs

### Pricing
- Regular price
- Special/Sale price
- Cost tracking
- Compare at price
- Currency support

### Inventory
- Stock quantity tracking
- Low stock alerts
- Backorder management
- Multiple warehouse support (coming soon)

### Media
- Multiple images per product
- Primary image designation
- Video support
- Document attachments
- 360° view support (coming soon)

## Creating a Product

### Via UI

1. Navigate to **Products** → **New Product**
2. Fill in required fields:
   - SKU (unique identifier)
   - Name
   - Status (Draft/Active)
3. Add optional information:
   - Descriptions
   - Pricing
   - Media
   - Categories
   - Attributes
4. Click **Save**

### Via API

```typescript
POST /api/products
{
  "sku": "PROD-001",
  "name": "Sample Product",
  "status": "active",
  "type": "simple",
  "price": 29.99,
  "description": "Product description",
  "categories": ["category-id-1"],
  "attributes": [
    {
      "id": "attr-1",
      "value": "Blue"
    }
  ]
}
```

## Product Attributes

Attributes allow you to define custom properties for your products:

- **Text**: Simple text values
- **Number**: Numeric values with units
- **Boolean**: Yes/No flags
- **Select**: Dropdown options
- **Multi-select**: Multiple choice
- **Date**: Date pickers
- **Color**: Color swatches
- **File**: Document attachments

## Bulk Operations

### Import Products
```
Products → Import → Select CSV → Map Fields → Import
```

### Export Products
```
Products → Select Items → Actions → Export
```

### Bulk Edit
```
Products → Select Items → Actions → Bulk Edit
```

## Product Variants

For configurable products, you can create variants:

1. Set product type to "Configurable"
2. Define configurable attributes (Size, Color, etc.)
3. Generate variant combinations
4. Set variant-specific:
   - SKUs
   - Prices
   - Stock levels
   - Images

## SEO Optimization

- **Meta titles**: Custom page titles
- **Meta descriptions**: Search result descriptions
- **URL slugs**: Clean, keyword-rich URLs
- **Structured data**: Schema.org markup (automatic)
- **Sitemap**: Auto-generated XML sitemap

## Best Practices

### SKU Format
- Use consistent format: `CATEGORY-TYPE-NUMBER`
- Example: `SHIRT-MENS-001`
- Keep under 20 characters
- Avoid special characters

### Naming Conventions
- Use descriptive product names
- Include key attributes in name
- Follow pattern: `[Brand] [Type] [Model] - [Key Feature]`

### Image Guidelines
- Minimum 800x800px
- White background for main image
- Multiple angles (front, back, side, detail)
- Consistent aspect ratio

### Description Writing
- **Short**: 1-2 sentences for listings
- **Long**: Detailed features and benefits
- **Technical**: Specifications and dimensions

## Advanced Features

### Product Relations
- Cross-sells
- Up-sells
- Related products
- Frequently bought together

### Personalization
- Customer-specific pricing
- B2B catalogs
- Regional availability
- Custom attributes per customer group

### Automation
- Auto-categorization
- Smart tagging
- Price rules
- Inventory sync

## Troubleshooting

### Common Issues

**Duplicate SKU Error**
- Ensure SKU is unique across all products
- Check archived products
- Use SKU generator for uniqueness

**Media Not Displaying**
- Check file format (JPEG, PNG, GIF, WebP)
- Verify file size < 50MB
- Ensure media is associated with product

**Import Failures**
- Validate CSV format
- Check required fields
- Verify category/attribute IDs exist

## API Reference

For complete API documentation, see [Products API](../api/products)

## Related Topics

- [Media Library](./media-library)
- [Categories](./categories)
- [Attributes](./attributes)
- [Import/Export](../guides/import-export)
