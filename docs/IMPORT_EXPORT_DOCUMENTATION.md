# Import/Export System Documentation

## Overview
The PIM Import/Export System provides comprehensive data import and export capabilities for products, variants, categories, and attributes. It supports CSV and Excel formats with intelligent field mapping, validation, and background processing.

**Status**: ✅ IMPLEMENTED (December 2024)
**Priority**: #1 - Essential for data migration and bulk operations

## Features

### Core Capabilities
- ✅ CSV and Excel file import/export
- ✅ Bulk product and variant imports
- ✅ Intelligent field mapping with auto-suggestions
- ✅ Data validation with detailed error reporting
- ✅ Template downloads with sample data
- ✅ Background job processing with progress tracking
- ✅ Import/export history and job management
- ✅ Saved mapping templates for reuse
- ✅ Export filtering and field selection

### Supported Data Types
1. **Products** - Full product catalog import/export
2. **Variants** - Bulk variant management
3. **Categories** - Category hierarchy import/export
4. **Attributes** - Attribute definitions and values
5. **Inventory** - Stock level updates (export only)

## Architecture

### Technology Stack
- **File Parsing**: Papa Parse (CSV), ExcelJS (Excel)
- **Job Queue**: Bull with Redis (optional)
- **File Upload**: Multer
- **Storage**: Local filesystem with configurable paths
- **Validation**: Custom validators with TypeORM

### Module Structure
```
import-export/
├── entities/
│   ├── import-job.entity.ts      # Import job tracking
│   ├── export-job.entity.ts      # Export job tracking
│   └── import-mapping.entity.ts  # Saved field mappings
├── processors/
│   ├── product-import.processor.ts   # Product import logic
│   ├── variant-import.processor.ts   # Variant import logic
│   └── product-export.processor.ts   # Export processing
├── services/
│   ├── template.service.ts       # Template generation
│   └── mapping.service.ts        # Field mapping logic
├── validators/
│   └── import.validator.ts       # Data validation
├── dto/
│   ├── import.dto.ts            # Import DTOs
│   └── export.dto.ts            # Export DTOs
├── import-export.controller.ts   # API endpoints
├── import-export.service.ts      # Core business logic
└── import-export.module.ts       # Module configuration
```

## API Endpoints

### Import Endpoints

#### 1. Create Import Job
```bash
POST /api/import-export/import
Content-Type: multipart/form-data

Fields:
- file: Binary file (CSV/Excel)
- type: "products" | "variants" | "categories" | "attributes"
- mapping: JSON object with field mappings
- options: JSON object with import options

Response:
{
  "success": true,
  "data": {
    "item": { ...importJob },
    "message": "Import job created successfully"
  }
}
```

#### 2. Preview Import File
```bash
POST /api/import-export/import/preview
Content-Type: multipart/form-data

Fields:
- file: Binary file
- type: Import type
- rows: Number of rows to preview (default: 10)

Response:
{
  "success": true,
  "data": {
    "headers": ["name", "sku", ...],
    "rows": [...],
    "suggestedMapping": { ... }
  }
}
```

#### 3. Validate Import File
```bash
POST /api/import-export/import/validate
Content-Type: multipart/form-data

Fields:
- file: Binary file
- type: Import type
- mapping: Field mapping configuration

Response:
{
  "success": true,
  "data": {
    "valid": boolean,
    "totalRows": number,
    "validRows": number,
    "invalidRows": number,
    "errors": [...]
  }
}
```

#### 4. Get Import Jobs
```bash
GET /api/import-export/import/jobs?type=products&status=completed

Response:
{
  "success": true,
  "data": {
    "items": [...],
    "meta": { ... }
  }
}
```

### Export Endpoints

#### 1. Create Export Job
```bash
POST /api/import-export/export
Content-Type: application/json

Body:
{
  "type": "products",
  "format": "csv" | "excel" | "json",
  "filters": {
    "status": ["published"],
    "categories": ["electronics"]
  },
  "fields": ["name", "sku", "price"],
  "options": {
    "includeVariants": true,
    "includeCategories": true
  }
}
```

#### 2. Download Export
```bash
GET /api/import-export/export/download/{jobId}

Returns: File download
```

### Template Endpoints

#### Download Import Template
```bash
GET /api/import-export/templates/download
  ?type=products
  &format=csv
  &includeSampleData=true
  &sampleRows=5

Returns: Template file with headers and optional sample data
```

### Mapping Endpoints

#### Save Import Mapping
```bash
POST /api/import-export/mappings
Content-Type: application/json

Body:
{
  "name": "Standard Product Import",
  "type": "products",
  "mapping": {
    "Product Name": "name",
    "SKU": "sku"
  },
  "isDefault": true
}
```

## Field Mapping

### Auto-Mapping Intelligence
The system uses intelligent field matching to suggest mappings:

```javascript
// Common field variations recognized
Products:
- name: ['name', 'title', 'productname', 'product_name']
- sku: ['sku', 'code', 'productcode', 'item_code']
- price: ['price', 'cost', 'amount', 'selling_price']
- quantity: ['quantity', 'qty', 'stock', 'inventory']

Variants:
- color: ['color', 'colour', 'color_name']
- size: ['size', 'product_size', 'dimensions']
```

### Manual Mapping Configuration
```json
{
  "mapping": {
    "Product Name": "name",
    "SKU Code": "sku",
    "Description": "description",
    "Selling Price": "price",
    "Stock Level": "quantity",
    "Category": "category"
  },
  "transformations": {
    "price": {
      "type": "number"
    },
    "urlKey": {
      "type": "slug"
    }
  },
  "defaults": {
    "status": "draft",
    "isFeatured": false
  }
}
```

## Import Templates

### Product Import Template
```csv
name,sku,description,price,compareAtPrice,quantity,category,brand,status,isFeatured
"Product 1","SKU-001","Description",29.99,39.99,100,"Electronics","Brand A","published","true"
```

### Variant Import Template
```csv
productSku,variantSku,name,price,quantity,color,size,weight,isDefault
"PARENT-001","VAR-001","Red Small",29.99,50,"Red","S",0.5,"true"
"PARENT-001","VAR-002","Red Medium",29.99,75,"Red","M",0.5,"false"
```

### Category Import Template
```csv
name,slug,description,parent,position,isActive,metaTitle,metaDescription
"Electronics","electronics","Electronic products","",0,"true","Electronics - Shop Online","Browse electronics"
"Laptops","laptops","Laptop computers","Electronics",1,"true","Laptops","Shop laptops"
```

## Validation Rules

### Product Validation
- **Required Fields**: name, sku
- **SKU Format**: Letters, numbers, hyphens, underscores only
- **Price**: Must be positive number
- **Quantity**: Must be non-negative integer
- **Status**: Must be 'draft', 'published', or 'archived'
- **URL Key**: Lowercase letters, numbers, hyphens only

### Variant Validation
- **Required Fields**: variantSku, productSku or productId
- **Parent Product**: Must exist in system
- **SKU Uniqueness**: Must be unique across all variants
- **Default Variant**: Only one per product

### Category Validation
- **Required Fields**: name
- **Slug Uniqueness**: Must be unique across all categories
- **Parent Reference**: Must exist if specified
- **Hierarchy**: Cannot create circular references

## Job Processing

### Import Job Lifecycle
1. **PENDING** - Job created, waiting to process
2. **PROCESSING** - Active import in progress
3. **COMPLETED** - Successfully imported all valid rows
4. **FAILED** - Fatal error during processing
5. **CANCELLED** - Manually cancelled by user

### Export Job Lifecycle
1. **PENDING** - Job queued for processing
2. **PROCESSING** - Generating export file
3. **COMPLETED** - File ready for download
4. **FAILED** - Export generation failed
5. **CANCELLED** - Manually cancelled

### Background Processing
- Jobs processed asynchronously using Bull queue
- Progress updates available via API
- Configurable batch sizes for large imports
- Automatic retry on transient failures

## Error Handling

### Import Errors
```json
{
  "errors": [
    {
      "row": 5,
      "field": "sku",
      "message": "SKU already exists",
      "data": { "sku": "DUPLICATE-001" }
    },
    {
      "row": 10,
      "field": "price",
      "message": "Price must be a positive number",
      "data": { "price": "-10" }
    }
  ]
}
```

### Validation Warnings
- Duplicate SKUs (when updateExisting is false)
- Missing categories (creates without category)
- Invalid references (skips relationship)

## Usage Examples

### 1. Basic Product Import
```bash
# Step 1: Download template
curl -X GET "http://localhost:3010/api/import-export/templates/download?type=products&format=csv" \
  -H "Authorization: Bearer TOKEN" \
  -o product-template.csv

# Step 2: Fill template with data

# Step 3: Preview import
curl -X POST "http://localhost:3010/api/import-export/import/preview" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@products.csv" \
  -F "type=products"

# Step 4: Create import job
curl -X POST "http://localhost:3010/api/import-export/import" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@products.csv" \
  -F "type=products" \
  -F 'mapping={"name":"name","sku":"sku","price":"price"}'
```

### 2. Bulk Variant Import
```javascript
// Frontend example
const formData = new FormData();
formData.append('file', variantFile);
formData.append('productIdentifier', 'PARENT-SKU-001');
formData.append('useSku', 'true');
formData.append('mapping', JSON.stringify({
  'Variant SKU': 'variantSku',
  'Color': 'color',
  'Size': 'size',
  'Price': 'price',
  'Stock': 'quantity'
}));

await api.post('/import-export/import/variants/bulk', formData);
```

### 3. Filtered Export
```javascript
// Export published products with variants
const exportJob = await api.post('/import-export/export', {
  type: 'products',
  format: 'excel',
  filters: {
    status: ['published'],
    priceRange: { min: 10, max: 1000 }
  },
  fields: ['name', 'sku', 'price', 'quantity', 'category'],
  options: {
    includeVariants: true,
    includeCategories: true
  }
});

// Check status
const status = await api.get(`/import-export/export/jobs/${exportJob.data.item.id}`);

// Download when ready
if (status.data.status === 'completed') {
  window.location.href = `/api/import-export/export/download/${exportJob.data.item.id}`;
}
```

## Configuration

### File Size Limits
```typescript
// Maximum file size: 50MB
MulterModule.register({
  limits: {
    fileSize: 50 * 1024 * 1024
  }
})
```

### Batch Processing
```typescript
// Default batch size for imports
const BATCH_SIZE = 100;

// Can be overridden per job
processImportJob({
  jobId: 'xxx',
  batchSize: 500  // Process 500 rows at a time
})
```

### Export Expiration
```typescript
// Exports expire after 7 days
const EXPORT_EXPIRY = 7 * 24 * 60 * 60 * 1000;
```

## Redis Configuration (Optional)

For production environments, configure Redis for Bull queue:

```typescript
// bull.config.ts
BullModule.forRoot({
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'redis-password'
  }
})
```

## Best Practices

### Import Optimization
1. **Validate before importing** - Use validation endpoint first
2. **Use batch processing** - For large files (>10k rows)
3. **Save mappings** - Reuse for consistent imports
4. **Test with small batches** - Verify mapping before full import

### Export Optimization
1. **Filter data** - Export only what's needed
2. **Select specific fields** - Reduce file size
3. **Use appropriate format** - CSV for simple data, Excel for complex
4. **Schedule off-peak** - For large exports

### Error Recovery
1. **Review error logs** - Check specific row errors
2. **Fix and re-import** - Only failed rows
3. **Use updateExisting** - For corrections
4. **Monitor job status** - Track progress

## Troubleshooting

### Common Issues

#### 1. Import Job Stuck in PENDING
- Check if Redis is running (if configured)
- Verify Bull queue is processing
- Check application logs for errors

#### 2. Validation Errors
- Ensure required fields are mapped
- Check data types match expectations
- Verify references exist (categories, products)

#### 3. Export Not Downloading
- Check if job completed successfully
- Verify file exists on server
- Check export hasn't expired (7 days)

#### 4. Memory Issues with Large Files
- Increase Node.js memory limit
- Use streaming for very large exports
- Process in smaller batches

## Performance Considerations

### Import Performance
- **Small files (<1k rows)**: ~1-2 seconds
- **Medium files (1k-10k rows)**: ~10-30 seconds
- **Large files (10k-100k rows)**: ~1-5 minutes

### Export Performance
- **Products only**: ~1000 records/second
- **With variants**: ~500 records/second
- **With all relations**: ~200 records/second

## Security

### File Upload Security
- File type validation (CSV, Excel only)
- File size limits (50MB default)
- Virus scanning (optional integration)
- Isolated upload directory

### Data Security
- Role-based access control
- User-specific job tracking
- Sanitized file names
- Temporary file cleanup

## Future Enhancements

### Planned Features
- [ ] Scheduled imports/exports
- [ ] Import from URLs
- [ ] API-based imports
- [ ] Incremental exports
- [ ] Real-time progress via WebSockets
- [ ] Import rollback capability
- [ ] Data transformation rules
- [ ] Custom validators

### Integration Points
- [ ] External data sources (APIs, databases)
- [ ] Cloud storage (S3, Google Cloud)
- [ ] ETL pipelines
- [ ] Webhook notifications
- [ ] Email reports

---

## Quick Reference

### Required NPM Packages
```json
{
  "papaparse": "^5.4.1",
  "exceljs": "^4.4.0",
  "@nestjs/bull": "^10.0.1",
  "bull": "^4.11.5",
  "@nestjs/platform-express": "^10.3.0",
  "multer": "^1.4.5-lts.1"
}
```

### Database Tables
- `import_jobs` - Import job tracking
- `export_jobs` - Export job tracking
- `import_mappings` - Saved field mappings

### File Locations
- Imports: `/uploads/imports/`
- Exports: `/uploads/exports/`
- Templates: `/uploads/templates/`

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
