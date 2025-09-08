#!/bin/bash

# Universal command runner - handles directory navigation automatically

echo "🎯 PIM Command Runner"
echo "===================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check what command was requested
COMMAND=$1

if [ -z "$COMMAND" ]; then
    echo -e "${YELLOW}Usage:${NC} ./run.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  start      - Start the development server"
    echo "  seed       - Seed the database with sample products"
    echo "  build      - Build/compile TypeScript"
    echo "  test       - Run tests"
    echo "  test-api   - Test all API endpoints"
    echo "  setup      - Full setup and start"
    echo ""
    echo "Examples:"
    echo "  ./run.sh start"
    echo "  ./run.sh seed"
    exit 0
fi

case $COMMAND in
    "start")
        echo -e "${BLUE}Starting development server...${NC}"
        cd /Users/colinroets/dev/projects/product/pim
        npm run start:dev
        ;;
        
    "seed")
        echo -e "${BLUE}Seeding database...${NC}"
        cd /Users/colinroets/dev/projects/product/pim
        npm run seed
        ;;
        
    "build")
        echo -e "${BLUE}Building TypeScript...${NC}"
        cd /Users/colinroets/dev/projects/product/pim
        npm run build
        ;;
        
    "test")
        echo -e "${BLUE}Running tests...${NC}"
        cd /Users/colinroets/dev/projects/product/pim
        npm run test
        ;;
        
    "test-api")
        echo -e "${BLUE}Testing API endpoints...${NC}"
        cd /Users/colinroets/dev/projects/product/shell-scripts
        if [ -f "test-products.sh" ]; then
            ./test-products.sh
        else
            echo -e "${RED}test-products.sh not found${NC}"
        fi
        ;;
        
    "setup")
        echo -e "${BLUE}Running full setup...${NC}"
        cd /Users/colinroets/dev/projects/product/shell-scripts
        if [ -f "full-start.sh" ]; then
            ./full-start.sh
        else
            echo -e "${RED}full-start.sh not found${NC}"
        fi
        ;;
        
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo "Run './run.sh' without arguments to see available commands"
        exit 1
        ;;
esac
