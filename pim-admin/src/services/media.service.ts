import axios from 'axios';
import authService from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api/v1';

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
  private getAuthHeader() {
    const token = authService.getTokens().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

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

    const response = await axios.post(
      `${API_URL}/media/upload`,
      formData,
      {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );

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
    const response = await axios.get(`${API_URL}/media`, {
      headers: this.getAuthHeader(),
      params,
    });
    return response.data;
  }

  async getMediaById(id: string) {
    const response = await axios.get(`${API_URL}/media/${id}`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async getProductMedia(productId: string) {
    const response = await axios.get(`${API_URL}/media/product/${productId}`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateMedia(id: string, params: UpdateMediaParams) {
    const response = await axios.put(
      `${API_URL}/media/${id}`,
      params,
      {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async deleteMedia(id: string) {
    const response = await axios.delete(`${API_URL}/media/${id}`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async associateWithProducts(mediaId: string, productIds: string[]) {
    const response = await axios.post(
      `${API_URL}/media/${mediaId}/products`,
      { productIds },
      {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async dissociateFromProducts(mediaId: string, productIds: string[]) {
    try {
      const response = await axios.delete(`${API_URL}/media/${mediaId}/products`, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        data: { productIds },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to dissociate media from products:', error);
      throw error;
    }
  }

  async bulkDelete(ids: string[]) {
    const response = await axios.post(
      `${API_URL}/media/bulk-delete`,
      { ids },
      {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  // Helper to get full URL for media
  getMediaUrl(media: Media): string {
    // If URL is provided, use it directly (backend should provide full URLs)
    if (media.url) {
      // If it's already a full URL, return as-is
      if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
        return media.url;
      }
      // If it's a relative URL, make it absolute
      const baseUrl = API_URL.replace('/api/v1', '');
      return `${baseUrl}${media.url.startsWith('/') ? media.url : '/' + media.url}`;
    }
    
    // Fallback: construct URL from path or filename
    if (media.path) {
      // Extract just the filename from the path
      const filename = media.path.split('/').pop() || media.filename;
      return `${API_URL.replace('/api/v1', '')}/uploads/${filename}`;
    }
    
    // Last resort: use filename
    return `${API_URL.replace('/api/v1', '')}/uploads/${media.filename}`;
  }
}

export const mediaService = new MediaService();
export default mediaService;
