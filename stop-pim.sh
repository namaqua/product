#!/bin/bash

# Stop PIM Development Environment
echo "🛑 Stopping PIM Development Environment..."

# Stop all PIM containers
docker-compose down

echo "✅ PIM environment stopped!"
echo ""
echo "Note: Data is preserved in Docker volumes."
echo "To completely remove data, run: docker-compose down -v"
