#!/bin/bash

# Seed Database with Admin User
# This script ensures the admin user exists in the database

echo "========================================="
echo "🌱 Database Seeding Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /Users/colinroets/dev/projects/product/pim

echo -e "${BLUE}Step 1: Checking PostgreSQL connection...${NC}"
if lsof -ti:5433 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} PostgreSQL is running on port 5433"
else
    echo -e "   ${RED}✗${NC} PostgreSQL not running!"
    echo "   Start it with:"
    echo "   cd /Users/colinroets/dev/projects/product"
    echo "   docker-compose up -d"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 2: Running database seed...${NC}"
echo "   This will create the admin user if it doesn't exist"
echo ""

# Check if seed command exists
if grep -q '"seed"' package.json; then
    echo "   Running: npm run seed"
    npm run seed 2>&1 | tee /tmp/seed.log
    
    if grep -q "error" /tmp/seed.log; then
        echo -e "   ${YELLOW}⚠${NC} Seed might have encountered issues"
        echo "   Check /tmp/seed.log for details"
    else
        echo -e "   ${GREEN}✓${NC} Seed completed"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} No seed command found in package.json"
    echo ""
    echo "   Attempting alternative method..."
    
    # Try to run TypeORM seed if available
    if [ -f "node_modules/.bin/typeorm" ]; then
        echo "   Running TypeORM seed..."
        npm run typeorm seed:run 2>&1 | tee /tmp/seed-typeorm.log
    else
        echo -e "   ${RED}✗${NC} Cannot find seed mechanism"
    fi
fi
echo ""

echo -e "${BLUE}Step 3: Testing login after seed...${NC}"
sleep 2

LOGIN_TEST=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!"
  }' 2>/dev/null)

if echo "$LOGIN_TEST" | grep -q "accessToken"; then
    echo -e "   ${GREEN}✅ SUCCESS! Admin user is working!${NC}"
    echo ""
    echo "   You can now login with:"
    echo "   Email: admin@test.com"
    echo "   Password: Admin123!"
else
    echo -e "   ${YELLOW}⚠${NC} Login still not working"
    echo ""
    echo "   Trying alternative admin account..."
    
    ALT_TEST=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@example.com",
        "password": "Admin123!"
      }' 2>/dev/null)
    
    if echo "$ALT_TEST" | grep -q "accessToken"; then
        echo -e "   ${GREEN}✅ Alternative admin account works!${NC}"
        echo ""
        echo "   Use these credentials instead:"
        echo "   Email: admin@example.com"
        echo "   Password: Admin123!"
    else
        echo -e "   ${RED}✗${NC} Still having issues"
        echo ""
        echo "   Manual database check needed:"
        echo "   psql -h localhost -p 5433 -U pim_user -d pim_dev"
        echo "   Password: pim_password"
        echo ""
        echo "   Then run:"
        echo "   SELECT email, is_active FROM users WHERE role = 'admin';"
    fi
fi
echo ""

echo "========================================="
echo "📋 Next Steps:"
echo "========================================="
echo ""
echo "1. Go back to the browser"
echo "2. Try logging in with the working credentials"
echo "3. If still seeing 'Validation failed':"
echo "   - Open DevTools (F12)"
echo "   - Go to Network tab"
echo "   - Try login again"
echo "   - Click on the failed 'login' request"
echo "   - Check Response tab for error details"
echo ""
