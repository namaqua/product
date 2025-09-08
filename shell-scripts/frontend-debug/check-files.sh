#!/bin/bash

echo "========================================="
echo "Checking PIM Admin Files"
echo "========================================="
echo ""

echo "Current directory:"
pwd
echo ""

echo "Checking if we're in the right place:"
cd /Users/colinroets/dev/pim-admin
pwd
echo ""

echo "Files in pim-admin root:"
ls -la | head -20
echo ""

echo "Files in src directory:"
ls -la src/
echo ""

echo "Checking if App.tsx exists:"
if [ -f "src/App.tsx" ]; then
    echo "✅ src/App.tsx EXISTS!"
    echo ""
    echo "First 10 lines of App.tsx:"
    head -10 src/App.tsx
else
    echo "❌ src/App.tsx NOT FOUND"
fi
echo ""

echo "Full path to App.tsx:"
echo "/Users/colinroets/dev/pim-admin/src/App.tsx"
echo ""

echo "File size:"
ls -lh src/App.tsx 2>/dev/null || echo "File not found"
echo ""

echo "========================================="
echo "If the file exists above but you can't see it,"
echo "you might be in the wrong directory."
echo ""
echo "Make sure you're in:"
echo "/Users/colinroets/dev/pim-admin"
echo "========================================="
