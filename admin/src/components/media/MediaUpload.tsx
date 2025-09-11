import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import mediaService, { Media } from '../../services/media.service';
import clsx from 'clsx';

interface MediaUploadProps {
  productId?: string;
  existingMedia?: Media[];
  onUploadComplete?: (media: Media[]) => void;
  onMediaRemove?: (mediaId: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
  maxFileSize?: number; // in bytes
}

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  media?: Media;
}

export default function MediaUpload({
  productId,
  existingMedia = [],
  onUploadComplete,
  onMediaRemove,
  multiple = true,
  maxFiles = 10,
  acceptedFileTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
    'video/*': ['.mp4', '.webm', '.ogg'],
    'application/pdf': ['.pdf'],
  },
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}: MediaUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Media[]>(existingMedia);
  const [uploading, setUploading] = useState(false);
  
  // Update uploadedMedia when existingMedia changes (e.g., when editing a product)
  React.useEffect(() => {
    setUploadedMedia(existingMedia);
  }, [existingMedia]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Create preview objects
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
    setUploading(true);

    // Upload files one by one
    for (let i = 0; i < newFiles.length; i++) {
      const uploadFile = newFiles[i];
      
      try {
        // Update status to uploading
        setUploadFiles(prev => 
          prev.map((f, idx) => 
            idx === prev.length - newFiles.length + i 
              ? { ...f, status: 'uploading', progress: 50 }
              : f
          )
        );

        // Upload the file
        const response = await mediaService.uploadMedia({
          file: uploadFile.file,
          sortOrder: uploadedMedia.length + i,
          isPrimary: uploadedMedia.length === 0 && i === 0,
          productIds: productId ? [productId] : undefined,
        });

        // Extract media from response
        const media = response.data?.item || response.item;

        // Update status to success
        setUploadFiles(prev => 
          prev.map((f, idx) => 
            idx === prev.length - newFiles.length + i 
              ? { ...f, status: 'success', progress: 100, media }
              : f
          )
        );

        // Add to uploaded media
        setUploadedMedia(prev => [...prev, media]);

      } catch (error: any) {
        console.error('Upload failed:', error);
        
        // Update status to error
        setUploadFiles(prev => 
          prev.map((f, idx) => 
            idx === prev.length - newFiles.length + i 
              ? { 
                  ...f, 
                  status: 'error', 
                  progress: 0, 
                  error: error.response?.data?.message || error.message || 'Upload failed' 
                }
              : f
          )
        );
      }
    }

    setUploading(false);

    // Notify parent of completed uploads
    const successfulUploads = uploadFiles
      .filter(f => f.status === 'success' && f.media)
      .map(f => f.media!);
    
    if (successfulUploads.length > 0 && onUploadComplete) {
      onUploadComplete(successfulUploads);
    }

    // Clean up successful uploads after a delay
    setTimeout(() => {
      setUploadFiles(prev => prev.filter(f => f.status !== 'success'));
    }, 3000);
  }, [productId, uploadedMedia.length, onUploadComplete, uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple,
    maxFiles,
    maxSize: maxFileSize,
  });

  const removeUploadFile = (index: number) => {
    const file = uploadFiles[index];
    URL.revokeObjectURL(file.preview);
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedMedia = async (media: Media) => {
    // Confirm removal
    const confirmMessage = productId 
      ? 'Remove this image from the product?' 
      : 'Delete this image permanently?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      // If we have a productId, just dissociate the media from the product
      // Otherwise, delete the media entirely
      if (productId) {
        // Dissociate from product instead of deleting
        await mediaService.dissociateFromProducts(media.id, [productId]);
      } else {
        // No product context, so delete the media
        await mediaService.deleteMedia(media.id);
      }
      
      // Update local state
      setUploadedMedia(prev => prev.filter(m => m.id !== media.id));
      
      // Notify parent component
      if (onMediaRemove) {
        onMediaRemove(media.id);
      }
    } catch (error) {
      console.error('Failed to remove media:', error);
      // Show user-friendly error
      alert('Failed to remove image. Please try again.');
    }
  };

  const setPrimaryMedia = async (media: Media) => {
    try {
      // Update all media to not be primary
      const updates = uploadedMedia.map(async (m) => {
        if (m.id === media.id) {
          await mediaService.updateMedia(m.id, { isPrimary: true });
        } else if (m.isPrimary) {
          await mediaService.updateMedia(m.id, { isPrimary: false });
        }
      });

      await Promise.all(updates);

      // Update local state
      setUploadedMedia(prev => 
        prev.map(m => ({
          ...m,
          isPrimary: m.id === media.id,
        }))
      );
    } catch (error) {
      console.error('Failed to set primary media:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        {isDragActive ? (
          <p className="text-sm text-gray-600">Drop the files here...</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max {maxFiles} files, up to {Math.round(maxFileSize / 1024 / 1024)}MB each
            </p>
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Uploading Files</h3>
          {uploadFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
              {/* Preview */}
              {file.file.type.startsWith('image/') ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}

              {/* File Info */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
                
                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Error Message */}
                {file.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1">{file.error}</p>
                )}
              </div>

              {/* Status Icon */}
              {file.status === 'pending' && (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
              )}
              {file.status === 'uploading' && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              {file.status === 'success' && (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
              {file.status === 'error' && (
                <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
              )}

              {/* Remove Button */}
              {file.status !== 'uploading' && (
                <button
                  onClick={() => removeUploadFile(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Media Gallery */}
      {uploadedMedia.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Product Media</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {uploadedMedia.map((media) => (
              <div
                key={media.id}
                className={clsx(
                  'relative group rounded-lg overflow-hidden border-2',
                  media.isPrimary ? 'border-blue-500' : 'border-gray-200'
                )}
              >
                {/* Image */}
                {media.isImage ? (
                  <img
                    src={mediaService.getMediaUrl(media)}
                    alt={media.alt || media.filename}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Primary Badge */}
                {media.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                    Primary
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!media.isPrimary && (
                    <button
                      onClick={() => setPrimaryMedia(media)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => removeUploadedMedia(media)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* File Info */}
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate">{media.filename}</p>
                  <p className="text-xs text-gray-500">{media.humanReadableSize}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
