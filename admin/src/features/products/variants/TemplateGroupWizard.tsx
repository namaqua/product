import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  TagIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  CubeIcon,
  SwatchIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface TemplateGroupWizardProps {
  productId: string;
  productSku: string;
  productName: string;
  onComplete: (templates: any) => void;
  onCancel: () => void;
}

interface TemplateGroup {
  id: string;
  name: string;
  category: string;
  icon?: string;
  values: string[];
  description?: string;
  isCustom?: boolean;
}

// Predefined template groups (can be extended by user)
const defaultTemplateGroups: TemplateGroup[] = [
  // Apparel & Fashion
  {
    id: 'sizes',
    name: 'Standard Sizes',
    category: 'Apparel & Fashion',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'Common clothing sizes',
  },
  {
    id: 'colors',
    name: 'Basic Colors',
    category: 'Apparel & Fashion',
    values: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Navy'],
    description: 'Standard color options',
  },
  // Add more template groups as needed
];

const TemplateGroupWizard: React.FC<TemplateGroupWizardProps> = ({
  productId,
  productSku,
  productName,
  onComplete,
  onCancel,
}) => {
  const [selectedGroups, setSelectedGroups] = useState<TemplateGroup[]>([]);
  const [customGroup, setCustomGroup] = useState<TemplateGroup>({
    id: '',
    name: '',
    category: 'Custom',
    values: [],
    isCustom: true,
  });
  const [step, setStep] = useState<'select' | 'customize' | 'confirm'>('select');

  const handleSelectGroup = (group: TemplateGroup) => {
    if (!selectedGroups.find(g => g.id === group.id)) {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const handleRemoveGroup = (groupId: string) => {
    setSelectedGroups(selectedGroups.filter(g => g.id !== groupId));
  };

  const handleComplete = () => {
    // Transform selected groups into variant templates
    const templates = selectedGroups.map(group => ({
      attributeName: group.name,
      values: group.values,
      category: group.category,
    }));
    onComplete(templates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Variant Template Wizard</h2>
              <p className="text-sm text-gray-500 mt-1">
                Quickly set up variant groups for {productName}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 'select' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Select Template Groups</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {defaultTemplateGroups.map(group => (
                  <div
                    key={group.id}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedGroups.find(g => g.id === group.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectGroup(group)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.values.slice(0, 4).map(value => (
                            <span
                              key={value}
                              className="px-2 py-1 bg-gray-100 text-xs rounded"
                            >
                              {value}
                            </span>
                          ))}
                          {group.values.length > 4 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{group.values.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedGroups.find(g => g.id === group.id) && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedGroups.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Selected Groups:</h4>
                  <div className="space-y-2">
                    {selectedGroups.map(group => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span>{group.name}</span>
                        <button
                          onClick={() => handleRemoveGroup(group.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={selectedGroups.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Variants
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGroupWizard;
