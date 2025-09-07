#!/bin/bash

# Initialize NestJS Backend Project
# Run this from the pimdocs directory

echo "🚀 Initializing NestJS Backend Project"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if NestJS CLI is installed
if ! command -v nest &> /dev/null; then
    echo -e "${YELLOW}📦 Installing NestJS CLI globally...${NC}"
    npm install -g @nestjs/cli
fi

# Navigate to dev directory
cd /Users/colinroets/dev

# Remove empty pim directory if it exists
if [ -d "pim" ]; then
    echo -e "${YELLOW}Removing empty pim directory...${NC}"
    rm -rf pim
fi

# Create NestJS project
echo -e "${GREEN}📦 Creating NestJS project...${NC}"
nest new pim --package-manager npm

# Navigate to project
cd pim

echo -e "${GREEN}📦 Installing additional dependencies...${NC}"

# Core dependencies
npm install @nestjs/config @nestjs/typeorm typeorm pg

# Authentication dependencies  
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local

# Validation and utility
npm install class-validator class-transformer bcryptjs uuid

# File handling
npm install multer sharp

# Dev dependencies
npm install --save-dev @types/bcryptjs @types/passport-jwt @types/passport-local @types/multer @types/sharp

echo -e "${GREEN}📝 Creating .env file...${NC}"
cat > .env << 'EOF'
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pim_dev
DATABASE_USER=pim_user
DATABASE_PASSWORD=secure_password_change_me

# JWT
JWT_SECRET=your-secret-key-change-me-to-something-secure
JWT_EXPIRES_IN=1d

# Logging
LOG_LEVEL=debug
EOF

echo -e "${GREEN}📝 Creating .env.example file...${NC}"
cp .env .env.example

echo -e "${GREEN}📁 Creating folder structure...${NC}"
mkdir -p src/common/entities
mkdir -p src/common/dto
mkdir -p src/common/decorators
mkdir -p src/common/filters
mkdir -p src/common/guards
mkdir -p src/common/interceptors
mkdir -p src/common/pipes
mkdir -p src/common/utils
mkdir -p src/config
mkdir -p src/core/auth
mkdir -p src/modules

echo -e "${GREEN}✅ NestJS Backend setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update the database password in .env"
echo "2. Test the installation:"
echo "   cd /Users/colinroets/dev/pim"
echo "   npm run start:dev"
echo ""
echo "The server should start on http://localhost:3000"
