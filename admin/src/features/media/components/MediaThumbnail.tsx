import React, { useState, useEffect, useRef } from 'react';
import {
  PhotoIcon,
  DocumentIcon,
  FilmIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Media } from '../../../services/media.service';
import mediaService from '../../../services/media.service';

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
  lazy = true,
  onError,
  onClick,
}: MediaThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the appropriate thumbnail URL based on size
  const getThumbnailUrl = (): string | null => {
    if (media.type !== 'image') return null;

    // Try to get thumbnail from thumbnails object
    if (media.thumbnails) {
      switch (size) {
        case 'small':
          return media.thumbnails.thumb || media.thumbnails.small || media.thumbnails.medium;
        case 'medium':
          return media.thumbnails.medium || media.thumbnails.gallery || media.thumbnails.large;
        case 'large':
          return media.thumbnails.large || media.thumbnails.gallery;
        case 'full':
          return mediaService.getMediaUrl(media);
        default:
          return media.thumbnails.medium || media.thumbnails.gallery;
      }
    }

    // Fallback to full image
    return mediaService.getMediaUrl(media);
  };

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  const handleImageError = () => {
    setError(true);
    setLoaded(true);
    if (onError) onError();
  };

  const handleImageLoad = () => {
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
          ${bgColor} ${className}
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

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onClick={onClick}
    >
      {/* Loading skeleton */}
      {!loaded && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}

      {/* Image */}
      {isInView && thumbnailUrl && !error ? (
        <img
          ref={imgRef}
          src={thumbnailUrl}
          alt={media.alt || media.filename}
          className={`
            ${className}
            ${loaded ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-300
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      ) : null}

      {/* Error fallback */}
      {error && renderPlaceholder()}

      {/* Video duration overlay */}
      {media.type === 'video' && media.duration && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(media.duration)}
        </div>
      )}
    </div>
  );
}

// Helper function to format video duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
