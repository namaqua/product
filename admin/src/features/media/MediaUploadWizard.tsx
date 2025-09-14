import React from 'react';

interface MediaUploadWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function MediaUploadWizard({ onComplete, onCancel }: MediaUploadWizardProps) {
  // Placeholder - Will be implemented in Phase 2
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel} />
        
        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Media</h2>
          
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Upload wizard coming in Phase 2</p>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Temporary - just close for now
                onCancel();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
