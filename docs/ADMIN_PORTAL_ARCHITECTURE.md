# PIM Admin Portal Architecture

## Overview

The PIM Admin Portal is a modern, responsive web application built with React, TypeScript, and Tailwind Pro. It provides a comprehensive user interface for managing products, attributes, categories, workflows, and all other PIM functionality.

## Technology Stack

### Core Technologies
- **Framework**: React 18+ with TypeScript
- **UI Framework**: Tailwind CSS with Tailwind UI Pro
- **Component Library**: Tailwind Pro Admin Templates
- **Reference Implementation**: `/Users/colinroets/dev/tailwind-admin Pro`
- **State Management**: Zustand or Redux Toolkit
- **API Client**: Axios with React Query
- **Form Handling**: React Hook Form
- **Routing**: React Router v6
- **Build Tool**: Vite (preferred) or Next.js

### Development Tools
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest, React Testing Library
- **Documentation**: Storybook (optional)
- **Icons**: Heroicons (included with Tailwind Pro)

## Project Structure

```
pim-admin/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── components/         # Reusable components
│   │   ├── common/         # Generic components
│   │   ├── forms/          # Form components
│   │   ├── layouts/        # Layout components
│   │   ├── tables/         # Table components
│   │   └── charts/         # Chart components
│   ├── features/           # Feature modules
│   │   ├── products/       # Product management
│   │   ├── attributes/     # Attribute management
│   │   ├── categories/     # Category management
│   │   ├── media/          # Media management
│   │   ├── workflows/      # Workflow management
│   │   ├── imports/        # Import/Export
│   │   ├── channels/       # Channel management
│   │   └── dashboard/      # Dashboard
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── stores/             # State management
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── .env                    # Environment variables
├── tailwind.config.js      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── package.json
```

## Tailwind Pro Component Mapping

### Core Layouts

**Application Shell** (from Tailwind Pro)
```tsx
// Using Tailwind Pro's stacked layout with sidebar
import { ApplicationShell } from '@/components/layouts/ApplicationShell';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Attributes', href: '/attributes', icon: TagIcon },
  { name: 'Media', href: '/media', icon: PhotoIcon },
  { name: 'Workflows', href: '/workflows', icon: ClipboardListIcon },
  { name: 'Import/Export', href: '/import-export', icon: ArrowPathIcon },
  { name: 'Channels', href: '/channels', icon: GlobeAltIcon },
];
```

### Page Components

#### Dashboard
Uses Tailwind Pro's dashboard template with:
- **Stats Cards**: Key metrics display
- **Activity Feed**: Recent actions
- **Charts**: Product performance
- **Quick Actions**: Common tasks

#### Product Management
- **Product List**: Tailwind Pro table with filters
- **Product Form**: Multi-step form from Tailwind Pro
- **Bulk Actions**: Tailwind Pro's selection patterns
- **Product Preview**: Slide-over panel pattern

#### Attribute Management
- **Attribute Groups**: Tailwind Pro's list with sections
- **Attribute Builder**: Form builder pattern
- **Options Manager**: Sortable list component
- **Templates**: Card grid layout

#### Category Management
- **Category Tree**: Tailwind Pro's tree view
- **Drag & Drop**: Interactive tree management
- **Category Form**: Simple stacked form
- **Breadcrumbs**: Navigation pattern

#### Media Gallery
- **Grid View**: Tailwind Pro's image gallery
- **Upload Zone**: Dropzone component
- **Image Editor**: Modal with tools
- **Asset Details**: Slide-over panel

#### Workflow Manager
- **Kanban Board**: Column layout from Tailwind Pro
- **Stage Cards**: Draggable cards
- **Timeline View**: Activity feed variant
- **Approval Forms**: Action panels

## Key UI Patterns

### Forms

**Product Edit Form** (Multi-step)
```tsx
// Using Tailwind Pro's multi-step form pattern
const steps = [
  { id: '01', name: 'Basic Info', status: 'complete' },
  { id: '02', name: 'Attributes', status: 'current' },
  { id: '03', name: 'Media', status: 'upcoming' },
  { id: '04', name: 'Categories', status: 'upcoming' },
  { id: '05', name: 'Pricing', status: 'upcoming' },
];
```

### Tables

**Product List Table**
```tsx
// Using Tailwind Pro's advanced table with:
- Sticky header
- Row selection
- Inline actions
- Pagination
- Column sorting
- Filters sidebar
```

### Modals & Overlays

**Confirmation Dialogs**
- Delete confirmations
- Workflow transitions
- Bulk action warnings

**Slide-overs**
- Product quick edit
- Media details
- Import progress
- Filter panels

### Notifications

**Toast Notifications**
- Success messages
- Error alerts
- Progress indicators
- Action confirmations

## State Management

### Global State (Zustand)
```typescript
interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  
  // App Data
  currentWorkspace: Workspace;
  notifications: Notification[];
}
```

### Feature State (React Query)
```typescript
// Products
const { data: products, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productService.getProducts(filters),
});

// Mutations
const mutation = useMutation({
  mutationFn: productService.updateProduct,
  onSuccess: () => {
    queryClient.invalidateQueries(['products']);
  },
});
```

## API Integration

### Service Layer
```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service Modules
```typescript
// services/products.ts
export const productService = {
  getProducts: (params: ProductFilters) => 
    api.get('/products', { params }),
    
  getProduct: (id: string) => 
    api.get(`/products/${id}`),
    
  createProduct: (data: CreateProductDto) => 
    api.post('/products', data),
    
  updateProduct: ({ id, data }: UpdateProductParams) => 
    api.put(`/products/${id}`, data),
    
  deleteProduct: (id: string) => 
    api.delete(`/products/${id}`),
};
```

## Feature Modules

### Products Module
```
features/products/
├── components/
│   ├── ProductList.tsx
│   ├── ProductForm.tsx
│   ├── ProductCard.tsx
│   ├── ProductFilters.tsx
│   └── BulkActions.tsx
├── hooks/
│   ├── useProducts.ts
│   ├── useProductForm.ts
│   └── useProductFilters.ts
├── types/
│   └── product.types.ts
└── index.ts
```

### Workflows Module
```
features/workflows/
├── components/
│   ├── WorkflowBoard.tsx
│   ├── StageColumn.tsx
│   ├── TaskCard.tsx
│   ├── TransitionModal.tsx
│   └── WorkflowTimeline.tsx
├── hooks/
│   ├── useWorkflows.ts
│   └── useTransitions.ts
└── index.ts
```

## Responsive Design

### Breakpoints (Tailwind defaults)
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Mobile Considerations
- Collapsible sidebar on mobile
- Stack table columns on small screens
- Touch-friendly controls
- Simplified navigation
- Bottom sheets instead of modals

## Performance Optimization

### Code Splitting
```typescript
// Lazy load feature modules
const Products = lazy(() => import('./features/products'));
const Workflows = lazy(() => import('./features/workflows'));
const Media = lazy(() => import('./features/media'));
```

### Image Optimization
- Lazy loading with Intersection Observer
- Responsive images with srcset
- WebP format with fallbacks
- Thumbnail generation

### Data Management
- Pagination for large lists
- Virtual scrolling for long tables
- Debounced search inputs
- Optimistic UI updates
- Request caching with React Query

## Theming & Customization

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.gray,
        accent: colors.indigo,
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### Dark Mode Support
- System preference detection
- Manual toggle
- Persistent preference
- Tailwind dark: variant

## Testing Strategy

### Unit Tests
```typescript
// ProductCard.test.tsx
describe('ProductCard', () => {
  it('displays product information', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// ProductList.test.tsx
describe('ProductList', () => {
  it('loads and displays products', async () => {
    render(<ProductList />);
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
  });
});
```

## Deployment

### Build Configuration
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=PIM Admin
VITE_STORAGE_URL=http://localhost:3000/storage
```

### Nginx Configuration
```nginx
location /admin {
    root /var/www/admin/dist;
    try_files $uri $uri/ /index.html;
}
```

## Security Considerations

### Authentication
- JWT token storage in memory/sessionStorage
- Automatic token refresh
- Protected routes with guards
- Role-based UI rendering

### Data Protection
- Input sanitization
- XSS prevention
- CSRF tokens for forms
- Content Security Policy headers

## Accessibility

### WCAG 2.1 Compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

## Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Workflow

### Getting Started
```bash
# Clone repository
git clone [repo-url]
cd engines-admin

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Code Style
- ESLint for linting
- Prettier for formatting
- Husky for pre-commit hooks
- Conventional commits

---
*Last Updated: [Current Date]*
*Version: 1.0*
