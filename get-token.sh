#!/bin/bash

# Simple script to get auth token and test products API

echo "Getting authentication token..."

# Login and extract token
TOKEN=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestUser123!"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\).*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "❌ No token. Let me register the user first..."
  
  # Register user
  curl -s -X POST http://localhost:3010/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testuser@example.com",
      "password": "TestUser123!",
      "firstName": "Test",
      "lastName": "User"
    }' > /dev/null
  
  # Try login again
  TOKEN=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testuser@example.com","password":"TestUser123!"}' \
    | sed -n 's/.*"accessToken":"\([^"]*\).*/\1/p')
fi

if [ -n "$TOKEN" ]; then
  echo "✅ Got token!"
  echo ""
  echo "Testing products endpoint..."
  echo "================================"
  curl -H "Authorization: Bearer $TOKEN" http://localhost:3010/api/v1/products 2>/dev/null | head -200
  echo ""
  echo "================================"
  echo ""
  echo "To use this token yourself:"
  echo "export TOKEN='$TOKEN'"
  echo ""
  echo "Then: curl -H \"Authorization: Bearer \$TOKEN\" http://localhost:3010/api/v1/products"
else
  echo "❌ Authentication failed"
fi
