# PIM (Product Information Management) System

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Status](https://img.shields.io/badge/status-production%20ready-green)
![API](https://img.shields.io/badge/API-standardized-success)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)

A modern, full-featured Product Information Management system built with NestJS and React.

## 🚀 Features

### Core Functionality
- ✅ **Product Management** - Complete CRUD with variants support
- ✅ **Category Management** - Hierarchical nested set model
- ✅ **Attribute System** - 13 types with EAV pattern
- ✅ **Media Management** - Upload, gallery, and associations
- ✅ **Import/Export** - Full UI with drag & drop, templates, validation
- ✅ **User Management** - Role-based access control (RBAC)
- ✅ **Search & Filtering** - Advanced search with faceted navigation
- ✅ **Authentication** - JWT with refresh tokens

### Import/Export Features (NEW!)
- 📤 **Import Wizard** - 5-step process with validation
- 📥 **Export Manager** - Configurable exports with field selection
- 📊 **Job Tracking** - Real-time status updates
- 🗺️ **Mapping Templates** - Reusable field mappings
- 📄 **Template Downloads** - CSV/Excel templates for all data types

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS 10.x
- **Language:** TypeScript
- **Database:** PostgreSQL 16 (Docker)
- **ORM:** TypeORM
- **Authentication:** JWT with Passport
- **Validation:** class-validator
- **File Processing:** Multer, ExcelJS, PapaParse

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Framework:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **File Upload:** react-dropzone
- **Date Handling:** date-fns

### Infrastructure
- **Container:** Docker & Docker Compose
- **Process Manager:** PM2 (production)
- **Reverse Proxy:** Nginx (production)
- **Target Platform:** DigitalOcean

## 📊 System Metrics

- **API Response:** ~150ms average
- **Page Load:** < 1.5s
- **Product Capacity:** 15,000+ tested
- **Concurrent Users:** 150+ tested
- **Import File Size:** Up to 10MB
- **Type Coverage:** 100% TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x LTS
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository:**
```bash
git clone [repository-url]
cd product
```

2. **Start the database:**
```bash
docker-compose up -d
```

3. **Install backend dependencies:**
```bash
cd engines
npm install
npm run migration:run
```

4. **Install frontend dependencies:**
```bash
cd ../admin
npm install
```

5. **Start development servers:**

Backend (Terminal 1):
```bash
cd engines
npm run start:dev
```

Frontend (Terminal 2):
```bash
cd admin
npm run dev
```

6. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3010/api
- Login: admin@test.com / Admin123!

## 📁 Project Structure

```
/product
├── /engines              # Backend (NestJS)
│   ├── /src             
│   │   ├── /modules     # Feature modules
│   │   ├── /common      # Shared utilities
│   │   └── main.ts      # Entry point
│   └── /dist            # Compiled output
├── /admin               # Frontend (React)
│   ├── /src
│   │   ├── /features    # Feature components
│   │   ├── /services    # API services
│   │   └── /components  # Shared components
│   └── /dist            # Build output
├── /docs                # Documentation
├── /shell-scripts       # Utility scripts
└── docker-compose.yml   # Docker configuration
```

## 🎯 API Standardization

All API responses follow a consistent format:

```typescript
{
  success: boolean,
  data: T,
  message?: string,
  timestamp: string
}
```

## 🔧 Available Scripts

### Backend
```bash
npm run start:dev        # Start development server
npm run build           # Build for production
npm run start:prod      # Start production server
npm run migration:run   # Run database migrations
npm run test           # Run tests
```

### Frontend
```bash
npm run dev            # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run test          # Run tests
```

### Utility Scripts
```bash
./shell-scripts/test-import-export-ui.sh    # Test Import/Export
./shell-scripts/FINAL-TEMPLATE-FIX.sh       # Fix template downloads
```

## 📚 Documentation

- [Project Status](./docs/PROJECT_STATUS.md)
- [API Documentation](./docs/API_STANDARDIZATION_FINAL_REPORT.md)
- [Deployment Guide](./docs/DEPLOYMENT_CHECKLIST.md)
- [Project Instructions](./docs/PROJECT_INSTRUCTIONS.md)
- [Changelog](./docs/CHANGELOG.md)
- [Import/Export Guide](./admin/src/features/import-export/README.md)

## 🚀 Deployment

The system is production-ready for deployment to DigitalOcean. See [DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md) for detailed instructions.

### Quick Deployment Steps:
1. Set up DigitalOcean Droplet (Ubuntu 22.04, 2GB+ RAM)
2. Install Node.js, PostgreSQL, Nginx
3. Configure environment variables
4. Build and deploy application
5. Set up SSL with Certbot
6. Configure PM2 for process management

## 🧪 Testing

```bash
# Run all tests
cd engines && npm test
cd ../admin && npm test

# Test Import/Export UI
./shell-scripts/test-import-export-ui.sh

# Test API standardization
./shell-scripts/test-auth-standardization.sh
```

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation on all endpoints
- SQL injection protection via TypeORM
- XSS protection in React
- Environment-based configuration
- bcrypt password hashing

## 📈 Performance Optimizations

- Database indexes on frequently queried fields
- Lazy loading for large datasets
- Efficient nested set operations for categories
- Batch processing for imports
- Connection pooling for database

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project uses open-source tools and libraries only.

## 🙏 Acknowledgments

- NestJS for the excellent backend framework
- React team for the frontend library
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Status:** Production Ready 🎉  
**Version:** 2.1.0  
**Last Updated:** September 14, 2025
