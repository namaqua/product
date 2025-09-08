#!/bin/bash

echo "========================================="
echo "🔍 COMPLETE DIAGNOSTIC FOR WHITE SCREEN"
echo "========================================="

cd /Users/colinroets/dev/pim-admin

echo ""
echo "1️⃣ CHECKING REACT VERSIONS..."
echo "--------------------------------"
npm list react react-dom
echo ""

echo "2️⃣ CHECKING FOR TYPESCRIPT ERRORS..."
echo "--------------------------------"
npx tsc --noEmit 2>&1 | head -20
echo ""

echo "3️⃣ CHECKING VITE VERSION..."
echo "--------------------------------"
npx vite --version
echo ""

echo "4️⃣ TESTING STANDALONE HTML..."
echo "--------------------------------"
echo "Open this file in your browser:"
echo "file://$(pwd)/test-react.html"
echo ""
echo "Or run: open test-react.html"
echo ""

echo "5️⃣ CHECKING NODE VERSION..."
echo "--------------------------------"
node --version
echo "Should be v16+ for Vite"
echo ""

echo "6️⃣ CHECKING IF PORT IS AVAILABLE..."
echo "--------------------------------"
lsof -i :5173 | head -5
echo "If something shows above, port 5173 is in use"
echo ""

echo "7️⃣ MODIFIED FILES FOR DEBUGGING..."
echo "--------------------------------"
echo "✅ main.tsx - Added console.log statements"
echo "✅ index.html - Added loading indicator"
echo "✅ test-react.html - Standalone test file"
echo ""

echo "========================================="
echo "📋 WHAT TO DO NOW:"
echo "========================================="
echo ""
echo "1. FIRST: Open the standalone test:"
echo "   open test-react.html"
echo "   → If this works, React is fine, issue is Vite"
echo ""
echo "2. THEN: Start Vite with debugging:"
echo "   npm run dev"
echo "   → Check console for these messages:"
echo "     • 'main.tsx is loading...'"
echo "     • 'Root element found: [object HTMLDivElement]'"
echo "     • 'Creating React root...'"
echo "     • 'Rendering App...'"
echo "     • 'React render complete!'"
echo ""
echo "3. CHECK: Browser should show:"
echo "   → Blue background"
echo "   → 'React is Mounting!' text"
echo "   → Current time"
echo ""
echo "4. IF STILL WHITE:"
echo "   → Check Network tab for failed requests"
echo "   → Try: npm run dev -- --host"
echo "   → Try: npx vite preview"
echo ""
echo "========================================="
