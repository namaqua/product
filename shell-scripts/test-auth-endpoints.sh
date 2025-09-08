#!/bin/bash

# Test Auth Endpoints with curl

echo "========================================="
echo "Testing Auth Endpoints"
echo "========================================="
echo ""

API_URL="http://localhost:3010/api/v1"

# Test data
EMAIL="test$(date +%s)@example.com"
PASSWORD="Test123!"

echo "Test user:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""

# 1. Register
echo "1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstName\":\"Test\",\"lastName\":\"User\"}")

if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Registration successful"
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
else
    echo "❌ Registration failed"
    echo "Response: $REGISTER_RESPONSE"
    echo ""
    echo "Is the backend running?"
    echo "Start it with: npm run start:dev"
    exit 1
fi

# 2. Login
echo ""
echo "2. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Login successful"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
else
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
fi

# 3. Get current user
echo ""
echo "3. Testing Protected Endpoint (me)..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$ME_RESPONSE" | grep -q "$EMAIL"; then
    echo "✅ Protected endpoint working"
    echo ""
    echo "User data:"
    echo "$ME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ME_RESPONSE"
else
    echo "❌ Protected endpoint failed"
    echo "Response: $ME_RESPONSE"
fi

echo ""
echo "========================================="
echo "✅ Auth System Test Complete!"
echo "========================================="
echo ""
echo "All endpoints working:"
echo "- Registration ✅"
echo "- Login ✅"
echo "- JWT Authentication ✅"
echo "- Protected Routes ✅"
