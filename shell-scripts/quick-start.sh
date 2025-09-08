#!/bin/bash

# Quick start script with error checking

echo "🚀 Starting Product Module..."
echo "============================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product/pim

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Test build first
echo -e "\n${YELLOW}Testing TypeScript compilation...${NC}"
npm run build 2>&1 | grep -E "error TS" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${RED}TypeScript errors detected. Running full build to show errors:${NC}"
    npm run build
    echo ""
    echo -e "${YELLOW}Please fix the TypeScript errors above before starting the server.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ TypeScript compiles successfully${NC}"
fi

# Check database
echo -e "\n${YELLOW}Checking database...${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connected${NC}"
else
    echo -e "${YELLOW}⚠ Database not connected (will try to continue)${NC}"
fi
unset PGPASSWORD

echo ""
echo -e "${GREEN}============================${NC}"
echo -e "${GREEN}Starting server...${NC}"
echo -e "${GREEN}============================${NC}"
echo ""
echo "📍 Server: http://localhost:3010"
echo "🔍 Health: http://localhost:3010/health"
echo "📚 API: http://localhost:3010/api/v1/products"
echo ""
echo -e "${BLUE}TypeORM will auto-create tables on first run${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

npm run start:dev
