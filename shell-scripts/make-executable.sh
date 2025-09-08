#!/bin/bash

# Make all shell scripts executable
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/*.sh
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/frontend-debug/*.sh 2>/dev/null || true

echo "✅ All shell scripts are now executable"
echo ""
echo "Available scripts:"
ls -la /Users/colinroets/dev/projects/product/shell-scripts/*.sh | awk '{print "  - " $NF}'
