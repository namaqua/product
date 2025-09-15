import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { importExportService } from '../../../services/import-export.service';
import { useNotification } from '../../../hooks/useNotification';

interface ImportStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function ImportManager() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('products');
  const [previewData, setPreviewData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  const [steps, setSteps] = useState<ImportStep[]>([
    { id: 'upload', name: 'Upload File', status: 'pending' },
    { id: 'preview', name: 'Preview Data', status: 'pending' },
    { id: 'mapping', name: 'Map Fields', status: 'pending' },
    { id: 'validate', name: 'Validate', status: 'pending' },
    { id: 'process', name: 'Process Import', status: 'pending' },
  ]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      updateStepStatus('upload', 'completed');
      
      // Automatically preview the file
      await previewFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const updateStepStatus = (stepId: string, status: ImportStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const previewFile = async (file: File) => {
    updateStepStatus('preview', 'processing');
    try {
      const response = await importExportService.previewImport(file, importType, 10);
      if (response.success) {
        setPreviewData(response.data);
        updateStepStatus('preview', 'completed');
        
        // Auto-generate initial mapping
        if (response.data.headers) {
          const autoMapping: Record<string, string> = {};
          response.data.headers.forEach((header: string) => {
            // Try to auto-map common fields
            const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedHeader.includes('name')) autoMapping[header] = 'name';
            else if (normalizedHeader.includes('sku')) autoMapping[header] = 'sku';
            else if (normalizedHeader.includes('price')) autoMapping[header] = 'price';
            else if (normalizedHeader.includes('description')) autoMapping[header] = 'description';
            else if (normalizedHeader.includes('category')) autoMapping[header] = 'category';
            else if (normalizedHeader.includes('stock')) autoMapping[header] = 'stock';
            else if (normalizedHeader.includes('quantity')) autoMapping[header] = 'quantity';
          });
          setMapping(autoMapping);
          updateStepStatus('mapping', 'completed');
        }
      }
    } catch (error) {
      showError('Failed to preview file');
      updateStepStatus('preview', 'error');
    }
  };

  const validateImport = async () => {
    if (!selectedFile) return;
    
    setIsValidating(true);
    updateStepStatus('validate', 'processing');
    
    try {
      const response = await importExportService.validateImport(selectedFile, importType, mapping);
      if (response.success) {
        if (response.data.errors && response.data.errors.length > 0) {
          setValidationErrors(response.data.errors);
          updateStepStatus('validate', 'error');
          showError(`Found ${response.data.errors.length} validation errors`);
        } else {
          setValidationErrors([]);
          updateStepStatus('validate', 'completed');
          showSuccess('Validation successful! Ready to import.');
        }
      }
    } catch (error) {
      showError('Validation failed');
      updateStepStatus('validate', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const processImport = async () => {
    if (!selectedFile || validationErrors.length > 0) return;
    
    setIsProcessing(true);
    updateStepStatus('process', 'processing');
    
    try {
      const response = await importExportService.createImportJob(selectedFile, {
        type: importType,
        mapping,
        options: {
          skipErrors: false,
          updateExisting: true,
        },
      });
      
      if (response.success) {
        setCurrentJobId(response.data.id);
        updateStepStatus('process', 'completed');
        showSuccess('Import job created successfully!');
        
        // Reset after successful import
        setTimeout(() => {
          resetImport();
        }, 3000);
      }
    } catch (error) {
      showError('Failed to process import');
      updateStepStatus('process', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setValidationErrors([]);
    setMapping({});
    setCurrentJobId(null);
    setSteps(steps.map(step => ({ ...step, status: 'pending' })));
  };

  const downloadTemplate = async () => {
    try {
      await importExportService.downloadTemplate(importType, 'csv');
      showSuccess('Template downloaded successfully');
    } catch (error) {
      showError('Failed to download template');
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Import Type</label>
        <select
          value={importType}
          onChange={(e) => setImportType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          disabled={isProcessing}
        >
          <option value="products">Products</option>
          <option value="variants">Product Variants</option>
          <option value="categories">Categories</option>
          <option value="attributes">Attributes</option>
        </select>
        <button
          onClick={downloadTemplate}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Download {importType} template
        </button>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="overflow-hidden rounded-lg bg-gray-50 px-4 py-5 sm:p-6">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className="relative flex-1">
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200" />
                  )}
                  <div className="relative flex flex-col items-center">
                    <span
                      className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        step.status === 'completed'
                          ? 'bg-green-600'
                          : step.status === 'processing'
                          ? 'bg-blue-600 animate-pulse'
                          : step.status === 'error'
                          ? 'bg-red-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      ) : step.status === 'processing' ? (
                        <ArrowPathIcon className="h-5 w-5 text-white animate-spin" />
                      ) : step.status === 'error' ? (
                        <XCircleIcon className="h-5 w-5 text-white" />
                      ) : (
                        <span className="text-xs text-white">{stepIdx + 1}</span>
                      )}
                    </span>
                    <span className="mt-2 text-xs font-medium text-gray-600">
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* File Upload */}
      <div
        {...getRootProps()}
        className={`relative block w-full rounded-lg border-2 border-dashed p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <span className="mt-2 block text-sm font-semibold text-gray-900">
          {selectedFile ? selectedFile.name : 'Drop your file here, or click to browse'}
        </span>
        <span className="mt-1 block text-xs text-gray-500">
          CSV, XLS, or XLSX files up to 10MB
        </span>
      </div>

      {/* Preview Section */}
      {previewData && (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Data Preview</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              First 10 rows of your file
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData.headers?.map((header: string, idx: number) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div>
                          <div>{header}</div>
                          <select
                            value={mapping[header] || ''}
                            onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                            className="mt-1 text-xs border-gray-300 rounded"
                          >
                            <option value="">-- Skip --</option>
                            <option value="name">Name</option>
                            <option value="sku">SKU</option>
                            <option value="price">Price</option>
                            <option value="description">Description</option>
                            <option value="category">Category</option>
                            <option value="stock">Stock</option>
                            <option value="brand">Brand</option>
                            <option value="weight">Weight</option>
                            <option value="dimensions">Dimensions</option>
                          </select>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.rows?.map((row: any[], rowIdx: number) => (
                    <tr key={rowIdx}>
                      {row.map((cell: any, cellIdx: number) => (
                        <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 pl-5">
                  {validationErrors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>
                      Row {error.row}: {error.field} - {error.message}
                    </li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li>... and {validationErrors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={resetImport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        {previewData && !validationErrors.length && (
          <button
            onClick={validateImport}
            disabled={isValidating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </button>
        )}
        {steps[3].status === 'completed' && (
          <button
            onClick={processImport}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Start Import'}
          </button>
        )}
      </div>
    </div>
  );
}
