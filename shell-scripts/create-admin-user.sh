#!/bin/bash

# Create initial admin user for testing

echo "========================================="
echo "Creating Initial Admin User"
echo "========================================="
echo ""

# API base URL
API_URL="http://localhost:3010/api/v1"

# Register admin user
echo "1. Registering admin user..."
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }')

if echo "$RESPONSE" | grep -q "accessToken"; then
    echo "   ✅ Admin user created successfully"
    
    # Extract access token
    ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
    
    echo ""
    echo "2. Testing login..."
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@example.com",
        "password": "Admin123!"
      }')
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        echo "   ✅ Login successful"
        
        # Extract new access token
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')
        
        echo ""
        echo "3. Testing protected endpoint..."
        ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
          -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if echo "$ME_RESPONSE" | grep -q "admin@example.com"; then
            echo "   ✅ Protected endpoint working"
            echo ""
            echo "User details:"
            echo "$ME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ME_RESPONSE"
        else
            echo "   ❌ Protected endpoint failed"
        fi
    else
        echo "   ❌ Login failed"
    fi
elif echo "$RESPONSE" | grep -q "already exists"; then
    echo "   ℹ️  Admin user already exists"
    echo "   Login with: admin@example.com / Admin123!"
else
    echo "   ❌ Registration failed"
    echo "   Response: $RESPONSE"
    echo ""
    echo "Make sure the backend is running:"
    echo "cd /Users/colinroets/dev/projects/product/pim"
    echo "npm run start:dev"
fi

echo ""
echo "========================================="
echo "Test Credentials:"
echo "========================================="
echo "Email: admin@example.com"
echo "Password: Admin123!"
echo ""
echo "API Documentation: http://localhost:3010/api/docs"
echo "Health Check: http://localhost:3010/health"
