#!/bin/bash

echo "========================================="
echo "Debugging PIM Admin White Screen"
echo "========================================="

cd /Users/colinroets/dev/pim-admin

echo ""
echo "1. Checking if dependencies are installed..."
if [ ! -d "node_modules/@headlessui" ]; then
    echo "❌ @headlessui/react not found - Installing..."
    npm install @headlessui/react
else
    echo "✅ @headlessui/react found"
fi

if [ ! -d "node_modules/@heroicons" ]; then
    echo "❌ @heroicons/react not found - Installing..."
    npm install @heroicons/react
else
    echo "✅ @heroicons/react found"
fi

if [ ! -d "node_modules/@types/node" ]; then
    echo "❌ @types/node not found - Installing..."
    npm install --save-dev @types/node
else
    echo "✅ @types/node found"
fi

echo ""
echo "2. Checking Tailwind version..."
npm list tailwindcss

echo ""
echo "3. Checking for PostCSS config..."
if [ -f "postcss.config.js" ]; then
    echo "✅ postcss.config.js exists"
else
    echo "❌ postcss.config.js missing - Creating..."
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
echo "4. Checking Vite config for @ alias..."
grep -q "@" vite.config.ts
if [ $? -eq 0 ]; then
    echo "✅ @ alias configured in vite.config.ts"
else
    echo "❌ @ alias not found in vite.config.ts"
fi

echo ""
echo "5. Testing simple App.tsx (no complex imports)..."
echo "   The current App.tsx has NO complex imports"
echo "   If this works, the issue is with component imports"

echo ""
echo "========================================="
echo "Now restart the dev server:"
echo "  npm run dev"
echo ""
echo "Then:"
echo "1. Open http://localhost:5173"
echo "2. Open browser console (F12)"
echo "3. Look for any red error messages"
echo "4. Report back what you see"
echo "========================================="
