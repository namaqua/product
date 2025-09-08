#!/bin/bash

# Quick verification of Base Entity setup (without server start)

echo "========================================="
echo "Quick Base Entity Verification"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Check files
echo "Checking entity files..."
FILES=(
    "src/common/entities/base.entity.ts"
    "src/common/entities/index.ts"
    "src/common/subscribers/audit.subscriber.ts"
    "src/entities/product.entity.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - NOT FOUND"
    fi
done

# Check TypeScript compilation
echo ""
echo "Testing TypeScript compilation..."
npm run build > /tmp/build-output.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
    echo ""
    echo "Build output:"
    echo "- Compiled files in dist/"
    ls -la dist/common/entities/ 2>/dev/null | head -5
else
    echo "❌ TypeScript compilation failed"
    echo "Error output:"
    cat /tmp/build-output.log
    exit 1
fi

echo ""
echo "========================================="
echo "✅ Base Entity files verified!"
echo "========================================="
echo ""
echo "To test the server manually:"
echo "cd /Users/colinroets/dev/projects/product/pim"
echo "npm run start:dev"
echo ""
echo "Then check: http://localhost:3010/health"
