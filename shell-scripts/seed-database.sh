#!/bin/bash

# Seed the database with sample products

echo "🌱 Seeding Database with Sample Products"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Navigate to the backend directory (where package.json with seed script is)
cd /Users/colinroets/dev/projects/product/pim

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Not in the correct directory${NC}"
    echo "Expected to be in: /Users/colinroets/dev/projects/product/pim"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies first...${NC}"
    npm install
fi

# Check database connection
echo -e "\n${YELLOW}Checking database connection...${NC}"
export PGPASSWORD='secure_password_change_me'
psql -U pim_user -d pim_dev -h localhost -c "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connected${NC}"
else
    echo -e "${RED}✗ Database not connected${NC}"
    echo "Please ensure PostgreSQL is running and the database exists"
    exit 1
fi
unset PGPASSWORD

# Run the seed command
echo -e "\n${YELLOW}Running seed script...${NC}"
npm run seed

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Database seeded successfully!${NC}"
    echo ""
    echo "Sample products added:"
    echo "  • Professional Laptop Pro 15\" - $1,299.99"
    echo "  • SmartPhone X Pro 256GB - $899.99"
    echo "  • Wireless Noise-Canceling Headphones - $349.99"
    echo "  • Digital Tablet Pro 11\" - $599.99"
    echo "  • Smart Fitness Watch - $399.99"
    echo "  • Professional DSLR Camera - $2,499.99"
    echo ""
    echo "Admin user created:"
    echo "  Email: admin@example.com"
    echo "  Password: Admin123!"
else
    echo -e "\n${YELLOW}⚠ Seeding may have failed or data already exists${NC}"
    echo "Check the output above for details"
fi

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Start the server: npm run start:dev"
echo "2. Test the API: ./test-products.sh"
