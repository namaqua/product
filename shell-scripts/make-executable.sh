#!/bin/bash

# Make all shell scripts executable
echo "Setting execute permissions on all shell scripts..."

cd /Users/colinroets/dev/projects/product
chmod +x shell-scripts/*.sh

echo "✅ All scripts are now executable"
echo ""
echo "Available scripts:"
ls -la shell-scripts/*.sh | awk '{print "  - " $NF}' | sed 's|.*/||'
