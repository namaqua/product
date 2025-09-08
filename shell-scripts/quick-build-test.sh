#!/bin/bash

# Quick build test for Task 14

echo "========================================="
echo "Quick Build Test - Task 14"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

echo "Testing TypeScript compilation..."
npm run build 2>&1 | tail -10

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Next steps:"
    echo "1. Install Swagger: ./install-auth-deps.sh"
    echo "2. Start backend: npm run start:dev"
    echo "3. View API docs: http://localhost:3010/api/docs"
else
    echo ""
    echo "❌ Build failed - check for TypeScript errors above"
fi
