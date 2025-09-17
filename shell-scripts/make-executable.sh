#!/bin/bash

# Make all shell scripts executable
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x *.sh
echo "✅ All shell scripts are now executable"
echo ""
echo "Available scripts:"
ls -1 *.sh | sed 's/^/  ./g'