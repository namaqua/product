import React from 'react';
import {
  TrashIcon,
  FolderIcon,
  TagIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
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
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-900">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Select all
            </button>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Move to folder (coming soon)"
              disabled
            >
              <FolderIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Move</span>
            </button>

            <button
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add tags (coming soon)"
              disabled
            >
              <TagIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tag</span>
            </button>

            <button
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download selected (coming soon)"
              disabled
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <div className="h-6 w-px bg-gray-300 mx-2" />

            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              onClick={onClearSelection}
              className="ml-2 p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
