import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { Media } from '../../../services/media.service';
import mediaService from '../../../services/media.service';
import MediaThumbnail from '../../media/components/MediaThumbnail';
import MediaUploadWizard from '../../media/MediaUploadWizard';
import { useDebounce } from '../../../hooks/useDebounce';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media[]) => void;
  selectedMedia?: Media[];
  multiple?: boolean;
  productId?: string;
}

export default function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  selectedMedia = [],
  multiple = true,
  productId,
}: MediaPickerProps) {
  const [items, setItems] = useState<Media[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(selectedMedia.map(m => m.id))
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [filterType, setFilterType] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load media items
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, currentPage, debouncedSearch, filterType]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: debouncedSearch,
        type: filterType || undefined,
      };

      const response = await mediaService.getMediaList(params);
      if (response.success) {
        setItems(response.data.items);
        setTotalPages(response.data.meta.totalPages);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (mediaId: string) => {
    const newSelection = new Set(selectedItems);
    
    if (multiple) {
      if (newSelection.has(mediaId)) {
        newSelection.delete(mediaId);
      } else {
        newSelection.add(mediaId);
      }
    } else {
      // Single selection mode
      newSelection.clear();
      newSelection.add(mediaId);
    }
    
    setSelectedItems(newSelection);
  };

  const handleConfirm = () => {
    const selected = items.filter(item => selectedItems.has(item.id));
    onSelect(selected);
    onClose();
  };

  const handleUploadComplete = () => {
    setShowUploadWizard(false);
    loadMedia(); // Reload media list
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PhotoIcon className="h-6 w-6 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Media
                </h2>
                {selectedItems.size > 0 && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {selectedItems.size} selected
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative max-w-md flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search media..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="document">Documents</option>
                </select>

                {/* Upload Button */}
                <button
                  onClick={() => setShowUploadWizard(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Upload New
                </button>
              </div>

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading media...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-500">No media found</p>
                  <button
                    onClick={() => setShowUploadWizard(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upload First Media
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {items.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleSelect(media.id)}
                    className={`
                      relative group rounded-lg border-2 cursor-pointer transition-all
                      ${selectedItems.has(media.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    {/* Selection indicator */}
                    {selectedItems.has(media.id) && (
                      <div className="absolute top-2 right-2 z-10">
                        <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      <MediaThumbnail
                        media={media}
                        size="small"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {media.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {media.humanReadableSize}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleSelect(media.id)}
                    className={`
                      flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all
                      ${selectedItems.has(media.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <input
                        type={multiple ? 'checkbox' : 'radio'}
                        checked={selectedItems.has(media.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <MediaThumbnail
                        media={media}
                        size="small"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {media.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {media.type} • {media.humanReadableSize}
                        {media.width && media.height && ` • ${media.width}×${media.height}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {multiple ? (
                  <span>{selectedItems.size} items selected</span>
                ) : (
                  <span>Select one item</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedItems.size === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select {selectedItems.size > 0 && `(${selectedItems.size})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Wizard */}
      {showUploadWizard && (
        <MediaUploadWizard
          onComplete={handleUploadComplete}
          onCancel={() => setShowUploadWizard(false)}
          productId={productId}
        />
      )}
    </>
  );
}
