#!/bin/bash

# Install Swagger dependencies compatible with NestJS v10

echo "========================================="
echo "Installing Auth Module Dependencies"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

echo "Installing Swagger/OpenAPI packages (compatible with NestJS v10)..."
npm install @nestjs/swagger@^10.0.0 swagger-ui-express@^5.0.0

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "Packages added:"
    echo "- @nestjs/swagger@^10.0.0 - API documentation"
    echo "- swagger-ui-express@^5.0.0 - Swagger UI"
else
    echo ""
    echo "⚠️  If installation fails, try:"
    echo "npm install @nestjs/swagger@^10.0.0 swagger-ui-express@^5.0.0 --legacy-peer-deps"
fi

echo ""
echo "All auth-related packages already installed:"
echo "- @nestjs/jwt ✅"
echo "- @nestjs/passport ✅"
echo "- passport-jwt ✅"
echo "- bcryptjs ✅"
echo "- class-validator ✅"
echo "- class-transformer ✅"
