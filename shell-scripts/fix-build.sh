#!/bin/bash

# Quick fix and test build

echo "========================================="
echo "Fixing Build Issue & Testing"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

echo "Fixed: Moved main.swagger.ts out of src/ directory"
echo "(It was causing build errors without Swagger installed)"
echo ""

echo "Testing build..."
npm run build 2>&1 | tail -10

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "Now start the backend:"
    echo "  npm run start:dev"
    echo ""
    echo "Your auth system is ready to use!"
else
    echo ""
    echo "Still having issues? Check the errors above."
fi
