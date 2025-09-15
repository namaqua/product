# Import/Export User Guide

**Version:** 1.0.0  
**Last Updated:** September 14, 2025  
**Module Status:** ✅ Complete with Full UI

## Table of Contents
1. [Overview](#overview)
2. [Import Features](#import-features)
3. [Export Features](#export-features)
4. [Quick Start](#quick-start)
5. [Import Guide](#import-guide)
6. [Export Guide](#export-guide)
7. [Mapping Templates](#mapping-templates)
8. [Job History](#job-history)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

The Import/Export module provides comprehensive bulk data management capabilities for the PIM system. It features a modern, intuitive UI with drag-and-drop support, real-time validation, and job tracking.

### Key Features
- 📤 **Import**: Bulk upload products, variants, categories, and attributes
- 📥 **Export**: Download your catalog in CSV or Excel format
- 🗺️ **Smart Mapping**: Auto-detect and map fields intelligently
- ✅ **Validation**: Pre-import validation with detailed error reporting
- 📊 **Job Tracking**: Real-time status updates for all operations
- 📝 **Templates**: Downloadable templates for each data type

---

## Import Features

### Supported File Formats
- **CSV** (.csv)
- **Excel** (.xlsx, .xls)
- **Maximum file size**: 10MB

### Supported Data Types
1. **Products** - Full product catalog with all attributes
2. **Product Variants** - Size, color, and other variations
3. **Categories** - Hierarchical category structure
4. **Attributes** - Product attribute definitions

### Import Process (5 Steps)
1. **Upload** - Drag & drop or browse for file
2. **Preview** - View first 10 rows of your data
3. **Map Fields** - Connect CSV columns to database fields
4. **Validate** - Check for errors before importing
5. **Process** - Execute the import with progress tracking

---

## Export Features

### Export Formats
- **CSV** - Universal compatibility
- **Excel (XLSX)** - Rich formatting support

### Field Selection
- Choose specific fields to include
- Include/exclude related data
- Add media URLs to exports

### Quick Export Templates
- Full Product Catalog
- Inventory Report
- Price List
- Category Tree

---

## Quick Start

### Import Products
1. Navigate to **Import/Export** → **Import** tab
2. Select **"Products"** from dropdown
3. Click **"Download products template"** for reference
4. Drag your CSV file into the upload area
5. Review auto-mapped fields
6. Click **"Validate"**
7. If valid, click **"Start Import"**

### Export Products
1. Navigate to **Import/Export** → **Export** tab
2. Select **"Products"** as export type
3. Choose **CSV** or **Excel** format
4. Select fields to include
5. Click **"Start Export"**
6. Download when complete

---

## Import Guide

### Step 1: Prepare Your Data

#### Products CSV Format
```csv
name,sku,description,price,compareAtPrice,stock,category,brand,weight,dimensions,status
"iPhone 15 Pro","IPHONE-15-PRO","Latest iPhone with A17 Pro chip",999.99,1099.99,50,"Electronics/Phones","Apple",0.187,"146.6x70.6x8.25","active"
"Samsung Galaxy S24","GALAXY-S24","Premium Android smartphone",899.99,999.99,75,"Electronics/Phones","Samsung",0.168,"147x70.6x7.6","active"
```

#### Categories CSV Format
```csv
name,slug,description,parent,order,status
"Electronics","electronics","Electronic products and gadgets",,1,"active"
"Phones","phones","Mobile phones","Electronics",1,"active"
"Laptops","laptops","Laptop computers","Electronics",2,"active"
```

#### Attributes CSV Format
```csv
name,slug,type,options,required,filterable,description
"Screen Size","screen-size","select","5.5 inch,6.1 inch,6.7 inch","false","true","Display screen size"
"Storage","storage","select","128GB,256GB,512GB,1TB","true","true","Storage capacity"
```

### Step 2: Upload Your File

1. **Drag & Drop Method**:
   - Drag your file directly onto the upload zone
   - File is automatically uploaded and processed

2. **Browse Method**:
   - Click the upload zone
   - Select your file from the file browser

### Step 3: Field Mapping

The system automatically maps common fields:
- `name` → Product Name
- `sku` → SKU Code
- `price` → Product Price
- `description` → Product Description
- `stock`, `quantity` → Stock Level
- `category` → Category Path

**Manual Mapping**:
- Use dropdowns to adjust mappings
- Select "-- Skip --" to ignore columns
- Ensure all required fields are mapped

### Step 4: Validation

The validator checks for:
- **Required Fields**: Name, SKU for products
- **Data Types**: Numbers for prices, integers for stock
- **Uniqueness**: SKU must be unique
- **References**: Categories must exist
- **Format**: Valid email, URL formats

**Error Messages**:
```
Row 3: SKU - Duplicate SKU "PROD-001" found
Row 5: Price - Invalid number format "abc"
Row 8: Category - Category "NonExistent" not found
```

### Step 5: Import Processing

- **Progress Tracking**: Real-time updates on import status
- **Batch Processing**: Large files processed in chunks
- **Error Handling**: Skip errors or stop on first error
- **Rollback**: Automatic rollback on critical errors

---

## Export Guide

### Configuring Exports

1. **Select Export Type**:
   - Products
   - Variants
   - Categories
   - Attributes
   - Media

2. **Choose Format**:
   - **CSV**: Best for data transfer
   - **Excel**: Best for reporting

3. **Select Fields**:
   - Use checkboxes to include/exclude fields
   - "Select All" / "Deselect All" buttons available

4. **Additional Options**:
   - ☑️ Include related data (categories, attributes)
   - ☑️ Include media URLs
   - ☑️ Include timestamps

### Export Templates

**Full Product Catalog**:
- All product fields
- Categories and attributes
- Media URLs
- Inventory levels

**Inventory Report**:
- SKU
- Product Name
- Current Stock
- Reserved Stock
- Available Stock

**Price List**:
- SKU
- Product Name
- Regular Price
- Sale Price
- Cost

---

## Mapping Templates

### Creating a Template

1. Go to **Mapping Templates** tab
2. Click **"New Template"**
3. Enter template name
4. Select import type
5. Add field mappings:
   - CSV Column → Database Field
6. Save template

### Using Templates

1. During import, select saved template
2. Mappings automatically applied
3. Adjust if needed
4. Proceed with import

### Default Templates

The system provides default templates for:
- Standard Product Import
- Variant Import
- Category Hierarchy
- Attribute Definitions

---

## Job History

### Viewing Jobs

The Job History tab shows:
- **Status**: Pending, Processing, Completed, Failed
- **Progress**: Records processed / Total records
- **Duration**: Time taken
- **User**: Who initiated the job
- **Actions**: Download, Cancel, View Details

### Job Status

- 🟡 **Pending**: Job queued for processing
- 🔵 **Processing**: Currently running
- 🟢 **Completed**: Successfully finished
- 🔴 **Failed**: Errors occurred
- ⚫ **Cancelled**: Manually stopped

### Filtering Jobs

- Filter by type: Import/Export
- Filter by status
- Search by filename
- Date range filters

---

## Troubleshooting

### Common Import Issues

**"File too large"**
- Solution: Split file into smaller chunks (< 10MB)
- Use batch imports for large datasets

**"Invalid file format"**
- Solution: Save as CSV or XLSX
- Remove special characters from headers
- Ensure UTF-8 encoding

**"Validation errors"**
- Solution: Review error list
- Fix data in source file
- Re-upload corrected file

**"SKU already exists"**
- Solution: Use unique SKUs
- Enable "Update Existing" option
- Remove duplicates from file

### Common Export Issues

**"Export taking too long"**
- Large datasets may take several minutes
- Check Job History for status
- System processes in background

**"Cannot download export"**
- Check if job completed successfully
- Exports expire after 7 days
- Regenerate if needed

### Template Download Issues

**"Template downloads as JSON"**
- Clear browser cache
- Try different browser
- Use direct download link

---

## API Reference

### Import Endpoints

```bash
# Create import job
POST /api/import-export/import
Content-Type: multipart/form-data
- file: [binary]
- type: "products"
- mapping: {"name": "name", "sku": "sku"}

# Preview import
POST /api/import-export/import/preview
- file: [binary]
- type: "products"
- rows: 10

# Validate import
POST /api/import-export/import/validate
- file: [binary]
- type: "products"
- mapping: {}

# Get import jobs
GET /api/import-export/import/jobs
```

### Export Endpoints

```bash
# Create export job
POST /api/import-export/export
{
  "type": "products",
  "format": "csv",
  "fields": ["name", "sku", "price"]
}

# Download export
GET /api/import-export/export/download/{jobId}

# Get export jobs
GET /api/import-export/export/jobs
```

### Template Endpoints

```bash
# Download template
GET /api/import-export/templates/download?type=products&format=csv

# Get mapping templates
GET /api/import-export/mappings

# Create mapping template
POST /api/import-export/mappings
{
  "name": "My Template",
  "type": "products",
  "mapping": {}
}
```

---

## Best Practices

### For Imports
1. Always validate before importing
2. Start with small test files
3. Use templates for consistency
4. Keep backups before bulk imports
5. Monitor job progress

### For Exports
1. Export regularly for backups
2. Use filters to limit data size
3. Choose appropriate format
4. Document export configurations
5. Set up automated exports (coming soon)

### Performance Tips
- Import during off-peak hours
- Split large files (> 10,000 rows)
- Use batch processing for updates
- Optimize images before importing URLs

---

## Support

For additional help:
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [API Documentation](./API_STANDARDIZATION_QUICK_REFERENCE.md)
- Contact system administrator

---

**Import/Export Module** - Part of PIM System v2.1.0
