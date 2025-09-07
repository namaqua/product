// Step 2: Test basic component import (no @ alias, simple button)
import ButtonSimple from './components/common/ButtonSimple'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Step 2: Testing Component Imports
          </h1>
          <p className="text-gray-600 mb-4">
            Testing Button component import (no @ alias)...
          </p>
          
          <div className="flex gap-4">
            <ButtonSimple variant="primary">Primary Button</ButtonSimple>
            <ButtonSimple variant="secondary">Secondary Button</ButtonSimple>
            <ButtonSimple variant="danger">Danger Button</ButtonSimple>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-800">
            If buttons appear above with proper styling, component imports work!
          </p>
          <p className="text-sm text-green-700 mt-1">
            Next step will test @ alias imports.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
