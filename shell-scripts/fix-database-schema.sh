#!/bin/bash

# ===========================================================================
# FIX DATABASE SCHEMA - Complete Reset and Rebuild
# ===========================================================================
# This script completely resets the database to fix schema mismatch issues
# where the products table incorrectly has a 'name' column
# ===========================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="/Users/colinroets/dev/projects/product"
BACKEND_DIR="$PROJECT_ROOT/pim"

# Database configuration
DB_NAME="pim_dev"
DB_USER="pim_user"
DB_PASSWORD="secure_password_change_me"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE} DATABASE SCHEMA FIX - Complete Reset & Rebuild   ${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""

# Step 1: Kill any running backend processes
echo -e "${YELLOW}Step 1: Stopping any running backend services...${NC}"
pkill -f "node.*pim" 2>/dev/null || true
lsof -ti:3010 | xargs kill -9 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ Services stopped${NC}"
echo ""

# Step 2: Clean build artifacts
echo -e "${YELLOW}Step 2: Cleaning build artifacts...${NC}"
cd "$BACKEND_DIR"
rm -rf dist 2>/dev/null || true
echo -e "${GREEN}✓ Build artifacts cleaned${NC}"
echo ""

# Step 3: Drop and recreate the database
echo -e "${YELLOW}Step 3: Dropping and recreating database...${NC}"
echo -e "${RED}⚠️  This will DELETE ALL DATA in ${DB_NAME}!${NC}"
echo ""

# Drop existing connections to the database
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres <<EOF
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
EOF

# Drop the database
echo "Dropping database $DB_NAME..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || {
    echo -e "${RED}Failed to drop database. It might not exist or there might be active connections.${NC}"
}

# Create the database fresh
echo "Creating database $DB_NAME..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo -e "${GREEN}✓ Database recreated successfully${NC}"
echo ""

# Step 4: Build the backend
echo -e "${YELLOW}Step 4: Building backend...${NC}"
cd "$BACKEND_DIR"
npm run build
echo -e "${GREEN}✓ Backend built successfully${NC}"
echo ""

# Step 5: Start the backend to create tables
echo -e "${YELLOW}Step 5: Starting backend to create tables (TypeORM synchronize)...${NC}"
# Start the backend in the background
npm run start:dev > /tmp/pim-startup.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready (checking health endpoint)
echo "Waiting for backend to initialize and create tables..."
for i in {1..30}; do
    if curl -s http://localhost:3010/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is running and tables are created${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Verify the backend is actually running
if ! curl -s http://localhost:3010/health > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend failed to start. Check logs:${NC}"
    tail -20 /tmp/pim-startup.log
    exit 1
fi

# Step 6: Verify table structure
echo -e "${YELLOW}Step 6: Verifying table structure...${NC}"
echo "Checking products table columns..."

PRODUCTS_COLUMNS=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
")

echo "Products table columns:"
echo "$PRODUCTS_COLUMNS" | sed 's/^/  - /'

# Check if 'name' column exists in products table
if echo "$PRODUCTS_COLUMNS" | grep -q "name"; then
    echo -e "${RED}⚠️  WARNING: 'name' column still exists in products table!${NC}"
    echo -e "${RED}This shouldn't happen. The schema might be cached.${NC}"
else
    echo -e "${GREEN}✓ Correct: No 'name' column in products table${NC}"
fi

# Check product_locales table
echo ""
echo "Checking product_locales table..."
LOCALES_COLUMNS=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'product_locales' 
ORDER BY ordinal_position;
" 2>/dev/null || echo "Table not found")

if echo "$LOCALES_COLUMNS" | grep -q "name"; then
    echo -e "${GREEN}✓ Correct: 'name' column exists in product_locales table${NC}"
else
    echo -e "${RED}⚠️  WARNING: 'name' column missing from product_locales table!${NC}"
fi
echo ""

# Step 7: Run the seeder
echo -e "${YELLOW}Step 7: Running database seeder...${NC}"
cd "$BACKEND_DIR"

# Run the seeder
npm run seed 2>&1 | tee /tmp/seed-output.log

# Check if seeding was successful
if grep -q "✅ Seeding completed successfully" /tmp/seed-output.log; then
    echo -e "${GREEN}✓ Database seeded successfully!${NC}"
else
    echo -e "${RED}✗ Seeding failed. Check the output above for errors.${NC}"
    echo -e "${YELLOW}Common issues:${NC}"
    echo "  - Constraint violations (check entity relationships)"
    echo "  - Missing required fields"
    echo "  - Duplicate key violations"
fi
echo ""

# Step 8: Verify data was created
echo -e "${YELLOW}Step 8: Verifying seeded data...${NC}"

PRODUCT_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
LOCALE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SELECT COUNT(*) FROM product_locales;" 2>/dev/null || echo "0")
USER_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

echo "Database contents:"
echo "  - Products: $PRODUCT_COUNT"
echo "  - Product Locales: $LOCALE_COUNT"
echo "  - Users: $USER_COUNT"
echo ""

# Step 9: Test API endpoints
echo -e "${YELLOW}Step 9: Testing API endpoints...${NC}"

# Test health endpoint
echo -n "Testing health endpoint... "
if curl -s http://localhost:3010/health | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test products endpoint
echo -n "Testing products endpoint... "
PRODUCTS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3010/api/v1/products 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ (HTTP 200)${NC}"
elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}✓ (HTTP 401 - Auth required, endpoint exists)${NC}"
else
    echo -e "${RED}✗ (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# Final summary
echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE} SUMMARY                                          ${NC}"
echo -e "${BLUE}===================================================${NC}"

if [ "$PRODUCT_COUNT" -gt 0 ] && [ "$LOCALE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ SUCCESS: Database has been reset and seeded!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. The backend is running at http://localhost:3010"
    echo "  2. Start the frontend: cd $PROJECT_ROOT/pim-admin && npm run dev"
    echo "  3. Test the application"
else
    echo -e "${YELLOW}⚠️  PARTIAL SUCCESS: Database reset but seeding may have issues${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check logs: tail -f /tmp/pim-startup.log"
    echo "  2. Check seed output: cat /tmp/seed-output.log"
    echo "  3. Manually inspect database: psql -U $DB_USER -d $DB_NAME"
fi

echo ""
echo -e "${BLUE}Backend is running with PID: $BACKEND_PID${NC}"
echo -e "${YELLOW}To stop it: kill $BACKEND_PID${NC}"
echo ""
echo "Script completed!"
