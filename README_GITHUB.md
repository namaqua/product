# Product Management System

A comprehensive, enterprise-grade Product Management system built with modern technologies and best practices. Features complete product lifecycle management, variant handling, import/export capabilities, and a powerful media library.

## 🚀 Features

### Core Capabilities
- **Product Management**: Full CRUD operations with 66+ endpoints
- **Variant System**: Multi-axis variant generation with 30+ templates
- **Category Hierarchy**: Nested set model for unlimited depth
- **Dynamic Attributes**: 13 attribute types with EAV pattern
- **Media Library**: Image processing, bulk operations, 21 endpoints
- **Import/Export**: CSV/Excel support with background processing
- **User Management**: Role-based access control with JWT authentication
- **API Standards**: 93% standardized responses across 120+ endpoints

### Performance Metrics
- Import Speed: ~1000 records/second
- Export Speed: ~500 records/second
- API Response: ~50ms average
- Variant Generation: <2s for 100 variants

## 🛠️ Tech Stack

### Backend (/engines)
- **Framework**: NestJS (Latest)
- **Language**: TypeScript 5.1.3
- **Database**: PostgreSQL 13
- **ORM**: TypeORM
- **Queue**: Bull
- **Auth**: JWT with Passport
- **Docs**: Swagger/OpenAPI

### Frontend (/admin)
- **Framework**: React 18
- **UI**: Tailwind CSS Pro
- **State**: React Context
- **Build**: Vite
- **HTTP**: Axios

### Infrastructure
- **Container**: Docker & Docker Compose
- **Node**: v18+ LTS
- **Package Manager**: npm

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Docker Desktop
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/namaqua/product.git
cd product
```

2. **Start Docker services**
```bash
docker-compose up -d
```

3. **Backend Setup**
```bash
cd engines
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

4. **Frontend Setup**
```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3010
- API Docs: http://localhost:3010/api/docs

## 🔧 Configuration

### Environment Variables

#### Backend (/engines/.env)
```env
NODE_ENV=development
PORT=3010
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=product_dev
DATABASE_USER=product_user
DATABASE_PASSWORD=secure_password_change_me
JWT_SECRET=your-secret-key
```

#### Frontend (/admin/.env)
```env
VITE_API_URL=http://localhost:3010/api
```

## 📁 Project Structure

```
product/
├── engines/           # NestJS backend services
│   ├── src/
│   │   ├── modules/   # Feature modules
│   │   ├── common/    # Shared utilities
│   │   └── main.ts    # Application entry
│   └── migrations/    # Database migrations
├── admin/            # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   └── services/
│   └── public/
├── docs/             # Project documentation
├── shell-scripts/    # Local automation scripts
├── docker-compose.yml
└── README.md
```

## 🚦 API Documentation

### Swagger UI
Access interactive API documentation at: http://localhost:3010/api/docs

### Key Endpoints

#### Products
- `GET /api/products` - List products with pagination
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Import/Export
- `POST /api/import-export/import` - Import CSV/Excel
- `GET /api/import-export/export` - Export data
- `GET /api/import-export/templates/:type` - Download templates

#### Media
- `POST /api/media/upload` - Upload files
- `GET /api/media/:id` - Get media item
- `DELETE /api/media/:id` - Delete media

## 🧪 Testing

```bash
# Backend tests
cd engines
npm run test
npm run test:e2e

# Frontend tests
cd admin
npm run test
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Database access (container name: postgres-product)
docker exec -it postgres-product psql -U product_user -d product_dev

# Rebuild containers
docker-compose build --no-cache
```

## 📊 Database

### Migrations
```bash
# Create migration
npm run migration:create -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Backup & Restore
```bash
# Backup
docker exec postgres-product pg_dump -U product_user product_dev > backup.sql

# Restore
docker exec -i postgres-product psql -U product_user product_dev < backup.sql
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd engines
npm run build
npm run start:prod
```

#### Frontend
```bash
cd admin
npm run build
npm run preview
```

### DigitalOcean Deployment
See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📈 Current Status

### Completed Modules (December 2024)
- ✅ Products (100%)
- ✅ Categories (100%)
- ✅ Attributes (100%)
- ✅ Media (100%)
- ✅ Users (100%)
- ✅ Import/Export (100%)
- ⏳ Auth (Standardization pending)

### Roadmap
- [ ] Advanced Search with Elasticsearch
- [ ] Redis Caching Layer
- [ ] Workflow Engine
- [ ] Reports & Analytics
- [ ] Multi-tenancy Support

## 🐛 Known Issues

1. Auth module needs API standardization (9 endpoints)
2. Refresh token endpoint returns 401
3. Large file uploads (>50MB) may timeout
4. Categories/attributes lazy loading sometimes returns null

See [docs/TASKS.md](docs/TASKS.md) for detailed status.

## 📚 Documentation

- [Project Instructions](docs/PROJECT_INSTRUCTIONS.md) - Setup and development guide
- [API Standards](docs/API_STANDARDIZATION_FINAL_REPORT.md) - API design patterns
- [System Status](docs/SYSTEM_STATUS_REPORT.md) - Current system metrics
- [Tasks](docs/TASKS.md) - Development progress tracking
- [Import/Export Guide](docs/IMPORT_EXPORT_USER_GUIDE.md) - Import/Export usage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Colin Roets - Initial work

## 🙏 Acknowledgments

- NestJS team for the excellent framework
- Tailwind CSS for the UI components
- PostgreSQL for the robust database
- All open source contributors

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing documentation in `/docs`
- Review the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

---

**Version**: 1.0.0-beta  
**Last Updated**: December 2024  
**Status**: Production Ready (93% Complete)  
**Repository**: https://github.com/namaqua/product
