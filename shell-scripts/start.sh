#!/bin/bash

echo "======================================"
echo "   🚀 SIMPLE START FOR PIM MODULE"
echo "======================================"
echo ""
echo "This script will:"
echo "  1. Go to the correct directory"
echo "  2. Install dependencies"
echo "  3. Start the server"
echo "  4. Auto-create all database tables"
echo ""
echo "Press Enter to continue..."
read

# Go to backend directory
cd /Users/colinroets/dev/projects/product/pim

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo ""
echo "🚀 Starting server..."
echo ""
echo "📍 Server: http://localhost:3010"
echo "🔍 Health: http://localhost:3010/health"
echo ""
echo "To seed sample data, open another terminal and run:"
echo "  cd /Users/colinroets/dev/projects/product/pim"
echo "  npm run seed"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run start:dev
