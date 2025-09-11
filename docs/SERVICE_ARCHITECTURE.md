# PIM Service Architecture and Modules

## Module Architecture Overview

The PIM system follows a modular monolith architecture using NestJS modules. Each module encapsulates a specific domain with clear boundaries and interfaces.

## Module Dependency Graph

```
                            ┌─────────────┐
                            │   App       │
                            │   Module    │
                            └─────────────┘
                                   │
        ┌──────────────┬──────────┴──────────┬──────────────┐
        ▼              ▼                      ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    Core      │ │   Product    │ │  Ingestion   │ │ Syndication  │
│   Module     │ │    Module    │ │    Module    │ │    Module    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │              │                  │              │
        │              ├──────────────────┴──────────────┤
        │              ▼                                  │
        │       ┌──────────────┐                        │
        │       │  Attribute   │                        │
        │       │    Module    │                        │
        │       └──────────────┘                        │
        │              ▼                                 │
        │       ┌──────────────┐                        │
        │       │  Category    │                        │
        │       │    Module    │                        │
        │       └──────────────┘                        │
        │              ▼                                 │
        │       ┌──────────────┐                        │
        │       │    Media     │                        │
        │       │    Module    │                        │
        │       └──────────────┘                        │
        │              ▼                                 │
        │       ┌──────────────┐                        │
        │       │  Workflow    │                        │
        │       │    Module    │                        │
        │       └──────────────┘                        │
        │                                                │
        └────────────────────────────────────────────────┘
                               ▼
                        ┌──────────────┐
                        │   Common     │
                        │   Module     │
                        └──────────────┘
```

## Core Modules

### 1. Core Module

**Purpose**: Provides foundational services and cross-cutting concerns.

**Structure**:
```
src/core/
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   └── validation.schema.ts
├── database/
│   ├── database.module.ts
│   └── database.providers.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       └── roles.decorator.ts
├── logging/
│   ├── logger.service.ts
│   └── logging.interceptor.ts
└── core.module.ts
```

**Services**:
```typescript
// Authentication Service
export class AuthService {
  async validateUser(username: string, password: string): Promise<User>
  async login(user: User): Promise<TokenResponse>
  async refresh(refreshToken: string): Promise<TokenResponse>
  async logout(userId: string): Promise<void>
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
}

// Logger Service
export class LoggerService {
  log(message: string, context?: string): void
  error(message: string, trace?: string, context?: string): void
  warn(message: string, context?: string): void
  debug(message: string, context?: string): void
}

// Configuration Service (provided by @nestjs/config)
export class ConfigService {
  get<T>(key: string): T
  getOrThrow<T>(key: string): T
}
```

### 2. Product Module

**Purpose**: Manages product data, variants, bundles, and relationships.

**Structure**:
```
src/product/
├── entities/
│   ├── product.entity.ts
│   ├── product-variant.entity.ts
│   ├── product-bundle.entity.ts
│   └── product-relationship.entity.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── product-response.dto.ts
│   └── product-filter.dto.ts
├── services/
│   ├── product.service.ts
│   ├── variant.service.ts
│   ├── bundle.service.ts
│   └── relationship.service.ts
├── controllers/
│   ├── product.controller.ts
│   └── variant.controller.ts
├── repositories/
│   └── product.repository.ts
└── product.module.ts
```

**Core Service Interface**:
```typescript
export class ProductService {
  // CRUD Operations
  async create(dto: CreateProductDto): Promise<Product>
  async findAll(filters: ProductFilterDto): Promise<PaginatedResponse<Product>>
  async findOne(id: string): Promise<Product>
  async update(id: string, dto: UpdateProductDto): Promise<Product>
  async delete(id: string): Promise<void>
  
  // Variant Management
  async addVariant(parentId: string, dto: CreateVariantDto): Promise<ProductVariant>
  async removeVariant(parentId: string, variantId: string): Promise<void>
  
  // Bundle Management
  async createBundle(dto: CreateBundleDto): Promise<Product>
  async addBundleComponent(bundleId: string, componentId: string): Promise<void>
  
  // Bulk Operations
  async bulkUpdate(ids: string[], dto: BulkUpdateDto): Promise<BulkUpdateResult>
  async bulkDelete(ids: string[]): Promise<BulkDeleteResult>
  
  // Search & Filter
  async search(query: string, filters?: ProductFilterDto): Promise<Product[]>
  async getByCategory(categoryId: string): Promise<Product[]>
}
```

### 3. Attribute Module

**Purpose**: Manages product attributes, options, and templates.

**Structure**:
```
src/attribute/
├── entities/
│   ├── attribute.entity.ts
│   ├── attribute-group.entity.ts
│   ├── attribute-option.entity.ts
│   └── product-attribute.entity.ts
├── dto/
│   ├── create-attribute.dto.ts
│   ├── attribute-value.dto.ts
│   └── attribute-template.dto.ts
├── services/
│   ├── attribute.service.ts
│   ├── attribute-group.service.ts
│   └── attribute-value.service.ts
├── controllers/
│   └── attribute.controller.ts
├── validators/
│   └── attribute.validator.ts
└── attribute.module.ts
```

**Core Service Interface**:
```typescript
export class AttributeService {
  // Attribute Management
  async createAttribute(dto: CreateAttributeDto): Promise<Attribute>
  async findAllAttributes(): Promise<Attribute[]>
  async updateAttribute(id: string, dto: UpdateAttributeDto): Promise<Attribute>
  
  // Attribute Groups
  async createGroup(dto: CreateAttributeGroupDto): Promise<AttributeGroup>
  async assignToGroup(attributeId: string, groupId: string): Promise<void>
  
  // Product Attributes
  async setProductAttribute(productId: string, attributeId: string, value: any): Promise<void>
  async getProductAttributes(productId: string): Promise<ProductAttribute[]>
  async validateAttributeValue(attributeId: string, value: any): Promise<ValidationResult>
  
  // Templates
  async createTemplate(dto: CreateTemplateDto): Promise<AttributeTemplate>
  async applyTemplate(productId: string, templateId: string): Promise<void>
}
```

### 4. Category Module

**Purpose**: Manages hierarchical category structure and product categorization.

**Structure**:
```
src/category/
├── entities/
│   ├── category.entity.ts
│   └── product-category.entity.ts
├── dto/
│   ├── create-category.dto.ts
│   ├── move-category.dto.ts
│   └── category-tree.dto.ts
├── services/
│   ├── category.service.ts
│   └── category-tree.service.ts
├── controllers/
│   └── category.controller.ts
└── category.module.ts
```

**Core Service Interface**:
```typescript
export class CategoryService {
  // Category Management
  async create(dto: CreateCategoryDto): Promise<Category>
  async findTree(): Promise<CategoryTree>
  async findSubcategories(parentId: string): Promise<Category[]>
  async move(categoryId: string, newParentId: string): Promise<void>
  
  // Product Assignment
  async assignProduct(productId: string, categoryId: string): Promise<void>
  async removeProduct(productId: string, categoryId: string): Promise<void>
  async getProductsByCategory(categoryId: string, includeSubcategories: boolean): Promise<Product[]>
  
  // Attribute Inheritance
  async getCategoryAttributes(categoryId: string): Promise<Attribute[]>
  async assignAttribute(categoryId: string, attributeId: string): Promise<void>
}
```

### 5. Media Module

**Purpose**: Handles file uploads, storage, and media associations.

**Structure**:
```
src/media/
├── entities/
│   ├── media.entity.ts
│   └── product-media.entity.ts
├── dto/
│   ├── upload-media.dto.ts
│   └── media-metadata.dto.ts
├── services/
│   ├── media.service.ts
│   ├── storage.service.ts
│   └── image-processor.service.ts
├── controllers/
│   └── media.controller.ts
├── providers/
│   ├── local-storage.provider.ts
│   └── s3-storage.provider.ts
└── media.module.ts
```

**Core Service Interface**:
```typescript
export class MediaService {
  // Upload & Storage
  async upload(file: Express.Multer.File, metadata?: MediaMetadata): Promise<Media>
  async uploadBulk(files: Express.Multer.File[]): Promise<Media[]>
  async delete(id: string): Promise<void>
  
  // Product Association
  async assignToProduct(mediaId: string, productId: string, type: MediaType): Promise<void>
  async setProductPrimaryImage(productId: string, mediaId: string): Promise<void>
  async getProductMedia(productId: string): Promise<Media[]>
  
  // Processing
  async generateThumbnails(mediaId: string): Promise<void>
  async optimizeImage(mediaId: string): Promise<void>
  async extractMetadata(mediaId: string): Promise<MediaMetadata>
}
```

### 6. Workflow Module

**Purpose**: Manages approval workflows and state transitions.

**Structure**:
```
src/workflow/
├── entities/
│   ├── workflow.entity.ts
│   ├── workflow-stage.entity.ts
│   └── product-workflow.entity.ts
├── dto/
│   ├── create-workflow.dto.ts
│   └── transition.dto.ts
├── services/
│   ├── workflow.service.ts
│   ├── workflow-engine.service.ts
│   └── notification.service.ts
├── controllers/
│   └── workflow.controller.ts
└── workflow.module.ts
```

**Core Service Interface**:
```typescript
export class WorkflowService {
  // Workflow Management
  async createWorkflow(dto: CreateWorkflowDto): Promise<Workflow>
  async getActiveWorkflows(): Promise<Workflow[]>
  
  // Product Workflow
  async startWorkflow(productId: string, workflowId: string): Promise<ProductWorkflow>
  async transitionStage(productWorkflowId: string, action: string): Promise<void>
  async assignTask(productWorkflowId: string, userId: string): Promise<void>
  
  // Status & History
  async getWorkflowStatus(productId: string): Promise<WorkflowStatus>
  async getWorkflowHistory(productWorkflowId: string): Promise<WorkflowHistory[]>
  
  // Automation
  async processAutoTransitions(): Promise<void>
  async checkSLABreaches(): Promise<SLABreach[]>
}
```

### 7. Ingestion Module

**Purpose**: Handles data imports from various sources.

**Structure**:
```
src/ingestion/
├── entities/
│   ├── import.entity.ts
│   └── import-error.entity.ts
├── dto/
│   ├── import-config.dto.ts
│   └── import-result.dto.ts
├── services/
│   ├── import.service.ts
│   ├── csv-parser.service.ts
│   ├── json-parser.service.ts
│   └── mapper.service.ts
├── controllers/
│   └── import.controller.ts
├── processors/
│   ├── product-import.processor.ts
│   └── media-import.processor.ts
└── ingestion.module.ts
```

**Core Service Interface**:
```typescript
export class ImportService {
  // Import Operations
  async importFile(file: Express.Multer.File, config: ImportConfig): Promise<ImportJob>
  async importFromUrl(url: string, config: ImportConfig): Promise<ImportJob>
  async importFromApi(endpoint: string, config: ImportConfig): Promise<ImportJob>
  
  // Job Management
  async getImportStatus(jobId: string): Promise<ImportStatus>
  async cancelImport(jobId: string): Promise<void>
  async retryFailedRows(jobId: string): Promise<void>
  
  // Mapping & Validation
  async validateMapping(file: Express.Multer.File, mapping: MappingConfig): Promise<ValidationResult>
  async autoDetectMapping(file: Express.Multer.File): Promise<MappingConfig>
  
  // Error Handling
  async getImportErrors(jobId: string): Promise<ImportError[]>
  async exportErrorReport(jobId: string): Promise<Buffer>
}
```

### 8. Syndication Module

**Purpose**: Manages product distribution to various channels.

**Structure**:
```
src/syndication/
├── entities/
│   ├── channel.entity.ts
│   ├── channel-product.entity.ts
│   └── export.entity.ts
├── dto/
│   ├── create-channel.dto.ts
│   ├── export-config.dto.ts
│   └── channel-product.dto.ts
├── services/
│   ├── channel.service.ts
│   ├── export.service.ts
│   └── feed-generator.service.ts
├── controllers/
│   ├── channel.controller.ts
│   └── export.controller.ts
├── formatters/
│   ├── json.formatter.ts
│   ├── csv.formatter.ts
│   └── xml.formatter.ts
└── syndication.module.ts
```

**Core Service Interface**:
```typescript
export class SyndicationService {
  // Channel Management
  async createChannel(dto: CreateChannelDto): Promise<Channel>
  async updateChannelConfig(id: string, config: ChannelConfig): Promise<void>
  
  // Product Publishing
  async publishToChannel(productId: string, channelId: string): Promise<void>
  async unpublishFromChannel(productId: string, channelId: string): Promise<void>
  async syncChannel(channelId: string): Promise<SyncResult>
  
  // Export Operations
  async exportProducts(config: ExportConfig): Promise<ExportJob>
  async generateFeed(channelId: string, format: ExportFormat): Promise<Buffer>
  async scheduleFeedGeneration(channelId: string, schedule: CronExpression): Promise<void>
  
  // API Access
  async getChannelProducts(channelId: string, filters?: ProductFilter): Promise<Product[]>
  async getProductByChannelSku(channelId: string, sku: string): Promise<Product>
}
```

## Common Module

**Purpose**: Shared utilities and common functionality.

**Structure**:
```
src/common/
├── decorators/
│   ├── api-paginated-response.decorator.ts
│   └── transform.decorator.ts
├── dto/
│   ├── pagination.dto.ts
│   └── response.dto.ts
├── filters/
│   ├── http-exception.filter.ts
│   └── validation-exception.filter.ts
├── interceptors/
│   ├── transform.interceptor.ts
│   └── timeout.interceptor.ts
├── pipes/
│   ├── validation.pipe.ts
│   └── parse-uuid.pipe.ts
├── utils/
│   ├── pagination.util.ts
│   ├── slug.util.ts
│   └── hash.util.ts
└── common.module.ts
```

## Inter-Module Communication

### Service Dependencies

```typescript
// Example: ProductService using other services
@Injectable()
export class ProductService {
  constructor(
    @Inject(forwardRef(() => AttributeService))
    private attributeService: AttributeService,
    
    @Inject(forwardRef(() => CategoryService))
    private categoryService: CategoryService,
    
    @Inject(forwardRef(() => MediaService))
    private mediaService: MediaService,
    
    @Inject(forwardRef(() => WorkflowService))
    private workflowService: WorkflowService,
  ) {}
}
```

### Event-Based Communication

```typescript
// Event Emitter for loose coupling
export enum PIMEvents {
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_PUBLISHED = 'product.published',
  WORKFLOW_COMPLETED = 'workflow.completed',
  IMPORT_COMPLETED = 'import.completed',
}

// Event payload interfaces
export interface ProductCreatedEvent {
  productId: string;
  userId: string;
  timestamp: Date;
}

// Usage in service
@Injectable()
export class ProductService {
  constructor(private eventEmitter: EventEmitter2) {}
  
  async create(dto: CreateProductDto): Promise<Product> {
    const product = await this.repository.save(dto);
    
    this.eventEmitter.emit(
      PIMEvents.PRODUCT_CREATED,
      { productId: product.id, userId: dto.userId, timestamp: new Date() }
    );
    
    return product;
  }
}
```

## Module Configuration

### Module Registration

```typescript
// app.module.ts
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchema,
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations in production
      }),
      inject: [ConfigService],
    }),
    
    // Core Modules
    CoreModule,
    CommonModule,
    
    // Domain Modules
    ProductModule,
    AttributeModule,
    CategoryModule,
    MediaModule,
    WorkflowModule,
    IngestionModule,
    SyndicationModule,
  ],
})
export class AppModule {}
```

### Module Exports

```typescript
// Example: ProductModule
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductBundle,
      ProductRelationship,
    ]),
    CommonModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    VariantService,
    BundleService,
    RelationshipService,
  ],
  exports: [ProductService], // Export for use in other modules
})
export class ProductModule {}
```

## Testing Strategy

### Unit Testing

```typescript
// product.service.spec.ts
describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<Product>;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();
    
    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });
  
  describe('create', () => {
    it('should create a product', async () => {
      // Test implementation
    });
  });
});
```

### Integration Testing

```typescript
// product.e2e-spec.ts
describe('ProductController (e2e)', () => {
  let app: INestApplication;
  
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  it('/products (POST)', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send(createProductDto)
      .expect(201)
      .expect((res) => {
        expect(res.body.sku).toBe(createProductDto.sku);
      });
  });
});
```

---
*Last Updated: [Current Date]*
*Version: 1.0*
