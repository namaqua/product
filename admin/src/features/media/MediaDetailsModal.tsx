import React, { useState } from 'react';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Media } from '../../services/media.service';
import mediaService from '../../services/media.service';
import MediaThumbnail from './components/MediaThumbnail';

interface MediaDetailsModalProps {
  media: Media;
  onClose: () => void;
  onEdit: (media: Media, updates: any) => Promise<Media>;
  onDelete: (id: string) => void;
}

export default function MediaDetailsModal({
  media,
  onClose,
  onEdit,
  onDelete,
}: MediaDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: media.title || '',
    alt: media.alt || '',
    description: media.description || '',
    isPrimary: media.isPrimary,
    sortOrder: media.sortOrder,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await onEdit(media, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      onDelete(media.id);
      onClose();
    }
  };

  const handleDownload = () => {
    const url = mediaService.getMediaUrl(media);
    const link = document.createElement('a');
    link.href = url;
    link.download = media.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyUrl = () => {
    const url = mediaService.getMediaUrl(media);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {media.filename}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex">
            {/* Preview Section */}
            <div className="w-1/2 p-6 border-r border-gray-200">
              <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                <MediaThumbnail
                  media={media}
                  size="large"
                  className="w-full h-full object-contain"
                  lazy={false}
                />
              </div>

              {/* Thumbnail Previews */}
              {media.thumbnails && Object.keys(media.thumbnails).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Thumbnails</p>
                  <div className="flex gap-2">
                    {Object.entries(media.thumbnails).slice(0, 4).map(([key, url]) => (
                      <div key={key} className="relative group">
                        <img
                          src={url}
                          alt={`${key} thumbnail`}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                        <span className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black bg-opacity-50 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {key}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Information */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{media.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">{media.humanReadableSize}</span>
                </div>
                {media.width && media.height && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dimensions:</span>
                    <span className="font-medium">{media.width} × {media.height}px</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Format:</span>
                  <span className="font-medium">{media.mimeType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Uploaded:</span>
                  <span className="font-medium">{formatDate(media.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="w-1/2 p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Edit Properties</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={editForm.alt}
                      onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter alt text for accessibility..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={editForm.sortOrder}
                      onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editForm.isPrimary}
                        onChange={(e) => setEditForm({ ...editForm, isPrimary: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Primary media for products</span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">Properties</h4>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Title</p>
                      <p className="text-sm font-medium text-gray-900">
                        {media.title || 'No title set'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Alt Text</p>
                      <p className="text-sm font-medium text-gray-900">
                        {media.alt || 'No alt text set'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm font-medium text-gray-900">
                        {media.description || 'No description set'}
                      </p>
                    </div>

                    {media.isPrimary && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Primary Media
                      </div>
                    )}
                  </div>

                  {/* Associated Products */}
                  {media.products && media.products.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Associated Products ({media.products.length})
                      </h4>
                      <div className="space-y-1">
                        {media.products.slice(0, 5).map((product: any) => (
                          <div key={product.id} className="text-sm text-gray-600">
                            • {product.name} ({product.sku})
                          </div>
                        ))}
                        {media.products.length > 5 && (
                          <div className="text-sm text-gray-500">
                            ...and {media.products.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-6 space-y-2">
                    <button
                      onClick={copyUrl}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4" />
                          Copy URL
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Download
                    </button>

                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
