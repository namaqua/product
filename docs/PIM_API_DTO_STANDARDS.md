# PIM API & DTO Standards Reference Guide

**Version:** 1.0  
**Last Updated:** September 10, 2025  
**Status:** Production Ready  

## 📋 Table of Contents

1. [Overview](#overview)
2. [Response Format Standards](#response-format-standards)
3. [DTO Implementation Patterns](#dto-implementation-patterns)
4. [Service Layer Standards](#service-layer-standards)
5. [Controller Layer Standards](#controller-layer-standards)
6. [Common Utilities](#common-utilities)
7. [Error Handling](#error-handling)
8. [Swagger Documentation](#swagger-documentation)
9. [Testing Standards](#testing-standards)
10. [Implementation Checklist](#implementation-checklist)
11. [Migration Guide](#migration-guide)
12. [Examples](#examples)

---

## 📖 Overview

This document defines the standardized approach for all API responses and DTOs in the PIM system. **All new APIs must follow these standards** to ensure consistency, maintainability, and excellent developer experience.

### 🎯 Core Principles

1. **Consistency** - All responses follow the same structure
2. **Predictability** - Developers know what to expect
3. **Type Safety** - Full TypeScript support
4. **Extensibility** - Easy to add new fields without breaking changes
5. **Developer Experience** - Clear, intuitive, and well-documented

### 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controller    │ -> │     Service      │ -> │   Repository    │
│   (HTTP Layer)  │    │ (Business Logic) │    │ (Data Access)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         v                       v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Response DTOs   │    │ Standard Returns │    │   Entity DTOs   │
│ (API Contract)  │    │   (Wrappers)     │    │ (Data Models)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         v                       v
┌─────────────────────────────────────────────────────────────────┐
│             TransformInterceptor                                │
│        (Automatic Response Wrapping)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Response Format Standards

### 📝 Standard Response Types

All API responses must use one of these **four standardized formats**:

#### 1. Collection Response (Lists/Arrays)
Used for paginated lists and collections.

```typescript
interface CollectionResponse<T> {
  success: true;
  data: {
    items: T[];
    meta: {
      totalItems: number;
      itemCount: number;
      page: number;
      totalPages: number;
      itemsPerPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
  timestamp: string;
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "items": [
      {"id": "1", "name": "Product A"},
      {"id": "2", "name": "Product B"}
    ],
    "meta": {
      "totalItems": 100,
      "itemCount": 2,
      "page": 1,
      "totalPages": 50,
      "itemsPerPage": 2,
      "hasNext": true,
      "hasPrevious": false
    }
  },
  "timestamp": "2025-09-10T12:00:00.000Z"
}
```

#### 2. Action Response (Create/Update/Delete)
Used for operations that modify data.

```typescript
interface ActionResponse<T> {
  success: true;
  data: {
    item: T;
    message: string;
  };
  timestamp: string;
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "item": {"id": "1", "name": "New Product"},
    "message": "Product created successfully"
  },
  "timestamp": "2025-09-10T12:00:00.000Z"
}
```

#### 3. Single Item Response (Get by ID)
Used for retrieving individual items.

```typescript
interface SingleItemResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}
```

**Example:**
```json
{
  "success": true,
  "data": {"id": "1", "name": "Product Details"},
  "timestamp": "2025-09-10T12:00:00.000Z"
}
```

#### 4. Custom Response (Special Cases)
Used only for authentication endpoints that require specific token structures.

```typescript
// Login/Register Response
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

// Token Refresh Response
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
```

**⚠️ Custom responses should be rare and require approval.**

---

## 🏷️ DTO Implementation Patterns

### 📦 DTO File Structure

Each module should have a consistent DTO structure:

```
src/modules/{module}/dto/
├── index.ts                    # Export all DTOs
├── {entity}-response.dto.ts    # Response DTOs
├── create-{entity}.dto.ts      # Create DTOs
├── update-{entity}.dto.ts      # Update DTOs
├── {entity}-query.dto.ts       # Query/Filter DTOs
└── {entity}-stats.dto.ts       # Statistics DTOs (if needed)
```

### 🎨 DTO Naming Conventions

| DTO Type | Naming Pattern | Example |
|----------|----------------|---------|
| Response DTOs | `{Entity}ResponseDto` | `ProductResponseDto` |
| Create DTOs | `Create{Entity}Dto` | `CreateProductDto` |
| Update DTOs | `Update{Entity}Dto` | `UpdateProductDto` |
| Query DTOs | `{Entity}QueryDto` | `ProductQueryDto` |
| Stats DTOs | `{Entity}StatsResponseDto` | `ProductStatsResponseDto` |

### 📋 Query DTO Standard Pattern

All query DTOs should extend the base pagination DTO:

```typescript
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BaseQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], description: 'Sort direction' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  // Helper getters for type safety
  get pageNum(): number {
    return Number(this.page) || 1;
  }

  get limitNum(): number {
    return Number(this.limit) || 10;
  }
}

// Example module-specific query DTO
export class ProductQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: ProductStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by low stock (boolean)' })
  @IsOptional()
  @Type(() => Boolean)
  lowStock?: boolean;
}
```

### 🎯 Response DTO Standard Pattern

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product unique identifier' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Product SKU' })
  @Expose()
  sku: string;

  @ApiProperty({ description: 'Product name' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @Expose()
  description?: string;

  @ApiProperty({ enum: ProductStatus, description: 'Product status' })
  @Expose()
  status: ProductStatus;

  @ApiProperty({ description: 'Product price' })
  @Expose()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Associated category' })
  @Expose()
  category?: CategoryResponseDto;

  // Static factory method
  static fromEntity(entity: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    Object.assign(dto, entity);
    return dto;
  }

  // Static factory method for arrays
  static fromEntities(entities: Product[]): ProductResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
```

---

## ⚙️ Service Layer Standards

### 🔧 Service Method Return Types

All service methods must return the appropriate standardized response type:

```typescript
import { Injectable } from '@nestjs/common';
import { 
  CollectionResponse, 
  ActionResponseDto, 
  ResponseHelpers 
} from '../../common/dto';

@Injectable()
export class ProductsService {
  // Collection methods
  async findAll(query: ProductQueryDto): Promise<CollectionResponse<ProductResponseDto>> {
    const [products, total] = await this.repository.findAndCount({
      // ... query logic
    });
    
    const dtos = ProductResponseDto.fromEntities(products);
    return ResponseHelpers.wrapPaginated([dtos, total], query.pageNum, query.limitNum);
  }

  // Single item methods
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.repository.findOneOrFail({ where: { id } });
    return ProductResponseDto.fromEntity(product);
  }

  // Action methods
  async create(createDto: CreateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = this.repository.create(createDto);
    await this.repository.save(product);
    
    const dto = ProductResponseDto.fromEntity(product);
    return ActionResponseDto.create(dto);
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
    await this.repository.update(id, updateDto);
    const product = await this.repository.findOneOrFail({ where: { id } });
    
    const dto = ProductResponseDto.fromEntity(product);
    return ActionResponseDto.update(dto);
  }

  async remove(id: string): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = await this.repository.findOneOrFail({ where: { id } });
    await this.repository.softDelete(id);
    
    const dto = ProductResponseDto.fromEntity(product);
    return ActionResponseDto.delete(dto);
  }
}
```

### 🎯 ResponseHelpers Usage

Always use the ResponseHelpers utility for consistent wrapping:

```typescript
import { ResponseHelpers } from '../../common/dto';

// For paginated collections
return ResponseHelpers.wrapPaginated([items, total], page, limit);

// For simple collections  
return ResponseHelpers.wrapCollection(items);

// For collections with custom meta
return ResponseHelpers.wrapCollection(items, { 
  totalItems: items.length,
  category: 'electronics' 
});
```

### 🔄 ActionResponseDto Static Methods

Always use the static factory methods:

```typescript
// For create operations
return ActionResponseDto.create(dto);
return ActionResponseDto.create(dto, 'Custom success message');

// For update operations  
return ActionResponseDto.update(dto);
return ActionResponseDto.update(dto, 'Custom update message');

// For delete operations
return ActionResponseDto.delete(dto);
return ActionResponseDto.delete(dto, 'Custom delete message');

// For custom operations
return new ActionResponseDto(dto, 'Custom operation completed');
```

---

## 🎮 Controller Layer Standards

### 🏗️ Controller Method Pattern

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  CollectionResponse as CollectionResponseDto,
  ActionResponseDto 
} from '../../common/dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(@Query() query: ProductQueryDto): Promise<CollectionResponseDto<ProductResponseDto>> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  async create(@Body() createDto: CreateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.create(createDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK) // Important: Use OK, not NO_CONTENT
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.remove(id);
  }
}
```

### ⚠️ Controller Rules

1. **HTTP Status Codes**: DELETE operations return `200 OK`, not `204 NO_CONTENT`
2. **Return Types**: Always specify explicit Promise return types
3. **Swagger Decorators**: Use `@ApiResponse` without generic types (avoid `CollectionResponseDto<T>`)
4. **Authentication**: Add `@ApiBearerAuth()` for protected endpoints
5. **Validation**: Let DTOs handle all input validation

---

## 🛠️ Common Utilities

### 📚 Available Helper Classes

```typescript
// Core response DTOs
import { 
  CollectionResponse,
  CollectionResponse as CollectionResponseDto, // For controller typing
  ActionResponseDto,
  ApiResponse,
  ResponseHelpers 
} from '../../common/dto';

// Example usage in service
const result = ResponseHelpers.wrapPaginated([items, total], page, limit);
const action = ActionResponseDto.create(item);
const collection = ResponseHelpers.wrapCollection(items);
```

### 🔧 ResponseHelpers Methods

```typescript
// Paginated collections (for findAndCount results)
ResponseHelpers.wrapPaginated(
  [items: T[], total: number], 
  page: number, 
  limit: number
): CollectionResponse<T>

// Simple collections (for simple arrays)
ResponseHelpers.wrapCollection(
  items: T[], 
  additionalMeta?: Record<string, any>
): CollectionResponse<T>

// Success responses (used internally by ActionResponseDto)
ResponseHelpers.success(
  data: T, 
  message?: string, 
  meta?: any
): ApiResponse<T>
```

### 🎯 ActionResponseDto Static Methods

```typescript
// Standard factory methods
ActionResponseDto.create<T>(item: T, message?: string): ActionResponseDto<T>
ActionResponseDto.update<T>(item: T, message?: string): ActionResponseDto<T>  
ActionResponseDto.delete<T>(item: T, message?: string): ActionResponseDto<T>

// Custom constructor
new ActionResponseDto<T>(item: T, message: string): ActionResponseDto<T>
```

---

## ❌ Error Handling

### 🚨 Error Response Format

Errors automatically follow this format via the global exception filter:

```json
{
  "statusCode": 400,
  "timestamp": "2025-09-10T12:00:00.000Z",
  "path": "/api/v1/products",
  "method": "POST",
  "message": "Validation failed",
  "details": ["SKU is required", "Price must be positive"]
}
```

### ⚡ Standard Exception Usage

```typescript
import { 
  BadRequestException, 
  NotFoundException, 
  ConflictException,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';

// In service methods
async findOne(id: string): Promise<ProductResponseDto> {
  const product = await this.repository.findOne({ where: { id } });
  
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  
  return ProductResponseDto.fromEntity(product);
}

async create(createDto: CreateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
  // Check for duplicates
  const existing = await this.repository.findOne({ where: { sku: createDto.sku } });
  
  if (existing) {
    throw new ConflictException(`Product with SKU ${createDto.sku} already exists`);
  }
  
  // ... rest of implementation
}
```

---

## 📖 Swagger Documentation

### 🎨 Documentation Standards

```typescript
@ApiTags('Products') // Group endpoints
@Controller('products')
export class ProductsController {
  
  @Get()
  @ApiOperation({ 
    summary: 'Get all products',
    description: 'Retrieve a paginated list of products with optional filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    // Don't use generic types in @ApiResponse
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async findAll(@Query() query: ProductQueryDto) {
    // ...
  }

  @Post()
  @ApiBearerAuth() // For protected endpoints
  @ApiOperation({ 
    summary: 'Create a new product',
    description: 'Create a new product with the provided details'
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Product with SKU already exists',
  })
  async create(@Body() createDto: CreateProductDto) {
    // ...
  }
}
```

### 📝 DTO Swagger Documentation

```typescript
export class CreateProductDto {
  @ApiProperty({ 
    description: 'Product SKU - must be unique',
    example: 'PROD-001',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @Length(3, 50)
  sku: string;

  @ApiProperty({ 
    description: 'Product name',
    example: 'Wireless Headphones',
    minLength: 1,
    maxLength: 200
  })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Product price in USD',
    example: 99.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ 
    enum: ProductStatus,
    description: 'Product status',
    example: ProductStatus.DRAFT
  })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
```

---

## 🧪 Testing Standards

### 🎯 Test Structure

Each module should include these test types:

```typescript
// Integration tests for controllers
describe('ProductsController', () => {
  it('GET /products should return paginated collection', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        items: expect.any(Array),
        meta: expect.objectContaining({
          totalItems: expect.any(Number),
          page: expect.any(Number),
          totalPages: expect.any(Number)
        })
      },
      timestamp: expect.any(String)
    });
  });

  it('POST /products should return action response', async () => {
    const createDto = {
      sku: 'TEST-001',
      name: 'Test Product',
      price: 99.99,
      status: ProductStatus.DRAFT
    };

    const response = await request(app.getHttpServer())
      .post('/api/v1/products')
      .send(createDto)
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        item: expect.objectContaining({
          id: expect.any(String),
          sku: createDto.sku,
          name: createDto.name
        }),
        message: expect.any(String)
      },
      timestamp: expect.any(String)
    });
  });
});
```

### 🔍 Response Validation Helpers

Create reusable test helpers:

```typescript
// test/helpers/response-validation.ts
export const expectCollectionResponse = (response: any, itemCount?: number) => {
  expect(response.body).toMatchObject({
    success: true,
    data: {
      items: expect.any(Array),
      meta: expect.objectContaining({
        totalItems: expect.any(Number),
        itemCount: expect.any(Number),
        page: expect.any(Number),
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrevious: expect.any(Boolean)
      })
    },
    timestamp: expect.any(String)
  });

  if (itemCount !== undefined) {
    expect(response.body.data.items).toHaveLength(itemCount);
  }
};

export const expectActionResponse = (response: any, operation: string) => {
  expect(response.body).toMatchObject({
    success: true,
    data: {
      item: expect.any(Object),
      message: expect.stringContaining(operation)
    },
    timestamp: expect.any(String)
  });
};

export const expectSingleItemResponse = (response: any) => {
  expect(response.body).toMatchObject({
    success: true,
    data: expect.any(Object),
    timestamp: expect.any(String)
  });
};
```

---

## ✅ Implementation Checklist

### 🚀 New Module Checklist

When creating a new module, ensure:

#### **1. DTO Structure**
- [ ] Created `dto/index.ts` with all exports
- [ ] Implemented `{Entity}ResponseDto` with `fromEntity()` static method
- [ ] Created `Create{Entity}Dto` with proper validation
- [ ] Created `Update{Entity}Dto` extending create or partial
- [ ] Created `{Entity}QueryDto` extending `BaseQueryDto`
- [ ] Added proper Swagger decorators to all DTOs

#### **2. Service Layer**
- [ ] Imported standardization DTOs: `CollectionResponse`, `ActionResponseDto`, `ResponseHelpers`
- [ ] Collection methods return `Promise<CollectionResponse<T>>`
- [ ] Action methods return `Promise<ActionResponseDto<T>>`
- [ ] Single item methods return `Promise<T>`
- [ ] Used `ResponseHelpers.wrapPaginated()` for paginated results
- [ ] Used `ActionResponseDto.create/update/delete()` static methods
- [ ] Added proper error handling with standard exceptions

#### **3. Controller Layer**
- [ ] Added `@ApiTags()` decorator
- [ ] Imported response DTOs with alias: `CollectionResponse as CollectionResponseDto`
- [ ] All methods have explicit return types
- [ ] DELETE endpoints use `@HttpCode(HttpStatus.OK)`
- [ ] Added `@ApiBearerAuth()` for protected endpoints
- [ ] Added comprehensive Swagger documentation
- [ ] Used proper HTTP status codes

#### **4. Testing**
- [ ] Created integration tests for all endpoints
- [ ] Validated response formats using helpers
- [ ] Tested pagination parameters
- [ ] Tested error scenarios
- [ ] Verified Swagger documentation

#### **5. TypeScript**
- [ ] Compilation successful with 0 errors
- [ ] No `any` types used
- [ ] Proper type imports and exports

---

## 🔄 Migration Guide

### 📈 Migrating Existing Endpoints

#### **Step 1: Update Service Methods**

**Before:**
```typescript
async findAll(): Promise<Product[]> {
  return this.repository.find();
}

async create(createDto: CreateProductDto): Promise<Product> {
  const product = this.repository.create(createDto);
  return this.repository.save(product);
}
```

**After:**
```typescript
async findAll(query: ProductQueryDto): Promise<CollectionResponse<ProductResponseDto>> {
  const [products, total] = await this.repository.findAndCount({
    skip: (query.pageNum - 1) * query.limitNum,
    take: query.limitNum,
  });
  
  const dtos = ProductResponseDto.fromEntities(products);
  return ResponseHelpers.wrapPaginated([dtos, total], query.pageNum, query.limitNum);
}

async create(createDto: CreateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
  const product = this.repository.create(createDto);
  await this.repository.save(product);
  
  const dto = ProductResponseDto.fromEntity(product);
  return ActionResponseDto.create(dto);
}
```

#### **Step 2: Update Controller Methods**

**Before:**
```typescript
@Get()
async findAll(): Promise<Product[]> {
  return this.productsService.findAll();
}
```

**After:**
```typescript
@Get()
@ApiOperation({ summary: 'Get all products' })
@ApiResponse({ status: 200, description: 'Products retrieved successfully' })
async findAll(@Query() query: ProductQueryDto): Promise<CollectionResponseDto<ProductResponseDto>> {
  return this.productsService.findAll(query);
}
```

#### **Step 3: Update Imports**

```typescript
// Add these imports
import { 
  CollectionResponse,
  CollectionResponse as CollectionResponseDto,
  ActionResponseDto,
  ResponseHelpers 
} from '../../common/dto';
```

---

## 📚 Examples

### 🏪 Complete Module Example

Here's a complete example implementing all standards:

#### **ProductResponseDto**
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  sku: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty({ enum: ProductStatus })
  @Expose()
  status: ProductStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    Object.assign(dto, entity);
    return dto;
  }

  static fromEntities(entities: Product[]): ProductResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
```

#### **ProductQueryDto**
```typescript
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '../../../common/dto';

export class ProductQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}
```

#### **ProductsService**
```typescript
import { Injectable } from '@nestjs/common';
import { 
  CollectionResponse, 
  ActionResponseDto, 
  ResponseHelpers 
} from '../../common/dto';

@Injectable()
export class ProductsService {
  async findAll(query: ProductQueryDto): Promise<CollectionResponse<ProductResponseDto>> {
    const [products, total] = await this.repository.findAndCount({
      where: this.buildWhereClause(query),
      skip: (query.pageNum - 1) * query.limitNum,
      take: query.limitNum,
      order: { [query.sortBy || 'createdAt']: query.sortOrder }
    });
    
    const dtos = ProductResponseDto.fromEntities(products);
    return ResponseHelpers.wrapPaginated([dtos, total], query.pageNum, query.limitNum);
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.repository.findOneOrFail({ where: { id } });
    return ProductResponseDto.fromEntity(product);
  }

  async create(createDto: CreateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = this.repository.create(createDto);
    await this.repository.save(product);
    
    const dto = ProductResponseDto.fromEntity(product);
    return ActionResponseDto.create(dto);
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
    await this.repository.update(id, updateDto);
    const product = await this.repository.findOneOrFail({ where: { id } });
    
    const dto = ProductResponseDto.fromEntity(product);
    return ActionResponseDto.update(dto);
  }

  async remove(id: string): Promise<ActionResponseDto<ProductResponseDto>> {
    const product = await this.repository.findOneOrFail({ where: { id } });
    await this.repository.softDelete(id);
    
    const dto = ProductResponseDto.fromEntity(product);
    return ActionResponseDto.delete(dto);
  }

  private buildWhereClause(query: ProductQueryDto): any {
    const where: any = {};
    
    if (query.status) {
      where.status = query.status;
    }
    
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    
    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }
    
    return where;
  }
}
```

#### **ProductsController**
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { 
  CollectionResponse as CollectionResponseDto,
  ActionResponseDto 
} from '../../common/dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() query: ProductQueryDto): Promise<CollectionResponseDto<ProductResponseDto>> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() createDto: CreateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.create(createDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<ActionResponseDto<ProductResponseDto>> {
    return this.productsService.remove(id);
  }
}
```

---

## 🚨 Common Pitfalls & Solutions

### ❌ **DON'T Do This**

```typescript
// ❌ Don't return raw entities
async findAll(): Promise<Product[]> {
  return this.repository.find();
}

// ❌ Don't use generic types in Swagger decorators
@ApiResponse({ status: 200, type: CollectionResponseDto<ProductResponseDto> })

// ❌ Don't use NO_CONTENT for DELETE operations
@HttpCode(HttpStatus.NO_CONTENT)
async remove() { ... }

// ❌ Don't skip type annotations
async create(createDto: CreateProductDto) {
  // Missing return type
}

// ❌ Don't create custom response formats
return { products: [...], count: 100 }; // Non-standard
```

### ✅ **DO This Instead**

```typescript
// ✅ Return standardized responses
async findAll(query: ProductQueryDto): Promise<CollectionResponse<ProductResponseDto>> {
  const [products, total] = await this.repository.findAndCount();
  const dtos = ProductResponseDto.fromEntities(products);
  return ResponseHelpers.wrapPaginated([dtos, total], query.pageNum, query.limitNum);
}

// ✅ Use simple Swagger decorators
@ApiResponse({ status: 200, description: 'Products retrieved successfully' })

// ✅ Use OK status for DELETE operations
@HttpCode(HttpStatus.OK)
async remove(@Param('id') id: string): Promise<ActionResponseDto<ProductResponseDto>> {
  return this.productsService.remove(id);
}

// ✅ Always include explicit return types
async create(createDto: CreateProductDto): Promise<ActionResponseDto<ProductResponseDto>> {
  return this.productsService.create(createDto);
}

// ✅ Use standardized response helpers
return ResponseHelpers.wrapPaginated([dtos, total], page, limit);
```

---

## 📞 Support & Questions

### 🆘 When You Need Help

1. **Check this guide first** - Most common patterns are documented here
2. **Review existing modules** - Look at Products, Categories, Users, or Auth modules for examples
3. **TypeScript errors** - Ensure proper imports and return type annotations
4. **Response format issues** - Verify you're using the correct ResponseHelpers methods

### 🔄 Updating This Guide

This document should be updated when:
- New response patterns are introduced
- Common utilities are added or changed
- Best practices evolve
- New validation or documentation standards are established

---

## 📄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | September 10, 2025 | Initial standards documentation based on PIM API standardization project |

---

**📚 This guide serves as the definitive reference for all API and DTO implementations in the PIM system. All new development must follow these standards to ensure consistency and maintainability.**
