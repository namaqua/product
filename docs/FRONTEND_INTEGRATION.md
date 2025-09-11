# Frontend API Integration Documentation

## Overview
This document describes the complete frontend-to-backend API integration for the PIM system.

## Architecture

### API Service Layer
- **Base API Configuration** (`src/services/api.ts`)
  - Axios instance with interceptors
  - JWT token management with refresh
  - Automatic retry on 401 errors
  - Global error handling

### Service Modules
1. **Auth Service** (`src/services/auth.service.ts`)
   - Login/logout
   - Token refresh
   - Profile management
   - Password reset

2. **Product Service** (`src/services/product.service.ts`)
   - CRUD operations
   - Filtering and search
   - Bulk operations
   - Variant management
   - Import/export

3. **Category Service** (`src/services/category.service.ts`)
   - Tree operations
   - Nested set management
   - Path navigation
   - Bulk operations

4. **Attribute Service** (`src/services/attribute.service.ts`)
   - Attribute management
   - Group operations
   - Validation
   - Type handling

## State Management

### Zustand Stores
- **Auth Store** (`src/stores/auth.store.ts`)
  - User authentication state
  - Persistent storage
  - Login/logout actions

## Components

### Authentication
- **Login Component** (`src/components/auth/Login.tsx`)
  - JWT authentication
  - Form validation
  - Error handling
  - Test credentials display

- **Auth Guard** (`src/components/auth/AuthGuard.tsx`)
  - Route protection
  - Role-based access
  - Auto-redirect to login

### Product Management
- **Product List** (`src/features/products/ProductList.tsx`)
  - DataTable integration
  - Filtering and search
  - Bulk selection
  - Actions (view, edit, delete)
  - Pagination

### Layout
- **Application Shell** (`src/components/layouts/ApplicationShell.tsx`)
  - Navigation sidebar
  - User menu with logout
  - Responsive design
  - Dark mode support

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile

### Products
- `GET /api/v1/products` - List products with filters
- `GET /api/v1/products/:id` - Get single product
- `POST /api/v1/products` - Create product
- `PATCH /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `POST /api/v1/products/bulk-delete` - Bulk delete

### Categories
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/tree` - Get category tree
- `POST /api/v1/categories` - Create category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Attributes
- `GET /api/v1/attributes` - List attributes
- `GET /api/v1/attributes/groups` - List attribute groups
- `POST /api/v1/attributes` - Create attribute
- `PATCH /api/v1/attributes/:id` - Update attribute
- `DELETE /api/v1/attributes/:id` - Delete attribute

## Installation

```bash
# Install dependencies
cd /Users/colinroets/dev/projects/product/pim-admin
npm install axios react-query @tanstack/react-query @tanstack/react-query-devtools
npm install zustand react-hook-form @hookform/resolvers zod
npm install date-fns react-router-dom
```

## Usage

### Starting the Application

1. **Start Docker services:**
```bash
cd /Users/colinroets/dev/projects/product
docker-compose up -d
```

2. **Start backend:**
```bash
cd engines
npm run start:dev
```

3. **Start frontend:**
```bash
cd ../pim-admin
npm run dev
```

4. **Access application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3010/api/v1

### Test Credentials
- Email: `admin@test.com`
- Password: `Admin123!`

## Features Implemented

### ✅ Completed
1. **API Service Layer**
   - Axios configuration with interceptors
   - JWT token management
   - Automatic token refresh
   - Error handling

2. **Authentication Flow**
   - Login page with form
   - Token storage in localStorage
   - Protected routes with AuthGuard
   - Logout functionality

3. **Product Management**
   - Product listing with DataTable
   - Filtering by status, type, featured
   - Search functionality
   - Bulk selection and delete
   - Pagination

4. **Navigation**
   - Sidebar navigation
   - Active route highlighting
   - User menu with logout
   - Responsive mobile menu

### 🚧 TODO - Next Steps

1. **Product Forms**
   - Create product form with dynamic attributes
   - Edit product form
   - Product detail view
   - Image upload

2. **Category Management**
   - Category tree view
   - Drag-and-drop reordering
   - Category assignment to products

3. **Attribute Management**
   - Attribute list and forms
   - Attribute group management
   - Validation rules editor

4. **Advanced Features**
   - Import/Export functionality
   - Bulk edit operations
   - Advanced filtering
   - Real-time notifications

## Type Safety

All API responses are fully typed using TypeScript interfaces in `src/types/api.types.ts`, providing:
- IntelliSense support
- Compile-time error checking
- Better refactoring capabilities
- Self-documenting code

## Error Handling

The system implements comprehensive error handling:
1. **Network Errors** - Caught and displayed to user
2. **401 Unauthorized** - Auto-refresh token or redirect to login
3. **Validation Errors** - Display field-specific errors
4. **Server Errors** - Generic error messages with retry options

## Security Features

1. **JWT Authentication**
   - Access tokens (short-lived)
   - Refresh tokens (long-lived)
   - Automatic token refresh

2. **Route Protection**
   - AuthGuard component
   - Role-based access control
   - Redirect to login on unauthorized

3. **Secure Storage**
   - Tokens in localStorage
   - User state in Zustand with persistence
   - Clear tokens on logout

## Testing

Run the integration test:
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x test-frontend-integration.sh
./test-frontend-integration.sh
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running on port 3010
   - Check CORS configuration in NestJS

2. **401 Unauthorized**
   - Check if tokens are expired
   - Verify test user exists in database
   - Ensure JWT_SECRET matches between .env and code

3. **Network Errors**
   - Verify Docker is running
   - Check PostgreSQL is accessible on port 5433
   - Ensure backend is running

4. **Module Not Found**
   - Run `npm install` to install all dependencies
   - Clear node_modules and reinstall if needed

## Next Development Tasks

1. **Priority 1 - Product Forms**
   - Dynamic attribute rendering
   - Form validation with Zod
   - Image upload with preview
   - Rich text editor for descriptions

2. **Priority 2 - Category Management**
   - Tree component with expand/collapse
   - Drag-and-drop ordering
   - Multi-select for bulk operations

3. **Priority 3 - Import/Export**
   - CSV/Excel upload
   - Progress tracking
   - Error reporting
   - Template downloads

4. **Priority 4 - Advanced Features**
   - Real-time updates with WebSockets
   - Audit log viewing
   - Advanced search with filters
   - Dashboard analytics

## Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NestJS Documentation](https://docs.nestjs.com/)
