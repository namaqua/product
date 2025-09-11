# Attribute Module - Complete Documentation

## Overview
The Attribute Module provides a flexible, dynamic attribute system for products using the Entity-Attribute-Value (EAV) pattern. This allows for unlimited custom attributes without modifying the database schema.

## Architecture

### Core Components

1. **Entities**
   - `Attribute` - Defines attribute metadata and validation rules
   - `AttributeGroup` - Organizes attributes into logical groups
   - `AttributeOption` - Stores options for select/multiselect attributes
   - `AttributeValue` - Stores actual attribute values for products (EAV pattern)

2. **Service Layer**
   - Comprehensive CRUD operations
   - Value validation based on attribute type
   - Bulk operations for efficiency
   - Query and filtering capabilities

3. **Controller Layer**
   - RESTful API endpoints
   - Role-based access control
   - Swagger documentation

## Features

### 1. Attribute Types Supported
- **Text** - Single line text input
- **Textarea** - Multi-line text input
- **Number** - Integer values
- **Decimal** - Decimal/float values
- **Date** - Date only
- **DateTime** - Date and time
- **Boolean** - True/false values
- **Select** - Single selection from options
- **Multiselect** - Multiple selections from options
- **Color** - Color picker
- **URL** - URL validation
- **Email** - Email validation
- **JSON** - Complex structured data

### 2. Validation System
- Required field validation
- Unique value constraints
- Type-specific validation (email, URL, etc.)
- Custom validation rules:
  - Min/Max values for numbers
  - Min/Max length for text
  - Pattern matching with regex
  - Custom validation messages

### 3. Organization Features
- **Attribute Groups** - Logical grouping of related attributes
- **Sort ordering** - Control display order
- **Visibility settings** - Control where attributes appear
- **Localization support** - Multi-language attribute values

### 4. Product Integration
- Efficient EAV storage pattern
- Bulk value operations
- Locale-specific values
- Performance-optimized queries

## API Endpoints

### Attribute Management

#### Create Attribute
```http
POST /api/v1/attributes
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "product_color",
  "name": "Product Color",
  "type": "select",
  "groupId": "uuid",
  "isRequired": true,
  "isFilterable": true,
  "options": [
    {"value": "red", "label": "Red", "color": "#FF0000"},
    {"value": "blue", "label": "Blue", "color": "#0000FF"}
  ]
}
```

#### Get All Attributes
```http
GET /api/v1/attributes?page=1&limit=20&type=select&isFilterable=true
Authorization: Bearer {token}
```

#### Get Attribute by ID
```http
GET /api/v1/attributes/{id}
Authorization: Bearer {token}
```

#### Get Attribute by Code
```http
GET /api/v1/attributes/code/{code}
Authorization: Bearer {token}
```

#### Update Attribute
```http
PATCH /api/v1/attributes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "helpText": "New help text"
}
```

#### Delete Attribute
```http
DELETE /api/v1/attributes/{id}
Authorization: Bearer {token}
```

### Attribute Groups

#### Create Group
```http
POST /api/v1/attributes/groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "technical_specs",
  "name": "Technical Specifications",
  "sortOrder": 1,
  "isCollapsible": true
}
```

#### Get All Groups
```http
GET /api/v1/attributes/groups
Authorization: Bearer {token}
```

#### Get Attributes by Group
```http
GET /api/v1/attributes/groups/{groupId}/attributes
Authorization: Bearer {token}
```

### Product Attribute Values

#### Set Single Value
```http
POST /api/v1/attributes/products/{productId}/values
Authorization: Bearer {token}
Content-Type: application/json

{
  "attributeId": "uuid",
  "value": "Red",
  "locale": "en"
}
```

#### Bulk Set Values
```http
POST /api/v1/attributes/products/values/bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "uuid",
  "values": [
    {"attributeId": "uuid1", "value": "Red", "locale": "en"},
    {"attributeId": "uuid2", "value": 2.5, "locale": "en"}
  ]
}
```

#### Get Product Values
```http
GET /api/v1/attributes/products/{productId}/values?locale=en
Authorization: Bearer {token}
```

#### Delete Value
```http
DELETE /api/v1/attributes/products/{productId}/values/{attributeId}?locale=en
Authorization: Bearer {token}
```

### Specialized Queries

#### Get Filterable Attributes
```http
GET /api/v1/attributes/filterable
Authorization: Bearer {token}
```

## Database Schema

### attributes Table
```sql
CREATE TABLE attributes (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM(...) NOT NULL,
  groupId UUID REFERENCES attribute_groups(id),
  isRequired BOOLEAN DEFAULT false,
  isUnique BOOLEAN DEFAULT false,
  validationRules JSONB,
  defaultValue VARCHAR(500),
  sortOrder INTEGER DEFAULT 0,
  isVisibleInListing BOOLEAN DEFAULT true,
  isVisibleInDetail BOOLEAN DEFAULT true,
  isComparable BOOLEAN DEFAULT false,
  isSearchable BOOLEAN DEFAULT false,
  isFilterable BOOLEAN DEFAULT false,
  isLocalizable BOOLEAN DEFAULT false,
  helpText VARCHAR(255),
  placeholder VARCHAR(100),
  unit VARCHAR(50),
  uiConfig JSONB,
  -- Audit fields
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  createdBy UUID,
  updatedBy UUID,
  version INTEGER,
  isActive BOOLEAN DEFAULT true,
  isDeleted BOOLEAN DEFAULT false,
  deletedAt TIMESTAMP,
  deletedBy UUID
);
```

### attribute_values Table (EAV Storage)
```sql
CREATE TABLE attribute_values (
  id UUID PRIMARY KEY,
  productId UUID NOT NULL REFERENCES products(id),
  attributeId UUID NOT NULL REFERENCES attributes(id),
  textValue TEXT,
  numberValue NUMERIC(20,6),
  dateValue TIMESTAMP,
  booleanValue BOOLEAN,
  jsonValue JSONB,
  locale VARCHAR(10) DEFAULT 'en',
  -- Audit fields
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  createdBy UUID,
  updatedBy UUID,
  version INTEGER,
  isActive BOOLEAN DEFAULT true,
  UNIQUE(productId, attributeId, locale)
);
```

## Usage Examples

### Creating a Complete Attribute Set

```typescript
// 1. Create an attribute group
const group = await attributesService.createGroup({
  code: 'technical',
  name: 'Technical Specifications',
  sortOrder: 1
}, userId);

// 2. Create a select attribute with options
const colorAttribute = await attributesService.create({
  code: 'color',
  name: 'Color',
  type: AttributeType.SELECT,
  groupId: group.id,
  isRequired: true,
  isFilterable: true,
  options: [
    { value: 'red', label: 'Red', color: '#FF0000' },
    { value: 'blue', label: 'Blue', color: '#0000FF' },
    { value: 'green', label: 'Green', color: '#00FF00' }
  ]
}, userId);

// 3. Create a number attribute with validation
const weightAttribute = await attributesService.create({
  code: 'weight',
  name: 'Weight',
  type: AttributeType.DECIMAL,
  groupId: group.id,
  unit: 'kg',
  validationRules: [
    { type: 'min', value: 0, message: 'Weight must be positive' },
    { type: 'max', value: 1000, message: 'Weight cannot exceed 1000kg' }
  ]
}, userId);

// 4. Set values for a product
await attributesService.bulkSetAttributeValues({
  productId: 'product-uuid',
  values: [
    { attributeId: colorAttribute.id, value: 'red', locale: 'en' },
    { attributeId: weightAttribute.id, value: 2.5, locale: 'en' }
  ]
}, userId);
```

### Retrieving Product Attributes

```typescript
// Get all attribute values for a product
const values = await attributesService.getProductAttributeValues(
  productId,
  'en' // locale
);

// Result format:
[
  {
    id: 'value-uuid',
    productId: 'product-uuid',
    attributeId: 'attr-uuid',
    attributeCode: 'color',
    attributeName: 'Color',
    value: 'red',
    displayValue: 'Red',
    locale: 'en',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
]
```

### Dynamic Form Generation

```typescript
// Get attributes for a category/group
const attributes = await attributesService.getAttributesByGroup(groupId);

// Generate form fields dynamically
attributes.forEach(attr => {
  switch(attr.type) {
    case 'text':
      // Render text input
      break;
    case 'select':
      // Render dropdown with attr.options
      break;
    case 'boolean':
      // Render checkbox
      break;
    // ... handle other types
  }
});
```

## Performance Considerations

1. **Indexed Columns**
   - `attributes.code` - Unique index for fast lookups
   - `attribute_values.productId` - Fast product queries
   - `attribute_values.attributeId` - Fast attribute queries
   - Composite index on `(productId, attributeId, locale)`

2. **EAV Pattern Benefits**
   - Unlimited attributes without schema changes
   - Efficient storage (only stores actual values)
   - Flexible validation per attribute

3. **Query Optimization**
   - Use bulk operations for multiple values
   - Leverage JSONB for complex data
   - Proper indexing on frequently queried fields

## Best Practices

1. **Attribute Naming**
   - Use descriptive codes (e.g., `product_weight`, not `pw`)
   - Keep codes consistent across the system
   - Use snake_case for codes

2. **Validation Rules**
   - Always validate on both frontend and backend
   - Provide clear error messages
   - Use appropriate types for data

3. **Organization**
   - Group related attributes
   - Use sort orders for logical display
   - Mark required fields appropriately

4. **Performance**
   - Use bulk operations when possible
   - Cache frequently accessed attributes
   - Consider denormalization for heavy queries

## Security

- Role-based access control (Admin/Manager for write operations)
- Input validation on all endpoints
- SQL injection protection via TypeORM
- XSS protection for stored values

## Testing

Run the test script to verify functionality:

```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
chmod +x test-attributes-module.sh
./test-attributes-module.sh
```

## Migration Notes

When migrating from a fixed schema:
1. Create attribute definitions for existing columns
2. Migrate data to attribute_values table
3. Update queries to use EAV pattern
4. Remove old columns (after verification)

## Future Enhancements

- [ ] Attribute templates for quick setup
- [ ] Attribute inheritance from categories
- [ ] Computed/derived attributes
- [ ] Attribute value history tracking
- [ ] Import/export attribute definitions
- [ ] Attribute value indexing for search
- [ ] Attribute-based pricing rules
- [ ] Conditional attributes (show/hide based on other values)

## Conclusion

The Attribute Module provides a robust, flexible system for managing dynamic product attributes. The EAV pattern ensures unlimited extensibility while maintaining performance through proper indexing and optimization.
