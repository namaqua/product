import React, { useState, useEffect } from 'react';
import {
  PhotoIcon,
  DocumentIcon,
  FilmIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Media } from '../../../services/media.service';

interface MediaThumbnailProps {
  media: Media;
  size?: 'small' | 'medium' | 'large' | 'full';
  className?: string;
  lazy?: boolean;
  onError?: () => void;
  onClick?: () => void;
}

export default function MediaThumbnail({
  media,
  size = 'medium',
  className = '',
  lazy = false, // Disable lazy loading for now to test
  onError,
  onClick,
}: MediaThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Get the appropriate thumbnail URL based on size
  const getThumbnailUrl = (): string | null => {
    if (media.type !== 'image') return null;

    // For debugging - let's use the main URL directly
    if (media.url) {
      console.log('Using main URL:', media.url);
      return media.url;
    }

    // Construct URL from path
    const baseUrl = 'http://localhost:3010';
    if (media.path) {
      const url = media.path.startsWith('uploads/') 
        ? `${baseUrl}/${media.path}`
        : `${baseUrl}/uploads/${media.path}`;
      console.log('Constructed URL from path:', url);
      return url;
    }

    return null;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    console.error('Image load error:', {
      src: target.src,
      media: media.filename,
      error: e,
    });
    setError(true);
    setLoaded(true);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', media.filename);
    setLoaded(true);
    setError(false);
  };

  // Render placeholder for non-image types or errors
  const renderPlaceholder = () => {
    let Icon;
    let bgColor = 'bg-gray-100';
    let iconColor = 'text-gray-400';

    switch (media.type) {
      case 'video':
        Icon = FilmIcon;
        bgColor = 'bg-purple-50';
        iconColor = 'text-purple-400';
        break;
      case 'document':
        if (media.mimeType?.includes('pdf')) {
          Icon = DocumentTextIcon;
          bgColor = 'bg-red-50';
          iconColor = 'text-red-400';
        } else {
          Icon = DocumentIcon;
          bgColor = 'bg-blue-50';
          iconColor = 'text-blue-400';
        }
        break;
      case 'image':
        Icon = PhotoIcon;
        bgColor = 'bg-green-50';
        iconColor = 'text-green-400';
        break;
      default:
        Icon = DocumentIcon;
    }

    return (
      <div 
        className={`
          w-full h-full flex flex-col items-center justify-center
          ${bgColor} ${className} rounded
        `}
        onClick={onClick}
      >
        <Icon className={`h-12 w-12 ${iconColor}`} />
        <p className={`mt-2 text-xs ${iconColor} font-medium`}>
          {media.extension?.toUpperCase() || media.type.toUpperCase()}
        </p>
        {media.humanReadableSize && (
          <p className={`text-xs ${iconColor} opacity-75`}>
            {media.humanReadableSize}
          </p>
        )}
      </div>
    );
  };

  // For non-image types, always show placeholder
  if (media.type !== 'image') {
    return renderPlaceholder();
  }

  const thumbnailUrl = getThumbnailUrl();
  
  if (!thumbnailUrl) {
    console.warn('No URL available for media:', media.filename);
    return renderPlaceholder();
  }

  return (
    <div 
      className={`relative ${className}`}
      onClick={onClick}
    >
      {/* Always render the image */}
      {error ? (
        renderPlaceholder()
      ) : (
        <>
          {/* Loading state */}
          {!loaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
          )}
          
          {/* Actual image */}
          <img
            src={thumbnailUrl}
            alt={media.alt || media.filename}
            className={`
              ${className}
              ${loaded ? 'opacity-100' : 'opacity-0'}
              transition-opacity duration-300
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous" // Add this for CORS
          />
        </>
      )}
    </div>
  );
}
