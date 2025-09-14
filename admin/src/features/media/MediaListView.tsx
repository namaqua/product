import React from 'react';
import { Media } from '../../services/media.service';

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
  // Placeholder - Will be implemented in Phase 3
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectionMode && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                Modified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((media) => (
              <tr key={media.id} className="hover:bg-gray-50">
                {selectionMode && (
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(media.id)}
                      onChange={() => onSelect(media.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="h-10 w-10 bg-gray-100 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{media.filename}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {media.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {media.humanReadableSize}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(media.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button
                    onClick={() => onView(media)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onDelete(media.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
