# PIM Setup Scripts

This folder contains shell scripts to setup the database for PIM's advanced product features.

## 📋 Available Scripts

### 1. `setup-pim-complete.sh` (Main Script)
**Purpose**: Interactive menu to setup variants, bundles, or both  
**Usage**: `./setup-pim-complete.sh`

This is the recommended starting point. It provides an interactive menu to:
- Setup variant fields only
- Setup bundle tables only  
- Setup both (complete installation)

### 2. `setup-variant-fields.sh`
**Purpose**: Adds variant fields to products table for size/color variations  
**Usage**: `./setup-variant-fields.sh`

Adds these fields to the products table:
- `variantAxes` (JSONB): Stores values like `{color: "red", size: "L"}`
- `variantAttributes` (JSONB): Lists which attributes can vary
- `inheritedAttributes` (BOOLEAN): Whether to inherit from parent
- `variantGroupId` (VARCHAR): Groups variants together

### 3. `setup-bundle-tables.sh`
**Purpose**: Creates tables for configurable products (component-based)  
**Usage**: `./setup-bundle-tables.sh [OPTIONS]`

Creates 4 new tables:
- `product_bundles`: Bundle configurations
- `bundle_component_groups`: Component categories (Processor, RAM, etc.)
- `bundle_components`: Products in each group
- `bundle_configurations`: Saved customer configurations

Options:
- `-d, --database`: Database name (default: pim_db)
- `-u, --user`: Database user (default: postgres)  
- `-p, --port`: Database port (default: 5433)
- `-t, --test-data`: Create test data
- `--drop`: Drop existing tables before creating

## 🚀 Quick Start

### First Time Setup (Recommended)
```bash
# Make all scripts executable
chmod +x *.sh

# Run the complete setup
./setup-pim-complete.sh

# Choose option 3 for complete setup
```

### Individual Setup
```bash
# Just variants
./setup-variant-fields.sh

# Just bundles with test data
./setup-bundle-tables.sh --test-data
```

## 🔧 Environment Variables

You can set these before running any script:
```bash
export DB_NAME="pim_db"
export DB_USER="postgres"
export DB_PASSWORD="your_password"
export DB_HOST="localhost"
export DB_PORT="5433"
```

## 📊 What Gets Created

### Variant System
- Extends existing `products` table
- Adds 4 new columns
- Creates validation triggers
- Enables products like: T-Shirt → Red/Small, Blue/Large

### Bundle System  
- Creates 4 new tables
- Adds indexes for performance
- Sets up auto-update triggers
- Enables products like: Computer → CPU + RAM + Storage

## 🧪 Test Data

The bundle setup script can create sample data:
- **Product**: Custom Desktop PC
- **Components**:
  - Processor: AMD Ryzen 5, Intel i5
  - Memory: 16GB DDR4
  - Storage: 512GB SSD

## ✅ Verification

After running, verify your setup:

### Check Variant Fields
```sql
\d products
-- Should show: variantAxes, variantAttributes, inheritedAttributes, variantGroupId
```

### Check Bundle Tables
```sql
\dt *bundle*
-- Should show: product_bundles, bundle_component_groups, bundle_components, bundle_configurations
```

## 🔍 Troubleshooting

### Permission Denied
```bash
chmod +x setup-pim-complete.sh
```

### Database Connection Failed
```bash
# Check Docker is running
docker ps | grep postgres

# Test connection
psql -h localhost -p 5433 -U postgres -d pim_db
```

### Scripts Not Found
Ensure you're in the correct directory:
```bash
cd /Users/colinroets/dev/projects/product/docs/scripts
```

## 📚 After Setup

1. **Update Entity Files**
   - Add new fields to Product entity
   - Add BUNDLE to ProductType enum

2. **Copy Module Files**
   - Copy bundle module to `engines/src/modules/bundles/`

3. **Register Module**
   - Add BundlesModule to app.module.ts

4. **Restart Server**
   ```bash
   cd ../../engines
   npm run start:dev
   ```

5. **Test APIs**
   - Variants: `GET /products/:id/variants`
   - Bundles: `GET /products/:id/bundle`

## 🎯 Use Cases

### When to Use Variants
- Same product with variations
- Examples: Clothing sizes, book formats, phone colors
- Single parent product with attribute variations

### When to Use Bundles
- Products built from other products
- Examples: Computers, gift baskets, furniture sets
- Multiple products combined into one

## 📝 Notes

- Scripts are idempotent (safe to run multiple times)
- Use `--drop` flag carefully in production
- Always backup your database before major changes
- Default port 5433 assumes Docker PostgreSQL