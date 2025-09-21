#!/bin/bash

# Check actual database schema

echo "Checking products table structure..."
docker exec postgres-pim psql -U pim_user -d pim_dev -c "\d products" 2>/dev/null || echo "Table might not exist"

echo ""
echo "Checking if products table exists..."
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position;" 2>/dev/null

echo ""
echo "Checking total products (without isDeleted filter)..."
docker exec postgres-pim psql -U pim_user -d pim_dev -t -c "SELECT COUNT(*) FROM products" 2>/dev/null || echo "0"

echo ""
echo "Sample product data:"
docker exec postgres-pim psql -U pim_user -d pim_dev -c "SELECT id, sku, name, type, status FROM products LIMIT 5;" 2>/dev/null || echo "No data"
