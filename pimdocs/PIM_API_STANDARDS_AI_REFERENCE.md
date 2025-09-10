# PIM API Standards - AI Reference Guide

**Quick reference for maintaining PIM API consistency in future development**

## 🎯 Core Response Formats (4 Types)

### 1. Collection Response (Lists/Paginated)
```typescript
// Service return type
Promise<CollectionResponse<EntityResponseDto>>

// Implementation pattern
const [items, total] = await repository.findAndCount();
const dtos = EntityResponseDto.fromEntities(items);
return ResponseHelpers.wrapPaginated([dtos, total], query.pageNum, query.limitNum);

// Controller signature
async findAll(@Query() query: EntityQueryDto): Promise<CollectionResponseDto<EntityResponseDto>>
```

### 2. Action Response (Create/Update/Delete)
```typescript
// Service return type
Promise<ActionResponseDto<EntityResponseDto>>

// Implementation pattern
const entity = await repository.save(data);
const dto = EntityResponseDto.fromEntity(entity);
return ActionResponseDto.create(dto); // or .update(dto) or .delete(dto)

// Controller signature
async create(@Body() dto: CreateEntityDto): Promise<ActionResponseDto<EntityResponseDto>>
```

### 3. Single Item Response (Get by ID)
```typescript
// Service return type
Promise<EntityResponseDto>

// Implementation pattern
const entity = await repository.findOneOrFail({ where: { id } });
return EntityResponseDto.fromEntity(entity);

// Controller signature
async findOne(@Param('id') id: string): Promise<EntityResponseDto>
```

### 4. Custom Response (Auth tokens only)
```typescript
// Only for login/register/refresh endpoints
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto; // only for login/register
}
```

## 🏗️ Standard Implementation Patterns

### Service Layer Pattern
```typescript
import { CollectionResponse, ActionResponseDto, ResponseHelpers } from '../../common/dto';

@Injectable()
export class EntityService {
  // Collections (with pagination)
  async findAll(query: EntityQueryDto): Promise<CollectionResponse<EntityResponseDto>> {
    const [entities, total] = await this.repository.findAndCount({
      skip: (query.pageNum - 1) * query.limitNum,
      take: query.limitNum,
    });
    const dtos = EntityResponseDto.fromEntities(entities);
    return ResponseHelpers.wrapPaginated([dtos, total], query.pageNum, query.limitNum);
  }

  // Single items
  async findOne(id: string): Promise<EntityResponseDto> {
    const entity = await this.repository.findOneOrFail({ where: { id } });
    return EntityResponseDto.fromEntity(entity);
  }

  // Actions
  async create(createDto: CreateEntityDto): Promise<ActionResponseDto<EntityResponseDto>> {
    const entity = this.repository.create(createDto);
    await this.repository.save(entity);
    const dto = EntityResponseDto.fromEntity(entity);
    return ActionResponseDto.create(dto);
  }

  async update(id: string, updateDto: UpdateEntityDto): Promise<ActionResponseDto<EntityResponseDto>> {
    await this.repository.update(id, updateDto);
    const entity = await this.repository.findOneOrFail({ where: { id } });
    const dto = EntityResponseDto.fromEntity(entity);
    return ActionResponseDto.update(dto);
  }

  async remove(id: string): Promise<ActionResponseDto<EntityResponseDto>> {
    const entity = await this.repository.findOneOrFail({ where: { id } });
    await this.repository.softDelete(id);
    const dto = EntityResponseDto.fromEntity(entity);
    return ActionResponseDto.delete(dto);
  }
}
```

### Controller Layer Pattern
```typescript
import { CollectionResponse as CollectionResponseDto, ActionResponseDto } from '../../common/dto';

@ApiTags('Entities')
@Controller('entities')
export class EntityController {
  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: 200, description: 'Entities retrieved successfully' })
  async findAll(@Query() query: EntityQueryDto): Promise<CollectionResponseDto<EntityResponseDto>> {
    return this.entityService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 200, description: 'Entity retrieved successfully' })
  async findOne(@Param('id') id: string): Promise<EntityResponseDto> {
    return this.entityService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  async create(@Body() createDto: CreateEntityDto): Promise<ActionResponseDto<EntityResponseDto>> {
    return this.entityService.create(createDto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update entity' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateEntityDto): Promise<ActionResponseDto<EntityResponseDto>> {
    return this.entityService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK) // Important: OK not NO_CONTENT
  @ApiOperation({ summary: 'Delete entity' })
  @ApiResponse({ status: 200, description: 'Entity deleted successfully' })
  async remove(@Param('id') id: string): Promise<ActionResponseDto<EntityResponseDto>> {
    return this.entityService.remove(id);
  }
}
```

## 📝 DTO Patterns

### Response DTO Template
```typescript
export class EntityResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  static fromEntity(entity: Entity): EntityResponseDto {
    const dto = new EntityResponseDto();
    Object.assign(dto, entity);
    return dto;
  }

  static fromEntities(entities: Entity[]): EntityResponseDto[] {
    return entities.map(entity => this.fromEntity(entity));
  }
}
```

### Query DTO Template
```typescript
export class EntityQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: EntityStatus })
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}

// BaseQueryDto provides: page, limit, search, sortBy, sortOrder + pageNum/limitNum getters
```

### Create/Update DTO Template
```typescript
export class CreateEntityDto {
  @ApiProperty({ description: 'Entity name', example: 'Sample Entity' })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ description: 'Entity description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EntityStatus, description: 'Entity status' })
  @IsEnum(EntityStatus)
  status: EntityStatus;
}

export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

## 🎯 Required Imports

### Service Files
```typescript
import { CollectionResponse, ActionResponseDto, ResponseHelpers } from '../../common/dto';
```

### Controller Files
```typescript
import { CollectionResponse as CollectionResponseDto, ActionResponseDto } from '../../common/dto';
```

## 🛠️ Utility Methods

### ResponseHelpers
```typescript
// For paginated results (findAndCount)
ResponseHelpers.wrapPaginated([items, total], page, limit)

// For simple collections
ResponseHelpers.wrapCollection(items)
```

### ActionResponseDto Static Methods
```typescript
ActionResponseDto.create(dto)    // "Created successfully"
ActionResponseDto.update(dto)    // "Updated successfully"  
ActionResponseDto.delete(dto)    // "Deleted successfully"
ActionResponseDto.create(dto, "Custom message")
```

## ❌ Critical Rules

### DON'T
- ❌ Return raw entities: `Promise<Entity[]>`
- ❌ Use NO_CONTENT for DELETE: `@HttpCode(HttpStatus.NO_CONTENT)`
- ❌ Generic types in Swagger: `@ApiResponse({type: CollectionResponseDto<T>})`
- ❌ Skip return type annotations
- ❌ Create custom response formats
- ❌ Use `any` types

### DO
- ✅ Always use standardized response types
- ✅ DELETE endpoints return `@HttpCode(HttpStatus.OK)`
- ✅ Explicit Promise return types on all methods
- ✅ Use ResponseHelpers for collections
- ✅ Use ActionResponseDto static methods
- ✅ Add comprehensive Swagger documentation

## 🏷️ Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Response DTO | `{Entity}ResponseDto` | `ProductResponseDto` |
| Create DTO | `Create{Entity}Dto` | `CreateProductDto` |
| Update DTO | `Update{Entity}Dto` | `UpdateProductDto` |
| Query DTO | `{Entity}QueryDto` | `ProductQueryDto` |
| Controller | `{Entity}Controller` | `ProductsController` |
| Service | `{Entity}Service` | `ProductsService` |

## 🔧 File Structure

```
src/modules/{module}/
├── dto/
│   ├── index.ts                    # Export all DTOs
│   ├── {entity}-response.dto.ts    
│   ├── create-{entity}.dto.ts      
│   ├── update-{entity}.dto.ts      
│   └── {entity}-query.dto.ts       
├── entities/
│   └── {entity}.entity.ts
├── {module}.controller.ts
├── {module}.service.ts
└── {module}.module.ts
```

## 🧪 Testing Validation

### Response Format Validation
```typescript
// Collection responses
expect(response.body).toMatchObject({
  success: true,
  data: {
    items: expect.any(Array),
    meta: expect.objectContaining({
      totalItems: expect.any(Number),
      page: expect.any(Number)
    })
  },
  timestamp: expect.any(String)
});

// Action responses  
expect(response.body).toMatchObject({
  success: true,
  data: {
    item: expect.any(Object),
    message: expect.any(String)
  },
  timestamp: expect.any(String)
});

// Single item responses
expect(response.body).toMatchObject({
  success: true,
  data: expect.any(Object),
  timestamp: expect.any(String)
});
```

## ⚠️ Special Cases

### Auth Endpoints Exception
Only login/register/refresh endpoints return custom formats (tokens).
All other auth endpoints (logout, change-password, etc.) use ActionResponseDto.

### TransformInterceptor Behavior
- Automatically wraps responses in standard format
- Skips auth responses with accessToken/refreshToken
- Handles ActionResponseDto instances correctly

## 🎯 Quick Implementation Checklist

When creating new API endpoint:

1. ✅ Service method returns correct standard type
2. ✅ Controller method has explicit return type  
3. ✅ Uses appropriate ResponseHelpers/ActionResponseDto
4. ✅ DELETE uses @HttpCode(HttpStatus.OK)
5. ✅ Comprehensive Swagger documentation
6. ✅ Protected endpoints have @ApiBearerAuth()
7. ✅ Query DTOs extend BaseQueryDto
8. ✅ Response DTOs have fromEntity() static method
9. ✅ All DTOs properly exported in index.ts
10. ✅ TypeScript compiles with 0 errors

**This reference ensures all future API development maintains the established PIM standards.**
