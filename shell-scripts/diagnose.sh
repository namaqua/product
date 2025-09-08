#!/bin/bash

# Diagnose the database schema issue

echo "🔍 Diagnosing Database Schema Issue"
echo "===================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product/pim

# 1. Check TypeORM synchronize setting
echo -e "${YELLOW}1. Checking TypeORM configuration...${NC}"
grep -n "synchronize" src/config/database.config.ts
echo ""

# 2. Check if Product entity has name field
echo -e "${YELLOW}2. Checking Product entity for 'name' field...${NC}"
if grep -q "name:" src/modules/products/entities/product.entity.ts; then
    echo -e "${RED}Found 'name' field in Product entity!${NC}"
    grep -n "name:" src/modules/products/entities/product.entity.ts
else
    echo -e "${GREEN}✓ No 'name' field in Product entity (correct)${NC}"
fi
echo ""

# 3. Check database tables
echo -e "${YELLOW}3. Current database tables:${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>/dev/null

# 4. Check products table structure
echo -e "\n${YELLOW}4. Products table columns:${NC}"
psql -U pim_user -d pim_dev -h localhost -c "\d products" 2>/dev/null | head -30

# 5. Check if name column exists
HAS_NAME=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name';" 2>/dev/null | tr -d ' ')

if [ ! -z "$HAS_NAME" ]; then
    echo -e "\n${RED}⚠ PROBLEM FOUND: Products table has 'name' column!${NC}"
    echo "This shouldn't exist - names should be in product_locales table"
else
    echo -e "\n${GREEN}✓ Products table structure is correct${NC}"
fi

# 6. Check product_locales table
echo -e "\n${YELLOW}5. Product_locales table columns:${NC}"
psql -U pim_user -d pim_dev -h localhost -c "\d product_locales" 2>/dev/null | head -20

unset PGPASSWORD

# 7. Check if there's a base entity issue
echo -e "\n${YELLOW}6. Checking BaseEntity...${NC}"
if [ -f "src/common/entities/base.entity.ts" ]; then
    grep -n "name" src/common/entities/base.entity.ts 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}Found 'name' references in BaseEntity${NC}"
    else
        echo -e "${GREEN}✓ No 'name' in BaseEntity${NC}"
    fi
fi

# 8. Check User entity (it might extend something with name)
echo -e "\n${YELLOW}7. Checking if User entity affects Product...${NC}"
grep -n "extends" src/modules/products/entities/product.entity.ts

echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}Diagnosis Complete${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Solutions:"
echo "1. If products table has 'name' column:"
echo "   Run: ./complete-reset.sh"
echo ""
echo "2. If TypeORM synchronize is false:"
echo "   Edit src/config/database.config.ts"
echo "   Set: synchronize: true (for development)"
echo ""
echo "3. Force rebuild:"
echo "   rm -rf dist/ node_modules/"
echo "   npm install"
echo "   npm run build"
