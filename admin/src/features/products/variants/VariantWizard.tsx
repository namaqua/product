// admin/src/features/products/variants/VariantWizard.tsx
import React, { useState, useEffect } from 'react';
import {
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CubeIcon,
  TagIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import variantService from '../../../services/variant.service';
import { GenerateVariantsDto, PricingStrategy, SkuGenerationStrategy } from '../../../types/dto/variants';

interface VariantWizardProps {
  productId: string;
  productSku: string;
  productName: string;
  productPrice?: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface AxisValue {
  value: string;
  priceAdjustment?: number;
  adjustmentType?: 'fixed' | 'percentage';
}

interface VariantAxis {
  name: string;
  values: AxisValue[];
}

export default function VariantWizard({
  productId,
  productSku,
  productName,
  productPrice = 0,
  onComplete,
  onCancel,
}: VariantWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Select Axes
  const [selectedAxes, setSelectedAxes] = useState<VariantAxis[]>([]);
  const [newAxisName, setNewAxisName] = useState('');

  // Step 2: Define Values
  const [axisValues, setAxisValues] = useState<Record<string, AxisValue[]>>({});

  // Step 3: Pricing Strategy
  const [pricingStrategy, setPricingStrategy] = useState<PricingStrategy>(PricingStrategy.FIXED);
  const [basePrice, setBasePrice] = useState(productPrice);
  const [globalPriceAdjustment, setGlobalPriceAdjustment] = useState(0);
  const [priceIncrementType, setPriceIncrementType] = useState<'incremental' | 'uniform'>('incremental');

  // Step 4: Additional Settings
  const [skuStrategy, setSkuStrategy] = useState<SkuGenerationStrategy>(SkuGenerationStrategy.PATTERN);
  const [skuPattern, setSkuPattern] = useState('{parent}-{axes}');
  const [initialStatus, setInitialStatus] = useState('draft');
  const [inheritFields, setInheritFields] = useState(['description', 'brand', 'manufacturer']);
  const [defaultQuantity, setDefaultQuantity] = useState(0);
  const [manageStock, setManageStock] = useState(true);

  // Step 5: Review
  const [generatedCombinations, setGeneratedCombinations] = useState<any[]>([]);

  // Load templates from localStorage + default templates
  const loadAxisTemplates = () => {
    const stored = localStorage.getItem('variantTemplates');
    const customTemplates = stored ? JSON.parse(stored) : [];
    
    // Convert to the format expected by the wizard
    const templates: Record<string, { name: string, values: string[] }> = {
      // Default templates
      size: {
        name: 'Size',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      color: {
        name: 'Color',
        values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Navy'],
      },
      storage: {
        name: 'Storage',
        values: ['128GB', '256GB', '512GB', '1TB', '2TB'],
      },
      memory: {
        name: 'Memory',
        values: ['8GB', '16GB', '32GB', '64GB'],
      },
      material: {
        name: 'Material',
        values: ['Cotton', 'Polyester', 'Wool', 'Leather', 'Synthetic'],
      },
    };
    
    // Add custom templates
    customTemplates.forEach((template: any) => {
      templates[template.id] = {
        name: template.name,
        values: template.values,
      };
    });
    
    return templates;
  };

  // Predefined axis templates - now loaded from localStorage too
  const [axisTemplates, setAxisTemplates] = useState(loadAxisTemplates());

  const steps = [
    { id: 1, name: 'Select Axes', icon: CubeIcon },
    { id: 2, name: 'Define Values', icon: TagIcon },
    { id: 3, name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 4, name: 'Settings', icon: ClipboardDocumentCheckIcon },
    { id: 5, name: 'Review', icon: SparklesIcon },
  ];

  useEffect(() => {
    // Reload templates when component mounts
    setAxisTemplates(loadAxisTemplates());
  }, []);

  useEffect(() => {
    if (currentStep === 5) {
      generatePreview();
    }
  }, [currentStep]);

  const addAxis = (name: string) => {
    if (!name.trim()) return;
    
    if (selectedAxes.find(axis => axis.name.toLowerCase() === name.toLowerCase())) {
      setError('This axis already exists');
      return;
    }

    setSelectedAxes([...selectedAxes, { name, values: [] }]);
    setAxisValues({ ...axisValues, [name]: [] });
    setNewAxisName('');
    setError(null);
  };

  const removeAxis = (name: string) => {
    setSelectedAxes(selectedAxes.filter(axis => axis.name !== name));
    const newValues = { ...axisValues };
    delete newValues[name];
    setAxisValues(newValues);
  };

  const addAxisValue = (axisName: string, value: string) => {
    if (!value.trim()) return;

    const currentValues = axisValues[axisName] || [];
    if (currentValues.find(v => v.value.toLowerCase() === value.toLowerCase())) {
      return;
    }

    setAxisValues({
      ...axisValues,
      [axisName]: [...currentValues, { value }],
    });
  };

  const removeAxisValue = (axisName: string, value: string) => {
    setAxisValues({
      ...axisValues,
      [axisName]: (axisValues[axisName] || []).filter(v => v.value !== value),
    });
  };

  const updateValuePricing = (
    axisName: string,
    value: string,
    adjustment: number,
    type: 'fixed' | 'percentage'
  ) => {
    setAxisValues({
      ...axisValues,
      [axisName]: (axisValues[axisName] || []).map(v =>
        v.value === value
          ? { ...v, priceAdjustment: adjustment, adjustmentType: type }
          : v
      ),
    });
  };

  const generatePreview = () => {
    const combinations = generateCombinations();
    setGeneratedCombinations(combinations);
  };

  const generateCombinations = () => {
    const axes = Object.keys(axisValues);
    if (axes.length === 0) return [];

    const values = axes.map(axis => axisValues[axis].map(v => v.value));
    const result: any[] = [];

    let variantIndex = 0;
    const generateHelper = (index: number, current: Record<string, string>) => {
      if (index === axes.length) {
        const sku = generateSku(current);
        const price = calculatePrice(current, variantIndex);
        result.push({
          axes: { ...current },
          sku,
          price,
          name: `${productName} - ${Object.values(current).join(' ')}`,
        });
        variantIndex++;
        return;
      }

      const axis = axes[index];
      for (const value of values[index]) {
        generateHelper(index + 1, { ...current, [axis]: value });
      }
    };

    generateHelper(0, {});
    return result;
  };

  const generateSku = (combination: Record<string, string>) => {
    let sku = skuPattern.replace('{parent}', productSku);
    const axesString = Object.values(combination).join('-').toUpperCase();
    sku = sku.replace('{axes}', axesString);
    
    Object.entries(combination).forEach(([key, value]) => {
      sku = sku.replace(`{${key}}`, value.toUpperCase());
    });
    
    return sku.replace(/\s+/g, '-');
  };

  const calculatePrice = (combination: Record<string, string>, index?: number) => {
    let price = basePrice;

    if (pricingStrategy === PricingStrategy.PERCENTAGE_INCREASE) {
      if (priceIncrementType === 'incremental') {
        // Apply incremental percentage increase based on variant position
        // First variant gets base price, second gets +X%, third gets +2X%, etc.
        if (index !== undefined) {
          price *= (1 + (globalPriceAdjustment * index) / 100);
        } else {
          // Fallback: apply a single adjustment if no index provided
          price *= (1 + globalPriceAdjustment / 100);
        }
      } else {
        // Uniform: Apply same percentage to all variants
        price *= (1 + globalPriceAdjustment / 100);
      }
    } else if (pricingStrategy === PricingStrategy.AXIS_BASED) {
      Object.entries(combination).forEach(([axis, value]) => {
        const axisValue = axisValues[axis]?.find(v => v.value === value);
        if (axisValue?.priceAdjustment) {
          if (axisValue.adjustmentType === 'percentage') {
            price *= (1 + axisValue.priceAdjustment / 100);
          } else {
            price += axisValue.priceAdjustment;
          }
        }
      });
    }

    return Math.round(price * 100) / 100;
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      const combinations: Record<string, string[]> = {};
      Object.entries(axisValues).forEach(([axis, values]) => {
        combinations[axis] = values.map(v => v.value);
      });

      const pricingRules = pricingStrategy === PricingStrategy.AXIS_BASED
        ? Object.entries(axisValues).flatMap(([axis, values]) =>
            values
              .filter(v => v.priceAdjustment)
              .map(v => ({
                axis,
                value: v.value,
                adjustmentType: v.adjustmentType || 'fixed' as const,
                adjustmentValue: v.priceAdjustment || 0,
              }))
          )
        : undefined;

      const generateDto: GenerateVariantsDto = {
        combinations,
        skuStrategy,
        skuPattern,
        pricingStrategy,
        basePrice,
        pricingRules,
        inventory: {
          defaultQuantity,
          manageStock,
        },
        initialStatus,
        inheritFields,
        skipExisting: true,
        isVisible: true,
      };

      const result = await variantService.generateVariants(productId, generateDto);
      
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      console.error('Failed to generate variants:', err);
      setError(err.response?.data?.message || 'Failed to generate variants');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedAxes.length > 0;
      case 2:
        return Object.values(axisValues).every(values => values.length > 0);
      case 3:
        return basePrice >= 0;
      case 4:
        return true;
      case 5:
        return generatedCombinations.length > 0;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create Product Variants</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Generate variants for {productName} ({productSku})
        </p>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200">
        <nav className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                {index > 0 && (
                  <div className="flex-1 h-0.5 bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        currentStep > step.id ? 'bg-orange-600' : 'bg-transparent'
                      }`}
                    />
                  </div>
                )}
                <button
                  onClick={() => setCurrentStep(step.id)}
                  disabled={step.id > currentStep && !canProceed()}
                  className={`flex flex-col items-center ${
                    currentStep === step.id
                      ? 'text-orange-600'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep === step.id
                        ? 'border-orange-600 bg-orange-50'
                        : currentStep > step.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="mt-1 text-xs font-medium">{step.name}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="p-6" style={{ minHeight: '400px' }}>
        {/* Step 1: Select Axes */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Variant Axes
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Choose the attributes that will vary between products (e.g., Size, Color)
              </p>

              {/* Quick Templates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                
                {/* Group templates by category */}
                {(() => {
                  const systemTemplateIds = ['size', 'color', 'storage', 'memory', 'material'];
                  const systemTemplates = Object.entries(axisTemplates)
                    .filter(([key]) => systemTemplateIds.includes(key));
                  const customTemplates = Object.entries(axisTemplates)
                    .filter(([key]) => !systemTemplateIds.includes(key));
                  
                  return (
                    <>
                      {/* System Templates */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">System Templates</p>
                        <div className="flex flex-wrap gap-2">
                          {systemTemplates.map(([key, template]) => (
                            <button
                              key={key}
                              onClick={() => addAxis(template.name)}
                              disabled={selectedAxes.find(a => a.name === template.name)}
                              className={`px-3 py-1 rounded-md text-sm ${
                                selectedAxes.find(a => a.name === template.name)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                              }`}
                            >
                              {template.name} ({template.values.length})
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Custom Templates */}
                      {customTemplates.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Custom Templates</p>
                          <div className="flex flex-wrap gap-2">
                            {customTemplates.map(([key, template]) => (
                              <button
                                key={key}
                                onClick={() => addAxis(template.name)}
                                disabled={selectedAxes.find(a => a.name === template.name)}
                                className={`px-3 py-1 rounded-md text-sm ${
                                  selectedAxes.find(a => a.name === template.name)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                {template.name} ({template.values.length})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Custom Axis */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Axis
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAxisName}
                    onChange={(e) => setNewAxisName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addAxis(newAxisName);
                      }
                    }}
                    placeholder="e.g., Pattern, Style"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => addAxis(newAxisName)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Axes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Axes ({selectedAxes.length})
                </label>
                {selectedAxes.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No axes selected yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAxes.map((axis) => (
                      <div
                        key={axis.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <span className="font-medium">{axis.name}</span>
                        <button
                          onClick={() => removeAxis(axis.name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Define Values */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Define Values for Each Axis
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Add the possible values for each variant axis
              </p>

              {selectedAxes.map((axis) => (
                <div key={axis.name} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {axis.name} Values
                  </label>

                  {/* Quick values for known axes */}
                  {(() => {
                    // Find matching template by name (case-insensitive)
                    const matchingTemplate = Object.values(axisTemplates).find(
                      t => t.name.toLowerCase() === axis.name.toLowerCase()
                    );
                    
                    if (matchingTemplate) {
                      return (
                        <div className="mb-2">
                          <button
                            onClick={() => {
                              matchingTemplate.values.forEach(v => addAxisValue(axis.name, v));
                            }}
                            className="text-sm text-orange-600 hover:text-orange-800"
                          >
                            Add all default values ({matchingTemplate.values.length})
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Add ${axis.name.toLowerCase()} value`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addAxisValue(axis.name, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addAxisValue(axis.name, input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(axisValues[axis.name] || []).map((value) => (
                      <span
                        key={value.value}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full"
                      >
                        {value.value}
                        <button
                          onClick={() => removeAxisValue(axis.name, value.value)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Total Combinations Preview
                </h4>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(axisValues).reduce((acc, values) => acc * (values.length || 1), 1)} variants
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {Object.entries(axisValues)
                    .map(([axis, values]) => `${axis} (${values.length})`)
                    .join(' × ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pricing Strategy */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Set Pricing Strategy
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price
                  </label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Strategy
                  </label>
                  <select
                    value={pricingStrategy}
                    onChange={(e) => setPricingStrategy(e.target.value as PricingStrategy)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={PricingStrategy.FIXED}>Fixed Price (Same for all)</option>
                    <option value={PricingStrategy.PERCENTAGE_INCREASE}>Percentage-Based Pricing</option>
                    <option value={PricingStrategy.AXIS_BASED}>Axis-Based Pricing (Custom per value)</option>
                  </select>
                </div>

                {pricingStrategy === PricingStrategy.PERCENTAGE_INCREASE && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Percentage Type
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="incremental"
                            checked={priceIncrementType === 'incremental'}
                            onChange={(e) => setPriceIncrementType(e.target.value as 'incremental' | 'uniform')}
                            className="mr-2"
                          />
                          <span className="text-sm">Incremental (each variant increases)</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="uniform"
                            checked={priceIncrementType === 'uniform'}
                            onChange={(e) => setPriceIncrementType(e.target.value as 'incremental' | 'uniform')}
                            className="mr-2"
                          />
                          <span className="text-sm">Uniform (same % for all)</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {priceIncrementType === 'incremental' ? 'Incremental Price Adjustment (% per step)' : 'Price Adjustment (%)'}
                      </label>
                      <input
                        type="number"
                        value={globalPriceAdjustment}
                        onChange={(e) => setGlobalPriceAdjustment(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {priceIncrementType === 'incremental' ? (
                        <p className="mt-1 text-xs text-gray-500">
                          First variant: base price (${basePrice.toFixed(2)})<br/>
                          Second variant: +{globalPriceAdjustment}% (${(basePrice * (1 + globalPriceAdjustment/100)).toFixed(2)})<br/>
                          Third variant: +{globalPriceAdjustment * 2}% (${(basePrice * (1 + globalPriceAdjustment * 2/100)).toFixed(2)})<br/>
                          And so on...
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          All variants will be ${(basePrice * (1 + globalPriceAdjustment/100)).toFixed(2)} 
                          ({globalPriceAdjustment > 0 ? '+' : ''}{globalPriceAdjustment}% from base price)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {pricingStrategy === PricingStrategy.AXIS_BASED && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Set price adjustments for specific values
                    </p>
                    {Object.entries(axisValues).map(([axis, values]) => (
                      <div key={axis}>
                        <h4 className="font-medium text-gray-700 mb-2">{axis}</h4>
                        <div className="space-y-2">
                          {values.map((value) => (
                            <div key={value.value} className="flex items-center gap-2">
                              <span className="w-24 text-sm">{value.value}</span>
                              <select
                                value={value.adjustmentType || 'fixed'}
                                onChange={(e) =>
                                  updateValuePricing(
                                    axis,
                                    value.value,
                                    value.priceAdjustment || 0,
                                    e.target.value as 'fixed' | 'percentage'
                                  )
                                }
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="fixed">Fixed</option>
                                <option value="percentage">Percentage</option>
                              </select>
                              <input
                                type="number"
                                value={value.priceAdjustment || 0}
                                onChange={(e) =>
                                  updateValuePricing(
                                    axis,
                                    value.value,
                                    parseFloat(e.target.value) || 0,
                                    value.adjustmentType || 'fixed'
                                  )
                                }
                                placeholder="0"
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <span className="text-sm text-gray-500">
                                {value.adjustmentType === 'percentage' ? '%' : '$'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Additional Settings */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU Generation
                  </label>
                  <select
                    value={skuStrategy}
                    onChange={(e) => setSkuStrategy(e.target.value as SkuGenerationStrategy)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={SkuGenerationStrategy.PATTERN}>Pattern-based</option>
                    <option value={SkuGenerationStrategy.SEQUENTIAL}>Sequential</option>
                    <option value={SkuGenerationStrategy.CUSTOM}>Custom</option>
                  </select>
                </div>

                {skuStrategy === SkuGenerationStrategy.PATTERN && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU Pattern
                    </label>
                    <input
                      type="text"
                      value={skuPattern}
                      onChange={(e) => setSkuPattern(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Available variables: {'{parent}'}, {'{axes}'}, {selectedAxes.map(a => `{${a.name}}`).join(', ')}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Status
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Quantity
                  </label>
                  <input
                    type="number"
                    value={defaultQuantity}
                    onChange={(e) => setDefaultQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="manageStock"
                    checked={manageStock}
                    onChange={(e) => setManageStock(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="manageStock" className="ml-2 text-sm text-gray-700">
                    Manage stock for variants
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inherit Fields from Parent
                  </label>
                  <div className="space-y-2">
                    {['description', 'brand', 'manufacturer', 'category', 'tags'].map((field) => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={inheritFields.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInheritFields([...inheritFields, field]);
                            } else {
                              setInheritFields(inheritFields.filter(f => f !== field));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Variants
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Review the variants that will be created
              </p>

              <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-orange-900">
                      {generatedCombinations.length} variants will be created
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Price range: ${Math.min(...generatedCombinations.map(c => c.price))} - ${Math.max(...generatedCombinations.map(c => c.price))}
                    </p>
                  </div>
                  <SparklesIcon className="h-8 w-8 text-orange-500" />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Variant
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedCombinations.map((combination, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">
                          {combination.sku}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {Object.entries(combination.axes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ${combination.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                canProceed()
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading || !canProceed()}
              className={`flex items-center gap-2 px-6 py-2 rounded-md ${
                canProceed() && !loading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Generate {generatedCombinations.length} Variants
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}