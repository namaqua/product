import React from 'react';
import {
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface MediaBulkActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
}

export default function MediaBulkActions({
  selectedCount,
  onDelete,
  onClearSelection,
  onSelectAll,
}: MediaBulkActionsProps) {
  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedCount} item${
          selectedCount !== 1 ? 's' : ''
        }? This action cannot be undone.`
      )
    ) {
      onDelete();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select All
            </button>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="h-4 w-4" />
              Delete Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
