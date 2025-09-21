# PIM Database Shell Scripts

This directory contains shell scripts for managing the PIM PostgreSQL database running in Docker.

## Quick Start

First, make all scripts executable:
```bash
chmod +x *.sh
```

## Available Scripts

### 1. `check-db-status.sh`
Check database connectivity and display current data status.

```bash
./check-db-status.sh
```

**Features:**
- Verifies Docker and PostgreSQL container status
- Shows table counts and statistics
- Displays product and category summaries
- Checks API availability

### 2. `populate-products.sh`
Populate the database with sample product data.

```bash
# Populate with sample data
./populate-products.sh

# Remove all sample products
./populate-products.sh clean

# Show current statistics
./populate-products.sh summary

# Show help
./populate-products.sh help
```

**Creates:**
- Categories (Electronics, Clothing, Home & Garden with subcategories)
- Products (Laptops, Smartphones, Clothing, Furniture, Kitchen items)
- Product variants (iPhone colors/storage, T-shirt sizes/colors)
- Product-category relationships

### 3. `db-backup.sh`
Comprehensive backup and restore management.

```bash
# Create a manual backup
./db-backup.sh backup

# Create a named backup
./db-backup.sh backup pre-deployment

# List all backups
./db-backup.sh list

# Restore from specific backup
./db-backup.sh restore 20241219_143022

# Clean old backups (older than 30 days)
./db-backup.sh clean

# Show backup statistics
./db-backup.sh stats

# Setup automatic daily backups
./db-backup.sh auto
```

## Database Connection Details

- **Container:** postgres-pim
- **Database:** pim_dev
- **User:** pim_user
- **Password:** secure_password_change_me
- **Port:** 5433 (host) / 5432 (container)

## Typical Workflow

### Initial Setup
```bash
# 1. Check database status
./check-db-status.sh

# 2. If empty, populate with sample data
./populate-products.sh

# 3. Verify data was created
./check-db-status.sh
```

### Before Deployment
```bash
# 1. Create a backup
./db-backup.sh backup pre-deploy

# 2. Run your deployment

# 3. If issues, restore from backup
./db-backup.sh restore [timestamp]
```

### Daily Maintenance
```bash
# Setup automatic backups (one time)
./db-backup.sh auto

# Check backup status
./db-backup.sh stats

# Clean old backups monthly
./db-backup.sh clean 30
```

## Sample Data Created

The `populate-products.sh` script creates:

### Categories (Hierarchical)
```
Electronics
├── Computers
│   ├── Laptops
│   └── Desktops
└── Mobile Devices
    ├── Smartphones
    └── Tablets

Clothing
├── Men's Clothing
│   └── Men's Shirts
└── Women's Clothing
    ├── Women's Dresses
    └── Women's Tops

Home & Garden
├── Furniture
│   └── Living Room
└── Kitchen
    └── Appliances
```

### Products
1. **Dell XPS 13 Laptop** (LAPTOP-001) - $1,299.99
2. **MacBook Pro 14"** (LAPTOP-002) - $1,999.00 (on sale: $1,899.00)
3. **iPhone 15 Pro** (PHONE-001) - Configurable product with variants:
   - Black Titanium 128GB/256GB
   - White Titanium 128GB/256GB
4. **Classic Cotton T-Shirt** (SHIRT-001) - Configurable with size/color variants
5. **Modern 3-Seater Sofa** (SOFA-001) - $899.99
6. **Espresso Coffee Machine** (COFFEE-001) - $349.99 (on sale: $299.99)

## Troubleshooting

### Docker not running
```bash
# Start Docker Desktop on Mac
open -a Docker
```

### Container not running
```bash
cd /Users/colinroets/dev/projects/product
docker-compose up -d postgres-pim
```

### Database connection issues
```bash
# Check container logs
docker logs postgres-pim

# Restart container
docker-compose restart postgres-pim
```

### Permission denied errors
```bash
# Make scripts executable
chmod +x *.sh
```

## Notes

- All scripts use the Docker PostgreSQL container, not a local PostgreSQL installation
- Backups are stored in `/Users/colinroets/dev/projects/product/backups/database/`
- Scripts are designed to be safe with confirmation prompts for destructive operations
- The populate script is idempotent - it won't create duplicate data if run multiple times

## Support

If you encounter issues:
1. Check Docker is running: `docker ps`
2. Check container status: `docker ps | grep postgres-pim`
3. Review container logs: `docker logs postgres-pim`
4. Verify database connection: `./check-db-status.sh`

---
Created: December 2024
Location: `/Users/colinroets/dev/projects/product/shell-scripts/`
