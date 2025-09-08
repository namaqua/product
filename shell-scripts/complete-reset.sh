#!/bin/bash

# Complete database reset and fix

echo "🔧 Complete Database Reset"
echo "=========================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product/pim

echo -e "${YELLOW}This will completely reset your database to fix schema issues.${NC}"
echo -e "${RED}All data will be lost!${NC}"
echo ""
echo "Continue? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

# Step 1: Stop any running servers
echo -e "\n${YELLOW}Step 1: Stopping any running Node processes...${NC}"
pkill -f "node.*pim" 2>/dev/null
sleep 2

# Step 2: Drop and recreate database
echo -e "\n${YELLOW}Step 2: Recreating database...${NC}"

# Try with postgres user first
export PGPASSWORD='postgres'
psql -U postgres -h localhost << EOF 2>/dev/null
DROP DATABASE IF EXISTS pim_dev;
CREATE DATABASE pim_dev;
CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
\q
EOF

if [ $? -ne 0 ]; then
    # Try without password
    psql -U postgres -h localhost << EOF
DROP DATABASE IF EXISTS pim_dev;
CREATE DATABASE pim_dev;
CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
\q
EOF
fi

unset PGPASSWORD

echo -e "${GREEN}✓ Database recreated${NC}"

# Step 3: Clear any TypeORM cache
echo -e "\n${YELLOW}Step 3: Clearing cache...${NC}"
rm -rf dist/
rm -rf node_modules/.cache 2>/dev/null
echo -e "${GREEN}✓ Cache cleared${NC}"

# Step 4: Rebuild the project
echo -e "\n${YELLOW}Step 4: Rebuilding project...${NC}"
npm run build > build.log 2>&1

if grep -q "error TS" build.log; then
    echo -e "${RED}✗ Build errors found:${NC}"
    grep "error TS" build.log | head -5
    rm build.log
    exit 1
else
    echo -e "${GREEN}✓ Project built successfully${NC}"
    rm -f build.log
fi

# Step 5: Start server to create tables with correct schema
echo -e "\n${YELLOW}Step 5: Creating database tables...${NC}"
echo "Starting server to create tables (20 seconds)..."

# Start server in background
npm run start:dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for tables to be created
for i in {1..20}; do
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

if [ "$TABLE_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✓ $TABLE_COUNT tables created${NC}"
    
    # List the tables
    echo -e "\n${BLUE}Tables created:${NC}"
    psql -U pim_user -d pim_dev -h localhost -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>/dev/null
else
    echo -e "${RED}✗ No tables created${NC}"
    echo "Check server.log for errors"
    cat server.log | grep -E "error|Error" | head -10
    exit 1
fi

# Verify products table structure
echo -e "\n${YELLOW}Step 6: Verifying table structure...${NC}"
HAS_NAME=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name';" 2>/dev/null | tr -d ' ')

if [ "$HAS_NAME" -eq "0" ]; then
    echo -e "${GREEN}✓ Products table is correct (no 'name' column)${NC}"
else
    echo -e "${RED}✗ Products table still has 'name' column${NC}"
    echo "There may be an issue with the entity definition"
fi

unset PGPASSWORD

# Step 7: Seed the database
echo -e "\n${YELLOW}Step 7: Seeding database with sample data...${NC}"
npm run seed 2>&1 | tee seed.log

if grep -q "Seeding completed" seed.log || grep -q "already exists" seed.log; then
    echo -e "\n${GREEN}✅ Database setup complete!${NC}"
    
    # Check data
    export PGPASSWORD='secure_password_change_me'
    PRODUCT_COUNT=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d ' ')
    USER_COUNT=$(psql -U pim_user -d pim_dev -h localhost -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
    
    echo -e "${BLUE}Data seeded:${NC}"
    echo "  • Products: $PRODUCT_COUNT"
    echo "  • Users: $USER_COUNT"
    unset PGPASSWORD
else
    echo -e "\n${RED}✗ Seeding may have failed${NC}"
    echo "Error details:"
    grep -E "error|Error" seed.log | head -10
fi

# Cleanup
rm -f server.log seed.log

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Database Reset Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start the server:"
echo "   npm run start:dev"
echo ""
echo "2. Test the API:"
echo "   cd ../shell-scripts"
echo "   ./test-products.sh"
echo ""
echo "Admin credentials:"
echo "  Email: admin@example.com"
echo "  Password: Admin123!"
