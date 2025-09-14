# Media Library UI Implementation Checklist

## Quick Reference Implementation Guide

### 🎯 Core Principles
- **Wizard-based approach** for complex operations (following VariantWizard pattern)
- **Progressive disclosure** - Simple tasks simple, complex tasks guided
- **Consistent with existing UI** - Use same colors (blue primary, NO indigo)
- **Mobile-responsive** - All interfaces work on tablets/phones
- **Performance-first** - Virtual scrolling, lazy loading, optimistic updates

### 📁 File Structure to Create
```bash
# Create these files in order of priority
admin/src/features/media/
├── MediaLibrary.tsx              # [Priority 1] Main container
├── components/
│   ├── MediaCard.tsx            # [Priority 1] Grid item
│   ├── MediaThumbnail.tsx       # [Priority 1] Smart thumbnail
│   ├── MediaUploadDropzone.tsx  # [Priority 2] Drag-drop zone
│   ├── MediaMetadataForm.tsx    # [Priority 2] Edit form
│   └── MediaPreview.tsx         # [Priority 3] Preview component
├── MediaGalleryView.tsx         # [Priority 1] Grid view
├── MediaFilters.tsx              # [Priority 2] Filter sidebar
├── MediaUploadWizard.tsx         # [Priority 2] Upload wizard
├── MediaDetailsModal.tsx         # [Priority 3] Detail view
├── MediaListView.tsx             # [Priority 3] Table view
├── MediaBulkActions.tsx          # [Priority 4] Bulk operations
├── MediaLightbox.tsx             # [Priority 4] Full preview
├── MediaAssociationWizard.tsx   # [Priority 4] Product linking
└── MediaBatchUploadWizard.tsx   # [Priority 5] Batch upload
```

### ✅ Phase 1: MVP Features (Week 1)
- [ ] **Day 1**: Basic MediaLibrary container with routing
- [ ] **Day 1**: MediaCard component with thumbnail display
- [ ] **Day 2**: MediaGalleryView with responsive grid
- [ ] **Day 2**: Basic search functionality
- [ ] **Day 3**: MediaFilters sidebar (type, size, date)
- [ ] **Day 3**: Pagination component
- [ ] **Day 4**: MediaDetailsModal for viewing
- [ ] **Day 4**: Basic edit functionality
- [ ] **Day 5**: Delete with confirmation
- [ ] **Day 5**: Integration testing

### ✅ Phase 2: Upload System (Week 2)
- [ ] **Day 1**: MediaUploadWizard structure (5 steps)
- [ ] **Day 1**: Step 1 - File selection UI
- [ ] **Day 2**: Step 2 - Bulk metadata form
- [ ] **Day 2**: Step 3 - Individual metadata
- [ ] **Day 3**: Step 4 - Processing options
- [ ] **Day 3**: Step 5 - Review and upload
- [ ] **Day 4**: Upload progress tracking
- [ ] **Day 4**: Error handling and retry
- [ ] **Day 5**: Drag-drop zone component
- [ ] **Day 5**: Multi-file handling

### ✅ Phase 3: Management Features (Week 3)
- [ ] **Day 1**: Selection mode toggle
- [ ] **Day 1**: Multi-select checkboxes
- [ ] **Day 2**: MediaBulkActions toolbar
- [ ] **Day 2**: Bulk delete functionality
- [ ] **Day 3**: MediaAssociationWizard
- [ ] **Day 3**: Product search/select
- [ ] **Day 4**: MediaLightbox viewer
- [ ] **Day 4**: Image zoom/pan features
- [ ] **Day 5**: MediaListView table
- [ ] **Day 5**: Column sorting

### ✅ Phase 4: Advanced Features (Week 4)  
- [ ] **Day 1**: Statistics dashboard widget
- [ ] **Day 2**: Orphaned media detection
- [ ] **Day 2**: Cleanup wizard
- [ ] **Day 3**: Batch URL import
- [ ] **Day 3**: CSV import support
- [ ] **Day 4**: Performance optimization
- [ ] **Day 4**: Virtual scrolling
- [ ] **Day 5**: Final testing & polish

## 🔧 Implementation Details

### API Integration Checklist
```typescript
// Ensure all these endpoints are called correctly
mediaService.uploadMedia()        // ✓ Single upload
mediaService.uploadMultiple()     // ✓ Batch upload
mediaService.getMediaList()       // ✓ List with filters
mediaService.getMediaById()       // ✓ Single media
mediaService.getProductMedia()    // ✓ Product media
mediaService.updateMedia()        // ✓ Update metadata
mediaService.deleteMedia()        // ✓ Single delete
mediaService.bulkDelete()         // ✓ Bulk delete
mediaService.associateWithProducts() // ✓ Link products
mediaService.dissociateFromProducts() // ✓ Unlink products
```

### Component Props Standards
```typescript
// Follow these patterns for consistency
interface MediaComponentProps {
  // Data props
  media?: Media;
  items?: Media[];
  
  // State props
  loading?: boolean;
  error?: string | null;
  selected?: boolean;
  
  // Callback props (always optional)
  onSelect?: (id: string) => void;
  onEdit?: (media: Media) => void;
  onDelete?: (id: string) => void;
  onUpload?: (files: File[]) => void;
  
  // UI props
  viewMode?: 'grid' | 'list';
  className?: string;
}
```

### Styling Guidelines
```tsx
// Use Tailwind classes consistently
const cardStyles = {
  container: "rounded-lg border-2 transition-all",
  selected: "border-blue-500 bg-blue-50",
  hover: "hover:border-gray-300 hover:shadow-md",
  thumbnail: "aspect-w-1 aspect-h-1 bg-gray-100",
  badge: "px-2 py-1 text-xs font-medium rounded-full",
  button: {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }
};
```

### State Management Pattern
```typescript
// Use useReducer for complex state
const mediaReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    default:
      return state;
  }
};
```

### Error Handling Pattern
```typescript
// Consistent error handling
const handleApiCall = async (
  apiCall: () => Promise<any>,
  successMessage?: string
) => {
  try {
    setLoading(true);
    setError(null);
    const result = await apiCall();
    if (successMessage) {
      showNotification({ type: 'success', message: successMessage });
    }
    return result;
  } catch (err: any) {
    const message = err.response?.data?.message || 'An error occurred';
    setError(message);
    showNotification({ type: 'error', message });
    throw err;
  } finally {
    setLoading(false);
  }
};
```

### Performance Checklist
- [ ] Implement virtual scrolling for lists > 100 items
- [ ] Add lazy loading for thumbnails
- [ ] Use React.memo for expensive components
- [ ] Implement debounced search (300ms)
- [ ] Add request caching (5 min TTL)
- [ ] Optimize bundle size (code splitting)
- [ ] Add loading skeletons
- [ ] Implement optimistic updates
- [ ] Use web workers for heavy processing
- [ ] Add intersection observer for lazy load

### Accessibility Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on all buttons
- [ ] Alt text for all images
- [ ] Focus indicators visible
- [ ] Screen reader announcements
- [ ] Proper heading hierarchy
- [ ] Color contrast WCAG AA
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Loading states announced

### Testing Checklist
- [ ] Unit tests for all utilities
- [ ] Component tests with React Testing Library
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Error state testing
- [ ] Edge case handling

## 🚀 Quick Start Commands

```bash
# Create all component files
cd /Users/colinroets/dev/projects/product/admin/src/features
mkdir -p media/components

# Create component templates
touch media/MediaLibrary.tsx
touch media/MediaGalleryView.tsx
touch media/MediaUploadWizard.tsx
touch media/MediaDetailsModal.tsx
touch media/MediaFilters.tsx
touch media/MediaBulkActions.tsx
touch media/MediaListView.tsx
touch media/MediaLightbox.tsx
touch media/MediaAssociationWizard.tsx
touch media/MediaBatchUploadWizard.tsx

# Component files
touch media/components/MediaCard.tsx
touch media/components/MediaThumbnail.tsx
touch media/components/MediaUploadDropzone.tsx
touch media/components/MediaMetadataForm.tsx
touch media/components/MediaPreview.tsx

# Add route to App.tsx
# <Route path="/media/*" element={<MediaLibrary />} />
```

## 📊 Success Criteria
1. ✅ Users can upload files in < 3 clicks
2. ✅ Bulk operations work on 50+ items
3. ✅ Search returns results in < 500ms
4. ✅ Page loads in < 2 seconds
5. ✅ All actions have visual feedback
6. ✅ Errors are handled gracefully
7. ✅ Works on mobile devices
8. ✅ Keyboard navigation complete
9. ✅ Meets WCAG AA standards
10. ✅ 90% code coverage

## 🎨 UI Component Library References
- Use existing Button component from `components/common/Button.tsx`
- Use existing Modal from `components/common/Modal.tsx`
- Use existing DataTable patterns from `components/tables/DataTable.tsx`
- Follow CategoryTree patterns for hierarchical data
- Follow VariantWizard patterns for multi-step processes

## 📝 Notes & Reminders
- Always use `blue` for primary actions (never `indigo`)
- Follow existing API response structure (`success`, `data`, `timestamp`)
- Maintain consistency with Products and Categories modules
- Use optimistic updates for better UX
- Add loading states for all async operations
- Include empty states with helpful messages
- Test with slow network (Chrome DevTools)
- Consider offline functionality for future

---

*Quick Reference Guide v1.0*  
*Created for rapid implementation*  
*Refer to MEDIA_LIBRARY_UI_PLAN.md for detailed specifications*
