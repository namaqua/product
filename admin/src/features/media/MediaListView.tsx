import React from 'react';
import {
  PhotoIcon,
  FilmIcon,
  DocumentIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Media } from '../../services/media.service';
import MediaThumbnail from './components/MediaThumbnail';

interface MediaListViewProps {
  items: Media[];
  selectedItems: string[];
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onView: (media: Media) => void;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
}

export default function MediaListView({
  items,
  selectedItems,
  selectionMode,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: MediaListViewProps) {
  const getTypeIcon = (media: Media) => {
    switch (media.type) {
      case 'image':
        return <PhotoIcon className="h-4 w-4 text-green-600" />;
      case 'video':
        return <FilmIcon className="h-4 w-4 text-purple-600" />;
      case 'document':
        if (media.mimeType?.includes('pdf')) {
          return <DocumentTextIcon className="h-4 w-4 text-red-600" />;
        }
        return <DocumentIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <DocumentIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this media?')) {
      onDelete(id);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectionMode && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length && items.length > 0}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                    onChange={() => {
                      if (selectedItems.length === items.length) {
                        // Clear all
                        selectedItems.forEach(id => onSelect(id));
                      } else {
                        // Select all
                        items.forEach(item => {
                          if (!selectedItems.includes(item.id)) {
                            onSelect(item.id);
                          }
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dimensions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((media) => (
              <tr
                key={media.id}
                className={`
                  hover:bg-gray-50 cursor-pointer
                  ${selectedItems.includes(media.id) ? 'bg-blue-50' : ''}
                `}
                onClick={() => {
                  if (selectionMode) {
                    onSelect(media.id);
                  } else {
                    onView(media);
                  }
                }}
              >
                {selectionMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(media.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelect(media.id);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                
                {/* Preview */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                    <MediaThumbnail
                      media={media}
                      size="small"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>

                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {media.filename}
                      </div>
                      {media.alt && (
                        <div className="text-xs text-gray-500">
                          {media.alt}
                        </div>
                      )}
                    </div>
                    {media.isPrimary && (
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(media)}
                    <span className="text-sm text-gray-900">
                      {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                    </span>
                  </div>
                </td>

                {/* Size */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {media.humanReadableSize}
                </td>

                {/* Dimensions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {media.width && media.height ? (
                    <span>{media.width} × {media.height}</span>
                  ) : media.duration ? (
                    <span>
                      {Math.floor(media.duration / 60)}:
                      {Math.floor(media.duration % 60)
                        .toString()
                        .padStart(2, '0')}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* Uploaded */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(media.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(media);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(media);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, media.id)}
                      className="text-red-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">No media files found</p>
          </div>
        )}
      </div>
    </div>
  );
}
