#!/bin/bash

# Check database schema

echo "🔍 Checking Database Schema"
echo "==========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

export PGPASSWORD='secure_password_change_me'

echo -e "${YELLOW}1. Tables in database:${NC}"
psql -U pim_user -d pim_dev -h localhost -c "\dt"

echo -e "\n${YELLOW}2. Products table columns:${NC}"
psql -U pim_user -d pim_dev -h localhost -c "\d products" 2>/dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}Products table doesn't exist${NC}"
else
    echo -e "\n${YELLOW}3. Checking for 'name' column in products:${NC}"
    psql -U pim_user -d pim_dev -h localhost -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name';"
    
    if [ $? -eq 0 ]; then
        echo -e "${RED}⚠ Found 'name' column in products table - this shouldn't be there!${NC}"
        echo -e "${YELLOW}The 'name' should be in product_locales table for multi-language support${NC}"
    fi
fi

echo -e "\n${YELLOW}4. Product_locales table columns:${NC}"
psql -U pim_user -d pim_dev -h localhost -c "\d product_locales" 2>/dev/null

unset PGPASSWORD

echo -e "\n${BLUE}================================${NC}"
echo -e "${BLUE}Schema Check Complete${NC}"
echo -e "${BLUE}================================${NC}"
