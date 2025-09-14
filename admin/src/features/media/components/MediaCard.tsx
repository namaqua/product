import React, { useState } from 'react';
import {
  DocumentIcon,
  FilmIcon,
  PhotoIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Media } from '../../../services/media.service';
import MediaThumbnail from './MediaThumbnail';

interface MediaCardProps {
  media: Media;
  selected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onView: (media: Media) => void;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
}

export default function MediaCard({
  media,
  selected,
  selectionMode,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getTypeIcon = () => {
    switch (media.type) {
      case 'image':
        return <PhotoIcon className="h-4 w-4" />;
      case 'video':
        return <FilmIcon className="h-4 w-4" />;
      case 'document':
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <DocumentIcon className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = () => {
    switch (media.type) {
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onSelect(media.id);
    } else {
      onView(media);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this media?')) {
      onDelete(media.id);
    }
  };

  return (
    <div
      className={`
        relative group rounded-lg border-2 transition-all cursor-pointer
        ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-20">
          <div
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center
              ${selected 
                ? 'bg-blue-600 border-blue-600' 
                : 'bg-white border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {selected && <CheckCircleIcon className="h-4 w-4 text-white" />}
          </div>
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className={`
          inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
          ${getTypeBadgeColor()}
        `}>
          {getTypeIcon()}
          {media.type.toUpperCase()}
        </span>
      </div>

      {/* Primary Badge */}
      {media.isPrimary && (
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full font-medium">
            Primary
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-t-lg overflow-hidden">
        <MediaThumbnail
          media={media}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate" title={media.filename}>
          {media.filename}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {media.humanReadableSize}
          </p>
          {media.width && media.height && (
            <p className="text-xs text-gray-500">
              {media.width}×{media.height}
            </p>
          )}
        </div>

        {/* Quick Info */}
        {media.alt && (
          <p className="mt-1 text-xs text-gray-400 truncate" title={media.alt}>
            {media.alt}
          </p>
        )}

        {/* Actions - visible on hover if not in selection mode */}
        {!selectionMode && showActions && (
          <div className="
            mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity
          ">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(media);
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="View details"
            >
              <EyeIcon className="h-3 w-3 mx-auto" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(media);
              }}
              className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Edit"
            >
              <PencilIcon className="h-3 w-3 mx-auto" />
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-3 w-3 mx-auto" />
            </button>
          </div>
        )}
      </div>

      {/* Hover Overlay for Additional Info */}
      {!selectionMode && showActions && media.products && media.products.length > 0 && (
        <div className="absolute bottom-12 left-3 right-3 bg-gray-900 bg-opacity-75 text-white text-xs p-2 rounded">
          Associated with {media.products.length} product{media.products.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
