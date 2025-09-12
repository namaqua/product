import React, { useState, useEffect } from 'react';
import {
  CpuChipIcon,
  ServerIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import attributeService from '../../services/attribute.service';

interface ConfigurableProductProps {
  productId: string;
  productType: string;
}

interface ConfigurationOption {
  id: string;
  attributeId: string;
  attributeName: string;
  attributeCode: string;
  required: boolean;
  options: Array<{
    value: string;
    label: string;
    priceModifier?: number;
    stockImpact?: boolean;
    sku?: string;
  }>;
  selectionType: 'single' | 'multiple';
  defaultValue?: string;
}

// Configurable Products are product builders (like Dell computers, custom furniture, etc.)
// Different from Master-Variant which is simple inventory management
export default function ConfigurableProduct({ productId, productType }: ConfigurableProductProps) {
  const [loading, setLoading] = useState(false);
  const [configurations, setConfigurations] = useState<ConfigurationOption[]>([]);
  const [showAddConfig, setShowAddConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Common configuration templates for different product types
  const configTemplates = {
    computer: [
      { name: 'Processor', code: 'processor', options: ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7'] },
      { name: 'Memory', code: 'memory', options: ['8GB', '16GB', '32GB', '64GB'] },
      { name: 'Storage', code: 'storage', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
      { name: 'Graphics', code: 'graphics', options: ['Integrated', 'NVIDIA GTX', 'NVIDIA RTX', 'AMD Radeon'] },
    ],
    furniture: [
      { name: 'Material', code: 'material', options: ['Oak', 'Pine', 'Walnut', 'Mahogany'] },
      { name: 'Finish', code: 'finish', options: ['Natural', 'Stained', 'Painted', 'Lacquered'] },
      { name: 'Size', code: 'size', options: ['Small', 'Medium', 'Large', 'Extra Large'] },
      { name: 'Hardware', code: 'hardware', options: ['Chrome', 'Brass', 'Black', 'Brushed Nickel'] },
    ],
    jewelry: [
      { name: 'Metal', code: 'metal', options: ['Gold 14k', 'Gold 18k', 'Silver', 'Platinum'] },
      { name: 'Stone', code: 'stone', options: ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'None'] },
      { name: 'Size', code: 'ring_size', options: ['5', '6', '7', '8', '9', '10'] },
      { name: 'Engraving', code: 'engraving', options: ['None', 'Initials', 'Date', 'Custom Text'] },
    ],
  };

  useEffect(() => {
    if (productType === 'configurable') {
      loadConfigurations();
    }
  }, [productId, productType]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      // Load configuration options for this product
      // In a real implementation, this would fetch from a product_configurations table
      // For now, we'll simulate with some defaults
      setConfigurations([
        {
          id: '1',
          attributeId: 'attr-1',
          attributeName: 'Processor',
          attributeCode: 'processor',
          required: true,
          selectionType: 'single',
          options: [
            { value: 'i5', label: 'Intel Core i5', priceModifier: 0 },
            { value: 'i7', label: 'Intel Core i7', priceModifier: 200 },
            { value: 'i9', label: 'Intel Core i9', priceModifier: 500 },
          ],
          defaultValue: 'i5'
        },
        {
          id: '2',
          attributeId: 'attr-2',
          attributeName: 'Memory',
          attributeCode: 'memory',
          required: true,
          selectionType: 'single',
          options: [
            { value: '8gb', label: '8GB RAM', priceModifier: 0 },
            { value: '16gb', label: '16GB RAM', priceModifier: 100 },
            { value: '32gb', label: '32GB RAM', priceModifier: 300 },
          ],
          defaultValue: '8gb'
        }
      ]);
    } catch (err) {
      console.error('Failed to load configurations:', err);
      setConfigurations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (templateType: keyof typeof configTemplates) => {
    const template = configTemplates[templateType];
    const newConfigs: ConfigurationOption[] = template.map((config, index) => ({
      id: `temp-${index}`,
      attributeId: `attr-temp-${index}`,
      attributeName: config.name,
      attributeCode: config.code,
      required: index < 2, // First two are required
      selectionType: 'single' as const,
      options: config.options.map(opt => ({
        value: opt.toLowerCase().replace(/\s+/g, '_'),
        label: opt,
        priceModifier: 0
      })),
      defaultValue: undefined
    }));
    
    setConfigurations(newConfigs);
    setSuccessMessage(`Applied ${templateType} configuration template`);
  };

  // If not a configurable product, show info about configurable products
  if (productType !== 'configurable') {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Product Configuration</h2>
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <CpuChipIcon className="h-12 w-12 text-blue-500 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Configurable Products</h3>
          <p className="text-gray-600 mb-4">
            Configurable products allow customers to customize their purchase by selecting from various options.
          </p>
          <div className="text-left max-w-md mx-auto mb-4">
            <p className="text-sm text-gray-600 mb-2">Examples:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Computers:</strong> Choose processor, RAM, storage</li>
              <li>• <strong>Furniture:</strong> Select wood, finish, size</li>
              <li>• <strong>Jewelry:</strong> Pick metal, stones, engraving</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 italic">
            Note: This is different from variants which are simple inventory variations (like T-shirt sizes).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium">Product Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">
            Define customization options for customers to build their product
          </p>
        </div>
        <button
          onClick={() => setShowAddConfig(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Configuration
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Configuration Templates */}
      {configurations.length === 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Quick Start Templates</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleApplyTemplate('computer')}
              className="px-3 py-1 bg-white text-purple-600 border border-purple-300 rounded hover:bg-purple-100 text-sm"
            >
              <CpuChipIcon className="h-4 w-4 inline mr-1" />
              Computer Configuration
            </button>
            <button
              onClick={() => handleApplyTemplate('furniture')}
              className="px-3 py-1 bg-white text-purple-600 border border-purple-300 rounded hover:bg-purple-100 text-sm"
            >
              Furniture Configuration
            </button>
            <button
              onClick={() => handleApplyTemplate('jewelry')}
              className="px-3 py-1 bg-white text-purple-600 border border-purple-300 rounded hover:bg-purple-100 text-sm"
            >
              Jewelry Configuration
            </button>
          </div>
        </div>
      )}

      {/* Configuration Options List */}
      {configurations.length > 0 ? (
        <div className="space-y-3">
          {configurations.map((config, index) => (
            <div key={config.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <ServerIcon className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{config.attributeName}</span>
                    <span className="text-xs text-gray-500 font-mono">({config.attributeCode})</span>
                    {config.required && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Required</span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {config.selectionType === 'single' ? 'Single Choice' : 'Multiple Choice'}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Options:</p>
                    <div className="flex flex-wrap gap-2">
                      {config.options.map((option) => (
                        <div key={option.value} className="px-3 py-1 bg-gray-50 rounded border border-gray-200">
                          <span className="text-sm">{option.label}</span>
                          {option.priceModifier && option.priceModifier !== 0 && (
                            <span className="ml-2 text-xs text-green-600">
                              +${option.priceModifier}
                            </span>
                          )}
                          {option.value === config.defaultValue && (
                            <span className="ml-2 text-xs text-blue-600">(default)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-600"
                    title="Edit configuration"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-red-600"
                    title="Delete configuration"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No configuration options defined yet.</p>
          <p className="text-sm text-gray-500">
            Add configuration options to allow customers to customize this product.
          </p>
        </div>
      )}

      {/* Configuration Rules */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Configuration Rules</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Each configuration option can affect the final price</li>
          <li>• Required options must be selected before checkout</li>
          <li>• Dependencies can be set between options (e.g., certain processors require specific memory)</li>
          <li>• Stock availability can vary based on configuration</li>
        </ul>
      </div>

      {/* Example Configuration */}
      {configurations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Example Customer View</h4>
          <div className="bg-white p-4 rounded border border-blue-200">
            <h5 className="font-medium mb-3">Configure Your Product</h5>
            {configurations.slice(0, 2).map(config => (
              <div key={config.id} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {config.attributeName} {config.required && <span className="text-red-500">*</span>}
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  {config.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} {opt.priceModifier && opt.priceModifier > 0 && `(+$${opt.priceModifier})`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-xl font-bold text-green-600">$1,299.00</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}