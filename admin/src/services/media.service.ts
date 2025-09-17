import api from './api';
import authService from './auth.service';

// Log to confirm we're using the centralized API
console.log('Media Service - Using centralized API with baseURL:', api.defaults.baseURL);

// Media type definitions
export interface Media {
  id: string;
  filename: string;
  path: string;
  url: string | null;
  type: 'image' | 'video' | 'document' | 'other';
  mimeType: string;
  size: number;
  humanReadableSize: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  thumbnails: Record<string, string> | null;
  metadata: Record<string, any> | null;
  sortOrder: number;
  isPrimary: boolean;
  extension: string;
  isImage: boolean;
  isVideo: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  version: number;
  products?: any[]; // Associated products
}

export interface UploadMediaParams {
  file: File;
  alt?: string;
  title?: string;
  description?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  productIds?: string[];
}

export interface UpdateMediaParams {
  alt?: string;
  title?: string;
  description?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  productIds?: string[];
}

export interface MediaListParams {
  page?: number;
  limit?: number;
  type?: 'image' | 'video' | 'document' | 'other';
  productId?: string;
  isPrimary?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class MediaService {
  async uploadMedia(params: UploadMediaParams) {
    const formData = new FormData();
    formData.append('file', params.file);
    
    if (params.alt) formData.append('alt', params.alt);
    if (params.title) formData.append('title', params.title);
    if (params.description) formData.append('description', params.description);
    if (params.sortOrder !== undefined) formData.append('sortOrder', params.sortOrder.toString());
    if (params.isPrimary !== undefined) formData.append('isPrimary', params.isPrimary.toString());
    if (params.productIds && params.productIds.length > 0) {
      formData.append('productIds', JSON.stringify(params.productIds));
    }

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async uploadMultiple(files: File[], productId?: string) {
    const uploadPromises = files.map((file, index) => 
      this.uploadMedia({
        file,
        sortOrder: index,
        isPrimary: index === 0,
        productIds: productId ? [productId] : undefined,
      })
    );

    return Promise.all(uploadPromises);
  }

  async getMediaList(params?: MediaListParams) {
    console.log('getMediaList - calling /media with params:', params);
    const response = await api.get('/media', { params });
    return response.data;
  }

  async getMediaById(id: string) {
    const response = await api.get(`/media/${id}`);
    return response.data;
  }

  async getProductMedia(productId: string) {
    const response = await api.get(`/media/product/${productId}`);
    return response.data;
  }

  async updateMedia(id: string, params: UpdateMediaParams) {
    const response = await api.put(`/media/${id}`, params);
    return response.data;
  }

  async deleteMedia(id: string) {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  }

  async associateWithProducts(mediaId: string, productIds: string[]) {
    const response = await api.post(`/media/${mediaId}/products`, { productIds });
    return response.data;
  }

  async dissociateFromProducts(mediaId: string, productIds: string[]) {
    try {
      const response = await api.delete(`/media/${mediaId}/products`, {
        data: { productIds },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to dissociate media from products:', error);
      throw error;
    }
  }

  async bulkDelete(ids: string[]) {
    const response = await api.post('/media/bulk-delete', { ids });
    return response.data;
  }

  async getStats() {
    console.log('getStats - calling /media/stats');
    
    try {
      const response = await api.get('/media/stats');
      console.log('getStats - success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('getStats error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
      });
      throw error;
    }
  }

  // Helper to get full URL for media
  getMediaUrl(media: Media): string {
    // If URL is provided and it's already a full URL, use it directly
    if (media.url) {
      if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
        return media.url;
      }
      // If it's a relative URL, make it absolute
      const baseUrl = 'http://localhost:3010';
      return `${baseUrl}${media.url.startsWith('/') ? media.url : '/' + media.url}`;
    }
    
    // Fallback: construct URL from path or filename
    const baseUrl = 'http://localhost:3010';
    
    if (media.path) {
      // If path starts with 'uploads/', use it directly
      if (media.path.startsWith('uploads/')) {
        return `${baseUrl}/${media.path}`;
      }
      // Otherwise add /uploads/ prefix
      const filename = media.path.split('/').pop() || media.filename;
      return `${baseUrl}/uploads/${filename}`;
    }
    
    // Last resort: use filename
    return `${baseUrl}/uploads/${media.filename}`;
  }
  
  // Helper to get thumbnail URL
  getThumbnailUrl(media: Media, size: 'thumb' | 'small' | 'medium' | 'large' | 'gallery' = 'thumb'): string | null {
    if (media.type !== 'image' || !media.thumbnails) {
      return null;
    }
    
    const thumbnailPath = media.thumbnails[size];
    if (!thumbnailPath) {
      // Fallback to main image
      return this.getMediaUrl(media);
    }
    
    // Construct full URL for thumbnail
    const baseUrl = 'http://localhost:3010';
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    return `${baseUrl}${thumbnailPath.startsWith('/') ? thumbnailPath : '/' + thumbnailPath}`;
  }
}

export const mediaService = new MediaService();
export default mediaService;
