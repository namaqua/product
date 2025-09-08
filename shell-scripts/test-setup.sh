#!/bin/bash

# Simple test to verify Product Module is working

echo "🧪 Testing Product Module Setup"
echo "==============================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product/pim

# 1. Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --silent
fi

# 2. Build the project
echo -e "\n${YELLOW}Building project...${NC}"
npm run build 2>&1 | grep -E "error|Error" | head -5
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}Build has errors. Checking...${NC}"
fi

# 3. Test database connection
echo -e "\n${YELLOW}Testing database connection...${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "SELECT 'Connected to database' as status;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connected${NC}"
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
    echo "Run this to create the database:"
    echo "  psql -U postgres"
    echo "  CREATE DATABASE pim_dev;"
    echo "  CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';"
    echo "  GRANT ALL ON DATABASE pim_dev TO pim_user;"
fi
unset PGPASSWORD

echo -e "\n${GREEN}==============================${NC}"
echo -e "${GREEN}Test Complete${NC}"
echo -e "${GREEN}==============================${NC}"
echo ""
echo "To start the server:"
echo "  npm run start:dev"
echo ""
echo "The server will:"
echo "  1. Auto-create tables from entities (TypeORM synchronize)"
echo "  2. Start on http://localhost:3010"
echo "  3. Provide health check at /health"
