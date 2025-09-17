import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import mediaService from '../../services/media.service';
import { Media, MediaListParams } from '../../services/media.service';
import MediaGalleryView from './MediaGalleryView';
import MediaListView from './MediaListView';
import MediaFilters from './MediaFilters';
import MediaDetailsModal from './MediaDetailsModal';
import MediaUploadWizard from './MediaUploadWizard';
import MediaBulkActions from './MediaBulkActions';
import { useDebounce } from '../../hooks/useDebounce';

// State management
interface MediaLibraryState {
  items: Media[];
  selectedItems: string[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  viewMode: 'grid' | 'list';
  selectionMode: boolean;
  showFilters: boolean;
  showUploadWizard: boolean;
  selectedMedia: Media | null;
  stats: {
    totalFiles: number;
    totalSize: number;
    byType?: Record<string, number>;
    averageFileSize?: number;
    totalProducts?: number;
  } | null;
}

type MediaAction =
  | { type: 'SET_ITEMS'; payload: { items: Media[]; total: number; page: number; totalPages: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'TOGGLE_SELECTION_MODE' }
  | { type: 'TOGGLE_FILTERS' }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTED_MEDIA'; payload: Media | null }
  | { type: 'SET_UPLOAD_WIZARD'; payload: boolean }
  | { type: 'DELETE_SUCCESS'; payload: string[] }
  | { type: 'UPDATE_ITEM'; payload: Media }
  | { type: 'SET_STATS'; payload: any }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_ITEMS_PER_PAGE'; payload: number };

const initialState: MediaLibraryState = {
  items: [],
  selectedItems: [],
  loading: false,
  error: null,
  totalItems: 0,
  currentPage: 1,
  itemsPerPage: 20,
  totalPages: 0,
  viewMode: 'grid',
  selectionMode: false,
  showFilters: false,
  showUploadWizard: false,
  selectedMedia: null,
  stats: null,
};

function mediaReducer(state: MediaLibraryState, action: MediaAction): MediaLibraryState {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.total,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'TOGGLE_SELECTION_MODE':
      return { 
        ...state, 
        selectionMode: !state.selectionMode,
        selectedItems: state.selectionMode ? [] : state.selectedItems,
      };
    case 'TOGGLE_FILTERS':
      return { ...state, showFilters: !state.showFilters };
    case 'SELECT_ITEM':
      return {
        ...state,
        selectedItems: state.selectedItems.includes(action.payload)
          ? state.selectedItems.filter(id => id !== action.payload)
          : [...state.selectedItems, action.payload],
      };
    case 'SELECT_ALL':
      return {
        ...state,
        selectedItems: state.items.map(item => item.id),
      };
    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] };
    case 'SET_SELECTED_MEDIA':
      return { ...state, selectedMedia: action.payload };
    case 'SET_UPLOAD_WIZARD':
      return { ...state, showUploadWizard: action.payload };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        items: state.items.filter(item => !action.payload.includes(item.id)),
        selectedItems: state.selectedItems.filter(id => !action.payload.includes(id)),
        totalItems: state.totalItems - action.payload.length,
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        selectedMedia: state.selectedMedia?.id === action.payload.id 
          ? action.payload 
          : state.selectedMedia,
      };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_ITEMS_PER_PAGE':
      return { ...state, itemsPerPage: action.payload };
    default:
      return state;
  }
}

export default function MediaLibrary() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, dispatch] = useReducer(mediaReducer, initialState);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<Partial<MediaListParams>>({
    type: searchParams.get('type') as any || undefined,
    productId: searchParams.get('productId') || undefined,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load media items
  const loadMedia = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const params: MediaListParams = {
        page: state.currentPage,
        limit: state.itemsPerPage,
        search: debouncedSearch,
        ...filters,
      };

      const response = await mediaService.getMediaList(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_ITEMS',
          payload: {
            items: response.data.items,
            total: response.data.meta.totalItems,
            page: response.data.meta.page,
            totalPages: response.data.meta.totalPages,
          },
        });
      }
    } catch (error: any) {
      console.error('Failed to load media:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to load media' 
      });
    }
  }, [state.currentPage, state.itemsPerPage, debouncedSearch, filters]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await mediaService.getStats();
      if (response.success) {
        dispatch({ type: 'SET_STATS', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMedia();
    loadStats();
  }, [loadMedia]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filters.type) params.set('type', filters.type);
    if (filters.productId) params.set('productId', filters.productId);
    setSearchParams(params);
  }, [debouncedSearch, filters, setSearchParams]);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    dispatch({ type: 'SET_PAGE', payload: 1 });
  };

  const handleFilterChange = (newFilters: Partial<MediaListParams>) => {
    setFilters(newFilters);
    dispatch({ type: 'SET_PAGE', payload: 1 });
  };

  const handlePageChange = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const handleViewMedia = (media: Media) => {
    dispatch({ type: 'SET_SELECTED_MEDIA', payload: media });
  };

  const handleEditMedia = async (media: Media, updates: any) => {
    try {
      const response = await mediaService.updateMedia(media.id, updates);
      if (response.success) {
        dispatch({ type: 'UPDATE_ITEM', payload: response.data.item });
        return response.data.item;
      }
    } catch (error) {
      console.error('Failed to update media:', error);
      throw error;
    }
  };

  const handleDeleteMedia = async (ids: string[]) => {
    try {
      if (ids.length === 1) {
        await mediaService.deleteMedia(ids[0]);
      } else {
        await mediaService.bulkDelete(ids);
      }
      dispatch({ type: 'DELETE_SUCCESS', payload: ids });
      await loadStats(); // Refresh stats after deletion
    } catch (error) {
      console.error('Failed to delete media:', error);
      throw error;
    }
  };

  const handleUploadComplete = () => {
    dispatch({ type: 'SET_UPLOAD_WIZARD', payload: false });
    loadMedia();
    loadStats();
  };

  const formatFileSize = (bytes: number | undefined | null): string => {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <PhotoIcon className="h-6 w-6 text-gray-400" />
              <h1 className="text-xl font-semibold text-gray-900">Media Library</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'SET_UPLOAD_WIZARD', payload: true })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload
            </button>
            <button
              onClick={() => {/* TODO: Settings */}}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative max-w-md flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search media..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_FILTERS' })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                state.showFilters 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {(filters.type || filters.productId) && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {Object.keys(filters).filter(k => filters[k as keyof typeof filters]).length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                className={`p-1.5 rounded ${
                  state.viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                className={`p-1.5 rounded ${
                  state.viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Selection Mode */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SELECTION_MODE' })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                state.selectionMode 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckIcon className="h-4 w-4" />
              Select
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        {state.showFilters && (
          <MediaFilters
            filters={filters}
            onChange={handleFilterChange}
            stats={state.stats}
          />
        )}

        {/* Media Grid/List */}
        <div className="flex-1 overflow-auto">
          {state.loading && state.items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading media...</p>
              </div>
            </div>
          ) : state.error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600">{state.error}</p>
                <button
                  onClick={loadMedia}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : state.items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-4 text-gray-500">No media files found</p>
                <button
                  onClick={() => dispatch({ type: 'SET_UPLOAD_WIZARD', payload: true })}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload First Media
                </button>
              </div>
            </div>
          ) : (
            <>
              {state.viewMode === 'grid' ? (
                <MediaGalleryView
                  items={state.items}
                  selectedItems={state.selectedItems}
                  selectionMode={state.selectionMode}
                  onSelect={(id) => dispatch({ type: 'SELECT_ITEM', payload: id })}
                  onView={handleViewMedia}
                  onEdit={handleViewMedia}
                  onDelete={(id) => handleDeleteMedia([id])}
                />
              ) : (
                <MediaListView
                  items={state.items}
                  selectedItems={state.selectedItems}
                  selectionMode={state.selectionMode}
                  onSelect={(id) => dispatch({ type: 'SELECT_ITEM', payload: id })}
                  onView={handleViewMedia}
                  onEdit={handleViewMedia}
                  onDelete={(id) => handleDeleteMedia([id])}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{state.totalItems} files</span>
            {state.stats && state.stats.totalSize !== undefined && (
              <>
                <span>•</span>
                <span>{formatFileSize(state.stats.totalSize || 0)} used</span>
              </>
            )}
            {state.selectedItems.length > 0 && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-medium">
                  {state.selectedItems.length} selected
                </span>
              </>
            )}
          </div>

          {/* Pagination */}
          {state.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, state.totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        page === state.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {state.totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
              </div>
              <button
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === state.totalPages}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {state.selectionMode && state.selectedItems.length > 0 && (
        <MediaBulkActions
          selectedCount={state.selectedItems.length}
          onDelete={() => handleDeleteMedia(state.selectedItems)}
          onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
          onSelectAll={() => dispatch({ type: 'SELECT_ALL' })}
        />
      )}

      {/* Modals */}
      {state.selectedMedia && (
        <MediaDetailsModal
          media={state.selectedMedia}
          onClose={() => dispatch({ type: 'SET_SELECTED_MEDIA', payload: null })}
          onEdit={handleEditMedia}
          onDelete={(id) => handleDeleteMedia([id])}
        />
      )}

      {state.showUploadWizard && (
        <MediaUploadWizard
          onComplete={handleUploadComplete}
          onCancel={() => dispatch({ type: 'SET_UPLOAD_WIZARD', payload: false })}
        />
      )}
    </div>
  );
}
