#!/bin/bash

echo "🔧 Executing Database Fix..."
echo "================================"

cd /Users/colinroets/dev/projects/product/pim

# 1. Build the project
echo "Building backend..."
npm run build

# 2. Start backend in background to create tables
echo "Starting backend to create tables..."
npm run start:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# 3. Wait for backend to be ready
echo "Waiting for backend to initialize..."
for i in {1..30}; do
    if curl -s http://localhost:3010/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# 4. Check tables
echo "Checking tables created..."
PGPASSWORD=secure_password_change_me psql -U pim_user -h localhost -d pim_dev -c "\dt" | head -20

# 5. Run seeder
echo "Running seeder..."
npm run seed

# 6. Verify data
echo ""
echo "Verifying data..."
PRODUCT_COUNT=$(PGPASSWORD=secure_password_change_me psql -U pim_user -h localhost -d pim_dev -t -c "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
LOCALE_COUNT=$(PGPASSWORD=secure_password_change_me psql -U pim_user -h localhost -d pim_dev -t -c "SELECT COUNT(*) FROM product_locales;" 2>/dev/null || echo "0")

echo "Products created: $PRODUCT_COUNT"
echo "Product locales created: $LOCALE_COUNT"

echo ""
echo "✅ Fix complete! Backend PID: $BACKEND_PID"
echo "To stop backend: kill $BACKEND_PID"
