#!/bin/bash

# Make all shell scripts executable
cd /Users/colinroets/dev/projects/product/shell-scripts

echo "Making all shell scripts executable..."

chmod +x setup-media-backend.sh
chmod +x test-media-upload.sh

echo "✓ Scripts are now executable"

echo ""
echo "You can now run:"
echo "  ./setup-media-backend.sh    - Install dependencies and run migrations"
echo "  ./test-media-upload.sh       - Test the media upload endpoints"
