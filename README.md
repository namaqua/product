# PIM (Product Information Management) System

A modern, scalable Product Information Management system built with NestJS, PostgreSQL, and React. This enterprise-grade solution provides comprehensive product data management with dynamic attributes, hierarchical categorization, and flexible workflows.

## 🚀 Features

### Core Functionality
- **Dynamic Product Management**: 40+ product fields with variant support
- **Hierarchical Categories**: Nested Set Model for efficient tree operations  
- **Flexible Attributes**: EAV pattern supporting 13 attribute types
- **Inventory Tracking**: Real-time stock management with low-stock alerts
- **Role-Based Access**: Multi-tier authorization (Admin, Manager, User)
- **Bulk Operations**: Efficient handling of large datasets

### Technical Highlights
- **54 RESTful API Endpoints**: Comprehensive API coverage
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Docker Infrastructure**: Containerized development environment
- **TypeORM Integration**: Advanced ORM with migrations and audit logging
- **Swagger Documentation**: Auto-generated API documentation
- **Production Ready**: Error handling, validation, and logging

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS v10
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Tailwind CSS v3.4
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Fetching**: React Query + Axios
- **Components**: Tailwind Pro components

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload with nodemon
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier

## 📦 Project Structure

```
product/
├── pim/                    # Backend application (NestJS)
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication & authorization
│   │   │   ├── users/      # User management
│   │   │   ├── products/   # Product management
│   │   │   ├── categories/ # Category hierarchy
│   │   │   └── attributes/ # Dynamic attributes (EAV)
│   │   ├── common/         # Shared utilities
│   │   └── config/         # Configuration
│   └── test/               # Test suites
├── pim-admin/              # Frontend application (React)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature modules
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API services
├── pimdocs/                # Documentation
├── shell-scripts/          # Development scripts
└── docker-compose.yml      # Docker configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Installation

1. **Clone the repository**
```bash
git clone git@github.com:namaqua/product.git
cd product
```

2. **Start Docker services**
```bash
docker-compose up -d
```

3. **Install backend dependencies**
```bash
cd engines
npm install
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start backend**
```bash
npm run start:dev
```

6. **Install frontend dependencies** (in new terminal)
```bash
cd engines-admin
npm install
```

7. **Start frontend**
```bash
npm run dev
```

### Access Points
- **Backend API**: http://localhost:3010
- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:3010/api/docs
- **Health Check**: http://localhost:3010/health

## 📊 API Modules

### Authentication (8 endpoints)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user
- `PATCH /auth/profile` - Update profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Products (11 endpoints)
- `GET /products` - List products with filtering
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product
- `POST /products/:id/restore` - Restore deleted product
- `GET /products/low-stock` - Get low stock products
- `GET /products/featured` - Get featured products
- `POST /products/bulk` - Bulk operations
- `PATCH /products/:id/inventory` - Update inventory
- `GET /products/sku/:sku` - Find by SKU

### Categories (15 endpoints)
- Full CRUD operations
- Tree navigation (ancestors, descendants, siblings)
- Breadcrumb generation
- Move operations for reorganization
- Featured and menu categories

### Attributes (14 endpoints)
- Attribute and group management
- Dynamic value assignment
- Filterable attributes for faceted search
- Bulk value operations
- Validation rules

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd engines
npm run test
npm run test:e2e

# Test specific module
cd shell-scripts
./test-attributes-module.sh
```

### Database Management
```bash
# Connect to database
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate -- -n MigrationName
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## 📈 Performance

- **Nested Set Model**: O(1) tree operations without recursion
- **Indexed Queries**: Strategic indexing on frequently queried fields
- **Bulk Operations**: Efficient handling of large datasets
- **Connection Pooling**: Optimized database connections
- **Response Caching**: Redis integration ready

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Granular permission system
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: TypeORM parameterized queries
- **XSS Protection**: Input sanitization
- **Rate Limiting**: Ready for implementation

## 📚 Documentation

Comprehensive documentation is available in the `/pimdocs` directory:

- **Architecture Overview**: System design and patterns
- **API Specifications**: Complete endpoint documentation
- **Domain Model**: Database schema and relationships
- **Implementation Roadmap**: 20-week development plan
- **Module Documentation**: Detailed module guides

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Team

- **Backend Development**: NestJS, TypeORM, PostgreSQL
- **Frontend Development**: React, TypeScript, Tailwind CSS
- **DevOps**: Docker, CI/CD pipeline
- **Architecture**: Domain-driven design, Modular monolith

## 📊 Project Status

- **Phase 1**: Foundation - 56% Complete ✅
- **Current Sprint**: Backend core modules
- **Next Priority**: Frontend integration
- **Timeline**: 20-week implementation plan
- **Progress**: 18/94 tasks completed (19.1%)

## 🚀 Roadmap

### ✅ Completed
- Environment setup
- Authentication system
- Product management
- Category hierarchy
- Dynamic attributes

### 🔄 In Progress
- Frontend integration
- Media management
- Import/Export

### 📅 Upcoming
- Workflow engine
- Multi-language support
- Channel syndication
- Advanced search
- Analytics dashboard

## 💡 Key Features Coming Soon

- **AI-Powered Enrichment**: Automatic product descriptions
- **Image Recognition**: Auto-tagging and categorization
- **Elasticsearch Integration**: Advanced search capabilities
- **Real-time Collaboration**: Multi-user editing
- **Mobile App**: iOS/Android companion apps

## 📞 Support

For questions or issues:
- Check the documentation in `/pimdocs`
- Review the troubleshooting guide
- Open an issue on GitHub

---

Built with ❤️ using NestJS and React
