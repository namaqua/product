import { useState } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { importExportService } from '../../../services/import-export.service';
import { useNotification } from '../../../hooks/useNotification';

interface ExportConfig {
  type: string;
  format: 'csv' | 'xlsx';
  fields: string[];
  filters?: Record<string, any>;
  includeRelations?: boolean;
  includeMedia?: boolean;
}

const EXPORT_TYPES = [
  { value: 'products', label: 'Products', description: 'Export all product data' },
  { value: 'variants', label: 'Product Variants', description: 'Export product variants' },
  { value: 'categories', label: 'Categories', description: 'Export category hierarchy' },
  { value: 'attributes', label: 'Attributes', description: 'Export attribute definitions' },
  { value: 'media', label: 'Media', description: 'Export media library metadata' },
];

const PRODUCT_FIELDS = [
  { value: 'id', label: 'ID', default: true },
  { value: 'sku', label: 'SKU', default: true },
  { value: 'name', label: 'Name', default: true },
  { value: 'description', label: 'Description', default: true },
  { value: 'price', label: 'Price', default: true },
  { value: 'compareAtPrice', label: 'Compare At Price', default: false },
  { value: 'cost', label: 'Cost', default: false },
  { value: 'stock', label: 'Stock', default: true },
  { value: 'categories', label: 'Categories', default: true },
  { value: 'brand', label: 'Brand', default: true },
  { value: 'tags', label: 'Tags', default: true },
  { value: 'weight', label: 'Weight', default: false },
  { value: 'dimensions', label: 'Dimensions', default: false },
  { value: 'attributes', label: 'Attributes', default: true },
  { value: 'media', label: 'Media URLs', default: false },
  { value: 'status', label: 'Status', default: true },
  { value: 'createdAt', label: 'Created Date', default: false },
  { value: 'updatedAt', label: 'Updated Date', default: false },
];

export default function ExportManager() {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    type: 'products',
    format: 'csv',
    fields: PRODUCT_FIELDS.filter(f => f.default).map(f => f.value),
    includeRelations: true,
    includeMedia: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [recentExports, setRecentExports] = useState<any[]>([]);
  const { showSuccess, showError } = useNotification();

  const handleFieldToggle = (field: string) => {
    setExportConfig(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field],
    }));
  };

  const handleSelectAll = () => {
    setExportConfig(prev => ({
      ...prev,
      fields: PRODUCT_FIELDS.map(f => f.value),
    }));
  };

  const handleDeselectAll = () => {
    setExportConfig(prev => ({
      ...prev,
      fields: [],
    }));
  };

  const startExport = async () => {
    setIsExporting(true);
    try {
      const response = await importExportService.createExportJob(exportConfig);
      if (response.success) {
        showSuccess('Export job created successfully! Processing...');
        setRecentExports(prev => [response.data, ...prev]);
        
        // Poll for completion
        pollExportStatus(response.data.id);
      }
    } catch (error) {
      showError('Failed to create export job');
    } finally {
      setIsExporting(false);
    }
  };

  const pollExportStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await importExportService.getExportJob(jobId);
        if (response.success) {
          const job = response.data;
          setRecentExports(prev => prev.map(j => j.id === jobId ? job : j));
          
          if (job.status === 'completed') {
            clearInterval(interval);
            showSuccess('Export completed! Ready for download.');
          } else if (job.status === 'failed') {
            clearInterval(interval);
            showError('Export failed. Please try again.');
          }
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 2000);
  };

  const downloadExport = async (jobId: string) => {
    try {
      await importExportService.downloadExport(jobId);
      showSuccess('Download started');
    } catch (error) {
      showError('Failed to download export');
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Export Configuration</h3>
          
          {/* Export Type */}
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Export Type
              </label>
              <select
                value={exportConfig.type}
                onChange={(e) => setExportConfig({ ...exportConfig, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                {EXPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {EXPORT_TYPES.find(t => t.value === exportConfig.type)?.description}
              </p>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Export Format
              </label>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportConfig.format === 'csv'}
                    onChange={(e) => setExportConfig({ ...exportConfig, format: 'csv' })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">CSV</span>
                </label>
                <label className="inline-flex items-center ml-6">
                  <input
                    type="radio"
                    value="xlsx"
                    checked={exportConfig.format === 'xlsx'}
                    onChange={(e) => setExportConfig({ ...exportConfig, format: 'xlsx' })}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Excel (XLSX)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Field Selection */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Fields to Export
              </label>
              <div className="space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {PRODUCT_FIELDS.map(field => (
                <label key={field.value} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.fields.includes(field.value)}
                    onChange={() => handleFieldToggle(field.value)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-6 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={exportConfig.includeRelations}
                onChange={(e) => setExportConfig({ ...exportConfig, includeRelations: e.target.checked })}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Include related data (categories, attributes)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={exportConfig.includeMedia}
                onChange={(e) => setExportConfig({ ...exportConfig, includeMedia: e.target.checked })}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Include media URLs</span>
            </label>
          </div>

          {/* Export Button */}
          <div className="mt-6">
            <button
              onClick={startExport}
              disabled={isExporting || exportConfig.fields.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="mr-2 h-5 w-5" />
              {isExporting ? 'Creating Export...' : 'Start Export'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Exports */}
      {recentExports.length > 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Exports</h3>
            <div className="mt-4 space-y-3">
              {recentExports.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      job.status === 'completed' ? 'bg-green-400' :
                      job.status === 'processing' ? 'bg-blue-400 animate-pulse' :
                      job.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {job.type} Export ({job.format.toUpperCase()})
                      </p>
                      <p className="text-xs text-gray-500">
                        {job.status === 'completed' ? `${job.totalRecords} records exported` :
                         job.status === 'processing' ? 'Processing...' :
                         job.status === 'failed' ? 'Export failed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                  {job.status === 'completed' && (
                    <button
                      onClick={() => downloadExport(job.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Export Templates */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Export Templates</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <div className="flex items-center space-x-3">
              <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Full Product Catalog</p>
                <p className="text-xs text-gray-500">All products with full details</p>
              </div>
            </div>
          </button>
          <button className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <div className="flex items-center space-x-3">
              <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Inventory Report</p>
                <p className="text-xs text-gray-500">SKU, name, and stock levels</p>
              </div>
            </div>
          </button>
          <button className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <div className="flex items-center space-x-3">
              <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Price List</p>
                <p className="text-xs text-gray-500">Products with pricing info</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
