#!/bin/bash

# Upgrade to NestJS v11 (if desired)

echo "========================================="
echo "NestJS v11 Upgrade Script"
echo "========================================="
echo ""
echo "⚠️  WARNING: This will upgrade to NestJS v11"
echo "This may introduce breaking changes!"
echo ""
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Upgrade cancelled"
    exit 0
fi

cd /Users/colinroets/dev/projects/product/pim

echo ""
echo "Creating backup of package.json..."
cp package.json package.json.backup

echo ""
echo "Upgrading NestJS packages to v11..."

# Core NestJS packages
npm install @nestjs/common@^11.0.0 \
            @nestjs/core@^11.0.0 \
            @nestjs/platform-express@^11.0.0 \
            @nestjs/testing@^11.0.0 \
            @nestjs/cli@^11.0.0 \
            @nestjs/schematics@^11.0.0

# Already v11 compatible packages (no change needed)
# @nestjs/jwt@^11.0.0
# @nestjs/passport@^11.0.5
# @nestjs/typeorm@^11.0.0
# @nestjs/config@^4.0.2 (works with v11)

echo ""
echo "Installing latest Swagger..."
npm install @nestjs/swagger@^11.0.0 swagger-ui-express@^5.0.0

echo ""
echo "Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upgrade successful!"
    echo ""
    echo "Next steps:"
    echo "1. Test all endpoints thoroughly"
    echo "2. Update main.ts to use Swagger"
    echo "3. Run: npm run start:dev"
else
    echo ""
    echo "❌ Build failed after upgrade"
    echo ""
    echo "To rollback:"
    echo "  mv package.json.backup package.json"
    echo "  npm install"
fi
