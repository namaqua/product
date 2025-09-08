#!/bin/bash

# Make all shell scripts executable

echo "Setting executable permissions for all shell scripts..."

# Navigate to shell scripts directory
cd /Users/colinroets/dev/projects/product/shell-scripts

# Make all .sh files executable
chmod +x *.sh

# List the scripts
echo ""
echo "✅ The following scripts are now executable:"
echo "================================"
ls -la *.sh
echo "================================"

echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "1. Start the Product Module:"
echo "   ./start-product-module.sh"
echo ""
echo "2. Test the Product API:"
echo "   ./test-products.sh"
echo ""
echo "3. Run other scripts as needed"
echo ""
echo "💡 Tip: The start-product-module.sh script will:"
echo "   - Check dependencies"
echo "   - Run migrations"
echo "   - Seed sample data"
echo "   - Start the backend server"
