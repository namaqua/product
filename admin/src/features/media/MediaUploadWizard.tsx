import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
} from '@heroicons/react/24/outline';
import mediaService from '../../services/media.service';

interface MediaUploadWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  productId?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
  uploadedId?: string;
}

export default function MediaUploadWizard({
  onComplete,
  onCancel,
  productId,
}: MediaUploadWizardProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
  }>({ successful: 0, failed: 0 });

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.uploadStatus = 'pending';
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      
      return fileWithPreview;
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const file = newFiles[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Upload all files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    
    let successful = 0;
    let failed = 0;
    
    const totalFiles = files.filter(f => f.uploadStatus === 'pending').length;
    let processedFiles = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.uploadStatus !== 'pending') continue;
      
      // Update status to uploading
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[i].uploadStatus = 'uploading';
        return newFiles;
      });

      try {
        const response = await mediaService.uploadMedia({
          file,
          productIds: productId ? [productId] : undefined,
          sortOrder: i,
          isPrimary: i === 0 && productId !== undefined,
        });

        if (response.success) {
          successful++;
          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[i].uploadStatus = 'success';
            newFiles[i].uploadedId = response.data.item.id;
            return newFiles;
          });
        } else {
          failed++;
          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[i].uploadStatus = 'error';
            newFiles[i].uploadError = 'Upload failed';
            return newFiles;
          });
        }
      } catch (error: any) {
        failed++;
        console.error(`Failed to upload ${file.name}:`, error);
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].uploadStatus = 'error';
          newFiles[i].uploadError = error.response?.data?.message || 'Upload failed';
          return newFiles;
        });
      }

      processedFiles++;
      setUploadProgress(Math.round((processedFiles / totalFiles) * 100));
    }

    setUploadResults({ successful, failed });
    setUploading(false);
    
    // If all successful, auto-complete after a short delay
    if (failed === 0 && successful > 0) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  // Get file icon based on type
  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-green-400" />;
    } else if (file.type.startsWith('video/')) {
      return <FilmIcon className="h-8 w-8 text-purple-400" />;
    } else {
      return <DocumentIcon className="h-8 w-8 text-blue-400" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Clean up previews on unmount
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel} />
        
        <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upload Media</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Dropzone */}
          {files.length === 0 && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                transition-colors
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                {isDragActive
                  ? 'Drop files here...'
                  : 'Drag & drop files here, or click to select'
                }
              </p>
              <p className="text-sm text-gray-500">
                Supports images, videos, PDFs, and documents (max 50MB)
              </p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </h3>
                {!uploading && (
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add more files
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border
                      ${file.uploadStatus === 'success' 
                        ? 'bg-green-50 border-green-200'
                        : file.uploadStatus === 'error'
                        ? 'bg-red-50 border-red-200'
                        : file.uploadStatus === 'uploading'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                      }
                    `}
                  >
                    {/* Preview or Icon */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      {file.uploadError && (
                        <p className="text-xs text-red-600 mt-1">{file.uploadError}</p>
                      )}
                    </div>

                    {/* Status/Actions */}
                    <div className="flex-shrink-0">
                      {file.uploadStatus === 'pending' && !uploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                      {file.uploadStatus === 'uploading' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                      {file.uploadStatus === 'success' && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                      {file.uploadStatus === 'error' && (
                        <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-900 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Results Summary */}
          {!uploading && (uploadResults.successful > 0 || uploadResults.failed > 0) && (
            <div className="mb-6 p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Complete</h4>
              <div className="flex gap-4 text-sm">
                {uploadResults.successful > 0 && (
                  <span className="text-green-600">
                    ✓ {uploadResults.successful} successful
                  </span>
                )}
                {uploadResults.failed > 0 && (
                  <span className="text-red-600">
                    ✗ {uploadResults.failed} failed
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {!uploading && uploadResults.successful === 0 && (
              <>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={files.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload {files.length} File{files.length !== 1 ? 's' : ''}
                </button>
              </>
            )}
            {!uploading && uploadResults.successful > 0 && (
              <button
                onClick={onComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
