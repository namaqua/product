#!/bin/bash

echo "========================================="
echo "PIM Admin - Complete Setup & Fix"
echo "========================================="

cd /Users/colinroets/dev/pim-admin

echo ""
echo "Step 1: Installing missing type definitions..."
npm install --save-dev @types/node

echo ""
echo "Step 2: Ensuring Tailwind CSS v3 (not v4)..."
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.0

echo ""
echo "Step 3: Verifying all required dependencies..."
npm install @headlessui/react @heroicons/react

echo ""
echo "Step 4: Final dependency check..."
npm install

echo ""
echo "========================================="
echo "✅ Setup complete!"
echo "========================================="
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "You should see:"
echo "  - PIM Admin Dashboard"
echo "  - Sidebar navigation"
echo "  - Stats cards"
echo "  - Products table"
echo "========================================="
