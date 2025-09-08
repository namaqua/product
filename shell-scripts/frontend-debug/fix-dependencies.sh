#!/bin/bash

cd /Users/colinroets/dev/pim-admin

echo "Installing missing dependencies..."

# Install missing type definitions for Node
npm install --save-dev @types/node

# Downgrade Tailwind CSS to stable v3 (v4 is too new and might have issues)
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.0

# Reinstall to ensure everything is properly linked
npm install

echo "All dependencies fixed! Now you can run: npm run dev"
