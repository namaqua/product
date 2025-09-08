#!/bin/bash

# Alternative fix - manually correct the schema

echo "🔧 Manual Schema Fix"
echo "===================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}This will try to fix the schema without deleting data${NC}"
echo ""

# Check current schema
echo -e "${YELLOW}1. Current products table structure:${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "\d products" 2>/dev/null | grep name

# Check if name column exists
HAS_NAME=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name';" 2>/dev/null | tr -d ' ')

if [ "$HAS_NAME" -gt "0" ]; then
    echo -e "\n${RED}Found 'name' column in products table${NC}"
    echo -e "${YELLOW}Removing it...${NC}"
    
    # Drop the name column
    psql -U pim_user -d pim_dev -h localhost << EOF
ALTER TABLE products DROP COLUMN IF EXISTS name CASCADE;
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Removed 'name' column${NC}"
    else
        echo -e "${RED}Failed to remove column${NC}"
    fi
else
    echo -e "${GREEN}✓ No 'name' column found (good!)${NC}"
fi

# Check for other incorrect columns
echo -e "\n${YELLOW}2. Checking for other issues...${NC}"

# List all columns
echo "Products table columns:"
psql -U pim_user -d pim_dev -h localhost -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;" 2>/dev/null

unset PGPASSWORD

# Now try seeding again
echo -e "\n${YELLOW}3. Trying to seed...${NC}"
cd /Users/colinroets/dev/projects/product/pim
npm run seed

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Fixed and seeded successfully!${NC}"
else
    echo -e "\n${RED}Still failing. Need complete reset:${NC}"
    echo "Run: ./simple-fix.sh"
fi
