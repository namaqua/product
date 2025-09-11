#!/bin/bash

# ===========================================================================
# CHECK DATABASE SCHEMA - Diagnostic Tool
# ===========================================================================
# This script checks the current database schema for issues
# ===========================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Database configuration
DB_NAME="pim_dev"
DB_USER="pim_user"
DB_PASSWORD="secure_password_change_me"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE} DATABASE SCHEMA CHECKER                          ${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""

# Function to run psql query
run_query() {
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "$1" 2>/dev/null || echo "ERROR"
}

# Check if database exists
echo -e "${YELLOW}1. Checking database connection...${NC}"
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -l | grep $DB_NAME | wc -l)

if [ "$DB_EXISTS" -gt 0 ]; then
    echo -e "${GREEN}✓ Database '$DB_NAME' exists${NC}"
else
    echo -e "${RED}✗ Database '$DB_NAME' does not exist${NC}"
    echo "Run: createdb -U $DB_USER $DB_NAME"
    exit 1
fi

# List all tables
echo ""
echo -e "${YELLOW}2. Tables in database:${NC}"
TABLES=$(run_query "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;")
echo "$TABLES" | sed 's/^/  - /'

# Check products table structure
echo ""
echo -e "${YELLOW}3. Products table schema:${NC}"
PRODUCTS_SCHEMA=$(run_query "
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
")

if [ "$PRODUCTS_SCHEMA" = "ERROR" ]; then
    echo -e "${RED}✗ Products table does not exist${NC}"
else
    echo "$PRODUCTS_SCHEMA" | column -t -s '|' | sed 's/^/  /'
    
    # Check for problematic 'name' column
    if echo "$PRODUCTS_SCHEMA" | grep -q "name"; then
        echo ""
        echo -e "${RED}⚠️  PROBLEM DETECTED: 'name' column exists in products table!${NC}"
        echo -e "${YELLOW}This should be in product_locales table instead.${NC}"
        PROBLEM_FOUND=true
    else
        echo -e "${GREEN}✓ Good: No 'name' column in products table${NC}"
    fi
fi

# Check product_locales table structure
echo ""
echo -e "${YELLOW}4. Product_locales table schema:${NC}"
LOCALES_SCHEMA=$(run_query "
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_locales' 
ORDER BY ordinal_position;
")

if [ "$LOCALES_SCHEMA" = "ERROR" ]; then
    echo -e "${RED}✗ Product_locales table does not exist${NC}"
    PROBLEM_FOUND=true
else
    echo "$LOCALES_SCHEMA" | column -t -s '|' | sed 's/^/  /'
    
    if echo "$LOCALES_SCHEMA" | grep -q "name"; then
        echo -e "${GREEN}✓ Good: 'name' column exists in product_locales table${NC}"
    else
        echo -e "${RED}⚠️  PROBLEM: 'name' column missing from product_locales table${NC}"
        PROBLEM_FOUND=true
    fi
fi

# Check for data
echo ""
echo -e "${YELLOW}5. Data counts:${NC}"
for table in products product_locales product_media product_attributes users; do
    COUNT=$(run_query "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "0")
    printf "  %-20s: %s\n" "$table" "$COUNT"
done

# Check for version column in products
echo ""
echo -e "${YELLOW}6. Checking for version column in products table:${NC}"
VERSION_EXISTS=$(run_query "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'version';")
if [ -n "$VERSION_EXISTS" ] && [ "$VERSION_EXISTS" != "ERROR" ]; then
    echo -e "${GREEN}✓ Version column exists${NC}"
else
    echo -e "${YELLOW}⚠️  Version column missing (might be added by seeder)${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE} DIAGNOSIS SUMMARY                                ${NC}"
echo -e "${BLUE}===================================================${NC}"

if [ "$PROBLEM_FOUND" = true ]; then
    echo -e "${RED}❌ SCHEMA PROBLEMS DETECTED${NC}"
    echo ""
    echo "To fix, run:"
    echo -e "${YELLOW}  ./fix-database-schema.sh${NC}"
    echo ""
    echo "This will:"
    echo "  1. Drop and recreate the database"
    echo "  2. Let TypeORM create correct tables"
    echo "  3. Seed with sample data"
else
    echo -e "${GREEN}✅ Schema looks correct!${NC}"
    echo ""
    echo "If you're still having issues, check:"
    echo "  1. Backend logs: cd engines && npm run start:dev"
    echo "  2. Try seeding: cd engines && npm run seed"
fi

echo ""
