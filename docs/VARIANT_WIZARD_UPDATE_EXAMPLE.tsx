// Updated section for VariantWizard.tsx to use database templates
// Replace the existing template loading logic with this:

import React, { useState, useEffect } from 'react';
import variantTemplateService from '../../../services/variant-template.service';

// ... other imports ...

export default function VariantWizard({ /* props */ }) {
  // ... existing state ...
  
  // Replace the axisTemplates state and loading
  const [axisTemplates, setAxisTemplates] = useState<Record<string, { name: string, values: string[] }>>({});
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Load templates from database instead of localStorage
  useEffect(() => {
    loadTemplatesFromDatabase();
  }, []);

  const loadTemplatesFromDatabase = async () => {
    try {
      setTemplatesLoading(true);
      
      // First, try to migrate any existing localStorage templates
      await variantTemplateService.migrateFromLocalStorage();
      
      // Then load templates from database
      const response = await variantTemplateService.getAll();
      
      if (response.success && response.data.items) {
        const templates: Record<string, { name: string, values: string[] }> = {};
        
        response.data.items.forEach((template: any) => {
          // Use axisName as key for compatibility with existing code
          const key = template.axisName.toLowerCase().replace(/\s+/g, '_');
          templates[key] = {
            name: template.axisName,
            values: template.values,
          };
        });
        
        setAxisTemplates(templates);
      }
    } catch (error) {
      console.error('Failed to load variant templates:', error);
      
      // Fallback to hardcoded defaults if API fails
      setAxisTemplates({
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
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Add function to save custom template to database
  const saveCustomTemplate = async (name: string, values: string[]) => {
    try {
      const response = await variantTemplateService.create({
        name: `Custom ${name}`,
        axisName: name,
        values: values,
        description: 'User-created custom template',
        metadata: {
          category: 'custom',
          color: 'blue',
        },
        isGlobal: false,
        isActive: true,
      });
      
      if (response.success) {
        // Reload templates to include the new one
        await loadTemplatesFromDatabase();
        return true;
      }
    } catch (error) {
      console.error('Failed to save custom template:', error);
      return false;
    }
  };

  // In the render section, update the Quick Templates to show loading state:
  
  {/* Quick Templates */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Quick Templates
    </label>
    
    {templatesLoading ? (
      <div className="flex items-center justify-center py-4">
        <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="ml-2 text-sm text-gray-500">Loading templates...</span>
      </div>
    ) : (
      <>
        {/* Group templates by category */}
        {(() => {
          // Separate global/system templates from user templates
          const globalTemplates = Object.entries(axisTemplates)
            .filter(([key, template]) => {
              // You can add metadata to distinguish global vs user templates
              return ['size', 'color', 'storage', 'memory', 'material'].includes(key);
            });
          
          const userTemplates = Object.entries(axisTemplates)
            .filter(([key]) => !['size', 'color', 'storage', 'memory', 'material'].includes(key));
          
          return (
            <>
              {/* Global/System Templates */}
              {globalTemplates.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">System Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {globalTemplates.map(([key, template]) => (
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
              )}
              
              {/* User/Custom Templates */}
              {userTemplates.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">My Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {userTemplates.map(([key, template]) => (
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
              
              {/* Option to manage templates */}
              <div className="mt-3">
                <button
                  onClick={() => {/* Open template manager modal */}}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Manage Templates →
                </button>
              </div>
            </>
          );
        })()}
      </>
    )}
  </div>

  // ... rest of the component ...
}
