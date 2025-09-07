# Our Products - Product Information Management System

A modern PIM system built with NestJS and React.

## 🚀 Project Structure

```
/Users/colinroets/dev/projects/product/
├── pim/          # Backend (NestJS + PostgreSQL)
├── pim-admin/    # Frontend (React + Vite + TypeScript)  
├── pimdocs/      # Documentation
└── shell scripts/  # Local development utilities (not in Git)
```

## 🎨 UI Theme
- **Primary**: Navy Blue
- **Accent**: Orange
- **Application Name**: Our Products

## 💻 Tech Stack

### Backend
- NestJS with TypeORM
- PostgreSQL database
- JWT authentication
- Port: 3010

### Frontend  
- React 19 with TypeScript
- Vite build tool
- Tailwind CSS v3.4
- Custom component library

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup
```bash
cd pim
npm install
npm run start:dev
# Runs on http://localhost:3010
# Health check: http://localhost:3010/health
```

### Frontend Setup
```bash
cd pim-admin
npm install  
npm run dev
# Runs on http://localhost:5173
```

### Database Setup
```bash
# Create database and user
psql -U postgres
CREATE DATABASE pim_dev;
CREATE DATABASE pim_test;
CREATE USER pim_user WITH PASSWORD 'secure_password_change_me';
GRANT ALL PRIVILEGES ON DATABASE pim_dev TO pim_user;
GRANT ALL PRIVILEGES ON DATABASE pim_test TO pim_user;
```

## 📊 Project Status

- **Current Phase**: Phase 1 - Foundation
- **Progress**: 10 tasks completed (10.6% overall)
- **Total Tasks**: 94

## 📚 Documentation

See `/pimdocs` for detailed documentation:
- `PROJECT_INSTRUCTIONS.md` - Setup and standards
- `TASKS.md` - Complete task list
- `ARCHITECTURE_OVERVIEW.md` - System design
- `DOMAIN_MODEL_DATABASE.md` - Database schema

## 🔧 Development

### Git Workflow
```bash
# Feature development
git checkout develop
git checkout -b feature/task-xxx-description
git add .
git commit -m "feat: description"
git push origin feature/task-xxx-description
```

### Available Scripts

#### Backend
- `npm run start:dev` - Development with hot reload
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run migration:generate` - Create migration
- `npm run migration:run` - Run migrations

#### Frontend
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run format` - Format code

## 👥 Contributors

- Product Management System Team

## 📄 License

Private - All rights reserved
