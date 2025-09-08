#!/bin/bash

# Make all scripts executable
cd /Users/colinroets/dev/projects/product/shell-scripts

echo "Setting executable permissions..."
chmod +x *.sh

echo "✅ All scripts are now executable!"
echo ""
echo "Available scripts:"
ls -la *.sh
echo ""
echo "Recommended next step:"
echo "  ./quick-start.sh"
