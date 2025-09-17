import React, { useState } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  FilmIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { Media } from '../../services/media.service';
import mediaService from '../../services/media.service';

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
  const [editForm, setEditForm] = useState({
    alt: media.alt || '',
    title: media.title || '',
    description: media.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onEdit(media, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update media:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = () => {
    const url = mediaService.getMediaUrl(media);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const url = mediaService.getMediaUrl(media);
    const link = document.createElement('a');
    link.href = url;
    link.download = media.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeIcon = () => {
    switch (media.type) {
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-green-500" />;
      case 'video':
        return <FilmIcon className="h-5 w-5 text-purple-500" />;
      case 'document':
        if (media.mimeType?.includes('pdf')) {
          return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
        }
        return <DocumentIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTypeIcon()}
                <h2 className="text-lg font-semibold text-gray-900">
                  Media Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col lg:flex-row">
              {/* Preview Panel */}
              <div className="lg:w-1/2 bg-gray-50 p-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {media.type === 'image' ? (
                    <img
                      src={mediaService.getMediaUrl(media)}
                      alt={media.alt || media.filename}
                      className="w-full h-auto"
                    />
                  ) : media.type === 'video' ? (
                    <video
                      src={mediaService.getMediaUrl(media)}
                      controls
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="p-12 text-center bg-gray-50">
                      {getTypeIcon()}
                      <p className="mt-2 text-sm text-gray-600">
                        {media.filename}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {media.humanReadableSize}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCopyUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Download</span>
                  </button>
                </div>
              </div>

              {/* Details Panel */}
              <div className="lg:w-1/2 p-6">
                {isEditing ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={editForm.alt}
                          onChange={(e) =>
                            setEditForm({ ...editForm, alt: e.target.value })
                          }
                          placeholder="Describe this media for accessibility"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Media title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe this media"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            alt: media.alt || '',
                            title: media.title || '',
                            description: media.description || '',
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        Information
                      </h3>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                    </div>

                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Filename
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {media.filename}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Type
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {media.type} ({media.mimeType})
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Size
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {media.humanReadableSize}
                        </dd>
                      </div>

                      {media.width && media.height && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Dimensions
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {media.width} × {media.height} pixels
                          </dd>
                        </div>
                      )}

                      {media.duration && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Duration
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {Math.floor(media.duration / 60)}:
                            {Math.floor(media.duration % 60)
                              .toString()
                              .padStart(2, '0')}
                          </dd>
                        </div>
                      )}

                      {media.alt && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Alt Text
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {media.alt}
                          </dd>
                        </div>
                      )}

                      {media.title && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Title
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {media.title}
                          </dd>
                        </div>
                      )}

                      {media.description && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Description
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {media.description}
                          </dd>
                        </div>
                      )}

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Uploaded
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(media.createdAt)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Last Modified
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(media.updatedAt)}
                        </dd>
                      </div>
                    </dl>

                    {/* Delete Button */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              'Are you sure you want to delete this media? This action cannot be undone.'
                            )
                          ) {
                            onDelete(media.id);
                            onClose();
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete Media
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
