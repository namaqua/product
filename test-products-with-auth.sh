#!/bin/bash

echo "========================================="
echo "🔐 Testing Products API with Authentication"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:3010"

# Step 1: Create/Login user
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestUser123!"
  }')

# Check if login failed
if echo "$LOGIN_RESPONSE" | grep -q "statusCode"; then
  echo "Login failed, trying to register first..."
  
  # Register
  REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "TestUser123!",
      "firstName": "Test",
      "lastName": "User"
    }')
  
  echo "Registration response: $REGISTER_RESPONSE"
  
  # Try login again
  LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "TestUser123!"
    }')
fi

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get authentication token${NC}"
  echo "Login response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Authentication successful!${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 2: Test products endpoint
echo "2. Getting products list..."
echo "Command: curl -H \"Authorization: Bearer \$TOKEN\" $API_URL/api/v1/products"
echo ""

PRODUCTS=$(curl -s -H "Authorization: Bearer $TOKEN" $API_URL/api/v1/products)

if echo "$PRODUCTS" | grep -q "items"; then
  echo -e "${GREEN}✅ Products retrieved successfully!${NC}"
  echo ""
  echo "Products found:"
  echo "$PRODUCTS" | python3 -m json.tool 2>/dev/null | grep -E '(sku|price)' | head -20 || echo "$PRODUCTS" | head -100
else
  echo -e "${RED}❌ Failed to get products${NC}"
  echo "Response: $PRODUCTS"
fi

echo ""
echo "========================================="
echo "To use this token in future requests:"
echo "========================================="
echo ""
echo "export TOKEN=\"$TOKEN\""
echo ""
echo "Then use it like:"
echo "curl -H \"Authorization: Bearer \$TOKEN\" http://localhost:3010/api/v1/products"
echo ""
