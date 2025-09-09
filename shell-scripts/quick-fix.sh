#!/bin/bash

echo "=========================================="
echo "Quick Fix for Platform Express"
echo "=========================================="
echo ""

cd /Users/colinroets/dev/projects/product/pim

# Quick reinstall of the specific package
echo "Reinstalling @nestjs/platform-express..."
npm install --save @nestjs/platform-express@^10.0.0

echo ""
echo "Starting the server..."
npm run start:dev
