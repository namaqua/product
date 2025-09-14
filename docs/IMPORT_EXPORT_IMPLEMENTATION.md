# Import/Export System Implementation Plan

## Overview
Implement comprehensive import/export functionality for the PIM system to enable bulk data operations, migration from other systems, and data backup/restore capabilities.

## Timeline: December 12-19, 2024 (Sprint 15)

## Phase 1: CSV Import (Days 1-2)

### 1.1 Backend Implementation
**Location**: `/engines/src/modules/import-export/`

#### Services to Create:
```typescript
// import.service.ts
- parseCSV(file: Buffer): Promise<ParsedData>
- validateImportData(data: ParsedData, entity: string): ValidationResult
- mapFields(data: ParsedData, mapping: FieldMapping): MappedData
- processImport(data: MappedData, options: ImportOptions): ImportResult
- handleImportErrors(errors: ImportError[]): ErrorReport

// export.service.ts  
- exportProducts(filters: ProductQueryDto, format: 'csv' | 'excel'): Buffer
- exportVariants(productId: string, format: 'csv' | 'excel'): Buffer
- generateTemplate(entity: string, format: 'csv' | 'excel'): Buffer
- exportWithRelations(ids: string[], includes: string[]): Buffer
```

#### DTOs to Create:
```typescript
// import-export.dto.ts
- ImportRequestDto
- ImportMappingDto
- ImportOptionsDto
- ImportResultDto
- ExportRequestDto
- ExportOptionsDto
```

#### Controller Endpoints:
```typescript
POST   /import/products/csv         # Import products from CSV
POST   /import/products/excel       # Import products from Excel
POST   /import/variants/:id         # Import variants for a product
POST   /import/validate             # Validate import file
POST   /import/preview              # Preview import with mapping

GET    /export/products             # Export products
GET    /export/variants/:id         # Export variants
GET    /export/template/:entity     # Download import template
POST   /export/custom               # Custom export with filters
```

### 1.2 CSV Parsing Implementation
```typescript
// Libraries: Papa Parse for CSV, SheetJS for Excel
npm install papaparse xlsx multer

// Parser configuration
{
  dynamicTyping: true,
  skipEmptyLines: true,
  delimitersToGuess: [',', '\t', '|', ';'],
  header: true,
  transformHeader: (header) => header.trim().toLowerCase()
}
```

## Phase 2: Import UI (Days 2-3)

### 2.1 Import Wizard Component
**Location**: `/admin/src/features/import-export/ImportWizard.tsx`

#### Steps:
1. **File Upload** - Drag-drop or browse
2. **Preview** - Show first 10 rows
3. **Field Mapping** - Map CSV columns to product fields
4. **Validation** - Show errors and warnings
5. **Options** - Update existing, skip duplicates, etc.
6. **Processing** - Progress bar with real-time updates
7. **Results** - Success/error summary

### 2.2 Mapping Interface
```typescript
interface FieldMapping {
  sourceColumn: string;      // CSV column name
  targetField: string;       // Product field name
  transformation?: string;   // Optional transformation
  required: boolean;
  defaultValue?: any;
}

// Auto-mapping suggestions based on column names
const autoMap = (columns: string[]): FieldMapping[] => {
  const mappings = {
    'sku': 'sku',
    'product_name': 'name',
    'product name': 'name',
    'description': 'description',
    'price': 'price',
    'quantity': 'quantity',
    'stock': 'quantity',
    // ... more mappings
  };
  // Auto-detect and suggest mappings
};
```

## Phase 3: Excel Support (Day 3)

### 3.1 Excel Parser
```typescript
// Excel-specific handling
- Multiple sheets support
- Detect header row
- Handle merged cells
- Format detection (dates, numbers)
- Formula evaluation
```

### 3.2 Multi-Sheet Import
```typescript
interface ExcelImport {
  sheets: {
    products?: Worksheet;
    variants?: Worksheet;
    categories?: Worksheet;
    attributes?: Worksheet;
  };
  relationships: {
    variantToProduct: 'sku' | 'id';
    productToCategory: 'name' | 'id';
  };
}
```

## Phase 4: Export Implementation (Day 4)

### 4.1 Export Features
```typescript
// Export options
interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  filters: ProductQueryDto;
  fields: string[];           // Selected fields to export
  includeVariants: boolean;
  includeCategories: boolean;
  includeAttributes: boolean;
  includeMedia: boolean;
  dateFormat: string;
  numberFormat: string;
}

// Export templates
const exportTemplates = {
  'basic': ['sku', 'name', 'price', 'quantity'],
  'full': ['*'],  // All fields
  'inventory': ['sku', 'name', 'quantity', 'lowStockThreshold'],
  'pricing': ['sku', 'name', 'price', 'specialPrice', 'cost'],
  'seo': ['sku', 'name', 'metaTitle', 'metaDescription', 'urlKey'],
};
```

### 4.2 Export UI
**Location**: `/admin/src/features/import-export/ExportPanel.tsx`

Features:
- Filter products before export
- Select fields to include
- Choose format (CSV/Excel/JSON)
- Include related data options
- Schedule exports (future)
- Export history

## Phase 5: Variant Import (Day 4-5)

### 5.1 Variant-Specific Import
```typescript
// Variant import handling
interface VariantImport {
  parentSku: string;
  variants: Array<{
    sku: string;
    variantAxes: Record<string, any>;  // e.g., {color: 'Red', size: 'L'}
    price?: number;
    quantity?: number;
    // ... other fields
  }>;
  options: {
    createParentIfMissing: boolean;
    updateExisting: boolean;
    generateSkuIfMissing: boolean;
  };
}
```

### 5.2 Bulk Variant Generation from Import
```typescript
// Generate variants from CSV combinations
const generateFromImport = async (data: ImportData) => {
  // Extract unique axes
  const axes = extractAxes(data);
  
  // Group by parent product
  const grouped = groupByParent(data);
  
  // Generate variants for each parent
  for (const [parentSku, variants] of grouped) {
    await variantService.generateVariants(parentId, {
      combinations: variants,
      // ... options
    });
  }
};
```

## Phase 6: Validation & Error Handling (Day 5)

### 6.1 Validation Rules
```typescript
const validationRules = {
  products: {
    sku: { required: true, unique: true, pattern: /^[A-Z0-9-]+$/ },
    name: { required: true, maxLength: 255 },
    price: { type: 'number', min: 0 },
    quantity: { type: 'integer', min: 0 },
    status: { enum: ['draft', 'published', 'archived'] },
    // ... more rules
  },
  variants: {
    parentSku: { required: true, exists: 'products.sku' },
    sku: { required: true, unique: true },
    variantAxes: { required: true, type: 'object' },
    // ... more rules
  }
};
```

### 6.2 Error Reporting
```typescript
interface ImportError {
  row: number;
  column: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

// Error report UI
<ImportErrorReport 
  errors={errors}
  onFix={(row, column, newValue) => {}}
  onSkip={(row) => {}}
  onSkipAll={() => {}}
/>
```

## Sample Import Templates

### products.csv
```csv
sku,name,description,price,quantity,status,category,brand
PROD-001,Product Name,Description here,29.99,100,published,Electronics,BrandA
PROD-002,Another Product,Description,39.99,50,draft,Clothing,BrandB
```

### variants.csv
```csv
parent_sku,sku,color,size,price,quantity
PROD-001,PROD-001-RED-S,Red,Small,29.99,25
PROD-001,PROD-001-RED-M,Red,Medium,29.99,30
PROD-001,PROD-001-BLUE-S,Blue,Small,29.99,20
```

## API Examples

### Import Products
```http
POST /api/import/products/csv
Content-Type: multipart/form-data

file: products.csv
mapping: {
  "sku": "sku",
  "product_name": "name",
  "price": "price"
}
options: {
  "updateExisting": true,
  "skipInvalid": false
}
```

### Export Products
```http
GET /api/export/products?format=excel&includeVariants=true
Authorization: Bearer TOKEN

Response: Binary Excel file
```

### Validate Import
```http
POST /api/import/validate
Content-Type: multipart/form-data

file: products.csv
entity: products

Response: {
  "valid": false,
  "errors": [...],
  "warnings": [...],
  "summary": {
    "totalRows": 100,
    "validRows": 95,
    "errorRows": 5
  }
}
```

## Testing Plan

### Unit Tests
- CSV parsing with various delimiters
- Field mapping logic
- Validation rules
- Export formatting
- Error handling

### Integration Tests
- Import 1000+ products
- Import with relationships
- Export and re-import cycle
- Concurrent imports
- Large file handling (>10MB)

### E2E Tests
- Complete import wizard flow
- Export with filters
- Error correction flow
- Template download and use

## Performance Considerations

1. **Chunking**: Process large files in chunks (500 rows)
2. **Streaming**: Use streams for large exports
3. **Background Jobs**: Queue for files >1000 rows
4. **Progress Updates**: WebSocket or SSE for real-time progress
5. **Caching**: Cache mapping suggestions
6. **Indexing**: Ensure SKU index for duplicate checks

## Success Metrics
- Import 10,000 products in < 2 minutes
- Support files up to 50MB
- 95%+ auto-mapping accuracy
- Zero data loss on import
- Handle Excel files with 10+ sheets

---
*Created: December 12, 2024*
*Sprint: 15*
*Priority: HIGH*