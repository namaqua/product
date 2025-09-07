# PIM API Specifications

## API Overview

The PIM system provides a comprehensive RESTful API following OpenAPI 3.0 specification. All endpoints follow consistent patterns for authentication, pagination, filtering, and error handling.

## Base Configuration

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://pim.yourdomain.com/api/v1
```

### Authentication
```http
Authorization: Bearer {jwt_token}
```

### Common Headers
```http
Content-Type: application/json
Accept: application/json
X-Request-ID: {uuid}
X-Locale: en-US
```

### Pagination
```http
GET /api/v1/products?page=1&limit=20&sort=createdAt:desc
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Authentication Endpoints

### POST /auth/login
Login with credentials.

**Request:**
```json
{
  "username": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "roles": ["admin", "editor"]
    }
  }
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

### POST /auth/logout
Logout and invalidate tokens.

## Product Endpoints

### GET /products
List products with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sort` (string): Sort field and order (e.g., "sku:asc")
- `status` (string): Filter by status
- `type` (string): Filter by product type
- `category` (string): Filter by category ID
- `search` (string): Full-text search
- `locale` (string): Content locale

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "PROD-001",
      "type": "simple",
      "status": "published",
      "name": "Product Name",
      "description": "Product description",
      "categories": ["category-id-1"],
      "attributes": {
        "color": "Red",
        "size": "Medium"
      },
      "media": [
        {
          "id": "media-uuid",
          "url": "https://cdn.example.com/image.jpg",
          "type": "image",
          "isPrimary": true
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /products/{id}
Get single product by ID.

**Path Parameters:**
- `id` (string): Product UUID

**Query Parameters:**
- `locale` (string): Content locale
- `include` (string): Include relations (variants,bundles,media,attributes)

### POST /products
Create a new product.

**Request Body:**
```json
{
  "sku": "PROD-001",
  "type": "simple",
  "status": "draft",
  "locales": {
    "en": {
      "name": "Product Name",
      "description": "Product description",
      "metaTitle": "SEO Title",
      "metaDescription": "SEO Description"
    },
    "es": {
      "name": "Nombre del Producto",
      "description": "Descripción del producto"
    }
  },
  "categories": ["category-id-1", "category-id-2"],
  "attributes": {
    "brand": "BrandName",
    "weight": 1.5,
    "dimensions": {
      "length": 10,
      "width": 5,
      "height": 3
    }
  }
}
```

### PUT /products/{id}
Update existing product.

### PATCH /products/{id}
Partial update of product.

### DELETE /products/{id}
Delete a product.

### POST /products/bulk
Bulk create/update products.

**Request Body:**
```json
{
  "operation": "upsert",
  "products": [
    {
      "sku": "PROD-001",
      "data": {}
    }
  ]
}
```

### DELETE /products/bulk
Bulk delete products.

**Request Body:**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

## Product Variants Endpoints

### GET /products/{id}/variants
Get product variants.

### POST /products/{id}/variants
Add variant to product.

**Request Body:**
```json
{
  "sku": "PROD-001-RED-M",
  "attributes": {
    "color": "Red",
    "size": "Medium"
  },
  "priceModifier": 5.00,
  "stockQuantity": 100
}
```

### PUT /products/{id}/variants/{variantId}
Update product variant.

### DELETE /products/{id}/variants/{variantId}
Remove product variant.

## Attribute Endpoints

### GET /attributes
List all attributes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "color",
      "type": "select",
      "label": "Color",
      "isRequired": false,
      "isSearchable": true,
      "options": [
        {
          "id": "option-uuid",
          "code": "red",
          "label": "Red"
        }
      ],
      "validationRules": {
        "minLength": 1,
        "maxLength": 50
      }
    }
  ]
}
```

### POST /attributes
Create new attribute.

**Request Body:**
```json
{
  "code": "material",
  "type": "select",
  "labels": {
    "en": "Material",
    "es": "Material"
  },
  "group": "physical",
  "isRequired": false,
  "isSearchable": true,
  "options": [
    {
      "code": "cotton",
      "labels": {
        "en": "Cotton",
        "es": "Algodón"
      }
    }
  ]
}
```

### GET /attributes/{id}
Get attribute by ID.

### PUT /attributes/{id}
Update attribute.

### DELETE /attributes/{id}
Delete attribute.

### GET /attribute-groups
List attribute groups.

### POST /attribute-groups
Create attribute group.

## Category Endpoints

### GET /categories
Get category tree.

**Query Parameters:**
- `flat` (boolean): Return flat list instead of tree
- `depth` (number): Tree depth limit

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "root",
    "name": "Root",
    "children": [
      {
        "id": "uuid-1",
        "code": "electronics",
        "name": "Electronics",
        "path": "/electronics",
        "level": 1,
        "children": [
          {
            "id": "uuid-2",
            "code": "computers",
            "name": "Computers",
            "path": "/electronics/computers",
            "level": 2,
            "children": []
          }
        ]
      }
    ]
  }
}
```

### GET /categories/{id}
Get category details.

### POST /categories
Create new category.

**Request Body:**
```json
{
  "code": "new-category",
  "parentId": "parent-uuid",
  "locales": {
    "en": {
      "name": "New Category",
      "description": "Category description"
    }
  },
  "attributes": ["attr-id-1", "attr-id-2"]
}
```

### PUT /categories/{id}
Update category.

### DELETE /categories/{id}
Delete category.

### POST /categories/{id}/move
Move category to new parent.

**Request Body:**
```json
{
  "parentId": "new-parent-uuid"
}
```

## Media Endpoints

### POST /media/upload
Upload media file.

**Request:**
- Content-Type: multipart/form-data
- Field: `file` (binary)
- Field: `metadata` (JSON)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "https://cdn.example.com/image.jpg",
    "thumbnails": {
      "small": "https://cdn.example.com/image_small.jpg",
      "medium": "https://cdn.example.com/image_medium.jpg"
    },
    "metadata": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

### POST /media/upload-bulk
Upload multiple files.

### GET /media/{id}
Get media details.

### DELETE /media/{id}
Delete media file.

### POST /products/{id}/media
Assign media to product.

**Request Body:**
```json
{
  "mediaId": "media-uuid",
  "type": "image",
  "isPrimary": true,
  "sortOrder": 1
}
```

## Import/Export Endpoints

### POST /imports
Start import job.

**Request:**
- Content-Type: multipart/form-data
- Field: `file` (binary)
- Field: `config` (JSON)

**Config Example:**
```json
{
  "type": "products",
  "format": "csv",
  "mapping": {
    "sku": "Product SKU",
    "name": "Product Name",
    "price": "Price"
  },
  "options": {
    "updateExisting": true,
    "validateOnly": false
  }
}
```

### GET /imports/{id}
Get import job status.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "import-uuid",
    "status": "processing",
    "progress": {
      "total": 1000,
      "processed": 450,
      "success": 440,
      "errors": 10
    },
    "startedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /imports/{id}/errors
Get import errors.

### POST /exports
Create export job.

**Request Body:**
```json
{
  "format": "csv",
  "filters": {
    "status": "published",
    "categories": ["category-id"]
  },
  "fields": ["sku", "name", "price", "stock"],
  "locale": "en"
}
```

### GET /exports/{id}/download
Download export file.

## Workflow Endpoints

### GET /workflows
List workflows.

### GET /products/{id}/workflow
Get product workflow status.

**Response:**
```json
{
  "success": true,
  "data": {
    "workflowId": "workflow-uuid",
    "currentStage": "review",
    "status": "in_progress",
    "assignedTo": "user-uuid",
    "history": [
      {
        "stage": "draft",
        "action": "submit",
        "performedBy": "user-uuid",
        "performedAt": "2024-01-01T00:00:00Z",
        "comment": "Ready for review"
      }
    ]
  }
}
```

### POST /products/{id}/workflow/transition
Transition workflow stage.

**Request Body:**
```json
{
  "action": "approve",
  "comment": "Approved with minor changes"
}
```

## Channel/Syndication Endpoints

### GET /channels
List channels.

### POST /channels
Create channel.

**Request Body:**
```json
{
  "code": "amazon",
  "name": "Amazon Marketplace",
  "type": "marketplace",
  "config": {
    "apiKey": "key",
    "sellerId": "id"
  },
  "locales": ["en", "es"],
  "currencies": ["USD"]
}
```

### POST /channels/{id}/publish
Publish products to channel.

**Request Body:**
```json
{
  "productIds": ["uuid-1", "uuid-2"],
  "schedule": "immediate"
}
```

### GET /channels/{id}/products
Get channel products.

### GET /channels/{id}/feed
Generate channel feed.

**Query Parameters:**
- `format` (string): json, csv, xml
- `delta` (boolean): Only changes since last export

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "sku",
        "message": "SKU is required"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Resource already exists"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot delete category with products"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req-uuid"
  }
}
```

## Rate Limiting

API endpoints are rate limited:
- Authenticated requests: 1000 per hour
- Import/Export endpoints: 10 per hour
- Bulk operations: 100 per hour

Rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## Webhooks

### Webhook Events
- `product.created`
- `product.updated`
- `product.deleted`
- `product.published`
- `workflow.completed`
- `import.completed`
- `export.completed`

### Webhook Payload
```json
{
  "event": "product.updated",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "productId": "uuid",
    "changes": ["price", "stock"]
  }
}
```

## API Versioning

The API uses URL versioning:
- Current version: `/api/v1`
- Deprecation notice: 6 months
- End of life: 12 months

## OpenAPI Specification

Complete OpenAPI 3.0 specification available at:
- Development: `http://localhost:3000/api-docs`
- Production: `https://pim.yourdomain.com/api-docs`

---
*Last Updated: [Current Date]*
*Version: 1.0*
