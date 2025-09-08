#!/bin/bash

# Check what tables TypeORM has already created

echo "========================================="
echo "Checking Existing Database Tables"
echo "========================================="
echo ""

# Check tables in the database
echo "Tables in pim_dev database:"
echo "--------------------------"
PGPASSWORD=secure_password_change_me psql -U pim_user -d pim_dev -h localhost -c "\dt" 2>/dev/null

echo ""
echo "Products table structure:"
echo "------------------------"
PGPASSWORD=secure_password_change_me psql -U pim_user -d pim_dev -h localhost -c "\d products" 2>/dev/null

echo ""
echo "========================================="
echo "What happened?"
echo "========================================="
echo ""
echo "TypeORM automatically created tables because:"
echo "- synchronize: true is set in development mode"
echo "- This auto-syncs entities with the database"
echo ""
echo "This is fine for development! In production:"
echo "- Set synchronize: false"
echo "- Use migrations for schema changes"
echo ""
echo "To create a migration for production later:"
echo "1. Set synchronize: false in database.config.ts"
echo "2. Drop and recreate the database"
echo "3. Generate migration"
echo "4. Run migration"
