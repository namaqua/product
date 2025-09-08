#!/bin/bash

# Troubleshooting script for Product Module

echo "🔍 Product Module Troubleshooting"
echo "================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check status
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# 1. Check Node.js
echo -e "\n${YELLOW}1. Checking Node.js...${NC}"
node --version > /dev/null 2>&1
check_status $? "Node.js installed: $(node --version 2>/dev/null || echo 'Not found')"

# 2. Check npm
echo -e "\n${YELLOW}2. Checking npm...${NC}"
npm --version > /dev/null 2>&1
check_status $? "npm installed: $(npm --version 2>/dev/null || echo 'Not found')"

# 3. Check PostgreSQL
echo -e "\n${YELLOW}3. Checking PostgreSQL...${NC}"
pg_config --version > /dev/null 2>&1
check_status $? "PostgreSQL installed: $(pg_config --version 2>/dev/null || echo 'Not found')"

# 4. Check database connection
echo -e "\n${YELLOW}4. Testing database connection...${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "SELECT version();" > /dev/null 2>&1
check_status $? "Database connection"

# Check if tables exist
if [ $? -eq 0 ]; then
    echo -e "\n${YELLOW}5. Checking database tables...${NC}"
    TABLES=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    echo -e "${BLUE}Tables in database: $TABLES${NC}"
    
    # List tables
    echo -e "\n${YELLOW}Existing tables:${NC}"
    psql -U pim_user -d pim_dev -h localhost -c "\dt"
fi
unset PGPASSWORD

# 5. Check project files
echo -e "\n${YELLOW}6. Checking project files...${NC}"
cd /Users/colinroets/dev/projects/product/pim

[ -f "package.json" ] && check_status 0 "package.json exists" || check_status 1 "package.json missing"
[ -f ".env" ] && check_status 0 ".env exists" || check_status 1 ".env missing"
[ -d "node_modules" ] && check_status 0 "node_modules exists" || check_status 1 "node_modules missing"
[ -d "src/modules/products" ] && check_status 0 "Product module exists" || check_status 1 "Product module missing"

# 6. Check TypeScript compilation
echo -e "\n${YELLOW}7. Checking TypeScript compilation...${NC}"
if [ -d "node_modules" ]; then
    npm run build > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        check_status 0 "TypeScript compiles successfully"
    else
        check_status 1 "TypeScript compilation errors"
        echo -e "${YELLOW}Run 'npm run build' to see specific errors${NC}"
    fi
else
    echo -e "${YELLOW}Cannot check - dependencies not installed${NC}"
fi

# 7. Check ports
echo -e "\n${YELLOW}8. Checking port availability...${NC}"
lsof -i :3010 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_status 1 "Port 3010 is in use"
    echo -e "${YELLOW}Process using port 3010:${NC}"
    lsof -i :3010
else
    check_status 0 "Port 3010 is available"
fi

# Summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Troubleshooting Complete${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Common fixes:${NC}"
echo "1. If dependencies missing: npm install"
echo "2. If database not connected: Check PostgreSQL is running"
echo "3. If port in use: Kill the process or use a different port"
echo "4. If TypeScript errors: npm run build to see details"
echo ""
echo -e "${YELLOW}To start fresh:${NC}"
echo "1. cd /Users/colinroets/dev/projects/product/pim"
echo "2. rm -rf node_modules dist"
echo "3. npm install"
echo "4. npm run build"
echo "5. npm run start:dev"
