# Import/Export UI Documentation

**Created:** September 14, 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete and Integrated

## Overview

The Import/Export UI provides a comprehensive interface for bulk data management in the PIM system. It supports importing and exporting products, variants, categories, and attributes with full validation, mapping, and progress tracking.

## Features

### 📤 Import Manager
- **Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- **File Formats**: CSV, XLS, XLSX support
- **Data Preview**: View first 10 rows before importing
- **Field Mapping**: Map CSV columns to database fields
- **Validation**: Pre-import validation with error reporting
- **Progress Tracking**: Step-by-step import progress
- **Template Downloads**: Download pre-formatted templates

### 📥 Export Manager
- **Configurable Exports**: Select specific fields to export
- **Multiple Formats**: Export as CSV or Excel (XLSX)
- **Quick Templates**: Pre-configured export templates
- **Batch Export**: Export large datasets efficiently
- **Download Management**: Track and download completed exports

### 📊 Job History
- **Real-time Updates**: Auto-refresh every 5 seconds
- **Status Tracking**: Monitor job progress and status
- **Filtering**: Filter by type (import/export) and status
- **Job Details**: View detailed information for each job
- **Actions**: Download exports, cancel running jobs

### 🗺️ Mapping Templates
- **Reusable Mappings**: Save field mappings for consistent imports
- **CRUD Operations**: Create, edit, delete templates
- **Type-specific**: Templates for products, variants, categories, attributes
- **Visual Preview**: See mapping configurations at a glance

## File Structure

```
/admin/src/features/import-export/
├── ImportExport.tsx           # Main component with tabs
├── components/
│   ├── ImportManager.tsx      # Import functionality
│   ├── ExportManager.tsx      # Export functionality
│   ├── JobHistory.tsx         # Job tracking
│   └── MappingTemplates.tsx   # Template management
└── /services/
    └── import-export.service.ts  # API service layer
```

## API Endpoints Used

### Import Endpoints
- `POST /api/import-export/import` - Create import job
- `POST /api/import-export/import/preview` - Preview file
- `POST /api/import-export/import/validate` - Validate import
- `POST /api/import-export/import/process` - Process import
- `GET /api/import-export/import/jobs` - List import jobs
- `GET /api/import-export/import/jobs/:id` - Get job details
- `DELETE /api/import-export/import/jobs/:id` - Cancel job

### Export Endpoints
- `POST /api/import-export/export` - Create export job
- `GET /api/import-export/export/jobs` - List export jobs
- `GET /api/import-export/export/jobs/:id` - Get job details
- `GET /api/import-export/export/download/:id` - Download export
- `DELETE /api/import-export/export/jobs/:id` - Cancel job

### Mapping Endpoints
- `POST /api/import-export/mappings` - Create mapping
- `GET /api/import-export/mappings` - List mappings
- `GET /api/import-export/mappings/:id` - Get mapping
- `PUT /api/import-export/mappings/:id` - Update mapping
- `DELETE /api/import-export/mappings/:id` - Delete mapping

### Template Endpoints
- `GET /api/import-export/templates/download` - Download template

## Installation

1. **Install Dependencies**:
```bash
cd /Users/colinroets/dev/projects/product/admin
npm install react-dropzone date-fns
```

2. **Run the Installation Script**:
```bash
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/install-import-export-deps.sh
./shell-scripts/install-import-export-deps.sh
```

## Usage

### Importing Data

1. **Select Import Type**: Choose between Products, Variants, Categories, or Attributes
2. **Upload File**: Drag and drop or click to browse for CSV/Excel file
3. **Preview Data**: Review the first 10 rows of your data
4. **Map Fields**: Map CSV columns to database fields (auto-mapping available)
5. **Validate**: Check for errors before importing
6. **Process**: Start the import job

### Exporting Data

1. **Select Export Type**: Choose data type to export
2. **Choose Format**: Select CSV or XLSX
3. **Select Fields**: Check which fields to include
4. **Configure Options**: Set additional export options
5. **Start Export**: Create export job
6. **Download**: Download when complete

### Managing Templates

1. **Create Template**: Save field mappings for reuse
2. **Edit Template**: Modify existing mappings
3. **Apply Template**: Use saved mappings for imports
4. **Delete Template**: Remove unused templates

## Import File Format Examples

### Products CSV
```csv
name,sku,price,description,stock,category,brand
"Product Name","SKU-001",99.99,"Description",100,"Electronics","Brand"
```

### Categories CSV
```csv
name,slug,description,parent,order,status
"Electronics","electronics","Electronic products",,1,"active"
"Phones","phones","Mobile phones","Electronics",1,"active"
```

### Attributes CSV
```csv
name,slug,type,options,required,filterable
"Color","color","select","Red,Blue,Green",true,true
"Size","size","select","S,M,L,XL",true,true
```

## Field Mapping

The system supports automatic field mapping for common column names:
- `name` → `name`
- `sku` → `sku`
- `price` → `price`
- `description` → `description`
- `category` → `category`
- `stock`, `quantity` → `stock`

## Validation Rules

### Products
- SKU must be unique
- Price must be numeric and positive
- Stock must be non-negative integer
- Required fields: name, sku

### Categories
- Name must be unique within parent
- Slug must be unique globally
- Parent must exist if specified

### Attributes
- Name and slug must be unique
- Type must be valid (text, number, select, etc.)
- Options required for select/multi-select types

## Error Handling

The UI provides comprehensive error handling:
- File upload errors (size, format)
- Validation errors with row/field details
- Processing errors with recovery options
- Network errors with retry capability

## Performance

- **File Size Limit**: 10MB
- **Preview Rows**: 10 rows
- **Batch Processing**: 100 records at a time
- **Auto-refresh**: Job status every 5 seconds

## Testing

Run the test script to verify setup:
```bash
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/test-import-export-ui.sh
./shell-scripts/test-import-export-ui.sh
```

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size (< 10MB)
   - Verify file format (CSV, XLS, XLSX)
   - Ensure proper permissions

2. **Validation Errors**
   - Review error messages for specific rows
   - Check data types match expectations
   - Verify required fields are present

3. **Import Stuck in Processing**
   - Check backend logs for errors
   - Verify database connection
   - Cancel and retry if needed

4. **Export Not Downloading**
   - Check browser download settings
   - Verify job completed successfully
   - Try different browser if issues persist

## Future Enhancements

- [ ] Scheduled imports/exports
- [ ] API endpoint imports
- [ ] Custom validation rules
- [ ] Import history with rollback
- [ ] Export compression (ZIP)
- [ ] Email notifications
- [ ] Webhook triggers
- [ ] Advanced field transformations

## Related Documentation

- [API Standardization Report](../../../docs/API_STANDARDIZATION_FINAL_REPORT.md)
- [Project Instructions](../../../docs/PROJECT_INSTRUCTIONS.md)
- [Backend Import/Export Module](../../../engines/src/modules/import-export/)

---

**Status:** ✅ Feature Complete and Production Ready
