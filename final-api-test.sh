#!/bin/bash

echo "======================================="
echo "🎉 FINAL API TEST"
echo "======================================="

API_URL="http://localhost:3010"

# 1. Health check
echo "1. Health Check:"
curl -s $API_URL/health | python3 -m json.tool 2>/dev/null || curl -s $API_URL/health
echo ""

# 2. Register a new user
echo "2. Registering new user (testuser@example.com):"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestUser123!",
    "firstName": "Test",
    "lastName": "User"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "id"; then
  echo "✅ User registered successfully"
else
  echo "User might already exist or registration failed"
  echo "$REGISTER_RESPONSE"
fi
echo ""

# 3. Login
echo "3. Logging in:"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestUser123!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Login successful! Token: ${TOKEN:0:30}..."
else
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo ""

# 4. Test authenticated endpoints
echo "4. Testing Products API (GET /api/v1/products):"
PRODUCTS_RESPONSE=$(curl -s -X GET $API_URL/api/v1/products \
  -H "Authorization: Bearer $TOKEN")

if echo "$PRODUCTS_RESPONSE" | grep -q "data"; then
  echo "✅ Products endpoint working!"
  echo "Response preview:"
  echo "$PRODUCTS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20 || echo "$PRODUCTS_RESPONSE" | head -100
else
  echo "Response:"
  echo "$PRODUCTS_RESPONSE"
fi
echo ""

# 5. Get product by SKU
echo "5. Testing Get Product by SKU (GET /api/v1/products/sku/LAPTOP-001):"
SKU_RESPONSE=$(curl -s -X GET $API_URL/api/v1/products/sku/LAPTOP-001 \
  -H "Authorization: Bearer $TOKEN")

if echo "$SKU_RESPONSE" | grep -q "LAPTOP-001"; then
  echo "✅ Product found!"
  echo "$SKU_RESPONSE" | python3 -m json.tool 2>/dev/null | head -15 || echo "$SKU_RESPONSE" | head -50
else
  echo "Product response:"
  echo "$SKU_RESPONSE"
fi
echo ""

# 6. Test statistics
echo "6. Testing Statistics (GET /api/v1/products/statistics):"
STATS_RESPONSE=$(curl -s -X GET $API_URL/api/v1/products/statistics \
  -H "Authorization: Bearer $TOKEN")
echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATS_RESPONSE"
echo ""

echo "======================================="
echo "✅ API TEST COMPLETE!"
echo "======================================="
echo ""
echo "Summary:"
echo "  - Backend: http://localhost:3010"
echo "  - Health: http://localhost:3010/health"
echo "  - Products API: http://localhost:3010/api/v1/products"
echo "  - Auth Token: ${TOKEN:0:30}..."
echo ""
echo "You can now use this token for authenticated requests!"
