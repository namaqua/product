#!/bin/bash

# Test Product Module API Endpoints
# Ensure the backend is running on port 3010 before running this script

echo "==================================="
echo "Testing Product Module API"
echo "==================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:3010/api/v1"

# Test user credentials
TEST_EMAIL="admin@example.com"
TEST_PASSWORD="Admin123!"

echo ""
echo "1. Creating test admin user..."
echo "-----------------------------------"

# Register admin user
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }')

echo "Register Response: $REGISTER_RESPONSE"

echo ""
echo "2. Logging in to get JWT token..."
echo "-----------------------------------"

# Login to get token
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$TEST_EMAIL'",
    "password": "'$TEST_PASSWORD'"
  }')

# Extract token from response using grep and sed
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get auth token${NC}"
  echo "Login Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo "Token: ${TOKEN:0:50}..."

echo ""
echo "3. Creating a test product..."
echo "-----------------------------------"

# Create a product
CREATE_RESPONSE=$(curl -s -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "PROD-001",
    "name": "Premium Wireless Headphones",
    "type": "simple",
    "status": "draft",
    "description": "High-quality wireless headphones with active noise cancellation",
    "shortDescription": "Premium wireless headphones with 30-hour battery life",
    "price": 299.99,
    "cost": 120.00,
    "quantity": 100,
    "manageStock": true,
    "lowStockThreshold": 10,
    "weight": 0.3,
    "brand": "AudioTech",
    "manufacturer": "AudioTech Inc.",
    "features": ["Noise Cancellation", "30-hour battery", "Bluetooth 5.0", "Foldable Design"],
    "specifications": {
      "battery": "30 hours",
      "connectivity": "Bluetooth 5.0",
      "weight": "300g",
      "color": "Black"
    },
    "tags": ["electronics", "audio", "wireless", "premium"],
    "metaTitle": "Premium Wireless Headphones | Best Sound Quality",
    "metaDescription": "Experience premium sound quality with our wireless headphones",
    "urlKey": "premium-wireless-headphones"
  }')

# Check if product was created
if echo "$CREATE_RESPONSE" | grep -q '"sku":"PROD-001"'; then
  echo -e "${GREEN}✓ Product created successfully${NC}"
  PRODUCT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')
  echo "Product ID: $PRODUCT_ID"
else
  echo -e "${RED}✗ Failed to create product${NC}"
  echo "Response: $CREATE_RESPONSE"
fi

echo ""
echo "4. Fetching all products..."
echo "-----------------------------------"

# Get all products
LIST_RESPONSE=$(curl -s -X GET $API_URL/products \
  -H "Authorization: Bearer $TOKEN")

if echo "$LIST_RESPONSE" | grep -q '"data":\['; then
  echo -e "${GREEN}✓ Products fetched successfully${NC}"
  # Count products in response
  PRODUCT_COUNT=$(echo $LIST_RESPONSE | grep -o '"sku":"[^"]*"' | wc -l)
  echo "Found $PRODUCT_COUNT product(s)"
else
  echo -e "${RED}✗ Failed to fetch products${NC}"
  echo "Response: $LIST_RESPONSE"
fi

echo ""
echo "5. Creating a second product..."
echo "-----------------------------------"

# Create another product
CREATE_RESPONSE2=$(curl -s -X POST $API_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "PROD-002",
    "name": "Bluetooth Speaker",
    "type": "simple",
    "status": "published",
    "description": "Portable bluetooth speaker with amazing sound",
    "price": 79.99,
    "quantity": 50,
    "brand": "AudioTech",
    "isFeatured": true,
    "tags": ["electronics", "audio", "portable"]
  }')

if echo "$CREATE_RESPONSE2" | grep -q '"sku":"PROD-002"'; then
  echo -e "${GREEN}✓ Second product created successfully${NC}"
else
  echo -e "${RED}✗ Failed to create second product${NC}"
fi

echo ""
echo "6. Testing product search..."
echo "-----------------------------------"

# Search for products
SEARCH_RESPONSE=$(curl -s -X GET "$API_URL/products?search=wireless" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SEARCH_RESPONSE" | grep -q '"data":\['; then
  echo -e "${GREEN}✓ Product search working${NC}"
else
  echo -e "${RED}✗ Product search failed${NC}"
fi

echo ""
echo "7. Testing featured products endpoint..."
echo "-----------------------------------"

# Get featured products
FEATURED_RESPONSE=$(curl -s -X GET $API_URL/products/featured \
  -H "Authorization: Bearer $TOKEN")

if echo "$FEATURED_RESPONSE" | grep -q '\['; then
  echo -e "${GREEN}✓ Featured products endpoint working${NC}"
else
  echo -e "${RED}✗ Featured products endpoint failed${NC}"
fi

echo ""
echo "8. Testing product by SKU..."
echo "-----------------------------------"

# Get product by SKU
SKU_RESPONSE=$(curl -s -X GET $API_URL/products/sku/PROD-001 \
  -H "Authorization: Bearer $TOKEN")

if echo "$SKU_RESPONSE" | grep -q '"sku":"PROD-001"'; then
  echo -e "${GREEN}✓ Get product by SKU working${NC}"
else
  echo -e "${RED}✗ Get product by SKU failed${NC}"
fi

if [ ! -z "$PRODUCT_ID" ]; then
  echo ""
  echo "9. Testing product update..."
  echo "-----------------------------------"
  
  # Update product
  UPDATE_RESPONSE=$(curl -s -X PATCH $API_URL/products/$PRODUCT_ID \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "price": 249.99,
      "specialPrice": 199.99,
      "status": "published"
    }')
  
  if echo "$UPDATE_RESPONSE" | grep -q '"specialPrice":199.99'; then
    echo -e "${GREEN}✓ Product updated successfully${NC}"
  else
    echo -e "${RED}✗ Product update failed${NC}"
  fi

  echo ""
  echo "10. Testing stock update..."
  echo "-----------------------------------"
  
  # Update stock
  STOCK_RESPONSE=$(curl -s -X PATCH $API_URL/products/$PRODUCT_ID/stock \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"quantity": 75}')
  
  if echo "$STOCK_RESPONSE" | grep -q '"quantity":75'; then
    echo -e "${GREEN}✓ Stock updated successfully${NC}"
  else
    echo -e "${RED}✗ Stock update failed${NC}"
  fi
fi

echo ""
echo "==================================="
echo "Product Module Testing Complete!"
echo "==================================="
