#!/bin/bash

# Install missing type definitions
npm install --save-dev @types/node

# Check if all dependencies are installed properly
npm install

echo "Dependencies installed. Starting dev server..."
npm run dev
