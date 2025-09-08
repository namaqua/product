#!/bin/bash

# Startup script for Product Module
# This script sets up and runs the Product module

echo "🚀 Starting Product Module Setup..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to backend directory
cd /Users/colinroets/dev/projects/product/pim

# 1. Install dependencies (if needed)
echo -e "\n${YELLOW}1. Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# 2. Check database connection
echo -e "\n${YELLOW}2. Checking database connection...${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo ""
    echo "Please ensure PostgreSQL is running and the database is created:"
    echo -e "${BLUE}  psql -U postgres${NC}"
    echo -e "${BLUE}  CREATE DATABASE pim_dev;${NC}"
    echo -e "${BLUE}  CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';${NC}"
    echo -e "${BLUE}  GRANT ALL ON DATABASE pim_dev TO pim_user;${NC}"
    echo -e "${BLUE}  \\q${NC}"
    exit 1
fi
unset PGPASSWORD

# 3. Compile TypeScript (to ensure migrations work)
echo -e "\n${YELLOW}3. Compiling TypeScript...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript compiled successfully${NC}"
else
    echo -e "${YELLOW}⚠ Build had issues, but continuing...${NC}"
fi

# 4. Run migrations (using synchronize for now since we're in development)
echo -e "\n${YELLOW}4. Setting up database tables...${NC}"
echo -e "${BLUE}Note: Tables will be auto-created by TypeORM synchronize in development mode${NC}"

# Try to run migrations if they exist
if [ -f "src/migrations/1705000000000-CreateProductTables.ts" ]; then
    echo "Migration file found, but skipping manual migration..."
    echo "TypeORM will handle table creation automatically in development mode"
fi

# 5. Seed the database
echo -e "\n${YELLOW}5. Seeding sample products...${NC}"
echo "Running seed script..."
npm run seed 2>&1 | tee seed.log
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded with sample products${NC}"
else
    echo -e "${YELLOW}⚠ Seeding had issues - checking log...${NC}"
    if grep -q "already exists" seed.log; then
        echo -e "${GREEN}✓ Products already exist in database${NC}"
    else
        echo -e "${YELLOW}Note: You can manually seed later with: npm run seed${NC}"
    fi
fi
rm -f seed.log

# 6. Start the backend
echo -e "\n${YELLOW}6. Starting NestJS backend...${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Product Module is ready!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Backend will start at:${NC} http://localhost:3010"
echo -e "${BLUE}Health check:${NC} http://localhost:3010/health"
echo ""
echo -e "${YELLOW}Product API endpoints:${NC}"
echo "  GET    /api/v1/products          - List all products"
echo "  GET    /api/v1/products/:id      - Get product by ID"
echo "  POST   /api/v1/products          - Create product (auth required)"
echo "  PATCH  /api/v1/products/:id      - Update product (auth required)"
echo "  DELETE /api/v1/products/:id      - Delete product (auth required)"
echo ""
echo -e "${YELLOW}Test credentials:${NC}"
echo "  Email: admin@example.com"
echo "  Password: Admin123!"
echo ""
echo -e "${BLUE}To test the API, run in another terminal:${NC}"
echo "  cd /Users/colinroets/dev/projects/product/shell-scripts"
echo "  ./test-products.sh"
echo ""
echo -e "${YELLOW}Starting server...${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the development server
npm run start:dev
