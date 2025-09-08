# 🛍️ PIM - Product Information Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Required-blue)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A modern, scalable Product Information Management system built with NestJS and PostgreSQL. Features multi-language support, variant management, and a RESTful API.

## ✨ Features

- 🌍 **Multi-language Support** - Store product information in multiple languages
- 📦 **Product Variants** - Manage different versions of products
- 🏷️ **Flexible Attributes** - Dynamic product attributes system
- 🖼️ **Media Management** - Handle product images and videos
- 🔐 **JWT Authentication** - Secure API endpoints (configurable)
- 📊 **Advanced Filtering** - Search, sort, and filter products
- 🚀 **High Performance** - Optimized queries and caching ready
- 🐳 **Docker Ready** - Complete Docker setup included

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/pim-backend.git
cd pim-backend
```

2. **Start the database**
```bash
./start-pim.sh
# or
docker-compose up -d
```

3. **Install dependencies**
```bash
cd pim
npm install
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings (default works for development)
```

5. **Start the application**
```bash
npm run start:dev
```

6. **Test the API**
```bash
curl http://localhost:3010/health
```

## 📡 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List all products |
| GET | `/api/v1/products/:id` | Get product by ID |
| GET | `/api/v1/products/sku/:sku` | Get product by SKU |
| GET | `/api/v1/products/statistics` | Get product statistics |
| POST | `/api/v1/products` | Create new product |
| PATCH | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |

### Query Parameters
- `includeLocales=true` - Include translations
- `includeMedia=true` - Include images
- `page=1&limit=20` - Pagination
- `sortBy=createdAt&sortOrder=DESC` - Sorting

### Example Request
```bash
curl 'http://localhost:3010/api/v1/products?includeLocales=true&page=1&limit=10'
```

## 🗄️ Database Schema

The system uses a normalized database structure with the following key tables:

- **products** - Core product data (no name field - uses locales)
- **product_locales** - Localized names and descriptions
- **product_attributes** - Dynamic attributes
- **product_media** - Images and videos
- **product_categories** - Category associations
- **product_variants** - Product variations
- **users** - User management

## 🐳 Docker Configuration

### Services
- **PostgreSQL** - Port 5433 (avoids conflicts)
- **Redis** - Port 6380 (optional, for caching)

### Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Reset database
docker-compose down -v
```

## 🔧 Development

### Project Structure
```
pim-backend/
├── pim/                    # NestJS application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── products/   # Product management
│   │   │   ├── auth/       # Authentication
│   │   │   └── users/      # User management
│   │   └── config/         # Configuration
│   └── test/               # Tests
├── scripts/                # Database scripts
├── docker-compose.yml      # Docker configuration
└── docs/                   # Documentation
```

### Available Scripts
```bash
npm run start:dev    # Start in development mode
npm run build        # Build for production
npm run start:prod   # Start production build
npm run test         # Run tests
npm run test:e2e     # Run end-to-end tests
npm run test:cov     # Generate test coverage
```

## 📊 Sample Data

The system comes with 6 sample products:

| SKU | Product | Price | Stock |
|-----|---------|-------|-------|
| LAPTOP-001 | Professional Laptop Pro 15" | $1,299.99 | 50 |
| PHONE-001 | SmartPhone X Pro 256GB | $899.99 | 100 |
| HEADPHONES-001 | Wireless Noise-Canceling Headphones | $349.99 | 200 |
| TABLET-001 | Digital Tablet Pro 11" | $599.99 | 75 |
| WATCH-001 | Smart Fitness Watch | $399.99 | 150 |
| CAMERA-001 | Professional DSLR Camera | $2,499.99 | 25 |

## 🔐 Authentication

Authentication is temporarily disabled for development. To enable:

1. Edit `src/modules/products/products.controller.ts`
2. Uncomment `@UseGuards(JwtAuthGuard, RolesGuard)`
3. Use the auth endpoints to get tokens

### Auth Endpoints
```bash
# Register
POST /api/v1/auth/register

# Login
POST /api/v1/auth/login

# Use token
curl -H "Authorization: Bearer <token>" /api/v1/products
```

## 🚨 Troubleshooting

### Common Issues

**Products API returns empty array**
- Check database port is 5433 in `.env`
- Verify PostgreSQL is running: `docker ps`

**Port conflicts**
- PIM uses port 5433 for PostgreSQL
- Backend API runs on port 3010

**Authentication errors**
- Authentication is disabled by default
- Check ProductsController for guard status

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## 📚 Documentation

- [Quick Reference](QUICK_REFERENCE.md) - Common commands
- [Troubleshooting](TROUBLESHOOTING.md) - Problem solutions
- [Tasks](TASKS.md) - Development roadmap
- [API Documentation](http://localhost:3010/api/docs) - Swagger (when enabled)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Colin Roets** - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- PostgreSQL for the robust database
- Docker for containerization
- All contributors and testers

---

**Built with ❤️ using NestJS and PostgreSQL**
