# Enhanced Media Library Documentation

## Overview
The Enhanced Media Library provides comprehensive media management for the PIM system with advanced features for image processing, thumbnail generation, PDF handling, and bulk operations.

## Features

### Core Capabilities
- **Multi-format Support**: Images (JPEG, PNG, WebP, GIF), PDFs, Documents (Word, Excel)
- **Automatic Thumbnail Generation**: Multiple sizes with SKU-based naming
- **Batch Upload**: Process up to 20 files simultaneously
- **Image Optimization**: Automatic compression and format conversion
- **PDF Support**: Document storage and metadata extraction
- **Product Association**: Link media to single or multiple products
- **Orphaned Media Cleanup**: Remove unused files
- **Library Statistics**: Track usage and storage metrics

### Thumbnail Sizes
The system automatically generates 5 thumbnail sizes:
- **thumb**: 150x150px (cover fit, 80% quality)
- **small**: 300x300px (inside fit, 85% quality)
- **medium**: 600x600px (inside fit, 85% quality)
- **large**: 1200x1200px (inside fit, 90% quality)
- **gallery**: 800x800px (inside fit, 90% quality)

### File Naming Convention
Thumbnails are named using the pattern:
- With SKU: `{SKU}_{size}_{timestamp}.{ext}`
- Without SKU: `{filename}_{size}_{timestamp}.{ext}`

## API Endpoints

### Upload Endpoints

#### Single File Upload
```http
POST /api/media/upload
Content-Type: multipart/form-data

file: binary
alt: string (optional)
title: string (optional)
description: string (optional)
productIds: string[] (optional)
isPrimary: boolean (optional)
```

#### Batch Upload
```http
POST /api/media/upload/batch
Content-Type: multipart/form-data

files: binary[] (max 20)
productIds: string[] (optional)
```

### Media Management

#### Get Media by Product SKU
```http
GET /api/media/product/sku/{sku}
```

#### Set Primary Media
```http
PUT /api/media/product/{productId}/primary/{mediaId}
```

#### Regenerate Thumbnails
```http
POST /api/media/{id}/regenerate-thumbnails
```

#### Optimize Product Images
```http
POST /api/media/product/{productId}/optimize
```

### Library Management

#### Get Statistics
```http
GET /api/media/stats
```

Response:
```json
{
  "totalFiles": 1250,
  "totalSize": 524288000,
  "byType": {
    "image": 1000,
    "document": 200,
    "video": 50
  },
  "averageFileSize": 419430,
  "totalProducts": 450
}
```

#### Cleanup Orphaned Media
```http
POST /api/media/cleanup/orphaned
{
  "dryRun": true  // Set to false to actually delete
}
```

## File Size Limits
- Images: 10MB
- Videos: 100MB
- PDFs: 50MB
- Other documents: 25MB

## Usage Examples

### Upload Image with Product Association
```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('alt', 'Product main image');
formData.append('title', 'Blue Widget Front View');
formData.append('productIds', JSON.stringify(['product-123']));
formData.append('isPrimary', 'true');

const response = await fetch('/api/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Batch Upload for Product
```typescript
const formData = new FormData();
files.forEach(file => {
  formData.append('files', file);
});
formData.append('productIds', JSON.stringify(['product-456']));

const response = await fetch('/api/media/upload/batch', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Get Media for Product by SKU
```typescript
const response = await fetch('/api/media/product/sku/WIDGET-001', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const media = await response.json();
// Access thumbnails
media.data.items.forEach(item => {
  console.log('Thumbnails:', item.thumbnails);
  // {
  //   thumb: '/uploads/thumbnails/WIDGET-001_thumb_1234567890.jpg',
  //   small: '/uploads/thumbnails/WIDGET-001_small_1234567890.jpg',
  //   medium: '/uploads/thumbnails/WIDGET-001_medium_1234567890.jpg',
  //   large: '/uploads/thumbnails/WIDGET-001_large_1234567890.jpg',
  //   gallery: '/uploads/thumbnails/WIDGET-001_gallery_1234567890.jpg'
  // }
});
```

## Directory Structure
```
uploads/
├── thumbnails/     # Generated thumbnails
├── temp/          # Temporary upload storage
├── documents/     # PDF and document files
├── images/        # Original images
└── *.ext         # Root level uploads
```

## Database Schema

### Media Entity Enhancements
```sql
-- New/Enhanced columns
thumbnails JSONB       -- Stores thumbnail URLs by size
metadata JSONB         -- Stores EXIF, dimensions, etc.
width INTEGER         -- Image width in pixels
height INTEGER        -- Image height in pixels
duration INTEGER      -- Video/audio duration
isPrimary BOOLEAN     -- Primary media flag

-- Indexes for performance
CREATE INDEX IDX_media_type ON media(type);
CREATE INDEX IDX_media_mimeType ON media(mimeType);
CREATE INDEX IDX_media_isPrimary ON media(isPrimary);
CREATE INDEX IDX_media_thumbnails ON media USING GIN(thumbnails);
CREATE INDEX IDX_media_metadata ON media USING GIN(metadata);
```

## Media Processing Pipeline

### Image Processing Flow
1. **Upload**: File received via multipart form
2. **Validation**: Check file type and size limits
3. **Storage**: Save original to disk with UUID filename
4. **Analysis**: Extract dimensions, EXIF data
5. **Thumbnail Generation**: Create 5 size variants
6. **SKU Naming**: Apply product SKU to thumbnail names
7. **Database**: Store metadata and associations
8. **Response**: Return media object with URLs

### PDF Processing Flow
1. **Upload**: PDF file received
2. **Validation**: Verify PDF format and size
3. **Storage**: Save to documents directory
4. **Metadata**: Extract file information
5. **Database**: Store with document type
6. **Response**: Return document object

## Performance Considerations

### Batch Processing
- Files processed in parallel batches of 5
- Prevents memory overload with large uploads
- Failed files don't block successful ones

### Image Optimization
- Progressive JPEG encoding
- PNG compression level 9
- WebP quality optimization
- Resize without enlargement

### Caching Strategy
- Thumbnails generated once and cached
- Regeneration available on demand
- CDN-ready URL structure

## Error Handling

### Upload Failures
```json
{
  "successful": [...],
  "failed": [
    {
      "filename": "large-file.jpg",
      "error": "File size exceeds limit of 10MB"
    }
  ],
  "totalProcessed": 10
}
```

### Recovery Options
- Individual file re-upload
- Thumbnail regeneration
- Orphaned file cleanup

## Best Practices

### Product Media Organization
1. Set one primary image per product
2. Use descriptive alt text for accessibility
3. Maintain consistent image dimensions
4. Optimize images before upload when possible

### File Management
1. Regular orphaned media cleanup
2. Monitor storage usage via stats endpoint
3. Use batch upload for multiple files
4. Associate media immediately with products

### Performance Tips
1. Use appropriate thumbnail sizes in UI
2. Lazy load images in galleries
3. Implement pagination for large media sets
4. Cache thumbnail URLs client-side

## Migration Guide

### From Basic to Enhanced Media
1. Run database migration:
   ```bash
   npm run migration:run
   ```

2. Regenerate thumbnails for existing media:
   ```bash
   # Via API for each media item
   POST /api/media/{id}/regenerate-thumbnails
   ```

3. Update frontend to use new thumbnail URLs

## Troubleshooting

### Common Issues

#### Thumbnails Not Generated
- Check Sharp installation: `npm ls sharp`
- Verify write permissions on uploads/thumbnails
- Check logs for processing errors

#### File Upload Fails
- Verify file size limits
- Check MIME type validation
- Ensure upload directory exists

#### Memory Issues with Large Batches
- Reduce batch size in configuration
- Increase Node.js memory limit
- Process files sequentially if needed

## Configuration

### Environment Variables
```env
UPLOAD_PATH=./uploads
BASE_URL=http://localhost:3010
MAX_FILE_SIZE=52428800  # 50MB
THUMBNAIL_QUALITY=85
```

### Multer Configuration
```typescript
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueSuffix);
  },
});
```

## Security Considerations

### File Validation
- MIME type checking
- File extension validation
- Magic number verification (planned)
- Virus scanning integration (optional)

### Access Control
- JWT authentication required for uploads
- Role-based permissions (planned)
- Secure file serving via signed URLs (planned)

## Future Enhancements

### Planned Features
- [ ] Video thumbnail extraction
- [ ] AI-powered image tagging
- [ ] Automatic background removal
- [ ] Smart cropping with face detection
- [ ] WebP auto-conversion
- [ ] S3/Cloud storage integration
- [ ] Image similarity search
- [ ] Watermark templates
- [ ] HEIC/HEIF support
- [ ] 360° product image support

### API Improvements
- [ ] GraphQL support
- [ ] Webhook notifications
- [ ] Bulk operations via job queue
- [ ] Real-time upload progress
- [ ] Resumable uploads

## Support

For issues or questions about the Enhanced Media Library:
1. Check this documentation
2. Review error logs in `logs/media-processor.log`
3. Verify database migrations are current
4. Ensure all dependencies are installed

---

*Last Updated: December 2024*
*Version: 2.0.0*
