#!/bin/bash

# Script: setup-code-quality.sh
# Purpose: Install and configure ESLint and Prettier for both backend and frontend
# Usage: ./shell\ scripts/setup-code-quality.sh
# Date: 2025-01-07

echo "🎨 Setting up ESLint and Prettier"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project root
cd /Users/colinroets/dev/projects/product

# ============================================
# BACKEND SETUP
# ============================================
echo -e "${BLUE}📦 Setting up Backend (NestJS) code quality tools...${NC}"
echo ""
cd engines

# Install Prettier and ESLint integration
echo "Installing Prettier dependencies..."
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# Create .prettierrc
echo -e "${YELLOW}Creating .prettierrc...${NC}"
cat > .prettierrc << 'EOF'
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
EOF

# Create .prettierignore
cat > .prettierignore << 'EOF'
# Dependencies
node_modules
dist
build

# IDE
.idea
.vscode

# Logs
*.log

# Environment
.env
.env.*

# Generated files
*.generated.ts
*.generated.js
EOF

# Update .eslintrc.js
echo -e "${YELLOW}Updating .eslintrc.js...${NC}"
cat > .eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }],
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
  },
};
EOF

# Add scripts to package.json
echo -e "${YELLOW}Adding lint and format scripts to package.json...${NC}"
npm pkg set scripts.lint="eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
npm pkg set scripts.format="prettier --write \"src/**/*.ts\" \"test/**/*.ts\""
npm pkg set scripts.format:check="prettier --check \"src/**/*.ts\" \"test/**/*.ts\""

echo -e "${GREEN}✅ Backend code quality tools configured!${NC}"
echo ""

# ============================================
# FRONTEND SETUP
# ============================================
echo -e "${BLUE}🎨 Setting up Frontend (React) code quality tools...${NC}"
echo ""
cd ../pim-admin

# Install Prettier and ESLint plugins
echo "Installing Prettier and ESLint dependencies..."
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Create .prettierrc (same as backend)
echo -e "${YELLOW}Creating .prettierrc...${NC}"
cat > .prettierrc << 'EOF'
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
EOF

# Create .prettierignore
cat > .prettierignore << 'EOF'
# Dependencies
node_modules
dist
build

# IDE
.idea
.vscode

# Logs
*.log

# Environment
.env
.env.*

# Generated files
*.generated.ts
*.generated.tsx
*.generated.js
EOF

# Update eslint.config.js for React/TypeScript
echo -e "${YELLOW}Updating eslint.config.js...${NC}"
cat > eslint.config.js << 'EOF'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'build', 'coverage'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettierConfig
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prettier': prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
  },
)
EOF

# Add scripts to package.json
echo -e "${YELLOW}Adding lint and format scripts to package.json...${NC}"
npm pkg set scripts.lint="eslint . --fix"
npm pkg set scripts.lint:check="eslint ."
npm pkg set scripts.format="prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""
npm pkg set scripts.format:check="prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""

echo -e "${GREEN}✅ Frontend code quality tools configured!${NC}"
echo ""

# ============================================
# ROOT MONOREPO SETUP
# ============================================
echo -e "${BLUE}🔧 Setting up root monorepo scripts...${NC}"
echo ""
cd ..

# Add combined scripts to root package.json
echo -e "${YELLOW}Adding monorepo lint and format scripts...${NC}"
npm pkg set scripts.lint="npm run lint:backend && npm run lint:frontend"
npm pkg set scripts.lint:backend="cd engines && npm run lint"
npm pkg set scripts.lint:frontend="cd engines-admin && npm run lint"
npm pkg set scripts.format="npm run format:backend && npm run format:frontend"
npm pkg set scripts.format:backend="cd engines && npm run format"
npm pkg set scripts.format:frontend="cd engines-admin && npm run format"
npm pkg set scripts.format:check="npm run format:check:backend && npm run format:check:frontend"
npm pkg set scripts.format:check:backend="cd engines && npm run format:check"
npm pkg set scripts.format:check:frontend="cd engines-admin && npm run format:check"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Code Quality Tools Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "📋 Available Commands:"
echo ""
echo "  From project root:"
echo "    npm run lint         - Lint both projects"
echo "    npm run format       - Format both projects"
echo "    npm run format:check - Check formatting"
echo ""
echo "  Backend only (cd engines):"
echo "    npm run lint         - Fix linting issues"
echo "    npm run format       - Format code"
echo ""
echo "  Frontend only (cd engines-admin):"
echo "    npm run lint         - Fix linting issues"
echo "    npm run format       - Format code"
echo ""
echo "🎯 Next Steps:"
echo "  1. Run 'npm run format' to format existing code"
echo "  2. Run 'npm run lint' to check for issues"
echo "  3. Consider adding pre-commit hooks with husky"
echo "  4. Configure VS Code to format on save"
