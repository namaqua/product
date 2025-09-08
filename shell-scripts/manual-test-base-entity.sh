#!/bin/bash

# Manual test of Base Entity setup

echo "========================================="
echo "Manual Base Entity Test"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# 1. Check entity files exist
echo "1. Checking entity files..."
if [ -f "src/common/entities/base.entity.ts" ] && \
   [ -f "src/common/subscribers/audit.subscriber.ts" ] && \
   [ -f "src/entities/product.entity.ts" ]; then
    echo "   ✅ All entity files exist"
else
    echo "   ❌ Some entity files missing"
fi

# 2. Build the project
echo ""
echo "2. Building the project..."
npm run build 2>&1 | tail -5
if [ $? -eq 0 ]; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed - checking for TypeScript errors"
    npm run build
fi

# 3. Show the compiled files
echo ""
echo "3. Checking compiled output..."
if [ -d "dist/common/entities" ]; then
    echo "   ✅ Entities compiled to dist/"
    ls -la dist/common/entities/ | head -5
else
    echo "   ⚠️  Compiled entities not found"
fi

echo ""
echo "========================================="
echo "Manual steps to complete testing:"
echo "========================================="
echo ""
echo "1. Start the backend manually:"
echo "   npm run start:dev"
echo ""
echo "2. In another terminal, test the health endpoint:"
echo "   curl http://localhost:3010/health"
echo ""
echo "3. Check the console output for any TypeORM errors"
echo ""
echo "If you see database connection errors, make sure:"
echo "- PostgreSQL is running"
echo "- Database 'pim_dev' exists"
echo "- .env file has correct database credentials"
