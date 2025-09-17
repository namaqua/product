#!/bin/bash

# Ultra-quick start - minimal output
cd /Users/colinroets/dev/projects/product
docker-compose up -d > /dev/null 2>&1
cd engines && npm run start:dev > /dev/null 2>&1 &
cd ../admin && npm run dev > /dev/null 2>&1 &
echo "✅ Started: Backend:3010 Frontend:5173 DB:5433"
echo "📧 Login: admin@test.com / Admin123!"