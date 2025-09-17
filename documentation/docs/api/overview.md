---
sidebar_position: 1
title: API Overview
---

# API Overview

The My Engines API is a RESTful service that provides complete access to all My Engines functionality. It's built with NestJS and follows OpenAPI 3.0 specifications.

## Base URL

```
http://localhost:3010/api
```

Production URL will vary based on your deployment.

## Documentation

Interactive API documentation is available via Swagger UI:

```
http://localhost:3010/api/docs
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "123",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "roles": ["admin"]
    }
  }
}
```

### Using the Token

Include the access token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Refresh

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00.000Z",
    "path": "/api/users",
    "method": "POST"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "meta": {
      "totalItems": 150,
      "itemCount": 20,
      "itemsPerPage": 20,
      "totalPages": 8,
      "currentPage": 1
    }
  }
}
```

## Common Endpoints

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/products/:id/media` | Get product media |
| POST | `/products/:id/duplicate` | Duplicate product |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/media` | List media files |
| POST | `/media/upload` | Upload files |
| GET | `/media/:id` | Get media details |
| DELETE | `/media/:id` | Delete media |
| POST | `/media/:id/products` | Associate with products |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List categories |
| GET | `/categories/tree` | Get category tree |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

## Query Parameters

### Filtering
```
GET /api/products?status=active&featured=true
```

### Sorting
```
GET /api/products?sortBy=createdAt&sortOrder=desc
```

### Pagination
```
GET /api/products?page=2&limit=20
```

### Search
```
GET /api/products?search=shirt
```

### Field Selection
```
GET /api/products?fields=id,name,sku,price
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour
- **Admin**: No limit

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## Webhooks

Configure webhooks to receive real-time notifications:

```json
POST /api/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["product.created", "product.updated"],
  "secret": "your-webhook-secret"
}
```

### Available Events
- `product.created`
- `product.updated`
- `product.deleted`
- `media.uploaded`
- `category.created`
- `inventory.low`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

class PimClient {
  private baseURL = 'http://localhost:3010/api';
  private token: string;

  async login(email: string, password: string) {
    const { data } = await axios.post(`${this.baseURL}/auth/login`, {
      email,
      password
    });
    this.token = data.data.accessToken;
  }

  async getProducts() {
    return axios.get(`${this.baseURL}/products`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });
  }
}
```

### cURL

```bash
# Login
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# Get products
curl -X GET http://localhost:3010/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Python

```python
import requests

class PimClient:
    def __init__(self):
        self.base_url = "http://localhost:3010/api"
        self.token = None
    
    def login(self, email, password):
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        self.token = response.json()["data"]["accessToken"]
    
    def get_products(self):
        return requests.get(
            f"{self.base_url}/products",
            headers={"Authorization": f"Bearer {self.token}"}
        )
```

## Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (never in localStorage for sensitive apps)
3. **Implement token refresh** to maintain sessions
4. **Handle rate limits** with exponential backoff
5. **Validate input** before sending to API
6. **Use pagination** for large datasets
7. **Cache responses** when appropriate
8. **Log API errors** for debugging

## Testing

Use the Swagger UI for testing:
1. Navigate to http://localhost:3010/api/docs
2. Click "Authorize" and enter your token
3. Try out any endpoint directly from the browser

---

For detailed endpoint documentation, see the [Swagger Documentation](http://localhost:3010/api/docs)
