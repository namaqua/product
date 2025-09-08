#!/bin/bash

# Test Product Module API Endpoints
# This script tests the Product module endpoints

BASE_URL="http://localhost:3010/api/v1"
TOKEN=""
EMAIL="admin@example.com"
PASSWORD="Admin123!"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Product Module API...${NC}"
echo "================================"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# 1. Register admin user (if not exists)
echo -e "\n${YELLOW}1. Creating admin user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }')
echo "Response: $REGISTER_RESPONSE"

# 2. Login to get JWT token
echo -e "\n${YELLOW}2. Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get auth token. Please check if the auth module is working.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo "Token: ${TOKEN:0:20}..."

# 3. Create a simple product
echo -e "\n${YELLOW}3. Creating a simple product...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "TEST-001",
    "type": "simple",
    "status": "draft",
    "quantity": 100,
    "price": 29.99,
    "weight": 1.5,
    "weightUnit": "kg",
    "isVisible": true,
    "locales": [
      {
        "localeCode": "en",
        "name": "Test Product",
        "description": "This is a test product",
        "shortDescription": "Test product for API testing"
      }
    ],
    "attributes": [
      {
        "attributeCode": "color",
        "valueText": "Blue"
      },
      {
        "attributeCode": "material",
        "valueText": "Cotton"
      }
    ],
    "media": [
      {
        "url": "https://example.com/product1.jpg",
        "mediaType": "image",
        "isPrimary": true,
        "altText": "Test Product Image"
      }
    ]
  }')

PRODUCT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PRODUCT_ID" ]; then
    print_result 0 "Product created successfully (ID: $PRODUCT_ID)"
else
    print_result 1 "Failed to create product"
    echo "Response: $CREATE_RESPONSE"
fi

# 4. Get all products
echo -e "\n${YELLOW}4. Getting all products...${NC}"
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/products?includeLocales=true&includeMedia=true" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LIST_RESPONSE" | grep -q "items"; then
    print_result 0 "Products retrieved successfully"
    TOTAL=$(echo $LIST_RESPONSE | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "   Total products: $TOTAL"
else
    print_result 1 "Failed to retrieve products"
fi

# 5. Get product by ID
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${YELLOW}5. Getting product by ID...${NC}"
    GET_RESPONSE=$(curl -s -X GET "$BASE_URL/products/$PRODUCT_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$GET_RESPONSE" | grep -q "$PRODUCT_ID"; then
        print_result 0 "Product retrieved by ID"
    else
        print_result 1 "Failed to retrieve product by ID"
    fi
fi

# 6. Update product
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${YELLOW}6. Updating product...${NC}"
    UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/products/$PRODUCT_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "price": 34.99,
        "quantity": 150,
        "status": "published"
      }')
    
    if echo "$UPDATE_RESPONSE" | grep -q '"status":"published"'; then
        print_result 0 "Product updated successfully"
    else
        print_result 1 "Failed to update product"
    fi
fi

# 7. Get product by SKU
echo -e "\n${YELLOW}7. Getting product by SKU...${NC}"
SKU_RESPONSE=$(curl -s -X GET "$BASE_URL/products/sku/TEST-001" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SKU_RESPONSE" | grep -q "TEST-001"; then
    print_result 0 "Product retrieved by SKU"
else
    print_result 1 "Failed to retrieve product by SKU"
fi

# 8. Update inventory
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${YELLOW}8. Updating product inventory...${NC}"
    INVENTORY_RESPONSE=$(curl -s -X PATCH "$BASE_URL/products/$PRODUCT_ID/inventory" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "quantity": 10,
        "operation": "decrement"
      }')
    
    if echo "$INVENTORY_RESPONSE" | grep -q '"quantity":'; then
        print_result 0 "Inventory updated successfully"
        NEW_QTY=$(echo $INVENTORY_RESPONSE | grep -o '"quantity":[0-9]*' | cut -d':' -f2)
        echo "   New quantity: $NEW_QTY"
    else
        print_result 1 "Failed to update inventory"
    fi
fi

# 9. Get product statistics
echo -e "\n${YELLOW}9. Getting product statistics...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/products/statistics" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q "total"; then
    print_result 0 "Statistics retrieved successfully"
    echo "   Response: $STATS_RESPONSE"
else
    print_result 1 "Failed to retrieve statistics"
fi

# 10. Create a configurable product with variants
echo -e "\n${YELLOW}10. Creating a configurable product...${NC}"
CONFIG_RESPONSE=$(curl -s -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "SHIRT-001",
    "type": "configurable",
    "status": "draft",
    "price": 49.99,
    "locales": [
      {
        "localeCode": "en",
        "name": "Classic T-Shirt",
        "description": "A comfortable classic t-shirt available in multiple colors and sizes"
      }
    ]
  }')

CONFIG_ID=$(echo $CONFIG_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$CONFIG_ID" ]; then
    print_result 0 "Configurable product created (ID: $CONFIG_ID)"
else
    print_result 1 "Failed to create configurable product"
fi

# 11. Bulk update visibility
echo -e "\n${YELLOW}11. Bulk updating product visibility...${NC}"
if [ -n "$PRODUCT_ID" ]; then
    BULK_RESPONSE=$(curl -s -X POST "$BASE_URL/products/bulk/visibility" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "productIds": ["'$PRODUCT_ID'"],
        "isVisible": false
      }')
    
    if echo "$BULK_RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Bulk visibility update successful"
    else
        print_result 1 "Failed bulk visibility update"
    fi
fi

# 12. Duplicate product
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${YELLOW}12. Duplicating product...${NC}"
    DUPLICATE_RESPONSE=$(curl -s -X POST "$BASE_URL/products/$PRODUCT_ID/duplicate" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "sku": "TEST-001-COPY"
      }')
    
    if echo "$DUPLICATE_RESPONSE" | grep -q "TEST-001-COPY"; then
        print_result 0 "Product duplicated successfully"
        DUP_ID=$(echo $DUPLICATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo "   Duplicate ID: $DUP_ID"
    else
        print_result 1 "Failed to duplicate product"
    fi
fi

# 13. Soft delete product
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${YELLOW}13. Soft deleting product...${NC}"
    DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/products/$PRODUCT_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n 1)
    
    if [ "$HTTP_CODE" = "204" ]; then
        print_result 0 "Product soft deleted successfully"
    else
        print_result 1 "Failed to delete product (HTTP $HTTP_CODE)"
    fi
fi

# 14. Restore soft-deleted product
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${YELLOW}14. Restoring soft-deleted product...${NC}"
    RESTORE_RESPONSE=$(curl -s -X POST "$BASE_URL/products/$PRODUCT_ID/restore" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$RESTORE_RESPONSE" | grep -q "$PRODUCT_ID"; then
        print_result 0 "Product restored successfully"
    else
        print_result 1 "Failed to restore product"
    fi
fi

echo -e "\n${YELLOW}================================${NC}"
echo -e "${GREEN}Product Module Testing Complete!${NC}"
echo -e "${YELLOW}================================${NC}"

# Summary
echo -e "\nSummary:"
echo "- Base URL: $BASE_URL"
echo "- Test User: $EMAIL"
if [ -n "$PRODUCT_ID" ]; then
    echo "- Test Product ID: $PRODUCT_ID"
    echo "- Test Product SKU: TEST-001"
fi

echo -e "\n${YELLOW}Note:${NC} Make sure to run the backend with:"
echo "cd /Users/colinroets/dev/projects/product/pim"
echo "npm run start:dev"
