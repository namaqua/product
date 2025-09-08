#!/bin/bash

# Fix database schema and seed data

echo "🔧 Fix Database Schema & Seed Data"
echo "==================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product/pim

echo -e "${YELLOW}The products table has an incorrect schema.${NC}"
echo "It has a 'name' column that shouldn't exist."
echo "Product names should be in the product_locales table for multi-language support."
echo ""
echo "This script will:"
echo "  1. Drop all tables"
echo "  2. Let TypeORM recreate them with correct schema"
echo "  3. Seed with sample data"
echo ""
echo -e "${RED}WARNING: This will delete any existing data!${NC}"
echo "Continue? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

# Step 1: Drop all tables
echo -e "\n${YELLOW}Step 1: Dropping all tables...${NC}"
export PGPASSWORD='secure_password_change_me'

psql -U pim_user -d pim_dev -h localhost << EOF
-- Drop all tables
DO \$\$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END \$\$;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All tables dropped${NC}"
else
    echo -e "${RED}✗ Failed to drop tables${NC}"
    exit 1
fi

# Check tables are gone
TABLE_COUNT=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
echo -e "${BLUE}Tables remaining: $TABLE_COUNT${NC}"

unset PGPASSWORD

# Step 2: Start server to create tables
echo -e "\n${YELLOW}Step 2: Starting server to create tables...${NC}"
echo "Server will start and create tables. It will be stopped automatically after 15 seconds."

# Start server in background and capture output
npm run start:dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start and create tables
echo -n "Creating tables"
for i in {1..15}; do
    echo -n "."
    sleep 1
done
echo ""

# Stop the server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

# Check if tables were created
export PGPASSWORD='secure_password_change_me'
TABLE_COUNT=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
echo -e "${GREEN}✓ Tables created: $TABLE_COUNT${NC}"

# Verify products table doesn't have name column
HAS_NAME=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name';" 2>/dev/null | tr -d ' ')

if [ "$HAS_NAME" -eq "0" ]; then
    echo -e "${GREEN}✓ Products table schema is correct (no 'name' column)${NC}"
else
    echo -e "${RED}✗ Products table still has 'name' column!${NC}"
    echo "Checking Product entity..."
    
    # Show the actual columns
    echo -e "\n${YELLOW}Products table columns:${NC}"
    psql -U pim_user -d pim_dev -h localhost -c "\d products" | grep -E "Column|name"
fi

unset PGPASSWORD

# Step 3: Seed the database
echo -e "\n${YELLOW}Step 3: Seeding database...${NC}"
npm run seed

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Database fixed and seeded successfully!${NC}"
    
    # Check product count
    export PGPASSWORD='secure_password_change_me'
    PRODUCT_COUNT=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d ' ')
    echo -e "${BLUE}Products in database: $PRODUCT_COUNT${NC}"
    unset PGPASSWORD
else
    echo -e "\n${RED}✗ Seeding failed${NC}"
    echo "Check the error messages above"
    
    # Show recent server log
    echo -e "\n${YELLOW}Recent server log:${NC}"
    tail -20 server.log | grep -E "error|Error|WARNING"
fi

# Cleanup
rm -f server.log

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Process Complete${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the server: npm run start:dev"
echo "2. Test the API: cd ../shell-scripts && ./test-products.sh"
