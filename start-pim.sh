#!/bin/bash

# Start PIM Development Environment
echo "🚀 Starting PIM Development Environment..."

# Stop any existing containers
docker-compose down 2>/dev/null

# Start PostgreSQL for PIM
echo "📦 Starting PostgreSQL on port 5433..."
docker-compose up -d postgres-pim

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if database is ready
until docker exec postgres-pim pg_isready -U pim_user -d pim_dev; do
  echo "Waiting for database..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Optional: Start Redis if needed
read -p "Do you want to start Redis cache? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "📦 Starting Redis on port 6380..."
  docker-compose up -d redis-pim
  echo "✅ Redis is ready!"
fi

echo ""
echo "🎉 PIM Development Environment is ready!"
echo ""
echo "Database: postgresql://pim_user:secure_password_change_me@localhost:5433/pim_dev"
echo ""
echo "To start the backend:"
echo "  cd pim && npm run start:dev"
echo ""
echo "To stop everything:"
echo "  ./stop-pim.sh"
