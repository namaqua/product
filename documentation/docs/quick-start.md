---
sidebar_position: 2
title: Quick Start
---

# Quick Start Guide

Get My Engines up and running in just 5 minutes! This guide will walk you through the fastest way to set up and start using My Engines.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Docker** and **Docker Compose**
- **Node.js** (v18+) and **npm**
- **Git**

## Quick Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd product
```

### Step 2: Start the Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d
```

This will start PostgreSQL on port 5432 with:
- Database: `pim_dev`
- Username: `pim_user`
- Password: `pim_password`

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd engines
npm install

# Install frontend dependencies
cd ../admin
npm install
```

### Step 4: Run Database Migrations

```bash
# From the engines directory
cd ../engines
npm run migration:run
```

### Step 5: Start the Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd engines
npm run start:dev
```
Backend will be available at: http://localhost:3010

**Terminal 2 - Frontend:**
```bash
cd admin
npm run dev
```
Frontend will be available at: http://localhost:5173

## You're Ready!

Visit http://localhost:5173 and log in with the default credentials:
- **Email**: admin@example.com
- **Password**: Admin123!

## First Steps

### 1. Create Your First Product

1. Navigate to **Products** → **New Product**
2. Fill in the basic information:
   - SKU: `PROD-001`
   - Name: `Sample Product`
   - Status: `Active`
3. Add media using the **Product Media** section
4. Click **Save**

### 2. Upload Media

1. Go to **Media Library**
2. Click **Upload Files**
3. Drag and drop images or click to browse
4. Your media is now available across the system

### 3. Set Up Categories

1. Navigate to **Categories**
2. Click **Add Category**
3. Create your category hierarchy
4. Assign products to categories

## Available Scripts

### Backend (engines/)
```bash
npm run start:dev     # Start in development mode
npm run build        # Build for production
npm run test         # Run tests
npm run migration:generate  # Generate new migration
npm run migration:run       # Run pending migrations
```

### Frontend (admin/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

## Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 3010 | http://localhost:3010/api |
| Swagger Docs | 3010 | http://localhost:3010/api/docs |
| PostgreSQL | 5432 | postgresql://localhost:5432/pim_dev |

## Project Structure

```
product/
├── engines/          # Backend (NestJS)
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── common/   # Shared utilities
│   │   └── main.ts   # Application entry
│   └── uploads/      # Media storage
├── admin/           # Frontend (React)
│   ├── src/
│   │   ├── features/ # Feature components
│   │   ├── services/ # API services
│   │   └── App.tsx   # Main component
├── docker-compose.yml
└── documentation/    # This documentation
```

## Common Tasks

### Reset the Database
```bash
docker-compose down -v
docker-compose up -d
cd engines && npm run migration:run
```

### Clear Media Files
```bash
rm -rf engines/uploads/*
```

### View Logs
```bash
# Backend logs
cd engines && npm run start:dev

# Database logs
docker logs postgres-pim -f
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3010 (backend)
lsof -ti:3010 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres-pim

# Restart PostgreSQL
docker-compose restart
```

### Missing Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [Installation Guide](./installation) - Detailed setup instructions
- [Architecture Overview](./architecture/overview) - Understand the system design
- [User Guide](./guides/managing-products) - Learn to use My Engines effectively
- [API Documentation](./api/overview) - Integrate with external systems

---

Need help? Check the [troubleshooting guide](./troubleshooting) or report an issue on GitHub.
