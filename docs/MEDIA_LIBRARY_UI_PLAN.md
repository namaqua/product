# Media Library UI Implementation Plan

## Overview
This document outlines the UI implementation plan for the Media Library interface, following the wizard-based patterns established in the Multi Axis Variation Wizard. The implementation prioritizes user experience with step-by-step workflows for complex operations while maintaining simplicity for basic tasks.

## Architecture Overview

### Component Structure
```
/admin/src/features/media/
├── MediaLibrary.tsx              # Main library view with grid/list toggle
├── MediaUploadWizard.tsx         # Multi-step upload wizard
├── MediaBatchUploadWizard.tsx    # Batch upload with product association
├── MediaDetailsModal.tsx         # View/edit media details
├── MediaGalleryView.tsx          # Gallery grid component
├── MediaListView.tsx             # Table list component
├── MediaFilters.tsx              # Advanced filtering sidebar
├── MediaBulkActions.tsx          # Bulk selection and actions
├── MediaLightbox.tsx             # Full-screen preview
├── MediaAssociationWizard.tsx   # Product association wizard
└── components/
    ├── MediaCard.tsx             # Grid item component
    ├── MediaThumbnail.tsx        # Thumbnail with loading states
    ├── MediaUploadDropzone.tsx   # Drag-drop upload zone
    ├── MediaMetadataForm.tsx     # Metadata editing form
    └── MediaPreview.tsx          # Preview component for different types
```

## Phase 1: Main Media Library View

### 1.1 MediaLibrary.tsx - Main Container
**Features:**
- Toggle between Grid and List views
- Search bar with instant filtering
- Filter sidebar (collapsible)
- Bulk selection mode
- Upload trigger button
- Statistics bar (total files, storage used)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [← Back] Media Library                     [Upload] [⚙] │
├─────────────────────────────────────────────────────────┤
│ 🔍 Search media...          [Grid] [List] [Select Mode] │
├─────────────────────────────────────────────────────────┤
│ Filters │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ ────────│  │      │ │      │ │      │ │      │        │
│ Type    │  │ IMG  │ │ IMG  │ │ PDF  │ │ IMG  │        │
│ □ Image │  │      │ │      │ │      │ │      │        │
│ □ Video │  └──────┘ └──────┘ └──────┘ └──────┘        │
│ □ Docs  │  Product1  Product2  Report   Product3        │
│         │                                               │
│ Product │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ [Select]│  │      │ │      │ │      │ │      │        │
│         │  │ IMG  │ │ VID  │ │ IMG  │ │ DOC  │        │
│ Date    │  │      │ │      │ │      │ │      │        │
│ [Range] │  └──────┘ └──────┘ └──────┘ └──────┘        │
│         │  Product4  Demo     Product5  Manual          │
└─────────────────────────────────────────────────────────┘
│ 125 files • 2.3 GB used • Page 1 of 7      [< 1 2 3 >] │
└─────────────────────────────────────────────────────────┘
```

### 1.2 View Modes

#### Grid View (MediaGalleryView.tsx)
- **Card Layout**: Responsive grid (6 cols on XL, 4 on LG, 3 on MD, 2 on SM)
- **Card Content**:
  - Thumbnail with type badge
  - Filename (truncated)
  - File size
  - Associated products count
  - Primary badge if applicable
  - Hover actions: View, Edit, Delete
  - Checkbox for bulk selection

#### List View (MediaListView.tsx)
- **Table Columns**:
  - [ ] Checkbox
  - Thumbnail (40x40)
  - Filename
  - Type
  - Size
  - Dimensions (for images)
  - Products (count with popover)
  - Modified Date
  - Actions

### 1.3 Filtering System (MediaFilters.tsx)
- **Filter Options**:
  - Media Type (multi-select)
  - Product Association (search select)
  - File Size Range (slider)
  - Date Range (date picker)
  - Primary Media Only (toggle)
  - Orphaned Media (toggle)
  
## Phase 2: Upload Wizard Implementation

### 2.1 MediaUploadWizard.tsx - Single/Multi Upload
**Step-by-step wizard for uploading media with metadata**

#### Step 1: File Selection
```
┌─────────────────────────────────────────────────────────┐
│                    Upload Media Files                    │
├─────────────────────────────────────────────────────────┤
│  ○──○──○──○──○  Step 1: Select Files                    │
│                                                          │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐      │
│  │                                                │      │
│  │         📁 Drop files here or click to browse │      │
│  │                                                │      │
│  │         Supports: JPG, PNG, PDF, DOC          │      │
│  │         Max size: 50MB per file               │      │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘      │
│                                                          │
│  Selected Files (3):                                    │
│  ✓ product-hero.jpg (2.3 MB)                    [×]     │
│  ✓ product-detail.png (1.8 MB)                  [×]     │
│  ✓ specifications.pdf (450 KB)                  [×]     │
│                                                          │
│  [Cancel]                              [Next: Metadata →]│
└─────────────────────────────────────────────────────────┘
```

#### Step 2: Bulk Metadata
```
┌─────────────────────────────────────────────────────────┐
│                    Upload Media Files                    │
├─────────────────────────────────────────────────────────┤
│  ●──○──○──○──○  Step 2: Common Settings                 │
│                                                          │
│  Apply to All Files:                                    │
│                                                          │
│  Product Association:                                   │
│  [Select Products...                               ▼]   │
│                                                          │
│  □ Set first image as primary                           │
│  □ Generate thumbnails automatically                     │
│  □ Optimize images for web                              │
│                                                          │
│  Default Alt Text Pattern:                              │
│  [${product_name} - ${filename}                    ]    │
│                                                          │
│  Tags:                                                  │
│  [product] [hero] [2024] [+Add tag]                     │
│                                                          │
│  [← Previous]                    [Next: Individual →]    │
└─────────────────────────────────────────────────────────┘
```

#### Step 3: Individual Metadata
```
┌─────────────────────────────────────────────────────────┐
│                    Upload Media Files                    │
├─────────────────────────────────────────────────────────┤
│  ●──●──○──○──○  Step 3: Individual Settings (1 of 3)    │
│                                                          │
│  [◀] product-hero.jpg [▶]                               │
│  ┌────────────────┐                                     │
│  │                │  Filename: product-hero.jpg         │
│  │    [Preview]   │  Size: 2.3 MB                       │
│  │                │  Type: Image                        │
│  │                │  Dimensions: 1920x1080              │
│  └────────────────┘                                     │
│                                                          │
│  Title: [Product Hero Image                        ]    │
│  Alt Text: [Main product hero shot                 ]    │
│  Description: [High-resolution hero image...       ]    │
│                                                          │
│  □ Primary media for associated products                │
│  Sort Order: [0    ]                                    │
│                                                          │
│  [← Previous]        [Skip Individual] [Next: Review →] │
└─────────────────────────────────────────────────────────┘
```

#### Step 4: Processing Options
```
┌─────────────────────────────────────────────────────────┐
│                    Upload Media Files                    │
├─────────────────────────────────────────────────────────┤
│  ●──●──●──○──○  Step 4: Processing Options              │
│                                                          │
│  Image Processing:                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │ ☑ Generate Thumbnails                          │    │
│  │   Sizes: □ Small (150x150) ☑ Medium (600x600)  │    │
│  │          ☑ Large (1200x1200) ☑ Gallery (800x800)│   │
│  │                                                 │    │
│  │ ☑ Optimize for Web                             │    │
│  │   Quality: [85%     =========○    ]             │    │
│  │   Format: ○ Keep Original ● Convert to WebP    │    │
│  │                                                 │    │
│  │ □ Add Watermark                                │    │
│  │   Position: [Bottom Right ▼]                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Document Processing:                                   │
│  ☑ Extract text for search indexing                     │
│  ☑ Generate preview thumbnail                           │
│                                                          │
│  [← Previous]                         [Next: Upload →]  │
└─────────────────────────────────────────────────────────┘
```

#### Step 5: Review & Upload
```
┌─────────────────────────────────────────────────────────┐
│                    Upload Media Files                    │
├─────────────────────────────────────────────────────────┤
│  ●──●──●──●──○  Step 5: Review & Upload                 │
│                                                          │
│  Ready to Upload:                                       │
│  ┌────────────────────────────────────────────────┐    │
│  │ 📷 product-hero.jpg    → Product SKU123        │    │
│  │    2.3 MB • Primary • Optimized                │    │
│  │                                                 │    │
│  │ 📷 product-detail.png  → Product SKU123        │    │
│  │    1.8 MB • Optimized                          │    │
│  │                                                 │    │
│  │ 📄 specifications.pdf  → Product SKU123        │    │
│  │    450 KB • Text indexed                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Total Size: 4.5 MB                                     │
│  Storage Available: 48.2 GB                             │
│                                                          │
│  ⚠ Files will be processed in background                │
│                                                          │
│  [← Previous] [Save as Template]    [🚀 Upload All]     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Upload States & Feedback
```
┌─────────────────────────────────────────────────────────┐
│                    Uploading Files...                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  product-hero.jpg                                       │
│  [████████████████████░░░░░] 75% • 1.7/2.3 MB          │
│                                                          │
│  product-detail.png                                     │
│  [████████████████████████] 100% • Processing...        │
│                                                          │
│  specifications.pdf                                      │
│  [░░░░░░░░░░░░░░░░░░░░░░░░] Waiting...                 │
│                                                          │
│  Uploaded: 1 • Processing: 1 • Remaining: 1             │
│                                                          │
│  [Cancel Remaining]              [Run in Background]     │
└─────────────────────────────────────────────────────────┘
```

## Phase 3: Media Management Features

### 3.1 MediaDetailsModal.tsx - View/Edit Modal
```
┌─────────────────────────────────────────────────────────┐
│ product-hero.jpg                                   [×]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────┐    │
│ │                 │ │ File Information              │    │
│ │                 │ ├─────────────────────────────┤    │
│ │   [Full Image]  │ │ Filename: product-hero.jpg   │    │
│ │                 │ │ Type: Image/JPEG             │    │
│ │                 │ │ Size: 2.3 MB                 │    │
│ │                 │ │ Dimensions: 1920x1080        │    │
│ └─────────────────┘ │ Uploaded: Dec 12, 2024       │    │
│                     │ By: admin@test.com           │    │
│ Thumbnails:         └─────────────────────────────┘    │
│ [▣][▣][▣][▣]                                           │
│                     ┌─────────────────────────────┐    │
│ Metadata            │ Edit Properties              │    │
│ ─────────          ├─────────────────────────────┤    │
│ Title:             │ Title:                       │    │
│ [Product Hero...]   │ [___________________]       │    │
│                     │                              │    │
│ Alt Text:          │ Alt Text:                    │    │
│ [Main product...]   │ [___________________]       │    │
│                     │                              │    │
│ Description:       │ Description:                 │    │
│ [Full desc...]     │ [___________________]       │    │
│                     │ [___________________]       │    │
│                     │                              │    │
│ Products (2):      │ ☑ Primary for products       │    │
│ • SKU123 (Primary) │ Sort Order: [1    ]          │    │
│ • SKU456          └─────────────────────────────┘    │
│                                                          │
│ [Download] [Replace] [Delete]     [Cancel] [Save]      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 MediaBulkActions.tsx - Bulk Operations
**Triggered when in selection mode with items selected**

```
┌─────────────────────────────────────────────────────────┐
│ 12 items selected                               [×]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Bulk Actions:                                          │
│                                                          │
│  [📁 Move to Product] [🏷 Add Tags] [📝 Edit Metadata]  │
│  [⬇ Download] [🔄 Regenerate] [🗑 Delete]               │
│                                                          │
│  ─────────────────────────────────────────            │
│                                                          │
│  With Selected:                                         │
│  • Total Size: 28.4 MB                                  │
│  • Types: 8 Images, 3 PDFs, 1 Video                     │
│  • Products: Associated with 5 products                 │
│                                                          │
│  Quick Actions:                                         │
│  □ Set as primary for associated products               │
│  □ Generate missing thumbnails                          │
│  □ Optimize images                                      │
│                                                          │
│  [Cancel Selection]           [Apply Actions]           │
└─────────────────────────────────────────────────────────┘
```

### 3.3 MediaAssociationWizard.tsx - Product Association
**For associating/dissociating media with products**

#### Step 1: Select Action
```
┌─────────────────────────────────────────────────────────┐
│              Manage Product Associations                │
├─────────────────────────────────────────────────────────┤
│  ○──○──○  Step 1: Choose Action                         │
│                                                          │
│  Selected Media: 5 files                                │
│                                                          │
│  What would you like to do?                             │
│                                                          │
│  ○ Add to Products                                      │
│     Associate selected media with products              │
│                                                          │
│  ○ Remove from Products                                 │
│     Dissociate from specific products                   │
│                                                          │
│  ● Replace Associations                                 │
│     Clear existing and set new associations             │
│                                                          │
│  [Cancel]                         [Next: Products →]     │
└─────────────────────────────────────────────────────────┘
```

#### Step 2: Select Products
```
┌─────────────────────────────────────────────────────────┐
│              Manage Product Associations                │
├─────────────────────────────────────────────────────────┤
│  ●──○──○  Step 2: Select Products                       │
│                                                          │
│  Search Products:                                       │
│  [🔍 Search by name or SKU...                     ]     │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ □ SKU123 - Product Name 1                      │    │
│  │ ☑ SKU456 - Product Name 2                      │    │
│  │ ☑ SKU789 - Product Name 3                      │    │
│  │ □ SKU012 - Product Name 4                      │    │
│  │ □ SKU345 - Product Name 5                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Selected: 2 products                                   │
│                                                          │
│  Batch Selection:                                       │
│  [By Category ▼] [By Brand ▼] [Recent Products]        │
│                                                          │
│  [← Previous]                    [Next: Options →]      │
└─────────────────────────────────────────────────────────┘
```

#### Step 3: Association Options
```
┌─────────────────────────────────────────────────────────┐
│              Manage Product Associations                │
├─────────────────────────────────────────────────────────┤
│  ●──●──○  Step 3: Set Options                          │
│                                                          │
│  Primary Media Settings:                                │
│  ○ Don't change primary settings                        │
│  ● Set first image as primary                           │
│  ○ Let me choose primary for each product               │
│                                                          │
│  Sort Order:                                            │
│  ○ Add to end (highest sort order)                      │
│  ● Add to beginning (reorder existing)                  │
│  ○ Custom order                                         │
│                                                          │
│  Additional Options:                                    │
│  ☑ Update product modification timestamp                 │
│  ☑ Trigger product reindex                              │
│  □ Copy media metadata to product gallery               │
│                                                          │
│  Summary:                                               │
│  • 5 media files → 2 products                           │
│  • Total: 10 new associations                           │
│                                                          │
│  [← Previous] [Save Template]        [Apply Changes]    │
└─────────────────────────────────────────────────────────┘
```

## Phase 4: Advanced Features

### 4.1 MediaLightbox.tsx - Full Preview
```
┌─────────────────────────────────────────────────────────┐
│                                    [←][→] 3/12    [×]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│                   [Full Resolution Image]               │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ product-detail.jpg • 1920x1080 • 2.3MB                  │
│ [ℹ Info] [⬇ Download] [🔄 Rotate] [🔍 Zoom]            │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Batch Import from URL Wizard
```
┌─────────────────────────────────────────────────────────┐
│                Import Media from URLs                   │
├─────────────────────────────────────────────────────────┤
│  Enter URLs (one per line):                             │
│  ┌────────────────────────────────────────────────┐    │
│  │ https://example.com/image1.jpg                  │    │
│  │ https://example.com/image2.png                  │    │
│  │ https://cdn.example.com/product-hero.jpg       │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Or import from CSV:                                    │
│  [Choose File] template.csv                             │
│                                                          │
│  Import Options:                                        │
│  ☑ Download and store locally                           │
│  □ Keep as external reference only                      │
│  ☑ Validate URLs before import                          │
│                                                          │
│  [Cancel]                    [Validate & Import]        │
└─────────────────────────────────────────────────────────┘
```

## Phase 5: Analytics & Maintenance

### 5.1 Media Library Statistics Dashboard
```
┌─────────────────────────────────────────────────────────┐
│                Media Library Analytics                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Total Files  │ │ Storage Used │ │ Products     │   │
│  │    1,247     │ │   2.3 GB     │ │     456      │   │
│  │ +12 today    │ │ 76% of 3GB   │ │ with media   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                          │
│  File Types          Storage by Type    Upload Trend    │
│  ┌──────────┐       ┌──────────┐      ┌──────────┐    │
│  │ ▓▓▓▓▓░░░ │       │  Images  │      │ ╱╲    ╱╲ │    │
│  │ ▓▓▓░░░░░ │       │   1.8GB  │      │╱  ╲  ╱  ╲│    │
│  │ ▓░░░░░░░ │       │  Videos  │      │    ╲╱    │    │
│  └──────────┘       │   400MB  │      └──────────┘    │
│  Img Vid Doc        └──────────┘      Last 30 days     │
│                                                          │
│  Maintenance Actions:                                   │
│  [🧹 Clean Orphaned] [🔄 Regenerate Thumbs]            │
│  [📊 Export Report] [🗜 Optimize All]                  │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Orphaned Media Cleanup Wizard
```
┌─────────────────────────────────────────────────────────┐
│              Clean Up Orphaned Media                    │
├─────────────────────────────────────────────────────────┤
│  Scanning for orphaned media...                         │
│                                                          │
│  Found: 47 orphaned files (124 MB)                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ ☑ old-product-1.jpg - 2.1 MB - 3 months old   │    │
│  │ ☑ test-upload.png - 1.3 MB - 2 months old     │    │
│  │ □ draft-banner.jpg - 3.2 MB - 1 week old      │    │
│  │ ☑ deleted-prod.pdf - 450 KB - 6 months old    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Selection: 43 files (118 MB)                           │
│                                                          │
│  Options:                                               │
│  ○ Delete permanently                                   │
│  ● Move to archive                                      │
│  ○ Download then delete                                 │
│                                                          │
│  [Cancel] [Select All] [Deselect All]    [Clean Up]    │
└─────────────────────────────────────────────────────────┘
```

## Implementation Priority & Timeline

### Week 1: Core Components
1. **Day 1-2**: MediaLibrary.tsx with basic grid view
2. **Day 2-3**: MediaGalleryView.tsx and MediaCard.tsx
3. **Day 3-4**: MediaFilters.tsx and search functionality
4. **Day 4-5**: MediaDetailsModal.tsx for viewing/editing

### Week 2: Upload System
1. **Day 1-3**: MediaUploadWizard.tsx (5-step wizard)
2. **Day 3-4**: MediaUploadDropzone.tsx with drag-drop
3. **Day 4-5**: Upload progress and error handling

### Week 3: Management Features
1. **Day 1-2**: MediaBulkActions.tsx for bulk operations
2. **Day 2-3**: MediaAssociationWizard.tsx
3. **Day 3-4**: MediaLightbox.tsx for full preview
4. **Day 4-5**: List view and table implementation

### Week 4: Advanced Features & Polish
1. **Day 1-2**: Statistics dashboard
2. **Day 2-3**: Orphaned media cleanup
3. **Day 3-4**: Performance optimization
4. **Day 4-5**: Testing and bug fixes

## Technical Implementation Notes

### State Management
```typescript
// Use React Context for media library state
interface MediaLibraryState {
  items: Media[];
  selectedItems: string[];
  filters: MediaFilters;
  viewMode: 'grid' | 'list';
  loading: boolean;
  error: string | null;
  stats: MediaStats;
}

// Actions
type MediaAction = 
  | { type: 'SET_ITEMS'; payload: Media[] }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'BULK_SELECT'; payload: string[] }
  | { type: 'SET_FILTER'; payload: Partial<MediaFilters> }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'DELETE_SUCCESS'; payload: string[] }
  | { type: 'UPLOAD_SUCCESS'; payload: Media[] };
```

### File Upload Strategy
```typescript
// Chunked upload for large files
const uploadChunked = async (file: File, chunkSize = 1024 * 1024) => {
  const chunks = Math.ceil(file.size / chunkSize);
  const uploadId = generateUploadId();
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    await uploadChunk(uploadId, chunk, i, chunks);
    onProgress((i + 1) / chunks * 100);
  }
  
  return completeUpload(uploadId);
};
```

### Performance Optimizations
1. **Virtual Scrolling**: Use react-window for large media lists
2. **Lazy Loading**: Load thumbnails on scroll with IntersectionObserver
3. **Image Optimization**: Use responsive images with srcset
4. **Debounced Search**: 300ms debounce on search input
5. **Optimistic Updates**: Update UI before server confirmation
6. **Request Caching**: Cache media list with 5-minute TTL

### Accessibility Requirements
1. **Keyboard Navigation**: Full keyboard support for all actions
2. **Screen Reader Support**: Proper ARIA labels and announcements
3. **Focus Management**: Logical tab order and focus indicators
4. **Alt Text**: Enforce alt text for all images
5. **Color Contrast**: WCAG AA compliance minimum

### Integration Points
1. **Product Module**: Deep linking from product edit pages
2. **Dashboard**: Media usage statistics widget
3. **Search**: Include media in global search results
4. **Workflow**: Media approval workflow integration
5. **Import/Export**: Bulk media import via CSV

## Component Templates

### MediaCard Component Structure
```tsx
interface MediaCardProps {
  media: Media;
  selected: boolean;
  onSelect: (id: string) => void;
  onView: (media: Media) => void;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <div className={`
      relative group rounded-lg border-2 transition-all
      ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
    `}>
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(media.id)}
          className="w-4 h-4 text-blue-600 rounded"
        />
      </div>
      
      {/* Type Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`
          px-2 py-1 text-xs font-medium rounded-full
          ${media.type === 'image' ? 'bg-green-100 text-green-800' : ''}
          ${media.type === 'video' ? 'bg-purple-100 text-purple-800' : ''}
          ${media.type === 'document' ? 'bg-blue-100 text-blue-800' : ''}
        `}>
          {media.type.toUpperCase()}
        </span>
      </div>
      
      {/* Thumbnail */}
      <div className="aspect-w-1 aspect-h-1 bg-gray-100">
        <MediaThumbnail media={media} />
      </div>
      
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {media.filename}
        </p>
        <p className="text-xs text-gray-500">
          {media.humanReadableSize}
        </p>
        
        {/* Actions - visible on hover */}
        <div className="
          mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
        ">
          <button
            onClick={() => onView(media)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            View
          </button>
          <button
            onClick={() => onEdit(media)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(media.id)}
            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Primary Badge */}
      {media.isPrimary && (
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
            Primary
          </span>
        </div>
      )}
    </div>
  );
};
```

## Success Metrics
1. **Upload Success Rate**: >95% successful uploads
2. **Processing Time**: <3 seconds for image optimization
3. **Page Load Time**: <2 seconds for 100 media items
4. **User Task Completion**: >90% successful task completion
5. **Error Recovery**: Graceful handling of all error states

## Testing Requirements
1. **Unit Tests**: 80% coverage minimum
2. **Integration Tests**: All API endpoints tested
3. **E2E Tests**: Critical user journeys
4. **Performance Tests**: Load testing with 10,000+ media items
5. **Accessibility Tests**: WCAG AA compliance

---

*Document Version: 1.0*  
*Created: December 13, 2024*  
*Last Updated: December 13, 2024*  
*Next Review: After Phase 1 Implementation*
