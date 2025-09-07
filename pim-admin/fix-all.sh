#!/bin/bash

echo "========================================="
echo "PIM Admin Frontend Fix Script"
echo "========================================="

cd /Users/colinroets/dev/pim-admin

echo ""
echo "Step 1: Cleaning node_modules and cache..."
rm -rf node_modules package-lock.json
npm cache clean --force

echo ""
echo "Step 2: Installing dependencies with correct versions..."
npm install

echo ""
echo "Step 3: Installing missing dev dependencies..."
npm install --save-dev @types/node

echo ""
echo "Step 4: Downgrading Tailwind to stable version..."
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.0

echo ""
echo "Step 5: Reinstalling all dependencies..."
npm install

echo ""
echo "Step 6: Checking PostCSS configuration..."
if [ ! -f "postcss.config.js" ]; then
    echo "PostCSS config missing, creating..."
    cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

echo ""
echo "========================================="
echo "Fix complete! Now run these commands:"
echo "========================================="
echo "cd /Users/colinroets/dev/pim-admin"
echo "npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo "Check the browser console (F12) for any errors"
echo "========================================="
