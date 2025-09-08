#!/bin/bash

# Complete setup and start script for Product Module

echo "🚀 Product Module - Complete Setup & Start"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Navigate to backend directory
echo -e "${BLUE}Navigating to backend directory...${NC}"
cd /Users/colinroets/dev/projects/product/pim

if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Backend directory not found${NC}"
    echo "Expected: /Users/colinroets/dev/projects/product/pim"
    exit 1
fi

echo -e "${GREEN}✓ In backend directory${NC}"

# 1. Install dependencies
echo -e "\n${YELLOW}1. Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# 2. Test TypeScript compilation
echo -e "\n${YELLOW}2. Testing TypeScript compilation...${NC}"
npm run build > build.log 2>&1
if grep -q "error TS" build.log; then
    echo -e "${RED}✗ TypeScript errors found:${NC}"
    grep "error TS" build.log | head -5
    rm build.log
    echo ""
    echo "Please fix TypeScript errors before continuing"
    exit 1
else
    echo -e "${GREEN}✓ TypeScript compiles successfully${NC}"
    rm -f build.log
fi

# 3. Check database
echo -e "\n${YELLOW}3. Checking database connection...${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "SELECT 'Database connected' as status;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connected${NC}"
    
    # Check if tables exist
    TABLE_COUNT=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    echo -e "${BLUE}Tables in database: $TABLE_COUNT${NC}"
    
    if [ "$TABLE_COUNT" -lt "5" ]; then
        echo -e "${YELLOW}Tables will be auto-created when server starts${NC}"
    fi
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo ""
    echo "To create the database:"
    echo "  psql -U postgres"
    echo "  CREATE DATABASE pim_dev;"
    echo "  CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';"
    echo "  GRANT ALL ON DATABASE pim_dev TO pim_user;"
    echo "  \\q"
    exit 1
fi
unset PGPASSWORD

# 4. Ask about seeding
echo -e "\n${YELLOW}4. Database Seeding${NC}"
echo "Would you like to seed the database with sample products? (y/n)"
read -r SEED_CHOICE

if [ "$SEED_CHOICE" = "y" ] || [ "$SEED_CHOICE" = "Y" ]; then
    echo -e "${BLUE}Seeding database...${NC}"
    npm run seed 2>&1 | tee seed.log
    if grep -q "completed!" seed.log; then
        echo -e "${GREEN}✓ Database seeded with sample products${NC}"
    else
        echo -e "${YELLOW}⚠ Seeding may have failed or data already exists${NC}"
    fi
    rm -f seed.log
else
    echo -e "${BLUE}Skipping seed (you can run 'npm run seed' later)${NC}"
fi

# 5. Start the server
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete! Starting server...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 Server: http://localhost:3010"
echo "🔍 Health: http://localhost:3010/health"
echo "📚 API: http://localhost:3010/api/v1/products"
echo ""
echo "📧 Admin: admin@example.com / Admin123!"
echo ""
echo -e "${BLUE}TypeORM will auto-create/update tables${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the development server
npm run start:dev
