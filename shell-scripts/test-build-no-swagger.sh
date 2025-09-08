#!/bin/bash

# Test build without Swagger first

echo "========================================="
echo "Testing Build Without Swagger"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

echo "1. Building project..."
npm run build 2>&1 | tail -15

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful without Swagger!"
    echo ""
    echo "2. Now install Swagger (compatible version):"
    echo "   ./install-auth-deps-v10.sh"
    echo ""
    echo "3. Then start the backend:"
    echo "   npm run start:dev"
    echo ""
    echo "The auth system will work even without Swagger!"
else
    echo ""
    echo "❌ Build failed - check errors above"
fi
