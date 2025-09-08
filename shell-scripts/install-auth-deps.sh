#!/bin/bash

# Install additional dependencies for Task 14

echo "========================================="
echo "Installing Auth Module Dependencies"
echo "========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

echo "Installing Swagger/OpenAPI packages..."
npm install @nestjs/swagger swagger-ui-express

echo ""
echo "Dependencies installed!"
echo ""
echo "Packages added:"
echo "- @nestjs/swagger - API documentation"
echo "- swagger-ui-express - Swagger UI"
echo ""
echo "All auth-related packages were already installed:"
echo "- @nestjs/jwt ✅"
echo "- @nestjs/passport ✅"
echo "- passport-jwt ✅"
echo "- bcryptjs ✅"
echo "- class-validator ✅"
echo "- class-transformer ✅"
