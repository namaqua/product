#!/bin/bash

# Quick diagnostic - what's actually in the database?

DB_CONTAINER="postgres-pim"
DB_NAME="pim_dev"
DB_USER="pim_user"

echo "=== DATABASE DIAGNOSTIC ==="
echo

echo "1. Tables that exist:"
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;" 2>/dev/null

echo
echo "2. Products table columns (if exists):"
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position 
LIMIT 10;" 2>/dev/null || echo "Table doesn't exist or has no columns"

echo
echo "3. Quick counts:"
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT 'Products: ' || COUNT(*) FROM products;" 2>/dev/null || echo "Products: Table doesn't exist"
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT 'Categories: ' || COUNT(*) FROM categories;" 2>/dev/null || echo "Categories: Table doesn't exist"
docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT 'Users: ' || COUNT(*) FROM users;" 2>/dev/null || echo "Users: Table doesn't exist"
