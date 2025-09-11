#!/bin/bash

# Diagnostic script for PIM authentication

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}PIM System Diagnostic${NC}"
echo "====================="

# 1. Check if backend is running
echo -e "\n1. Checking backend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/health | grep -q "200"; then
    echo -e "${GREEN}✓ Backend is running on port 3010${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo "  Start it with:"
    echo "  cd /Users/colinroets/dev/projects/product/pim"
    echo "  npm run start:dev"
    exit 1
fi

# 2. Check database connectivity
echo -e "\n2. Checking database..."
if docker ps | grep -q postgres-pim; then
    echo -e "${GREEN}✓ PostgreSQL container is running${NC}"
    
    # Check users in database
    echo -e "\n3. Users in database:"
    docker exec postgres-pim psql -U pim_user -d pim_dev -c \
        "SELECT email, role, status FROM users;" 2>/dev/null | head -10
else
    echo -e "${RED}✗ PostgreSQL container is NOT running${NC}"
    echo "  Start it with:"
    echo "  cd /Users/colinroets/dev/projects/product"
    echo "  docker-compose up -d"
    exit 1
fi

# 3. Test login with existing admin
echo -e "\n4. Testing login with admin@example.com..."
RESPONSE=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"Admin123!"}' 2>/dev/null)

if echo "$RESPONSE" | grep -q "access_token\|accessToken"; then
    echo -e "${GREEN}✓ Login successful!${NC}"
    echo -e "\nWorking credentials:"
    echo "  Email: admin@example.com"
    echo "  Password: Admin123!"
    
    # Extract token for testing
    TOKEN=$(echo $RESPONSE | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('data',{}).get('access_token','') if 'data' in d else d.get('access_token',''))" 2>/dev/null || echo $RESPONSE | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('accessToken',''))" 2>/dev/null)
    
    if [ ! -z "$TOKEN" ]; then
        echo -e "\n5. Testing authenticated request..."
        PRODUCTS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3010/api/v1/products)
        
        if echo "$PRODUCTS" | grep -q "data\|items"; then
            echo -e "${GREEN}✓ API authentication working${NC}"
            
            # Count products
            COUNT=$(echo $PRODUCTS | python3 -c "import sys, json; d=json.load(sys.stdin); data=d.get('data',d); print(data.get('meta',{}).get('totalItems',0))" 2>/dev/null)
            echo "  Found $COUNT products in database"
        else
            echo -e "${RED}✗ API request failed${NC}"
            echo "Response: $PRODUCTS"
        fi
    fi
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $RESPONSE"
    
    # Try with admin@test.com
    echo -e "\n5. Testing login with admin@test.com..."
    RESPONSE2=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@test.com","password":"Admin123!"}' 2>/dev/null)
    
    if echo "$RESPONSE2" | grep -q "access_token\|accessToken"; then
        echo -e "${GREEN}✓ Login successful with admin@test.com!${NC}"
        echo -e "\nWorking credentials:"
        echo "  Email: admin@test.com"
        echo "  Password: Admin123!"
    else
        echo -e "${RED}✗ Both admin accounts failed to login${NC}"
        echo -e "\nPossible issues:"
        echo "  1. Password might be different"
        echo "  2. Backend authentication might be broken"
        echo "  3. Users might need password reset"
    fi
fi

echo -e "\n${YELLOW}Summary:${NC}"
echo "- Database has 3 users: admin@example.com, admin@test.com, product-test@example.com"
echo "- Backend seed.ts uses password: Admin123!"
echo "- Frontend is pre-configured with: admin@example.com / Admin123!"
echo ""
echo "If login still fails, the password might have been changed."
echo "You can reset it by running the seed script again:"
echo "  cd /Users/colinroets/dev/projects/product/pim"
echo "  npm run seed"
