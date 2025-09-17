---
sidebar_position: 2
title: Media Library
---

# Media Library

The Media Library is a centralized digital asset management system that handles all product images, videos, and documents in your PIM.

## Overview

The Media Library provides:
- **Centralized Storage** - All digital assets in one place
- **Image Optimization** - Automatic optimization and thumbnail generation
- **Advanced Search** - Powerful search and filtering capabilities
- **Media Tagging** - Comprehensive tagging and metadata management
- **Product Association** - Easy linking with products
- **Bulk Operations** - Upload and management tools for multiple files

## Key Features

### Upload Methods

#### 1. Direct Upload
Upload files directly to the media library:
- Drag and drop multiple files
- Click to browse and select
- Support for batch uploads (up to 10 files at once)
- Automatic file validation

#### 2. Product Context Upload
Upload media while editing products:
- Upload directly from product forms
- Automatic association with the current product
- Set primary product images
- Manage product galleries

### File Management

#### Supported Formats
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, AVI (up to 100MB)
- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Maximum file size**: 50MB for images, 100MB for videos

#### Automatic Processing
- **Thumbnail Generation**: Small (150px), Medium (300px), Large (800px)
- **Image Optimization**: Automatic compression while maintaining quality
- **Metadata Extraction**: EXIF data, dimensions, file size
- **Format Conversion**: WebP generation for web optimization

### Organization Features

#### Search & Filter
- Search by filename or description
- Filter by file type (images, videos, documents)
- Filter by upload date
- Filter by association status

#### Bulk Operations
- Select multiple items
- Bulk delete
- Bulk associate with products
- Bulk metadata update

## User Interface

### Grid View
Perfect for browsing images:
- Visual thumbnails
- Quick preview on hover
- Batch selection with checkboxes
- Drag to reorder (in product context)

### List View
Ideal for detailed management:
- Comprehensive file information
- Sort by name, size, date
- Quick actions per item
- Inline metadata editing

### Media Details Modal
Access detailed information:
- Full-size preview
- Complete metadata
- Edit alt text and descriptions
- View usage across products
- Download original file

## Working with Products

### Associating Media

#### From Product Form
1. Edit a product
2. Navigate to "Product Media" section
3. Click "Select from Library" or "Upload New"
4. Choose media items
5. Save the product

#### From Media Library
1. Select media items
2. Click "Associate with Products"
3. Search and select products
4. Confirm association

### Setting Primary Images
- Each product can have one primary image
- Primary image appears in product listings
- Set via star icon in product media section
- Automatically used for thumbnails

### Managing Product Galleries
- Reorder images by dragging
- Remove images without deleting from library
- Set image-specific alt text
- Configure display order

## API Integration

### Upload Endpoint
```typescript
POST /api/media/upload
Content-Type: multipart/form-data

// Request
{
  files: File[],
  productIds?: string[],
  metadata?: {
    alt?: string,
    title?: string,
    description?: string
  }
}

// Response
{
  success: true,
  data: {
    successful: Media[],
    failed: FailedUpload[],
    totalProcessed: number
  }
}
```

### Get Media List
```typescript
GET /api/media
Query Parameters:
  - page: number
  - limit: number  
  - search: string
  - type: 'image' | 'video' | 'document'
  - sortBy: 'createdAt' | 'name' | 'size'
  - sortOrder: 'asc' | 'desc'
```

### Associate with Products
```typescript
POST /api/media/:id/products
{
  productIds: string[]
}
```

## Best Practices

### Image Guidelines
1. **Resolution**: Minimum 800x800px for product images
2. **Format**: Use JPEG for photos, PNG for graphics with transparency
3. **Naming**: Use descriptive filenames (e.g., `blue-tshirt-front.jpg`)
4. **Alt Text**: Always provide descriptive alt text for accessibility

### Organization Tips
1. **Regular Cleanup**: Remove orphaned media monthly
2. **Consistent Naming**: Establish naming conventions
3. **Metadata**: Fill in descriptions for better searchability
4. **Categories**: Use consistent categorization

### Performance Optimization
1. **Use Thumbnails**: Load thumbnails in lists, full images only when needed
2. **Lazy Loading**: Implemented by default in grid views
3. **CDN Ready**: Structure supports CDN integration
4. **WebP Format**: Automatically generated for modern browsers

## Storage Structure

Media files are organized as follows:
```
uploads/
├── products/
│   ├── SKU-001/
│   │   ├── main.jpg
│   │   └── gallery/
├── thumbnails/
│   ├── small/
│   ├── medium/
│   └── large/
└── temp/
```

## Security

### Access Control
- Role-based permissions for upload/delete
- Secure file validation
- Virus scanning (when configured)
- CORS configuration for trusted domains

### File Validation
- MIME type verification
- File extension validation
- Size limits enforcement
- Malicious content detection

## Troubleshooting

### Common Issues

#### Upload Failures
- Check file size limits
- Verify file format is supported
- Ensure sufficient storage space
- Check user permissions

#### Missing Thumbnails
```bash
# Regenerate thumbnails
npm run media:regenerate-thumbnails
```

#### Broken Image Links
- Verify upload directory exists
- Check file permissions
- Validate storage path configuration

### Cleanup Commands

```bash
# Remove orphaned media
npm run media:cleanup-orphaned

# Clear thumbnail cache
npm run media:clear-thumbnails

# Optimize all images
npm run media:optimize
```

## Configuration

### Environment Variables
```env
# Media settings in .env
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800  # 50MB in bytes
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp
THUMBNAIL_SIZES=150,300,800
ENABLE_WEBP_CONVERSION=true
```

### Storage Options
- **Local Storage**: Default, files stored in `uploads/` directory
- **S3 Compatible**: Configure for cloud storage
- **CDN Integration**: CloudFlare, Cloudinary support

## Future Enhancements

Planned features for upcoming releases:
- **Image Editor** - Built-in crop, rotate, and filter tools
- **AI Auto-tagging** - Intelligent automatic tagging
- **Usage Analytics** - Detailed reports and insights
- **Version Control** - Track changes to media files
- **Video Thumbnails** - Automatic extraction from videos
- **Visual Search** - Find similar images by appearance

---

For API details, see [Media API Documentation](../api/media)