import React, { useState, useEffect } from 'react';
import {
  PhotoIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Media } from '../../../services/media.service';
import MediaThumbnail from '../../media/components/MediaThumbnail';
import MediaPicker from './MediaPicker';
import MediaUploadWizard from '../../media/MediaUploadWizard';
import mediaService from '../../../services/media.service';

interface ProductMediaSectionProps {
  productId?: string;
  media: Media[];
  onChange: (media: Media[]) => void;
  primaryMediaId?: string;
  onSetPrimary?: (mediaId: string) => void;
}

// Media item component (simplified version without drag-and-drop)
function MediaItem({ 
  media, 
  isPrimary, 
  onRemove, 
  onSetPrimary, 
  onView,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  media: Media;
  isPrimary: boolean;
  onRemove: () => void;
  onSetPrimary: () => void;
  onView: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  return (
    <div
      className={`
        relative group rounded-lg border-2 bg-white hover:shadow-md transition-shadow
        ${isPrimary ? 'border-orange-500' : 'border-gray-200'}
      `}
    >
      {/* Primary Badge */}
      {isPrimary && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-1 text-xs bg-orange-500 text-white rounded-full font-medium">
            Primary
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        <MediaThumbnail
          media={media}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info & Actions */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate" title={media.filename}>
          {media.filename}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {media.humanReadableSize}
          {media.width && media.height && ` • ${media.width}×${media.height}`}
        </p>

        {/* Actions */}
        <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onView}
            className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="View"
          >
            <EyeIcon className="h-3 w-3 mx-auto" />
          </button>
          <button
            type="button"
            onClick={onSetPrimary}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              isPrimary 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="Set as primary"
          >
            {isPrimary ? (
              <StarIconSolid className="h-3 w-3 mx-auto text-orange-500" />
            ) : (
              <StarIcon className="h-3 w-3 mx-auto" />
            )}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
            title="Remove"
          >
            <TrashIcon className="h-3 w-3 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductMediaSection({
  productId,
  media = [],
  onChange,
  primaryMediaId,
  onSetPrimary,
}: ProductMediaSectionProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [sortedMedia, setSortedMedia] = useState<Media[]>(media);

  // Update sorted media when media prop changes
  useEffect(() => {
    setSortedMedia(media);
  }, [media]);

  const handleSelectMedia = (selectedMedia: Media[]) => {
    // Merge selected media with existing media
    const existingIds = new Set(sortedMedia.map(m => m.id));
    const newMedia = selectedMedia.filter(m => !existingIds.has(m.id));
    const updatedMedia = [...sortedMedia, ...newMedia];
    
    // Update sort order
    const sortedUpdatedMedia = updatedMedia.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    
    onChange(sortedUpdatedMedia);
  };

  const handleUploadComplete = async () => {
    setShowUploadWizard(false);
    
    // If we have a product ID, reload the media for this product
    if (productId) {
      try {
        const response = await mediaService.getProductMedia(productId);
        if (response.success) {
          onChange(response.data.items);
        }
      } catch (error) {
        console.error('Failed to reload product media:', error);
      }
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    const updatedMedia = sortedMedia.filter(m => m.id !== mediaId);
    onChange(updatedMedia);
  };

  const handleSetPrimaryMedia = (mediaId: string) => {
    if (onSetPrimary) {
      onSetPrimary(mediaId);
    }
    
    // Update local state to reflect primary status
    const updatedMedia = sortedMedia.map(m => ({
      ...m,
      isPrimary: m.id === mediaId,
    }));
    onChange(updatedMedia);
  };

  const handleViewMedia = (media: Media) => {
    // Open media in a new window or modal
    const url = mediaService.getMediaUrl(media);
    window.open(url, '_blank');
  };

  const handleMoveMedia = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sortedMedia.length) return;
    
    const newMedia = [...sortedMedia];
    [newMedia[index], newMedia[newIndex]] = [newMedia[newIndex], newMedia[index]];
    
    // Update sort order
    const updatedMedia = newMedia.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));
    
    onChange(updatedMedia);
  };

  // Determine which media is primary
  const effectivePrimaryId = primaryMediaId || sortedMedia.find(m => m.isPrimary)?.id || sortedMedia[0]?.id;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Product Media
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PhotoIcon className="h-4 w-4" />
              Select from Library
            </button>
            <button
              type="button"
              onClick={() => setShowUploadWizard(true)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Upload New
            </button>
          </div>
        </div>

        {sortedMedia.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No media</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading media or selecting from the library.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowUploadWizard(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Upload Media
              </button>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PhotoIcon className="h-4 w-4" />
                Select from Library
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              The first image will be used as the main product image unless marked as primary. You can reorder images using the arrow buttons when hovering over them.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {sortedMedia.map((item, index) => (
                <MediaItem
                  key={item.id}
                  media={item}
                  isPrimary={item.id === effectivePrimaryId}
                  onRemove={() => handleRemoveMedia(item.id)}
                  onSetPrimary={() => handleSetPrimaryMedia(item.id)}
                  onView={() => handleViewMedia(item)}
                  onMoveUp={() => handleMoveMedia(index, 'up')}
                  onMoveDown={() => handleMoveMedia(index, 'down')}
                  canMoveUp={index > 0}
                  canMoveDown={index < sortedMedia.length - 1}
                />
              ))}
              
              {/* Add More Button */}
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100"
              >
                <PlusIcon className="h-8 w-8" />
                <span className="mt-2 text-xs font-medium">Add More</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Media Picker Modal */}
      {showPicker && (
        <MediaPicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handleSelectMedia}
          selectedMedia={sortedMedia}
          multiple={true}
          productId={productId}
        />
      )}

      {/* Upload Wizard */}
      {showUploadWizard && (
        <MediaUploadWizard
          onComplete={handleUploadComplete}
          onCancel={() => setShowUploadWizard(false)}
          productId={productId}
        />
      )}
    </div>
  );
}
