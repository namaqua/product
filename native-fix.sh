#!/bin/bash

# Direct execution script for database fix
# This runs natively on the host system

echo "🚀 Starting Native Database Fix"
echo "================================"

# Navigate to backend directory
cd /Users/colinroets/dev/projects/product/pim

# 1. Ensure database is fresh
echo "1. Ensuring fresh database..."
export PGPASSWORD=secure_password_change_me
psql -U pim_user -h localhost -p 5432 -d postgres <<EOF
DROP DATABASE IF EXISTS pim_dev;
CREATE DATABASE pim_dev OWNER pim_user;
EOF
echo "✅ Database recreated"

# 2. Source environment variables
echo "2. Loading environment..."
export $(cat .env | grep -v '^#' | xargs)

# 3. Build the project
echo "3. Building project..."
npm run build 2>&1 | tail -5

# 4. Start the backend
echo "4. Starting backend..."
timeout 30 npm run start:dev &
BACKEND_PID=$!

# 5. Wait for backend
echo "5. Waiting for backend (max 30 seconds)..."
for i in {1..30}; do
    if curl -s http://localhost:3010/health 2>/dev/null | grep -q "database"; then
        echo "✅ Backend is ready!"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# 6. Check tables
echo "6. Checking tables..."
psql -U pim_user -h localhost -d pim_dev -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" | head -20

# 7. Run seeder
echo "7. Running seeder..."
npm run seed 2>&1 | grep -E "(✅|❌|Created|ERROR)"

# 8. Final check
echo "8. Final verification..."
PRODUCTS=$(psql -U pim_user -h localhost -d pim_dev -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
LOCALES=$(psql -U pim_user -h localhost -d pim_dev -t -c "SELECT COUNT(*) FROM product_locales;" 2>/dev/null || echo "0")

echo "Results:"
echo "  Products: $PRODUCTS"
echo "  Locales: $LOCALES"

# 9. Check for name column issue
echo ""
echo "9. Checking schema..."
HAS_NAME=$(psql -U pim_user -h localhost -d pim_dev -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='products' AND column_name='name';" 2>/dev/null)

if [ -n "$HAS_NAME" ]; then
    echo "❌ ERROR: 'name' column still exists in products table!"
else
    echo "✅ CORRECT: No 'name' column in products table"
fi

echo ""
echo "Fix complete!"
