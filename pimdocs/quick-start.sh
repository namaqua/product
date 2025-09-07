#!/bin/bash

# PIM System Quick Start Script
# This script initializes both the backend and frontend projects

echo "🚀 PIM System Quick Start"
echo "========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js LTS first.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL might not be installed. Make sure it's running.${NC}"
fi

# Check if NestJS CLI is installed
if ! command -v nest &> /dev/null; then
    echo -e "${YELLOW}📦 Installing NestJS CLI globally...${NC}"
    npm install -g @nestjs/cli
fi

# Base directory
BASE_DIR="/Users/colinroets/dev"
PIM_DIR="$BASE_DIR/pim"
ADMIN_DIR="$BASE_DIR/pim-admin"

echo -e "${GREEN}📂 Setting up project directories...${NC}"

# ====================
# BACKEND SETUP
# ====================
echo ""
echo -e "${YELLOW}🔧 Setting up Backend (NestJS)...${NC}"
echo "=================================="

if [ ! -d "$PIM_DIR" ]; then
    mkdir -p "$PIM_DIR"
    cd "$PIM_DIR"
    
    echo "📦 Initializing NestJS project..."
    nest new . --skip-git --package-manager npm --skip-install
    
    echo "📦 Installing backend dependencies..."
    npm install @nestjs/config @nestjs/typeorm typeorm pg
    npm install @nestjs/jwt @nestjs/passport passport passport-jwt
    npm install class-validator class-transformer bcryptjs uuid
    npm install multer sharp
    npm install --save-dev @types/bcryptjs @types/passport-jwt @types/multer @types/sharp
    
    # Create .env file
    echo "📝 Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pim_dev
DATABASE_USER=pim_user
DATABASE_PASSWORD=secure_password_change_me
JWT_SECRET=your-secret-key-change-me
JWT_EXPIRES_IN=1d
EOF
    
    echo -e "${GREEN}✅ Backend setup complete!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend directory already exists. Skipping...${NC}"
fi

# ====================
# FRONTEND SETUP
# ====================
echo ""
echo -e "${YELLOW}🎨 Setting up Frontend (React + Tailwind Pro)...${NC}"
echo "================================================"

if [ ! -d "$ADMIN_DIR" ]; then
    cd "$BASE_DIR"
    
    echo "📦 Creating Vite React TypeScript project..."
    npm create vite@latest pim-admin -- --template react-ts
    
    cd "$ADMIN_DIR"
    
    echo "📦 Installing frontend dependencies..."
    npm install
    
    echo "📦 Installing Tailwind CSS..."
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    
    echo "📦 Installing UI dependencies..."
    npm install @headlessui/react @heroicons/react
    npm install react-router-dom zustand
    npm install @tanstack/react-query axios
    npm install react-hook-form
    
    # Update tailwind.config.js
    echo "📝 Configuring Tailwind..."
    cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
    
    # Add Tailwind directives to CSS
    echo "📝 Adding Tailwind CSS directives..."
    cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
    
    # Create .env file
    echo "📝 Creating .env file..."
    cat > .env << EOF
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=PIM Admin
EOF
    
    echo -e "${GREEN}✅ Frontend setup complete!${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend directory already exists. Skipping...${NC}"
fi

# ====================
# DATABASE SETUP
# ====================
echo ""
echo -e "${YELLOW}🗄️  Setting up Database...${NC}"
echo "========================="

# Check if PostgreSQL is running
if command -v psql &> /dev/null; then
    echo "📝 Creating database and user..."
    
    # Create SQL script
    cat > /tmp/pim_db_setup.sql << 'EOF'
-- Create database
CREATE DATABASE pim_dev;
CREATE DATABASE pim_test;

-- Create user
CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
GRANT ALL PRIVILEGES ON DATABASE pim_test TO pim_user;
EOF
    
    echo "🔑 Enter your PostgreSQL superuser password (usually for 'postgres' user):"
    psql -U postgres -f /tmp/pim_db_setup.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database setup complete!${NC}"
        rm /tmp/pim_db_setup.sql
    else
        echo -e "${RED}❌ Database setup failed. Please run the SQL manually:${NC}"
        cat /tmp/pim_db_setup.sql
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please create the databases manually:${NC}"
    echo "CREATE DATABASE pim_dev;"
    echo "CREATE DATABASE pim_test;"
    echo "CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';"
    echo "GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;"
    echo "GRANT ALL PRIVILEGES ON DATABASE pim_test TO pim_user;"
fi

# ====================
# FINAL INSTRUCTIONS
# ====================
echo ""
echo "================================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "================================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update passwords in .env files:"
echo "   - ${PIM_DIR}/.env"
echo "   - ${ADMIN_DIR}/.env"
echo ""
echo "2. Start the backend:"
echo "   cd ${PIM_DIR}"
echo "   npm run start:dev"
echo ""
echo "3. Start the frontend:"
echo "   cd ${ADMIN_DIR}"
echo "   npm run dev"
echo ""
echo "4. Copy Tailwind Pro components:"
echo "   - Review: /Users/colinroets/dev/tailwind-admin Pro"
echo "   - Copy needed components to: ${ADMIN_DIR}/src/components"
echo ""
echo "5. Access the applications:"
echo "   - Backend API: http://localhost:3000"
echo "   - Admin Portal: http://localhost:5173"
echo ""
echo "📚 Documentation: /Users/colinroets/dev/pimdocs/"
echo "📋 Task Tracking: /Users/colinroets/dev/pimdocs/TASKS.md"
echo ""
echo "================================================"
echo -e "${GREEN}Happy coding! 🚀${NC}"
