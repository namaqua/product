#!/bin/bash

# Add Swagger decorators after installation

echo "========================================="
echo "Adding Swagger Support"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Check if Swagger is installed
if [ ! -d "node_modules/@nestjs/swagger" ]; then
    echo "❌ Swagger not installed yet. Run:"
    echo "   npm install @nestjs/swagger@^10.0.0 swagger-ui-express@^5.0.0"
    exit 1
fi

echo "✅ Swagger is installed"
echo ""
echo "To enable Swagger documentation:"
echo ""
echo "1. Update main.ts and uncomment the Swagger section"
echo "2. Add ApiProperty decorators to DTOs (optional)"
echo "3. Add ApiTags and ApiOperation decorators to controllers (optional)"
echo ""
echo "The API will work fine without these decorators!"
echo "They only enhance the documentation."
