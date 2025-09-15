import api from './api';
import { ApiResponse } from '../types/api';

export interface ImportJobResponse {
  id: string;
  type: string;
  status: string;
  fileName: string;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  mapping?: Record<string, string>;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ExportJobResponse {
  id: string;
  type: string;
  format: string;
  status: string;
  totalRecords: number;
  fileName?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface MappingTemplate {
  id: string;
  name: string;
  type: string;
  mapping: Record<string, string>;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

class ImportExportService {
  // Import Methods
  async createImportJob(file: File, config: any): Promise<ApiResponse<ImportJobResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(config).forEach(key => {
      if (key === 'mapping' || key === 'options') {
        formData.append(key, JSON.stringify(config[key]));
      } else {
        formData.append(key, config[key]);
      }
    });

    const response = await api.post('/import-export/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async previewImport(file: File, type: string, rows: number = 10): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('rows', rows.toString());

    const response = await api.post('/import-export/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async validateImport(file: File, type: string, mapping: Record<string, string>): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('mapping', JSON.stringify(mapping));

    const response = await api.post('/import-export/import/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async processImportJob(jobId: string): Promise<ApiResponse<ImportJobResponse>> {
    const response = await api.post('/import-export/import/process', { jobId });
    return response.data;
  }

  async getImportJobs(params?: any): Promise<ApiResponse<any>> {
    const response = await api.get('/import-export/import/jobs', { params });
    return response.data;
  }

  async getImportJob(id: string): Promise<ApiResponse<ImportJobResponse>> {
    const response = await api.get(`/import-export/import/jobs/${id}`);
    return response.data;
  }

  async cancelImportJob(id: string): Promise<ApiResponse<ImportJobResponse>> {
    const response = await api.delete(`/import-export/import/jobs/${id}`);
    return response.data;
  }

  // Export Methods
  async createExportJob(config: any): Promise<ApiResponse<ExportJobResponse>> {
    const response = await api.post('/import-export/export', config);
    return response.data;
  }

  async getExportJobs(params?: any): Promise<ApiResponse<any>> {
    const response = await api.get('/import-export/export/jobs', { params });
    return response.data;
  }

  async getExportJob(id: string): Promise<ApiResponse<ExportJobResponse>> {
    const response = await api.get(`/import-export/export/jobs/${id}`);
    return response.data;
  }

  async downloadExport(id: string): Promise<void> {
    const response = await api.get(`/import-export/export/download/${id}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from content-disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'export.csv';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async cancelExportJob(id: string): Promise<ApiResponse<ExportJobResponse>> {
    const response = await api.delete(`/import-export/export/jobs/${id}`);
    return response.data;
  }

  // Mapping Methods
  async getMappingTemplates(type?: string): Promise<ApiResponse<any>> {
    const params = type ? { type } : {};
    const response = await api.get('/import-export/mappings', { params });
    return response.data;
  }

  async getMappingTemplate(id: string): Promise<ApiResponse<MappingTemplate>> {
    const response = await api.get(`/import-export/mappings/${id}`);
    return response.data;
  }

  async createMappingTemplate(data: any): Promise<ApiResponse<MappingTemplate>> {
    const response = await api.post('/import-export/mappings', data);
    return response.data;
  }

  async updateMappingTemplate(id: string, data: any): Promise<ApiResponse<MappingTemplate>> {
    const response = await api.put(`/import-export/mappings/${id}`, data);
    return response.data;
  }

  async deleteMappingTemplate(id: string): Promise<ApiResponse<MappingTemplate>> {
    const response = await api.delete(`/import-export/mappings/${id}`);
    return response.data;
  }

  // Template Methods
  async downloadTemplate(type: string, format: string): Promise<void> {
    try {
      const response = await api.get('/import-export/templates/download', {
        params: { type, format },
        responseType: 'blob',
      });
      
      // Create download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from content-disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `${type}_template.${format}`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      throw error;
    }
  }
}

export const importExportService = new ImportExportService();
