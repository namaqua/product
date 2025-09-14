import React from 'react';
import { Media } from '../../services/media.service';
import MediaCard from './components/MediaCard';

interface MediaGalleryViewProps {
  items: Media[];
  selectedItems: string[];
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onView: (media: Media) => void;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
}

export default function MediaGalleryView({
  items,
  selectedItems,
  selectionMode,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: MediaGalleryViewProps) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            selected={selectedItems.includes(media.id)}
            selectionMode={selectionMode}
            onSelect={onSelect}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
