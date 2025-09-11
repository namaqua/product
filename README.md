# Product Information Management (PIM) System

A modern, enterprise-grade Product Information Management system built with NestJS, PostgreSQL, and React. This monorepo solution provides comprehensive product data management with dynamic attributes, hierarchical categorization, media management, and flexible workflows.

## 🚀 Current Status

- **Backend**: ✅ 100% Complete (66+ API endpoints)
- **Frontend**: 🔄 70% Complete (Core features working)
- **Database**: ✅ PostgreSQL with TypeORM
- **Authentication**: ✅ JWT with refresh tokens
- **Media Management**: ✅ Full upload/gallery system
- **Production Ready**: Error handling, validation, and logging

## 🛠️ Technology Stack

### Backend (engines/)
- **Framework**: NestJS v10
- **Database**: PostgreSQL 15 (Docker, port 5433)
- **ORM**: TypeORM with migrations
- **Authentication**: JWT + Passport
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Storage**: Local filesystem with static serving

### Frontend (admin/)
- **Framework**: React 18 with TypeScript
- **UI Library**: Tailwind CSS v3.4
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Fetching**: Axios
- **Forms**: react-hook-form with Zod validation
- **Components**: Custom Tailwind components

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git monorepo

## 📦 Project Structure

```
product/                        # Monorepo root
├── engines/                    # Backend (NestJS)
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # JWT authentication (8 endpoints)
│   │   │   ├── users/         # User management (9 endpoints)
│   │   │   ├── products/      # Product CRUD (11 endpoints)
│   │   │   ├── categories/    # Nested set tree (15+ endpoints)
│   │   │   ├── attributes/    # EAV pattern (14 endpoints)
│   │   │   └── media/         # File uploads (9 endpoints)
│   │   ├── common/            # Shared utilities & decorators
│   │   └── config/            # App configuration
│   └── uploads/               # Media storage
├── admin/                      # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/         # ✅ Login/logout
│   │   │   ├── products/     # ✅ Full CRUD with media
│   │   │   ├── categories/   # ✅ Tree management
│   │   │   ├── attributes/   # ⏳ Not started
│   │   │   └── users/        # ⏳ Not started
│   │   ├── hooks/            # Custom React hooks
│   │   └── services/         # API client services
├── docs/                      # Documentation
├── shell-scripts/             # Automation scripts
└── docker-compose.yml         # PostgreSQL + Redis
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Installation

```bash
# 1. Clone the repository
git clone git@github.com:namaqua/product.git
cd product

# 2. Start Docker services (PostgreSQL + Redis)
docker-compose up -d

# 3. Install all dependencies (uses npm workspaces)
npm install

# 4. Start the backend
cd engines && npm run start:dev

# 5. Start the frontend (new terminal)
cd admin && npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3010/api/v1
- **API Documentation**: http://localhost:3010/api/docs
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6380

### Default Credentials
```
Email: admin@test.com
Password: Admin123!
```

## 📊 API Structure

All API responses follow a consistent wrapped format:

```json
{
    "success": true,
    "data": {
        // Response data here
    },
    "timestamp": "2025-09-11T19:35:12.806Z"
}
```

### Collection Responses
```json
{
    "success": true,
    "data": {
        "items": [...],
        "meta": {
            "totalItems": 100,
            "itemCount": 20,
            "itemsPerPage": 20,
            "totalPages": 5,
            "currentPage": 1
        }
    }
}
```

## 🎯 Features

### ✅ Completed Features

#### Authentication & Authorization
- JWT with refresh tokens
- Role-based access control (Admin, Manager, User)
- Protected routes and API endpoints
- Profile management

#### Product Management
- Full CRUD operations
- 40+ product fields
- Product variants support
- Archive/restore functionality
- Duplicate products
- Bulk operations
- URL slug management
- Special pricing

#### Category Management
- Nested Set Model for hierarchical data
- Drag-and-drop tree interface
- Unlimited nesting levels
- Breadcrumb generation
- Efficient tree operations

#### Media Management
- Drag-and-drop file upload
- Image gallery with lightbox
- Primary image selection
- Multiple images per product
- Progress indicators
- Static file serving

### 🔄 In Progress

#### Attribute Management (Backend Complete)
- EAV (Entity-Attribute-Value) pattern
- 13 attribute types supported
- Attribute groups and sets
- Dynamic validation rules
- Frontend UI pending

#### User Management (Backend Complete)
- User CRUD operations
- Role assignment
- Password management
- Frontend UI pending

### 📅 Upcoming Features
- Import/Export (CSV, Excel)
- Advanced search with filters
- Workflow automation
- Multi-language support
- Audit logging
- Real-time notifications

## 🔧 Development

### Running the Project

```bash
# Start everything
npm run dev  # Starts both backend and frontend

# Or start individually
cd engines && npm run start:dev  # Backend
cd admin && npm run dev           # Frontend
```

### Useful Scripts

```bash
# Located in shell-scripts/

./test-auth-token.sh              # Test authentication flow
./test-products-fix.sh            # Test product endpoints
./test-media-api.sh               # Test media upload
./test-category-management.sh     # Test category operations
./git-push.sh                     # Push to GitHub
```

### Database Management

```bash
# Connect to database
docker exec -it postgres-pim psql -U pim_user -d pim_dev

# View tables
\dt

# Run migrations
cd engines
npm run migration:run

# Generate new migration
npm run migration:generate -- -n MigrationName
```

### Debug Tools

```javascript
// Browser console
debugAuth()                        // Check authentication state
localStorage.getItem('access_token')  // View JWT token
localStorage.clear()               // Clear all data
```

## 📈 Performance Features

- **Nested Set Model**: O(1) tree operations
- **Indexed Queries**: Strategic database indexing
- **Connection Pooling**: Optimized database connections
- **Lazy Loading**: Efficient data fetching
- **Response Caching**: Redis ready for caching layer
- **Bulk Operations**: Efficient batch processing

## 🔒 Security

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Protection**: Parameterized queries via TypeORM
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Proper cross-origin setup
- **Environment Variables**: Sensitive data protection

## 📚 Module Summary

| Module | Status | Endpoints | Key Features |
|--------|--------|-----------|--------------|
| **Auth** | ✅ Complete | 8 | JWT, refresh tokens, role guards |
| **Users** | ✅ Complete | 9 | CRUD, roles, profile management |
| **Products** | ✅ Complete | 11 | Full CRUD, variants, bulk ops |
| **Categories** | ✅ Complete | 15+ | Nested set, tree operations |
| **Attributes** | ✅ Backend | 14 | EAV, 13 types, validation |
| **Media** | ✅ Complete | 9 | Upload, gallery, associations |

## 🎨 Frontend Components

| Component | Status | Description |
|-----------|--------|-------------|
| **Authentication** | ✅ | Login, logout, protected routes |
| **Product List** | ✅ | DataTable with search, filters, pagination |
| **Product Forms** | ✅ | Create/Edit with validation |
| **Product Details** | ✅ | Full view with gallery |
| **Category Tree** | ✅ | Drag-drop management |
| **Media Upload** | ✅ | Drag-drop with progress |
| **Attribute Management** | ⏳ | Pending implementation |
| **User Management** | ⏳ | Pending implementation |

## 🐛 Known Issues

1. **Refresh Token**: `/auth/refresh` endpoint needs implementation
2. **Product Relations**: Categories/attributes in product response need population
3. **Variant UI**: Backend supports variants but no frontend UI yet

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Important Notes

- **API Standards**: All responses use wrapped format with `success`, `data`, and `timestamp`
- **Field Mappings**: Use exact field names (e.g., `urlKey` not `slug`, `quantity` not `inventoryQuantity`)
- **Enum Values**: Use lowercase (`'draft'`, `'simple'`, `'published'`, `'archived'`)
- **Validation**: Backend has `forbidNonWhitelisted: true` - only send valid fields
- **Media URLs**: Full URLs returned (e.g., `http://localhost:3010/uploads/...`)

## 🚀 Deployment

The system is designed for deployment on DigitalOcean with:
- Docker containers for services
- PostgreSQL managed database
- Object storage for media files
- Load balancer for scaling

## 📞 Support

For questions or issues:
- Check documentation in `/docs`
- Review shell scripts for common operations
- Open an issue on GitHub

## 📊 Project Metrics

- **Total API Endpoints**: 66+
- **Database Tables**: 15+
- **Frontend Components**: 30+
- **Test Coverage**: In progress
- **Documentation**: Comprehensive

---

**Built with ❤️ using Open Source Technologies**
- NestJS, PostgreSQL, React, TypeScript, Tailwind CSS
- No proprietary dependencies - fully open source stack