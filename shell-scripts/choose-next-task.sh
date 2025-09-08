#!/bin/bash

# Quick start for next task

echo "========================================="
echo "Quick Start - What to do RIGHT NOW"
echo "========================================="
echo ""

# Check if backend is running
echo "Step 1: Checking backend status..."
curl -s http://localhost:3010/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "⚠️  Backend not running. Start it with:"
    echo "   cd /Users/colinroets/dev/projects/product/pim"
    echo "   npm run start:dev"
    echo ""
fi

echo ""
echo "Step 2: Choose your next task:"
echo ""
echo "========================================="
echo "Option A: BUILD PRODUCT MODULE (Recommended) 🎯"
echo "========================================="
echo "This is the CORE of your PIM system!"
echo ""
echo "We'll create:"
echo "- Product entity with all fields"
echo "- Product categories & attributes"
echo "- Product CRUD operations"
echo "- Product search & filtering"
echo "- SKU management"
echo "- Pricing & inventory"
echo ""
echo "Ready? Type: A"
echo ""
echo "========================================="
echo "Option B: BUILD COMMON UTILITIES 🔧"
echo "========================================="
echo "Foundation utilities for all modules"
echo ""
echo "We'll create:"
echo "- Pagination helpers"
echo "- Search/filter DTOs"
echo "- Error handling"
echo "- Response formatting"
echo ""
echo "Ready? Type: B"
echo ""
echo "========================================="
echo "Option C: TEST & COMMIT 📦"
echo "========================================="
echo "Test everything and save progress"
echo ""
echo "Ready? Type: C"
echo ""
read -p "Your choice (A/B/C): " -n 1 -r
echo ""

case $REPLY in
    [Aa]* )
        echo ""
        echo "✅ Great choice! Let's build the Product Module!"
        echo ""
        echo "This is Task 16 - The heart of your PIM system"
        echo "We'll create a full product management system"
        ;;
    [Bb]* )
        echo ""
        echo "✅ Let's build the common utilities first!"
        echo ""
        echo "This is Task 15 - Foundation for all modules"
        ;;
    [Cc]* )
        echo ""
        echo "✅ Let's test and commit your progress!"
        echo ""
        echo "Run: ./test-auth-endpoints.sh"
        echo "Then: ./commit-task-14.sh"
        ;;
    * )
        echo ""
        echo "Invalid choice. Run this script again."
        ;;
esac
