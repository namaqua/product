#!/bin/bash

# Make all shell scripts executable
cd /Users/colinroets/dev/projects/product/shell-scripts

echo "Making all shell scripts executable..."
chmod +x *.sh

echo "✅ All scripts are now executable"
echo ""
echo "Available scripts:"
ls -la *.sh | awk '{print "  " $9}'
echo ""
echo "To fix and start the frontend, run:"
echo "  ./quick-start-frontend.sh"
echo ""
echo "To start everything, run:"
echo "  ./start-all.sh"
