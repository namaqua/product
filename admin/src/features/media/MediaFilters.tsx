import React from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  FilmIcon,
  DocumentIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { MediaListParams } from '../../services/media.service';

interface MediaFiltersProps {
  filters: Partial<MediaListParams>;
  onChange: (filters: Partial<MediaListParams>) => void;
  stats: {
    totalFiles: number;
    totalSize: number;
    byType?: Record<string, number>;
    averageFileSize?: number;
    totalProducts?: number;
  } | null;
}

export default function MediaFilters({
  filters,
  onChange,
  stats,
}: MediaFiltersProps) {
  const handleTypeChange = (type: string | undefined) => {
    onChange({ ...filters, type: type as any });
  };

  const clearFilters = () => {
    onChange({});
  };

  const formatFileSize = (bytes: number | undefined | null): string => {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const mediaTypes = [
    { value: 'image', label: 'Images', icon: PhotoIcon, color: 'text-green-600' },
    { value: 'video', label: 'Videos', icon: FilmIcon, color: 'text-purple-600' },
    { value: 'document', label: 'Documents', icon: DocumentIcon, color: 'text-blue-600' },
    { value: 'other', label: 'Other', icon: FolderIcon, color: 'text-gray-600' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {(filters.type || filters.productId) && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Library Stats
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Files:</span>
                <span className="text-gray-900 font-medium">
                  {(stats.totalFiles || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Size:</span>
                <span className="text-gray-900 font-medium">
                  {formatFileSize(stats.totalSize || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Type Filter */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-3">
            Media Type
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => handleTypeChange(undefined)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                ${!filters.type
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <span>All Types</span>
              {stats && (
                <span className="text-xs text-gray-500">
                  {stats.totalFiles}
                </span>
              )}
            </button>

            {mediaTypes.map((type) => {
              const Icon = type.icon;
              const count = stats?.byType?.[type.value] || 0;
              
              return (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                    ${filters.type === type.value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${type.color}`} />
                    <span>{type.label}</span>
                  </div>
                  {stats && (
                    <span className="text-xs text-gray-500">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="mt-6">
          <h4 className="text-xs font-semibold text-gray-700 mb-3">
            Options
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.isPrimary === true}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    isPrimary: e.target.checked ? true : undefined,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Primary only</span>
            </label>
          </div>
        </div>

        {/* Product Filter */}
        {filters.productId && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-700">
                Product Filter
              </h4>
              <button
                onClick={() => onChange({ ...filters, productId: undefined })}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="px-3 py-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                Product ID: {filters.productId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
