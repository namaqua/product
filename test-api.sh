#!/bin/bash

echo "========================================="
echo "🧪 Testing PIM API Endpoints"
echo "========================================="
echo ""

API_URL="http://localhost:3010"

# 1. Test health endpoint (no auth required)
echo "1. Testing health endpoint:"
curl -s $API_URL/health | jq '.' 2>/dev/null || curl -s $API_URL/health
echo ""

# 2. Register a test user (if needed)
echo "2. Creating test user:"
curl -s -X POST $API_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }' | jq '.' 2>/dev/null || echo "User might already exist"
echo ""

# 3. Login to get JWT token
echo "3. Logging in to get token:"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Trying admin user..."
  
  # Try with admin user from seed
  LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@example.com",
      "password": "Admin123!"
    }')
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

echo ""

if [ -n "$TOKEN" ]; then
  echo "✅ Got token: ${TOKEN:0:20}..."
  echo ""
  
  # 4. Test products endpoint with authentication
  echo "4. Testing GET /api/v1/products (with auth):"
  curl -s -X GET $API_URL/api/v1/products \
    -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || \
  curl -s -X GET $API_URL/api/v1/products \
    -H "Authorization: Bearer $TOKEN"
  echo ""
  
  # 5. Test product statistics
  echo "5. Testing GET /api/v1/products/statistics:"
  curl -s -X GET $API_URL/api/v1/products/statistics \
    -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || \
  curl -s -X GET $API_URL/api/v1/products/statistics \
    -H "Authorization: Bearer $TOKEN"
  echo ""
  
  # 6. Get a specific product by SKU
  echo "6. Testing GET /api/v1/products/sku/LAPTOP-001:"
  curl -s -X GET $API_URL/api/v1/products/sku/LAPTOP-001 \
    -H "Authorization: Bearer $TOKEN" | jq '.' 2>/dev/null || \
  curl -s -X GET $API_URL/api/v1/products/sku/LAPTOP-001 \
    -H "Authorization: Bearer $TOKEN"
  
else
  echo "❌ Could not get authentication token"
  echo ""
  echo "Trying without authentication to see the error:"
  curl -i $API_URL/api/v1/products
fi

echo ""
echo "========================================="
echo "✅ API Test Complete"
echo "========================================="
